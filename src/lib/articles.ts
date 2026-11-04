import fs from "node:fs";
import path from "node:path";

/**
 * Markdown-file article system.
 *
 * Articles live in `content/articles/<slug>.md` at the repository root,
 * with YAML-style frontmatter and a Markdown body. There is no database
 * and no CMS: publishing an article means adding a file, then building
 * and deploying (see README.md).
 *
 * No markdown dependency is used. Frontmatter parsing and Markdown
 * rendering are implemented here in a deliberately small, safe subset:
 * headings, paragraphs, bold/italic/inline code, links, lists,
 * blockquotes, code blocks and horizontal rules. All HTML in article
 * bodies is escaped before rendering, and links are restricted to
 * http(s) URLs, so article content cannot inject markup or scripts.
 *
 * Files with missing or invalid frontmatter are skipped (with a build
 * warning) rather than rendered, so one bad file can never break the
 * site or publish an article with an invented date or category.
 *
 * With zero article files the blog renders an honest empty state.
 * Never seed fake articles: every file must be a real, researched
 * article with verified facts and a real source link.
 */

export type ArticleCategory =
  | "software-news"
  | "ai-tools"
  | "technology-news"
  | "tutorials"
  | "careers"
  | "resources";

export const articleCategories: ArticleCategory[] = [
  "software-news",
  "ai-tools",
  "technology-news",
  "tutorials",
  "careers",
  "resources",
];

export const categoryLabels: Record<ArticleCategory, string> = {
  "software-news": "Software News",
  "ai-tools": "AI Tools",
  "technology-news": "Technology News",
  tutorials: "Tutorials",
  careers: "Careers",
  resources: "Resources",
};

export function isArticleCategory(value: string): value is ArticleCategory {
  return (articleCategories as string[]).includes(value);
}

export interface Article {
  slug: string;
  title: string;
  /** Short summary, also used as the SEO/Open Graph description. */
  summary: string;
  /** Publication date, YYYY-MM-DD. Taken from frontmatter, never invented. */
  date: string;
  category: ArticleCategory;
  tags: string[];
  /** Name of the official/reliable source the article is based on. */
  sourceName?: string;
  sourceUrl?: string;
  /** Only a real, licensed image URL, with credit. Omitted when none. */
  featuredImage?: string;
  featuredImageCredit?: string;
  /** Rendered HTML body (escaped, safe to inject). */
  html: string;
}

