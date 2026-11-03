import "server-only";
import sanitizeHtml from "sanitize-html";

/**
 * Strict allow-list for blog content. No scripts, iframes, styles, event handlers,
 * javascript:/data: links or protocol-relative (//host) URLs can survive.
 */
export function cleanPostHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ["p", "br", "strong", "b", "em", "i", "u", "s", "h2", "h3", "h4", "ul", "ol", "li",
      "blockquote", "pre", "code", "a", "img"],
    // rel/target/loading are only ever set by transformTags below
    allowedAttributes: { a: ["href", "rel", "target"], img: ["src", "alt", "loading"] },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["https", "http"] },
    allowedSchemesAppliedToAttributes: ["href", "src"],
    allowProtocolRelative: false,
    disallowedTagsMode: "discard",
    transformTags: {
      a: (tagName, attribs) => ({ tagName, attribs: { ...attribs, rel: "noopener noreferrer", target: "_blank" } }),
      img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: "lazy" } }),
    },
  }).trim();
}

/** Plain text: trims, removes control characters, caps the length. */
export function text(v: FormDataEntryValue | null | undefined, max = 500): string {
  return String(v ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, max);
}
