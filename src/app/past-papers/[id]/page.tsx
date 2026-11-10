import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/Container";
import { getPaperForViewer } from "@/lib/papers";
import { recordContentEvent } from "@/lib/content-events";
import { getCurrentAccount, isAdmin } from "@/lib/auth";
import { ReportButton } from "@/components/ReportButton";
import { RESOURCE_CATEGORIES } from "@/lib/supabase/types";

export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const paper = await getPaperForViewer(id, null, false);
  return paper
    ? {
        title: `${paper.title} — Resource`,
        description: `${paper.title}: ${paper.exam_type ? `${paper.exam_type} ${paper.year} (${paper.session}), ` : ""}${paper.subject_code ?? ""}, ${paper.department_name ?? ""}. Preview and download the PDF.`,
        alternates: { canonical: `https://engineeringverse.me/past-papers/${id}` },
      }
    : { title: "Resource not found", robots: { index: false } };
}

export default async function PaperDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const account = await getCurrentAccount();
  const paper = await getPaperForViewer(id, account?.userId ?? null, isAdmin(account));
  if (!paper) notFound();

  // One counted view per user (or per IP for guests) per day (Stage 8).
  // Pending/rejected content is never countable; the function refuses it.
  if (paper.status === "approved" && !paper.hidden) {
    await recordContentEvent("paper", id, "view");
  }

  const categoryLabel =
    RESOURCE_CATEGORIES.find((c) => c.value === paper.category)?.label ?? paper.category;
  const isOwner = account?.userId === paper.uploader_id;

  return (
    <Container className="py-12 sm:py-16">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/disciplines" className="hover:text-brand-700">Departments</Link> <span aria-hidden>/</span> <span>{paper.title}</span>
      </nav>
      {paper.status !== "approved" && (
        <p role="status" className="mt-6 rounded-lg border border-line bg-surface-alt px-4 py-3 text-sm">
          {paper.status === "pending"
            ? "This submission is waiting for admin approval and is only visible to you and the admins."
            : "This submission was rejected by an admin and is only visible to you and the admins."}
          {paper.moderation_note ? ` Admin note: ${paper.moderation_note}` : ""}
          {isOwner && paper.status === "pending" ? " You can edit it from your dashboard." : ""}
        </p>
      )}
      <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{paper.title}</h1>
      <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-brand-500">
        {categoryLabel}
        {paper.uploader_name ? ` · Shared by ${paper.uploader_name}` : ""}
      </p>
      {paper.description && <p className="mt-4 max-w-3xl text-lg text-muted">{paper.description}</p>}
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div><dt className="font-medium">Campus</dt><dd className="text-muted">{paper.campus_name}</dd></div>
        <div><dt className="font-medium">Department</dt><dd className="text-muted">{paper.department_name}</dd></div>
        {paper.semester_number !== null && (
          <div><dt className="font-medium">Semester</dt><dd className="text-muted">Semester {paper.semester_number}</dd></div>
        )}
        {paper.subject_code && (
          <div><dt className="font-medium">Subject</dt><dd className="text-muted">{paper.subject_name ?? paper.subject_code} ({paper.subject_code})</dd></div>
        )}
        {paper.exam_type && (
          <div><dt className="font-medium">Exam</dt><dd className="text-muted">{paper.exam_type} {paper.year} ({paper.session})</dd></div>
        )}
        <div><dt className="font-medium">Downloads</dt><dd className="text-muted">{paper.download_count}</dd></div>
        <div><dt className="font-medium">Views</dt><dd className="text-muted">{paper.view_count}</dd></div>
        <div><dt className="font-medium">File size</dt><dd className="text-muted">{(paper.file_size / 1024).toFixed(0)} KB</dd></div>
        <div><dt className="font-medium">Uploaded</dt><dd className="text-muted">{new Date(paper.created_at).toLocaleDateString()}</dd></div>
      </dl>

      {paper.status === "approved" && !paper.hidden && (
        <>
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
        </>
      )}

      <section aria-labelledby="report-heading" className="mt-10 rounded-xl border border-line bg-surface p-5">
        <h2 id="report-heading" className="text-lg font-bold">Report this resource</h2>
        <p className="mt-1 text-sm text-muted">
          Signed-in users can report a resource that is incorrect, a duplicate,
          broken, inappropriate, or uploaded without permission. An admin reviews every report.
        </p>
        <div className="mt-4">
          <ReportButton contentType="paper" contentId={paper.id} label="Report this resource" />
        </div>
      </section>
    </Container>
  );
}
