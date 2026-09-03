import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { MusicEntry } from "@/lib/types";

type OEmbedResponse = {
  title?: string;
  thumbnail_url?: string;
  html?: string;
};

export type SoundCloudFeedTrack = {
  sourceId: string;
  title: string;
  url: string;
  artworkUrl: string | null;
  publishedAt: string | null;
};

const DEFAULT_SOUNDCLOUD_PROFILE_URL = "https://soundcloud.com/derangedfan";

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function tagText(xml: string, tagName: string) {
  const match = xml.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"));
  return match ? decodeXml(match[1]) : null;
}

function extractUserIdFromOEmbed(html?: string) {
  if (!html) {
    return null;
  }

  const rawMatch = html.match(/api(?:%2E|\.)soundcloud(?:%2E|\.)com(?:%2F|\/)users(?:%2F|\/)(\d+)/i);
  if (rawMatch) {
    return rawMatch[1];
  }

  try {
    return decodeURIComponent(html).match(/api\.soundcloud\.com\/users\/(\d+)/)?.[1] || null;
  } catch {
    return null;
  }
}

function extractNextFeedUrl(xml: string) {
  const match = xml.match(/<atom:link\s+[^>]*href="([^"]+)"[^>]*rel="next"[^>]*>/i);
  return match ? decodeXml(match[1]) : null;
}

function parseSoundCloudFeed(xml: string) {
  const tracks: SoundCloudFeedTrack[] = [];
  const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/gi);

  for (const match of itemMatches) {
    const item = match[1];
    const guid = tagText(item, "guid");
    const title = tagText(item, "title");
    const link = tagText(item, "link");

    if (!guid || !title || !link) {
      continue;
    }

    const artworkUrl =
      decodeXml(item.match(/<itunes:image\s+[^>]*href="([^"]+)"/i)?.[1] || "") || null;
    const pubDate = tagText(item, "pubDate");
    const publishedDate = pubDate ? new Date(pubDate) : null;
    const publishedAt =
      publishedDate && Number.isFinite(publishedDate.getTime()) ? publishedDate.toISOString() : null;

    tracks.push({
      sourceId: guid,
      title,
      url: link,
      artworkUrl,
      publishedAt
    });
  }

  return tracks;
}

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

export async function getSoundCloudProfileTracks(profileUrl = DEFAULT_SOUNDCLOUD_PROFILE_URL) {
  const profile = profileUrl.trim() || DEFAULT_SOUNDCLOUD_PROFILE_URL;
  const profileEmbed = await getSoundCloudOEmbed(profile);
  const userId = extractUserIdFromOEmbed(profileEmbed?.html);

  if (!userId) {
    throw new Error("Could not read that SoundCloud profile. Check the profile URL and try again.");
  }

  const tracks: SoundCloudFeedTrack[] = [];
  let feedUrl: string | null = `https://feeds.soundcloud.com/users/soundcloud:users:${userId}/sounds.rss`;

  for (let page = 0; feedUrl && page < 5; page += 1) {
    const response = await fetch(feedUrl, { cache: "no-store" });

    if (!response.ok) {
      throw new Error("SoundCloud did not return the track feed. Please try again shortly.");
    }

    const xml = await response.text();
    tracks.push(...parseSoundCloudFeed(xml));
    feedUrl = extractNextFeedUrl(xml);
  }

  return tracks;
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
