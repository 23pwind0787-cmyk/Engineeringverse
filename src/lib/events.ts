import { createServerSupabaseClient, isSupabaseConfigured } from "./supabase/server";
import { createServiceRoleClient, isServiceRoleConfigured } from "./supabase/admin";
import { getContributorNames } from "./contributors";
import type { EventType, SiteEvent } from "./supabase/types";

export interface EventFilters {
  query?: string;
  eventType?: EventType;
  organiserDepartmentId?: string;
  /** true = starts_at >= now, false = starts_at < now. */
  upcoming?: boolean;
  /** "recent" (default, newest created first) or "starting" (soonest start first). */
  sort?: "recent" | "starting";
}

const EVENT_SELECT =
  "id, uploader_id, organiser_department_id, organiser_name, title, description, event_type, starts_at, ends_at, venue, online_link, registration_link, poster_path, contact_info, status, hidden, moderation_note, view_count, created_at, updated_at, departments(name)";

type EventRow = Omit<
  SiteEvent,
  "organiser_department_name" | "uploader_name"
> & {
  departments: { name: string } | null;
};

function withLabels(row: EventRow, uploaderName?: string | null): SiteEvent {
  const { departments, ...rest } = row;
  return {
    ...rest,
    organiser_department_name: departments?.name ?? null,
    uploader_name: uploaderName ?? null,
  };
}

async function attachUploaderNames(events: SiteEvent[]): Promise<SiteEvent[]> {
  if (events.length === 0) return events;
  const names = await getContributorNames(events.map((e) => e.uploader_id));
  return events.map((e) => ({
    ...e,
    uploader_name: names.get(e.uploader_id)?.display_name ?? e.uploader_name ?? null,
  }));
}

/** Escape LIKE wildcards in a user-supplied search term. */
function escapeLike(term: string): string {
  return term.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

/**
 * Public listings: approved, not hidden events only. Upcoming vs past
 * is derived from starts_at at query time — no flag is stored.
 * Empty when Supabase is not configured.
 */
export async function searchEvents(filters: EventFilters): Promise<SiteEvent[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];
  try {
    let query = supabase
      .from("events")
      .select(EVENT_SELECT)
      .eq("status", "approved")
      .eq("hidden", false);
    const now = new Date().toISOString();
    if (filters.upcoming === true) query = query.gte("starts_at", now);
    if (filters.upcoming === false) query = query.lt("starts_at", now);
    if (filters.sort === "starting") {
      query = query.order("starts_at", { ascending: true });
    } else {
      query = query.order("created_at", { ascending: false });
    }
    if (filters.eventType) query = query.eq("event_type", filters.eventType);
    if (filters.organiserDepartmentId) {
      query = query.eq("organiser_department_id", filters.organiserDepartmentId);
    }
    if (filters.query) {
      const term = escapeLike(filters.query.trim());
      query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
    }
    const { data, error } = await query.limit(100);
    if (error || !data) return [];
    const events = (data as unknown as EventRow[]).map((row) => withLabels(row));
    return attachUploaderNames(events);
  } catch {
    return [];
  }
}

/** One public event by id. Returns null unless it is approved and visible. */
export async function getEvent(id: string): Promise<SiteEvent | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_SELECT)
    .eq("id", id)
    .eq("status", "approved")
    .eq("hidden", false)
    .maybeSingle();
  if (error || !data) return null;
  const [event] = await attachUploaderNames([withLabels(data as unknown as EventRow)]);
  return event;
}

/**
 * An event for its owner or an admin: any status, including pending
 * and rejected, so owners can review their own submissions.
 *
 * NOTE (Phase 2 RLS gap): the Stage 6 policies let owners update and
 * delete their own pending rows but give them no SELECT policy, so the
 * anon client cannot read a pending row at all. The service-role
 * client is used here, server-side only, and the row is only returned
 * when the viewer owns it or is an admin — the same pattern as
 * getPaperForViewer in src/lib/papers.ts.
 */
export async function getEventForViewer(
  id: string,
  viewerId: string | null,
  viewerIsAdmin: boolean,
): Promise<SiteEvent | null> {
  if (!isServiceRoleConfigured()) return getEvent(id);
  try {
    const service = createServiceRoleClient();
    const { data, error } = await service
      .from("events")
      .select(EVENT_SELECT)
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    const row = data as unknown as EventRow;
    const isOwner = viewerId !== null && row.uploader_id === viewerId;
    const publiclyVisible = row.status === "approved" && !row.hidden;
    if (!publiclyVisible && !isOwner && !viewerIsAdmin) return null;
    const [event] = await attachUploaderNames([withLabels(row)]);
    return event;
  } catch {
    return getEvent(id);
  }
}

/**
 * Everything one user submitted, any status — the dashboard's "my
 * submissions" list. Same RLS-gap note as getEventForViewer: read
 * through the service-role client, filtered server-side to the owner.
 */
export async function getOwnEvents(userId: string): Promise<SiteEvent[]> {
  if (!isServiceRoleConfigured()) return [];
  try {
    const service = createServiceRoleClient();
    const { data, error } = await service
      .from("events")
      .select(EVENT_SELECT)
      .eq("uploader_id", userId)
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return (data as unknown as EventRow[]).map((row) => withLabels(row));
  } catch {
    return [];
  }
}

/** Approved, visible upcoming events, soonest first. */
export async function listUpcomingEvents(limit = 10): Promise<SiteEvent[]> {
  const events = await searchEvents({ upcoming: true, sort: "starting" });
  return events.slice(0, limit);
}

/** Approved, visible past events, most recently started first. */
export async function listPastEvents(limit = 10): Promise<SiteEvent[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("events")
      .select(EVENT_SELECT)
      .eq("status", "approved")
      .eq("hidden", false)
      .lt("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    const events = (data as unknown as EventRow[]).map((row) => withLabels(row));
    return attachUploaderNames(events);
  } catch {
    return [];
  }
}

/** Approved, visible event ids (sitemap). */
export async function getEventIds(): Promise<string[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("events")
    .select("id")
    .eq("status", "approved")
    .eq("hidden", false)
    .limit(1000);
  return (data ?? []).map((row) => row.id as string);
}

/** "Sat, 15 Nov 2026, 2:30 PM" in Asia/Karachi time. */
export function formatEventDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Karachi",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

/** "15 Nov 2026" in Asia/Karachi time (short date for cards). */
export function formatEventDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Karachi",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/**
 * Interpret a datetime-local value ("2026-11-15T14:30") as a wall
 * time in Asia/Karachi (UTC+5, no DST) and return an ISO string.
 * Returns null for an unparseable value.
 */
export function parseKarachiDateTime(value: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value.trim());
  if (!match) return null;
  const [, y, mo, d, h, mi, s] = match;
  const utc = Date.UTC(
    Number(y),
    Number(mo) - 1,
    Number(d),
    Number(h) - 5,
    Number(mi),
    Number(s ?? 0),
  );
  const date = new Date(utc);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** Convert an ISO timestamp to a datetime-local value in Asia/Karachi time. */
export function toDateTimeLocalValue(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}
