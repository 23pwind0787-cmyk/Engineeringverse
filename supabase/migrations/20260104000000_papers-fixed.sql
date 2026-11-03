-- Stage 4: papers and reports.
-- CREATE TYPE has no IF NOT EXISTS on this PostgreSQL version, so
-- guard each enum with a pg_type check instead.
do $$ begin
  if not exists (select 1 from pg_type where typname = 'exam_type') then
    create type public.exam_type as enum ('Mid', 'Final', 'Quiz', 'Other');
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_type where typname = 'session_label') then
    create type public.session_label as enum ('Spring', 'Fall', 'Summer', 'Annual');
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_type where typname = 'report_status') then
    create type public.report_status as enum ('open', 'resolved', 'dismissed');
  end if;
end $$;

create table if not exists public.papers (
  id uuid primary key default gen_random_uuid(),
  uploader_id uuid not null references auth.users (id) on delete cascade,
  campus_id uuid not null references public.campuses (id) on delete restrict,
  department_id uuid not null references public.departments (id) on delete restrict,
  semester_id uuid not null references public.semesters (id) on delete restrict,
  subject_id uuid references public.subjects (id) on delete set null,
  title text not null,
  subject_code text not null,
  exam_type public.exam_type not null,
  year int not null check (year between 1950 and 2100),
  session public.session_label not null,
  storage_path text not null,
  file_size int not null check (file_size > 0 and file_size <= 20971520),
  page_count int,
  download_count int not null default 0,
  status text not null default 'published' check (status = 'published'),
  created_at timestamptz not null default now()
);

-- The subject/department/campus relationship rule cannot be a CHECK
-- constraint in PostgreSQL (checks cannot reference other tables), so
-- it is enforced by the trigger below and again in the upload server
-- action, which runs before the insert.
create or replace function public.validate_paper_subject()
returns trigger language plpgsql as $$
begin
  if new.subject_id is not null then
    if not exists (
      select 1 from public.subjects s
      where s.id = new.subject_id
        and s.department_id = new.department_id
        and s.semester_id = new.semester_id
    ) then
      raise exception 'subject does not belong to the given department and semester';
    end if;
    if not exists (
      select 1 from public.departments d
      where d.id = new.department_id and d.campus_id = new.campus_id
    ) then
      raise exception 'department does not belong to the given campus';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists papers_validate_subject on public.papers;
create trigger papers_validate_subject
  before insert or update on public.papers
  for each row execute function public.validate_paper_subject();

create table if not exists public.paper_reports (
  id uuid primary key default gen_random_uuid(),
  paper_id uuid not null references public.papers (id) on delete cascade,
  reporter_id uuid references auth.users (id) on delete set null,
  reason text not null,
  status public.report_status not null default 'open',
  created_at timestamptz not null default now()
);

-- Atomic download counter. Security definer so any visitor can count
-- a download without write access to the papers table.
create or replace function public.increment_download_count(paper_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.papers set download_count = download_count + 1 where id = paper_id;
$$;

alter table public.papers enable row level security;
alter table public.paper_reports enable row level security;

-- Anyone (including anonymous visitors) can read published papers.
drop policy if exists "papers public read" on public.papers;
create policy "papers public read" on public.papers for select using (status = 'published');

-- Authenticated users insert only their own papers. Email
-- verification is enforced in the upload server action (the JWT
-- available to RLS does not reliably carry email_confirmed_at); see
-- SECURITY_REVIEW.md.
drop policy if exists "papers insert own" on public.papers;
create policy "papers insert own" on public.papers
  for insert with check (auth.uid() = uploader_id);

drop policy if exists "papers delete own or admin" on public.papers;
create policy "papers delete own or admin" on public.papers
  for delete using (auth.uid() = uploader_id or public.is_admin());

-- No public update policy: download counts go through the RPC and
-- papers are never edited after publication.

drop policy if exists "reports insert authenticated" on public.paper_reports;
create policy "reports insert authenticated" on public.paper_reports
  for insert with check (auth.uid() = reporter_id);

drop policy if exists "reports read own or admin" on public.paper_reports;
create policy "reports read own or admin" on public.paper_reports
  for select using (auth.uid() = reporter_id or public.is_admin());

drop policy if exists "reports admin update" on public.paper_reports;
create policy "reports admin update" on public.paper_reports
  for update using (public.is_admin()) with check (public.is_admin());

-- Private Storage bucket for PDFs. Files are only ever served through
-- signed URLs created server-side; the bucket is never public.
insert into storage.buckets (id, name, public)
values ('papers', 'papers', false)
on conflict (id) do nothing;

-- Storage policies: an authenticated user uploads into their own
-- folder (<user-id>/...), reads nothing directly (signed URLs only),
-- and deletes only their own objects. Admin deletes use the
-- service-role key server-side.
drop policy if exists "papers storage insert own folder" on storage.objects;
create policy "papers storage insert own folder" on storage.objects
  for insert with check (
    bucket_id = 'papers'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "papers storage delete own or admin" on storage.objects;
create policy "papers storage delete own or admin" on storage.objects
  for delete using (
    bucket_id = 'papers'
    and (auth.uid()::text = (storage.foldername(name))[1] or public.is_admin())
  );
