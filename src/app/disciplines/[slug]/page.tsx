import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { ResourceCard } from "@/components/ResourceCard";
import { disciplines, kindLabel } from "@/lib/disciplines";
import { getDepartmentRowBySlug, getDisciplineBySlug, getSemesters } from "@/lib/structure";
import { searchPapers } from "@/lib/papers";
import { siteConfig } from "@/lib/site";
import {
  RESOURCE_CATEGORIES,
  type ExamType,
  type ResourceCategory,
  type SessionLabel,
} from "@/lib/supabase/types";

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

const EXAM_TYPES: Array<{ value: ExamType; label: string }> = [
  { value: "Mid", label: "Mid" },
  { value: "Final", label: "Final" },
  { value: "Quiz", label: "Quiz" },
  { value: "Other", label: "Previous / Other" },
];

const SESSIONS: SessionLabel[] = ["Spring", "Fall", "Summer", "Annual"];

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

const inputClass = "mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm";

export default async function DisciplinePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const d = await getDisciplineBySlug(slug);
  if (!d) notFound();

  // Active resource tab, from ?category= (default: past papers).
  const rawCategory = firstParam(sp.category);
  const category: ResourceCategory = RESOURCE_CATEGORIES.some((c) => c.value === rawCategory)
    ? (rawCategory as ResourceCategory)
    : "past_paper";
  const categoryLabel =
    RESOURCE_CATEGORIES.find((c) => c.value === category)?.label ?? "Past Papers";

  // Filters, from the GET form's searchParams.
  const q = firstParam(sp.q)?.trim() || undefined;
  const semesterId = firstParam(sp.semester) || undefined;
  const year = firstParam(sp.year)?.trim() || undefined;
  const session = firstParam(sp.session) || undefined;
  const subjectCode = firstParam(sp.subjectCode)?.trim() || undefined;
  const rawExamType = firstParam(sp.examType);
  const examType =
    category === "past_paper" && EXAM_TYPES.some((e) => e.value === rawExamType)
      ? (rawExamType as ExamType)
      : undefined;

  // The DB id for this department (the editorial discipline has none).
  // Without it, no department-scoped query is possible — the list stays
  // honestly empty rather than leaking another department's resources.
  const deptRow = await getDepartmentRowBySlug(slug);
  const semesters = await getSemesters();
  const papers = deptRow
    ? await searchPapers({
        departmentId: deptRow.id,
        category,
        query: q,
        semesterId,
        year,
        session,
        subjectCode,
        examType,
      })
    : [];

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Disciplines", item: "https://engineeringverse.me/disciplines" },
      { "@type": "ListItem", position: 2, name: d.name, item: `https://engineeringverse.me/disciplines/${slug}` },
    ],
  };

  const tabHref = (value: ResourceCategory) => `/disciplines/${slug}?category=${value}`;
  const filtersActive = Boolean(q || semesterId || year || session || subjectCode || examType);

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

      <section aria-labelledby="resources-heading" className="mt-12">
        <h2 id="resources-heading" className="text-2xl font-bold tracking-tight">
          Resources for {d.name}
        </h2>
        <p className="mt-1 text-sm text-muted">
          Shared by students and approved by admins. Pick a category, then
          filter the list — every resource opens on its own page with a
          preview and download.
        </p>

        {/* Category tabs — horizontally scrollable on phones. */}
        <div
          role="tablist"
          aria-label="Resource categories"
          className="mt-6 flex gap-2 overflow-x-auto pb-2"
        >
          {RESOURCE_CATEGORIES.map((c) => {
            const active = c.value === category;
            return (
              <Link
                key={c.value}
                href={tabHref(c.value)}
                role="tab"
                aria-selected={active}
                className={
                  active
                    ? "shrink-0 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
                    : "shrink-0 rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold hover:border-brand-500"
                }
              >
                {c.label}
              </Link>
            );
          })}
        </div>

        {/* Filters — a GET form, so the filtered list has a shareable URL. */}
        <form method="get" className="mt-4 rounded-xl border border-line bg-surface p-4 sm:p-5">
          <input type="hidden" name="category" value={category} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label htmlFor="q" className="text-sm font-medium">Search titles</label>
              <input
                id="q"
                name="q"
                type="search"
                defaultValue={q ?? ""}
                placeholder="Search by title…"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="semester" className="text-sm font-medium">Semester</label>
              <select id="semester" name="semester" defaultValue={semesterId ?? ""} className={inputClass}>
                <option value="">All semesters</option>
                {semesters.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="subjectCode" className="text-sm font-medium">Subject code</label>
              <input
                id="subjectCode"
                name="subjectCode"
                type="text"
                defaultValue={subjectCode ?? ""}
                placeholder="e.g. IE-414"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="year" className="text-sm font-medium">Year</label>
              <input
                id="year"
                name="year"
                type="number"
                inputMode="numeric"
                min="2000"
                max="2100"
                defaultValue={year ?? ""}
                placeholder="e.g. 2025"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="session" className="text-sm font-medium">Session</label>
              <select id="session" name="session" defaultValue={session ?? ""} className={inputClass}>
                <option value="">All sessions</option>
                {SESSIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            {category === "past_paper" && (
              <div>
                <label htmlFor="examType" className="text-sm font-medium">Exam type</label>
                <select id="examType" name="examType" defaultValue={examType ?? ""} className={inputClass}>
                  <option value="">All exam types</option>
                  {EXAM_TYPES.map((e) => (
                    <option key={e.value} value={e.value}>{e.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Apply filters
            </button>
            {filtersActive && (
              <Link href={tabHref(category)} className="text-sm font-semibold text-brand-600 hover:text-brand-700">
                Clear filters
              </Link>
            )}
          </div>
        </form>

        {/* Active tab's list. */}
        <div className="mt-6">
          {papers.length > 0 ? (
            <>
              <p className="text-sm text-muted" role="status">
                Showing {papers.length} {categoryLabel.toLowerCase()}
                {papers.length === 100 ? " (first 100)" : ""} for {d.name}.
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {papers.map((paper) => (
                  <ResourceCard key={paper.id} paper={paper} />
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-line bg-surface p-6 text-center">
              <p className="font-semibold">
                No {categoryLabel.toLowerCase()} shared for {d.name} yet.
              </p>
              <p className="mt-1 text-sm text-muted">
                {filtersActive
                  ? "Try clearing the filters, or check another category."
                  : "Be the first to share one — uploads are reviewed by an admin before they appear here."}
              </p>
              <Link
                href="/upload"
                className="mt-4 inline-block rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Upload a resource
              </Link>
            </div>
          )}
        </div>
      </section>
    </Container>
  );
}
