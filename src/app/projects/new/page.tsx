import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { ProjectForm } from "@/components/ProjectForm";
import { ResendVerification } from "@/app/auth/verify-email/page";
import { getCurrentAccount } from "@/lib/auth";
import { getCampuses, getDepartments } from "@/lib/structure";

export const instant = false;

export const metadata: Metadata = { title: "Submit a project", robots: { index: false, follow: false } };

export default async function NewProjectPage() {
  const account = await getCurrentAccount();
  if (!account) redirect("/auth/sign-in?next=/projects/new");

  const [campuses, departments] = await Promise.all([getCampuses(), getDepartments()]);

  return (
    <Container className="py-12 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Submit a project</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Share a final year project, research project, robotics or AI build, or
        student innovation. Up to 6 photos or videos and an optional report
        PDF, each at most 20 MB. Submitted as {account.email}.
      </p>
      {!account.emailConfirmed ? (
        <div className="mt-8 max-w-2xl rounded-xl border border-line bg-surface p-5">
          <h2 className="font-semibold">Verify your email first</h2>
          <p className="mt-2 text-sm text-muted">
            Project submissions open after email verification. Open the
            verification link in your email, then come back here.
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
        <ProjectForm campuses={campuses} departments={departments} />
      )}
    </Container>
  );
}
