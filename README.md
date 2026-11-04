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

## Articles

The blog (`/blog`) is powered by Markdown files — no database, no
CMS. Articles live in `content/articles/<slug>.md`, where `<slug>`
is a lowercase, hyphenated filename (for example
`ansys-2026-r1-release.md`).

Frontmatter (all of title, summary, date and category are required):

```yaml
---
title: "Article title"
summary: "One or two sentences, also used as the SEO description."
date: 2026-11-05
category: software-news
tags: [ANSYS, simulation]
sourceName: "ANSYS official release notes"
sourceUrl: "https://example.com/release-notes"
featuredImage: "https://example.com/licensed-image.jpg"
featuredImageCredit: "Image: Example Corp, CC BY 4.0"
---
```

- `category` must be one of: `software-news`, `ai-tools`,
  `technology-news`, `tutorials`, `careers`, `resources`.
- `tags` is a list of short labels, written as a YAML list or a
  comma-separated list.
- `sourceName` / `sourceUrl` link the official or reputable source
  the article was researched from. `sourceUrl` must be an http(s)
  URL. Omit both only if the article genuinely has no external
  source (for example an original tutorial); never invent a source.
- `featuredImage` is optional. Use it only for a real, licensed
  image URL, with `featuredImageCredit` stating the credit/licence.
  Omit both when no suitable licensed image exists — never use an
  unlicensed image, an AI-generated image presented as real, or a
  copied image.
- The body is Markdown: headings, paragraphs, bold/italic, links,
  lists, blockquotes and code blocks. Raw HTML in the body is
  escaped, never rendered.

Rules:

- Never invent news, release dates, versions, prices or features.
  Every factual claim must be checked against the linked source,
  and speculation must be labelled as such in the article text.
- With no article files, `/blog` shows an honest "No articles yet"
  empty state and the sitemap contains only `/blog`. Files with
  missing or invalid frontmatter are skipped at build time with a
  warning, so a bad file cannot publish a broken article.
- After adding or editing an article, run `npm run lint && npm run
  build` and check the list and detail pages before pushing.

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

- The blog (`/blog`) is a real article index backed by Markdown
  files in `content/articles/` (see "Articles" above). It starts
  empty on purpose: no article is published until a real, researched
  one is added.
- Placeholder section pages (software, AI tools, learning, projects,
  careers) are marked "Coming soon" and excluded from the sitemap.
  They contain no fake listings; software, AI tools, learning and
  careers pages link to the matching blog category only once an
  article in that category exists.
- No fake data anywhere: no seeded subjects, papers, tools or jobs.
- The `papers` Storage bucket is private; files are served only
  through short-lived signed URLs created server-side.
