import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { ProjectForm, type ProjectFormInitial } from "@/components/ProjectForm";
import { getCurrentAccount, isAdmin } from "@/lib/auth";
import { getProjectForViewer } from "@/lib/projects";
import { getCampuses, getDepartments } from "@/lib/structure";

export const instant = false;

export const metadata: Metadata = { title: "Edit project", robots: { index: false, follow: false } };

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const account = await getCurrentAccount();
  if (!account) redirect(`/auth/sign-in?next=/dashboard/projects/${id}/edit`);

  const project = await getProjectForViewer(id, account.userId, isAdmin(account));
  if (!project || project.uploader_id !== account.userId || project.status !== "pending") {
    redirect("/dashboard");
  }

  const [campuses, departments] = await Promise.all([getCampuses(), getDepartments()]);

  const initial: ProjectFormInitial = {
    id: project.id,
    title: project.title,
    description: project.description,
    team_members: project.team_members,
    supervisor: project.supervisor,
    category: project.category,
    tools: project.tools,
    outcomes: project.outcomes,
  };

  return (
    <Container className="py-12 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Edit project</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Editing a pending project submission. Only pending submissions can be
        edited — once it is approved or rejected, changes are an admin action.
        Photos, videos and the report file cannot be changed here.
      </p>
      <p className="mt-3 text-sm">
        <Link href="/dashboard" className="font-semibold text-brand-700 hover:underline">
          Back to your dashboard
        </Link>
      </p>
      <ProjectForm campuses={campuses} departments={departments} project={initial} onSuccessRedirect="/dashboard" />
    </Container>
  );
}
