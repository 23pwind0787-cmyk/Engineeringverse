-- Stage 3: university structure. Campuses, departments/centres/
-- programmes, semesters and subjects. Subjects are admin-configurable
-- and are seeded EMPTY: no subject list is invented here.
create table if not exists public.campuses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  campus_id uuid not null references public.campuses (id) on delete cascade,
  name text not null,
  slug text not null unique,
  kind text not null check (kind in ('department', 'centre', 'programme')),
  created_at timestamptz not null default now()
);

create table if not exists public.semesters (
  id uuid primary key default gen_random_uuid(),
  number int not null unique check (number between 1 and 12),
  label text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments (id) on delete cascade,
  semester_id uuid not null references public.semesters (id) on delete restrict,
  code text not null,
  name text not null,
  created_at timestamptz not null default now(),
  unique (department_id, semester_id, code)
);

alter table public.campuses enable row level security;
alter table public.departments enable row level security;
alter table public.semesters enable row level security;
alter table public.subjects enable row level security;

-- Public read for the published structure; writes are admin-only.
-- Anonymous visitors can read: the structure is public information.
drop policy if exists "structure public read" on public.campuses;
create policy "structure public read" on public.campuses for select using (true);
drop policy if exists "structure public read" on public.departments;
create policy "structure public read" on public.departments for select using (true);
drop policy if exists "structure public read" on public.semesters;
create policy "structure public read" on public.semesters for select using (true);
drop policy if exists "structure public read" on public.subjects;
create policy "structure public read" on public.subjects for select using (true);

drop policy if exists "structure admin write" on public.campuses;
create policy "structure admin write" on public.campuses for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "structure admin write" on public.departments;
create policy "structure admin write" on public.departments for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "structure admin write" on public.semesters;
create policy "structure admin write" on public.semesters for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "structure admin write" on public.subjects;
create policy "structure admin write" on public.subjects for all using (public.is_admin()) with check (public.is_admin());
