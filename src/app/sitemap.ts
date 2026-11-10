import type { MetadataRoute } from "next";
import { disciplines } from "@/lib/disciplines";
import { getEventIds } from "@/lib/events";
import { getPaperIds } from "@/lib/papers";
import { getProjectIds } from "@/lib/projects";
import { getAllArticles } from "@/lib/articles";
import { siteConfig } from "@/lib/site";
// Sitemap covers finished pages: home, disciplines index, every
// department/centre/programme page, the blog index and every published
// article, the projects and seminars indexes, community, leaderboard
// and popular pages. Placeholder section pages are deliberately
// excluded until their stage is built. Paper, project and event detail
// URLs are added only when Supabase is configured; without a database
// the lists are empty and the build does not fail. The old /past-papers
// list URL is excluded — it redirects permanently to /disciplines —
// but paper detail URLs stay.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const [paperIds, projectIds, eventIds] = await Promise.all([
    getPaperIds(),
    getProjectIds(),
    getEventIds(),
  ]);
  const articles = getAllArticles();
  return [
    { url: base },
    { url: `${base}/disciplines` },
    { url: `${base}/blog` },
    { url: `${base}/projects` },
    { url: `${base}/seminars` },
    { url: `${base}/community` },
    { url: `${base}/community/leaderboard` },
    { url: `${base}/popular` },
    ...disciplines.map((d) => ({ url: `${base}/disciplines/${d.slug}` })),
    ...paperIds.map((id) => ({ url: `${base}/past-papers/${id}` })),
    ...projectIds.map((id) => ({ url: `${base}/projects/${id}` })),
    ...eventIds.map((id) => ({ url: `${base}/seminars/${id}` })),
    ...articles.map((a) => ({ url: `${base}/blog/${a.slug}`, lastModified: a.date })),
  ];
}