const articlesDir = path.join(process.cwd(), "content", "articles");

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Parse the `---` frontmatter block. Returns null when malformed. */
function parseFrontmatter(
  raw: string,
): { data: Record<string, string | string[]>; body: string } | null {
  if (!raw.startsWith("---\n") && !raw.startsWith("---\r\n")) return null;
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return null;
  const block = raw.slice(3, end).replace(/^\r?\n/, "").replace(/\r\n/g, "\n");
  const body = raw.slice(end + 4).replace(/^\r?\n/, "");
  const data: Record<string, string | string[]> = {};
  let currentListKey: string | null = null;
  for (const line of block.split("\n")) {
    const listItem = line.match(/^\s*-\s+(.+)$/);
    if (listItem && currentListKey) {
      const existing = data[currentListKey];
      const list = Array.isArray(existing) ? existing : [];
      list.push(listItem[1].trim().replace(/^["']|["']$/g, ""));
      data[currentListKey] = list;
      continue;
    }
    const pair = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/);
    if (!pair) {
      if (line.trim() === "") continue;
      return null;
    }
    currentListKey = null;
    const key = pair[1];
    const value = pair[2].trim();
    if (value === "") {
      // List follows on the next lines.
      data[key] = [];
      currentListKey = key;
      continue;
    }
    if (value.startsWith("[") && value.endsWith("]")) {
      data[key] = value
        .slice(1, -1)
        .split(",")
        .map((v) => v.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
      continue;
    }
    data[key] = value.replace(/^["']|["']$/g, "");
  }
  return { data, body };
}

function asString(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asStringList(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value !== "") {
    return value.split(",").map((v) => v.trim()).filter(Boolean);
  }
  return [];
}

function isValidDate(value: string): boolean {
  if (!datePattern.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** Inline Markdown (bold, italic, code, links) over already-escaped text. */
function renderInline(escaped: string): string {
  let out = escaped;
  out = out.replace(/`([^`]+)`/g, '<code class="rounded bg-surface-alt px-1 py-0.5 font-mono text-sm">$1</code>');
  // Links: only http(s) targets survive; anything else renders as plain text.
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, text: string, href: string) => {
    const decoded = href.replace(/&amp;/g, "&").replace(/&quot;/g, '"');
    if (!isHttpUrl(decoded)) return text;
    return `<a class="font-medium text-brand-700 underline hover:text-brand-600" href="${escapeHtml(decoded)}">${text}</a>`;
  });
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, "<em>$1</em>");
  return out;
}

/** Render the supported Markdown subset to safe HTML. */
function renderMarkdown(body: string): string {
  const lines = body.replace(/\r\n/g, "\n").split("\n");
  const blocks: string[] = [];
  let i = 0;
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    blocks.push(`<p class="mt-4 leading-relaxed">${renderInline(escapeHtml(paragraph.join(" ")))}</p>`);
    paragraph = [];
  };

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block.
    if (line.startsWith("```")) {
      flushParagraph();
      const codeLines: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i += 1;
      }
      i += 1; // closing fence
      blocks.push(
        `<pre class="mt-4 overflow-x-auto rounded-xl border border-line bg-surface-alt p-4"><code class="font-mono text-sm">${escapeHtml(codeLines.join("\n"))}</code></pre>`,
      );
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      const level = heading[1].length;
      const cls =
        level === 1
          ? "mt-8 text-3xl font-bold tracking-tight"
          : level === 2
            ? "mt-8 text-2xl font-bold tracking-tight"
            : "mt-6 text-xl font-bold tracking-tight";
      blocks.push(`<h${level} class="${cls}">${renderInline(escapeHtml(heading[2].trim()))}</h${level}>`);
      i += 1;
      continue;
    }

    if (/^\s*(-{3,}|_{3,})\s*$/.test(line)) {
      flushParagraph();
      blocks.push('<hr class="my-8 border-line" />');
      i += 1;
      continue;
    }

    const quote = line.match(/^>\s?(.*)$/);
    if (quote) {
      flushParagraph();
      const quoteLines: string[] = [];
      while (i < lines.length) {
        const q = lines[i].match(/^>\s?(.*)$/);
        if (!q) break;
        quoteLines.push(q[1]);
        i += 1;
      }
      blocks.push(
        `<blockquote class="mt-4 border-l-4 border-brand-500 pl-4 leading-relaxed text-muted">${renderInline(escapeHtml(quoteLines.join(" ")))}</blockquote>`,
      );
      continue;
    }

    const listItem = line.match(/^(\s*)[-*]\s+(.+)$/);
    if (listItem) {
      flushParagraph();
      const items: string[] = [];
      while (i < lines.length) {
        const item = lines[i].match(/^(\s*)[-*]\s+(.+)$/);
        if (!item) break;
        items.push(item[2]);
        i += 1;
      }
      blocks.push(
        `<ul class="mt-4 list-disc space-y-2 pl-6 leading-relaxed">${items
          .map((item) => `<li>${renderInline(escapeHtml(item.trim()))}</li>`)
          .join("")}</ul>`,
      );
      continue;
    }

    const orderedItem = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (orderedItem) {
      flushParagraph();
      const items: string[] = [];
      while (i < lines.length) {
        const item = lines[i].match(/^\s*\d+[.)]\s+(.+)$/);
        if (!item) break;
        items.push(item[1]);
        i += 1;
      }
      blocks.push(
        `<ol class="mt-4 list-decimal space-y-2 pl-6 leading-relaxed">${items
          .map((item) => `<li>${renderInline(escapeHtml(item.trim()))}</li>`)
          .join("")}</ol>`,
      );
      continue;
    }

    if (line.trim() === "") {
      flushParagraph();
      i += 1;
      continue;
    }

    paragraph.push(line.trim());
    i += 1;
  }
  flushParagraph();
  return blocks.join("\n");
}

function parseArticleFile(slug: string, raw: string): Article | null {
  const parsed = parseFrontmatter(raw);
  if (!parsed) {
    console.warn(`[articles] Skipping ${slug}.md: missing or malformed frontmatter.`);
    return null;
  }
  const { data, body } = parsed;
  const title = asString(data.title);
  const summary = asString(data.summary);
  const date = asString(data.date);
  const category = asString(data.category);
  if (!title || !summary || !date || !category) {
    console.warn(`[articles] Skipping ${slug}.md: frontmatter must include title, summary, date and category.`);
    return null;
  }
  if (!isValidDate(date)) {
    console.warn(`[articles] Skipping ${slug}.md: date must be a real date in YYYY-MM-DD format.`);
    return null;
  }
  if (!isArticleCategory(category)) {
    console.warn(`[articles] Skipping ${slug}.md: unknown category "${category}".`);
    return null;
  }
  const sourceUrl = asString(data.sourceUrl);
  if (sourceUrl !== undefined && !isHttpUrl(sourceUrl)) {
    console.warn(`[articles] Skipping ${slug}.md: sourceUrl must be an http(s) URL.`);
    return null;
  }
  const featuredImage = asString(data.featuredImage);
  if (featuredImage !== undefined && !isHttpUrl(featuredImage)) {
    console.warn(`[articles] Skipping ${slug}.md: featuredImage must be an http(s) URL.`);
    return null;
  }
  if (body.trim() === "") {
    console.warn(`[articles] Skipping ${slug}.md: empty article body.`);
    return null;
  }
  return {
    slug,
    title,
    summary,
    date,
    category,
    tags: asStringList(data.tags),
    sourceName: asString(data.sourceName),
    sourceUrl,
    featuredImage,
    featuredImageCredit: asString(data.featuredImageCredit),
    html: renderMarkdown(body),
  };
}

function readArticleFiles(): Article[] {
  if (!fs.existsSync(articlesDir)) return [];
  const articles: Article[] = [];
  for (const entry of fs.readdirSync(articlesDir)) {
    if (!entry.endsWith(".md")) continue;
    const slug = entry.slice(0, -".md".length);
    if (!slugPattern.test(slug)) {
      console.warn(`[articles] Skipping ${entry}: filename must be a lowercase hyphenated slug.`);
      continue;
    }
    const raw = fs.readFileSync(path.join(articlesDir, entry), "utf8");
    const article = parseArticleFile(slug, raw);
    if (article) articles.push(article);
  }
  articles.sort((a, b) => (a.date === b.date ? a.slug.localeCompare(b.slug) : b.date.localeCompare(a.date)));
  return articles;
}

/** All valid articles, newest first. Empty array when none exist. */
export function getAllArticles(): Article[] {
  return readArticleFiles();
}

export function getArticleBySlug(slug: string): Article | undefined {
  return readArticleFiles().find((a) => a.slug === slug);
}

export function getArticleSlugs(): string[] {
  return readArticleFiles().map((a) => a.slug);
}

/** Categories that have at least one article, in the fixed display order. */
export function getAllCategories(): ArticleCategory[] {
  const present = new Set(getAllArticles().map((a) => a.category));
  return articleCategories.filter((c) => present.has(c));
}

/** All tags in use, alphabetically sorted. */
export function getAllTags(): string[] {
  const tags = new Set<string>();
  for (const article of getAllArticles()) {
    for (const tag of article.tags) tags.add(tag);
  }
  return [...tags].sort((a, b) => a.localeCompare(b));
}

export function getArticlesByCategory(category: ArticleCategory): Article[] {
  return getAllArticles().filter((a) => a.category === category);
}

/** Canonical URL of an article, using the configured site URL. */
export function siteArticleUrl(slug: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return `${base}/blog/${slug}`;
}

export function formatArticleDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
