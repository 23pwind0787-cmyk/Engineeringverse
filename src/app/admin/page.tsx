import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { AdminDeletePaperButton, ReportActionButtons, RoleButton } from "@/components/AdminActions";
import { addCampus, addDepartment, addSemester, addSubject, deleteSubject } from "@/lib/actions/admin";
import { getCurrentAccount, isAdmin } from "@/lib/auth";
import { getCampuses, getDepartments, getSemesters, getSubjects } from "@/lib/structure";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Paper, PaperReport, Profile } from "@/lib/supabase/types";

export const instant = false;

export const metadata: Metadata = { title: "Admin dashboard" };

const inputClass = "mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm";

export default async function AdminPage() {
  const account = await getCurrentAccount();
  if (!account) redirect("/auth/sign-in?next=/admin");
  if (!isAdmin(account)) redirect("/dashboard");

  const supabase = await createServerSupabaseClient();
  let papers: Paper[] = [];
  let reports: PaperReport[] = [];
  let profiles: Profile[] = [];
  if (supabase) {
    const { data: paperData } = await supabase
      .from("papers")
      .select("id, uploader_id, campus_id, department_id, semester_id, subject_id, title, subject_code, exam_type, year, session, storage_path, file_size, page_count, download_count, status, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    papers = (paperData ?? []) as Paper[];
    const { data: reportData } = await supabase
      .from("paper_reports")
      .select("id, paper_id, reporter_id, reason, status, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    reports = (reportData ?? []) as PaperReport[];
    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, email, display_name, role, created_at")
      .order("created_at", { ascending: true })
      .limit(100);
    profiles = (profileData ?? []) as Profile[];
  }
  const [campuses, departments, semesters, subjects] = await Promise.all([
    getCampuses(),
    getDepartments(),
    getSemesters(),
    getSubjects(),
  ]);
  const paperTitle = (id: string) => papers.find((p) => p.id === id)?.title ?? id;

  return (
    <Container className="py-12 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Admin dashboard</h1>
      <p className="mt-3 text-muted">
        Admins can remove papers, review reports, manage the university
        structure, and manage roles. Removing a paper deletes its file
        permanently. The last admin cannot be demoted.
      </p>

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
                  <span className="text-muted"> — {paper.subject_code} · {paper.exam_type} {paper.year} · {paper.download_count} downloads</span>
                </span>
                <AdminDeletePaperButton paperId={paper.id} title={paper.title} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="reports-heading" className="mt-12">
        <h2 id="reports-heading" className="text-xl font-bold">Reports ({reports.length})</h2>
        {reports.length === 0 ? (
          <p className="mt-2 text-muted">No reports yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {reports.map((report) => (
              <li key={report.id} className="rounded-xl border border-line bg-surface p-4 text-sm">
                <p><span className="font-medium">Paper:</span> {paperTitle(report.paper_id)}</p>
                <p className="mt-1"><span className="font-medium">Reason:</span> {report.reason}</p>
                <p className="mt-1 text-muted">Status: {report.status} · {new Date(report.created_at).toLocaleString()}</p>
                {report.status === "open" && (
                  <div className="mt-3"><ReportActionButtons reportId={report.id} /></div>
                )}
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
