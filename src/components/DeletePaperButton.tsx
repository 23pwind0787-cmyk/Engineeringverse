"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteOwnPaper } from "@/lib/actions/papers";

export function DeletePaperButton({ paperId, title }: { paperId: string; title: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        if (!window.confirm(`Delete "${title}"? This removes the file permanently.`)) return;
        setBusy(true);
        await deleteOwnPaper(paperId);
        router.refresh();
      }}
      className="rounded-lg border border-line px-4 py-2 text-sm font-semibold hover:border-red-400 disabled:opacity-50"
    >
      {busy ? "Deleting…" : "Delete"}
    </button>
  );
}
