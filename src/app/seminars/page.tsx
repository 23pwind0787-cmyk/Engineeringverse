import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { formatEventDate, listPastEvents, listUpcomingEvents, searchEvents } from "@/lib/events";
import { getDepartments } from "@/lib/structure";
import { EVENT_TYPES, type EventType, type SiteEvent } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Seminars & Events",
  description:
    "Engineering seminars, technical workshops, webinars, industrial visits, conferences, career events and competitions at UET Peshawar — upcoming and past.",
  alternates: { canonical: "https://engineeringverse.me/seminars" },
};

// Reads searchParams (q/type/department filters), so this route must
// not be prerendered under cacheComponents.
export const instant = false;

function typeLabel(value: EventType): string {
  return EVENT_TYPES.find((t) => t.value === value)?.label ?? value;
}

function EventCard({ event }: { event: SiteEvent }) {
  const organiser = event.organiser_department_name ?? event.organiser_name;
  return (
    <li>
      <Link
        href={`/seminars/${event.id}`}
        className="flex h-full flex-col gap-3 rounded-xl border border-line bg-surface p-5 transition hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-md"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">
          {typeLabel(event.event_type)}
        </p>
        <h3 className="text-lg font-semibold">{event.title}</h3>
        <p className="flex-1 text-sm text-muted">{event.description}</p>
        <p className="text-sm">
          {formatEventDate(event.starts_at)}
          {event.ends_at ? ` · ${formatEventDate(event.ends_at)}` : ""}
        </p>
        <p className="text-sm text-muted">
          {event.venue ?? "Online"}
          {` · ${organiser}`}
          {event.uploader_name ? ` · Shared by ${event.uploader_name}` : ""}
        </p>
        <p className="text-sm text-muted">
          {event.view_count} {event.view_count === 1 ? "view" : "views"}
        </p>
      </Link>
    </li>
  );
}

function EmptySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 max-w-2xl rounded-xl border border-line bg-surface p-6">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="mt-2 text-sm text-muted">{children}</div>
    </div>
  );
}

export default async function SeminarsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; department?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ? params.q.trim() : undefined;
  const eventType: EventType | undefined =
    params.type && EVENT_TYPES.some((t) => t.value === params.type)
      ? (params.type as EventType)
      : undefined;
  const departmentId = params.department?.trim() ? params.department.trim() : undefined;
  const hasFilters = Boolean(query || eventType || departmentId);

  const departments = await getDepartments();
  const [upcoming, past] = hasFilters
    ? await Promise.all([
        searchEvents({ query, eventType, organiserDepartmentId: departmentId, upcoming: true, sort: "starting" }),
        searchEvents({ query, eventType, organiserDepartmentId: departmentId, upcoming: false, sort: "recent" }),
      ])
    : await Promise.all([listUpcomingEvents(100), listPastEvents(100)]);

  return (
    <Container className="py-12 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Seminars &amp; Events</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Engineering seminars, technical workshops, webinars, industrial
        visits, conferences, career events and competitions — announced by
        departments and registered students. Dates and times are shown in
        Pakistan time.
      </p>
      <p className="mt-4">
        <Link
          href="/seminars/new"
          className="inline-flex rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Submit an event
        </Link>
      </p>

      <form method="get" action="/seminars" className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end" aria-label="Filter events">
        <div className="flex-1">
          <label htmlFor="q" className="text-sm font-medium">Search</label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={query ?? ""}
            placeholder="Search events…"
            className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="type" className="text-sm font-medium">Event type</label>
          <select id="type" name="type" defaultValue={eventType ?? ""} className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm sm:w-auto">
            <option value="">All types</option>
            {EVENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="department" className="text-sm font-medium">Organising department</label>
          <select id="department" name="department" defaultValue={departmentId ?? ""} className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm sm:w-auto">
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold hover:border-brand-500">
          Filter
        </button>
        {hasFilters && (
          <Link href="/seminars" className="text-sm font-medium text-brand-700 hover:underline">
            Clear filters
          </Link>
        )}
      </form>

      <section aria-labelledby="upcoming-heading" className="mt-12">
        <h2 id="upcoming-heading" className="text-2xl font-bold tracking-tight">Upcoming events</h2>
        {upcoming.length === 0 ? (
          <EmptySection title="No upcoming events announced yet">
            <p>
              {hasFilters
                ? "No upcoming events match these filters. Try clearing them, or check back later."
                : "No events are scheduled yet. Departments and registered students can announce one — it appears here once an admin approves it."}
            </p>
            <p className="mt-3">
              <Link href="/seminars/new" className="font-semibold text-brand-700 hover:underline">
                Submit an event →
              </Link>
            </p>
          </EmptySection>
        ) : (
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="past-heading" className="mt-12">
        <h2 id="past-heading" className="text-2xl font-bold tracking-tight">Past events</h2>
        {past.length === 0 ? (
          <EmptySection title="No past events yet">
            <p>
              {hasFilters
                ? "No past events match these filters."
                : "Events that have already happened will be listed here for reference — nothing here is filler."}
            </p>
          </EmptySection>
        ) : (
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {past.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </ul>
        )}
      </section>
    </Container>
  );
}
