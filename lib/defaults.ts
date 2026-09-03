import type { SiteSettings } from "@/lib/types";

export const DEFAULT_SETTINGS: SiteSettings = {
  id: "00000000-0000-0000-0000-000000000001",
  site_title: "DERANGED FAN",
  homepage_quote: "Just the sound of quiet thoughts after midnight.",
  soundcloud_profile_url: null,
  youtube_channel_id: null,
  spotify_url: null,
  soundcloud_url: null,
  youtube_url: null,
  background_video_url: null,
  background_mobile_video_url:
    "https://ugfuairncdxyeiceotss.supabase.co/storage/v1/object/public/site-media/video/1788398731880-mobile-vertical.mp4",
  background_poster_url: null
};

export const SETTINGS_ID = DEFAULT_SETTINGS.id;
