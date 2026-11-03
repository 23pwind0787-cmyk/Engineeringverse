import Link from "next/link";
import { Container } from "@/components/Container";
import { SectionCard } from "@/components/SectionCard";
import { campuses, kindLabel, type Discipline } from "@/lib/disciplines";
import { getDisciplines } from "@/lib/structure";
import { sections, siteConfig } from "@/lib/site";

export default async function HomePage() {
  const disciplines: Discipline[] = await getDisciplines();
  const disciplinesByCampus = (campus: string) => disciplines.filter((d) => d.campus === campus);
  const papers = sections.find((s) => s.key === "past-papers")!;
  return (
    <>
      <section className="border-b border-line bg-surface-alt">
        <Container className="py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">For the global engineering community</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">
              Explore Engineering. <span className="text-brand-600">Master Technology.</span> Build Your Future.
            </h1>
            <p className="mt-6 text-lg text-muted">{siteConfig.description}</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/disciplines" className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700">Explore disciplines</Link>
              <Link href={papers.href} className="rounded-lg border border-line bg-surface px-6 py-3 text-sm font-semibold hover:border-brand-500">Browse past papers</Link>
            </div>
          </div>
        </Container>
      </section>

      <section aria-labelledby="explore-heading" className="py-16">
        <Container>
          <h2 id="explore-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">Everything in one place</h2>
          <p className="mt-2 max-w-2xl text-muted">Choose a section to get started.</p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {sections.map((s) => (
              <li key={s.key}><SectionCard href={s.href} title={s.label} blurb={s.blurb} glyph={s.glyph} /></li>
            ))}
          </ul>
        </Container>
      </section>

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
