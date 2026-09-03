import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SiteSettings, VideoEntry } from "@/lib/types";

function videoUrl(id: string) {
  return `https://www.youtube.com/watch?v=${id}`;
}

export function parseYouTubeVideoId(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace("/", "");
    }
    return parsed.searchParams.get("v");
  } catch {
    return null;
  }
}

async function getManualVideos(): Promise<VideoEntry[]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("video_overrides")
    .select("*")
    .eq("visible", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data
    .map((row) => {
      const id = row.youtube_video_id || parseYouTubeVideoId(row.youtube_url || "");
      if (!id) {
        return null;
      }

      return {
        id: row.id,
        youtube_video_id: id,
        youtube_url: row.youtube_url || videoUrl(id),
        title: row.title_override || "Untitled video",
        thumbnail_url: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        published_at: null,
        sort_order: row.sort_order || 0,
        is_manual: row.is_manual
      } satisfies VideoEntry;
    })
    .filter(Boolean) as VideoEntry[];
}

async function getChannelVideos(settings: SiteSettings): Promise<VideoEntry[]> {
  const key = process.env.YOUTUBE_API_KEY;

  if (!key || !settings.youtube_channel_id) {
    return [];
  }

  try {
    const params = new URLSearchParams({
      key,
      channelId: settings.youtube_channel_id,
      part: "snippet",
      order: "date",
      maxResults: "12",
      type: "video"
    });
    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`, {
      next: { revalidate: 1800 }
    });

    if (!response.ok) {
      return [];
    }

    const payload = await response.json();
    return (payload.items || []).map((item: any, index: number) => ({
      id: item.id.videoId,
      youtube_video_id: item.id.videoId,
      youtube_url: videoUrl(item.id.videoId),
      title: item.snippet.title,
      thumbnail_url:
        item.snippet.thumbnails?.high?.url ||
        item.snippet.thumbnails?.medium?.url ||
        `https://i.ytimg.com/vi/${item.id.videoId}/hqdefault.jpg`,
      published_at: item.snippet.publishedAt || null,
      sort_order: index,
      is_manual: false
    }));
  } catch {
    return [];
  }
}

export async function getVideoEntries(settings: SiteSettings): Promise<VideoEntry[]> {
  const [automaticVideos, manualVideos] = await Promise.all([
    getChannelVideos(settings),
    getManualVideos()
  ]);

  const manualIds = new Set(manualVideos.map((video) => video.youtube_video_id));
  return [
    ...manualVideos,
    ...automaticVideos.filter((video) => !manualIds.has(video.youtube_video_id))
  ];
}
