"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { getCurrentAccount } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleClient, isServiceRoleConfigured } from "@/lib/supabase/admin";
import type { ProjectCategory } from "@/lib/supabase/types";

const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20 MB
const MAX_MEDIA_FILES = 6;
const PDF_MAGIC = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]); // "%PDF-"
const BUCKET = "project-media";

const PROJECT_CATEGORIES: ProjectCategory[] = [
  "innovative",
  "fyp",
  "research",
  "industrial_automation",
  "robotics_ai",
  "mechanical_design",
  "electrical_electronics",
  "software_tech",
  "industrial_engineering",
  "student_innovation",
];

const IMAGE_EXTS: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

const VIDEO_EXTS: Record<string, string> = {
  mp4: "video/mp4",
  webm: "video/webm",
};

export type ProjectResult = { ok: true } | { ok: false; error: string };

function splitList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function requireVerifiedUploader() {
  const account = await getCurrentAccount();
  if (!account) return { account: null, error: "Sign in to submit a project." };
  if (!account.emailConfirmed) {
    return {
      account: null,
      error:
        "Verify your email before submitting a project. Use the verification link in your email, or resend it from the submit page.",
    };
  }
  return { account, error: null };
}

function mediaKind(file: File): { ext: string; mime: string } | null {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const mime = IMAGE_EXTS[ext] ?? VIDEO_EXTS[ext];
  if (!mime) return null;
  // Browsers sometimes send an empty type; only reject a type that is
  // present and does not match the extension.
  if (file.type && file.type !== mime) return null;
  return { ext, mime };
}

/**
 * Submits a project (any of the ten categories). Runs only on the
 * server. Validates, in order: verified email, required fields and a
 * valid category, the campus/department relationship, then the media
 * files (up to 6 images/videos, 20 MB each) and the optional report
 * PDF (magic bytes, 20 MB). New submissions land as `pending` — they
 * become public only after an admin approves them. Files already
 * uploaded are removed again if the database insert fails.
 */
export async function submitProject(formData: FormData): Promise<ProjectResult> {
  const { account, error: authError } = await requireVerifiedUploader();
  if (!account || authError) return { ok: false, error: authError ?? "Sign in to submit a project." };

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const campusId = String(formData.get("campus_id") ?? "");
  const departmentId = String(formData.get("department_id") ?? "");
  const category = String(formData.get("category") ?? "") as ProjectCategory;
  const teamMembers = splitList(String(formData.get("team_members") ?? ""));
  const supervisor = String(formData.get("supervisor") ?? "").trim() || null;
  const tools = splitList(String(formData.get("tools") ?? ""));
  const outcomes = String(formData.get("outcomes") ?? "").trim() || null;

  if (!title || !description || !campusId || !departmentId || !category) {
    return { ok: false, error: "Fill in every required field." };
  }
  if (!PROJECT_CATEGORIES.includes(category)) {
    return { ok: false, error: "Choose a valid project category." };
  }

  // Media files: up to 6, images or video, 20 MB each.
  const mediaFiles = formData
    .getAll("media")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
  if (mediaFiles.length > MAX_MEDIA_FILES) {
    return { ok: false, error: `Attach at most ${MAX_MEDIA_FILES} media files.` };
  }
  for (const file of mediaFiles) {
    if (!mediaKind(file)) {
      return {
        ok: false,
        error: "Media must be images (JPG, PNG, WebP, GIF) or video (MP4, WebM).",
      };
    }
    if (file.size > MAX_FILE_BYTES) {
      return { ok: false, error: "Each media file must be at most 20 MB." };
    }
  }

  // Optional report PDF.
  const reportRaw = formData.get("report");
  const reportFile =
    reportRaw instanceof File && reportRaw.size > 0 ? reportRaw : null;
  let reportBytes: Uint8Array | null = null;
  if (reportFile) {
    if (!reportFile.name.toLowerCase().endsWith(".pdf")) {
      return { ok: false, error: "The project report must be a PDF file." };
    }
    if (reportFile.size > MAX_FILE_BYTES) {
      return { ok: false, error: "The project report must be at most 20 MB." };
    }
    reportBytes = new Uint8Array(await reportFile.arrayBuffer());
    if (
      reportBytes.length < PDF_MAGIC.length ||
      !PDF_MAGIC.every((byte, i) => reportBytes![i] === byte)
    ) {
      return { ok: false, error: "The report file does not look like a real PDF." };
    }
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false, error: "Submissions are not configured yet." };

  // Relationship validation: department must belong to the campus.
  const { data: department } = await supabase
    .from("departments")
    .select("id, campus_id")
    .eq("id", departmentId)
    .maybeSingle();
  if (!department || department.campus_id !== campusId) {
    return { ok: false, error: "That department does not belong to the chosen campus." };
  }

  const uploadedPaths: string[] = [];
  async function removeUploaded() {
    if (uploadedPaths.length > 0) {
      await supabase!.storage.from(BUCKET).remove(uploadedPaths);
    }
  }

  const mediaPaths: string[] = [];
  for (const file of mediaFiles) {
    const kind = mediaKind(file)!;
    const path = `${account.userId}/${randomUUID()}.${kind.ext}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, Buffer.from(await file.arrayBuffer()), {
        contentType: kind.mime,
        upsert: false,
      });
    if (uploadError) {
      await removeUploaded();
      return { ok: false, error: `Media upload failed: ${uploadError.message}` };
    }
    uploadedPaths.push(path);
    mediaPaths.push(path);
  }

  let reportPath: string | null = null;
  if (reportFile && reportBytes) {
    const path = `${account.userId}/${randomUUID()}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, Buffer.from(reportBytes), {
        contentType: "application/pdf",
        upsert: false,
      });
    if (uploadError) {
      await removeUploaded();
      return { ok: false, error: `Report upload failed: ${uploadError.message}` };
    }
    uploadedPaths.push(path);
    reportPath = path;
  }

  const { error: insertError } = await supabase.from("projects").insert({
    uploader_id: account.userId,
    campus_id: campusId,
    department_id: departmentId,
    title,
    description,
    team_members: teamMembers,
    supervisor,
    category,
    media_paths: mediaPaths,
    report_path: reportPath,
    tools,
    outcomes,
    status: "pending",
  });
  if (insertError) {
    await removeUploaded();
    return { ok: false, error: `Could not save the project: ${insertError.message}` };
  }

  revalidatePath("/projects");
  revalidatePath("/dashboard");
  return { ok: true };
}

