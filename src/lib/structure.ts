import {
  disciplines,
  kindLabel,
  type CampusName,
  type Discipline,
} from "./disciplines";
import { createServerSupabaseClient } from "./supabase/server";
import type { Campus, DepartmentRow, SemesterRow, SubjectRow } from "./supabase/types";

/**
 * University structure, read from Supabase when configured and merged
 * with the editorial descriptions in disciplines.ts (the database
 * stores names/slugs/campus/kind only). When Supabase is not
 * configured, or a query fails, the static seed data is returned, so
 * the build never depends on a live database.
 */
export async function getDisciplines(): Promise<Discipline[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return disciplines;
  try {
    const { data, error } = await supabase
      .from("departments")
      .select("id, name, slug, kind, campuses(name)")
      .order("name");
    if (error || !data || data.length === 0) return disciplines;
    const merged: Discipline[] = [];
    for (const row of data as unknown as Array<
      DepartmentRow & { campuses: { name: string } | null }
    >) {
      const campusName = (row.campuses?.name ?? "Peshawar") as CampusName;
      const editorial = disciplines.find((d) => d.slug === row.slug);
      merged.push(
        editorial ?? {
          slug: row.slug,
          name: row.name,
          campus: campusName,
          kind: row.kind,
          summary: `${kindLabel[row.kind]} at UET Peshawar, ${campusName} Campus.`,
          overview: `${row.name} at UET Peshawar, ${campusName} Campus.`,
          focusAreas: [],
          typicalRoles: [],
        },
      );
    }
    return merged;
  } catch {
    return disciplines;
  }
}

export async function getDisciplineBySlug(slug: string): Promise<Discipline | undefined> {
  const all = await getDisciplines();
  return all.find((d) => d.slug === slug);
}

/**
 * The departments row for a slug, with its database id. The editorial
 * Discipline from getDisciplineBySlug carries no DB id, and papers are
 * queried by department_id — so the resources section needs this.
 * Returns null when Supabase is not configured or the slug has no row.
 */
export async function getDepartmentRowBySlug(slug: string): Promise<DepartmentRow | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("departments")
      .select("id, campus_id, name, slug, kind")
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) return null;
    return data as DepartmentRow;
  } catch {
    return null;
  }
}

export async function getCampuses(): Promise<Campus[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return [
      { id: "peshawar", name: "Peshawar", slug: "peshawar" },
      { id: "abbottabad", name: "Abbottabad", slug: "abbottabad" },
      { id: "bannu", name: "Bannu", slug: "bannu" },
      { id: "jalozai", name: "Jalozai (Nowshera)", slug: "jalozai" },
    ];
  }
  try {
    const { data, error } = await supabase
      .from("campuses")
      .select("id, name, slug")
      .order("name");
    if (error || !data) throw new Error("campus query failed");
    return data as Campus[];
  } catch {
    return [];
  }
}

export async function getDepartments(): Promise<DepartmentRow[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("departments")
      .select("id, campus_id, name, slug, kind")
      .order("name");
    if (error || !data) return [];
    return data as DepartmentRow[];
  } catch {
    return [];
  }
}

export async function getSemesters(): Promise<SemesterRow[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("semesters")
      .select("id, number, label")
      .order("number");
    if (error || !data) return [];
    return data as SemesterRow[];
  } catch {
    return [];
  }
}

export async function getSubjects(
  departmentId?: string,
  semesterId?: string,
): Promise<SubjectRow[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];
  try {
    let query = supabase
      .from("subjects")
      .select("id, department_id, semester_id, code, name")
      .order("code");
    if (departmentId) query = query.eq("department_id", departmentId);
    if (semesterId) query = query.eq("semester_id", semesterId);
    const { data, error } = await query;
    if (error || !data) return [];
    return data as SubjectRow[];
  } catch {
    return [];
  }
}
