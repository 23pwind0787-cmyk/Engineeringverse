import type { MetadataRoute } from "next";
import { disciplines } from "@/lib/disciplines";
import { getPaperIds } from "@/lib/papers";
import { siteConfig } from "@/lib/site";
// Sitemap covers finished pages: home, disciplines index, every
// department/centre/programme page, and the past-papers search page.
// Placeholder section pages are deliberately excluded until their
// stage is built. Paper detail URLs are added only when Supabase is
// configured; without a database the list is empty and the build
// does not fail.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const paperIds = await getPaperIds();
  return [
    { url: base },
    { url: `${base}/disciplines` },
    { url: `${base}/past-papers` },
    ...disciplines.map((d) => ({ url: `${base}/disciplines/${d.slug}` })),
    ...paperIds.map((id) => ({ url: `${base}/past-papers/${id}` })),
  ];
}
