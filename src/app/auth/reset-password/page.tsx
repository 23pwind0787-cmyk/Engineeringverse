"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/Container";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setError("Password reset is not configured yet.");
      return;
    }
    setBusy(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (updateError) setError(updateError.message);
    else router.push("/dashboard");
  }

  return (
    <Container className="py-12 sm:py-16">
      <h1 className="text-center text-3xl font-bold tracking-tight">Choose a new password</h1>
      <form onSubmit={onSubmit} className="mx-auto mt-8 max-w-md space-y-4">
        <div>
          <label htmlFor="password" className="text-sm font-medium">New password</label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        {error && (
          <p role="alert" className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm">{error}</p>
        )}
        <button type="submit" disabled={busy} className="w-full rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
          {busy ? "Please wait…" : "Set new password"}
        </button>
      </form>
    </Container>
  );
}
