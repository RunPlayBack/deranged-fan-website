import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { MusicEntry } from "@/lib/types";

type OEmbedResponse = {
  title?: string;
  thumbnail_url?: string;
  html?: string;
};

export async function getSoundCloudOEmbed(url: string): Promise<OEmbedResponse | null> {
  try {
    const params = new URLSearchParams({
      url,
      format: "json",
      maxheight: "180",
      auto_play: "false",
      visual: "false"
    });
    const response = await fetch(`https://soundcloud.com/oembed?${params}`, {
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as OEmbedResponse;
  } catch {
    return null;
  }
}

export async function getMusicEntries(): Promise<MusicEntry[]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("music_overrides")
    .select("*")
    .eq("visible", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  const entries = await Promise.all(
    data.map(async (row) => {
      const embed = row.soundcloud_url ? await getSoundCloudOEmbed(row.soundcloud_url) : null;
      return {
        id: row.id,
        source_id: row.source_id,
        soundcloud_url: row.soundcloud_url,
        title: row.title_override || embed?.title || "Untitled SoundCloud release",
        artwork_url: row.artwork_override || embed?.thumbnail_url || null,
        player_html: embed?.html || null,
        release_date: null,
        sort_order: row.sort_order || 0,
        is_manual: row.is_manual
      } satisfies MusicEntry;
    })
  );

  return entries;
}
