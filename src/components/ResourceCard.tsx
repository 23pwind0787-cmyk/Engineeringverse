import Link from "next/link";
import { RESOURCE_CATEGORIES, type Paper } from "@/lib/supabase/types";

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

export function ResourceCard({ paper }: { paper: Paper }) {
  const categoryLabel =
    RESOURCE_CATEGORIES.find((c) => c.value === paper.category)?.label ?? paper.category;

  const examLine = [paper.exam_type, paper.year, paper.session ? `(${paper.session})` : null]
    .filter(Boolean)
    .join(" ");

  return (
    <article className="rounded-xl border border-line bg-surface p-5">
      <h3 className="text-base font-semibold leading-snug">
        <Link href={`/past-papers/${paper.id}`} className="hover:text-brand-700">
          {paper.title}
        </Link>
      </h3>
      <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-brand-500">
        {categoryLabel}
      </p>
      {paper.description && (
        <p className="mt-2 line-clamp-2 text-sm text-muted">{paper.description}</p>
      )}
      <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
        {paper.department_name && (
          <div className="flex gap-1">
            <dt className="font-medium text-foreground">Department:</dt>
            <dd>{paper.department_name}</dd>
          </div>
        )}
        {paper.semester_number !== null && paper.semester_number !== undefined && (
          <div className="flex gap-1">
            <dt className="font-medium text-foreground">Semester:</dt>
            <dd>{paper.semester_number}</dd>
          </div>
        )}
        {paper.subject_code && (
          <div className="flex gap-1">
            <dt className="font-medium text-foreground">Subject:</dt>
            <dd>
              {paper.subject_name ? `${paper.subject_name} (${paper.subject_code})` : paper.subject_code}
            </dd>
          </div>
        )}
        {examLine && (
          <div className="flex gap-1">
            <dt className="font-medium text-foreground">Exam:</dt>
            <dd>{examLine}</dd>
          </div>
        )}
        <div className="flex gap-1">
          <dt className="font-medium text-foreground">Downloads:</dt>
          <dd>{paper.download_count}</dd>
        </div>
        <div className="flex gap-1">
          <dt className="font-medium text-foreground">Views:</dt>
          <dd>{paper.view_count}</dd>
        </div>
        <div className="flex gap-1">
          <dt className="font-medium text-foreground">Size:</dt>
          <dd>{formatFileSize(paper.file_size)}</dd>
        </div>
        <div className="flex gap-1">
          <dt className="font-medium text-foreground">Uploaded:</dt>
          <dd>{new Date(paper.created_at).toLocaleDateString()}</dd>
        </div>
        {paper.uploader_name && (
          <div className="flex gap-1">
            <dt className="font-medium text-foreground">Shared by:</dt>
            <dd>{paper.uploader_name}</dd>
          </div>
        )}
      </dl>
      <div className="mt-4">
        <Link
          href={`/past-papers/${paper.id}`}
          className="text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          View details &amp; download →
        </Link>
      </div>
    </article>
  );
}
