"use client";

import { useState } from "react";
import { Container } from "@/components/Container";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

/** Lets a signed-in but unverified user resend the verification email. */
export function ResendVerification({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "sent" | "error">("idle");

  async function resend() {
    const supabase = createBrowserSupabaseClient();
    if (!supabase) return;
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setState(error ? "error" : "sent");
  }

  return (
    <span className="inline-flex items-center gap-3">
      <button type="button" onClick={resend} className="font-semibold text-brand-700 hover:underline">
        Resend verification email
      </button>
      {state === "sent" && <span role="status">Verification email sent.</span>}
      {state === "error" && (
        <span role="alert">Could not send the email. Try again later.</span>
      )}
    </span>
  );
}

export default function VerifyEmailPage() {
  return (
    <Container className="py-12 sm:py-16">
      <h1 className="text-center text-3xl font-bold tracking-tight">Verify your email</h1>
      <p className="mx-auto mt-3 max-w-xl text-center text-muted">
        We sent a verification link to your email when you registered. Open it
        to verify your account, then you can upload papers. Check your spam
        folder if it has not arrived.
      </p>
    </Container>
  );
}
