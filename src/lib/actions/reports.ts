"use server";

import { revalidatePath } from "next/cache";
import { getCurrentAccount } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { REPORT_REASONS, type ContentType, type ReportReason } from "@/lib/supabase/types";

export type ReportResult = { ok: true } | { ok: false; error: string };

const CONTENT_TYPES: ContentType[] = ["paper", "project", "event"];

/**
 * Files a report against a paper, project or event. The reason must
 * be one of the six canonical values (Stage 7); optional free-text
 * details are stored separately. A report never deletes or hides
 * anything — it only opens a case for an admin.
 */
export async function reportContent(formData: FormData): Promise<ReportResult> {
  const account = await getCurrentAccount();
  if (!account) return { ok: false, error: "Sign in to report content." };
  const contentType = String(formData.get("content_type") ?? "") as ContentType;
  const contentId = String(formData.get("content_id") ?? "");
  const reason = String(formData.get("reason") ?? "") as ReportReason;
  const details = String(formData.get("details") ?? "").trim() || null;
  if (!CONTENT_TYPES.includes(contentType) || !contentId) {
    return { ok: false, error: "That content could not be identified." };
  }
  if (!REPORT_REASONS.some((r) => r.value === reason)) {
    return { ok: false, error: "Choose a valid reason for the report." };
  }
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false, error: "Reporting is not configured yet." };
  const { error } = await supabase.from("content_reports").insert({
    content_type: contentType,
    content_id: contentId,
    reporter_id: account.userId,
    reason,
    details,
    status: "open",
  });
  if (error) {
    // The unique index blocks a second open report for the same
    // reporter, content and reason — that is a duplicate, not a
    // failure worth a scary message.
    if (error.code === "23505") {
      return { ok: false, error: "You have already reported this with the same reason." };
    }
    return { ok: false, error: error.message };
  }
  revalidatePath("/admin");
  return { ok: true };
}
