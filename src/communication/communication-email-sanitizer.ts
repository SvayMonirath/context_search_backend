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

type GmailMessageRecord = {
  id: string | null | undefined;
  threadId: string | null | undefined;
  snippet: string | null | undefined;
  labelIds: (string | null)[] | null | undefined;
  internalDate: string | null | undefined;
  payload: GmailMessagePayload | null | undefined;
};

type SanitizedEmail = {
  id: string | null | undefined;
  threadId: string | null | undefined;
  snippet: string | null;
  body: string | null;
  labelIds: string[];
  internalDate: string | null | undefined;
  from: string | null;
  subject: string | null;
  date: string | null;
};

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

  for (let offset = 0; offset < maxLook; offset++) {
    const i = len - 1 - offset;
    const line = lines[i] ?? "";
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (isSeparatorLine(trimmed)) {
      return lines.slice(0, i).join("\n");
    }

    if (FOOTER_PATTERNS.some((pattern) => pattern.test(trimmed))) {
      return lines.slice(0, i).join("\n");
    }
  }

  const lastN = 6;
  const start = Math.max(0, len - lastN);
  const linkRegex =
    /(https?:\/\/|www\.|mailto:|facebook\.com|instagram\.com|twitter\.com|linkedin\.com)/i;
  let linkCount = 0;
  let firstLinkIndex = -1;

  for (let i = start; i < len; i++) {
    const line = lines[i] ?? "";
    if (linkRegex.test(line)) {
      linkCount++;
      if (firstLinkIndex === -1) firstLinkIndex = i;
    }
  }

  if (linkCount >= 2 && firstLinkIndex !== -1) {
    return lines.slice(0, firstLinkIndex).join("\n");
  }

  return text;
};

const decodeHtmlEntities = (input: string): string => {
  if (!input) return input;

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

  let s = input.replace(/&([a-zA-Z]+);/g, (match, name) => {
    return named[name] ?? match;
  });

  s = s.replace(/&#(\d+);/g, (_match, num) => String.fromCharCode(Number(num)));
  s = s.replace(/&#x([0-9a-fA-F]+);/g, (_match, hex) =>
    String.fromCharCode(parseInt(hex, 16)),
  );

  return s;
};

const htmlToText = (html: string): string => {
  if (!html) return html;

  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let working = bodyMatch && bodyMatch[1] ? String(bodyMatch[1]) : String(html);

  working = working.replace(/<script[\s\S]*?<\/script>/gi, "");
  working = working.replace(/<style[\s\S]*?<\/style>/gi, "");
  working = working.replace(/<head[\s\S]*?<\/head>/gi, "");
  working = working.replace(/<meta[^>]*>/gi, "");
  working = working.replace(/<link[^>]*>/gi, "");
  working = working.replace(/<!--([\s\S]*?)-->/g, "");
  working = working.replace(/<img[\s\S]*?>/gi, "");
  working = working.replace(/<[^>]+>/g, " ");

  return decodeHtmlEntities(working);
};

const dedupeBlocks = (text: string): string => {
  const blocks = text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  const seen = new Set<string>();
  const out: string[] = [];

  for (const block of blocks) {
    if (!seen.has(block)) {
      seen.add(block);
      out.push(block);
    }
  }

  return out.join("\n\n");
};

const extractBodyText = (payload: GmailMessagePayload | null | undefined) => {
  const plainTextBodies: string[] = [];
  const htmlBodies: string[] = [];

  const decodeBase64Url = (value: string) => {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return Buffer.from(padded, "base64").toString("utf8");
  };

  const visitPart = (
    part: GmailMessagePart | GmailMessagePayload | null | undefined,
  ) => {
    if (!part) return;

    const data = part.body?.data ?? null;
    const mimeType = part.mimeType ?? null;

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

  return plainTextBodies[0] ?? htmlBodies[0] ?? null;
};

const sanitizeText = (value: string | null | undefined): string | null => {
  if (value == null) return null;

  let text = value;

  if (text.includes("<") || /&[a-zA-Z0-9#]+;/.test(text)) {
    text = htmlToText(text);
  }

  text = text.replace(
    /[\u200B\u200C\u200D\u200E\u200F\uFEFF\u2060\u2066-\u2069\u00AD]/g,
    "",
  );
  text = stripFooter(text);
  text = text.replace(/https?:\/\/\S+/gi, "");
  text = text.replace(/www\.\S+/gi, "");
  text = text.replace(/mailto:\S+/gi, "");
  text = text.replace(
    /(\?|&)(utm_[^=\s]+|utm_source|utm_medium|utm_campaign|utm_term|utm_content|lid|fbclid)=[^&\s]+/gi,
    "",
  );
  text = text.replace(/[()]{3,}/g, "");
  text = text.replace(/(\(\s*\)){2,}/g, " ");
  text = text.replace(/\(\s*\)/g, " ");

  try {
    text = text.replace(/\p{C}/gu, "");
  } catch {
    text = text.replace(/[\x00-\x1F\x7F-\x9F]/g, "");
  }

  text = text.replace(/\r/g, "");
  text = text.replace(/\t+/g, " ");
  text = text.replace(/\n{3,}/g, "\n\n");
  text = text.replace(/\s+/g, " ").trim();
  text = dedupeBlocks(text);

  const lines = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const greetIdx = lines.findIndex((line) =>
    /^(hi|hello|dear|hey|greetings)\b[,!\s]/i.test(line),
  );

  if (greetIdx >= 0) {
    text = lines.slice(greetIdx).join(" \n ");
  } else {
    text = lines.join(" \n ");
  }

  if (text.length > MAX_BODY_LENGTH) {
    return text.slice(0, MAX_BODY_LENGTH) + "…";
  }

  return text || null;
};

const buildSanitizedEmail = (message: GmailMessageRecord): SanitizedEmail => {
  const headers = message.payload?.headers ?? [];
  const getHeader = (name: string) =>
    headers.find((header) => header.name?.toLowerCase() === name.toLowerCase())
      ?.value ?? null;

  const body = extractBodyText(message.payload);

  return {
    id: message.id ?? null,
    threadId: message.threadId ?? null,
    snippet: sanitizeText(message.snippet ?? null),
    body: sanitizeText(body),
    labelIds: (message.labelIds ?? []).filter(
      (labelId): labelId is string =>
        typeof labelId === "string" && labelId.length > 0,
    ),
    internalDate: message.internalDate ?? null,
    from: sanitizeText(getHeader("From")),
    subject: sanitizeText(getHeader("Subject")),
    date: getHeader("Date"),
  };
};

export { buildSanitizedEmail };
