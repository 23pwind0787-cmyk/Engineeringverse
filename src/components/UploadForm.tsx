"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadPaper } from "@/lib/actions/papers";
import type { Campus, DepartmentRow, SemesterRow, SubjectRow } from "@/lib/supabase/types";

const selectClass = "mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm";

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
  const router = useRouter();
  const [campusId, setCampusId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const visibleDepartments = departments.filter((d) => !campusId || d.campus_id === campusId);
  const visibleSubjects = subjects.filter(
    (s) => (!departmentId || s.department_id === departmentId) && (!semesterId || s.semester_id === semesterId),
  );

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    const result = await uploadPaper(new FormData(event.currentTarget));
    setBusy(false);
    if (!result.ok) setError(result.error);
    else router.push("/dashboard?uploaded=1");
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 max-w-2xl space-y-4" aria-label="Upload a past paper">
      <div>
        <label htmlFor="title" className="text-sm font-medium">Paper title</label>
        <input id="title" name="title" required className={selectClass} placeholder="e.g. Design of Experiment — Final Examination" />
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
      <p className="text-sm text-muted">
        By uploading, you confirm this paper may be shared publicly and is
        not someone else&apos;s copyrighted material you have no right to share.
        Valid uploads are published automatically after server-side checks.
      </p>
      {error && (
        <p role="alert" className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm">{error}</p>
      )}
      <button type="submit" disabled={busy} className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
        {busy ? "Uploading…" : "Upload and publish"}
      </button>
    </form>
  );
}
