import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { avatarColorClass, getLeaderboard, initialsFor } from "@/lib/leaderboard";
import type { LeaderboardPeriod } from "@/lib/supabase/types";

export const instant = false;

export const metadata: Metadata = {
  title: "Contributor Leaderboard",
  description:
    "The most active EngineeringVerse contributors — ranked by approved uploads and downloads, weekly, monthly and all time. Only approved, visible contributions count.",
  alternates: { canonical: "https://engineeringverse.me/community/leaderboard" },
};

const PERIODS: Array<{ value: LeaderboardPeriod; label: string; note: string }> = [
  { value: "week", label: "This week", note: "approved uploads in the last 7 days" },
  { value: "month", label: "This month", note: "approved uploads in the last 30 days" },
  { value: "all_time", label: "All time", note: "every approved upload" },
];

function isPeriod(value: string | undefined): value is LeaderboardPeriod {
  return value === "week" || value === "month" || value === "all_time";
}

function Avatar({
  userId,
  displayName,
  avatarUrl,
  size = "md",
}: {
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  size?: "md" | "lg";
}) {
  const sizeClass = size === "lg" ? "h-12 w-12 text-base" : "h-10 w-10 text-sm";
  if (avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={avatarUrl} alt="" className={`${sizeClass} rounded-full object-cover`} />;
  }
  return (
    <span
      aria-hidden="true"
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full font-bold text-white ${avatarColorClass(userId)}`}
    >
      {initialsFor(displayName)}
    </span>
  );
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const params = await searchParams;
  const period: LeaderboardPeriod = isPeriod(params.period) ? params.period : "all_time";
  const active = PERIODS.find((p) => p.value === period) ?? PERIODS[2];
  const entries = await getLeaderboard(period, 50);

  return (
    <Container className="py-12 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Contributor Leaderboard</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Ranked by approved uploads, then total downloads — {active.note}. Only
        approved, visible contributions count, so a removed upload stops
        counting towards its uploader.
      </p>

      <nav aria-label="Leaderboard period" className="mt-8 flex flex-wrap gap-2">
        {PERIODS.map((p) => (
          <Link
            key={p.value}
            href={`/community/leaderboard?period=${p.value}`}
            aria-current={p.value === period ? "page" : undefined}
            className={
              p.value === period
                ? "rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
                : "rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium hover:border-brand-500"
            }
          >
            {p.label}
          </Link>
        ))}
      </nav>

      {entries.length === 0 ? (
        <div className="mt-8 max-w-2xl rounded-xl border border-line bg-surface p-6">
          <h2 className="text-lg font-semibold">No contributions yet in this period</h2>
          <p className="mt-2 text-sm text-muted">
            Nobody has an approved upload {period === "all_time" ? "yet" : `in the ${active.label.toLowerCase()}`}
            . Uploads appear here once an admin approves them — be the first
            to share a resource, project or event.
          </p>
          <p className="mt-4 text-sm">
            <Link href="/upload" className="font-semibold text-brand-700 hover:underline">
              Upload a resource →
            </Link>
          </p>
        </div>
      ) : (
        <ol className="mt-8 space-y-3">
          {entries.map(({ stat, badges }, index) => (
            <li
              key={stat.user_id}
              className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5"
            >
              <span className="flex items-center gap-3 sm:w-40 sm:shrink-0">
                <span
                  className={
                    index < 3
                      ? "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white"
                      : "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-alt text-sm font-bold"
                  }
                >
                  {index + 1}
                </span>
                <Avatar userId={stat.user_id} displayName={stat.display_name} avatarUrl={stat.avatar_url} />
                <span className="min-w-0">
                  <Link
                    href={`/community/contributors/${stat.user_id}`}
                    className="block truncate font-semibold hover:text-brand-700 hover:underline"
                  >
                    {stat.display_name ?? "Contributor"}
                  </Link>
                  {stat.top_department_name && (
                    <span className="block truncate text-sm text-muted">{stat.top_department_name}</span>
                  )}
                </span>
              </span>
              <span className="flex flex-wrap gap-x-5 gap-y-1 text-sm sm:ml-auto">
                <span>
                  <span className="font-bold">{stat.approved_uploads}</span>{" "}
                  <span className="text-muted">
                    approved upload{stat.approved_uploads === 1 ? "" : "s"}
                  </span>
                </span>
                <span>
                  <span className="font-bold">{stat.total_downloads}</span>{" "}
                  <span className="text-muted">
                    download{stat.total_downloads === 1 ? "" : "s"}
                  </span>
                </span>
              </span>
              {badges.length > 0 && (
                <span className="flex flex-wrap gap-2">
                  {badges.map((badge) => (
                    <span
                      key={badge}
                      className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700"
                    >
                      {badge}
                    </span>
                  ))}
                </span>
              )}
            </li>
          ))}
        </ol>
      )}

      <p className="mt-8 text-sm text-muted">
        Rankings are computed live from approved uploads and genuine
        downloads — nothing here is seeded or estimated.{" "}
        <Link href="/community" className="font-medium text-brand-700 hover:underline">
          Back to Community →
        </Link>
      </p>
    </Container>
  );
}
