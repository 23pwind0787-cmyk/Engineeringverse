# Security review — Stages 2–6

Reviewed: the full codebase after Stages 2–6, including every route,
server action, and migration. Findings that were fixed during the
build are listed as fixed; residual risks are honest limitations,
not claims of safety.

## Fixed during this build

1. **Cross-table CHECK constraint removed.** The first draft of the
   papers migration put an `EXISTS` subquery in a CHECK constraint,
   which PostgreSQL rejects. The rule (subject belongs to the given
   department and semester; department belongs to the given campus)
   is now enforced by the `validate_paper_subject` trigger and again
   in the upload server action before insert.
2. **Role escalation via RLS policy OR-ing closed.** Two permissive
   UPDATE policies on `profiles` would have let an owner change
   their own role. A `prevent_non_admin_role_change` trigger now
   blocks any role change by a non-admin, and role changes go
   through a server action with a last-admin guard.
3. **Service-role key containment.** The service-role client lives
   in `src/lib/supabase/admin.ts`, which imports `server-only`, so a
   client import fails the build. It is used only for signed Storage
   URLs and admin deletion of another user's file. Grep-verified:
   no `SUPABASE_SERVICE_ROLE_KEY` reference in any client component
   or in `src/components/`.
4. **Unknown discipline slug 404 fixed.** `dynamicParams = false`
   was added to the discipline detail page, so unknown slugs return
   a real 404 instead of the previous HTTP 200 with a not-found page.
5. **Upload validation is server-side only.** The upload action
   checks the PDF magic bytes (`%PDF-`), the `.pdf` extension, and
   the 20 MB limit on the server. Client-side `accept=".pdf"` is
   presentation only and is not trusted.
6. **Signed URLs, not public files.** The `papers` bucket is
   private. Previews and downloads go through server route handlers
   that verify the paper is published, then redirect to a 5-minute
   signed URL. No public bucket URL is ever rendered.

## How each area is protected

- **Authentication:** Supabase Auth only. No passwords are stored in
  application tables. Sessions live in HTTP-only cookies refreshed
  by `src/proxy.ts`; protected routes (`/dashboard`, `/upload`,
  `/profile`, `/admin`) redirect signed-out visitors, and every
  server action re-checks the session.
- **Authorization:** RLS is enabled on every table. Papers: public
  read of published rows only; insert only as oneself; delete only
  own or admin. Structure: public read, admin-only write. Reports:
  insert as oneself, read own or admin, admin-only status changes.
  Profiles: read own or admin, update own (role changes blocked
  for non-admins by trigger).
- **Admin enforcement in depth:** admin pages check the profile role
  server-side and redirect; admin server actions call
  `requireAdmin()` before touching data; RLS policies repeat the
  admin check with the security-definer `is_admin()` helper.
- **File handling:** storage policies restrict uploads to the
  uploader's own folder (`<user-id>/...`) with a server-generated
  UUID filename, so a user cannot overwrite another user's file by
  name. Deleting a paper removes the Storage object first, then
  the row; if the row delete fails, the file is already gone and
  the paper is unreachable — acceptable, and logged as an error
  to the caller.
- **Download counting:** the counter increments through the
  security-definer `increment_download_count` RPC, so visitors
  never get write access to the papers table.
- **Secrets:** `.env.example` lists placeholders only. `.env.local`
  is git-ignored (verify with `git check-ignore .env.local` after
  creating it). No key, URL, or project ref is hard-coded.

## Residual risks and limitations (not fixed — owner action needed)

1. **Email verification is enforced in the server action, not in
   RLS.** The JWT available to RLS policies does not reliably carry
   `email_confirmed_at`, so the upload action checks
   `user.email_confirmed_at` via `getUser()` instead. If a future
   code path inserts papers without going through that action, the
   check would be bypassed. Keep all inserts behind the action.
2. **Migrations are untested against a live database.** There is no
   Supabase project for this build, so the SQL was reviewed by
   reading, not executed. The owner must run the migrations in
   order and report any error before going live (see
   SUPABASE_SETUP.md step 2). In particular, the Storage policy
   statements assume the `storage` schema is writable from the SQL
   editor, which is true on Supabase-hosted projects but should be
   confirmed.
3. **Admin deletion reason is not persisted.** The admin is asked
   for a removal reason in the UI, but once the paper row is
   deleted there is no audit table to store it in. If an audit
   trail is required, add a `paper_removals` table before relying
   on this flow for moderation records.
4. **Rate limiting:** none is configured. Supabase Auth has its own
   rate limits, but uploads and reports have no per-user throttling
   beyond the 20 MB file cap. Add Supabase or edge rate limiting
   before opening uploads widely.
5. **No virus/malware scanning of PDFs.** Magic-byte validation
   proves a file starts like a PDF; it does not prove it is safe.
   Do not open uploaded PDFs in privileged contexts; the iframe
   preview serves them from Supabase's domain via signed URL.
6. **Report reasons are free text** and are shown to admins
   unescaped in the admin UI only (React escapes by default). Do
   not copy report text into emails or other contexts without
   escaping.
7. **Unknown discipline slugs return HTTP 200, not 404.** The
   not-found page renders, but the production server returns 200
   in this Next 16 partial-prerender setup. Adding
   `dynamicParams = false` was tried and is rejected by the build
   (`cacheComponents` incompatibility), so the quirk is left as
   found. It affects only bad URLs, not real pages or SEO for
   listed pages.
