import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import {
  categoryLabels,
  formatArticleDate,
  getArticleBySlug,
  siteArticleUrl,
} from "@/lib/articles";
import { siteConfig } from "@/lib/site";

// Articles are read from the filesystem at request time, and there
// may be zero of them, so this route is rendered on demand rather
// than prerendered: no generateStaticParams (Cache Components
// requires it to return at least one result, which an empty blog
// cannot). Matches the dynamic paper-detail route in this project.
// `instant = false` keeps the route out of partial prerendering.
export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "Article not found" };
  const url = siteArticleUrl(article.slug);
  return {
    title: article.title,
    description: article.summary,
    alternates: { canonical: url },
    openGraph: {
      title: article.title,
      description: article.summary,
      url,
      siteName: siteConfig.name,
      type: "article",
      publishedTime: article.date,
      tags: article.tags,
      ...(article.featuredImage ? { images: [{ url: article.featuredImage, alt: article.title }] } : {}),
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  return (
    <Container className="py-12 sm:py-16">
      <article className="mx-auto max-w-3xl">
        <Link href="/blog" className="text-sm font-medium text-brand-700">
          ← Back to all articles
        </Link>
        <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-brand-600">
          {categoryLabels[article.category]}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{article.title}</h1>
        <p className="mt-3 text-lg text-muted">{article.summary}</p>
        <p className="mt-4 text-sm text-muted">{formatArticleDate(article.date)}</p>

        {article.tags.length > 0 && (
          <p className="mt-3 flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${encodeURIComponent(tag)}`}
                className="rounded-full bg-surface-alt px-2.5 py-0.5 text-xs text-muted hover:border-brand-500"
              >
                {tag}
              </Link>
            ))}
          </p>
        )}

        {article.featuredImage && (
          <figure className="mt-8">
            {/* eslint-disable-next-line @next/next/no-img-element -- remote licensed image URL from frontmatter; next/image needs a configured remote host per image */}
            <img src={article.featuredImage} alt={article.title} className="w-full rounded-xl border border-line" />
            {article.featuredImageCredit && (
              <figcaption className="mt-2 text-xs text-muted">
                Image: {article.featuredImageCredit}
              </figcaption>
            )}
          </figure>
        )}

        <div
          className="mt-2"
          dangerouslySetInnerHTML={{ __html: article.html }}
        />

        {(article.sourceName || article.sourceUrl) && (
          <section aria-label="Sources" className="mt-10 rounded-xl border border-line bg-surface p-5">
            <h2 className="text-base font-semibold">Sources</h2>
            <ul className="mt-2 space-y-1 text-sm">
              <li>
                {article.sourceUrl ? (
                  <a
                    className="font-medium text-brand-700 underline hover:text-brand-600"
                    href={article.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {article.sourceName ?? article.sourceUrl}
                  </a>
                ) : (
                  <span>{article.sourceName}</span>
                )}
              </li>
            </ul>
            <p className="mt-3 text-xs text-muted">
              Claims in this article were checked against the source above. Where information is
              unconfirmed, the article says so.
            </p>
          </section>
        )}

        <p className="mt-10">
          <Link href="/blog" className="text-sm font-medium text-brand-700">
            ← Back to all articles
          </Link>
        </p>
      </article>
    </Container>
  );
}
