import "server-only";

import { createServerSupabaseClient, isSupabaseConfigured } from "./supabase/server";

/**
 * Contributor display names come from the public contributor_stats
 * view (Stage 9): it exposes only the public leaderboard fields
 * (name, avatar, department, counts) and is readable by everyone.
 * Profiles themselves are not publicly readable, so names are never
 * joined from the profiles table on public pages.
 */
export async function getContributorNames(
  userIds: string[],
): Promise<Map<string, { display_name: string | null; avatar_url: string | null }>> {
  const names = new Map<string, { display_name: string | null; avatar_url: string | null }>();
  const unique = [...new Set(userIds.filter(Boolean))];
  if (unique.length === 0) return names;
  if (!isSupabaseConfigured()) return names;
  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) return names;
    const { data, error } = await supabase
      .from("contributor_stats")
      .select("user_id, display_name, avatar_url")
      .eq("period", "all_time")
      .in("user_id", unique);
    if (error || !data) return names;
    for (const row of data as Array<{ user_id: string; display_name: string | null; avatar_url: string | null }>) {
      names.set(row.user_id, { display_name: row.display_name, avatar_url: row.avatar_url });
    }
  } catch {
    // The leaderboard view does not exist until the Phase 2
    // migrations are applied; names are best-effort until then.
  }
  return names;
}
