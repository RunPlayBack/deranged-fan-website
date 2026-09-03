alter table public.site_settings
add column if not exists background_overlay_opacity numeric not null default 0.48;
