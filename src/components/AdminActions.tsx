"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminDeletePaper, resolveReport, setUserRole } from "@/lib/actions/admin";

export function AdminDeletePaperButton({ paperId, title }: { paperId: string; title: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        const reason = window.prompt(`Why is "${title}" being removed?`, "Inappropriate / duplicate / unauthorised");
        if (reason === null) return;
        setBusy(true);
        const result = await adminDeletePaper(paperId, reason);
        setBusy(false);
        if (!result.ok) window.alert(result.error);
        router.refresh();
      }}
      className="rounded-lg border border-line px-4 py-2 text-sm font-semibold hover:border-red-400 disabled:opacity-50"
    >
      {busy ? "Removing…" : "Remove paper"}
    </button>
  );
}

export function ReportActionButtons({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function act(status: "resolved" | "dismissed") {
    setBusy(true);
    const result = await resolveReport(reportId, status);
    setBusy(false);
    if (!result.ok) window.alert(result.error);
    router.refresh();
  }
  return (
    <span className="flex gap-2">
      <button type="button" disabled={busy} onClick={() => act("resolved")} className="rounded-lg border border-line px-3 py-1.5 text-sm font-semibold hover:border-brand-500 disabled:opacity-50">Mark resolved</button>
      <button type="button" disabled={busy} onClick={() => act("dismissed")} className="rounded-lg border border-line px-3 py-1.5 text-sm font-semibold hover:border-brand-500 disabled:opacity-50">Dismiss</button>
    </span>
  );
}

export function RoleButton({ userId, currentRole }: { userId: string; currentRole: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const target = currentRole === "admin" ? "student" : "admin";
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        if (!window.confirm(`Change this user's role to ${target}?`)) return;
        setBusy(true);
        const result = await setUserRole(userId, target);
        setBusy(false);
        if (!result.ok) window.alert(result.error);
        router.refresh();
      }}
      className="rounded-lg border border-line px-3 py-1.5 text-sm font-semibold hover:border-brand-500 disabled:opacity-50"
    >
      {busy ? "Saving…" : `Make ${target}`}
    </button>
  );
}
