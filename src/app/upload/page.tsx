import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { UploadForm } from "@/components/UploadForm";
import { ResendVerification } from "@/app/auth/verify-email/page";
import { getCurrentAccount } from "@/lib/auth";
import { getCampuses, getDepartments, getSemesters, getSubjects } from "@/lib/structure";

export const instant = false;

export const metadata: Metadata = { title: "Upload Resources", robots: { index: false, follow: false } };

export default async function UploadPage() {
  const account = await getCurrentAccount();
  if (!account) redirect("/auth/sign-in?next=/upload");

  const [campuses, departments, semesters, subjects] = await Promise.all([
    getCampuses(),
    getDepartments(),
    getSemesters(),
    getSubjects(),
  ]);

  return (
    <Container className="py-12 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Upload Resources</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Share something useful with the community: an academic resource (past
        paper, OEL, lab report, book, assignment or notes — PDF only, maximum
        20 MB), a project, or a seminar or event. Submitted as {account.email}.
      </p>
      <ol className="mt-6 grid max-w-3xl gap-3 sm:grid-cols-3">
        <li className="rounded-xl border border-line bg-surface p-4 text-sm">
          <p className="font-semibold">1. Submit</p>
          <p className="mt-1 text-muted">Choose a type above and fill in the form.</p>
        </li>
        <li className="rounded-xl border border-line bg-surface p-4 text-sm">
          <p className="font-semibold">2. Pending review</p>
          <p className="mt-1 text-muted">An admin checks your submission. It is not public yet.</p>
        </li>
        <li className="rounded-xl border border-line bg-surface p-4 text-sm">
          <p className="font-semibold">3. Approved or rejected</p>
          <p className="mt-1 text-muted">
            Approved submissions appear publicly. If one is rejected, the
            reason is shown on your dashboard.
          </p>
        </li>
      </ol>
      {!account.emailConfirmed ? (
        <div className="mt-8 max-w-2xl rounded-xl border border-line bg-surface p-5">
          <h2 className="font-semibold">Verify your email first</h2>
          <p className="mt-2 text-sm text-muted">
            Uploads open after email verification. Open the verification link
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
        <UploadForm campuses={campuses} departments={departments} semesters={semesters} subjects={subjects} />
      )}
    </Container>
  );
}
