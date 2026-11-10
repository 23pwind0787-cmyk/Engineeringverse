import { createServerSupabaseClient, isSupabaseConfigured } from "./supabase/server";
import { createServiceRoleClient, isServiceRoleConfigured } from "./supabase/admin";
import { getContributorNames } from "./contributors";
import type { Paper, ResourceCategory } from "./supabase/types";

export interface PaperFilters {
  campusId?: string;
  departmentId?: string;
  semesterId?: string;
  subjectId?: string;
  subjectCode?: string;
  examType?: string;
  year?: string;
  session?: string;
  category?: ResourceCategory;
  query?: string;
  /** Only resources uploaded by this user (public, approved listings). */
  uploaderId?: string;
  /** "recent" (default) or "popular" (most downloaded first). */
  sort?: "recent" | "popular";
}

const PAPER_SELECT =
  "id, uploader_id, campus_id, department_id, semester_id, subject_id, title, subject_code, exam_type, year, session, storage_path, file_size, page_count, download_count, view_count, category, description, hidden, moderation_note, file_hash, status, created_at, campuses(name), departments(name), semesters(number), subjects(name)";

type PaperRow = Omit<Paper, "campus_name" | "department_name" | "semester_number" | "subject_name" | "uploader_name"> & {
  campuses: { name: string } | null;
  departments: { name: string } | null;
  semesters: { number: number } | null;
  subjects: { name: string } | null;
};

function withLabels(row: PaperRow, uploaderName?: string | null): Paper {
  const { campuses, departments, semesters, subjects, ...rest } = row;
  return {
    ...rest,
    campus_name: campuses?.name,
    department_name: departments?.name,
    semester_number: semesters?.number ?? null,
    subject_name: subjects?.name ?? null,
    uploader_name: uploaderName ?? null,
  };
}

async function attachUploaderNames(papers: Paper[]): Promise<Paper[]> {
  if (papers.length === 0) return papers;
  const names = await getContributorNames(papers.map((p) => p.uploader_id));
  return papers.map((p) => ({
    ...p,
    uploader_name: names.get(p.uploader_id)?.display_name ?? p.uploader_name ?? null,
  }));
}

/**
 * Public listings: approved, not hidden resources only. Empty when
 * Supabase is not configured.
 */
export async function searchPapers(filters: PaperFilters): Promise<Paper[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];
  try {
    let query = supabase
      .from("papers")
      .select(PAPER_SELECT)
      .eq("status", "approved")
      .eq("hidden", false);
    if (filters.sort === "popular") {
      query = query.order("download_count", { ascending: false });
    }
    query = query.order("created_at", { ascending: false });
    if (filters.campusId) query = query.eq("campus_id", filters.campusId);
    if (filters.departmentId) query = query.eq("department_id", filters.departmentId);
    if (filters.semesterId) query = query.eq("semester_id", filters.semesterId);
    if (filters.subjectId) query = query.eq("subject_id", filters.subjectId);
    if (filters.subjectCode) query = query.ilike("subject_code", `%${filters.subjectCode}%`);
    if (filters.examType) query = query.eq("exam_type", filters.examType);
    if (filters.year) query = query.eq("year", Number(filters.year));
    if (filters.session) query = query.eq("session", filters.session);
    if (filters.category) query = query.eq("category", filters.category);
    if (filters.uploaderId) query = query.eq("uploader_id", filters.uploaderId);
    if (filters.query) query = query.ilike("title", `%${filters.query}%`);
    const { data, error } = await query.limit(100);
    if (error || !data) return [];
    const papers = (data as unknown as PaperRow[]).map((row) => withLabels(row));
    return attachUploaderNames(papers);
  } catch {
    return [];
  }
}

/** One public resource by id. Returns null unless it is approved and visible. */
export async function getPaper(id: string): Promise<Paper | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("papers")
    .select(PAPER_SELECT)
    .eq("id", id)
    .eq("status", "approved")
    .eq("hidden", false)
    .maybeSingle();
  if (error || !data) return null;
  const [paper] = await attachUploaderNames([withLabels(data as unknown as PaperRow)]);
  return paper;
}

/**
 * A resource for its owner or an admin: any status, including pending
 * and rejected, so owners can review their own submissions.
 *
 * NOTE (Phase 2 RLS gap): the Stage 5 policies let owners update and
 * delete their own pending rows but give them no SELECT policy, so the
 * anon client cannot read a pending row at all. The service-role
 * client is used here, server-side only, and the row is only returned
 * when the viewer owns it or is an admin.
 */
export async function getPaperForViewer(
  id: string,
  viewerId: string | null,
  viewerIsAdmin: boolean,
): Promise<Paper | null> {
  if (!isServiceRoleConfigured()) return getPaper(id);
  try {
    const service = createServiceRoleClient();
    const { data, error } = await service
      .from("papers")
      .select(PAPER_SELECT)
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    const row = data as unknown as PaperRow;
    const isOwner = viewerId !== null && row.uploader_id === viewerId;
    const publiclyVisible = row.status === "approved" && !row.hidden;
    if (!publiclyVisible && !isOwner && !viewerIsAdmin) return null;
    const [paper] = await attachUploaderNames([withLabels(row)]);
    return paper;
  } catch {
    return getPaper(id);
  }
}

/** Approved, visible paper ids (sitemap). */
export async function getPaperIds(): Promise<string[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("papers")
    .select("id")
    .eq("status", "approved")
    .eq("hidden", false)
    .limit(1000);
  return (data ?? []).map((row) => row.id as string);
}

/**
 * Everything one user uploaded, any status — the dashboard's "my
 * submissions" list. Same RLS-gap note as getPaperForViewer: read
 * through the service-role client, filtered server-side to the owner.
 */
export async function getOwnPapers(userId: string): Promise<Paper[]> {
  if (!isServiceRoleConfigured()) return [];
  try {
    const service = createServiceRoleClient();
    const { data, error } = await service
      .from("papers")
      .select(PAPER_SELECT)
      .eq("uploader_id", userId)
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return (data as unknown as PaperRow[]).map((row) => withLabels(row));
  } catch {
    return [];
  }
}

/** Most downloaded approved resources, optionally within one department. */
export async function getPopularResources(
  limit = 10,
  departmentId?: string,
): Promise<Paper[]> {
  return searchPapers({ sort: "popular", departmentId }).then((papers) => papers.slice(0, limit));
}
