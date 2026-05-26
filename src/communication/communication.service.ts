import GoogleOAuthService from "../integration/google-oauth.service.js";
import IntegrationService from "../integration/integration.service.js";

type GmailIntegration = {
  profileID: string;
  accessToken: string | null;
  refreshToken: string | null;
};

// Remove invisible/unwanted unicode characters, collapse excessive whitespace,
// optionally truncate, and strip common email footers.
const MAX_BODY_LENGTH = 4000;

const FOOTER_PATTERNS: RegExp[] = [
  /unsubscribe/i,
  /privacy policy/i,
  /terms of service/i,
  /terms of use/i,
  /view in browser/i,
  /manage preferences/i,
  /update preferences/i,
  /click here to unsubscribe/i,
  /download on the/i,
  /get it on google play/i,
  /app store/i,
  /follow us/i,
  /facebook\.com/i,
  /instagram\.com/i,
  /twitter\.com/i,
  /linkedin\.com/i,
  /powered by/i,
  /©|copyright/i,
  /impressum/i,
  /datenschutz/i,
  /unsubscribe here/i,
  /privacycenter/i,
  /opt out/i,
  /terms/i,
  /sponsored/i,
  /promoted/i,
  /advertis/i,
  /sent from my/i,
  /sent with/i,
  /download our app/i,
  /view web version/i,
];

const isSeparatorLine = (line: string) => /^[-=_*]{2,}$/.test(line.trim());

const stripFooter = (text: string): string => {
  const lines = text.split(/\r?\n/);
  const len = lines.length;
  const maxLook = Math.min(40, len);

  // 1) scan from bottom for explicit footer patterns or separators
  for (let offset = 0; offset < maxLook; offset++) {
    const i = len - 1 - offset;
    const line = lines[i] ?? "";
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (isSeparatorLine(trimmed)) {
      // Footer likely starts at this separator
      return lines.slice(0, i).join("\n");
    }

    if (FOOTER_PATTERNS.some((p) => p.test(trimmed))) {
      return lines.slice(0, i).join("\n");
    }
  }

  // 2) if not found, check link density in the last few lines
  const lastN = 6;
  const start = Math.max(0, len - lastN);
  const linkRegex = /(https?:\/\/|www\.|mailto:|facebook\.com|instagram\.com|twitter\.com|linkedin\.com)/i;
  let linkCount = 0;
  let firstLinkIndex = -1;
  for (let i = start; i < len; i++) {
    const li = lines[i] ?? "";
    if (linkRegex.test(li)) {
      linkCount++;
      if (firstLinkIndex === -1) firstLinkIndex = i;
    }
  }
  if (linkCount >= 2 && firstLinkIndex !== -1) {
    return lines.slice(0, firstLinkIndex).join("\n");
  }

  return text;
};

