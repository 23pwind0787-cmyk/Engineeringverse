import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { campuses, kindLabel, type Discipline } from "@/lib/disciplines";
import { getDisciplines } from "@/lib/structure";
import { formatArticleDate, getAllArticles } from "@/lib/articles";
import { searchPapers } from "@/lib/papers";
import { searchProjects } from "@/lib/projects";
import { formatEventDateTime, listUpcomingEvents } from "@/lib/events";
import { EVENT_TYPES, PROJECT_CATEGORIES } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Learn. Build. Innovate. Share.",
  description:
    "EngineeringVerse connects engineering minds through knowledge, creativity and innovation — find departments, academic resources, innovative projects, seminars and engineering software news.",
  alternates: { canonical: "https://engineeringverse.me/" },
};

// Reads from Supabase when configured, so this route must not be
// prerendered under cacheComponents.
export const instant = false;

export default async function HomePage() {
  const disciplines: Discipline[] = await getDisciplines();
  const disciplinesByCampus = (campus: string) => disciplines.filter((d) => d.campus === campus);
  const recentPapers = (await searchPapers({})).slice(0, 6);
  const featuredProjects = (await searchProjects({})).slice(0, 6);
  const upcomingEvents = await listUpcomingEvents(4);
  const articles = getAllArticles();
  return (
    <>
      <section className="border-b border-line bg-surface-alt">
        <Container className="py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-500">Learn. Build. Innovate. Share.</p>
            <h1 className="mt-4 text-5xl font-bold tracking-tight sm:text-7xl">
              Engineering<span className="text-brand-500">Verse</span>
            </h1>
            <p className="mt-6 text-lg text-muted">
              Connecting engineering minds through knowledge, creativity and innovation.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/disciplines" className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700">Explore departments</Link>
              <Link href="/upload" className="rounded-lg border border-line bg-surface px-6 py-3 text-sm font-semibold hover:border-brand-500">Upload resources</Link>
            </div>
          </div>
        </Container>
      </section>

      <section aria-labelledby="projects-heading" className="py-16">
        <Container>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 id="projects-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">Featured engineering projects</h2>
              <p className="mt-2 text-muted">Innovative projects and final year projects shared by students.</p>
            </div>
            <Link href="/projects" className="hidden shrink-0 text-sm font-semibold text-brand-700 hover:underline sm:block">View all →</Link>
          </div>
          {featuredProjects.length === 0 ? (
            <div className="mt-8 rounded-xl border border-line bg-surface p-8 text-center">
              <p className="font-semibold">No projects shared yet</p>
              <p className="mt-2 text-sm text-muted">Be the first to showcase an innovative project or final year project.</p>
              <Link href="/upload" className="mt-4 inline-flex rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">Share your project</Link>
            </div>
          ) : (
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProjects.map((project) => (
                <li key={project.id} className="rounded-xl border border-line bg-surface p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">
                    {PROJECT_CATEGORIES.find((c) => c.value === project.category)?.label ?? project.category}
                  </p>
                  <h3 className="mt-1 font-semibold">
                    <Link href={`/projects/${project.id}`} className="hover:text-brand-700 hover:underline">
                      {project.title}
                    </Link>
                  </h3>
                  <p className="mt-2 text-sm text-muted">
                    {project.department_name ?? "Department"}
                    {project.uploader_name ? ` · Shared by ${project.uploader_name}` : ""}
                  </p>
                  <p className="mt-2 text-sm text-muted">
                    {project.download_count} download{project.download_count === 1 ? "" : "s"} ·{" "}
                    {project.view_count} view{project.view_count === 1 ? "" : "s"}
                  </p>
                  <Link href={`/projects/${project.id}`} className="mt-4 inline-block text-sm font-semibold text-brand-700 hover:underline">
                    View project →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </section>

      <section aria-labelledby="resources-heading" className="border-t border-line py-16">
        <Container>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 id="resources-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">Recently uploaded resources</h2>
              <p className="mt-2 text-muted">The latest papers and resources contributed by students.</p>
            </div>
            <Link href="/disciplines" className="hidden shrink-0 text-sm font-semibold text-brand-700 hover:underline sm:block">Browse departments →</Link>
          </div>
          {recentPapers.length === 0 ? (
            <div className="mt-8 rounded-xl border border-line bg-surface p-8 text-center">
              <p className="font-semibold">No resources uploaded yet</p>
              <p className="mt-2 text-sm text-muted">Be the first to share a past paper, lab report or notes with other students.</p>
              <Link href="/upload" className="mt-4 inline-flex rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">Upload a resource</Link>
            </div>
          ) : (
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentPapers.map((paper) => (
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
        </Container>
      </section>

      <section aria-labelledby="seminars-heading" className="border-t border-line py-16">
        <Container>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 id="seminars-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">Upcoming seminars</h2>
              <p className="mt-2 text-muted">Seminars, workshops and engineering events.</p>
            </div>
            <Link href="/seminars" className="hidden shrink-0 text-sm font-semibold text-brand-700 hover:underline sm:block">View all →</Link>
          </div>
          {upcomingEvents.length === 0 ? (
            <div className="mt-8 rounded-xl border border-line bg-surface p-8 text-center">
              <p className="font-semibold">No seminars announced yet</p>
              <p className="mt-2 text-sm text-muted">Seminar and event announcements will appear here once departments and students start sharing them.</p>
              <Link href="/seminars" className="mt-4 inline-flex rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">Seminars &amp; Events</Link>
            </div>
          ) : (
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {upcomingEvents.map((event) => (
                <li key={event.id} className="rounded-xl border border-line bg-surface p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">
                    {EVENT_TYPES.find((t) => t.value === event.event_type)?.label ?? event.event_type}
                  </p>
                  <h3 className="mt-1 font-semibold">
                    <Link href={`/seminars/${event.id}`} className="hover:text-brand-700 hover:underline">
                      {event.title}
                    </Link>
                  </h3>
                  <p className="mt-2 text-sm text-muted">{formatEventDateTime(event.starts_at)}</p>
                  <p className="mt-1 text-sm text-muted">
                    {event.venue ?? "Online"} · {event.organiser_department_name ?? event.organiser_name}
                  </p>
                  <Link href={`/seminars/${event.id}`} className="mt-4 inline-block text-sm font-semibold text-brand-700 hover:underline">
                    View event →
                  </Link>
                </li>
              ))}
            </ul>
          )}
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
                      <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">{kindLabel[d.kind]}</p>
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

      <section aria-labelledby="share-heading" className="py-16">
        <Container>
          <div className="rounded-2xl bg-brand-600 p-8 text-white sm:p-12">
            <h2 id="share-heading" className="text-2xl font-bold sm:text-3xl">Share what you know</h2>
            <p className="mt-3 max-w-2xl text-white/90">
              Upload past papers, lab reports, notes and projects to help other engineering students learn.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/upload" className="inline-flex rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand-600 hover:bg-brand-50">Upload resources</Link>
              <Link href="/disciplines" className="inline-flex rounded-lg border border-white/40 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10">Browse departments</Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
