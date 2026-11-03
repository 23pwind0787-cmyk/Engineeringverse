"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentAccount } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData): Promise<void> {
  const account = await getCurrentAccount();
  if (!account) redirect("/auth/sign-in");
  const displayName = String(formData.get("display_name") ?? "").trim() || null;
  const supabase = await createServerSupabaseClient();
  if (!supabase) return;
  await supabase
    .from("profiles")
    .update({ display_name: displayName })
    .eq("id", account.userId);
  revalidatePath("/profile");
}
