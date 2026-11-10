"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { getCurrentAccount } from "@/lib/auth";
import { parseKarachiDateTime } from "@/lib/events";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleClient, isServiceRoleConfigured } from "@/lib/supabase/admin";
import { EVENT_TYPES, type EventType } from "@/lib/supabase/types";

const MAX_POSTER_BYTES = 5 * 1024 * 1024; // 5 MB
const POSTER_TYPES: Record<string, { mime: string; magic: number[] }> = {
  jpg: { mime: "image/jpeg", magic: [0xff, 0xd8, 0xff] },
  jpeg: { mime: "image/jpeg", magic: [0xff, 0xd8, 0xff] },
  png: { mime: "image/png", magic: [0x89, 0x50, 0x4e, 0x47] },
  webp: { mime: "image/webp", magic: [0x52, 0x49, 0x46, 0x46] }, // "RIFF....WEBP"
};

const EVENT_TYPE_VALUES: EventType[] = EVENT_TYPES.map((t) => t.value);

export type SubmitEventResult = { ok: true } | { ok: false; error: string };

async function requireVerifiedUploader() {
  const account = await getCurrentAccount();
  if (!account) return { account: null, error: "Sign in to submit an event." };
  if (!account.emailConfirmed) {
    return {
      account: null,
      error:
        "Verify your email before submitting an event. Use the verification link in your email, or resend it from the submission page.",
    };
  }
  return { account, error: null };
}

