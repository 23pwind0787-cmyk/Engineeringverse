"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteOwnPaper } from "@/lib/actions/papers";
import { deleteOwnProject } from "@/lib/actions/projects";
import { deleteOwnEvent } from "@/lib/actions/events";

function useDelete(action: (id: string) => Promise<void>) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return {
    busy,
    run: async (id: string) => {
      setBusy(true);
      await action(id);
      router.refresh();
    },
  };
}

const buttonClass =
  "rounded-lg border border-line px-4 py-2 text-sm font-semibold hover:border-red-400 disabled:opacity-50";

export function DeletePaperButton({ paperId, title }: { paperId: string; title: string }) {
  const { busy, run } = useDelete(deleteOwnPaper);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        if (!window.confirm(`Delete "${title}"? This removes the file permanently.`)) return;
        await run(paperId);
      }}
      className={buttonClass}
    >
      {busy ? "Deleting…" : "Delete"}
    </button>
  );
}

export function DeleteProjectButton({ projectId, title }: { projectId: string; title: string }) {
  const { busy, run } = useDelete(deleteOwnProject);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        if (!window.confirm(`Delete the project "${title}"? This removes it and its files permanently.`)) return;
        await run(projectId);
      }}
      className={buttonClass}
    >
      {busy ? "Deleting…" : "Delete"}
    </button>
  );
}

export function DeleteEventButton({ eventId, title }: { eventId: string; title: string }) {
  const { busy, run } = useDelete(deleteOwnEvent);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        if (!window.confirm(`Delete the event "${title}"? This removes it permanently.`)) return;
        await run(eventId);
      }}
      className={buttonClass}
    >
      {busy ? "Deleting…" : "Delete"}
    </button>
  );
}
