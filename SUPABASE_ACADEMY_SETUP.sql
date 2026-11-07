-- HAKIM OPTICS ACADEMY v2.1 — optional account/course/subscription foundation
-- Run in Supabase SQL Editor. Then create an Auth user and promote the owner manually.
create table if not exists public.academy_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'student' check (role in ('student','lecturer','admin')),
  created_at timestamptz not null default now()
);
create table if not exists public.academy_courses (
  id uuid primary key default gen_random_uuid(),
  title_en text not null,
  title_ar text,
  description text,
  duration text,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now()
);
create table if not exists public.academy_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_name text not null,
  status text not null default 'pending' check (status in ('pending','active','expired','cancelled')),
  starts_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists public.academy_references (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  reference_type text,
  scope text,
  url text,
  created_at timestamptz not null default now()
);

create or replace function public.academy_is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.academy_profiles p where p.user_id = auth.uid() and p.role = 'admin') $$;

alter table public.academy_profiles enable row level security;
alter table public.academy_courses enable row level security;
alter table public.academy_subscriptions enable row level security;
alter table public.academy_references enable row level security;

drop policy if exists "profile self or admin read" on public.academy_profiles;
create policy "profile self or admin read" on public.academy_profiles for select to authenticated using (user_id = auth.uid() or public.academy_is_admin());
drop policy if exists "admin manage profiles" on public.academy_profiles;
create policy "admin manage profiles" on public.academy_profiles for all to authenticated using (public.academy_is_admin()) with check (public.academy_is_admin());

drop policy if exists "published courses public read" on public.academy_courses;
create policy "published courses public read" on public.academy_courses for select to anon, authenticated using (status = 'published' or public.academy_is_admin());
drop policy if exists "admin manage courses" on public.academy_courses;
create policy "admin manage courses" on public.academy_courses for all to authenticated using (public.academy_is_admin()) with check (public.academy_is_admin());

drop policy if exists "owner or admin read subscriptions" on public.academy_subscriptions;
create policy "owner or admin read subscriptions" on public.academy_subscriptions for select to authenticated using (user_id = auth.uid() or public.academy_is_admin());
drop policy if exists "admin manage subscriptions" on public.academy_subscriptions;
create policy "admin manage subscriptions" on public.academy_subscriptions for all to authenticated using (public.academy_is_admin()) with check (public.academy_is_admin());

drop policy if exists "references public read" on public.academy_references;
create policy "references public read" on public.academy_references for select to anon, authenticated using (true);
drop policy if exists "admin manage references" on public.academy_references;
create policy "admin manage references" on public.academy_references for all to authenticated using (public.academy_is_admin()) with check (public.academy_is_admin());

-- After creating your own Auth user, run this once with its real UUID:
-- insert into public.academy_profiles(user_id, display_name, role)
-- values ('YOUR-AUTH-USER-UUID', 'Academy Administrator', 'admin')
-- on conflict (user_id) do update set role = 'admin';
