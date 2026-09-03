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

function normalizeSettingsError(message: string) {
  if (message.includes("background_mobile_video_url")) {
    return "The mobile video setting needs one quick Supabase update before it can save. Run the SQL in supabase/migrations/002_mobile_background_video.sql, then try again.";
  }

  return message;
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
    background_mobile_video_url: value(formData, "background_mobile_video_url"),
    background_poster_url: value(formData, "background_poster_url"),
    updated_at: new Date().toISOString()
  });

  if (error) {
    adminError(normalizeSettingsError(error.message));
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

  const isLandscapeVideo = kind === "video" && file.type.startsWith("video/");
  const isMobileVideo = kind === "mobile-video" && file.type.startsWith("video/");
  const isPoster = kind === "poster" && file.type.startsWith("image/");

  if (!isLandscapeVideo && !isMobileVideo && !isPoster) {
    adminError(
      "Unsupported file type. Please upload an MP4/WebM/MOV for video options or an image for Poster image."
    );
  }

  await ensureSiteMediaBucket(supabase);

  const extension = file.name.split(".").pop() || (isPoster ? "jpg" : "mp4");
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
  const settingsColumn = isLandscapeVideo
    ? "background_video_url"
    : isMobileVideo
      ? "background_mobile_video_url"
      : "background_poster_url";
  const { error: settingsError } = await supabase.from("site_settings").upsert({
    id: SETTINGS_ID,
    [settingsColumn]: data.publicUrl,
    updated_at: new Date().toISOString()
  });

  if (settingsError) {
    adminError(
      normalizeSettingsError(
        settingsError.message || "Upload saved, but the site settings could not be updated."
      )
    );
  }

  refreshAdmin("/admin");
}

export async function createBackgroundUploadTarget({
  kind,
  fileName,
  fileType,
  fileSize
}: {
  kind: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}) {
  const supabase = await requireAdmin();

  if (fileSize > MAX_UPLOAD_BYTES) {
    throw new Error("That file is too large. Please use a video or image under 100 MB.");
  }

  const isLandscapeVideo = kind === "video" && fileType.startsWith("video/");
  const isMobileVideo = kind === "mobile-video" && fileType.startsWith("video/");
  const isPoster = kind === "poster" && fileType.startsWith("image/");

  if (!isLandscapeVideo && !isMobileVideo && !isPoster) {
    throw new Error(
      "Unsupported file type. Please upload an MP4/WebM/MOV for video options or an image for Poster image."
    );
  }

  await ensureSiteMediaBucket(supabase);

  const extension = fileName.split(".").pop() || (isPoster ? "jpg" : "mp4");
  const path = `${kind}/${Date.now()}.${extension}`;
  const { data, error } = await supabase.storage.from("site-media").createSignedUploadUrl(path);

  if (error) {
    throw new Error(error.message || "Could not prepare the upload.");
  }

  return {
    kind,
    path,
    token: data.token,
    publicUrl: supabase.storage.from("site-media").getPublicUrl(path).data.publicUrl
  };
}

export async function saveBackgroundMediaUrl({
  kind,
  publicUrl
}: {
  kind: string;
  publicUrl: string;
}) {
  const supabase = await requireAdmin();
  const settingsColumn =
    kind === "video"
      ? "background_video_url"
      : kind === "mobile-video"
        ? "background_mobile_video_url"
        : "background_poster_url";

  const { error } = await supabase.from("site_settings").upsert({
    id: SETTINGS_ID,
    [settingsColumn]: publicUrl,
    updated_at: new Date().toISOString()
  });

  if (error) {
    throw new Error(normalizeSettingsError(error.message));
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin");
}

export async function addMusicEntry(formData: FormData) {
  const supabase = await requireAdmin();
  const { count } = await supabase
    .from("music_overrides")
    .select("*", { count: "exact", head: true });

  const { error } = await supabase.from("music_overrides").insert({
    soundcloud_url: value(formData, "soundcloud_url"),
    title_override: value(formData, "title_override"),
    artwork_override: value(formData, "artwork_override"),
    sort_order: count || 0,
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
      visible: formData.get("visible") === "on",
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) {
    throw error;
  }

  refreshAdmin("/admin", "/music");
}

export async function updateMusicOrder(formData: FormData) {
  const supabase = await requireAdmin();
  const rawIds = value(formData, "ids");

  if (!rawIds) {
    return;
  }

  let ids: string[];

  try {
    ids = JSON.parse(rawIds);
  } catch {
    adminError("The music order could not be saved. Please refresh and try again.");
  }

  const updates = ids.map((id, index) =>
    supabase
      .from("music_overrides")
      .update({
        sort_order: index,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
  );

  const results = await Promise.all(updates);
  const error = results.find((result) => result.error)?.error;

  if (error) {
    adminError(error.message || "The music order could not be saved.");
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
