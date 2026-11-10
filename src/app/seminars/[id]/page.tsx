import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/Container";
import { formatEventDateTime, getEventForViewer } from "@/lib/events";
import { recordContentEvent } from "@/lib/content-events";
import { getCurrentAccount, isAdmin } from "@/lib/auth";
import { createServiceRoleClient, isServiceRoleConfigured } from "@/lib/supabase/admin";
import { ReportButton } from "@/components/ReportButton";
import { EVENT_TYPES } from "@/lib/supabase/types";

export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const account = await getCurrentAccount();
  const event = await getEventForViewer(id, account?.userId ?? null, isAdmin(account));
  return event
    ? {
        title: `${event.title} — Seminar & Event`,
        description: `${event.title}: ${EVENT_TYPES.find((t) => t.value === event.event_type)?.label ?? event.event_type}, ${formatEventDateTime(event.starts_at)}${event.venue ? `, ${event.venue}` : ", online"}.`,
        alternates: { canonical: `https://engineeringverse.me/seminars/${id}` },
      }
    : { title: "Event not found", robots: { index: false } };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const account = await getCurrentAccount();
  const event = await getEventForViewer(id, account?.userId ?? null, isAdmin(account));
  if (!event) notFound();

  // One counted view per user (or per IP for guests) per day (Stage 8).
  // Pending/rejected content is never countable; the function refuses it.
  if (event.status === "approved" && !event.hidden) {
    await recordContentEvent("event", id, "view");
  }

  const typeLabel =
    EVENT_TYPES.find((t) => t.value === event.event_type)?.label ?? event.event_type;
  const isOwner = account?.userId === event.uploader_id;

  // Posters live in a private bucket and are only ever served through
  // a short-lived signed URL created server-side.
  let posterUrl: string | null = null;
  if (event.poster_path && isServiceRoleConfigured()) {
    try {
      const service = createServiceRoleClient();
      const { data } = await service.storage
        .from("event-posters")
        .createSignedUrl(event.poster_path, 300);
      posterUrl = data?.signedUrl ?? null;
    } catch {
      posterUrl = null;
    }
  }

  return (
    <Container className="py-12 sm:py-16">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/seminars" className="hover:text-brand-700">Seminars &amp; Events</Link> <span aria-hidden>/</span> <span>{event.title}</span>
      </nav>
      {event.status !== "approved" && (
        <p role="status" className="mt-6 rounded-lg border border-line bg-surface-alt px-4 py-3 text-sm">
          {event.status === "pending"
            ? "This event is waiting for admin approval and is only visible to you and the admins."
            : "This event was rejected by an admin and is only visible to you and the admins."}
          {event.moderation_note ? ` Admin note: ${event.moderation_note}` : ""}
          {isOwner && event.status === "pending" ? " You can edit it from your dashboard." : ""}
        </p>
      )}
      <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{event.title}</h1>
      <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-brand-500">
        {typeLabel}
        {event.uploader_name ? ` · Shared by ${event.uploader_name}` : ""}
      </p>

      {posterUrl && (
        <div className="mt-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={posterUrl}
            alt={`Poster for ${event.title}`}
            className="max-h-[480px] w-full rounded-xl border border-line bg-surface object-contain"
          />
        </div>
      )}

      {event.description && <p className="mt-6 max-w-3xl text-lg text-muted">{event.description}</p>}

      <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <dt className="font-medium">Starts</dt>
          <dd className="text-muted">{formatEventDateTime(event.starts_at)} (PKT)</dd>
        </div>
        {event.ends_at && (
          <div>
            <dt className="font-medium">Ends</dt>
            <dd className="text-muted">{formatEventDateTime(event.ends_at)} (PKT)</dd>
          </div>
        )}
        <div>
          <dt className="font-medium">Venue</dt>
          <dd className="text-muted">{event.venue ?? "Online event"}</dd>
        </div>
        {event.online_link && (
          <div>
            <dt className="font-medium">Online meeting</dt>
            <dd className="text-muted">
              <a href={event.online_link} target="_blank" rel="noreferrer" className="font-semibold text-brand-700 hover:underline">
                Join online
              </a>
            </dd>
          </div>
        )}
        <div>
          <dt className="font-medium">Organiser</dt>
          <dd className="text-muted">
            {event.organiser_name}
            {event.organiser_department_name ? ` · ${event.organiser_department_name}` : ""}
          </dd>
        </div>
        {event.contact_info && (
          <div>
            <dt className="font-medium">Contact</dt>
            <dd className="text-muted">{event.contact_info}</dd>
          </div>
        )}
        <div>
          <dt className="font-medium">Views</dt>
          <dd className="text-muted">{event.view_count}</dd>
        </div>
        <div>
          <dt className="font-medium">Announced</dt>
          <dd className="text-muted">{new Date(event.created_at).toLocaleDateString()}</dd>
        </div>
      </dl>

      {event.registration_link && event.status === "approved" && !event.hidden && (
        <div className="mt-8">
          <a
            href={event.registration_link}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Register for this event
          </a>
        </div>
      )}

      <section aria-labelledby="report-heading" className="mt-10 rounded-xl border border-line bg-surface p-5">
        <h2 id="report-heading" className="text-lg font-bold">Report this event</h2>
        <p className="mt-1 text-sm text-muted">
          Signed-in users can report an event that is incorrect, a duplicate,
          broken, inappropriate, or announced without permission. An admin reviews every report.
        </p>
        <div className="mt-4">
          <ReportButton contentType="event" contentId={event.id} label="Report this event" />
        </div>
      </section>
    </Container>
  );
}
