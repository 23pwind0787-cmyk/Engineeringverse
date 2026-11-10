"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitProject, updateOwnProject } from "@/lib/actions/projects";
import {
  PROJECT_CATEGORIES,
  type Campus,
  type DepartmentRow,
  type ProjectCategory,
} from "@/lib/supabase/types";

const fieldClass = "mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm";

export interface ProjectFormInitial {
  id: string;
  title: string;
  description: string;
  team_members: string[];
  supervisor: string | null;
  category: ProjectCategory;
  tools: string[];
  outcomes: string | null;
}

/**
 * Reusable project submit/edit form. Without `project` it creates a
 * new submission (media + report upload included); with `project` it
 * edits that pending project's text fields only. A later phase embeds
 * this same form in /upload.
 */
export function ProjectForm({
  campuses,
  departments,
  project,
  onSuccessRedirect,
}: {
  campuses: Campus[];
  departments: DepartmentRow[];
  project?: ProjectFormInitial;
  /** Where an edit lands on success; defaults to the project page. */
  onSuccessRedirect?: string;
}) {
  const router = useRouter();
  const isEdit = Boolean(project);
  const [campusId, setCampusId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const visibleDepartments = departments.filter((d) => !campusId || d.campus_id === campusId);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    const formData = new FormData(event.currentTarget);
    const result = isEdit
      ? await updateOwnProject(formData)
      : await submitProject(formData);
    setBusy(false);
    if (!result.ok) setError(result.error);
    else if (isEdit && project) router.push(onSuccessRedirect ?? `/projects/${project.id}`);
    else router.push("/dashboard?uploaded=1");
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 max-w-2xl space-y-4" aria-label={isEdit ? "Edit project" : "Submit a project"}>
      {isEdit && project && <input type="hidden" name="project_id" value={project.id} />}
      <div>
        <label htmlFor="title" className="text-sm font-medium">Project title</label>
        <input
          id="title"
          name="title"
          required
          defaultValue={project?.title ?? ""}
          className={fieldClass}
          placeholder="e.g. AI-based PPE detection from CCTV video streams"
        />
      </div>
      <div>
        <label htmlFor="description" className="text-sm font-medium">Description</label>
        <textarea
          id="description"
          name="description"
          required
          rows={5}
          defaultValue={project?.description ?? ""}
          className={fieldClass}
          placeholder="What does the project do, what problem does it solve, and how does it work?"
        />
      </div>
      {!isEdit && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="campus_id" className="text-sm font-medium">Campus</label>
            <select
              id="campus_id"
              name="campus_id"
              required
              value={campusId}
              onChange={(e) => { setCampusId(e.target.value); setDepartmentId(""); }}
              className={fieldClass}
            >
              <option value="">Choose…</option>
              {campuses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="department_id" className="text-sm font-medium">Department / programme</label>
            <select
              id="department_id"
              name="department_id"
              required
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className={fieldClass}
            >
              <option value="">Choose…</option>
              {visibleDepartments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}
      <div>
        <label htmlFor="category" className="text-sm font-medium">Category</label>
        <select id="category" name="category" required defaultValue={project?.category ?? ""} className={fieldClass}>
          <option value="" disabled>Choose…</option>
          {PROJECT_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="team_members" className="text-sm font-medium">Team members (comma-separated)</label>
        <input
          id="team_members"
          name="team_members"
          defaultValue={project?.team_members.join(", ") ?? ""}
          className={fieldClass}
          placeholder="e.g. Shahzeb, Mufakker Aizaz, Muneeb Naeem"
        />
      </div>
      <div>
        <label htmlFor="supervisor" className="text-sm font-medium">Supervisor (optional)</label>
        <input
          id="supervisor"
          name="supervisor"
          defaultValue={project?.supervisor ?? ""}
          className={fieldClass}
          placeholder="e.g. Prof. Altaf Hussain"
        />
      </div>
      <div>
        <label htmlFor="tools" className="text-sm font-medium">Tools &amp; technologies (comma-separated)</label>
        <input
          id="tools"
          name="tools"
          defaultValue={project?.tools.join(", ") ?? ""}
          className={fieldClass}
          placeholder="e.g. Python, YOLOv8, OpenCV, Flask"
        />
      </div>
      <div>
        <label htmlFor="outcomes" className="text-sm font-medium">Outcomes (optional)</label>
        <textarea
          id="outcomes"
          name="outcomes"
          rows={3}
          defaultValue={project?.outcomes ?? ""}
          className={fieldClass}
          placeholder="What did the project achieve — results, accuracy, awards, deployment?"
        />
      </div>
      {!isEdit && (
        <>
          <div>
            <label htmlFor="media" className="text-sm font-medium">Photos / videos (optional, up to 6 files, 20 MB each)</label>
            <input
              id="media"
              name="media"
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.webp,.gif,.mp4,.webm,image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
              className={fieldClass}
            />
            <p className="mt-1 text-xs text-muted">Images (JPG, PNG, WebP, GIF) or video (MP4, WebM). Show the working prototype, dashboard or demo — not other people&apos;s copyrighted material.</p>
          </div>
          <div>
            <label htmlFor="report" className="text-sm font-medium">Project report PDF (optional, max 20 MB)</label>
            <input
              id="report"
              name="report"
              type="file"
              accept=".pdf,application/pdf"
              className={fieldClass}
            />
          </div>
        </>
      )}
      <p className="text-sm text-muted">
        By submitting, you confirm this is your own work (or your team&apos;s)
        and may be shared publicly. Submissions are reviewed by an admin
        before they appear on this page.
      </p>
      {error && (
        <p role="alert" className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm">{error}</p>
      )}
      <button type="submit" disabled={busy} className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
        {busy ? (isEdit ? "Saving…" : "Submitting…") : isEdit ? "Save changes" : "Submit project"}
      </button>
    </form>
  );
}
