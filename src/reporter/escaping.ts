const HTML_ESCAPE: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};
const HTML_RE = /[&<>"']/g;

export function escapeHtml(str: string): string {
  return str.replace(HTML_RE, (ch) => HTML_ESCAPE[ch] ?? ch);
}

const XML_ESCAPE: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};
const XML_RE = /[&<>"']/g;

export function escapeXml(str: string): string {
  return str.replace(XML_RE, (ch) => XML_ESCAPE[ch] ?? ch);
}
