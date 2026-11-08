const REPLACEMENT_CHAR = "\uFFFD";
const ALLOWED_WHITESPACE = new Set(["\n", "\r", "\t"]);
const ZERO_WIDTH_CHARS = /[\u200B-\u200D\uFEFF]/g;
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g;

export function countSuspiciousChars(value: string): number {
  let suspicious = 0;
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0;
    if (
      char === REPLACEMENT_CHAR ||
      (code < 0x20 && !ALLOWED_WHITESPACE.has(char)) ||
      (code >= 0x7f && code <= 0x9f)
    ) {
      suspicious++;
    }
  }
  return suspicious;
}

/**
 * Detects text that was produced by decoding binary data (such as a gzip
 * stream) as UTF-8. These values contain replacement/control characters.
 */
export function isCorruptedText(value: unknown): boolean {
  if (typeof value !== "string") return true;
  if (!value.trim()) return true;
  if (value.charCodeAt(0) === 0x1f) return true;

  const suspicious = countSuspiciousChars(value);
  if (suspicious === 0) return false;

  return suspicious / value.length >= 0.005;
}

/** Removes characters that should never be shown in the interface. */
export function cleanText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .replace(CONTROL_CHARS, "")
    .split(REPLACEMENT_CHAR)
    .join("")
    .replace(ZERO_WIDTH_CHARS, "")
    .trim();
}

export function isRenderableQuote(
  quote: { quote_text?: string | null; author?: string | null } | null | undefined
): boolean {
  if (!quote) return false;
  return !isCorruptedText(quote.quote_text) && !isCorruptedText(quote.author);
}
