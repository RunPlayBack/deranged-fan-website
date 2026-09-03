"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { SETTINGS_ID } from "@/lib/defaults";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseYouTubeVideoId } from "@/lib/youtube";

const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;
const SITE_MEDIA_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime"
];

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data } = await supabase.auth.getUser();
  const admins = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  if (!data.user?.email || !admins.includes(data.user.email.toLowerCase())) {
    throw new Error("Not authorized.");
  }

  return createSupabaseAdminClient() || supabase;
}

function value(formData: FormData, key: string) {
  const item = formData.get(key);
  return typeof item === "string" && item.trim() ? item.trim() : null;
}

function refreshAdmin(...paths: string[]) {
  paths.forEach((path) => revalidatePath(path));
  revalidatePath("/", "layout");
  redirect("/admin");
}

function adminError(message: string): never {
  redirect(`/admin?error=${encodeURIComponent(message)}`);
}

async function ensureSiteMediaBucket(supabase: Awaited<ReturnType<typeof requireAdmin>>) {
  const storage = supabase.storage as any;
  const bucketOptions = {
    public: true,
    fileSizeLimit: MAX_UPLOAD_BYTES,
    allowedMimeTypes: SITE_MEDIA_MIME_TYPES
  };

  const { data } = await storage.getBucket("site-media");

  if (data) {
    await storage.updateBucket("site-media", bucketOptions);
    return;
  }

  await storage.createBucket("site-media", bucketOptions);
}

export async function updateSettings(formData: FormData) {
  const supabase = await requireAdmin();

  const { error } = await supabase.from("site_settings").upsert({
    id: SETTINGS_ID,
    site_title: value(formData, "site_title") || "DERANGED FAN",
    homepage_quote:
      value(formData, "homepage_quote") || "Just the sound of quiet thoughts after midnight.",
    soundcloud_profile_url: value(formData, "soundcloud_profile_url"),
    youtube_channel_id: value(formData, "youtube_channel_id"),
    spotify_url: value(formData, "spotify_url"),
    soundcloud_url: value(formData, "soundcloud_url"),
    youtube_url: value(formData, "youtube_url"),
    background_video_url: value(formData, "background_video_url"),
    background_poster_url: value(formData, "background_poster_url"),
    updated_at: new Date().toISOString()
  });

  if (error) {
    throw error;
  }

  refreshAdmin("/admin");
}

export async function uploadBackgroundMedia(formData: FormData) {
  const supabase = await requireAdmin();
  const kind = value(formData, "kind");
  const file = formData.get("file");

  if (!(file instanceof File) || !file.size || !kind) {
    return;
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    adminError("That file is too large. Please use a video or image under 100 MB.");
  }

  const isVideo = kind === "video" && file.type.startsWith("video/");
  const isPoster = kind === "poster" && file.type.startsWith("image/");

  if (!isVideo && !isPoster) {
    adminError("Unsupported file type. Please upload a video for Video or an image for Poster image.");
  }

  await ensureSiteMediaBucket(supabase);

  const extension = file.name.split(".").pop() || (isVideo ? "mp4" : "jpg");
  const path = `${kind}/${Date.now()}.${extension}`;
  const { error } = await supabase.storage.from("site-media").upload(path, file, {
    cacheControl: "31536000",
    upsert: true,
    contentType: file.type
  });

  if (error) {
    const sizeInMb = Math.round((file.size / 1024 / 1024) * 10) / 10;
    const storageError = error as typeof error & { code?: string };
    const message =
      storageError.statusCode === "413" || storageError.code === "EntityTooLarge"
        ? `Supabase rejected this ${sizeInMb} MB file. If this project is on Supabase Free, Storage has a global 50 MB upload limit even when the site-media bucket shows 100 MB. Compress the background loop below 50 MB or move the Supabase project to Pro, then try again.`
        : error.message || "Upload failed. Please try a smaller optimized file.";
    adminError(message);
  }

  const { data } = supabase.storage.from("site-media").getPublicUrl(path);
  const { error: settingsError } = await supabase.from("site_settings").upsert({
    id: SETTINGS_ID,
    [isVideo ? "background_video_url" : "background_poster_url"]: data.publicUrl,
    updated_at: new Date().toISOString()
  });

  if (settingsError) {
    adminError(settingsError.message || "Upload saved, but the site settings could not be updated.");
  }

  refreshAdmin("/admin");
}

export async function addMusicEntry(formData: FormData) {
  const supabase = await requireAdmin();

  const { error } = await supabase.from("music_overrides").insert({
    soundcloud_url: value(formData, "soundcloud_url"),
    title_override: value(formData, "title_override"),
    artwork_override: value(formData, "artwork_override"),
    sort_order: Number(value(formData, "sort_order") || 0),
    visible: true,
    is_manual: true
  });

  if (error) {
    throw error;
  }

  refreshAdmin("/admin", "/music");
}

export async function updateMusicEntry(formData: FormData) {
  const supabase = await requireAdmin();
  const id = value(formData, "id");
  if (!id) {
    return;
  }

  const { error } = await supabase
    .from("music_overrides")
    .update({
      soundcloud_url: value(formData, "soundcloud_url"),
      title_override: value(formData, "title_override"),
      artwork_override: value(formData, "artwork_override"),
      sort_order: Number(value(formData, "sort_order") || 0),
      visible: formData.get("visible") === "on",
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) {
    throw error;
  }

  refreshAdmin("/admin", "/music");
}

export async function deleteMusicEntry(formData: FormData) {
  const supabase = await requireAdmin();
  const id = value(formData, "id");
  if (id) {
    const { error } = await supabase.from("music_overrides").delete().eq("id", id);
    if (error) {
      throw error;
    }
    refreshAdmin("/admin", "/music");
  }
}

export async function addVideoEntry(formData: FormData) {
  const supabase = await requireAdmin();
  const youtubeUrl = value(formData, "youtube_url") || "";
  const youtubeVideoId = value(formData, "youtube_video_id") || parseYouTubeVideoId(youtubeUrl);

  const { error } = await supabase.from("video_overrides").insert({
    youtube_video_id: youtubeVideoId,
    youtube_url: youtubeUrl || (youtubeVideoId ? `https://www.youtube.com/watch?v=${youtubeVideoId}` : null),
    title_override: value(formData, "title_override"),
    sort_order: Number(value(formData, "sort_order") || 0),
    visible: true,
    is_manual: true
  });

  if (error) {
    throw error;
  }

  refreshAdmin("/admin", "/video");
}

export async function updateVideoEntry(formData: FormData) {
  const supabase = await requireAdmin();
  const id = value(formData, "id");
  const youtubeUrl = value(formData, "youtube_url") || "";
  if (!id) {
    return;
  }

  const { error } = await supabase
    .from("video_overrides")
    .update({
      youtube_video_id: value(formData, "youtube_video_id") || parseYouTubeVideoId(youtubeUrl),
      youtube_url: youtubeUrl,
      title_override: value(formData, "title_override"),
      sort_order: Number(value(formData, "sort_order") || 0),
      visible: formData.get("visible") === "on",
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) {
    throw error;
  }

  refreshAdmin("/admin", "/video");
}

export async function deleteVideoEntry(formData: FormData) {
  const supabase = await requireAdmin();
  const id = value(formData, "id");
  if (id) {
    const { error } = await supabase.from("video_overrides").delete().eq("id", id);
    if (error) {
      throw error;
    }
    refreshAdmin("/admin", "/video");
  }
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect("/admin");
}
