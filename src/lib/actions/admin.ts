"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import type { ContentType, ModerationAction, ModerationTarget } from "@/lib/supabase/types";

export type AdminResult = { ok: true } | { ok: false; error: string };

async function adminClient() {
  await requireAdmin();
  return createServerSupabaseClient();
}

function tableFor(contentType: ContentType): "papers" | "projects" | "events" {
  return contentType === "paper" ? "papers" : contentType === "project" ? "projects" : "events";
}

function publicPaths(contentType: ContentType, contentId: string): string[] {
  if (contentType === "paper") return ["/past-papers", `/past-papers/${contentId}`];
  if (contentType === "project") return ["/projects", `/projects/${contentId}`];
  return ["/seminars", `/seminars/${contentId}`];
}

async function logModeration(
  service: ReturnType<typeof createServiceRoleClient>,
  adminId: string,
  targetType: ModerationTarget,
  targetId: string,
  action: ModerationAction,
  note?: string | null,
): Promise<void> {
  const { error } = await service.from("moderation_log").insert({
    admin_id: adminId,
    target_type: targetType,
    target_id: targetId,
    action,
    note: note ?? null,
  });
  if (error) throw new Error(error.message);
}

function fail(err: unknown): { ok: false; error: string } {
  return { ok: false, error: err instanceof Error ? err.message : "Admin action failed." };
}

/** Deletes any paper (storage object + row). Admin only. Delegates to removeContent so the removal is logged. */
export async function adminDeletePaper(paperId: string, reason: string): Promise<AdminResult> {
  return removeContent("paper", paperId, reason);
}

/**
 * Resolves a report in content_reports (the unified reports table).
 * Same (reportId, status) signature as before — ReportActionButtons
 * calls it. Dismissing a report is also written to the moderation log.
 */
export async function resolveReport(reportId: string, status: "resolved" | "dismissed"): Promise<AdminResult> {
  return resolveContentReport(reportId, status);
}

