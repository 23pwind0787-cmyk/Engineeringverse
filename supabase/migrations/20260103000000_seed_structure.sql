-- Seed: campuses and departments/centres/programmes.
-- Source: the official UET Peshawar campus pages (uetpeshawar.edu.pk),
-- as recorded in src/lib/disciplines.ts. Editorial descriptions live
-- only in the application code; this seed stores structure only.
-- Subjects are intentionally NOT seeded: admins add them in Stage 5.

insert into public.campuses (name, slug) values ('Peshawar', 'peshawar') on conflict (slug) do nothing;
insert into public.campuses (name, slug) values ('Abbottabad', 'abbottabad') on conflict (slug) do nothing;
insert into public.campuses (name, slug) values ('Bannu', 'bannu') on conflict (slug) do nothing;
insert into public.campuses (name, slug) values ('Jalozai (Nowshera)', 'jalozai') on conflict (slug) do nothing;

insert into public.departments (campus_id, name, slug, kind) values ((select id from public.campuses where slug = 'peshawar'), 'Electrical Engineering', 'electrical-peshawar', 'department') on conflict (slug) do nothing;
insert into public.departments (campus_id, name, slug, kind) values ((select id from public.campuses where slug = 'peshawar'), 'Mining Engineering', 'mining-peshawar', 'department') on conflict (slug) do nothing;
insert into public.departments (campus_id, name, slug, kind) values ((select id from public.campuses where slug = 'peshawar'), 'Computer System Engineering', 'computer-systems-peshawar', 'department') on conflict (slug) do nothing;
insert into public.departments (campus_id, name, slug, kind) values ((select id from public.campuses where slug = 'peshawar'), 'Industrial Engineering', 'industrial-peshawar', 'department') on conflict (slug) do nothing;
insert into public.departments (campus_id, name, slug, kind) values ((select id from public.campuses where slug = 'peshawar'), 'Chemical Engineering', 'chemical-peshawar', 'department') on conflict (slug) do nothing;
insert into public.departments (campus_id, name, slug, kind) values ((select id from public.campuses where slug = 'peshawar'), 'Mechanical Engineering', 'mechanical-peshawar', 'department') on conflict (slug) do nothing;
insert into public.departments (campus_id, name, slug, kind) values ((select id from public.campuses where slug = 'peshawar'), 'Civil Engineering', 'civil-peshawar', 'department') on conflict (slug) do nothing;
insert into public.departments (campus_id, name, slug, kind) values ((select id from public.campuses where slug = 'peshawar'), 'Agricultural Engineering', 'agricultural-peshawar', 'department') on conflict (slug) do nothing;
insert into public.departments (campus_id, name, slug, kind) values ((select id from public.campuses where slug = 'peshawar'), 'Computer Science', 'computer-science-peshawar', 'department') on conflict (slug) do nothing;
insert into public.departments (campus_id, name, slug, kind) values ((select id from public.campuses where slug = 'peshawar'), 'Mechatronics Engineering', 'mechatronics-peshawar', 'department') on conflict (slug) do nothing;
insert into public.departments (campus_id, name, slug, kind) values ((select id from public.campuses where slug = 'peshawar'), 'Architecture', 'architecture-peshawar', 'department') on conflict (slug) do nothing;
insert into public.departments (campus_id, name, slug, kind) values ((select id from public.campuses where slug = 'peshawar'), 'US-Pakistan Center for Advanced Studies in Energy (USPCAS-E)', 'uspcase-peshawar', 'centre') on conflict (slug) do nothing;
insert into public.departments (campus_id, name, slug, kind) values ((select id from public.campuses where slug = 'peshawar'), 'National Institute of Urban Infrastructure Planning (NIUIP)', 'niuip-peshawar', 'centre') on conflict (slug) do nothing;
insert into public.departments (campus_id, name, slug, kind) values ((select id from public.campuses where slug = 'peshawar'), 'Software Engineering', 'software-engineering-peshawar', 'programme') on conflict (slug) do nothing;
insert into public.departments (campus_id, name, slug, kind) values ((select id from public.campuses where slug = 'peshawar'), 'Artificial Intelligence', 'artificial-intelligence-peshawar', 'programme') on conflict (slug) do nothing;
insert into public.departments (campus_id, name, slug, kind) values ((select id from public.campuses where slug = 'peshawar'), 'Cyber Security', 'cyber-security-peshawar', 'programme') on conflict (slug) do nothing;
insert into public.departments (campus_id, name, slug, kind) values ((select id from public.campuses where slug = 'abbottabad'), 'Electronics Engineering', 'electronics-abbottabad', 'department') on conflict (slug) do nothing;
insert into public.departments (campus_id, name, slug, kind) values ((select id from public.campuses where slug = 'abbottabad'), 'Architecture, City & Regional Planning', 'architecture-crp-abbottabad', 'department') on conflict (slug) do nothing;
insert into public.departments (campus_id, name, slug, kind) values ((select id from public.campuses where slug = 'abbottabad'), 'Computer Science', 'computer-science-abbottabad', 'department') on conflict (slug) do nothing;
insert into public.departments (campus_id, name, slug, kind) values ((select id from public.campuses where slug = 'abbottabad'), 'Software Engineering', 'software-engineering-abbottabad', 'programme') on conflict (slug) do nothing;
insert into public.departments (campus_id, name, slug, kind) values ((select id from public.campuses where slug = 'bannu'), 'Electrical Engineering', 'electrical-bannu', 'department') on conflict (slug) do nothing;
insert into public.departments (campus_id, name, slug, kind) values ((select id from public.campuses where slug = 'bannu'), 'Civil Engineering', 'civil-bannu', 'department') on conflict (slug) do nothing;
insert into public.departments (campus_id, name, slug, kind) values ((select id from public.campuses where slug = 'bannu'), 'Computer Science', 'computer-science-bannu', 'department') on conflict (slug) do nothing;
insert into public.departments (campus_id, name, slug, kind) values ((select id from public.campuses where slug = 'bannu'), 'Artificial Intelligence', 'artificial-intelligence-bannu', 'programme') on conflict (slug) do nothing;
insert into public.departments (campus_id, name, slug, kind) values ((select id from public.campuses where slug = 'jalozai'), 'Electrical Engineering', 'electrical-jalozai', 'department') on conflict (slug) do nothing;
insert into public.departments (campus_id, name, slug, kind) values ((select id from public.campuses where slug = 'jalozai'), 'Civil Engineering', 'civil-jalozai', 'department') on conflict (slug) do nothing;
insert into public.departments (campus_id, name, slug, kind) values ((select id from public.campuses where slug = 'jalozai'), 'Mechanical Engineering', 'mechanical-jalozai', 'department') on conflict (slug) do nothing;
insert into public.departments (campus_id, name, slug, kind) values ((select id from public.campuses where slug = 'jalozai'), 'Industrial Engineering', 'industrial-jalozai', 'department') on conflict (slug) do nothing;
insert into public.departments (campus_id, name, slug, kind) values ((select id from public.campuses where slug = 'jalozai'), 'Computer Science', 'computer-science-jalozai', 'department') on conflict (slug) do nothing;

-- Semesters 1-8: configurable structure, no subjects attached yet.
insert into public.semesters (number, label) values (1, 'Semester 1') on conflict (number) do nothing;
insert into public.semesters (number, label) values (2, 'Semester 2') on conflict (number) do nothing;
insert into public.semesters (number, label) values (3, 'Semester 3') on conflict (number) do nothing;
insert into public.semesters (number, label) values (4, 'Semester 4') on conflict (number) do nothing;
insert into public.semesters (number, label) values (5, 'Semester 5') on conflict (number) do nothing;
insert into public.semesters (number, label) values (6, 'Semester 6') on conflict (number) do nothing;
insert into public.semesters (number, label) values (7, 'Semester 7') on conflict (number) do nothing;
insert into public.semesters (number, label) values (8, 'Semester 8') on conflict (number) do nothing;