// Decode HTML entities (numeric and named) using a lightweight decoder.
const decodeHtmlEntities = (input: string): string => {
  if (!input) return input;

  // Replace a handful of common named entities first
  const named: Record<string, string> = {
    nbsp: " ",
    zwnj: "",
    zwj: "",
    lt: "<",
    gt: ">",
    amp: "&",
    quot: '"',
    apos: "'",
  };
  let s = input.replace(/&([a-zA-Z]+);/g, (m, name) => {
    return named[name] ?? m;
  });

  // Numeric entities
  s = s.replace(/&#(\d+);/g, (_m, num) => String.fromCharCode(Number(num)));
  s = s.replace(/&#x([0-9a-fA-F]+);/g, (_m, hex) => String.fromCharCode(parseInt(hex, 16)));

  return s;
};

// Convert simple HTML to plain text: extract <body> if available, remove
// scripts/styles/meta, strip tags, decode entities, and return visible text.
const htmlToText = (html: string): string => {
  if (!html) return html;

  // Extract <body> content if present
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let working = bodyMatch && bodyMatch[1] ? String(bodyMatch[1]) : String(html);

  // Remove script/style/head/meta/link and comments
  working = working.replace(/<script[\s\S]*?<\/script>/gi, "");
  working = working.replace(/<style[\s\S]*?<\/style>/gi, "");
  working = working.replace(/<head[\s\S]*?<\/head>/gi, "");
  working = working.replace(/<meta[^>]*>/gi, "");
  working = working.replace(/<link[^>]*>/gi, "");
  working = working.replace(/<!--([\s\S]*?)-->/g, "");

  // Remove img tags (tracking pixels) and their attributes
  working = working.replace(/<img[\s\S]*?>/gi, "");

  // Remove remaining tags but keep their text content
  working = working.replace(/<[^>]+>/g, " ");

  // Decode entities
  working = decodeHtmlEntities(working);

  return working;
};

// Deduplicate repeated blocks separated by blank lines
const dedupeBlocks = (text: string): string => {
  const blocks = text.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const b of blocks) {
    if (!seen.has(b)) {
      seen.add(b);
      out.push(b);
    }
  }
  return out.join("\n\n");
};

const sanitizeAndTruncate = (value: string | null | undefined): string | null => {
  if (value == null) return null;

  // 0) If HTML-ish content or contains entities, convert to text first
  let s = value;
  if (s.includes("<") || /&[a-zA-Z0-9#]+;/.test(s)) {
    s = htmlToText(s);
  }

  // Remove invisible unicode noise early
  // Remove zero-width and directional marks as well as other invisible chars
  s = s.replace(/[\u200B\u200C\u200D\u200E\u200F\uFEFF\u2060\u2066-\u2069\u00AD]/g, "");

  // 1) Strip footer after HTML->text extraction
  s = stripFooter(s);

  // 2) Remove URLs (especially tracking/utm/lid patterns)
  // Remove full URLs
  s = s.replace(/https?:\/\/\S+/gi, "");
  s = s.replace(/www\.\S+/gi, "");
  s = s.replace(/mailto:\S+/gi, "");

  // Remove common tracking query params remnants
  s = s.replace(/(\?|&)(utm_[^=\s]+|utm_source|utm_medium|utm_campaign|utm_term|utm_content|lid|fbclid)=[^&\s]+/gi, "");

  // 3) Remove repeated parentheses junk
  s = s.replace(/[()]{3,}/g, "");
  s = s.replace(/(\(\s*\)){2,}/g, " ");
  s = s.replace(/\(\s*\)/g, " ");

  // 4) Remove other control/unprintable unicode characters
  try {
    s = s.replace(/\p{C}/gu, "");
  } catch (e) {
    s = s.replace(/[\x00-\x1F\x7F-\x9F]/g, "");
  }

  // 5) Normalize whitespace and line breaks
  s = s.replace(/\r/g, "");
  s = s.replace(/\t+/g, " ");
  s = s.replace(/\n{3,}/g, "\n\n");
  s = s.replace(/\s+/g, " ").trim();

  // 6) Deduplicate repeated blocks
  s = dedupeBlocks(s);

  // 7) Keep text between greeting and first footer marker if possible
  const lines = s.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const greetIdx = lines.findIndex((l) => /^(hi|hello|dear|hey|greetings)\b[,!\s]/i.test(l));
  if (greetIdx >= 0) {
    s = lines.slice(greetIdx).join(" \n ");
  } else {
    s = lines.join(" \n ");
  }

  // 8) Truncate if still too long
  if (s.length > MAX_BODY_LENGTH) {
    return s.slice(0, MAX_BODY_LENGTH) + "…";
  }

  return s || null;
};

type GmailMessageHeader = {
  name?: string | null;
  value?: string | null;
};

type GmailMessagePart = {
  mimeType?: string | null;
  body?: {
    data?: string | null;
  } | null;
  parts?: GmailMessagePart[] | null;
};

type GmailMessagePayload = {
  mimeType?: string | null;
  headers?: GmailMessageHeader[] | null;
  body?: {
    data?: string | null;
  } | null;
  parts?: GmailMessagePart[] | null;
};

type ExtractedMessageContent = {
  body: string | null;
};

const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");

  return Buffer.from(padded, "base64").toString("utf8");
};

const extractMessageContent = (
  payload: GmailMessagePayload | null | undefined,
): ExtractedMessageContent => {
  const plainTextBodies: string[] = [];
  const htmlBodies: string[] = [];

  const visitPart = (
    part: GmailMessagePart | GmailMessagePayload | null | undefined,
  ) => {
    if (!part) {
      return;
    }

    const mimeType = part.mimeType ?? null;
    const data = part.body?.data ?? null;

    if (data) {
      const decoded = decodeBase64Url(data);

      if (mimeType === "text/plain") {
        plainTextBodies.push(decoded);
      } else if (mimeType === "text/html") {
        htmlBodies.push(decoded);
      }
    }

    part.parts?.forEach((nestedPart) => visitPart(nestedPart));
  };

  visitPart(payload);

  return {
    body: plainTextBodies[0] ?? htmlBodies[0] ?? null,
  };
};

class CommunicationService {
  constructor(
    private integrationService: IntegrationService,
    private googleOAuthService: GoogleOAuthService,
  ) {
    this.integrationService = integrationService;
    this.googleOAuthService = googleOAuthService;
  }

  fetch_emails = async (profile_id: string, maxResults = 10) => {
    if (!profile_id) {
      throw new Error("Profile ID is required");
    }

    const integration = (await this.integrationService.get_gmail_integration(
      profile_id,
    )) as GmailIntegration | null;

    if (!integration) {
      throw new Error("Gmail integration not found for the specified profile");
    }

    if (!integration.accessToken || !integration.refreshToken) {
      throw new Error("Gmail integration is missing access or refresh token");
    }

    let gmailClient = await this.googleOAuthService.create_gmail_client({
      profileID: integration.profileID,
      accessToken: integration.accessToken,
      refreshToken: integration.refreshToken,
    });

    const listResponse = await gmailClient.users.messages.list({
      userId: "me",
      maxResults,
      labelIds: ["INBOX"],
    });

    const messages = listResponse.data.messages ?? [];

    const emails = await Promise.all(
      messages.map(async (message) => {
        if (!message.id) {
          return null;
        }

        const detailResponse = await gmailClient.users.messages.get({
          userId: "me",
          id: message.id,
          format: "full",
        });

        const payload = detailResponse.data.payload as GmailMessagePayload | undefined;
        const headers = payload?.headers ?? [];
        const getHeader = (name: string) =>
          headers.find(
            (header) => header.name?.toLowerCase() === name.toLowerCase(),
          )?.value ?? null;

        const { body } = extractMessageContent(payload);

        const sanitizedBody = sanitizeAndTruncate(body);
        const sanitizedSnippet = sanitizeAndTruncate(detailResponse.data.snippet ?? null);
        const sanitizedSubject = sanitizeAndTruncate(getHeader("Subject"));
        const sanitizedFrom = sanitizeAndTruncate(getHeader("From"));

        return {
          id: detailResponse.data.id,
          threadId: detailResponse.data.threadId,
          snippet: sanitizedSnippet,
          body: sanitizedBody,
          labelIds: detailResponse.data.labelIds ?? [],
          internalDate: detailResponse.data.internalDate,
          from: sanitizedFrom,
          subject: sanitizedSubject,
          date: getHeader("Date"),
        };
      }),
    );

    return emails.filter(Boolean);
  };
}

export default CommunicationService;
