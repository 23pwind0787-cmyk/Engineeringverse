"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

/** Signed-in / signed-out links in the header. Hides itself when Supabase is unconfigured. */
export function AuthNav() {
  const router = useRouter();
  const [state, setState] = useState<"loading" | "signed-out" | "signed-in">("loading");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function init() {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
        setState("signed-out");
        return;
      }
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        setState("signed-out");
        return;
      }
      setState("signed-in");
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();
      setIsAdmin(profile?.role === "admin");
    }
    void init();
    const supabase = createBrowserSupabaseClient();
    if (!supabase) return;
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setState(session ? "signed-in" : "signed-out");
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function signOut() {
    const supabase = createBrowserSupabaseClient();
    if (supabase) await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (state === "loading") return null;
  if (state === "signed-out") {
    return (
      <Link href="/auth/sign-in" className="rounded-md px-3 py-2 text-sm font-medium text-muted hover:bg-brand-50 hover:text-brand-700">
        Sign in
      </Link>
    );
  }
  return (
    <span className="flex items-center gap-1">
      {isAdmin && (
        <Link href="/admin" className="rounded-md px-3 py-2 text-sm font-medium text-muted hover:bg-brand-50 hover:text-brand-700">
          Admin
        </Link>
      )}
      <Link href="/dashboard" className="rounded-md px-3 py-2 text-sm font-medium text-muted hover:bg-brand-50 hover:text-brand-700">
        Dashboard
      </Link>
      <button type="button" onClick={signOut} className="rounded-md px-3 py-2 text-sm font-medium text-muted hover:bg-brand-50 hover:text-brand-700">
        Sign out
      </button>
    </span>
  );
}
