"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { reportPaper } from "@/lib/actions/papers";

export function ReportForm({ paperId }: { paperId: string }) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    const formData = new FormData();
    formData.set("paper_id", paperId);
    formData.set("reason", reason);
    const result = await reportPaper(formData);
    setBusy(false);
    if (!result.ok) setError(result.error);
    else {
      setDone(true);
      router.refresh();
    }
  }

  if (done) {
    return <p role="status" className="mt-4 text-sm">Thank you. Your report has been sent to the admins.</p>;
  }
  return (
    <form onSubmit={onSubmit} className="mt-4 max-w-xl space-y-3">
      <div>
        <label htmlFor="report-reason" className="text-sm font-medium">
          Reason (at least 10 characters)
        </label>
        <textarea
          id="report-reason"
          required
          minLength={10}
          rows={3}
          className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. This is a duplicate of another paper / this paper is not a UET paper"
        />
      </div>
      {error && (
        <p role="alert" className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm">{error}</p>
      )}
      <button type="submit" disabled={busy} className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold hover:border-brand-500 disabled:opacity-50">
        {busy ? "Sending…" : "Send report"}
      </button>
    </form>
  );
}
