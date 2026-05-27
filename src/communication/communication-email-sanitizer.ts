import { convert as htmlToTextConvert } from "html-to-text";

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

type EmailCategory =
  | "important"
  | "social"
  | "promotion"
  | "newsletter"
  | "spam";

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
  category: EmailCategory;
};

const MAX_BODY_LENGTH = 4000;
const MAX_SNIPPET_LENGTH = 180;

const INVISIBLE_CHARS_REGEX =
  /[\u034F\u061C\u180E\u200B\u200C\u200D\u200E\u200F\u2060\u2061\u2062\u2063\u2064\u2066-\u2069\u3164\uFEFF\u00AD]/g;

const FOOTER_MARKERS: RegExp[] = [
  /this email was intended for/i,
  /this email was sent to/i,
  /manage (your )?email settings/i,
  /unsubscribe/i,
  /privacy policy/i,
  /terms of service|terms of use/i,
  /all rights reserved/i,
  /linkedin corporation/i,
  /daily dev ltd/i,
  /view in browser|view web version/i,
  /contact us/i,
];

const LINE_NOISE_PATTERNS: RegExp[] = [
  /sign up\s*\[?\d*\]?\s*\|\s*advertise\s*\[?\d*\]?\s*\|\s*view online/i,
  /tldr together with/i,
  /\(sponsor\)/i,
  /headlines\s*&\s*launches/i,
  /deep dives\s*&\s*analysis/i,
  /miscellaneous/i,
  /follow us/i,
  /manage preferences|update preferences/i,
  /email preferences/i,
  /download our app|get it on google play|app store/i,
  /this email was intended for|this email was sent to/i,
  /settings notifications|account details/i,
  /privacy policy|terms of service|unsubscribe/i,
  /\b(?:mid\s*token|mid\s*sig|otp\s*token|trk\s*email|trk|lipi|eid)\b/i,
];

const MARKETING_NOISE_PATTERNS: RegExp[] = [
  /get\s+\d+%\s+off/i,
  /limited time/i,
  /offer expires/i,
  /buy now|shop now|claim your offer|try for free/i,
  /advertis(e|ement)|promoted|sponsored/i,
];

const NEWSLETTER_INLINE_PATTERNS: RegExp[] = [
  /Sign\s*Up\s*\[?\d*\]?\s*\|\s*Advertise\s*\[?\d*\]?\s*\|\s*View\s*Online\s*\[?\d*\]?/gi,
  /TLDR\s+TOGETHER\s+WITH\s*\[[^\]]+\]\s*\[?\d*\]?/gi,
  /\(SPONSOR\)\s*\[?\d*\]?/gi,
  /Explore\s*\|\s*Discussions\s*\|\s*Tags\s*\|\s*Sources\s*\|\s*Leaderboard/gi,
];

const BOILERPLATE_MARKERS: RegExp[] = [
  /unsubscribe/i,
  /view online/i,
  /view in browser/i,
  /manage preferences/i,
  /manage settings/i,
  /book a demo/i,
  /get started/i,
  /upgrade/i,
  /download the app/i,
  /offer ends/i,
  /safe list/i,
  /advertise/i,
  /copyright/i,
  /all rights reserved/i,
  /terms(?:\s+of\s+(?:service|use))?/i,
  /privacy policy/i,
];

const CTA_SECTION_PATTERNS: RegExp[] = [
  /book a demo/i,
  /get started/i,
  /start free/i,
  /try now/i,
  /upgrade now/i,
  /download the app/i,
  /view online/i,
  /manage preferences/i,
  /unsubscribe/i,
  /advertise/i,
  /safe list/i,
];

const CSS_ARTIFACT_PATTERNS: RegExp[] = [
  /\*\s*\{[^}]{0,300}\}/gi,
  /[a-zA-Z0-9_.#\-\[\]="'():\s]+\{[^}]{0,500}\}/g,
  /a\[x-apple-data-detectors\][^{]*\{[^}]{0,500}\}/gi,
  /style\s*=\s*"[^"]*"/gi,
  /style\s*=\s*'[^']*'/gi,
  /(?:^|\n)\s*[a-z-]+\s*:\s*[^;\n]{0,120};(?:\s*[a-z-]+\s*:\s*[^;\n]{0,120};?)*\s*(?:$|\n)/gi,
];

const decodeBase64Url = (value: string): string => {
  try {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return Buffer.from(padded, "base64").toString("utf8");
  } catch {
    return "";
  }
};

const htmlToVisibleText = (html: string): string => {
  return htmlToTextConvert(html, {
    wordwrap: false,
    preserveNewlines: true,
    selectors: [
      { selector: "img", format: "skip" },
      { selector: "style", format: "skip" },
      { selector: "script", format: "skip" },
      { selector: "head", format: "skip" },
      { selector: "meta", format: "skip" },
      { selector: "link", format: "skip" },
      { selector: "a", options: { ignoreHref: true } },
    ],
  });
};

