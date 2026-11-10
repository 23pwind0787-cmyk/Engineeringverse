import { NextResponse, type NextRequest } from "next/server";
import { recordContentEvent } from "@/lib/content-events";
import { createServiceRoleClient, isServiceRoleConfigured } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function signedUrlFor(id: string, recordView: boolean, request: NextRequest): Promise<string | null> {
  const anon = await createServerSupabaseClient();
  if (!anon) return null;
  const { data: paper } = await anon
    .from("papers")
    .select("storage_path, status, hidden")
    .eq("id", id)
    .eq("status", "approved")
    .eq("hidden", false)
    .maybeSingle();
  if (!paper) return null;
  if (recordView) {
    // One counted view per user (or per IP for guests) per day
    // (Stage 8). Repeat previews of the same file do not inflate it.
    await recordContentEvent("paper", id, "view", request);
  }
  const service = createServiceRoleClient();
  const { data, error } = await service.storage
    .from("papers")
    .createSignedUrl(paper.storage_path, 300);
  if (error || !data) return null;
  return data.signedUrl;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!isServiceRoleConfigured()) {
    return NextResponse.json(
      { error: "File serving is not configured yet (service-role key missing)." },
      { status: 503 },
    );
  }
  const url = await signedUrlFor(id, true, request);
  if (!url) return NextResponse.json({ error: "Paper not found." }, { status: 404 });
  return NextResponse.redirect(url);
}
