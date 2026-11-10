import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { EventForm, type EventFormInitial } from "@/components/EventForm";
import { getCurrentAccount, isAdmin } from "@/lib/auth";
import { getEventForViewer } from "@/lib/events";
import { getDepartments } from "@/lib/structure";

export const instant = false;

export const metadata: Metadata = { title: "Edit event", robots: { index: false, follow: false } };

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const account = await getCurrentAccount();
  if (!account) redirect(`/auth/sign-in?next=/dashboard/events/${id}/edit`);

  const event = await getEventForViewer(id, account.userId, isAdmin(account));
  if (!event || event.uploader_id !== account.userId || event.status !== "pending") {
    redirect("/dashboard");
  }

  const departments = await getDepartments();

  const initial: EventFormInitial = {
    id: event.id,
    title: event.title,
    description: event.description,
    event_type: event.event_type,
    organiser_name: event.organiser_name,
    organiser_department_id: event.organiser_department_id,
    starts_at: event.starts_at,
    ends_at: event.ends_at,
    venue: event.venue,
    online_link: event.online_link,
    registration_link: event.registration_link,
    contact_info: event.contact_info,
  };

  return (
    <Container className="py-12 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Edit event</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Editing a pending seminar / event submission. Only pending submissions
        can be edited — once it is approved or rejected, changes are an admin
        action. The poster image cannot be changed here.
      </p>
      <p className="mt-3 text-sm">
        <Link href="/dashboard" className="font-semibold text-brand-700 hover:underline">
          Back to your dashboard
        </Link>
      </p>
      <EventForm departments={departments} initial={initial} submitLabel="Save changes" />
    </Container>
  );
}