const stripHtmlArtifacts = (text: string): string => {
  let out = text;

  out = out.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ");
  out = out.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ");
  out = out.replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, " ");
  out = out.replace(/<!--([\s\S]*?)-->/g, " ");

  for (const pattern of CSS_ARTIFACT_PATTERNS) {
    out = out.replace(pattern, " ");
  }

  out = out.replace(/<[^>]+>/g, " ");

  return out;
};

const scoreCandidate = (input: string): number => {
  const s = input.trim();
  if (!s) return Number.NEGATIVE_INFINITY;

  const words = s.split(/\s+/).filter(Boolean).length;
  const htmlPenalty = (s.match(/<[^>]+>/g)?.length ?? 0) * 10;
  const cssPenalty = (s.match(/[a-z-]+\s*:\s*[^;}{]+;/gi)?.length ?? 0) * 3;
  const encodedPenalty = (s.match(/(?:%[0-9A-Fa-f]{2}){3,}/g)?.length ?? 0) * 8;
  const junkTokenPenalty = (s.match(/\b[A-Za-z0-9]{1,3}\b/g)?.length ?? 0) / 10;

  return words - htmlPenalty - cssPenalty - encodedPenalty - junkTokenPenalty;
};

const extractBodyText = (payload: GmailMessagePayload | null | undefined) => {
  const plain: string[] = [];
  const html: string[] = [];
  const fallback: string[] = [];

  const visit = (
    part: GmailMessagePayload | GmailMessagePart | null | undefined,
  ) => {
    if (!part) return;

    const data = part.body?.data ?? null;
    const mimeType = (part.mimeType ?? "").toLowerCase();

    if (data) {
      const decoded = decodeBase64Url(data);
      if (decoded) {
        if (mimeType.includes("text/plain")) {
          plain.push(decoded);
        } else if (mimeType.includes("text/html")) {
          html.push(decoded);
        } else {
          fallback.push(decoded);
        }
      }
    }

    part.parts?.forEach((p) => visit(p));
  };

  visit(payload);

  if (payload?.body?.data) {
    const rootDecoded = decodeBase64Url(payload.body.data);
    if (rootDecoded) fallback.push(rootDecoded);
  }

  const pick = (items: string[]) => {
    const cleaned = items.map((s) => s.trim()).filter(Boolean);
    if (cleaned.length === 0) return null;
    return (
      cleaned.sort((a, b) => scoreCandidate(b) - scoreCandidate(a))[0] ?? null
    );
  };

  return pick(plain) ?? pick(html) ?? pick(fallback);
};

const removeInlineNoise = (text: string): string => {
  let out = text;

  for (const pattern of NEWSLETTER_INLINE_PATTERNS) {
    out = out.replace(pattern, " ");
  }

  out = out.replace(
    /\b(?:id|mid\s*token|mid\s*sig|otp\s*token|trk\s*email|trk|lipi|eid)\s*=\s*[^\s\n]{2,}/gi,
    " ",
  );
  out = out.replace(/(?:%[0-9A-Fa-f]{2}){3,}/g, " ");
  out = out.replace(/\b[a-z]\d{2,6}\/\?/gi, " ");
  out = out.replace(/(?:\b[A-Za-z0-9]{1,3}\b[\s,._-]*){14,}/g, " ");

  return out;
};

const stripFooter = (text: string): string => {
  let earliest = -1;
  for (const marker of FOOTER_MARKERS) {
    const match = text.match(marker);
    if (match?.index != null) {
      if (earliest === -1 || match.index < earliest) {
        earliest = match.index;
      }
    }
  }

  if (earliest >= 0) {
    return text.slice(0, earliest);
  }

  const lines = text.split(/\n+/);
  for (let i = 0; i < lines.length; i++) {
    if (FOOTER_MARKERS.some((m) => m.test(lines[i] ?? ""))) {
      return lines.slice(0, i).join("\n");
    }
  }

  return text;
};

const normalizeWhitespace = (text: string): string => {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[\u2007\u202F\u00A0]/g, " ")
    .replace(/[ \t\f\v]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
};

const flattenContent = (text: string): string => text.replace(/\n/g, " ");

const isNoiseLine = (line: string): boolean => {
  if (!line) return true;

  if (LINE_NOISE_PATTERNS.some((p) => p.test(line))) return true;

  if (MARKETING_NOISE_PATTERNS.some((p) => p.test(line)) && line.length < 120) {
    return true;
  }

  if (/^(?:[-=_*\u2013\u2014]\s*){6,}$/.test(line)) return true;

  const pipeCount = (line.match(/\|/g) ?? []).length;
  if (pipeCount >= 3) return true;

  const urlish = line.match(/(https?:\/\/|www\.|mailto:|%[0-9A-Fa-f]{2})/g);
  if ((urlish?.length ?? 0) >= 2) return true;

  return false;
};

