import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { searchPapers } from "@/lib/papers";
import { getCampuses, getDepartments, getSemesters, getSubjects } from "@/lib/structure";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const instant = false;

export const metadata: Metadata = {
  title: "UET Peshawar Past Papers",
  description: "Search, preview and download UET Peshawar past papers by campus, department, semester, subject, exam type, year and session. No account needed to download.",
};

const EXAM_TYPES = ["Mid", "Final", "Quiz", "Other"];
const SESSIONS = ["Spring", "Fall", "Summer", "Annual"];
const selectClass = "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm";

export default async function PastPapersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const first = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;
  const filters = {
    campusId: first(params.campus),
    departmentId: first(params.department),
    semesterId: first(params.semester),
    subjectId: first(params.subject),
    subjectCode: first(params.code),
    examType: first(params.exam),
    year: first(params.year),
    session: first(params.session),
    query: first(params.q),
  };
  const hasFilter = Object.values(filters).some((v) => v);
  const [campuses, departments, semesters, subjects, papers] = await Promise.all([
    getCampuses(),
    getDepartments(),
    getSemesters(),
    getSubjects(),
    hasFilter || true ? searchPapers(filters) : Promise.resolve([]),
  ]);
  const configured = isSupabaseConfigured();
  const years = Array.from({ length: 30 }, (_, i) => String(new Date().getFullYear() - i));

  return (
    <Container className="py-12 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">UET Peshawar Past Papers</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Search, preview and download published papers without an account.{" "}
        <Link href="/upload" className="font-semibold text-brand-700 hover:underline">
          Upload a paper
        </Link>{" "}
        — registration and email verification are required to upload.
      </p>

      {!configured && (
        <p role="status" className="mt-6 rounded-lg border border-line bg-surface-alt px-4 py-3 text-sm">
          The paper portal database is not connected yet. No papers are
          listed until the site owner adds the Supabase settings — see
          SUPABASE_SETUP.md. The search form below will work once it is connected.
        </p>
      )}

      <form method="get" className="mt-8 grid gap-4 rounded-xl border border-line bg-surface p-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Search past papers">
        <div>
          <label htmlFor="q" className="text-sm font-medium">Search title</label>
          <input id="q" name="q" defaultValue={filters.query ?? ""} className={selectClass} placeholder="e.g. thermodynamics" />
        </div>
        <div>
          <label htmlFor="campus" className="text-sm font-medium">Campus</label>
          <select id="campus" name="campus" defaultValue={filters.campusId ?? ""} className={selectClass}>
            <option value="">All campuses</option>
            {campuses.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="department" className="text-sm font-medium">Department</label>
          <select id="department" name="department" defaultValue={filters.departmentId ?? ""} className={selectClass}>
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="semester" className="text-sm font-medium">Semester</label>
          <select id="semester" name="semester" defaultValue={filters.semesterId ?? ""} className={selectClass}>
            <option value="">All semesters</option>
            {semesters.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="subject" className="text-sm font-medium">Subject</label>
          <select id="subject" name="subject" defaultValue={filters.subjectId ?? ""} className={selectClass}>
            <option value="">All subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="code" className="text-sm font-medium">Subject code</label>
          <input id="code" name="code" defaultValue={filters.subjectCode ?? ""} className={selectClass} placeholder="e.g. IE-472" />
        </div>
        <div>
          <label htmlFor="exam" className="text-sm font-medium">Exam type</label>
          <select id="exam" name="exam" defaultValue={filters.examType ?? ""} className={selectClass}>
            <option value="">All types</option>
            {EXAM_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="year" className="text-sm font-medium">Year</label>
          <select id="year" name="year" defaultValue={filters.year ?? ""} className={selectClass}>
            <option value="">All years</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="session" className="text-sm font-medium">Session</label>
          <select id="session" name="session" defaultValue={filters.session ?? ""} className={selectClass}>
            <option value="">All sessions</option>
            {SESSIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-3">
          <button type="submit" className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">Search</button>
          <Link href="/past-papers" className="rounded-lg border border-line px-6 py-2.5 text-sm font-semibold hover:border-brand-500">Clear</Link>
        </div>
      </form>

      <section aria-label="Results" className="mt-10">
        <h2 className="text-xl font-bold">
          {papers.length === 0
            ? "No papers found"
            : `${papers.length} paper${papers.length === 1 ? "" : "s"} found`}
        </h2>
        {papers.length === 0 ? (
          <p className="mt-2 text-muted">
            {configured
              ? "No published papers match these filters yet. Try widening the search, or upload a paper if you have one."
              : "No papers have been published yet."}
          </p>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {papers.map((paper) => (
              <li key={paper.id} className="rounded-xl border border-line bg-surface p-5">
                <h3 className="font-semibold">
                  <Link href={`/past-papers/${paper.id}`} className="hover:text-brand-700 hover:underline">
                    {paper.title}
                  </Link>
                </h3>
                <p className="mt-2 text-sm text-muted">
                  {paper.department_name ?? "Department"} · Semester {paper.semester_number ?? "?"} ·{" "}
                  {paper.subject_code} · {paper.exam_type} {paper.year} ({paper.session})
                </p>
                <p className="mt-2 text-sm text-muted">
                  {paper.download_count} download{paper.download_count === 1 ? "" : "s"} ·{" "}
                  {(paper.file_size / 1024).toFixed(0)} KB
                </p>
                <Link href={`/past-papers/${paper.id}`} className="mt-4 inline-block text-sm font-semibold text-brand-700 hover:underline">
                  Preview and download →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Container>
  );
}
