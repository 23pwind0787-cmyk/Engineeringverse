# Supabase setup — manual steps for the site owner

EngineeringVerse needs a Supabase project before sign-in, uploads, or
the paper portal work. Nothing in the code creates a project or an
account. Do every step below in your own Supabase and GitHub accounts.
No keys are written anywhere in this repository.

## 1. Create the Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and sign in.
2. **New project**. Choose any name (for example `engineeringverse`),
   a database password you store safely, and the region closest to
   your users.
3. Wait for the project to finish provisioning.

## 2. Run the database migrations

Apply the SQL files in `supabase/migrations/` in filename order.
Two ways:

- **Supabase CLI** (recommended): install the CLI, run
  `supabase link --project-ref <YOUR_PROJECT_REF>` then
  `supabase db push`. The project ref is in Dashboard → Settings →
  General → Reference ID.
- **Dashboard SQL editor**: open Dashboard → SQL Editor, paste each
  migration file in order, and run it. The files are:
  1. `20260101000000_profiles.sql` — profiles + role guard
  2. `20260102000000_structure.sql` — campuses, departments, semesters, subjects + RLS
  3. `20260103000000_seed_structure.sql` — UET campus/department seed (structure only; no subjects)
  4. `20260104000000_papers.sql` — papers, reports, download counter, private `papers` Storage bucket + Storage policies

Verify in Dashboard → Table Editor that `profiles`, `campuses`,
`departments`, `semesters`, `subjects`, `papers` and `paper_reports`
exist, and that `campuses`/`departments` contain the 29 seeded
entries. If the Storage bucket step failed (for example because the
`storage` schema was not writable), create the bucket manually in
step 4 instead and re-run only the Storage policy statements.

## 3. Configure Authentication

Dashboard → Authentication → Providers → Email: **enabled**.

Dashboard → Authentication → URL Configuration:

- **Site URL**: your production URL, for example
  `https://engineeringverse.example` (use `http://localhost:3000`
  only for local development).
- **Redirect URLs**: add both
  - `http://localhost:3000/auth/callback`
  - `https://engineeringverse.example/auth/callback` (your real domain)

Dashboard → Authentication → Email Templates: keep the default
**Confirm signup** and **Reset password** templates, and confirm
their action links point at `/auth/callback`. Supabase's default
`{{ .ConfirmationURL }}` already carries the code this app exchanges
in `src/app/auth/callback/route.ts`.

Leave **Confirm email** enabled. The upload flow requires a verified
email; disabling confirmation would let unverified accounts upload.

## 4. Create the Storage bucket (only if step 2 did not)

Dashboard → Storage → **New bucket**:

- Name: `papers` (exactly this name — the code uses it)
- **Private bucket**: on (public bucket: off)

Then run the Storage policy statements from migration
`20260104000000_papers.sql` in the SQL editor if they were not
applied. Files are served only through signed URLs created by the
server, never through public bucket URLs.

## 5. Copy the API keys into environment variables

Dashboard → Settings → API. Copy:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` / publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` key — **secret** |

Set them:

- **Locally**: copy `.env.example` to `.env.local` and fill in the
  values. Never commit `.env.local`.
- **Vercel**: Project → Settings → Environment Variables, same names.
  `SUPABASE_SERVICE_ROLE_KEY` must never get a `NEXT_PUBLIC_` prefix.

Also set `NEXT_PUBLIC_SITE_URL` to your real domain in production,
or the sitemap and share previews will point at localhost.

## 6. Create the first admin (SQL — no admin exists at bootstrap)

No email is hard-coded as admin anywhere in the code. After you have
registered and verified your own account, run this in the SQL editor,
replacing the email with yours:

```sql
update public.profiles
set role = 'admin'
where email = 'you@example.com';
```

Sign out and back in. Further admins are promoted from the admin
dashboard. The last remaining admin cannot be demoted (enforced in
the role-change server action).

## 7. Add subjects (admin dashboard)

Subjects are intentionally empty after seeding. An admin adds real
subjects — department, semester, official code, official name — in
**Admin → Manage structure**. Papers can be uploaded without a
linked subject (subject code is entered by hand), and linked once
the subject exists.

## 8. Check the setup

1. `npm run dev`, open the site, create an account, verify the email.
2. Upload a test PDF (any real paper you have the right to share).
   It should appear on `/past-papers` immediately.
3. Open its detail page: the preview should load and the download
   count should increase after a download.
4. In the admin dashboard, remove the test paper and confirm both
   the row and the file are gone.

## Placeholders in this document

- `<YOUR_PROJECT_REF>` — your Supabase project reference ID.
- `https://engineeringverse.example` — replace with the domain you
  claim for the site.
- `you@example.com` — the email of the account you make admin.
