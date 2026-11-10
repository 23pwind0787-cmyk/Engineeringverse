import type { MetadataRoute } from "next";
import { disciplines } from "@/lib/disciplines";
import { getPaperIds } from "@/lib/papers";
import { getAllArticles } from "@/lib/articles";
import { siteConfig } from "@/lib/site";
// Sitemap covers finished pages: home, disciplines index, every
// department/centre/programme page, the blog index and every published
// article. Placeholder section pages are deliberately excluded until
// their stage is built. Paper detail URLs are added only when Supabase
// is configured; without a database the list is empty and the build
// does not fail. The old /past-papers list URL is excluded — it
// redirects permanently to /disciplines — but paper detail URLs stay.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const paperIds = await getPaperIds();
  const articles = getAllArticles();
  return [
    { url: base },
    { url: `${base}/disciplines` },
    { url: `${base}/blog` },
    ...disciplines.map((d) => ({ url: `${base}/disciplines/${d.slug}` })),
    ...paperIds.map((id) => ({ url: `${base}/past-papers/${id}` })),
    ...articles.map((a) => ({ url: `${base}/blog/${a.slug}`, lastModified: a.date })),
  ];
}
