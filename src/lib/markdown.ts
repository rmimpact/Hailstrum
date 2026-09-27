/**
 * A small Markdown subset renderer.
 *
 * Everything is HTML-escaped first and only the tags produced here are ever
 * emitted, so post bodies can't inject markup. Written by hand rather than
 * pulled from npm to keep the news pages' JavaScript small.
 *
 * Supports: # headings, **bold**, *italic*, `code`, ```fenced code```,
 * [links](url), ![images](url), - and 1. lists, > quotes, --- rules.
 */

const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (ch) => ESCAPES[ch]);
}

/** Blocks anything that isn't a plain http(s), mailto or same-site URL. */
function safeUrl(raw: string): string {
  const url = raw.trim();
  if (/^(https?:\/\/|mailto:|\/|#)/i.test(url)) return escapeHtml(url);
  return "#";
}

/** Inline formatting, applied to already-escaped text. */
function inline(text: string): string {
  let out = text;

  // Images before links — ![alt](src) would otherwise match the link rule.
  out = out.replace(
    /!\[([^\]]*)\]\(([^)\s]+)\)/g,
    (_m, alt: string, src: string) =>
      `<img src="${safeUrl(src)}" alt="${alt}" loading="lazy" decoding="async" />`
  );

  out = out.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    (_m, label: string, href: string) => {
      const url = safeUrl(href);
      const external = /^https?:\/\//i.test(url);
      const attrs = external
        ? ' target="_blank" rel="noopener noreferrer"'
        : "";
      return `<a href="${url}"${attrs}>${label}</a>`;
    }
  );

  out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");

  return out;
}

export function renderMarkdown(source: string): string {
  const lines = escapeHtml(source.replace(/\r\n/g, "\n")).split("\n");
  const html: string[] = [];

  let paragraph: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let inQuote = false;
  let fence: string[] | null = null;

  const flushParagraph = () => {
    if (paragraph.length) {
      html.push(`<p>${inline(paragraph.join(" "))}</p>`);
      paragraph = [];
    }
  };

  const closeList = () => {
    if (listType) {
      html.push(`</${listType}>`);
      listType = null;
    }
  };

  const closeQuote = () => {
    if (inQuote) {
      html.push("</blockquote>");
      inQuote = false;
    }
  };

  const closeBlocks = () => {
    flushParagraph();
    closeList();
    closeQuote();
  };

  for (const line of lines) {
    // Fenced code blocks swallow everything until the closing fence.
    if (/^```/.test(line.trim())) {
      if (fence) {
        html.push(`<pre><code>${fence.join("\n")}</code></pre>`);
        fence = null;
      } else {
        closeBlocks();
        fence = [];
      }
      continue;
    }
    if (fence) {
      fence.push(line);
      continue;
    }

    const trimmed = line.trim();

    if (!trimmed) {
      closeBlocks();
      continue;
    }

    if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
      closeBlocks();
      html.push("<hr />");
      continue;
    }

    const heading = /^(#{1,4})\s+(.*)$/.exec(trimmed);
    if (heading) {
      closeBlocks();
      const level = heading[1].length + 1; // # renders as <h2>; <h1> is the title
      const tag = `h${Math.min(level, 5)}`;
      html.push(`<${tag}>${inline(heading[2])}</${tag}>`);
      continue;
    }

    const quote = /^&gt;\s?(.*)$/.exec(trimmed);
    if (quote) {
      flushParagraph();
      closeList();
      if (!inQuote) {
        html.push("<blockquote>");
        inQuote = true;
      }
      html.push(`<p>${inline(quote[1])}</p>`);
      continue;
    }
    closeQuote();

    const bullet = /^[-*]\s+(.*)$/.exec(trimmed);
    const numbered = /^\d+[.)]\s+(.*)$/.exec(trimmed);

    if (bullet || numbered) {
      flushParagraph();
      const wanted = bullet ? "ul" : "ol";
      if (listType !== wanted) {
        closeList();
        html.push(`<${wanted}>`);
        listType = wanted;
      }
      html.push(`<li>${inline((bullet ?? numbered)![1])}</li>`);
      continue;
    }
    closeList();

    paragraph.push(trimmed);
  }

  if (fence) html.push(`<pre><code>${fence.join("\n")}</code></pre>`);
  closeBlocks();

  return html.join("\n");
}

/** First ~N characters of the body as plain text, for cards and meta tags. */
export function plainTextExcerpt(source: string, max = 180): string {
  const text = source
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#>*`_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= max) return text;
  return text.slice(0, text.lastIndexOf(" ", max) || max).trimEnd() + "…";
}
