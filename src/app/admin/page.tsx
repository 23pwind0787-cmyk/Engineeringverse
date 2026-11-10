import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Container } from "@/components/Container";
import {
  AdminDeletePaperButton,
  HideRemoveButtons,
  ModerateButtons,
  ReportActionButtons,
  RoleButton,
} from "@/components/AdminActions";
import { addCampus, addDepartment, addSemester, addSubject, deleteSubject } from "@/lib/actions/admin";
import { getCurrentAccount, isAdmin } from "@/lib/auth";
import { getPopularResources } from "@/lib/papers";
import { searchProjects } from "@/lib/projects";
import { getCampuses, getDepartments, getSemesters, getSubjects } from "@/lib/structure";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import type {
  ContentReport,
  ContentType,
  ContributorStat,
  ModerationLogEntry,
  Paper,
  Profile,
  Project,
  SiteEvent,
} from "@/lib/supabase/types";
import { REPORT_REASONS } from "@/lib/supabase/types";

export const instant = false;

export const metadata: Metadata = { title: "Admin dashboard", robots: { index: false, follow: false } };

const inputClass = "mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm";

const CONTENT_LABEL: Record<ContentType, string> = {
  paper: "Paper",
  project: "Project",
  event: "Event",
};

function detailHref(type: ContentType, id: string): string {
  if (type === "paper") return `/past-papers/${id}`;
  if (type === "project") return `/projects/${id}`;
  return `/seminars/${id}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

function reasonLabel(reason: string): string {
  return REPORT_REASONS.find((r) => r.value === reason)?.label ?? reason;
}

interface QueueItem {
  type: ContentType;
  id: string;
  title: string;
  uploaderName: string | null;
  detail: string;
  hidden: boolean;
  moderationNote: string | null;
  downloadCount: number;
  createdAt: string;
}

export default async function AdminPage() {
  const account = await getCurrentAccount();
  if (!account) redirect("/auth/sign-in?next=/admin");
  if (!isAdmin(account)) redirect("/dashboard");

  // Moderation reads MUST use the service-role client server-side:
  // there is no select policy letting the anon client read
  // pending / rejected / hidden rows (Phase 2 RLS gap).
  let service: ReturnType<typeof createServiceRoleClient> | null = null;
  try {
    service = createServiceRoleClient();
  } catch {
    service = null;
  }

  let papers: Paper[] = [];
  let projects: Project[] = [];
  let events: SiteEvent[] = [];
  let reports: ContentReport[] = [];
  let logEntries: ModerationLogEntry[] = [];
  let profiles: Profile[] = [];
  let contributors: ContributorStat[] = [];
  let totalStudents = 0;
  let totalDepartments = 0;
  let approvedPapers = 0;
  let approvedProjects = 0;
  let approvedEvents = 0;
  let pendingCount = 0;
  let openReports = 0;

  if (service) {
    const [
      paperRows,
      projectRows,
      eventRows,
      reportRows,
      logRows,
      profileRows,
      contributorRows,
      profileCount,
      departmentCount,
      approvedPaperCount,
      approvedProjectCount,
      approvedEventCount,
      pendingPaperCount,
      pendingProjectCount,
      pendingEventCount,
      openReportCount,
    ] = await Promise.all([
      service
        .from("papers")
        .select("id, uploader_id, title, subject_code, exam_type, year, status, hidden, moderation_note, download_count, created_at")
        .order("created_at", { ascending: false })
        .limit(200),
      service
        .from("projects")
        .select("id, uploader_id, title, category, status, hidden, moderation_note, download_count, created_at")
        .order("created_at", { ascending: false })
        .limit(100),
      service
        .from("events")
        .select("id, uploader_id, title, event_type, starts_at, status, hidden, moderation_note, created_at")
        .order("created_at", { ascending: false })
        .limit(100),
      service
        .from("content_reports")
        .select("id, content_type, content_id, reporter_id, reason, details, status, created_at")
        .order("created_at", { ascending: false })
        .limit(100),
      service
        .from("moderation_log")
        .select("id, admin_id, target_type, target_id, action, note, created_at")
        .order("created_at", { ascending: false })
        .limit(50),
      service
        .from("profiles")
        .select("id, email, display_name, role, created_at")
        .order("created_at", { ascending: true })
        .limit(200),
      service
        .from("contributor_stats")
        .select("user_id, display_name, avatar_url, period, approved_uploads, approved_projects, approved_research_uploads, total_downloads, top_department_id, top_department_name")
        .eq("period", "all_time")
        .order("approved_uploads", { ascending: false })
        .limit(10),
      service.from("profiles").select("id", { count: "exact", head: true }),
      service.from("departments").select("id", { count: "exact", head: true }),
      service.from("papers").select("id", { count: "exact", head: true }).eq("status", "approved"),
      service.from("projects").select("id", { count: "exact", head: true }).eq("status", "approved"),
      service.from("events").select("id", { count: "exact", head: true }).eq("status", "approved"),
      service.from("papers").select("id", { count: "exact", head: true }).eq("status", "pending"),
      service.from("projects").select("id", { count: "exact", head: true }).eq("status", "pending"),
      service.from("events").select("id", { count: "exact", head: true }).eq("status", "pending"),
      service.from("content_reports").select("id", { count: "exact", head: true }).eq("status", "open"),
    ]);
    papers = (paperRows.data ?? []) as Paper[];
    projects = (projectRows.data ?? []) as Project[];
    events = (eventRows.data ?? []) as SiteEvent[];
    reports = (reportRows.data ?? []) as ContentReport[];
    logEntries = (logRows.data ?? []) as ModerationLogEntry[];
    profiles = (profileRows.data ?? []) as Profile[];
    contributors = (contributorRows.data ?? []) as ContributorStat[];
    totalStudents = profileCount.count ?? 0;
    totalDepartments = departmentCount.count ?? 0;
    approvedPapers = approvedPaperCount.count ?? 0;
    approvedProjects = approvedProjectCount.count ?? 0;
    approvedEvents = approvedEventCount.count ?? 0;
    pendingCount =
      (pendingPaperCount.count ?? 0) + (pendingProjectCount.count ?? 0) + (pendingEventCount.count ?? 0);
    openReports = openReportCount.count ?? 0;
  }

  const [campuses, departments, semesters, subjects] = await Promise.all([
    getCampuses(),
    getDepartments(),
    getSemesters(),
    getSubjects(),
  ]);

  // Popular resources come from the public (approved, visible) listings.
  const [popularPapers, popularProjects] = await Promise.all([
    getPopularResources(10),
    searchProjects({ sort: "popular" }).then((list) => list.slice(0, 10)),
  ]);

  const nameOf = (userId: string | null): string | null => {
    if (!userId) return null;
    const profile = profiles.find((p) => p.id === userId);
    return profile ? (profile.display_name ?? profile.email) : null;
  };

  // Resolve report targets. content_id has no foreign key, so titles
  // are looked up per type; a missing target means it was removed.
  const titleMap = new Map<string, { type: ContentType; title: string }>();
  for (const p of papers) titleMap.set(p.id, { type: "paper", title: p.title });
  for (const p of projects) titleMap.set(p.id, { type: "project", title: p.title });
  for (const e of events) titleMap.set(e.id, { type: "event", title: e.title });
  if (service) {
    const svc = service;
    const missingByType: Record<ContentType, string[]> = { paper: [], project: [], event: [] };
    for (const report of reports) {
      if (!titleMap.has(report.content_id)) missingByType[report.content_type].push(report.content_id);
    }
    const lookups: Array<Promise<void>> = [];
    (Object.keys(missingByType) as ContentType[]).forEach((type) => {
      const ids = [...new Set(missingByType[type])];
      if (ids.length === 0) return;
      const table = type === "paper" ? "papers" : type === "project" ? "projects" : "events";
      lookups.push(
        (async () => {
          const { data } = await svc.from(table).select("id, title").in("id", ids);
          for (const row of (data ?? []) as Array<{ id: string; title: string }>) {
            titleMap.set(row.id, { type, title: row.title });
          }
        })(),
      );
    });
    await Promise.all(lookups);
  }
  const reportTitle = (report: ContentReport): string =>
    titleMap.get(report.content_id)?.title ?? "Content removed";

  const totalDownloads =
    papers.reduce((sum, p) => sum + (p.download_count ?? 0), 0) +
    projects.reduce((sum, p) => sum + (p.download_count ?? 0), 0);

  const toQueueItem = (type: ContentType, row: Paper | Project | SiteEvent, detail: string): QueueItem => ({
    type,
    id: row.id,
    title: row.title,
    uploaderName: nameOf(row.uploader_id),
    detail,
    hidden: row.hidden,
    moderationNote: row.moderation_note,
    downloadCount: "download_count" in row ? (row.download_count ?? 0) : 0,
    createdAt: row.created_at,
  });

  const pendingQueue: QueueItem[] = [
    ...papers
      .filter((p) => p.status === "pending")
      .map((p) =>
        toQueueItem("paper", p, [p.subject_code, p.exam_type, p.year].filter(Boolean).join(" · ")),
      ),
    ...projects
      .filter((p) => p.status === "pending")
      .map((p) => toQueueItem("project", p, p.category)),
    ...events
      .filter((e) => e.status === "pending")
      .map((e) => toQueueItem("event", e, `${e.event_type} · starts ${formatDate(e.starts_at)}`)),
  ].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  const decided = (status: "approved" | "rejected"): QueueItem[] =>
    [
      ...papers
        .filter((p) => p.status === status)
        .map((p) =>
          toQueueItem("paper", p, [p.subject_code, p.exam_type, p.year].filter(Boolean).join(" · ")),
        ),
      ...projects.filter((p) => p.status === status).map((p) => toQueueItem("project", p, p.category)),
      ...events
        .filter((e) => e.status === status)
        .map((e) => toQueueItem("event", e, `${e.event_type} · starts ${formatDate(e.starts_at)}`)),
    ]
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .slice(0, 20);

  const approvedItems = decided("approved");
  const rejectedItems = decided("rejected");
  const openReportList = reports.filter((r) => r.status === "open");
  const closedReportList = reports.filter((r) => r.status !== "open");

  const stats: Array<{ label: string; value: number }> = [
    { label: "Registered students", value: totalStudents },
    { label: "Approved resources", value: approvedPapers },
    { label: "Departments", value: totalDepartments },
    { label: "Total downloads", value: totalDownloads },
    { label: "Projects", value: approvedProjects },
    { label: "Seminars", value: approvedEvents },
    { label: "Pending approvals", value: pendingCount },
    { label: "Open reports", value: openReports },
  ];

  const renderQueueItem = (item: QueueItem, actions: ReactNode) => (
    <li
      key={`${item.type}-${item.id}`}
      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface p-4"
    >
      <span className="text-sm">
        <Link href={detailHref(item.type, item.id)} className="font-semibold hover:underline">
          {item.title}
        </Link>
        <span className="text-muted">
          {" "}
          — {CONTENT_LABEL[item.type]}
          {item.detail ? ` · ${item.detail}` : ""}
          {item.uploaderName ? ` · by ${item.uploaderName}` : ""}
          {item.hidden ? " · hidden" : ""} · {formatDate(item.createdAt)}
        </span>
        {item.moderationNote ? (
          <span className="mt-1 block text-muted">Note: {item.moderationNote}</span>
        ) : null}
      </span>
      <span className="flex flex-wrap gap-2">{actions}</span>
    </li>
  );

  return (
    <Container className="py-12 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Admin dashboard</h1>
      <p className="mt-3 text-muted">
        Admins can approve or reject submissions, hide or remove content,
        review reports, manage the university structure, and manage roles.
        Removing content deletes its files permanently. The last admin
        cannot be demoted.
      </p>
      {!service && (
        <p className="mt-6 rounded-xl border border-line bg-surface p-4 text-sm">
          Admin data could not be loaded: the service-role key is not
          configured on this deployment, so pending submissions, reports
          and the moderation log are unavailable here.
        </p>
      )}

      <section aria-labelledby="stats-heading" className="mt-12">
        <h2 id="stats-heading" className="text-xl font-bold">Overview</h2>
        <dl className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-line bg-surface p-4">
              <dt className="text-sm text-muted">{stat.label}</dt>
              <dd className="mt-1 text-2xl font-bold">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="pending-heading" className="mt-12">
        <h2 id="pending-heading" className="text-xl font-bold">
          Pending approvals ({pendingQueue.length})
        </h2>
        {pendingQueue.length === 0 ? (
          <p className="mt-2 text-muted">No pending submissions.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {pendingQueue.map((item) =>
              renderQueueItem(
                item,
                <ModerateButtons contentType={item.type} contentId={item.id} title={item.title} />,
              ),
            )}
          </ul>
        )}
      </section>

      <section aria-labelledby="approved-heading" className="mt-12">
        <h2 id="approved-heading" className="text-xl font-bold">
          Recently approved ({approvedItems.length})
        </h2>
        {approvedItems.length === 0 ? (
          <p className="mt-2 text-muted">No approved content yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {approvedItems.map((item) =>
              renderQueueItem(
                item,
                <HideRemoveButtons
                  contentType={item.type}
                  contentId={item.id}
                  title={item.title}
                  hidden={item.hidden}
                />,
              ),
            )}
          </ul>
        )}
      </section>

      <section aria-labelledby="rejected-heading" className="mt-12">
        <h2 id="rejected-heading" className="text-xl font-bold">
          Recently rejected ({rejectedItems.length})
        </h2>
        {rejectedItems.length === 0 ? (
          <p className="mt-2 text-muted">No rejected submissions.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {rejectedItems.map((item) =>
              renderQueueItem(
                item,
                <HideRemoveButtons
                  contentType={item.type}
                  contentId={item.id}
                  title={item.title}
                  hidden={item.hidden}
                />,
              ),
            )}
          </ul>
        )}
      </section>

      <section aria-labelledby="reports-heading" className="mt-12">
        <h2 id="reports-heading" className="text-xl font-bold">
          Open reports ({openReportList.length})
        </h2>
        {openReportList.length === 0 ? (
          <p className="mt-2 text-muted">No open reports.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {openReportList.map((report) => {
              const target = titleMap.get(report.content_id);
              return (
                <li key={report.id} className="rounded-xl border border-line bg-surface p-4 text-sm">
                  <p>
                    <span className="font-medium">{CONTENT_LABEL[report.content_type]}:</span>{" "}
                    {target ? (
                      <Link href={detailHref(report.content_type, report.content_id)} className="font-semibold hover:underline">
                        {reportTitle(report)}
                      </Link>
                    ) : (
                      reportTitle(report)
                    )}
                  </p>
                  <p className="mt-1">
                    <span className="font-medium">Reason:</span> {reasonLabel(report.reason)}
                  </p>
                  {report.details ? (
                    <p className="mt-1">
                      <span className="font-medium">Details:</span> {report.details}
                    </p>
                  ) : null}
                  <p className="mt-1 text-muted">
                    Reported by {nameOf(report.reporter_id) ?? "Unknown"} · {formatDate(report.created_at)}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <ReportActionButtons reportId={report.id} />
                    {target && (
                      <HideRemoveButtons
                        contentType={report.content_type}
                        contentId={report.content_id}
                        title={reportTitle(report)}
                        hidden={false}
                      />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <h3 className="mt-8 font-semibold">Resolved / dismissed reports ({closedReportList.length})</h3>
        {closedReportList.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No resolved or dismissed reports yet.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {closedReportList.map((report) => (
              <li key={report.id} className="rounded-xl border border-line bg-surface p-4 text-sm">
                <p>
                  <span className="font-medium">{CONTENT_LABEL[report.content_type]}:</span> {reportTitle(report)}
                </p>
                <p className="mt-1">
                  <span className="font-medium">Reason:</span> {reasonLabel(report.reason)}
                </p>
                <p className="mt-1 text-muted">
                  Status: {report.status} · Reported by {nameOf(report.reporter_id) ?? "Unknown"} ·{" "}
                  {formatDate(report.created_at)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="log-heading" className="mt-12">
        <h2 id="log-heading" className="text-xl font-bold">Moderation log ({logEntries.length})</h2>
        {logEntries.length === 0 ? (
          <p className="mt-2 text-muted">No moderation actions recorded yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {logEntries.map((entry) => (
              <li key={entry.id} className="rounded-xl border border-line bg-surface p-4 text-sm">
                <p>
                  <span className="font-medium">{nameOf(entry.admin_id) ?? "Admin"}</span>{" "}
                  <span className="text-muted">
                    {entry.action} {entry.target_type}{" "}
                    {titleMap.get(entry.target_id)?.title ?? `(${entry.target_id.slice(0, 8)}…)`} ·{" "}
                    {formatDate(entry.created_at)}
                  </span>
                </p>
                {entry.note ? <p className="mt-1 text-muted">Note: {entry.note}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="popular-heading" className="mt-12">
        <h2 id="popular-heading" className="text-xl font-bold">Popular resources</h2>
        {popularPapers.length === 0 && popularProjects.length === 0 ? (
          <p className="mt-2 text-muted">No downloads recorded yet.</p>
        ) : (
          <div className="mt-4 grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="font-semibold">Top papers by downloads</h3>
              {popularPapers.length === 0 ? (
                <p className="mt-2 text-sm text-muted">No papers downloaded yet.</p>
              ) : (
                <ol className="mt-3 space-y-2">
                  {popularPapers.map((paper, index) => (
                    <li key={paper.id} className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface px-4 py-2 text-sm">
                      <span>
                        {index + 1}.{" "}
                        <Link href={`/past-papers/${paper.id}`} className="font-medium hover:underline">
                          {paper.title}
                        </Link>
                      </span>
                      <span className="text-muted">{paper.download_count} downloads</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
            <div>
              <h3 className="font-semibold">Top projects by downloads</h3>
              {popularProjects.length === 0 ? (
                <p className="mt-2 text-sm text-muted">No projects downloaded yet.</p>
              ) : (
                <ol className="mt-3 space-y-2">
                  {popularProjects.map((project, index) => (
                    <li key={project.id} className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface px-4 py-2 text-sm">
                      <span>
                        {index + 1}.{" "}
                        <Link href={`/projects/${project.id}`} className="font-medium hover:underline">
                          {project.title}
                        </Link>
                      </span>
                      <span className="text-muted">{project.download_count} downloads</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        )}
      </section>

      <section aria-labelledby="contributors-heading" className="mt-12">
        <h2 id="contributors-heading" className="text-xl font-bold">Contributor rankings (all time)</h2>
        {contributors.length === 0 ? (
          <p className="mt-2 text-muted">No contributors yet — rankings appear once approved uploads exist.</p>
        ) : (
          <ol className="mt-4 space-y-2">
            {contributors.map((contributor, index) => (
              <li key={contributor.user_id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-sm">
                <span>
                  <span className="font-semibold">{index + 1}. {contributor.display_name ?? "Unnamed contributor"}</span>
                  {contributor.top_department_name ? (
                    <span className="text-muted"> · {contributor.top_department_name}</span>
                  ) : null}
                </span>
                <span className="text-muted">
                  {contributor.approved_uploads} approved uploads · {contributor.total_downloads} downloads
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section aria-labelledby="papers-heading" className="mt-12">
        <h2 id="papers-heading" className="text-xl font-bold">All papers ({papers.length})</h2>
        {papers.length === 0 ? (
          <p className="mt-2 text-muted">No papers published yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {papers.map((paper) => (
              <li key={paper.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface p-4">
                <span className="text-sm">
                  <Link href={`/past-papers/${paper.id}`} className="font-semibold hover:underline">{paper.title}</Link>
                  <span className="text-muted"> — {paper.subject_code} · {paper.exam_type} {paper.year} · {paper.download_count} downloads · {paper.status}{paper.hidden ? " · hidden" : ""}</span>
                </span>
                <AdminDeletePaperButton paperId={paper.id} title={paper.title} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="structure-heading" className="mt-12">
        <h2 id="structure-heading" className="text-xl font-bold">Manage structure</h2>
        <p className="mt-2 text-sm text-muted">
          Departments, semesters and subjects are configurable here. No
          subjects are seeded by default — add only real subjects with
          their official codes.
        </p>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <form action={addCampus} className="space-y-3 rounded-xl border border-line bg-surface p-5">
            <h3 className="font-semibold">Add campus</h3>
            <div><label htmlFor="campus-name" className="text-sm font-medium">Name</label><input id="campus-name" name="name" required className={inputClass} /></div>
            <div><label htmlFor="campus-slug" className="text-sm font-medium">Slug</label><input id="campus-slug" name="slug" required className={inputClass} placeholder="e.g. peshawar" /></div>
            <button type="submit" className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">Add campus</button>
          </form>
          <form action={addDepartment} className="space-y-3 rounded-xl border border-line bg-surface p-5">
            <h3 className="font-semibold">Add department / centre / programme</h3>
            <div><label htmlFor="dept-name" className="text-sm font-medium">Name</label><input id="dept-name" name="name" required className={inputClass} /></div>
            <div><label htmlFor="dept-slug" className="text-sm font-medium">Slug</label><input id="dept-slug" name="slug" required className={inputClass} placeholder="e.g. electrical-peshawar" /></div>
            <div>
              <label htmlFor="dept-campus" className="text-sm font-medium">Campus</label>
              <select id="dept-campus" name="campus_id" required className={inputClass} defaultValue="">
                <option value="" disabled>Choose…</option>
                {campuses.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </div>
            <div>
              <label htmlFor="dept-kind" className="text-sm font-medium">Kind</label>
              <select id="dept-kind" name="kind" required className={inputClass} defaultValue="department">
                <option value="department">Department</option><option value="centre">Centre</option><option value="programme">Programme</option>
              </select>
            </div>
            <button type="submit" className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">Add entry</button>
          </form>
          <form action={addSemester} className="space-y-3 rounded-xl border border-line bg-surface p-5">
            <h3 className="font-semibold">Add semester</h3>
            <div><label htmlFor="sem-number" className="text-sm font-medium">Number (1–12)</label><input id="sem-number" name="number" type="number" min={1} max={12} required className={inputClass} /></div>
            <div><label htmlFor="sem-label" className="text-sm font-medium">Label</label><input id="sem-label" name="label" required className={inputClass} placeholder="e.g. Semester 9" /></div>
            <button type="submit" className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">Add semester</button>
          </form>
          <form action={addSubject} className="space-y-3 rounded-xl border border-line bg-surface p-5">
            <h3 className="font-semibold">Add subject</h3>
            <div>
              <label htmlFor="subj-dept" className="text-sm font-medium">Department</label>
              <select id="subj-dept" name="department_id" required className={inputClass} defaultValue="">
                <option value="" disabled>Choose…</option>
                {departments.map((d) => (<option key={d.id} value={d.id}>{d.name}</option>))}
              </select>
            </div>
            <div>
              <label htmlFor="subj-sem" className="text-sm font-medium">Semester</label>
              <select id="subj-sem" name="semester_id" required className={inputClass} defaultValue="">
                <option value="" disabled>Choose…</option>
                {semesters.map((s) => (<option key={s.id} value={s.id}>{s.label}</option>))}
              </select>
            </div>
            <div><label htmlFor="subj-code" className="text-sm font-medium">Subject code</label><input id="subj-code" name="code" required className={inputClass} placeholder="e.g. IE-472" /></div>
            <div><label htmlFor="subj-name" className="text-sm font-medium">Subject name</label><input id="subj-name" name="name" required className={inputClass} /></div>
            <button type="submit" className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">Add subject</button>
          </form>
        </div>

        <h3 className="mt-8 font-semibold">Subjects ({subjects.length})</h3>
        {subjects.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No subjects added yet. This is expected: subjects are added by admins, never invented.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {subjects.map((subject) => (
              <li key={subject.id} className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface px-4 py-2 text-sm">
                <span>{subject.name} ({subject.code})</span>
                <form action={deleteSubject.bind(null, subject.id)}>
                  <button type="submit" className="font-semibold text-brand-700 hover:underline">Delete</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="users-heading" className="mt-12">
        <h2 id="users-heading" className="text-xl font-bold">Users and roles ({profiles.length})</h2>
        {profiles.length === 0 ? (
          <p className="mt-2 text-muted">No users yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {profiles.map((profile) => (
              <li key={profile.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface p-4 text-sm">
                <span>
                  <span className="font-medium">{profile.display_name ?? profile.email}</span>
                  <span className="text-muted"> — {profile.email} · {profile.role}</span>
                </span>
                <RoleButton userId={profile.id} currentRole={profile.role} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </Container>
  );
}
