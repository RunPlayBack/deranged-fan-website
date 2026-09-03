export type SiteSettings = {
  id: string;
  site_title: string;
  homepage_quote: string;
  soundcloud_profile_url: string | null;
  youtube_channel_id: string | null;
  spotify_url: string | null;
  soundcloud_url: string | null;
  youtube_url: string | null;
  background_video_url: string | null;
  background_mobile_video_url: string | null;
  background_poster_url: string | null;
  background_overlay_opacity: number;
};

export type MusicEntry = {
  id: string;
  source_id: string | null;
  soundcloud_url: string;
  title: string;
  artwork_url: string | null;
  player_html: string | null;
  release_date: string | null;
  sort_order: number;
  is_manual: boolean;
};

export type VideoEntry = {
  id: string;
  youtube_video_id: string;
  youtube_url: string;
  title: string;
  thumbnail_url: string;
  published_at: string | null;
  sort_order: number;
  is_manual: boolean;
};
