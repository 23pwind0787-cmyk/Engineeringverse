"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  adminDeletePaper,
  hideContent,
  moderateContent,
  removeContent,
  resolveReport,
  setUserRole,
  unhideContent,
} from "@/lib/actions/admin";
import type { ContentType } from "@/lib/supabase/types";

/** Approve / Reject buttons for one pending submission. Reject asks for a note. */
export function ModerateButtons({
  contentType,
  contentId,
  title,
}: {
  contentType: ContentType;
  contentId: string;
  title: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function act(action: "approve" | "reject") {
    let note: string | undefined;
    if (action === "reject") {
      const input = window.prompt(`Why is "${title}" being rejected?`, "");
      if (input === null) return;
      note = input.trim();
    } else if (!window.confirm(`Approve "${title}"?`)) {
      return;
    }
    setBusy(true);
    const result = await moderateContent(contentType, contentId, action, note);
    setBusy(false);
    if (!result.ok) window.alert(result.error);
    router.refresh();
  }
  return (
    <span className="flex gap-2">
      <button
        type="button"
        disabled={busy}
        onClick={() => act("approve")}
        className="rounded-lg border border-line px-3 py-1.5 text-sm font-semibold hover:border-brand-500 disabled:opacity-50"
      >
        Approve
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => act("reject")}
        className="rounded-lg border border-line px-3 py-1.5 text-sm font-semibold hover:border-red-400 disabled:opacity-50"
      >
        {busy ? "Saving…" : "Reject"}
      </button>
    </span>
  );
}

/** Hide / unhide toggle plus permanent removal for one content item. */
export function HideRemoveButtons({
  contentType,
  contentId,
  title,
  hidden,
}: {
  contentType: ContentType;
  contentId: string;
  title: string;
  hidden: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function toggleHidden() {
    setBusy(true);
    const result = hidden
      ? await unhideContent(contentType, contentId)
      : await hideContent(contentType, contentId);
    setBusy(false);
    if (!result.ok) window.alert(result.error);
    router.refresh();
  }
  async function remove() {
    const reason = window.prompt(`Why is "${title}" being removed?`, "Inappropriate / duplicate / unauthorised");
    if (reason === null) return;
    if (!window.confirm(`Permanently remove "${title}"? This deletes its files and cannot be undone.`)) return;
    setBusy(true);
    const result = await removeContent(contentType, contentId, reason);
    setBusy(false);
    if (!result.ok) window.alert(result.error);
    router.refresh();
  }
  return (
    <span className="flex gap-2">
      <button
        type="button"
        disabled={busy}
        onClick={toggleHidden}
        className="rounded-lg border border-line px-3 py-1.5 text-sm font-semibold hover:border-brand-500 disabled:opacity-50"
      >
        {hidden ? "Unhide" : "Hide"}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={remove}
        className="rounded-lg border border-line px-3 py-1.5 text-sm font-semibold hover:border-red-400 disabled:opacity-50"
      >
        {busy ? "Removing…" : "Remove"}
      </button>
    </span>
  );
}

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
