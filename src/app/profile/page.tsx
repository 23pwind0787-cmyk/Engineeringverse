import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { getCurrentAccount } from "@/lib/auth";
import { updateProfile } from "@/lib/actions/profile";

export const instant = false;

export const metadata: Metadata = { title: "Your profile" };

export default async function ProfilePage() {
  const account = await getCurrentAccount();
  if (!account) redirect("/auth/sign-in?next=/profile");

  return (
    <Container className="py-12 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Your profile</h1>
      <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
        <div><dt className="font-medium">Email</dt><dd className="text-muted">{account.email}</dd></div>
        <div><dt className="font-medium">Email verified</dt><dd className="text-muted">{account.emailConfirmed ? "Yes" : "No — check your inbox"}</dd></div>
        <div><dt className="font-medium">Role</dt><dd className="text-muted">{account.profile?.role ?? "student"}</dd></div>
      </dl>
      <form action={updateProfile} className="mt-8 max-w-md space-y-4">
        <div>
          <label htmlFor="display_name" className="text-sm font-medium">Display name</label>
          <input
            id="display_name"
            name="display_name"
            defaultValue={account.profile?.display_name ?? ""}
            className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm"
          />
        </div>
        <button type="submit" className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          Save profile
        </button>
      </form>
    </Container>
  );
}
