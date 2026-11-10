import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { DeleteEventButton, DeletePaperButton, DeleteProjectButton } from "@/components/DeletePaperButton";
import { getCurrentAccount } from "@/lib/auth";
import { formatEventDate } from "@/lib/events";
import { getOwnPapers } from "@/lib/papers";
import { getOwnProjects } from "@/lib/projects";
import { getOwnEvents } from "@/lib/events";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  EVENT_TYPES,
  PROJECT_CATEGORIES,
  REPORT_REASONS,
  RESOURCE_CATEGORIES,
  type ContentReport,
  type ContentType,
  type ModerationStatus,
} from "@/lib/supabase/types";

export const instant = false;

export const metadata: Metadata = { title: "Your dashboard", robots: { index: false, follow: false } };

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function StatusBadge({ status, hidden }: { status: ModerationStatus; hidden: boolean }) {
  const label =
    status === "pending" ? "Pending" : status === "approved" ? "Approved" : "Rejected";
  const tone =
    status === "pending"
      ? "border-amber-300 bg-amber-50 text-amber-800"
      : status === "approved"
        ? "border-green-300 bg-green-50 text-green-800"
        : "border-red-300 bg-red-50 text-red-800";
  return (
    <span className="flex flex-wrap gap-1">
      <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${tone}`}>{label}</span>
      {hidden && (
        <span className="rounded-full border border-line bg-surface-alt px-2 py-0.5 text-xs font-semibold">
          Hidden
        </span>
      )}
    </span>
  );
}

function contentHref(type: ContentType, id: string): string {
  if (type === "project") return `/projects/${id}`;
  if (type === "event") return `/seminars/${id}`;
  return `/past-papers/${id}`;
}

function contentTypeLabel(type: ContentType): string {
  if (type === "project") return "Project";
  if (type === "event") return "Seminar / event";
  return "Resource";
}

function SubmissionCard({
  title,
  href,
  typeLabel,
  status,
  hidden,
  meta,
  moderationNote,
  editHref,
  deleteButton,
}: {
  title: string;
  href: string;
  typeLabel: string;
  status: ModerationStatus;
  hidden: boolean;
  meta: string;
  moderationNote: string | null;
  editHref: string | null;
  deleteButton: ReactNode;
}) {
  return (
    <li className="rounded-xl border border-line bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold">
          <Link href={href} className="hover:text-brand-700 hover:underline">
            {title}
          </Link>
        </h3>
        <StatusBadge status={status} hidden={hidden} />
      </div>
      <p className="mt-2 text-sm text-muted">
        {typeLabel} · {meta}
      </p>
      {status === "rejected" && moderationNote && (
        <p role="note" className="mt-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm">
          Admin note: {moderationNote}
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={href}
          className="rounded-lg border border-line px-4 py-2 text-sm font-semibold hover:border-brand-500"
        >
          View
        </Link>
        {editHref && (
          <Link
            href={editHref}
            className="rounded-lg border border-line px-4 py-2 text-sm font-semibold hover:border-brand-500"
          >
            Edit
          </Link>
        )}
        {deleteButton}
      </div>
    </li>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ uploaded?: string }>;
}) {
  const params = await searchParams;
  const account = await getCurrentAccount();
  if (!account) redirect("/auth/sign-in?next=/dashboard");

  const [papers, projects, events] = await Promise.all([
    getOwnPapers(account.userId),
    getOwnProjects(account.userId),
    getOwnEvents(account.userId),
  ]);

  let reports: ContentReport[] = [];
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    const { data } = await supabase
      .from("content_reports")
      .select("id, content_type, content_id, reporter_id, reason, details, status, created_at")
      .eq("reporter_id", account.userId)
      .order("created_at", { ascending: false });
    reports = (data ?? []) as ContentReport[];
  }

  const total = papers.length + projects.length + events.length;

  return (
    <Container className="py-12 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Your dashboard</h1>
      <p className="mt-3 text-muted">
        Signed in as {account.email} ({account.profile?.role ?? "student"}).{" "}
        <Link href="/profile" className="font-semibold text-brand-700 hover:underline">
          Edit profile
        </Link>
      </p>
      {params.uploaded === "1" && (
        <p role="status" className="mt-6 rounded-lg border border-line bg-surface-alt px-4 py-3 text-sm">
          Your submission is waiting for admin approval — it will appear
          publicly once approved. Thank you for contributing.
        </p>
      )}
      {!account.emailConfirmed && (
        <p role="alert" className="mt-6 rounded-lg border border-line bg-surface-alt px-4 py-3 text-sm">
          Your email is not verified yet, so uploads are blocked. Check your inbox for the verification link.
        </p>
      )}

      <div className="mt-8">
        <Link
          href="/upload"
          className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Upload resources
        </Link>
      </div>

      <section aria-labelledby="submissions-heading" className="mt-12">
        <h2 id="submissions-heading" className="text-xl font-bold">
          Your submissions ({total})
        </h2>
        {total === 0 && (
          <p className="mt-2 text-muted">
            You have not uploaded anything yet. Share a past paper, a project or
            a seminar from the upload page.
          </p>
        )}

        <h3 className="mt-8 text-lg font-semibold">Resources ({papers.length})</h3>
        {papers.length === 0 ? (
          <p className="mt-2 text-sm text-muted">You have not uploaded any resources yet.</p>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {papers.map((paper) => (
              <SubmissionCard
                key={paper.id}
                title={paper.title}
                href={`/past-papers/${paper.id}`}
                typeLabel={
                  RESOURCE_CATEGORIES.find((c) => c.value === paper.category)?.label ?? paper.category
                }
                status={paper.status}
                hidden={paper.hidden}
                meta={[
                  paper.department_name,
                  paper.subject_code,
                  paper.exam_type && paper.year ? `${paper.exam_type} ${paper.year}${paper.session ? ` (${paper.session})` : ""}` : null,
                  `${paper.download_count} downloads`,
                  `${paper.view_count} views`,
                  formatDate(paper.created_at),
                ]
                  .filter(Boolean)
                  .join(" · ")}
                moderationNote={paper.moderation_note}
                editHref={paper.status === "pending" ? `/dashboard/resources/${paper.id}/edit` : null}
                deleteButton={<DeletePaperButton paperId={paper.id} title={paper.title} />}
              />
            ))}
          </ul>
        )}

        <h3 className="mt-10 text-lg font-semibold">Projects ({projects.length})</h3>
        {projects.length === 0 ? (
          <p className="mt-2 text-sm text-muted">You have not submitted any projects yet.</p>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <SubmissionCard
                key={project.id}
                title={project.title}
                href={`/projects/${project.id}`}
                typeLabel={
                  PROJECT_CATEGORIES.find((c) => c.value === project.category)?.label ?? project.category
                }
                status={project.status}
                hidden={project.hidden}
                meta={[
                  project.department_name,
                  `${project.download_count} downloads`,
                  `${project.view_count} views`,
                  formatDate(project.created_at),
                ]
                  .filter(Boolean)
                  .join(" · ")}
                moderationNote={project.moderation_note}
                editHref={project.status === "pending" ? `/dashboard/projects/${project.id}/edit` : null}
                deleteButton={<DeleteProjectButton projectId={project.id} title={project.title} />}
              />
            ))}
          </ul>
        )}

        <h3 className="mt-10 text-lg font-semibold">Seminars &amp; events ({events.length})</h3>
        {events.length === 0 ? (
          <p className="mt-2 text-sm text-muted">You have not submitted any seminars or events yet.</p>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <SubmissionCard
                key={event.id}
                title={event.title}
                href={`/seminars/${event.id}`}
                typeLabel={
                  EVENT_TYPES.find((t) => t.value === event.event_type)?.label ?? event.event_type
                }
                status={event.status}
                hidden={event.hidden}
                meta={[
                  formatEventDate(event.starts_at),
                  event.venue,
                  `${event.view_count} views`,
                  formatDate(event.created_at),
                ]
                  .filter(Boolean)
                  .join(" · ")}
                moderationNote={event.moderation_note}
                editHref={event.status === "pending" ? `/dashboard/events/${event.id}/edit` : null}
                deleteButton={<DeleteEventButton eventId={event.id} title={event.title} />}
              />
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="reports-heading" className="mt-12">
        <h2 id="reports-heading" className="text-xl font-bold">
          Your reports ({reports.length})
        </h2>
        {reports.length === 0 ? (
          <p className="mt-2 text-muted">You have not reported any content.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {reports.map((report) => (
              <li key={report.id} className="rounded-xl border border-line bg-surface p-4 text-sm">
                <p>
                  <Link
                    href={contentHref(report.content_type, report.content_id)}
                    className="font-semibold hover:text-brand-700 hover:underline"
                  >
                    {contentTypeLabel(report.content_type)}
                  </Link>
                  <span className="text-muted">
                    {" — "}
                    {REPORT_REASONS.find((r) => r.value === report.reason)?.label ?? report.reason}
                    {" · "}
                    {formatDate(report.created_at)}
                  </span>
                </p>
                {report.details && <p className="mt-1 text-muted">{report.details}</p>}
                <p className="mt-1">
                  Status: <span className="font-medium">{report.status}</span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Container>
  );
}
