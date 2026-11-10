import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { disciplines, kindLabel } from "@/lib/disciplines";
import { getDisciplineBySlug } from "@/lib/structure";
import { siteConfig } from "@/lib/site";

// Reads from Supabase when configured, so this route must not be
// prerendered under cacheComponents (see build error on Vercel:
// "uncached or runtime data during prerendering" for /disciplines/[slug]).
export const instant = false;

// NOTE: `export const dynamicParams = false` was tried to make unknown
// slugs return a true 404, but Next.js 16.4.3 with cacheComponents
// rejects that segment config at build time, so it was removed.
// Unknown slugs still render the not-found page (with HTTP 200 from
// the production server in this partial-prerender setup). See
// SECURITY_REVIEW.md. Only the slugs known at build time (from the
// verified seed data) are generated.

export function generateStaticParams() {
  return disciplines.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const d = await getDisciplineBySlug(slug);
  return d
    ? {
        title: `${d.name} — ${d.campus} Campus`,
        description: `${kindLabel[d.kind]} at UET Peshawar, ${d.campus} Campus: ${d.summary} Focus areas and typical roles explained.`,
        alternates: { canonical: `${siteConfig.url}/disciplines/${slug}` },
      }
    : {};
}

export default async function DisciplinePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = await getDisciplineBySlug(slug);
  if (!d) notFound();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Disciplines", item: "https://engineeringverse.me/disciplines" },
      { "@type": "ListItem", position: 2, name: d.name, item: `https://engineeringverse.me/disciplines/${slug}` },
    ],
  };

  return (
    <Container className="py-12 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/disciplines" className="hover:text-brand-700">Disciplines</Link> <span aria-hidden>/</span> <span>{d.name}</span>
      </nav>
      <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{d.name}</h1>
      <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-brand-500">
        {kindLabel[d.kind]} · {d.campus} Campus · UET Peshawar
      </p>
      <p className="mt-4 max-w-3xl text-lg text-muted">{d.overview}</p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <section aria-labelledby="focus" className="rounded-xl border border-line bg-surface p-6">
          <h2 id="focus" className="font-semibold">Focus areas</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted">{d.focusAreas.map((f) => <li key={f}>{f}</li>)}</ul>
        </section>
        <section aria-labelledby="roles" className="rounded-xl border border-line bg-surface p-6">
          <h2 id="roles" className="font-semibold">Typical roles</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted">{d.typicalRoles.map((r) => <li key={r}>{r}</li>)}</ul>
        </section>
      </div>
    </Container>
  );
}
