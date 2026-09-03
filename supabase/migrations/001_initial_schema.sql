create extension if not exists "pgcrypto";

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id uuid primary key,
  site_title text not null default 'DERANGED FAN',
  homepage_quote text not null default 'Just the sound of quiet thoughts after midnight.',
  soundcloud_profile_url text,
  youtube_channel_id text,
  spotify_url text,
  soundcloud_url text,
  youtube_url text,
  background_video_url text,
  background_mobile_video_url text,
  background_poster_url text,
  background_overlay_opacity numeric not null default 0.48,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.music_overrides (
  id uuid primary key default gen_random_uuid(),
  source_id text,
  soundcloud_url text not null,
  title_override text,
  artwork_override text,
  visible boolean not null default true,
  sort_order integer not null default 0,
  is_manual boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.video_overrides (
  id uuid primary key default gen_random_uuid(),
  youtube_video_id text,
  youtube_url text,
  title_override text,
  visible boolean not null default true,
  sort_order integer not null default 0,
  is_manual boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.site_settings (
  id,
  site_title,
  homepage_quote
) values (
  '00000000-0000-0000-0000-000000000001',
  'DERANGED FAN',
  'Just the sound of quiet thoughts after midnight.'
) on conflict (id) do nothing;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

alter table public.admin_users enable row level security;
alter table public.site_settings enable row level security;
alter table public.music_overrides enable row level security;
alter table public.video_overrides enable row level security;

drop policy if exists "Admins can read admins" on public.admin_users;
create policy "Admins can read admins"
on public.admin_users for select
to authenticated
using (public.is_admin());

drop policy if exists "Public can read settings" on public.site_settings;
create policy "Public can read settings"
on public.site_settings for select
to anon, authenticated
using (true);

drop policy if exists "Admins can write settings" on public.site_settings;
create policy "Admins can write settings"
on public.site_settings for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read visible music" on public.music_overrides;
create policy "Public can read visible music"
on public.music_overrides for select
to anon, authenticated
using (visible or public.is_admin());

drop policy if exists "Admins can write music" on public.music_overrides;
create policy "Admins can write music"
on public.music_overrides for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read visible videos" on public.video_overrides;
create policy "Public can read visible videos"
on public.video_overrides for select
to anon, authenticated
using (visible or public.is_admin());

drop policy if exists "Admins can write videos" on public.video_overrides;
create policy "Admins can write videos"
on public.video_overrides for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-media',
  'site-media',
  true,
  104857600,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read site media" on storage.objects;
create policy "Public can read site media"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'site-media');

drop policy if exists "Admins can insert site media" on storage.objects;
create policy "Admins can insert site media"
on storage.objects for insert
to authenticated
with check (bucket_id = 'site-media' and public.is_admin());

drop policy if exists "Admins can update site media" on storage.objects;
create policy "Admins can update site media"
on storage.objects for update
to authenticated
using (bucket_id = 'site-media' and public.is_admin())
with check (bucket_id = 'site-media' and public.is_admin());

drop policy if exists "Admins can delete site media" on storage.objects;
create policy "Admins can delete site media"
on storage.objects for delete
to authenticated
using (bucket_id = 'site-media' and public.is_admin());
