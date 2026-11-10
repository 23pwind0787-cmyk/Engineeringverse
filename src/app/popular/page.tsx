import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { ResourceCard } from "@/components/ResourceCard";
import { searchPapers } from "@/lib/papers";
import { searchProjects } from "@/lib/projects";
import { getDepartments } from "@/lib/structure";
import { PROJECT_CATEGORIES, type Paper, type Project } from "@/lib/supabase/types";

export const instant = false;

export const metadata: Metadata = {
  title: "Popular Resources",
  description:
    "The most downloaded past papers, OEL reports, lab reports, PDF books, notes, FYP reports and innovative projects on EngineeringVerse — ranked by real downloads and views.",
  alternates: { canonical: "https://engineeringverse.me/popular" },
};

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

function PaperSection({
  id,
  title,
  description,
  papers,
}: {
  id: string;
  title: string;
  description: string;
  papers: Paper[];
}) {
  return (
    <section aria-labelledby={`${id}-heading`} className="mt-12">
      <h2 id={`${id}-heading`} className="text-2xl font-bold tracking-tight">
        {title}
      </h2>
      <p className="mt-1 text-sm text-muted">{description}</p>
      {papers.length === 0 ? (
        <p className="mt-4 rounded-xl border border-line bg-surface p-5 text-sm text-muted">
          Nothing here yet — no approved {title.toLowerCase()} have been published yet.
        </p>
      ) : (
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {papers.map((paper) => (
            <li key={paper.id}>
              <ResourceCard paper={paper} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function PopularPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; department?: string }>;
}) {
  const params = await searchParams;
  const sort: "recent" | "popular" = params.sort === "recent" ? "recent" : "popular";
  const departmentId = params.department?.trim() ? params.department.trim() : undefined;

  const [departments, pastPapers, oelPapers, labPapers, books, notes, fypPapers, projects] =
    await Promise.all([
      getDepartments(),
      searchPapers({ category: "past_paper", sort, departmentId }),
      searchPapers({ category: "oel", sort, departmentId }),
      searchPapers({ category: "lab_report", sort, departmentId }),
      searchPapers({ category: "book", sort, departmentId }),
      searchPapers({ category: "assignment_notes", sort, departmentId }),
      searchPapers({ category: "fyp", sort, departmentId }),
      searchProjects({ sort, departmentId }),
    ]);

  // "Most viewed" is a view-count ranking, not a download ranking.
  const mostViewedLabReports = [...labPapers]
    .sort((a, b) => b.view_count - a.view_count)
    .slice(0, 6);

  // Books and notes share one section, ranked together.
  const booksAndNotes = [...books, ...notes]
    .sort((a, b) =>
      sort === "popular"
        ? b.download_count - a.download_count
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 6);

  const selectedDepartment = departments.find((d) => d.id === departmentId);

  return (
    <Container className="py-12 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Popular Resources</h1>
      <p className="mt-3 max-w-2xl text-muted">
        The resources students actually download and read — ranked by real
        download and view counts from approved, visible uploads. Nothing
        here is seeded or estimated.
        {selectedDepartment ? ` Showing ${selectedDepartment.name}.` : ""}
      </p>

      <form
        method="get"
        action="/popular"
        className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end"
        aria-label="Filter popular resources"
      >
        <div>
          <label htmlFor="department" className="text-sm font-medium">Department</label>
          <select
            id="department"
            name="department"
            defaultValue={departmentId ?? ""}
            className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm sm:w-auto"
          >
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="sort" className="text-sm font-medium">Sort</label>
          <select
            id="sort"
            name="sort"
            defaultValue={sort}
            className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm sm:w-auto"
          >
            <option value="popular">Most downloaded</option>
            <option value="recent">Most recent</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Apply filters
        </button>
        {departmentId && (
          <Link href="/popular" className="text-sm font-medium text-brand-700 hover:underline">
            Clear filters
          </Link>
        )}
      </form>

      <PaperSection
        id="past-papers"
        title="Most downloaded past papers"
        description="Past papers students keep coming back to, ranked by downloads."
        papers={pastPapers.slice(0, 6)}
      />

      <PaperSection
        id="oel"
        title="Popular OEL reports"
        description="Open-ended lab reports ranked by downloads."
        papers={oelPapers.slice(0, 6)}
      />

      <PaperSection
        id="lab-reports"
        title="Most viewed lab reports"
        description="Lab reports ranked by views — the ones students open most."
        papers={mostViewedLabReports}
      />

      <PaperSection
        id="books-notes"
        title="Popular PDF books and notes"
        description="Books, assignments and notes ranked by downloads."
        papers={booksAndNotes}
      />

      <PaperSection
        id="fyp"
        title="Trending FYP reports"
        description="Final year project reports ranked by downloads."
        papers={fypPapers.slice(0, 6)}
      />

      <section aria-labelledby="projects-heading" className="mt-12">
        <h2 id="projects-heading" className="text-2xl font-bold tracking-tight">
          Most popular innovative projects
        </h2>
        <p className="mt-1 text-sm text-muted">
          Student projects ranked by downloads — reports, images and outcomes included.
        </p>
        {projects.length === 0 ? (
          <p className="mt-4 rounded-xl border border-line bg-surface p-5 text-sm text-muted">
            Nothing here yet — no approved projects have been published
            {selectedDepartment ? " in this department" : ""}.
          </p>
        ) : (
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.slice(0, 6).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </ul>
        )}
      </section>

      <p className="mt-12 text-sm text-muted">
        Every item links to its detail page, where you can preview it and
        download the file. Counts update as students download and view
        resources.{" "}
        <Link href="/community" className="font-medium text-brand-700 hover:underline">
          Back to Community →
        </Link>
      </p>
    </Container>
  );
}
