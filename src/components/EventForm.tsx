"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitEvent, updateOwnEvent } from "@/lib/actions/events";
import { EVENT_TYPES, type DepartmentRow, type SiteEvent } from "@/lib/supabase/types";

const fieldClass = "mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm";

/** ISO timestamp -> datetime-local value in Asia/Karachi time (edit mode only). */
function toDateTimeLocalValue(iso: string): string {
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

/** The fields EventForm can be pre-filled with (edit mode). */
export interface EventFormInitial {
  id: string;
  title: string;
  description: string;
  event_type: SiteEvent["event_type"];
  organiser_name: string;
  organiser_department_id: string | null;
  starts_at: string;
  ends_at: string | null;
  venue: string | null;
  online_link: string | null;
  registration_link: string | null;
  contact_info: string | null;
}

/**
 * Reusable event submission form. Used by /seminars/new and (later)
 * embedded in /upload. Prop-driven: pass departments for the
 * organiser select and, for edit mode, the event's current values.
 * Times are entered as local date-times and stored as Asia/Karachi
 * wall times by the server action.
 */
export function EventForm({
  departments,
  initial = null,
  submitLabel,
}: {
  departments: DepartmentRow[];
  initial?: EventFormInitial | null;
  submitLabel?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const editing = initial !== null;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    const result = editing
      ? await updateOwnEvent(new FormData(event.currentTarget))
      : await submitEvent(new FormData(event.currentTarget));
    setBusy(false);
    if (!result.ok) setError(result.error);
    else router.push("/dashboard?uploaded=1");
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 max-w-2xl space-y-4" aria-label={editing ? "Edit event" : "Submit an event"}>
      {editing && <input type="hidden" name="event_id" value={initial.id} />}
      <div>
        <label htmlFor="title" className="text-sm font-medium">Event title</label>
        <input
          id="title"
          name="title"
          required
          maxLength={200}
          defaultValue={initial?.title ?? ""}
          className={fieldClass}
          placeholder="e.g. Seminar: AI in Industrial Safety"
        />
      </div>
      <div>
        <label htmlFor="description" className="text-sm font-medium">Description</label>
        <textarea
          id="description"
          name="description"
          required
          rows={5}
          maxLength={5000}
          defaultValue={initial?.description ?? ""}
          className={fieldClass}
          placeholder="What is this event about, who is it for, and what will attendees learn or do?"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="event_type" className="text-sm font-medium">Event type</label>
          <select id="event_type" name="event_type" required defaultValue={initial?.event_type ?? ""} className={fieldClass}>
            <option value="" disabled>Choose…</option>
            {EVENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="organiser_name" className="text-sm font-medium">Organiser name</label>
          <input
            id="organiser_name"
            name="organiser_name"
            required
            maxLength={200}
            defaultValue={initial?.organiser_name ?? ""}
            className={fieldClass}
            placeholder="e.g. Industrial Engineering Society"
          />
        </div>
        <div>
          <label htmlFor="organiser_department_id" className="text-sm font-medium">Organising department (optional)</label>
          <select
            id="organiser_department_id"
            name="organiser_department_id"
            defaultValue={initial?.organiser_department_id ?? ""}
            className={fieldClass}
          >
            <option value="">No department selected</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="contact_info" className="text-sm font-medium">Contact info (optional)</label>
          <input
            id="contact_info"
            name="contact_info"
            maxLength={500}
            defaultValue={initial?.contact_info ?? ""}
            className={fieldClass}
            placeholder="e.g. society@uetpeshawar.edu.pk"
          />
        </div>
        <div>
          <label htmlFor="starts_at" className="text-sm font-medium">Starts (Pakistan time)</label>
          <input
            id="starts_at"
            name="starts_at"
            type="datetime-local"
            required
            defaultValue={initial ? toDateTimeLocalValue(initial.starts_at) : ""}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="ends_at" className="text-sm font-medium">Ends (optional, Pakistan time)</label>
          <input
            id="ends_at"
            name="ends_at"
            type="datetime-local"
            defaultValue={initial?.ends_at ? toDateTimeLocalValue(initial.ends_at) : ""}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="venue" className="text-sm font-medium">Venue</label>
          <input
            id="venue"
            name="venue"
            maxLength={300}
            defaultValue={initial?.venue ?? ""}
            className={fieldClass}
            placeholder="e.g. Main Auditorium, UET Peshawar"
          />
          <p className="mt-1 text-xs text-muted">Give a venue, an online meeting link, or both.</p>
        </div>
        <div>
          <label htmlFor="online_link" className="text-sm font-medium">Online meeting link (optional)</label>
          <input
            id="online_link"
            name="online_link"
            type="url"
            defaultValue={initial?.online_link ?? ""}
            className={fieldClass}
            placeholder="e.g. https://meet.google.com/…"
          />
        </div>
        <div>
          <label htmlFor="registration_link" className="text-sm font-medium">Registration link (optional)</label>
          <input
            id="registration_link"
            name="registration_link"
            type="url"
            defaultValue={initial?.registration_link ?? ""}
            className={fieldClass}
            placeholder="e.g. https://forms.gle/…"
          />
        </div>
        {!editing && (
          <div>
            <label htmlFor="poster" className="text-sm font-medium">Poster image (optional, max 5 MB)</label>
            <input id="poster" name="poster" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" className={fieldClass} />
          </div>
        )}
      </div>
      <p className="text-sm text-muted">
        {editing
          ? "Only pending events can be edited. Your changes go back to the admin queue."
          : "Your event is reviewed by an admin before it appears publicly. Only share events you have the right to announce, with accurate dates and links."}
      </p>
      {error && (
        <p role="alert" className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm">{error}</p>
      )}
      <button type="submit" disabled={busy} className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
        {busy ? "Saving…" : (submitLabel ?? (editing ? "Save changes" : "Submit for review"))}
      </button>
    </form>
  );
}
