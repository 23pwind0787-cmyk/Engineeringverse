"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { getCurrentAccount } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const MAX_PDF_BYTES = 20 * 1024 * 1024; // 20 MB
const PDF_MAGIC = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]); // "%PDF-"

export type UploadResult = { ok: true } | { ok: false; error: string };

/**
 * Uploads a paper. Runs only on the server. Validates, in order:
 * verified email, PDF magic bytes + extension, 20 MB limit, and the
 * campus/department/semester/subject relationships. A paper is
 * published automatically once every check passes.
 */
export async function uploadPaper(formData: FormData): Promise<UploadResult> {
  const account = await getCurrentAccount();
  if (!account) return { ok: false, error: "Sign in to upload a paper." };
  if (!account.emailConfirmed) {
    return {
      ok: false,
      error:
        "Verify your email before uploading. Use the verification link in your email, or resend it from the upload page.",
    };
  }

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
  const campusId = String(formData.get("campus_id") ?? "");
  const departmentId = String(formData.get("department_id") ?? "");
  const semesterId = String(formData.get("semester_id") ?? "");
  const subjectId = String(formData.get("subject_id") ?? "") || null;
  const subjectCode = String(formData.get("subject_code") ?? "").trim();
  const examType = String(formData.get("exam_type") ?? "");
  const year = Number(formData.get("year"));
  const session = String(formData.get("session") ?? "");
  if (!title || !campusId || !departmentId || !semesterId || !subjectCode) {
    return { ok: false, error: "Fill in every required field." };
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
    subject_code: subjectCode,
    exam_type: examType,
    year,
    session,
    storage_path: storagePath,
    file_size: file.size,
    status: "published",
  });
  if (insertError) {
    await supabase.storage.from("papers").remove([storagePath]);
    return { ok: false, error: `Could not save the paper: ${insertError.message}` };
  }

  revalidatePath("/past-papers");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function reportPaper(formData: FormData): Promise<UploadResult> {
  const account = await getCurrentAccount();
  if (!account) return { ok: false, error: "Sign in to report a paper." };
  const paperId = String(formData.get("paper_id") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (!paperId || reason.length < 10) {
    return { ok: false, error: "Give a reason of at least 10 characters." };
  }
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false, error: "Reporting is not configured yet." };
  const { error } = await supabase.from("paper_reports").insert({
    paper_id: paperId,
    reporter_id: account.userId,
    reason,
    status: "open",
  });
  if (error) return { ok: false, error: error.message };
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
  revalidatePath("/past-papers");
}