function readText(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

interface ValidatedEventFields {
  title: string;
  description: string;
  eventType: EventType;
  organiserName: string;
  organiserDepartmentId: string | null;
  startsAt: string;
  endsAt: string | null;
  venue: string | null;
  onlineLink: string | null;
  registrationLink: string | null;
  contactInfo: string | null;
}

/**
 * Shared validation for submit and update. Dates come from
 * datetime-local inputs and are interpreted as Asia/Karachi wall
 * times. Returns the cleaned fields or an error string.
 */
function validateEventFields(
  formData: FormData,
): { fields: ValidatedEventFields; error: null } | { fields: null; error: string } {
  const title = readText(formData, "title");
  const description = readText(formData, "description");
  const eventType = readText(formData, "event_type") as EventType;
  const organiserName = readText(formData, "organiser_name");
  const organiserDepartmentId = readText(formData, "organiser_department_id") || null;
  const startsAtRaw = readText(formData, "starts_at");
  const endsAtRaw = readText(formData, "ends_at");
  const venue = readText(formData, "venue") || null;
  const onlineLink = readText(formData, "online_link") || null;
  const registrationLink = readText(formData, "registration_link") || null;
  const contactInfo = readText(formData, "contact_info") || null;

  if (!title || !description || !eventType || !organiserName || !startsAtRaw) {
    return { fields: null, error: "Fill in every required field." };
  }
  if (title.length > 200) return { fields: null, error: "The title must be at most 200 characters." };
  if (description.length > 5000) {
    return { fields: null, error: "The description must be at most 5000 characters." };
  }
  if (organiserName.length > 200) {
    return { fields: null, error: "The organiser name must be at most 200 characters." };
  }
  if (!EVENT_TYPE_VALUES.includes(eventType)) {
    return { fields: null, error: "Choose a valid event type." };
  }
  const startsAt = parseKarachiDateTime(startsAtRaw);
  if (!startsAt) return { fields: null, error: "Enter a valid start date and time." };
  let endsAt: string | null = null;
  if (endsAtRaw) {
    endsAt = parseKarachiDateTime(endsAtRaw);
    if (!endsAt) return { fields: null, error: "Enter a valid end date and time." };
    if (new Date(endsAt) <= new Date(startsAt)) {
      return { fields: null, error: "The end time must be after the start time." };
    }
  }
  if (!venue && !onlineLink) {
    return { fields: null, error: "Give a venue, an online meeting link, or both." };
  }
  if (onlineLink && !isHttpUrl(onlineLink)) {
    return { fields: null, error: "The online meeting link must be a valid http(s) URL." };
  }
  if (registrationLink && !isHttpUrl(registrationLink)) {
    return { fields: null, error: "The registration link must be a valid http(s) URL." };
  }
  return {
    fields: {
      title,
      description,
      eventType,
      organiserName,
      organiserDepartmentId,
      startsAt,
      endsAt,
      venue,
      onlineLink,
      registrationLink,
      contactInfo,
    },
    error: null,
  };
}

async function validatePoster(file: File): Promise<{ ext: string; bytes: Uint8Array } | { error: string }> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const spec = POSTER_TYPES[ext];
  if (!spec) {
    return { error: "The poster must be a JPG, PNG or WebP image." };
  }
  if (file.type !== spec.mime) {
    return { error: "The poster file does not match its extension." };
  }
  if (file.size <= 0 || file.size > MAX_POSTER_BYTES) {
    return { error: "The poster must be an image of at most 5 MB." };
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (ext === "webp") {
    // WebP: "RIFF" + 4 size bytes + "WEBP".
    const webpMagic = [0x57, 0x45, 0x42, 0x50]; // "WEBP"
    if (
      bytes.length < 12 ||
      !spec.magic.every((byte, i) => bytes[i] === byte) ||
      !webpMagic.every((byte, i) => bytes[8 + i] === byte)
    ) {
      return { error: "The poster file does not look like a real image." };
    }
  } else if (
    bytes.length < spec.magic.length ||
    !spec.magic.every((byte, i) => bytes[i] === byte)
  ) {
    return { error: "The poster file does not look like a real image." };
  }
  return { ext: ext === "jpeg" ? "jpg" : ext, bytes };
}

/**
 * Submits an event announcement. Runs only on the server. Validates,
 * in order: verified email, required fields, event type, dates,
 * venue-or-online-link, links, and the organising department when
 * given. The optional poster is stored in the private 'event-posters'
 * bucket under the uploader's own folder.
 *
 * New submissions land as `pending` — they become public only after
 * an admin approves them. If the row insert fails after the poster
 * upload, the uploaded object is removed.
 */
export async function submitEvent(formData: FormData): Promise<SubmitEventResult> {
  const { account, error: authError } = await requireVerifiedUploader();
  if (!account || authError) return { ok: false, error: authError ?? "Sign in to submit an event." };

  const { fields, error: fieldError } = validateEventFields(formData);
  if (!fields || fieldError) return { ok: false, error: fieldError ?? "Fill in every required field." };

  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false, error: "Submissions are not configured yet." };

  if (fields.organiserDepartmentId) {
    const { data: department } = await supabase
      .from("departments")
      .select("id")
      .eq("id", fields.organiserDepartmentId)
      .maybeSingle();
    if (!department) {
      return { ok: false, error: "Choose a valid organising department." };
    }
  }

  const poster = formData.get("poster");
  let posterPath: string | null = null;
  let posterBytes: Uint8Array | null = null;
  let posterExt = "";
  let posterMime = "";
  if (poster instanceof File && poster.size > 0) {
    const checked = await validatePoster(poster);
    if ("error" in checked) return { ok: false, error: checked.error };
    posterExt = checked.ext;
    posterBytes = checked.bytes;
    posterMime = POSTER_TYPES[posterExt].mime;
    posterPath = `${account.userId}/${randomUUID()}.${posterExt}`;
    const { error: uploadError } = await supabase.storage
      .from("event-posters")
      .upload(posterPath, Buffer.from(posterBytes), { contentType: posterMime, upsert: false });
    if (uploadError) return { ok: false, error: `Poster upload failed: ${uploadError.message}` };
  }

  const { error: insertError } = await supabase.from("events").insert({
    uploader_id: account.userId,
    organiser_department_id: fields.organiserDepartmentId,
    organiser_name: fields.organiserName,
    title: fields.title,
    description: fields.description,
    event_type: fields.eventType,
    starts_at: fields.startsAt,
    ends_at: fields.endsAt,
    venue: fields.venue,
    online_link: fields.onlineLink,
    registration_link: fields.registrationLink,
    poster_path: posterPath,
    contact_info: fields.contactInfo,
    status: "pending",
  });
  if (insertError) {
    if (posterPath) await supabase.storage.from("event-posters").remove([posterPath]);
    return { ok: false, error: `Could not save the event: ${insertError.message}` };
  }

  revalidatePath("/seminars");
  revalidatePath("/dashboard");
  return { ok: true };
}