/** Resolves a content_reports row; a dismissal is logged as a moderation action. */
export async function resolveContentReport(reportId: string, status: "resolved" | "dismissed"): Promise<AdminResult> {
  try {
    const account = await requireAdmin();
    const service = createServiceRoleClient();
    const { error } = await service
      .from("content_reports")
      .update({ status })
      .eq("id", reportId);
    if (error) throw new Error(error.message);
    if (status === "dismissed") {
      await logModeration(service, account.userId, "report", reportId, "dismiss_report");
    }
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

export async function addDepartment(formData: FormData): Promise<void> {
  try {
    const supabase = await adminClient();
    if (!supabase) throw new Error("Not configured.");
    const name = String(formData.get("name") ?? "").trim();
    const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
    const campusId = String(formData.get("campus_id") ?? "");
    const kind = String(formData.get("kind") ?? "");
    if (!name || !slug || !campusId || !["department", "centre", "programme"].includes(kind)) {
      throw new Error("Fill in name, slug, campus and kind.");
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      throw new Error("Slug may only contain lowercase letters, numbers and hyphens.");
    }
    const { error } = await supabase
      .from("departments")
      .insert({ campus_id: campusId, name, slug, kind });
    if (error) throw new Error(error.message);
    revalidatePath("/disciplines");
    revalidatePath("/admin");
    return;
  } catch (err) {
    throw err instanceof Error ? err : new Error("Admin action failed.");
  }
}

export async function addCampus(formData: FormData): Promise<void> {
  try {
    const supabase = await adminClient();
    if (!supabase) throw new Error("Not configured.");
    const name = String(formData.get("name") ?? "").trim();
    const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
    if (!name || !slug) throw new Error("Fill in name and slug.");
    const { error } = await supabase.from("campuses").insert({ name, slug });
    if (error) throw new Error(error.message);
    revalidatePath("/admin");
    return;
  } catch (err) {
    throw err instanceof Error ? err : new Error("Admin action failed.");
  }
}

export async function addSemester(formData: FormData): Promise<void> {
  try {
    const supabase = await adminClient();
    if (!supabase) throw new Error("Not configured.");
    const number = Number(formData.get("number"));
    const label = String(formData.get("label") ?? "").trim();
    if (!Number.isInteger(number) || number < 1 || number > 12 || !label) {
      throw new Error("Enter a semester number (1–12) and a label.");
    }
    const { error } = await supabase.from("semesters").insert({ number, label });
    if (error) throw new Error(error.message);
    revalidatePath("/admin");
    return;
  } catch (err) {
    throw err instanceof Error ? err : new Error("Admin action failed.");
  }
}

export async function addSubject(formData: FormData): Promise<void> {
  try {
    const supabase = await adminClient();
    if (!supabase) throw new Error("Not configured.");
    const departmentId = String(formData.get("department_id") ?? "");
    const semesterId = String(formData.get("semester_id") ?? "");
    const code = String(formData.get("code") ?? "").trim();
    const name = String(formData.get("name") ?? "").trim();
    if (!departmentId || !semesterId || !code || !name) {
      throw new Error("Fill in department, semester, code and name.");
    }
    const { error } = await supabase
      .from("subjects")
      .insert({ department_id: departmentId, semester_id: semesterId, code, name });
    if (error) throw new Error(error.message);
    revalidatePath("/admin");
    revalidatePath("/past-papers");
    return;
  } catch (err) {
    throw err instanceof Error ? err : new Error("Admin action failed.");
  }
}

export async function deleteSubject(subjectId: string): Promise<void> {
  try {
    const supabase = await adminClient();
    if (!supabase) throw new Error("Not configured.");
    const { error } = await supabase.from("subjects").delete().eq("id", subjectId);
    if (error) throw new Error(error.message);
    revalidatePath("/admin");
    return;
  } catch (err) {
    throw err instanceof Error ? err : new Error("Admin action failed.");
  }
}

/**
 * Changes a user's role. Refuses to demote the last remaining admin.
 * The first admin is created by SQL in SUPABASE_SETUP.md — no email
 * is hard-coded anywhere in this codebase.
 */
export async function setUserRole(userId: string, role: "student" | "admin"): Promise<AdminResult> {
  try {
    await requireAdmin();
    const service = createServiceRoleClient();
    if (role === "student") {
      const { count } = await service
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "admin");
      const { data: target } = await service
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();
      if (target?.role === "admin" && (count ?? 0) <= 1) {
        return { ok: false, error: "Cannot demote the last admin." };
      }
    }
    const { error } = await service
      .from("profiles")
      .update({ role })
      .eq("id", userId);
    if (error) throw new Error(error.message);
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Admin action failed." };
  }
}

/**
 * Approves or rejects a paper, project or event. A rejection stores
 * the note as moderation_note so the uploader can see why. Every
 * decision is written to the moderation log.
 */
export async function moderateContent(
  contentType: ContentType,
  contentId: string,
  action: "approve" | "reject",
  note?: string,
): Promise<AdminResult> {
  try {
    const account = await requireAdmin();
    const service = createServiceRoleClient();
    const status = action === "approve" ? "approved" : "rejected";
    const { error } = await service
      .from(tableFor(contentType))
      .update({ status, moderation_note: note?.trim() ? note.trim() : null })
      .eq("id", contentId);
    if (error) throw new Error(error.message);
    await logModeration(service, account.userId, contentType, contentId, action, note);
    revalidatePath("/admin");
    revalidatePath("/dashboard");
    for (const path of publicPaths(contentType, contentId)) revalidatePath(path);
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

/** Hides an approved item from public listings (row stays in the DB). */
export async function hideContent(
  contentType: ContentType,
  contentId: string,
  note?: string,
): Promise<AdminResult> {
  try {
    const account = await requireAdmin();
    const service = createServiceRoleClient();
    const { error } = await service
      .from(tableFor(contentType))
      .update({ hidden: true })
      .eq("id", contentId);
    if (error) throw new Error(error.message);
    await logModeration(service, account.userId, contentType, contentId, "hide", note);
    revalidatePath("/admin");
    revalidatePath("/dashboard");
    for (const path of publicPaths(contentType, contentId)) revalidatePath(path);
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

/** Makes a previously hidden item visible again. */
export async function unhideContent(contentType: ContentType, contentId: string): Promise<AdminResult> {
  try {
    const account = await requireAdmin();
    const service = createServiceRoleClient();
    const { error } = await service
      .from(tableFor(contentType))
      .update({ hidden: false })
      .eq("id", contentId);
    if (error) throw new Error(error.message);
    await logModeration(service, account.userId, contentType, contentId, "unhide");
    revalidatePath("/admin");
    revalidatePath("/dashboard");
    for (const path of publicPaths(contentType, contentId)) revalidatePath(path);
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

/**
 * Permanently deletes a paper, project or event and its storage
 * objects, and logs the removal with the given reason. Reports that
 * pointed at the content are kept as an audit trail.
 */
export async function removeContent(
  contentType: ContentType,
  contentId: string,
  reason: string,
): Promise<AdminResult> {
  try {
    const account = await requireAdmin();
    const service = createServiceRoleClient();
    const table = tableFor(contentType);
    if (contentType === "paper") {
      const { data } = await service
        .from("papers")
        .select("storage_path")
        .eq("id", contentId)
        .maybeSingle();
      if (!data) return { ok: false, error: "Content not found." };
      if (data.storage_path) await service.storage.from("papers").remove([data.storage_path]);
    } else if (contentType === "project") {
      const { data } = await service
        .from("projects")
        .select("media_paths, report_path")
        .eq("id", contentId)
        .maybeSingle();
      if (!data) return { ok: false, error: "Content not found." };
      const paths = [
        ...(Array.isArray(data.media_paths) ? data.media_paths : []),
        ...(data.report_path ? [data.report_path] : []),
      ].filter(Boolean);
      if (paths.length > 0) await service.storage.from("project-media").remove(paths);
    } else {
      const { data } = await service
        .from("events")
        .select("poster_path")
        .eq("id", contentId)
        .maybeSingle();
      if (!data) return { ok: false, error: "Content not found." };
      if (data.poster_path) await service.storage.from("event-posters").remove([data.poster_path]);
    }
    const { error } = await service.from(table).delete().eq("id", contentId);
    if (error) throw new Error(error.message);
    await logModeration(service, account.userId, contentType, contentId, "remove", reason);
    revalidatePath("/admin");
    revalidatePath("/dashboard");
    for (const path of publicPaths(contentType, contentId)) revalidatePath(path);
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}
