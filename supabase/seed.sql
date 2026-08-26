-- REMEMBER app — Supabase seed
-- Run after schema.sql. Pre-fills the 8 pillar courses.
-- (Lessons are defined in the app's mock-data.ts and will be
--  migrated to a lessons table when video hosting is set up.)

insert into public.course_progress (user_id, pillar_slug, status, lesson_index)
select id, 'recognize', 'locked', 0 from public.profiles
where not exists (
  select 1 from public.course_progress cp
  where cp.user_id = public.profiles.id and cp.pillar_slug = 'recognize'
);

insert into public.course_progress (user_id, pillar_slug, status, lesson_index)
select id, 'evaluate', 'locked', 0 from public.profiles
where not exists (
  select 1 from public.course_progress cp
  where cp.user_id = public.profiles.id and cp.pillar_slug = 'evaluate'
);

insert into public.course_progress (user_id, pillar_slug, status, lesson_index)
select id, 'manage', 'locked', 0 from public.profiles
where not exists (
  select 1 from public.course_progress cp
  where cp.user_id = public.profiles.id and cp.pillar_slug = 'manage'
);

insert into public.course_progress (user_id, pillar_slug, status, lesson_index)
select id, 'express', 'locked', 0 from public.profiles
where not exists (
  select 1 from public.course_progress cp
  where cp.user_id = public.profiles.id and cp.pillar_slug = 'express'
);

insert into public.course_progress (user_id, pillar_slug, status, lesson_index)
select id, 'monitor', 'locked', 0 from public.profiles
where not exists (
  select 1 from public.course_progress cp
  where cp.user_id = public.profiles.id and cp.pillar_slug = 'monitor'
);

insert into public.course_progress (user_id, pillar_slug, status, lesson_index)
select id, 'bridge', 'locked', 0 from public.profiles
where not exists (
  select 1 from public.course_progress cp
  where cp.user_id = public.profiles.id and cp.pillar_slug = 'bridge'
);

insert into public.course_progress (user_id, pillar_slug, status, lesson_index)
select id, 'evaluate-self', 'locked', 0 from public.profiles
where not exists (
  select 1 from public.course_progress cp
  where cp.user_id = public.profiles.id and cp.pillar_slug = 'evaluate-self'
);

insert into public.course_progress (user_id, pillar_slug, status, lesson_index)
select id, 'repeat', 'locked', 0 from public.profiles
where not exists (
  select 1 from public.course_progress cp
  where cp.user_id = public.profiles.id and cp.pillar_slug = 'repeat'
);