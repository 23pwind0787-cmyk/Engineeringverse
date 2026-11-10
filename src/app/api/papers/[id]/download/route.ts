import { NextResponse, type NextRequest } from "next/server";
import { recordContentEvent } from "@/lib/content-events";
import { createServiceRoleClient, isServiceRoleConfigured } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

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
  const anon = await createServerSupabaseClient();
  if (!anon) return NextResponse.json({ error: "Not configured." }, { status: 503 });
  const { data: paper } = await anon
    .from("papers")
    .select("storage_path, status, hidden, title")
    .eq("id", id)
    .eq("status", "approved")
    .eq("hidden", false)
    .maybeSingle();
  if (!paper) return NextResponse.json({ error: "Paper not found." }, { status: 404 });

  // Honest counting (Stage 8): one counted download per user (or per
  // IP for guests) per day. The function refuses to count content
  // that is not approved and visible.
  await recordContentEvent("paper", id, "download", request);

  const service = createServiceRoleClient();
  const safeName = paper.title.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 80) || "paper";
  const { data, error } = await service.storage
    .from("papers")
    .createSignedUrl(paper.storage_path, 300, { download: `${safeName}.pdf` });
  if (error || !data) return NextResponse.json({ error: "Could not create a download link." }, { status: 500 });
  return NextResponse.redirect(data.signedUrl);
}
