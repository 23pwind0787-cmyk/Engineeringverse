import "server-only";

import { createServerSupabaseClient, isSupabaseConfigured } from "./supabase/server";
import { searchPapers } from "./papers";
import { searchProjects } from "./projects";
import type {
  ContributorBadges,
  ContributorStat,
  LeaderboardPeriod,
  Paper,
  Project,
  SiteEvent,
} from "./supabase/types";

/**
 * Leaderboard + contributor profiles (Phase 7), read from the Stage 9
 * live views `contributor_stats` and `contributor_badges`. Both views
 * are computed at query time from approved, visible uploads only, so
 * rankings can never be inflated by removed content or refresh spam —
 * downloads only count while the content is approved and visible.
 * Empty when Supabase is not configured, or before the Phase 2
 * migrations are applied.
 */

export interface LeaderboardEntry {
  stat: ContributorStat;
  badges: string[];
}

export interface ContributorProfile {
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  /** All-time stats row; null when the user has no approved uploads. */
  stat: ContributorStat | null;
  /** All-time badges (empty when the user earned none). */
  badges: string[];
  papers: Paper[];
  projects: Project[];
  events: SiteEvent[];
}

/** Ranked contributors for one period, most approved uploads first. */
export async function getLeaderboard(
  period: LeaderboardPeriod,
  limit = 50,
): Promise<LeaderboardEntry[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("contributor_stats")
      .select(
        "user_id, display_name, avatar_url, period, approved_uploads, approved_projects, approved_research_uploads, total_downloads, top_department_id, top_department_name",
      )
      .eq("period", period)
      .order("approved_uploads", { ascending: false })
      .order("total_downloads", { ascending: false })
      .limit(limit);
    if (error || !data || data.length === 0) return [];
    const stats = data as ContributorStat[];
    const badgesByUser = new Map<string, string[]>();
    const { data: badgeRows } = await supabase
      .from("contributor_badges")
      .select("user_id, badges")
      .eq("period", period)
      .in(
        "user_id",
        stats.map((s) => s.user_id),
      );
    for (const row of (badgeRows ?? []) as ContributorBadges[]) {
      badgesByUser.set(row.user_id, row.badges ?? []);
    }
    return stats.map((stat) => ({
      stat,
      badges: badgesByUser.get(stat.user_id) ?? [],
    }));
  } catch {
    return [];
  }
}

const EVENT_SELECT =
  "id, uploader_id, organiser_department_id, organiser_name, title, description, event_type, starts_at, ends_at, venue, online_link, registration_link, poster_path, contact_info, status, hidden, moderation_note, view_count, created_at, updated_at, departments(name)";

type EventRow = Omit<SiteEvent, "organiser_department_name" | "uploader_name"> & {
  departments: { name: string } | null;
};

function withEventLabels(row: EventRow): SiteEvent {
  const { departments, ...rest } = row;
  return {
    ...rest,
    organiser_department_name: departments?.name ?? null,
    uploader_name: null,
  };
}

/**
 * One contributor's public profile: all-time stats + badges, and
 * their approved papers, projects and events. Events are queried
 * directly from the events table here (approved + visible only) —
 * lib/events.ts is owned by another phase and is not imported.
 *
 * A user with no approved uploads has no stats row; that is the
 * honest "no public contributions yet" state, not an error.
 */
export async function getContributorProfile(userId: string): Promise<ContributorProfile> {
  const empty: ContributorProfile = {
    userId,
    displayName: null,
    avatarUrl: null,
    stat: null,
    badges: [],
    papers: [],
    projects: [],
    events: [],
  };
  if (!isSupabaseConfigured()) return empty;
  const supabase = await createServerSupabaseClient();
  if (!supabase) return empty;
  try {
    const [{ data: statRow }, { data: badgeRow }] = await Promise.all([
      supabase
        .from("contributor_stats")
        .select(
          "user_id, display_name, avatar_url, period, approved_uploads, approved_projects, approved_research_uploads, total_downloads, top_department_id, top_department_name",
        )
        .eq("period", "all_time")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("contributor_badges")
        .select("user_id, badges")
        .eq("period", "all_time")
        .eq("user_id", userId)
        .maybeSingle(),
    ]);
    const stat = (statRow ?? null) as ContributorStat | null;
    const badges = ((badgeRow as ContributorBadges | null)?.badges ?? []) as string[];

    const [papers, projects, eventsResult] = await Promise.all([
      searchPapers({ uploaderId: userId, sort: "recent" }),
      searchProjects({ uploaderId: userId, sort: "recent" }),
      supabase
        .from("events")
        .select(EVENT_SELECT)
        .eq("uploader_id", userId)
        .eq("status", "approved")
        .eq("hidden", false)
        .order("starts_at", { ascending: false })
        .limit(50),
    ]);
    const events = ((eventsResult.data ?? []) as unknown as EventRow[]).map(withEventLabels);

    return {
      userId,
      displayName: stat?.display_name ?? null,
      avatarUrl: stat?.avatar_url ?? null,
      stat,
      badges,
      papers,
      projects,
      events,
    };
  } catch {
    return empty;
  }
}

/** Initials for the fallback avatar circle (never a stock photo). */
export function initialsFor(displayName: string | null): string {
  if (!displayName) return "?";
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const AVATAR_COLORS = [
  "bg-blue-600",
  "bg-emerald-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-violet-600",
  "bg-teal-600",
  "bg-orange-600",
  "bg-cyan-600",
] as const;

/** Deterministic fallback-avatar colour for a user id. */
export function avatarColorClass(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}
