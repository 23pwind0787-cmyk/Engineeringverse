export type UserRole = "student" | "admin";
export type EntryKind = "department" | "centre" | "programme";
export type ExamType = "Mid" | "Final" | "Quiz" | "Other";
export type SessionLabel = "Spring" | "Fall" | "Summer" | "Annual";
export type ReportStatus = "open" | "resolved" | "dismissed";

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  role: UserRole;
  created_at: string;
}

export interface Campus {
  id: string;
  name: string;
  slug: string;
}

export interface DepartmentRow {
  id: string;
  campus_id: string;
  name: string;
  slug: string;
  kind: EntryKind;
}

export interface SemesterRow {
  id: string;
  number: number;
  label: string;
}

export interface SubjectRow {
  id: string;
  department_id: string;
  semester_id: string;
  code: string;
  name: string;
}

export interface Paper {
  id: string;
  uploader_id: string;
  campus_id: string;
  department_id: string;
  semester_id: string;
  subject_id: string | null;
  title: string;
  subject_code: string;
  exam_type: ExamType;
  year: number;
  session: SessionLabel;
  storage_path: string;
  file_size: number;
  page_count: number | null;
  download_count: number;
  status: "published";
  created_at: string;
  // Joined labels, populated by the data layer when available.
  campus_name?: string;
  department_name?: string;
  semester_number?: number;
  subject_name?: string | null;
}

export interface PaperReport {
  id: string;
  paper_id: string;
  reporter_id: string | null;
  reason: string;
  status: ReportStatus;
  created_at: string;
  paper_title?: string;
}
