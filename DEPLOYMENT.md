# Deployment preparation (Vercel)

## Before deploying

1. Complete every step in `SUPABASE_SETUP.md`: project created,
   migrations applied in order, Auth URL configuration set, private
   `papers` bucket in place, first admin created by SQL.
2. Claim the site's domain (for example through a GitHub Student
   Pack domain offer) and check its renewal price before claiming.
   The domain claim is done by the site owner on the provider's
   site; nothing in this repository claims a domain.

## Deploy to Vercel

1. Push the code to a GitHub repository (the owner does this; no
   remote is configured in this workspace).
2. In Vercel, **Add New → Project**, import the repository.
3. Framework preset: **Next.js**. Keep the defaults (build command
   `npm run build`, output directory handled by Next.js).
4. Add these Environment Variables (Production, Preview, and
   Development as appropriate):
   - `NEXT_PUBLIC_SITE_URL` — the production domain, e.g.
     `https://engineeringverse.example`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` — server only, never `NEXT_PUBLIC_`
5. Deploy. Vercel gives a `*.vercel.app` URL immediately.

## Custom domain

1. In Vercel → Project → Settings → Domains, add the claimed domain
   and follow Vercel's DNS instructions at the domain registrar
   (an `A`/`CNAME` record as Vercel shows — copy the exact values
   from the Vercel dashboard, do not guess them).
2. Once the domain is live, update Supabase → Authentication → URL
   Configuration: Site URL and redirect URLs must use the real
   domain, including `https://<your-domain>/auth/callback`.
3. Update `NEXT_PUBLIC_SITE_URL` in Vercel to the real domain and
   redeploy, so the sitemap and share previews use it.

## After deployment

- Submit the sitemap to Google Search Console:
  `https://<your-domain>/sitemap.xml`. The sitemap includes paper
  detail URLs automatically once papers exist.
- Confirm `https://<your-domain>/robots.txt` allows crawling.
- Test, on the live site: sign up, verify email, upload a test PDF,
  preview, download (count increases), report, admin removal.
- Keep the Vercel deployment's Preview environments for pull
  requests; they use the same environment variables, so test
  uploads there go to the same Supabase project — use a separate
  Supabase project for staging if that matters.

## Rollback

Vercel keeps every deployment. Roll back from Vercel → Deployments
→ the previous deployment → **Promote to Production**. Database
migrations are not rolled back automatically; the migrations in
this project only add tables/policies, so rolling back the code
does not break the database.
