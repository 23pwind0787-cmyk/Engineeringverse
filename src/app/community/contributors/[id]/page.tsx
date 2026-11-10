import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { ResourceCard } from "@/components/ResourceCard";
import {
  avatarColorClass,
  getContributorProfile,
  initialsFor,
} from "@/lib/leaderboard";
import {
  EVENT_TYPES,
  PROJECT_CATEGORIES,
  type Project,
  type SiteEvent,
} from "@/lib/supabase/types";

export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const profile = await getContributorProfile(id);
  const name = profile.displayName ?? "Contributor";
  return {
    title: `${name} — Contributor`,
    description: profile.stat
      ? `${name} has shared ${profile.stat.approved_uploads} approved uploads on EngineeringVerse, including ${profile.stat.approved_projects} projects, with ${profile.stat.total_downloads} downloads.`
      : `${name} on EngineeringVerse — no public contributions yet.`,
    alternates: { canonical: `https://engineeringverse.me/community/contributors/${id}` },
  };
}

function formatEventDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Karachi",
  });
}

function ProjectCard({ project }: { project: Project }) {
  const categoryLabel =
    PROJECT_CATEGORIES.find((c) => c.value === project.category)?.label ?? project.category;
  return (
    <li>
      <Link
        href={`/projects/${project.id}`}
        className="flex h-full flex-col gap-3 rounded-xl border border-line bg-surface p-5 transition hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-md"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">{categoryLabel}</p>
        <h3 className="text-lg font-semibold">{project.title}</h3>
        <p className="flex-1 text-sm text-muted">{project.description}</p>
        <p className="text-sm text-muted">
          {project.department_name ?? ""}
          {` · ${project.download_count} download${project.download_count === 1 ? "" : "s"}`}
          {` · ${project.view_count} view${project.view_count === 1 ? "" : "s"}`}
        </p>
      </Link>
    </li>
  );
}

function EventCard({ event }: { event: SiteEvent }) {
  const typeLabel = EVENT_TYPES.find((t) => t.value === event.event_type)?.label ?? event.event_type;
  return (
    <li>
      <Link
        href={`/seminars/${event.id}`}
        className="flex h-full flex-col gap-3 rounded-xl border border-line bg-surface p-5 transition hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-md"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">{typeLabel}</p>
        <h3 className="text-lg font-semibold">{event.title}</h3>
        <p className="flex-1 text-sm text-muted">{event.description}</p>
        <p className="text-sm text-muted">
          {formatEventDate(event.starts_at)}
          {event.venue ? ` · ${event.venue}` : " · Online"}
          {` · ${event.view_count} view${event.view_count === 1 ? "" : "s"}`}
        </p>
      </Link>
    </li>
  );
}

function EmptyList({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 max-w-2xl rounded-xl border border-line bg-surface p-6">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="mt-2 text-sm text-muted">{children}</div>
    </div>
  );
}

export default async function ContributorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getContributorProfile(id);
  const name = profile.displayName ?? "Contributor";
  const hasAnything =
    profile.stat !== null ||
    profile.papers.length > 0 ||
    profile.projects.length > 0 ||
    profile.events.length > 0;

  const stats = [
    { label: "Approved uploads", value: profile.stat?.approved_uploads ?? 0 },
    { label: "Approved projects", value: profile.stat?.approved_projects ?? 0 },
    { label: "Research uploads", value: profile.stat?.approved_research_uploads ?? 0 },
    { label: "Total downloads", value: profile.stat?.total_downloads ?? 0 },
  ];

  return (
    <Container className="py-12 sm:py-16">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {profile.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatarUrl}
            alt=""
            className="h-20 w-20 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white ${avatarColorClass(id)}`}
          >
            {initialsFor(profile.displayName)}
          </span>
        )}
        <div className="min-w-0">
          <h1 className="truncate text-3xl font-bold tracking-tight sm:text-4xl">{name}</h1>
          {profile.stat?.top_department_name && (
            <p className="mt-1 text-muted">{profile.stat.top_department_name}</p>
          )}
          {profile.badges.length > 0 && (
            <p className="mt-3 flex flex-wrap gap-2">
              {profile.badges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700"
                >
                  {badge}
                </span>
              ))}
            </p>
          )}
        </div>
      </header>

      {!hasAnything ? (
        <div className="mt-10 max-w-2xl rounded-xl border border-line bg-surface p-6">
          <h2 className="text-lg font-semibold">No public contributions yet</h2>
          <p className="mt-2 text-sm text-muted">
            This contributor has no approved uploads on EngineeringVerse yet.
            Approved resources, projects and events will appear here once
            they are published.
          </p>
          <p className="mt-4 text-sm">
            <Link href="/community/leaderboard" className="font-semibold text-brand-700 hover:underline">
              See the leaderboard →
            </Link>
          </p>
        </div>
      ) : (
        <>
          <dl className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-line bg-surface p-5">
                <dt className="text-sm text-muted">{s.label}</dt>
                <dd className="mt-1 text-2xl font-bold">{s.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-sm text-muted">
            Counts cover approved, visible uploads only — all-time totals.
          </p>

          <section aria-labelledby="papers-heading" className="mt-12">
            <h2 id="papers-heading" className="text-2xl font-bold tracking-tight">
              Resources shared
            </h2>
            {profile.papers.length === 0 ? (
              <EmptyList title="No resources shared yet">
                <p>This contributor has not shared any approved resources yet.</p>
              </EmptyList>
            ) : (
              <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {profile.papers.map((paper) => (
                  <li key={paper.id}>
                    <ResourceCard paper={paper} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="projects-heading" className="mt-12">
            <h2 id="projects-heading" className="text-2xl font-bold tracking-tight">
              Projects shared
            </h2>
            {profile.projects.length === 0 ? (
              <EmptyList title="No projects shared yet">
                <p>This contributor has not shared any approved projects yet.</p>
              </EmptyList>
            ) : (
              <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {profile.projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="events-heading" className="mt-12">
            <h2 id="events-heading" className="text-2xl font-bold tracking-tight">
              Events shared
            </h2>
            {profile.events.length === 0 ? (
              <EmptyList title="No events shared yet">
                <p>This contributor has not shared any approved events yet.</p>
              </EmptyList>
            ) : (
              <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {profile.events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      <p className="mt-12 text-sm">
        <Link href="/community/leaderboard" className="font-medium text-brand-700 hover:underline">
          ← Back to the leaderboard
        </Link>
      </p>
    </Container>
  );
}
