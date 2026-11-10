export type UserRole = "student" | "admin";
export type EntryKind = "department" | "centre" | "programme";
export type ExamType = "Mid" | "Final" | "Quiz" | "Other";
export type SessionLabel = "Spring" | "Fall" | "Summer" | "Annual";
export type ReportStatus = "open" | "resolved" | "dismissed";

/** Approval workflow for resources, projects and events (Stage 5/6). */
export type ModerationStatus = "pending" | "approved" | "rejected";

/** The seven department resource categories (Stage 5). */
export type ResourceCategory =
  | "past_paper"
  | "oel"
  | "lab_report"
  | "book"
  | "assignment_notes"
  | "fyp"
  | "other";

export type ProjectCategory =
  | "innovative"
  | "fyp"
  | "research"
  | "industrial_automation"
  | "robotics_ai"
  | "mechanical_design"
  | "electrical_electronics"
  | "software_tech"
  | "industrial_engineering"
  | "student_innovation";

export type EventType =
  | "seminar"
  | "workshop"
  | "webinar"
  | "industrial_visit"
  | "conference"
  | "career_event"
  | "competition"
  | "training"
  | "university_event";

export type ContentType = "paper" | "project" | "event";
export type ContentEventType = "download" | "view";
export type ModerationTarget = "paper" | "project" | "event" | "report" | "user";
export type ModerationAction =
  | "approve"
  | "reject"
  | "hide"
  | "unhide"
  | "dismiss_report"
  | "remove"
  | "restore";

/**
 * The six canonical report reasons the report form offers (Stage 7).
 * The column itself stays free text so historic rows are preserved.
 */
export type ReportReason =
  | "incorrect_info"
  | "duplicate"
  | "copyright"
  | "broken_file"
  | "inappropriate"
  | "spam";

export const REPORT_REASONS: Array<{ value: ReportReason; label: string }> = [
  { value: "incorrect_info", label: "Incorrect or misleading information" },
  { value: "duplicate", label: "Duplicate upload" },
  { value: "copyright", label: "Copyright violation" },
  { value: "broken_file", label: "Broken or corrupted file" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "spam", label: "Spam or fake submission" },
];

export const RESOURCE_CATEGORIES: Array<{ value: ResourceCategory; label: string }> = [
  { value: "past_paper", label: "Past Papers" },
  { value: "oel", label: "OEL / Open-Ended Lab" },
  { value: "lab_report", label: "Lab Reports" },
  { value: "book", label: "PDF Books" },
  { value: "assignment_notes", label: "Assignments & Notes" },
  { value: "fyp", label: "Final Year Projects" },
  { value: "other", label: "Other Resources" },
];

export const PROJECT_CATEGORIES: Array<{ value: ProjectCategory; label: string }> = [
  { value: "innovative", label: "Innovative Engineering Project" },
  { value: "fyp", label: "Final Year Project" },
  { value: "research", label: "Research-Based Project" },
  { value: "industrial_automation", label: "Industrial Automation" },
  { value: "robotics_ai", label: "Robotics and AI" },
  { value: "mechanical_design", label: "Mechanical Design" },
  { value: "electrical_electronics", label: "Electrical and Electronics" },
  { value: "software_tech", label: "Software and Technology" },
  { value: "industrial_engineering", label: "Industrial Engineering" },
  { value: "student_innovation", label: "Student Innovation / Prototype" },
];

export const EVENT_TYPES: Array<{ value: EventType; label: string }> = [
  { value: "seminar", label: "Seminar" },
  { value: "workshop", label: "Technical Workshop" },
  { value: "webinar", label: "Webinar" },
  { value: "industrial_visit", label: "Industrial Visit" },
  { value: "conference", label: "Conference" },
  { value: "career_event", label: "Career Event" },
  { value: "competition", label: "Competition" },
  { value: "training", label: "Training Session" },
  { value: "university_event", label: "University Event" },
];

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  role: UserRole;
  avatar_url?: string | null;
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
  semester_id: string | null;
  subject_id: string | null;
  title: string;
  subject_code: string | null;
  exam_type: ExamType | null;
  year: number | null;
  session: SessionLabel | null;
  storage_path: string;
  file_size: number;
  page_count: number | null;
  download_count: number;
  view_count: number;
  category: ResourceCategory;
  description: string | null;
  hidden: boolean;
  moderation_note: string | null;
  file_hash: string | null;
  status: ModerationStatus;
  created_at: string;
  // Joined labels, populated by the data layer when available.
  campus_name?: string;
  department_name?: string;
  semester_number?: number | null;
  subject_name?: string | null;
  uploader_name?: string | null;
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

export interface Project {
  id: string;
  uploader_id: string;
  campus_id: string;
  department_id: string;
  title: string;
  description: string;
  team_members: string[];
  supervisor: string | null;
  category: ProjectCategory;
  media_paths: string[];
  report_path: string | null;
  tools: string[];
  outcomes: string | null;
  status: ModerationStatus;
  hidden: boolean;
  moderation_note: string | null;
  download_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
  campus_name?: string;
  department_name?: string;
  uploader_name?: string | null;
}

export interface SiteEvent {
  id: string;
  uploader_id: string;
  organiser_department_id: string | null;
  organiser_name: string;
  title: string;
  description: string;
  event_type: EventType;
  starts_at: string;
  ends_at: string | null;
  venue: string | null;
  online_link: string | null;
  registration_link: string | null;
  poster_path: string | null;
  contact_info: string | null;
  status: ModerationStatus;
  hidden: boolean;
  moderation_note: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
  organiser_department_name?: string | null;
  uploader_name?: string | null;
}

export interface ContentReport {
  id: string;
  content_type: ContentType;
  content_id: string;
  reporter_id: string | null;
  reason: string;
  details: string | null;
  status: ReportStatus;
  created_at: string;
  content_title?: string;
  reporter_name?: string | null;
}

export interface ModerationLogEntry {
  id: string;
  admin_id: string;
  target_type: ModerationTarget;
  target_id: string;
  action: ModerationAction;
  note: string | null;
  created_at: string;
  admin_name?: string | null;
}

export type LeaderboardPeriod = "week" | "month" | "all_time";

export interface ContributorStat {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  period: LeaderboardPeriod;
  approved_uploads: number;
  approved_projects: number;
  approved_research_uploads: number;
  total_downloads: number;
  top_department_id: string | null;
  top_department_name: string | null;
}

export interface ContributorBadges {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  period: LeaderboardPeriod;
  badges: string[];
}
