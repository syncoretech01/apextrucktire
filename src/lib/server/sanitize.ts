import "server-only";

// Control characters: C0 (0x00-0x1F), DEL + C1 (0x7F-0x9F), and the Unicode
// line/paragraph separators (U+2028 / U+2029), which some mail agents treat
// as line breaks. The separators are built with fromCharCode so no literal
// separator character ever sits inside this source file.
const LS = String.fromCharCode(0x2028);
const PS = String.fromCharCode(0x2029);
const CONTROL_ALL = new RegExp("[\\x00-\\x1f\\x7f-\\x9f" + LS + PS + "]", "g");
// Same set, but keeps \n (0x0A) so multi-line message bodies survive.
const CONTROL_KEEP_NEWLINE = new RegExp("[\\x00-\\x09\\x0b\\x0c\\x0e-\\x1f\\x7f-\\x9f" + LS + PS + "]", "g");

/** Remove CR/LF and every other control character. Use on anything that touches a mail header. */
export function stripControl(v: string): string {
  return v.replace(CONTROL_ALL, " ").replace(/\s+/g, " ").trim();
}

/** Escape for HTML bodies. */
export function escapeHtml(v: string): string {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Header-safe: control chars stripped, length capped. */
export function headerSafe(v: string, max = 120): string {
  return stripControl(v).slice(0, max);
}

/** Plain-text body: keeps newlines, strips other control characters. */
export function textSafe(v: string, max = 2000): string {
  return v.replace(/\r\n?/g, "\n").replace(CONTROL_KEEP_NEWLINE, "").slice(0, max);
}

/** HTML body for multi-line text: control chars stripped, HTML escaped, newlines -> <br>. */
export function bodySafe(v: string, max = 2000): string {
  return escapeHtml(textSafe(v, max)).replace(/\n/g, "<br>");
}
