import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { SectionCard } from "@/components/SectionCard";
import { campuses, kindLabel, type Discipline } from "@/lib/disciplines";
import { getDisciplines } from "@/lib/structure";
import { formatArticleDate, getAllArticles } from "@/lib/articles";
import { liveSections, sections } from "@/lib/site";

export const metadata: Metadata = {
  title: "UET Past Papers & Engineering Guides",
  description:
    "Download UET Peshawar past papers by subject and semester, explore UET departments and programmes, and read engineering software news researched from official sources.",
  alternates: { canonical: "https://engineeringverse.me/" },
};

// Reads from Supabase when configured, so this route must not be
// prerendered under cacheComponents.
export const instant = false;

export default async function HomePage() {
  const disciplines: Discipline[] = await getDisciplines();
  const disciplinesByCampus = (campus: string) => disciplines.filter((d) => d.campus === campus);
  const papers = sections.find((s) => s.key === "past-papers")!;
  const articles = getAllArticles();
  return (
    <>
      <section className="border-b border-line bg-surface-alt">
        <Container className="py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">For the global engineering community</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">
              UET Peshawar Past Papers, Departments &amp; <span className="text-brand-600">Engineering Software News.</span>
            </h1>
            <p className="mt-6 text-lg text-muted">
              EngineeringVerse helps engineering students at UET Peshawar — and beyond — find what they
              actually need: past papers organised by subject, semester, and exam type; clear guides to
              the departments and programmes UET Peshawar offers across its four campuses; and news about
              engineering software, researched from official vendor sources and written so a student can
              act on it. Everything here is free to read. Past papers can be searched and previewed
              without an account, and students can contribute papers of their own once they register.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/disciplines" className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700">Explore disciplines</Link>
              <Link href={papers.href} className="rounded-lg border border-line bg-surface px-6 py-3 text-sm font-semibold hover:border-brand-500">Browse past papers</Link>
            </div>
          </div>
        </Container>
      </section>

      <section aria-labelledby="explore-heading" className="py-16">
        <Container>
          <h2 id="explore-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">Start here</h2>
          <p className="mt-2 max-w-2xl text-muted">Choose a section to get started.</p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {liveSections.map((s) => (
              <li key={s.key}><SectionCard href={s.href} title={s.label} blurb={s.blurb} glyph={s.glyph} /></li>
            ))}
          </ul>
        </Container>
      </section>

      {articles.length > 0 && (
        <section aria-labelledby="latest-heading" className="border-t border-line py-16">
          <Container>
            <h2 id="latest-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">Latest articles</h2>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((a) => (
                <li key={a.slug}>
                  <Link href={`/blog/${a.slug}`} className="block h-full rounded-xl border border-line bg-surface p-5 transition hover:border-brand-500 hover:shadow-md">
                    <h3 className="font-semibold">{a.title}</h3>
                    <p className="mt-2 text-sm text-muted">{a.summary}</p>
                    <p className="mt-3 text-sm text-muted">{formatArticleDate(a.date)}</p>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-6">
              <Link href="/blog" className="text-sm font-semibold text-brand-700 hover:underline">View all articles →</Link>
            </p>
          </Container>
        </section>
      )}

      <section aria-labelledby="disc-heading" className="border-t border-line bg-surface-alt py-16">
        <Container>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 id="disc-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">UET Peshawar departments, centres &amp; programmes</h2>
              <p className="mt-2 text-muted">Every department, centre and programme listed by UET Peshawar, grouped by campus.</p>
            </div>
            <Link href="/disciplines" className="hidden shrink-0 text-sm font-semibold text-brand-700 hover:underline sm:block">View all →</Link>
          </div>
          {campuses.map((campus) => (
            <div key={campus} className="mt-10">
              <h3 className="text-lg font-semibold">{campus} Campus</h3>
              <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {disciplinesByCampus(campus).map((d) => (
                  <li key={d.slug}>
                    <Link href={`/disciplines/${d.slug}`} className="block h-full rounded-xl border border-line bg-surface p-5 transition hover:border-brand-500 hover:shadow-md">
                      <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">{kindLabel[d.kind]}</p>
                      <h4 className="mt-1 font-semibold">{d.name}</h4>
                      <p className="mt-2 text-sm text-muted">{d.summary}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="mt-8 text-sm text-muted">{disciplines.length} entries across {campuses.length} campuses.</p>
          <p className="mt-3 text-sm text-muted">
            EngineeringVerse is an independent student-run resource. It is not affiliated with UET
            Peshawar. Department listings were verified against uetpeshawar.edu.pk.
          </p>
        </Container>
      </section>

      <section aria-labelledby="papers-heading" className="py-16">
        <Container>
          <div className="rounded-2xl bg-brand-600 p-8 text-white sm:p-12">
            <h2 id="papers-heading" className="text-2xl font-bold sm:text-3xl">UET Peshawar Past Papers</h2>
            <p className="mt-3 max-w-2xl text-white/90">
              Search, preview and download past papers without an account. Registered students can contribute papers to help others prepare.
            </p>
            <Link href={papers.href} className="mt-6 inline-flex rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand-700 hover:bg-brand-50">Go to past papers</Link>
          </div>
        </Container>
      </section>
    </>
  );
}
