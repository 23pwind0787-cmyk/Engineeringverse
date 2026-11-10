"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { reportContent } from "@/lib/actions/reports";
import { REPORT_REASONS, type ContentType } from "@/lib/supabase/types";

/**
 * Report button + form for any content type (paper, project, event).
 * Offers the six canonical reasons (Stage 7); an optional details
 * field takes extra context. Signed-in users only — the server
 * action enforces this as well.
 */
export function ReportButton({
  contentType,
  contentId,
  label = "Report this content",
}: {
  contentType: ContentType;
  contentId: string;
  label?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    const formData = new FormData();
    formData.set("content_type", contentType);
    formData.set("content_id", contentId);
    formData.set("reason", reason);
    formData.set("details", details);
    const result = await reportContent(formData);
    setBusy(false);
    if (!result.ok) setError(result.error);
    else {
      setDone(true);
      router.refresh();
    }
  }

  if (done) {
    return (
      <p role="status" className="mt-4 text-sm">
        Thank you. Your report has been sent to the admins, who will review it.
      </p>
    );
  }
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold hover:border-brand-500"
      >
        {label}
      </button>
    );
  }
  return (
    <form onSubmit={onSubmit} className="mt-4 max-w-xl space-y-3">
      <div>
        <label htmlFor="report-reason" className="text-sm font-medium">
          Reason
        </label>
        <select
          id="report-reason"
          required
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm"
        >
          <option value="" disabled>
            Choose a reason…
          </option>
          {REPORT_REASONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="report-details" className="text-sm font-medium">
          Details (optional)
        </label>
        <textarea
          id="report-details"
          rows={3}
          className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Anything that helps an admin check this — e.g. where the original is, what is wrong with the file"
        />
      </div>
      <p className="text-xs text-muted">
        Reports go to the admin moderation queue. Content is never removed automatically because
        someone reported it.
      </p>
      {error && (
        <p role="alert" className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold hover:border-brand-500 disabled:opacity-50"
        >
          {busy ? "Sending…" : "Send report"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg px-4 py-2.5 text-sm font-semibold text-muted hover:underline"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