/**
 * Edits one of the uploader's own pending projects. Approved or
 * rejected projects cannot be edited — that is an admin action.
 * Files (media/report) are not changed here; only the text fields.
 *
 * Contract (a later phase depends on it exactly): form fields
 * project_id, title, description, team_members (comma-separated),
 * supervisor, category, tools (comma-separated), outcomes.
 */
export async function updateOwnProject(formData: FormData): Promise<ProjectResult> {
  const account = await getCurrentAccount();
  if (!account) return { ok: false, error: "Sign in to edit a project." };
  const projectId = String(formData.get("project_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const teamMembers = splitList(String(formData.get("team_members") ?? ""));
  const supervisor = String(formData.get("supervisor") ?? "").trim() || null;
  const category = String(formData.get("category") ?? "") as ProjectCategory;
  const tools = splitList(String(formData.get("tools") ?? ""));
  const outcomes = String(formData.get("outcomes") ?? "").trim() || null;

  if (!projectId || !title || !description || !category) {
    return { ok: false, error: "A title, description and category are required." };
  }
  if (!PROJECT_CATEGORIES.includes(category)) {
    return { ok: false, error: "Choose a valid project category." };
  }

  // Ownership + pending check. The anon client cannot select a pending
  // row (Phase 2 RLS gap), so the check runs through the service-role
  // client, server-side only, and the update itself is scoped to the
  // caller's own pending row.
  if (!isServiceRoleConfigured()) {
    return { ok: false, error: "Editing is not configured yet." };
  }
  const service = createServiceRoleClient();
  const { data: project } = await service
    .from("projects")
    .select("uploader_id, status")
    .eq("id", projectId)
    .maybeSingle();
  if (!project || project.uploader_id !== account.userId) {
    return { ok: false, error: "That project is not yours." };
  }
  if (project.status !== "pending") {
    return { ok: false, error: "Only pending projects can be edited." };
  }
  const { error } = await service
    .from("projects")
    .update({
      title,
      description,
      team_members: teamMembers,
      supervisor,
      category,
      tools,
      outcomes,
    })
    .eq("id", projectId)
    .eq("uploader_id", account.userId)
    .eq("status", "pending");
  if (error) return { ok: false, error: error.message };
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

/** Deletes the caller's own project row and its stored media/report files. */
export async function deleteOwnProject(projectId: string): Promise<void> {
  const account = await getCurrentAccount();
  if (!account) redirect("/auth/sign-in");
  if (!isServiceRoleConfigured()) return;
  const service = createServiceRoleClient();
  const { data: project } = await service
    .from("projects")
    .select("media_paths, report_path, uploader_id")
    .eq("id", projectId)
    .maybeSingle();
  if (!project || project.uploader_id !== account.userId) return;
  const paths = [...(project.media_paths ?? [])];
  if (project.report_path) paths.push(project.report_path);
  if (paths.length > 0) {
    await service.storage.from(BUCKET).remove(paths);
  }
  await service.from("projects").delete().eq("id", projectId).eq("uploader_id", account.userId);
  revalidatePath("/projects");
  revalidatePath("/dashboard");
}
