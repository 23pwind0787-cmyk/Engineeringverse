import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/Container";
import { getProjectForViewer } from "@/lib/projects";
import { recordContentEvent } from "@/lib/content-events";
import { getCurrentAccount, isAdmin } from "@/lib/auth";
import { ReportButton } from "@/components/ReportButton";
import { createServiceRoleClient, isServiceRoleConfigured } from "@/lib/supabase/admin";
import { PROJECT_CATEGORIES } from "@/lib/supabase/types";

export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = await getProjectForViewer(id, null, false);
  return project
    ? {
        title: `${project.title} — Project`,
        description: `${project.title}: ${project.description.slice(0, 140)}`,
        alternates: { canonical: `https://engineeringverse.me/projects/${id}` },
      }
    : { title: "Project not found", robots: { index: false } };
}

function isVideoPath(path: string): boolean {
  return path.toLowerCase().endsWith(".mp4") || path.toLowerCase().endsWith(".webm");
}

async function signedMediaUrls(paths: string[]): Promise<Array<{ path: string; url: string }>> {
  if (paths.length === 0 || !isServiceRoleConfigured()) return [];
  try {
    const service = createServiceRoleClient();
    const signed = await Promise.all(
      paths.map(async (path) => {
        const { data } = await service.storage.from("project-media").createSignedUrl(path, 300);
        return data?.signedUrl ? { path, url: data.signedUrl } : null;
      }),
    );
    return signed.filter((entry): entry is { path: string; url: string } => entry !== null);
  } catch {
    return [];
  }
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const account = await getCurrentAccount();
  const project = await getProjectForViewer(id, account?.userId ?? null, isAdmin(account));
  if (!project) notFound();

  // One counted view per user (or per IP for guests) per day (Stage 8).
  // Pending/rejected content is never countable; the function refuses it.
  if (project.status === "approved" && !project.hidden) {
    await recordContentEvent("project", id, "view");
  }

  const categoryLabel =
    PROJECT_CATEGORIES.find((c) => c.value === project.category)?.label ?? project.category;
  const isOwner = account?.userId === project.uploader_id;
  const media = await signedMediaUrls(project.media_paths ?? []);

  return (
    <Container className="py-12 sm:py-16">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/projects" className="hover:text-brand-700">Projects</Link> <span aria-hidden>/</span> <span>{project.title}</span>
      </nav>
      {project.status !== "approved" && (
        <p role="status" className="mt-6 rounded-lg border border-line bg-surface-alt px-4 py-3 text-sm">
          {project.status === "pending"
            ? "This project is waiting for admin approval and is only visible to you and the admins."
            : "This project was rejected by an admin and is only visible to you and the admins."}
          {project.moderation_note ? ` Admin note: ${project.moderation_note}` : ""}
          {isOwner && project.status === "pending" ? " You can edit it from your dashboard." : ""}
        </p>
      )}
      <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{project.title}</h1>
      <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-brand-500">
        {categoryLabel}
        {project.uploader_name ? ` · Shared by ${project.uploader_name}` : ""}
      </p>
      <p className="mt-4 max-w-3xl text-lg text-muted">{project.description}</p>

      <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div><dt className="font-medium">Campus</dt><dd className="text-muted">{project.campus_name}</dd></div>
        <div><dt className="font-medium">Department</dt><dd className="text-muted">{project.department_name}</dd></div>
        {project.supervisor && (
          <div><dt className="font-medium">Supervisor</dt><dd className="text-muted">{project.supervisor}</dd></div>
        )}
        <div><dt className="font-medium">Team</dt><dd className="text-muted">{project.team_members.length > 0 ? project.team_members.join(", ") : "—"}</dd></div>
        <div><dt className="font-medium">Downloads</dt><dd className="text-muted">{project.download_count}</dd></div>
        <div><dt className="font-medium">Views</dt><dd className="text-muted">{project.view_count}</dd></div>
        <div><dt className="font-medium">Uploaded</dt><dd className="text-muted">{new Date(project.created_at).toLocaleDateString()}</dd></div>
      </dl>

      {project.tools.length > 0 && (
        <section aria-labelledby="tools-heading" className="mt-10">
          <h2 id="tools-heading" className="text-xl font-bold">Tools &amp; technologies</h2>
          <p className="mt-3 flex flex-wrap gap-2">
            {project.tools.map((tool) => (
              <span key={tool} className="rounded-full bg-surface-alt px-3 py-1 text-sm text-muted">{tool}</span>
            ))}
          </p>
        </section>
      )}

      {project.outcomes && (
        <section aria-labelledby="outcomes-heading" className="mt-10">
          <h2 id="outcomes-heading" className="text-xl font-bold">Outcomes</h2>
          <p className="mt-3 max-w-3xl text-muted">{project.outcomes}</p>
        </section>
      )}

      {media.length > 0 && (
        <section aria-labelledby="gallery-heading" className="mt-10">
          <h2 id="gallery-heading" className="text-xl font-bold">Gallery</h2>
          <p className="mt-1 text-sm text-muted">
            Media opens through short-lived signed links, so the files
            themselves are never exposed as public URLs.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {media.map(({ path, url }) =>
              isVideoPath(path) ? (
                <video key={path} src={url} controls preload="metadata" className="w-full rounded-xl border border-line bg-surface" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={path} src={url} alt={`Project media for ${project.title}`} className="w-full rounded-xl border border-line bg-surface" />
              ),
            )}
          </div>
        </section>
      )}

      {project.status === "approved" && !project.hidden && project.report_path && (
        <div className="mt-10 flex flex-wrap gap-3">
          <a href={`/api/projects/${project.id}/report`} className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700">
            Download project report (PDF)
          </a>
        </div>
      )}

      <section aria-labelledby="report-heading" className="mt-10 rounded-xl border border-line bg-surface p-5">
        <h2 id="report-heading" className="text-lg font-bold">Report this project</h2>
        <p className="mt-1 text-sm text-muted">
          Signed-in users can report a project that is incorrect, a duplicate,
          broken, inappropriate, or uploaded without permission. An admin reviews every report.
        </p>
        <div className="mt-4">
          <ReportButton contentType="project" contentId={project.id} label="Report this project" />
        </div>
      </section>
    </Container>
  );
}
