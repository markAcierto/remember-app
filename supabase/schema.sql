-- REMEMBER app — Supabase schema
-- Run this in the Supabase SQL editor to create all tables.

-- Profiles (linked to auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Course progress (one row per user per pillar)
create table if not exists public.course_progress (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  pillar_slug text not null,
  status text not null default 'locked' check (status in ('completed', 'in-progress', 'locked')),
  lesson_index int not null default 0,
  updated_at timestamptz default now(),
  unique (user_id, pillar_slug)
);

-- Daily check-in logs
create table if not exists public.daily_logs (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  pillar_slug text,
  question text not null,
  response text not null,
  created_at timestamptz default now()
);

-- Community feed posts
create table if not exists public.feed_posts (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  display_name text not null,
  type text not null default 'checkin' check (type in ('breakthrough', 'checkin')),
  pillar_slug text,
  text text not null,
  created_at timestamptz default now()
);

-- Feed likes
create table if not exists public.feed_likes (
  post_id bigint references public.feed_posts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (post_id, user_id)
);

-- RLS policies
alter table public.profiles enable row level security;
alter table public.course_progress enable row level security;
alter table public.daily_logs enable row level security;
alter table public.feed_posts enable row level security;
alter table public.feed_likes enable row level security;

-- Users can read their own profile
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

-- Users can insert their own profile
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- Users can update their own profile
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Users can read/write their own course progress
create policy "progress_all_own" on public.course_progress
  for all using (auth.uid() = user_id);

-- Users can read/write their own daily logs
create policy "logs_all_own" on public.daily_logs
  for all using (auth.uid() = user_id);

-- Anyone can read feed posts; only the author can delete
create policy "feed_select_all" on public.feed_posts for select using (true);
create policy "feed_insert_own" on public.feed_posts for insert with check (auth.uid() = user_id);
create policy "feed_delete_own" on public.feed_posts for delete using (auth.uid() = user_id);

-- Anyone can like; users can remove their own likes
create policy "likes_select_all" on public.feed_likes for select using (true);
create policy "likes_insert_own" on public.feed_likes for insert with check (auth.uid() = user_id);
create policy "likes_delete_own" on public.feed_likes for delete using (auth.uid() = user_id);

-- Trigger: auto-create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();