# EngineeringVerse

Explore Engineering. Master Technology. Build Your Future.

Next.js (App Router) + TypeScript + Tailwind CSS + Supabase
(PostgreSQL, Auth, Storage). All six stages are implemented.

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in Supabase values — see SUPABASE_SETUP.md
npm run dev                  # http://localhost:3000
npm run lint && npm run build
```

Without Supabase values the site still builds and runs: the home
page, discipline pages and search form render from the static seed
data, and auth/uploads show honest "not configured" messages. With
values set, auth, the paper portal, dashboards and admin tools work
against the live project.

## Setup documents

- `SUPABASE_SETUP.md` — every manual Supabase dashboard step, in
  order: project, migrations, Auth settings, Storage bucket,
  environment variables, first admin (SQL), adding subjects.
- `DEPLOYMENT.md` — Vercel deployment, environment variables,
  custom domain, post-deployment checks.
- `SECURITY_REVIEW.md` — what was audited and fixed, and the
  residual risks the owner must know about.

## Structure

- `src/lib/site.ts` – site config, sections, navigation
- `src/lib/disciplines.ts` – UET Peshawar departments, centres and
  programmes grouped by campus, from the official UET campus pages
  (see the source note at the top of the file). This is the seed
  data and the build-time fallback; the live structure lives in
  the database once Supabase is connected (see `src/lib/structure.ts`).
- `src/lib/supabase/` – browser/server/service-role clients.
  The service-role client is server-only (`server-only` import).
- `src/lib/actions/` – server actions: paper upload/report/delete,
  admin management, profile update.
- `src/app/` – routes, including `/auth/*`, `/upload`, `/dashboard`,
  `/admin`, `/past-papers` (search) and `/past-papers/[id]` (preview,
  download, report).
- `src/proxy.ts` – session refresh + protected-route redirects
  (Next.js 16 Proxy; middleware.ts is deprecated).
- `supabase/migrations/` – SQL migrations in order. Subjects are
  seeded empty on purpose: admins add real subjects only.
- `src/components/` – Header, Footer, Container, cards, auth/upload/
  admin forms.

## Notes

- Placeholder section pages (software, AI tools, learning, projects,
  careers, blog) are marked "Coming soon" and excluded from the
  sitemap. They contain no fake listings.
- No fake data anywhere: no seeded subjects, papers, tools or jobs.
- The `papers` Storage bucket is private; files are served only
  through short-lived signed URLs created server-side.
