import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { avatarColorClass, getLeaderboard, initialsFor } from "@/lib/leaderboard";

export const instant = false;

export const metadata: Metadata = {
  title: "Community",
  description:
    "The EngineeringVerse community — contributor leaderboard, popular resources, member profiles and uploads from UET Peshawar students.",
  alternates: { canonical: "https://engineeringverse.me/community" },
};

const HUB_CARDS: Array<{ href: string; title: string; description: string; cta: string }> = [
  {
    href: "/community/leaderboard",
    title: "Contributor Leaderboard",
    description:
      "Weekly, monthly and all-time rankings of the students sharing the most — ranked by approved uploads and downloads.",
    cta: "See the leaderboard →",
  },
  {
    href: "/popular",
    title: "Popular Resources",
    description:
      "The past papers, OEL reports, lab reports, books, notes, FYP reports and projects students download and read most.",
    cta: "Browse popular resources →",
  },
  {
    href: "/upload",
    title: "Upload Resources",
    description:
      "Share a past paper, lab report, book or notes with the whole university. Approved uploads count towards the leaderboard.",
    cta: "Upload a resource →",
  },
  {
    href: "/disciplines",
    title: "Departments",
    description:
      "Browse resources by department — every department, centre and programme at UET Peshawar, with its own resource library.",
    cta: "Browse departments →",
  },
  {
    href: "/projects",
    title: "Projects & FYPs",
    description:
      "Final year projects, research, robotics, AI and student innovations — shared by students, with reports and outcomes.",
    cta: "Explore projects →",
  },
  {
    href: "/seminars",
    title: "Seminars & Events",
    description:
      "Engineering seminars, workshops, webinars, industrial visits and competitions announced by departments and students.",
    cta: "See events →",
  },
];

export default async function CommunityPage() {
  const topContributors = await getLeaderboard("all_time", 5);

  return (
    <Container className="py-12 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Community</h1>
      <p className="mt-3 max-w-2xl text-muted">
        EngineeringVerse runs on students sharing what they have — past
        papers, lab reports, books, projects and events. Find the most
        active contributors, the resources everyone is reading, and add
        your own.
      </p>
      <p className="mt-4 text-sm text-muted">
        Looking for a contributor?{" "}
        <Link href="/community/leaderboard" className="font-medium text-brand-700 hover:underline">
          Search the leaderboard
        </Link>{" "}
        and open their profile from there.
      </p>

      <section aria-labelledby="top-contributors-heading" className="mt-12">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="top-contributors-heading" className="text-2xl font-bold tracking-tight">
            Top contributors
          </h2>
          <Link href="/community/leaderboard" className="text-sm font-semibold text-brand-700 hover:underline">
            Full leaderboard →
          </Link>
        </div>
        {topContributors.length === 0 ? (
          <div className="mt-6 max-w-2xl rounded-xl border border-line bg-surface p-6">
            <h3 className="text-lg font-semibold">No contributors yet</h3>
            <p className="mt-2 text-sm text-muted">
              Nobody has an approved upload yet. The first contributors will
              appear here once their uploads are approved — it could be you.
            </p>
            <p className="mt-4 text-sm">
              <Link href="/upload" className="font-semibold text-brand-700 hover:underline">
                Upload a resource →
              </Link>
            </p>
          </div>
        ) : (
          <ol className="mt-6 space-y-3">
            {topContributors.map(({ stat, badges }, index) => (
              <li
                key={stat.user_id}
                className="flex flex-col gap-2 rounded-xl border border-line bg-surface p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5"
              >
                <span className="flex items-center gap-3 sm:shrink-0">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-alt text-sm font-bold">
                    {index + 1}
                  </span>
                  {stat.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={stat.avatar_url}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ${avatarColorClass(stat.user_id)}`}
                    >
                      {initialsFor(stat.display_name)}
                    </span>
                  )}
                  <span className="min-w-0">
                    <Link
                      href={`/community/contributors/${stat.user_id}`}
                      className="block truncate font-semibold hover:text-brand-700 hover:underline"
                    >
                      {stat.display_name ?? "Contributor"}
                    </Link>
                    {stat.top_department_name && (
                      <span className="block truncate text-sm text-muted">
                        {stat.top_department_name}
                      </span>
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
      </section>

      <section aria-labelledby="explore-heading" className="mt-12">
        <h2 id="explore-heading" className="text-2xl font-bold tracking-tight">
          Explore the community
        </h2>
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {HUB_CARDS.map((card) => (
            <li key={card.href}>
              <Link
                href={card.href}
                className="flex h-full flex-col gap-3 rounded-xl border border-line bg-surface p-5 transition hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-md"
              >
                <h3 className="text-lg font-semibold">{card.title}</h3>
                <p className="flex-1 text-sm text-muted">{card.description}</p>
                <p className="text-sm font-semibold text-brand-700">{card.cta}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </Container>
  );
}