const normalizeSender = (value: string | null | undefined): string | null => {
  if (!value) return null;

  let sender = value
    .replace(INVISIBLE_CHARS_REGEX, "")
    .replace(/\u00A0/g, " ")
    .trim();

  const quoted = sender.match(/^\s*"?([^"<]+?)"?\s*<[^>]+>\s*$/);
  if (quoted?.[1]) {
    sender = quoted[1].trim();
  } else {
    const emailOnly = sender.match(
      /<?([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})>?/i,
    );
    const emailVal = emailOnly?.[1];
    if (emailVal) {
      sender = emailVal
        .replace(/@.*$/, "")
        .replace(/[._-]+/g, " ")
        .trim();
    }
  }

  return sender.replace(/\s+/g, " ").trim() || null;
};

const sanitizeText = (value: string | null | undefined): string | null => {
  if (value == null) return null;

  let text = value;
  const looksLikeHtml =
    /<\/?[a-z][\s\S]*>/i.test(text) || /&[a-zA-Z0-9#]+;/.test(text);

  if (looksLikeHtml) {
    text = htmlToVisibleText(text);
  }

  text = stripHtmlArtifacts(text)
    .replace(INVISIBLE_CHARS_REGEX, "")
    .replace(/\[\d+\]/g, " ")
    .replace(/\(\s*\)/g, " ");

  text = removeInlineNoise(text);
  text = text
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/www\.\S+/gi, " ")
    .replace(/mailto:\S+/gi, " ")
    .replace(
      /(\?|&)(utm_[^=\s]+|utm_source|utm_medium|utm_campaign|utm_term|utm_content|lid|fbclid|gclid)=[^&\s]+/gi,
      " ",
    );

  text = stripFooter(text);
  text = normalizeWhitespace(text);

  const lines = text
    .split("\n")
    .map((line) => normalizeWhitespace(line))
    .filter((line) => !isNoiseLine(line))
    .filter(
      (line) =>
        !BOILERPLATE_MARKERS.some((pattern) => pattern.test(line)) &&
        !CTA_SECTION_PATTERNS.some((pattern) => pattern.test(line)),
    );

  const deduped: string[] = [];
  const seen = new Set<string>();
  for (const line of lines) {
    if (!line) continue;
    if (seen.has(line)) continue;
    seen.add(line);
    deduped.push(line);
  }

  let out = deduped.join("\n").trim();

  if (!out) {
    out = normalizeWhitespace(removeInlineNoise(stripHtmlArtifacts(value)));
  }

  out = out
    .replace(/(?:\n{2,}|\n\s*\n)+/g, "\n")
    .replace(
      /(?:\b(?:unsubscribe|copyright|book a demo|get started|upgrade|download the app|offer ends|safe list)\b[\s\S]*)$/i,
      "",
    )
    .trim();

  if (out.length > MAX_BODY_LENGTH) {
    return out.slice(0, MAX_BODY_LENGTH) + "…";
  }

  return out || null;
};

const buildSnippet = (body: string | null): string | null => {
  const source = flattenContent(body ?? "")
    .replace(/\s+/g, " ")
    .trim();
  if (!source) return null;

  if (source.length <= MAX_SNIPPET_LENGTH) {
    return source;
  }

  return source.slice(0, MAX_SNIPPET_LENGTH).trimEnd() + "…";
};

const classifyEmail = (
  from: string | null,
  subject: string | null,
  labelIds: string[],
): EmailCategory => {
  const haystack = `${from ?? ""} ${subject ?? ""}`.toLowerCase();

  if (labelIds.some((l) => l.includes("CATEGORY_SOCIAL"))) return "social";
  if (labelIds.some((l) => l.includes("CATEGORY_PROMOTIONS")))
    return "promotion";
  if (labelIds.some((l) => l.includes("CATEGORY_UPDATES"))) return "newsletter";

  if (/linkedin|instagram|facebook|twitter/.test(haystack)) return "social";
  if (/sale|offer|discount|coupon|flash sale|promo/.test(haystack))
    return "promotion";
  if (/newsletter|digest|tldr|update/.test(haystack)) return "newsletter";
  if (/spam|lottery|winner|claim now/.test(haystack)) return "spam";

  return "important";
};

const buildSanitizedEmail = (message: GmailMessageRecord): SanitizedEmail => {
  const headers = message.payload?.headers ?? [];
  const getHeader = (name: string) =>
    headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ??
    null;

  const rawBody = extractBodyText(message.payload);
  const body = sanitizeText(rawBody ?? message.snippet ?? null);

  const normalizedFrom = normalizeSender(getHeader("From"));
  const normalizedSubject = sanitizeText(getHeader("Subject"));
  const cleanLabels = (message.labelIds ?? []).filter(
    (id): id is string => typeof id === "string" && id.length > 0,
  );

  return {
    id: message.id ?? null,
    threadId: message.threadId ?? null,
    snippet: buildSnippet(body),
    body,
    labelIds: cleanLabels,
    internalDate: message.internalDate ?? null,
    from: normalizedFrom,
    subject: normalizedSubject,
    date: getHeader("Date"),
    category: classifyEmail(normalizedFrom, normalizedSubject, cleanLabels),
  };
};

export { buildSanitizedEmail };
