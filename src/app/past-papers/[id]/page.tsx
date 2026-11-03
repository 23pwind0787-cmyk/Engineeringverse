import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/Container";
import { getPaper } from "@/lib/papers";
import { ReportForm } from "@/components/ReportForm";

export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const paper = await getPaper(id);
  return paper
    ? {
        title: `${paper.title} — Past Paper`,
        description: `${paper.title}: ${paper.exam_type} ${paper.year} (${paper.session}), ${paper.subject_code}, ${paper.department_name ?? ""}. Preview and download the PDF.`,
      }
    : { title: "Paper not found", robots: { index: false } };
}

export default async function PaperDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const paper = await getPaper(id);
  if (!paper) notFound();

  return (
    <Container className="py-12 sm:py-16">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/past-papers" className="hover:text-brand-700">Past Papers</Link> <span aria-hidden>/</span> <span>{paper.title}</span>
      </nav>
      <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{paper.title}</h1>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div><dt className="font-medium">Campus</dt><dd className="text-muted">{paper.campus_name}</dd></div>
        <div><dt className="font-medium">Department</dt><dd className="text-muted">{paper.department_name}</dd></div>
        <div><dt className="font-medium">Semester</dt><dd className="text-muted">Semester {paper.semester_number}</dd></div>
        <div><dt className="font-medium">Subject</dt><dd className="text-muted">{paper.subject_name ?? paper.subject_code} ({paper.subject_code})</dd></div>
        <div><dt className="font-medium">Exam</dt><dd className="text-muted">{paper.exam_type} {paper.year} ({paper.session})</dd></div>
        <div><dt className="font-medium">Downloads</dt><dd className="text-muted">{paper.download_count}</dd></div>
        <div><dt className="font-medium">File size</dt><dd className="text-muted">{(paper.file_size / 1024).toFixed(0)} KB</dd></div>
        <div><dt className="font-medium">Uploaded</dt><dd className="text-muted">{new Date(paper.created_at).toLocaleDateString()}</dd></div>
      </dl>

      <div className="mt-8 flex flex-wrap gap-3">
        <a href={`/api/papers/${paper.id}/download`} className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700">
          Download PDF
        </a>
        <a href={`/api/papers/${paper.id}/preview`} target="_blank" rel="noreferrer" className="rounded-lg border border-line px-6 py-3 text-sm font-semibold hover:border-brand-500">
          Open preview in a new tab
        </a>
      </div>

      <section aria-labelledby="preview-heading" className="mt-10">
        <h2 id="preview-heading" className="text-xl font-bold">Preview</h2>
        <p className="mt-1 text-sm text-muted">
          The preview opens through a short-lived signed link, so the file
          itself is never exposed as a public URL.
        </p>
        <iframe
          title={`Preview of ${paper.title}`}
          src={`/api/papers/${paper.id}/preview`}
          className="mt-4 h-[70vh] w-full rounded-xl border border-line bg-surface"
        />
      </section>

      <section aria-labelledby="report-heading" className="mt-10 rounded-xl border border-line bg-surface p-5">
        <h2 id="report-heading" className="text-lg font-bold">Report this paper</h2>
        <p className="mt-1 text-sm text-muted">
          Signed-in users can report a paper that is inappropriate, a
          duplicate, or uploaded without permission. An admin reviews every report.
        </p>
        <ReportForm paperId={paper.id} />
      </section>
    </Container>
  );
}
