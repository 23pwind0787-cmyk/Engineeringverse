"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AdminResult = { ok: true } | { ok: false; error: string };

async function adminClient() {
  await requireAdmin();
  return createServerSupabaseClient();
}

/** Deletes any paper (storage object + row). Admin only. */
export async function adminDeletePaper(paperId: string, reason: string): Promise<AdminResult> {
  try {
    await requireAdmin();
    const service = createServiceRoleClient();
    const { data: paper } = await service
      .from("papers")
      .select("storage_path, title")
      .eq("id", paperId)
      .maybeSingle();
    if (!paper) return { ok: false, error: "Paper not found." };
    await service.storage.from("papers").remove([paper.storage_path]);
    const { error } = await service.from("papers").delete().eq("id", paperId);
    if (error) throw new Error(error.message);
    // The removal reason is recorded in the report that prompted it
    // where one exists; the paper row itself is deleted.
    void reason;
    revalidatePath("/admin");
    revalidatePath("/past-papers");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Admin action failed." };
  }
}

export async function resolveReport(reportId: string, status: "resolved" | "dismissed"): Promise<AdminResult> {
  try {
    const supabase = await adminClient();
    if (!supabase) throw new Error("Not configured.");
    const { error } = await supabase
      .from("paper_reports")
      .update({ status })
      .eq("id", reportId);
    if (error) throw new Error(error.message);
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Admin action failed." };
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
