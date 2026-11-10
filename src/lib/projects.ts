import { createServerSupabaseClient, isSupabaseConfigured } from "./supabase/server";
import { createServiceRoleClient, isServiceRoleConfigured } from "./supabase/admin";
import { getContributorNames } from "./contributors";
import type { Project, ProjectCategory } from "./supabase/types";

export interface ProjectFilters {
  campusId?: string;
  departmentId?: string;
  category?: ProjectCategory;
  query?: string;
  /** Only projects uploaded by this user (public, approved listings). */
  uploaderId?: string;
  /** "recent" (default) or "popular" (most downloaded first). */
  sort?: "recent" | "popular";
}

const PROJECT_SELECT =
  "id, uploader_id, campus_id, department_id, title, description, team_members, supervisor, category, media_paths, report_path, tools, outcomes, status, hidden, moderation_note, download_count, view_count, created_at, updated_at, campuses(name), departments(name)";

type ProjectRow = Omit<Project, "campus_name" | "department_name" | "uploader_name"> & {
  campuses: { name: string } | null;
  departments: { name: string } | null;
};

function withLabels(row: ProjectRow, uploaderName?: string | null): Project {
  const { campuses, departments, ...rest } = row;
  return {
    ...rest,
    campus_name: campuses?.name,
    department_name: departments?.name,
    uploader_name: uploaderName ?? null,
  };
}

async function attachUploaderNames(projects: Project[]): Promise<Project[]> {
  if (projects.length === 0) return projects;
  const names = await getContributorNames(projects.map((p) => p.uploader_id));
  return projects.map((p) => ({
    ...p,
    uploader_name: names.get(p.uploader_id)?.display_name ?? p.uploader_name ?? null,
  }));
}

function escapeLike(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

/**
 * Public listings: approved, not hidden projects only. Empty when
 * Supabase is not configured.
 */
export async function searchProjects(filters: ProjectFilters): Promise<Project[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];
  try {
    let query = supabase
      .from("projects")
      .select(PROJECT_SELECT)
      .eq("status", "approved")
      .eq("hidden", false);
    if (filters.sort === "popular") {
      query = query.order("download_count", { ascending: false });
    }
    query = query.order("created_at", { ascending: false });
    if (filters.campusId) query = query.eq("campus_id", filters.campusId);
    if (filters.departmentId) query = query.eq("department_id", filters.departmentId);
    if (filters.category) query = query.eq("category", filters.category);
    if (filters.uploaderId) query = query.eq("uploader_id", filters.uploaderId);
    if (filters.query) {
      const q = escapeLike(filters.query.trim());
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
    }
    const { data, error } = await query.limit(100);
    if (error || !data) return [];
    const projects = (data as unknown as ProjectRow[]).map((row) => withLabels(row));
    return attachUploaderNames(projects);
  } catch {
    return [];
  }
}

/** One public project by id. Returns null unless it is approved and visible. */
export async function getProject(id: string): Promise<Project | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_SELECT)
    .eq("id", id)
    .eq("status", "approved")
    .eq("hidden", false)
    .maybeSingle();
  if (error || !data) return null;
  const [project] = await attachUploaderNames([withLabels(data as unknown as ProjectRow)]);
  return project;
}

/**
 * A project for its owner or an admin: any status, including pending
 * and rejected, so owners can review their own submissions.
 *
 * NOTE (Phase 2 RLS gap): the Stage 6 policies let owners update and
 * delete their own pending rows but give them no SELECT policy, so the
 * anon client cannot read a pending row at all. The service-role
 * client is used here, server-side only, and the row is only returned
 * when the viewer owns it or is an admin.
 */
export async function getProjectForViewer(
  id: string,
  viewerId: string | null,
  viewerIsAdmin: boolean,
): Promise<Project | null> {
  if (!isServiceRoleConfigured()) return getProject(id);
  try {
    const service = createServiceRoleClient();
    const { data, error } = await service
      .from("projects")
      .select(PROJECT_SELECT)
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    const row = data as unknown as ProjectRow;
    const isOwner = viewerId !== null && row.uploader_id === viewerId;
    const publiclyVisible = row.status === "approved" && !row.hidden;
    if (!publiclyVisible && !isOwner && !viewerIsAdmin) return null;
    const [project] = await attachUploaderNames([withLabels(row)]);
    return project;
  } catch {
    return getProject(id);
  }
}

/** Approved, visible project ids (sitemap). */
export async function getProjectIds(): Promise<string[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("projects")
    .select("id")
    .eq("status", "approved")
    .eq("hidden", false)
    .limit(1000);
  return (data ?? []).map((row) => row.id as string);
}

/**
 * Everything one user submitted, any status — the dashboard's "my
 * submissions" list. Same RLS-gap note as getProjectForViewer: read
 * through the service-role client, filtered server-side to the owner.
 */
export async function getOwnProjects(userId: string): Promise<Project[]> {
  if (!isServiceRoleConfigured()) return [];
  try {
    const service = createServiceRoleClient();
    const { data, error } = await service
      .from("projects")
      .select(PROJECT_SELECT)
      .eq("uploader_id", userId)
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return (data as unknown as ProjectRow[]).map((row) => withLabels(row));
  } catch {
    return [];
  }
}