/**
 * Edits one of the uploader's own pending events. Only pending
 * events can be edited — approved or rejected events are an admin
 * action. The ownership check runs through the service-role client
 * (server-side only) because the anon client has no SELECT policy for
 * pending rows (Phase 2 RLS gap); the update is then scoped to the
 * caller's own row.
 */
export async function updateOwnEvent(formData: FormData): Promise<SubmitEventResult> {
  const account = await getCurrentAccount();
  if (!account) return { ok: false, error: "Sign in to edit an event." };
  const eventId = readText(formData, "event_id");
  if (!eventId) return { ok: false, error: "No event was given to edit." };

  const { fields, error: fieldError } = validateEventFields(formData);
  if (!fields || fieldError) return { ok: false, error: fieldError ?? "Fill in every required field." };

  if (!isServiceRoleConfigured()) {
    return { ok: false, error: "Editing is not configured yet." };
  }
  const service = createServiceRoleClient();
  const { data: event } = await service
    .from("events")
    .select("uploader_id, status")
    .eq("id", eventId)
    .maybeSingle();
  if (!event || event.uploader_id !== account.userId) {
    return { ok: false, error: "That event is not yours." };
  }
  if (event.status !== "pending") {
    return { ok: false, error: "Only pending events can be edited." };
  }

  if (fields.organiserDepartmentId) {
    const { data: department } = await service
      .from("departments")
      .select("id")
      .eq("id", fields.organiserDepartmentId)
      .maybeSingle();
    if (!department) {
      return { ok: false, error: "Choose a valid organising department." };
    }
  }

  const { error } = await service
    .from("events")
    .update({
      title: fields.title,
      description: fields.description,
      event_type: fields.eventType,
      organiser_name: fields.organiserName,
      organiser_department_id: fields.organiserDepartmentId,
      starts_at: fields.startsAt,
      ends_at: fields.endsAt,
      venue: fields.venue,
      online_link: fields.onlineLink,
      registration_link: fields.registrationLink,
      contact_info: fields.contactInfo,
    })
    .eq("id", eventId)
    .eq("uploader_id", account.userId)
    .eq("status", "pending");
  if (error) return { ok: false, error: error.message };

  revalidatePath("/seminars");
  revalidatePath("/dashboard");
  return { ok: true };
}

/**
 * Deletes one of the caller's own events, including its poster
 * object. The ownership check runs through the service-role client
 * (server-side only) because the anon client has no SELECT policy for
 * pending rows (Phase 2 RLS gap); the delete is scoped to the
 * caller's own row.
 */
export async function deleteOwnEvent(eventId: string): Promise<void> {
  const account = await getCurrentAccount();
  if (!account) redirect("/auth/sign-in");
  if (!eventId) return;
  if (!isServiceRoleConfigured()) return;
  const service = createServiceRoleClient();
  const { data: event } = await service
    .from("events")
    .select("poster_path, uploader_id")
    .eq("id", eventId)
    .maybeSingle();
  if (!event || event.uploader_id !== account.userId) return;
  if (event.poster_path) {
    await service.storage.from("event-posters").remove([event.poster_path]);
  }
  await service.from("events").delete().eq("id", eventId).eq("uploader_id", account.userId);
  revalidatePath("/seminars");
  revalidatePath("/dashboard");
}
