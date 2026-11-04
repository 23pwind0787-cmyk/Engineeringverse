import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { DeletePaperButton } from "@/components/DeletePaperButton";
import { getCurrentAccount } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Paper } from "@/lib/supabase/types";

export const instant = false;

export const metadata: Metadata = { title: "Your dashboard", robots: { index: false, follow: false } };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ uploaded?: string }>;
}) {
  const params = await searchParams;
  const account = await getCurrentAccount();
  if (!account) redirect("/auth/sign-in?next=/dashboard");

  const supabase = await createServerSupabaseClient();
  let papers: Paper[] = [];
  let reports: Array<{ id: string; paper_id: string; reason: string; status: string; created_at: string }> = [];
  if (supabase) {
    const { data } = await supabase
      .from("papers")
      .select("id, uploader_id, campus_id, department_id, semester_id, subject_id, title, subject_code, exam_type, year, session, storage_path, file_size, page_count, download_count, status, created_at")
      .eq("uploader_id", account.userId)
      .order("created_at", { ascending: false });
    papers = (data ?? []) as Paper[];
    const { data: reportData } = await supabase
      .from("paper_reports")
      .select("id, paper_id, reason, status, created_at")
      .eq("reporter_id", account.userId)
      .order("created_at", { ascending: false });
    reports = (reportData ?? []) as typeof reports;
  }

  return (
    <Container className="py-12 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Your dashboard</h1>
      <p className="mt-3 text-muted">
        Signed in as {account.email} ({account.profile?.role ?? "student"}).{" "}
        <Link href="/profile" className="font-semibold text-brand-700 hover:underline">Edit profile</Link>
      </p>
      {params.uploaded === "1" && (
        <p role="status" className="mt-6 rounded-lg border border-line bg-surface-alt px-4 py-3 text-sm">
          Your paper was published. Thank you for contributing.
        </p>
      )}
      {!account.emailConfirmed && (
        <p role="alert" className="mt-6 rounded-lg border border-line bg-surface-alt px-4 py-3 text-sm">
          Your email is not verified yet, so uploads are blocked. Check your inbox for the verification link.
        </p>
      )}

      <div className="mt-8">
        <Link href="/upload" className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700">
          Upload a paper
        </Link>
      </div>

      <section aria-labelledby="uploads-heading" className="mt-12">
        <h2 id="uploads-heading" className="text-xl font-bold">Your uploads ({papers.length})</h2>
        {papers.length === 0 ? (
          <p className="mt-2 text-muted">You have not uploaded any papers yet.</p>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {papers.map((paper) => (
              <li key={paper.id} className="rounded-xl border border-line bg-surface p-5">
                <h3 className="font-semibold">
                  <Link href={`/past-papers/${paper.id}`} className="hover:text-brand-700 hover:underline">{paper.title}</Link>
                </h3>
                <p className="mt-2 text-sm text-muted">
                  {paper.subject_code} · {paper.exam_type} {paper.year} ({paper.session}) · {paper.download_count} downloads
                </p>
                <div className="mt-4 flex gap-2">
                  <Link href={`/past-papers/${paper.id}`} className="rounded-lg border border-line px-4 py-2 text-sm font-semibold hover:border-brand-500">View</Link>
                  <DeletePaperButton paperId={paper.id} title={paper.title} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="reports-heading" className="mt-12">
        <h2 id="reports-heading" className="text-xl font-bold">Your reports ({reports.length})</h2>
        {reports.length === 0 ? (
          <p className="mt-2 text-muted">You have not reported any papers.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {reports.map((report) => (
              <li key={report.id} className="rounded-xl border border-line bg-surface p-4 text-sm">
                <span className="font-medium">Status: {report.status}</span>
                <span className="text-muted"> — {report.reason}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Container>
  );
}
