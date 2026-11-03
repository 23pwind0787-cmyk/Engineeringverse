import { NextResponse, type NextRequest } from "next/server";
import { createServiceRoleClient, isServiceRoleConfigured } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function signedUrlFor(id: string, download: boolean): Promise<string | null> {
  const anon = await createServerSupabaseClient();
  if (!anon) return null;
  const { data: paper } = await anon
    .from("papers")
    .select("storage_path, status")
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();
  if (!paper) return null;
  if (download) {
    // Atomic counter increment via the security-definer RPC.
    await anon.rpc("increment_download_count", { paper_id: id });
  }
  const service = createServiceRoleClient();
  const { data, error } = await service.storage
    .from("papers")
    .createSignedUrl(paper.storage_path, 300, {
      download: download ? true : undefined,
    });
  if (error || !data) return null;
  return data.signedUrl;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!isServiceRoleConfigured()) {
    return NextResponse.json(
      { error: "File serving is not configured yet (service-role key missing)." },
      { status: 503 },
    );
  }
  const url = await signedUrlFor(id, false);
  if (!url) return NextResponse.json({ error: "Paper not found." }, { status: 404 });
  return NextResponse.redirect(url);
}
