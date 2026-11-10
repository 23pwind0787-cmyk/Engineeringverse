import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import {
  categoryLabels,
  formatArticleDate,
  getAllArticles,
  getAllCategories,
  getAllTags,
  isArticleCategory,
  type Article,
  type ArticleCategory,
} from "@/lib/articles";

export const metadata: Metadata = {
  title: "Engineering Blog",
  description:
    "Articles and guides on engineering software, AI tools, technology news, tutorials and careers — researched from official sources.",
  alternates: { canonical: "https://engineeringverse.me/blog" },
};

// Reads searchParams (category/tag filters), so this route must not be
// prerendered under cacheComponents.
export const instant = false;

function ArticleCard({ article }: { article: Article }) {
  return (
    <li>
      <Link
        href={`/blog/${article.slug}`}
        className="flex h-full flex-col gap-3 rounded-xl border border-line bg-surface p-5 transition hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-md"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">
          {categoryLabels[article.category]}
        </p>
        <h2 className="text-lg font-semibold">{article.title}</h2>
        <p className="flex-1 text-sm text-muted">{article.summary}</p>
        <p className="text-sm text-muted">
          {formatArticleDate(article.date)}
          {article.sourceName ? ` · Source: ${article.sourceName}` : ""}
        </p>
        {article.tags.length > 0 && (
          <p className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-surface-alt px-2.5 py-0.5 text-xs text-muted">
                {tag}
              </span>
            ))}
          </p>
        )}
      </Link>
    </li>
  );
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; tag?: string }>;
}) {
  const params = await searchParams;
  const selectedCategory: ArticleCategory | undefined =
    params.category && isArticleCategory(params.category) ? params.category : undefined;
  const selectedTag = params.tag && params.tag.trim() !== "" ? params.tag.trim() : undefined;

  const all = getAllArticles();
  const categories = getAllCategories();
  const tags = getAllTags();
  const shown = all.filter(
    (a) =>
      (!selectedCategory || a.category === selectedCategory) &&
      (!selectedTag || a.tags.includes(selectedTag)),
  );

  const filterHref = (category?: ArticleCategory, tag?: string) => {
    const query = new URLSearchParams();
    if (category) query.set("category", category);
    if (tag) query.set("tag", tag);
    const qs = query.toString();
    return qs ? `/blog?${qs}` : "/blog";
  };

  return (
    <Container className="py-12 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Engineering Blog</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Articles and guides on engineering software, AI tools, technology news, tutorials and
        careers — researched from official sources, with source links in every article.
      </p>

      {all.length === 0 ? (
        <div className="mt-12 max-w-2xl rounded-xl border border-line bg-surface p-6">
          <h2 className="text-lg font-semibold">No articles yet</h2>
          <p className="mt-2 text-sm text-muted">
            No articles have been published yet. Articles will appear here as they are researched
            and published — nothing here is filler or generated to fill the page.
          </p>
        </div>
      ) : (
        <>
          <nav aria-label="Filter articles by category" className="mt-8 flex flex-wrap gap-2">
            <Link
              href="/blog"
              aria-current={!selectedCategory && !selectedTag ? "page" : undefined}
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${!selectedCategory && !selectedTag ? "bg-brand-600 text-white" : "border border-line bg-surface hover:border-brand-500"}`}
            >
              All articles
            </Link>
            {categories.map((category) => (
              <Link
                key={category}
                href={filterHref(category)}
                aria-current={selectedCategory === category && !selectedTag ? "page" : undefined}
                className={`rounded-full px-3 py-1.5 text-sm font-medium ${selectedCategory === category && !selectedTag ? "bg-brand-600 text-white" : "border border-line bg-surface hover:border-brand-500"}`}
              >
                {categoryLabels[category]}
              </Link>
            ))}
          </nav>

          {tags.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted">Tags:</span>
              {tags.map((tag) => (
                <Link
                  key={tag}
                  href={filterHref(selectedCategory, tag)}
                  aria-current={selectedTag === tag ? "page" : undefined}
                  className={`rounded-full px-2.5 py-0.5 text-xs ${selectedTag === tag ? "bg-brand-600 text-white" : "border border-line bg-surface hover:border-brand-500"}`}
                >
                  {tag}
                </Link>
              ))}
              {selectedTag && (
                <Link href={filterHref(selectedCategory)} className="text-sm font-medium text-brand-700">
                  Clear tag filter
                </Link>
              )}
            </div>
          )}

          {shown.length === 0 ? (
            <p className="mt-12 text-muted">
              No articles match this filter yet.{" "}
              <Link href="/blog" className="font-medium text-brand-700">
                View all articles
              </Link>
            </p>
          ) : (
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </ul>
          )}
        </>
      )}
    </Container>
  );
}
