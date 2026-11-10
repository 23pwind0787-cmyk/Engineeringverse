import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { PaperEditForm } from "@/components/UploadForm";
import { getCurrentAccount, isAdmin } from "@/lib/auth";
import { getPaperForViewer } from "@/lib/papers";
import { RESOURCE_CATEGORIES } from "@/lib/supabase/types";

export const instant = false;

export const metadata: Metadata = { title: "Edit resource", robots: { index: false, follow: false } };

export default async function EditResourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const account = await getCurrentAccount();
  if (!account) redirect(`/auth/sign-in?next=/dashboard/resources/${id}/edit`);

  const paper = await getPaperForViewer(id, account.userId, isAdmin(account));
  if (!paper || paper.uploader_id !== account.userId || paper.status !== "pending") {
    redirect("/dashboard");
  }

  const categoryLabel =
    RESOURCE_CATEGORIES.find((c) => c.value === paper.category)?.label ?? paper.category;

  return (
    <Container className="py-12 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Edit resource</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Editing a pending {categoryLabel.toLowerCase()} submission. Only pending
        submissions can be edited — once it is approved or rejected, changes
        are an admin action.
      </p>
      <p className="mt-3 text-sm">
        <Link href="/dashboard" className="font-semibold text-brand-700 hover:underline">
          Back to your dashboard
        </Link>
      </p>
      <PaperEditForm paper={paper} />
    </Container>
  );
}
