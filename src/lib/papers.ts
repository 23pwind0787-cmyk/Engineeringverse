import { createServerSupabaseClient, isSupabaseConfigured } from "./supabase/server";
import type { Paper } from "./supabase/types";

export interface PaperFilters {
  campusId?: string;
  departmentId?: string;
  semesterId?: string;
  subjectId?: string;
  subjectCode?: string;
  examType?: string;
  year?: string;
  session?: string;
  query?: string;
}

const PAPER_SELECT =
  "id, uploader_id, campus_id, department_id, semester_id, subject_id, title, subject_code, exam_type, year, session, storage_path, file_size, page_count, download_count, status, created_at, campuses(name), departments(name), semesters(number), subjects(name)";

type PaperRow = Omit<Paper, "campus_name" | "department_name" | "semester_number" | "subject_name"> & {
  campuses: { name: string } | null;
  departments: { name: string } | null;
  semesters: { number: number } | null;
  subjects: { name: string } | null;
};

function withLabels(row: PaperRow): Paper {
  const { campuses, departments, semesters, subjects, ...rest } = row;
  return {
    ...rest,
    campus_name: campuses?.name,
    department_name: departments?.name,
    semester_number: semesters?.number,
    subject_name: subjects?.name ?? null,
  };
}

/** Published papers matching the filters. Empty when Supabase is not configured. */
export async function searchPapers(filters: PaperFilters): Promise<Paper[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];
  try {
    let query = supabase
      .from("papers")
      .select(PAPER_SELECT)
      .eq("status", "published")
      .order("created_at", { ascending: false });
    if (filters.campusId) query = query.eq("campus_id", filters.campusId);
    if (filters.departmentId) query = query.eq("department_id", filters.departmentId);
    if (filters.semesterId) query = query.eq("semester_id", filters.semesterId);
    if (filters.subjectId) query = query.eq("subject_id", filters.subjectId);
    if (filters.subjectCode) query = query.ilike("subject_code", `%${filters.subjectCode}%`);
    if (filters.examType) query = query.eq("exam_type", filters.examType);
    if (filters.year) query = query.eq("year", Number(filters.year));
    if (filters.session) query = query.eq("session", filters.session);
    if (filters.query) query = query.ilike("title", `%${filters.query}%`);
    const { data, error } = await query.limit(100);
    if (error || !data) return [];
    return (data as unknown as PaperRow[]).map(withLabels);
  } catch {
    return [];
  }
}

export async function getPaper(id: string): Promise<Paper | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("papers")
    .select(PAPER_SELECT)
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();
  if (error || !data) return null;
  return withLabels(data as unknown as PaperRow);
}

export async function getPaperIds(): Promise<string[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("papers")
    .select("id")
    .eq("status", "published")
    .limit(1000);
  return (data ?? []).map((row) => row.id as string);
}
