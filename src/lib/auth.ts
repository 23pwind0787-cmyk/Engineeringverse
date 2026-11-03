import { createServerSupabaseClient } from "./supabase/server";
import type { Profile, UserRole } from "./supabase/types";

export interface CurrentAccount {
  userId: string;
  email: string;
  emailConfirmed: boolean;
  profile: Profile | null;
}

export async function getCurrentAccount(): Promise<CurrentAccount | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, display_name, role, created_at")
    .eq("id", user.id)
    .maybeSingle();
  return {
    userId: user.id,
    email: user.email ?? "",
    emailConfirmed: Boolean(user.email_confirmed_at),
    profile: (profile as Profile | null) ?? null,
  };
}

export function isAdmin(account: CurrentAccount | null): boolean {
  return account?.profile?.role === "admin";
}

export async function requireAdmin(): Promise<CurrentAccount> {
  const account = await getCurrentAccount();
  if (!account || account.profile?.role !== ("admin" as UserRole)) {
    throw new Error("Admin access required.");
  }
  return account;
}
