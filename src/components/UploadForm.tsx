"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateOwnPaper, uploadPaper } from "@/lib/actions/papers";
import { EventForm } from "@/components/EventForm";
import { ProjectForm } from "@/components/ProjectForm";
import {
  RESOURCE_CATEGORIES,
  type Campus,
  type DepartmentRow,
  type Paper,
  type SemesterRow,
  type SubjectRow,
} from "@/lib/supabase/types";

const selectClass = "mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm";

type UploadKind = "resource" | "project" | "event";

const KIND_OPTIONS: Array<{ value: UploadKind; label: string; hint: string }> = [
  { value: "resource", label: "Academic resource", hint: "Past papers, OELs, lab reports, books, notes" },
  { value: "project", label: "Project", hint: "Final year, research or innovation projects" },
  { value: "event", label: "Seminar / event", hint: "Seminars, workshops, webinars and visits" },
];

export function UploadForm({
  campuses,
  departments,
  semesters,
  subjects,
}: {
  campuses: Campus[];
  departments: DepartmentRow[];
  semesters: SemesterRow[];
  subjects: SubjectRow[];
}) {
  const [kind, setKind] = useState<UploadKind>("resource");
  const [category, setCategory] = useState("past_paper");
  const [campusId, setCampusId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [success, setSuccess] = useState<{
    duplicate?: { id: string; title: string; category: string; status: string } | null;
  } | null>(null);

  const isPastPaper = category === "past_paper";
  const visibleDepartments = departments.filter((d) => !campusId || d.campus_id === campusId);
  const visibleSubjects = subjects.filter(
    (s) => (!departmentId || s.department_id === departmentId) && (!semesterId || s.semester_id === semesterId),
  );

  async function onSubmitResource(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    const result = await uploadPaper(new FormData(event.currentTarget));
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSuccess({ duplicate: result.duplicate ?? null });
  }

  function resetResourceForm() {
    setSuccess(null);
    setError(null);
    setCampusId("");
    setDepartmentId("");
    setSemesterId("");
    setSubjectId("");
    setFormKey((k) => k + 1);
  }

  return (
    <div className="mt-8 max-w-2xl">
      <fieldset>
        <legend className="text-sm font-medium">What are you uploading?</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-3" role="group" aria-label="Upload type">
          {KIND_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={kind === option.value}
              onClick={() => setKind(option.value)}
              className={`rounded-xl border px-4 py-3 text-left text-sm ${
                kind === option.value
                  ? "border-brand-500 bg-surface font-semibold"
                  : "border-line bg-surface hover:border-brand-500"
              }`}
            >
              {option.label}
              <span className="mt-1 block text-xs font-normal text-muted">{option.hint}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm">
        <p className="font-semibold">Copyright: only share what you have the right to share</p>
        <p className="mt-1">
          Upload only your own work, or material you have permission to share.
          Do not upload pirated books or any copyrighted material without the
          rights holder&apos;s permission. Submissions that break this rule are
          rejected and may lead to your account being restricted.
        </p>
      </div>

      {kind === "project" && <ProjectForm campuses={campuses} departments={departments} />}
      {kind === "event" && <EventForm departments={departments} />}

      {kind === "resource" && success && (
        <div role="status" className="mt-6 rounded-xl border border-line bg-surface p-5">
          <h2 className="font-semibold">Your submission is waiting for admin approval</h2>
          <p className="mt-2 text-sm text-muted">
            It will appear publicly once approved. If an admin rejects it, the
            reason will be shown on your dashboard.
          </p>
          {success.duplicate && (
            <p className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm">
              A very similar file is already on the site:{" "}
              <Link
                href={`/past-papers/${success.duplicate.id}`}
                className="font-semibold text-brand-700 hover:underline"
              >
                {success.duplicate.title}
              </Link>{" "}
              ({success.duplicate.status}). Your upload was still saved for review.
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={resetResourceForm}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Upload another resource
            </button>
            <Link
              href="/dashboard"
              className="rounded-lg border border-line px-4 py-2 text-sm font-semibold hover:border-brand-500"
            >
              Go to your dashboard
            </Link>
          </div>
        </div>
      )}

      {kind === "resource" && !success && (
        <form
          key={formKey}
          onSubmit={onSubmitResource}
          className="mt-6 space-y-4"
          aria-label="Upload an academic resource"
        >
          <div>
            <label htmlFor="category" className="text-sm font-medium">Resource category</label>
            <select
              id="category"
              name="category"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={selectClass}
            >
              {RESOURCE_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="title" className="text-sm font-medium">Title</label>
            <input
              id="title"
              name="title"
              required
              className={selectClass}
              placeholder={isPastPaper ? "e.g. Design of Experiment — Final Examination" : "e.g. Fluid Mechanics lab manual"}
            />
          </div>
          <div>
            <label htmlFor="description" className="text-sm font-medium">Short description</label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className={selectClass}
              placeholder="What is this resource, and who is it useful for?"
            />
          </div>
          <div>
            <label htmlFor="file" className="text-sm font-medium">PDF file (max 20 MB)</label>
            <input id="file" name="file" type="file" accept=".pdf,application/pdf" required className={selectClass} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="campus_id" className="text-sm font-medium">Campus</label>
              <select id="campus_id" name="campus_id" required value={campusId} onChange={(e) => { setCampusId(e.target.value); setDepartmentId(""); }} className={selectClass}>
                <option value="">Choose…</option>
                {campuses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="department_id" className="text-sm font-medium">Department / programme</label>
              <select id="department_id" name="department_id" required value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className={selectClass}>
                <option value="">Choose…</option>
                {visibleDepartments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          {isPastPaper && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="semester_id" className="text-sm font-medium">Semester</label>
                <select id="semester_id" name="semester_id" required value={semesterId} onChange={(e) => setSemesterId(e.target.value)} className={selectClass}>
                  <option value="">Choose…</option>
                  {semesters.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="subject_id" className="text-sm font-medium">Subject (optional — only listed subjects appear)</label>
                <select id="subject_id" name="subject_id" value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className={selectClass}>
                  <option value="">No subject selected</option>
                  {visibleSubjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-muted">If your subject is not listed, leave this empty and enter its code below. Admins add subjects in the admin dashboard.</p>
              </div>
              <div>
                <label htmlFor="subject_code" className="text-sm font-medium">Subject code</label>
                <input id="subject_code" name="subject_code" required className={selectClass} placeholder="e.g. IE-472" />
              </div>
              <div>
                <label htmlFor="exam_type" className="text-sm font-medium">Exam type</label>
                <select id="exam_type" name="exam_type" required className={selectClass} defaultValue="">
                  <option value="" disabled>Choose…</option>
                  <option>Mid</option><option>Final</option><option>Quiz</option><option>Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="year" className="text-sm font-medium">Year</label>
                <input id="year" name="year" type="number" required min={1950} max={2100} className={selectClass} placeholder="e.g. 2025" />
              </div>
              <div>
                <label htmlFor="session" className="text-sm font-medium">Session</label>
                <select id="session" name="session" required className={selectClass} defaultValue="">
                  <option value="" disabled>Choose…</option>
                  <option>Spring</option><option>Fall</option><option>Summer</option><option>Annual</option>
                </select>
              </div>
            </div>
          )}

          <p className="text-sm text-muted">
            By uploading, you confirm this resource may be shared publicly and
            is not someone else&apos;s copyrighted material you have no right
            to share. It is checked on the server and reviewed by an admin
            before it appears publicly.
          </p>
          {error && (
            <p role="alert" className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm">{error}</p>
          )}
          <button type="submit" disabled={busy} className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
            {busy ? "Uploading…" : "Submit for review"}
          </button>
        </form>
      )}
    </div>
  );
}

/**
 * Edit form for one of the owner's own pending resources. Used by
 * /dashboard/resources/[id]/edit. Only the title, description and —
 * for past papers — the exam fields can change; the file itself and
 * the campus/department stay as submitted.
 */
export function PaperEditForm({ paper }: { paper: Paper }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const isPastPaper = paper.category === "past_paper";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    const result = await updateOwnPaper(new FormData(event.currentTarget));
    setBusy(false);
    if (!result.ok) setError(result.error);
    else router.push("/dashboard");
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 max-w-2xl space-y-4" aria-label="Edit resource">
      <input type="hidden" name="paper_id" value={paper.id} />
      <div>
        <label htmlFor="edit-title" className="text-sm font-medium">Title</label>
        <input id="edit-title" name="title" required defaultValue={paper.title} className={selectClass} />
      </div>
      <div>
        <label htmlFor="edit-description" className="text-sm font-medium">Short description</label>
        <textarea id="edit-description" name="description" rows={3} defaultValue={paper.description ?? ""} className={selectClass} />
      </div>
      {isPastPaper && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="edit-subject_code" className="text-sm font-medium">Subject code</label>
            <input id="edit-subject_code" name="subject_code" required defaultValue={paper.subject_code ?? ""} className={selectClass} />
          </div>
          <div>
            <label htmlFor="edit-exam_type" className="text-sm font-medium">Exam type</label>
            <select id="edit-exam_type" name="exam_type" required defaultValue={paper.exam_type ?? ""} className={selectClass}>
              <option value="" disabled>Choose…</option>
              <option>Mid</option><option>Final</option><option>Quiz</option><option>Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="edit-year" className="text-sm font-medium">Year</label>
            <input id="edit-year" name="year" type="number" required min={1950} max={2100} defaultValue={paper.year ?? ""} className={selectClass} />
          </div>
          <div>
            <label htmlFor="edit-session" className="text-sm font-medium">Session</label>
            <select id="edit-session" name="session" required defaultValue={paper.session ?? ""} className={selectClass}>
              <option value="" disabled>Choose…</option>
              <option>Spring</option><option>Fall</option><option>Summer</option><option>Annual</option>
            </select>
          </div>
        </div>
      )}
      <p className="text-sm text-muted">
        Only pending submissions can be edited. Your changes go back to the
        admin queue — the file itself cannot be replaced here; delete the
        submission and upload again if the file is wrong.
      </p>
      {error && (
        <p role="alert" className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm">{error}</p>
      )}
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={busy} className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
          {busy ? "Saving…" : "Save changes"}
        </button>
        <Link href="/dashboard" className="rounded-lg border border-line px-6 py-3 text-sm font-semibold hover:border-brand-500">
          Cancel
        </Link>
      </div>
    </form>
  );
}
