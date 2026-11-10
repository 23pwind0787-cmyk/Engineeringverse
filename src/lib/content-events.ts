import "server-only";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { createServerSupabaseClient } from "./supabase/server";
import type { ContentEventType, ContentType } from "./supabase/types";

/**
 * Honest download/view counting (Stage 8).
 *
 * One counted event per user per content item per day; guests are
 * counted per IP address per item per day. The identity contract:
 * signed-in users pass their user id, guests pass the lowercase hex
 * SHA-256 of the client IP — a raw IP is never stored or passed.
 * The database function is the only writer and refuses to count
 * content that is not approved and visible.
 */

function hashIp(ip: string): string {
  return createHash("sha256").update(ip.trim()).digest("hex");
}

function ipFromHeaders(headersLike: { get(name: string): string | null }): string | null {
  const forwarded = headersLike.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || null;
  return headersLike.get("x-real-ip")?.trim() || null;
}

/** Records one counted event. Never throws — counting must not break a page or a download. */
export async function recordContentEvent(
  contentType: ContentType,
  contentId: string,
  eventType: ContentEventType,
  request?: NextRequest,
): Promise<boolean> {
  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) return false;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    let userId: string | null = user?.id ?? null;
    let ipHash: string | null = null;
    if (!userId) {
      const ip = request
        ? ipFromHeaders(request.headers)
        : ipFromHeaders(await headers());
      if (!ip) return false;
      ipHash = hashIp(ip);
    }
    const { data, error } = await supabase.rpc("record_content_event", {
      p_content_type: contentType,
      p_content_id: contentId,
      p_event_type: eventType,
      p_user_id: userId,
      p_ip_hash: ipHash,
    });
    if (error) return false;
    return data === true;
  } catch {
    return false;
  }
}
