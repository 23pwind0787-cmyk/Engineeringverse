import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { searchProjects } from "@/lib/projects";
import { getDepartments } from "@/lib/structure";
import { PROJECT_CATEGORIES, type Project, type ProjectCategory } from "@/lib/supabase/types";

export const instant = false;

export const metadata: Metadata = {
  title: "Innovative Projects & FYPs",
  description:
    "Final year projects, research, robotics, AI, industrial automation and student innovations from UET Peshawar — shared by students, with reports, images and outcomes.",
  alternates: { canonical: "https://engineeringverse.me/projects" },
};

function isProjectCategory(value: string | undefined): value is ProjectCategory {
  return Boolean(value && PROJECT_CATEGORIES.some((c) => c.value === value));
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
        <h2 className="text-lg font-semibold">{project.title}</h2>
        <p className="flex-1 text-sm text-muted">{project.description}</p>
        <p className="text-sm text-muted">
          {project.department_name ?? ""}
          {project.team_members.length > 0 ? ` · Team of ${project.team_members.length}` : ""}
          {project.uploader_name ? ` · Shared by ${project.uploader_name}` : ""}
        </p>
        {project.tools.length > 0 && (
          <p className="flex flex-wrap gap-2">
            {project.tools.map((tool) => (
              <span key={tool} className="rounded-full bg-surface-alt px-2.5 py-0.5 text-xs text-muted">
                {tool}
              </span>
            ))}
          </p>
        )}
        <p className="text-sm text-muted">
          {new Date(project.created_at).toLocaleDateString()}
          {` · ${project.download_count} download${project.download_count === 1 ? "" : "s"}`}
          {` · ${project.view_count} view${project.view_count === 1 ? "" : "s"}`}
        </p>
      </Link>
    </li>
  );
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; department?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ? params.q.trim() : undefined;
  const category = isProjectCategory(params.category) ? params.category : undefined;
  const departmentId = params.department?.trim() ? params.department.trim() : undefined;
  const sort: "recent" | "popular" = params.sort === "popular" ? "popular" : "recent";

  const [projects, departments] = await Promise.all([
    searchProjects({ query, category, departmentId, sort }),
    getDepartments(),
  ]);
  const hasFilters = Boolean(query || category || departmentId || sort === "popular");

  return (
    <Container className="py-12 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Innovative Projects &amp; FYPs</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Final year projects, research, robotics, AI, industrial automation and
        student innovations from every department — shared by students, with
        reports, images and outcomes.
      </p>

      <form method="get" action="/projects" className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor="q" className="text-sm font-medium">Search</label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={query ?? ""}
            placeholder="Search project titles and descriptions…"
            className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="category" className="text-sm font-medium">Category</label>
          <select id="category" name="category" defaultValue={category ?? ""} className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm sm:w-auto">
            <option value="">All categories</option>
            {PROJECT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="department" className="text-sm font-medium">Department</label>
          <select id="department" name="department" defaultValue={departmentId ?? ""} className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm sm:w-auto">
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="sort" className="text-sm font-medium">Sort</label>
          <select id="sort" name="sort" defaultValue={sort} className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm sm:w-auto">
            <option value="recent">Most recent</option>
            <option value="popular">Most downloaded</option>
          </select>
        </div>
        <button type="submit" className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          Apply filters
        </button>
      </form>

      <p className="mt-8 text-sm">
        <Link href="/projects/new" className="font-semibold text-brand-700 hover:underline">
          Submit your project →
        </Link>
      </p>

      {projects.length === 0 ? (
        <div className="mt-8 max-w-2xl rounded-xl border border-line bg-surface p-6">
          <h2 className="text-lg font-semibold">
            {hasFilters ? "No projects match these filters" : "No projects published yet"}
          </h2>
          <p className="mt-2 text-sm text-muted">
            {hasFilters
              ? "Try a different search or clear the filters — approved projects will appear here once they are published."
              : "No projects have been approved and published yet. Be the first to share one — final year projects, research, robotics, AI and student innovations are all welcome."}
          </p>
          <p className="mt-4 text-sm">
            {hasFilters ? (
              <Link href="/projects" className="font-semibold text-brand-700 hover:underline">
                Clear filters
              </Link>
            ) : (
              <Link href="/projects/new" className="font-semibold text-brand-700 hover:underline">
                Submit a project
              </Link>
            )}
          </p>
        </div>
      ) : (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </ul>
      )}
    </Container>
  );
}
