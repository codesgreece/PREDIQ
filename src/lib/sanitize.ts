/**
 * Lightweight HTML sanitizer for server runtimes (Vercel/Node).
 * Avoids jsdom/isomorphic-dompurify, which break under Next.js serverless bundling.
 */

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "em",
  "ul",
  "ol",
  "li",
  "h2",
  "h3",
  "h4",
  "blockquote",
  "a",
]);

function escapeText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeHref(href: string): string | null {
  const trimmed = href.trim();
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("mailto:")) {
    return trimmed;
  }
  return null;
}

export function sanitizeHtml(input: string | null | undefined): string {
  if (!input) return "";

  // Remove script/style blocks entirely first.
  let html = input
    .replace(/<\s*(script|style)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|style)[^>]*\/?\s*>/gi, "");

  // Drop event handlers and javascript: URLs.
  html = html.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  html = html.replace(/\shref\s*=\s*(['"])\s*javascript:[^'"]*\1/gi, "");

  // Tokenize tags and keep only an allow-list.
  return html.replace(/<\/?([a-zA-Z0-9]+)(\s[^>]*)?>/g, (match, rawTag: string, attrs = "") => {
    const tag = rawTag.toLowerCase();
    const isClosing = match.startsWith("</");
    if (!ALLOWED_TAGS.has(tag)) {
      return "";
    }
    if (isClosing) return `</${tag}>`;
    if (tag === "br") return "<br/>";
    if (tag === "a") {
      const hrefMatch = String(attrs).match(/\shref\s*=\s*(['"])(.*?)\1/i);
      const href = hrefMatch ? sanitizeHref(hrefMatch[2] || "") : null;
      if (!href) return "";
      return `<a href="${escapeText(href)}" rel="noopener noreferrer" target="_blank">`;
    }
    return `<${tag}>`;
  });
}

export function plainTextToHtml(input: string): string {
  const escaped = escapeText(input);
  return escaped
    .split(/\n{2,}/)
    .map((block) => `<p>${block.replace(/\n/g, "<br/>")}</p>`)
    .join("");
}
