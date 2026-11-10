import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { EventForm } from "@/components/EventForm";
import { ResendVerification } from "@/app/auth/verify-email/page";
import { getCurrentAccount } from "@/lib/auth";
import { getDepartments } from "@/lib/structure";

export const instant = false;

export const metadata: Metadata = { title: "Submit an event", robots: { index: false, follow: false } };

export default async function NewEventPage() {
  const account = await getCurrentAccount();
  if (!account) redirect("/auth/sign-in?next=/seminars/new");

  const departments = await getDepartments();

  return (
    <Container className="py-12 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Submit an event</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Announce a seminar, workshop, webinar, industrial visit,
        conference, career event, competition or training session. Times
        are entered in Pakistan time. Submitted as {account.email}.
      </p>
      {!account.emailConfirmed ? (
        <div className="mt-8 max-w-2xl rounded-xl border border-line bg-surface p-5">
          <h2 className="font-semibold">Verify your email first</h2>
          <p className="mt-2 text-sm text-muted">
            Event submissions open after email verification. Open the verification link
            in your email, then come back here.
          </p>
          <p className="mt-3 text-sm">
            <ResendVerification email={account.email} />
          </p>
          <p className="mt-3 text-sm">
            <Link href="/auth/verify-email" className="font-semibold text-brand-700 hover:underline">
              What to do if the email has not arrived
            </Link>
          </p>
        </div>
      ) : (
        <EventForm departments={departments} />
      )}
    </Container>
  );
}
