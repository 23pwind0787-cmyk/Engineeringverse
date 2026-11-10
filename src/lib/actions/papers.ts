"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createHash, randomUUID } from "node:crypto";
import { getCurrentAccount } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleClient, isServiceRoleConfigured } from "@/lib/supabase/admin";
import type { ResourceCategory } from "@/lib/supabase/types";

const MAX_PDF_BYTES = 20 * 1024 * 1024; // 20 MB
const PDF_MAGIC = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]); // "%PDF-"

const RESOURCE_CATEGORIES: ResourceCategory[] = [
  "past_paper",
  "oel",
  "lab_report",
  "book",
  "assignment_notes",
  "fyp",
  "other",
];

export type UploadResult =
  | { ok: true; duplicate?: { id: string; title: string; category: string; status: string } | null }
  | { ok: false; error: string };

function sha256Hex(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

async function requireVerifiedUploader() {
  const account = await getCurrentAccount();
  if (!account) return { account: null, error: "Sign in to upload." };
  if (!account.emailConfirmed) {
    return {
      account: null,
      error:
        "Verify your email before uploading. Use the verification link in your email, or resend it from the upload page.",
    };
  }
  return { account, error: null };
}

/**
 * Uploads a resource (any of the seven categories). Runs only on the
 * server. Validates, in order: verified email, PDF magic bytes +
 * extension, 20 MB limit, per-category required fields, and the
 * campus/department/semester/subject relationships.
 *
 * New uploads land as `pending` (Stage 5 approval workflow) — they
 * become public only after an admin approves them. A SHA-256 hash of
 * the file is stored and looked up first: an identical file already
 * on the site is reported back as a warning, not a hard block (a
 * textbook legitimately shared for another department is not spam).
 */
export async function uploadPaper(formData: FormData): Promise<UploadResult> {
  const { account, error: authError } = await requireVerifiedUploader();
  if (!account || authError) return { ok: false, error: authError ?? "Sign in to upload." };

  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "Choose a PDF file." };
  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return { ok: false, error: "Only PDF files are accepted." };
  }
  if (file.size <= 0 || file.size > MAX_PDF_BYTES) {
    return { ok: false, error: "The file must be a PDF of at most 20 MB." };
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (
    bytes.length < PDF_MAGIC.length ||
    !PDF_MAGIC.every((byte, i) => bytes[i] === byte)
  ) {
    return { ok: false, error: "The file does not look like a real PDF." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const category = String(formData.get("category") ?? "past_paper") as ResourceCategory;
  const campusId = String(formData.get("campus_id") ?? "");
  const departmentId = String(formData.get("department_id") ?? "");
  const semesterId = String(formData.get("semester_id") ?? "") || null;
  const subjectId = String(formData.get("subject_id") ?? "") || null;
  const subjectCode = String(formData.get("subject_code") ?? "").trim() || null;
  const examType = String(formData.get("exam_type") ?? "") || null;
  const yearRaw = String(formData.get("year") ?? "").trim();
  const year = yearRaw === "" ? null : Number(yearRaw);
  const session = String(formData.get("session") ?? "") || null;

  if (!title || !campusId || !departmentId) {
    return { ok: false, error: "Fill in every required field." };
  }
  if (!RESOURCE_CATEGORIES.includes(category)) {
    return { ok: false, error: "Choose a valid resource category." };
  }
  // Past papers need the exam fields (the database enforces the same
  // rule); other categories may leave them blank.
  if (category === "past_paper") {
    if (!semesterId || !subjectCode || !examType || year === null || !session) {
      return { ok: false, error: "Past papers need a semester, subject code, exam type, year and session." };
    }
    if (!["Mid", "Final", "Quiz", "Other"].includes(examType)) {
      return { ok: false, error: "Choose a valid exam type." };
    }
    if (!["Spring", "Fall", "Summer", "Annual"].includes(session)) {
      return { ok: false, error: "Choose a valid session." };
    }
    if (!Number.isInteger(year) || year < 1950 || year > 2100) {
      return { ok: false, error: "Enter a valid year." };
    }
  } else if (year !== null && (!Number.isInteger(year) || year < 1950 || year > 2100)) {
    return { ok: false, error: "Enter a valid year." };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false, error: "Uploads are not configured yet." };

  // Relationship validation: department must belong to the campus, and
  // a chosen subject must belong to that department and semester.
  const { data: department } = await supabase
    .from("departments")
    .select("id, campus_id")
    .eq("id", departmentId)
    .maybeSingle();
  if (!department || department.campus_id !== campusId) {
    return { ok: false, error: "That department does not belong to the chosen campus." };
  }
  if (subjectId) {
    if (!semesterId) {
      return { ok: false, error: "A subject requires a semester." };
    }
    const { data: subject } = await supabase
      .from("subjects")
      .select("id, department_id, semester_id")
      .eq("id", subjectId)
      .maybeSingle();
    if (
      !subject ||
      subject.department_id !== departmentId ||
      subject.semester_id !== semesterId
    ) {
      return {
        ok: false,
        error: "That subject does not belong to the chosen department and semester.",
      };
    }
  }

  // Duplicate lookup (warn, don't block).
  const fileHash = sha256Hex(bytes);
  let duplicate: { id: string; title: string; category: string; status: string } | null = null;
  try {
    const { data: matches } = await supabase.rpc("find_resources_by_hash", {
      p_file_hash: fileHash,
    });
    const first = (matches as Array<{ id: string; title: string; category: string; status: string }> | null)?.[0];
    if (first) {
      duplicate = { id: first.id, title: first.title, category: first.category, status: first.status };
    }
  } catch {
    // Duplicate lookup is best-effort; a failure never blocks an upload.
  }

  const storagePath = `${account.userId}/${randomUUID()}.pdf`;
  const { error: uploadError } = await supabase.storage
    .from("papers")
    .upload(storagePath, Buffer.from(bytes), { contentType: "application/pdf", upsert: false });
  if (uploadError) return { ok: false, error: `Upload failed: ${uploadError.message}` };

  const { error: insertError } = await supabase.from("papers").insert({
    uploader_id: account.userId,
    campus_id: campusId,
    department_id: departmentId,
    semester_id: semesterId,
    subject_id: subjectId,
    title,
    description,
    category,
    subject_code: subjectCode,
    exam_type: examType,
    year,
    session,
    storage_path: storagePath,
    file_size: file.size,
    file_hash: fileHash,
    status: "pending",
  });
  if (insertError) {
    await supabase.storage.from("papers").remove([storagePath]);
    return { ok: false, error: `Could not save the resource: ${insertError.message}` };
  }

  revalidatePath("/disciplines");
  revalidatePath("/dashboard");
  revalidatePath("/past-papers");
  return { ok: true, duplicate };
}

/**
 * Edits one of the uploader's own pending submissions (title and
 * description, plus the exam fields for past papers). Approved or
 * rejected submissions cannot be edited — that is an admin action.
 */
export async function updateOwnPaper(formData: FormData): Promise<UploadResult> {
  const account = await getCurrentAccount();
  if (!account) return { ok: false, error: "Sign in to edit a submission." };
  const paperId = String(formData.get("paper_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  if (!paperId || !title) return { ok: false, error: "A title is required." };
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false, error: "Not configured yet." };
  // Ownership read via the service-role client: the Stage 5 RLS
  // policies give owners no SELECT on their own pending rows, so the
  // anon client cannot see a pending submission at all. Server-side
  // only; the update below is still scoped to the owner + pending.
  if (!isServiceRoleConfigured()) {
    return { ok: false, error: "Editing is not configured yet." };
  }
  const service = createServiceRoleClient();
  const { data: paper } = await service
    .from("papers")
    .select("uploader_id, status, category")
    .eq("id", paperId)
    .maybeSingle();
  if (!paper || paper.uploader_id !== account.userId) {
    return { ok: false, error: "That submission is not yours." };
  }
  if (paper.status !== "pending") {
    return { ok: false, error: "Only pending submissions can be edited." };
  }
  const updates: Record<string, string | number | null> = { title, description };
  if (paper.category === "past_paper") {
    const subjectCode = String(formData.get("subject_code") ?? "").trim() || null;
    const examType = String(formData.get("exam_type") ?? "") || null;
    const yearRaw = String(formData.get("year") ?? "").trim();
    const year = yearRaw === "" ? null : Number(yearRaw);
    const session = String(formData.get("session") ?? "") || null;
    if (!subjectCode || !examType || year === null || !session) {
      return { ok: false, error: "Past papers need a subject code, exam type, year and session." };
    }
    updates.subject_code = subjectCode;
    updates.exam_type = examType;
    updates.year = year;
    updates.session = session;
  }
  const { error } = await supabase
    .from("papers")
    .update(updates)
    .eq("id", paperId)
    .eq("uploader_id", account.userId)
    .eq("status", "pending");
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/disciplines");
  return { ok: true };
}

export async function deleteOwnPaper(paperId: string): Promise<void> {
  const account = await getCurrentAccount();
  if (!account) redirect("/auth/sign-in");
  const supabase = await createServerSupabaseClient();
  if (!supabase) return;
  const { data: paper } = await supabase
    .from("papers")
    .select("storage_path, uploader_id")
    .eq("id", paperId)
    .maybeSingle();
  if (!paper || paper.uploader_id !== account.userId) return;
  await supabase.storage.from("papers").remove([paper.storage_path]);
  await supabase.from("papers").delete().eq("id", paperId);
  revalidatePath("/dashboard");
  revalidatePath("/disciplines");
  revalidatePath("/past-papers");
}
