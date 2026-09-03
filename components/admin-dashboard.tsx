import {
  addMusicEntry,
  addVideoEntry,
  deleteVideoEntry,
  signOut,
  updateSettings,
  updateVideoEntry,
  uploadBackgroundMedia
} from "@/app/admin/actions";
import { MusicAdminList } from "@/components/music-admin-list";
import type { SiteSettings } from "@/lib/types";
import Link from "next/link";

type Row = Record<string, any>;

function TextInput({
  name,
  label,
  defaultValue,
  type = "text"
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  type?: string;
}) {
  return (
    <label className="block text-xs uppercase tracking-[0.18em] text-white/56">
      {label}
      <input
        name={name}
        type={type}
        defaultValue={defaultValue || ""}
        className="mt-2 w-full border border-white/12 bg-white/7 px-3 py-3 text-sm normal-case tracking-normal text-white"
      />
    </label>
  );
}

function SaveButton({ children = "Save" }: { children?: React.ReactNode }) {
  return (
    <button className="border border-white/24 px-4 py-3 text-xs uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-70">
      {children}
    </button>
  );
}

export function AdminDashboard({
  settings,
  music,
  videos,
  adminEmail,
  errorMessage
}: {
  settings: SiteSettings;
  music: Row[];
  videos: Row[];
  adminEmail: string;
  errorMessage?: string;
}) {
  return (
    <main className="min-h-screen bg-neutral-950 px-5 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col justify-between gap-5 border-b border-white/12 pb-8 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-white/42">{adminEmail}</p>
            <h1 className="serif-display mt-3 text-5xl uppercase tracking-[0.16em]">
              <Link href="/" className="transition-opacity hover:opacity-70">
                DERANGED FAN Admin
              </Link>
            </h1>
          </div>
          <form action={signOut}>
            <SaveButton>Sign out</SaveButton>
          </form>
        </header>

        {errorMessage ? (
          <div className="mt-6 border border-white/20 bg-white/8 px-5 py-4 text-sm leading-6 text-white/78">
            {errorMessage}
          </div>
        ) : null}

        <section className="grid gap-8 py-10 lg:grid-cols-[1.1fr_0.9fr]">
          <form action={updateSettings} className="border border-white/12 bg-black p-6">
            <h2 className="serif-display text-3xl uppercase tracking-[0.14em]">Site settings</h2>
            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <TextInput name="site_title" label="Site title" defaultValue={settings.site_title} />
              <TextInput
                name="homepage_quote"
                label="Homepage quote"
                defaultValue={settings.homepage_quote}
              />
              <TextInput
                name="soundcloud_profile_url"
                label="SoundCloud profile"
                defaultValue={settings.soundcloud_profile_url}
              />
              <TextInput
                name="youtube_channel_id"
                label="YouTube channel ID"
                defaultValue={settings.youtube_channel_id}
              />
              <TextInput name="spotify_url" label="Spotify URL" defaultValue={settings.spotify_url} />
              <TextInput
                name="soundcloud_url"
                label="SoundCloud social URL"
                defaultValue={settings.soundcloud_url}
              />
              <TextInput name="youtube_url" label="YouTube social URL" defaultValue={settings.youtube_url} />
              <TextInput
                name="background_video_url"
                label="Landscape background video URL"
                defaultValue={settings.background_video_url}
              />
              <TextInput
                name="background_mobile_video_url"
                label="Vertical mobile video URL"
                defaultValue={settings.background_mobile_video_url}
              />
              <TextInput
                name="background_poster_url"
                label="Poster image URL"
                defaultValue={settings.background_poster_url}
              />
            </div>
            <div className="mt-7">
              <SaveButton />
            </div>
          </form>

          <div className="space-y-8">
            <form action={uploadBackgroundMedia} className="border border-white/12 bg-black p-6">
              <h2 className="serif-display text-3xl uppercase tracking-[0.14em]">Background upload</h2>
              <div className="mt-7 grid gap-5">
                <label className="block text-xs uppercase tracking-[0.18em] text-white/56">
                  Type
                  <select
                    name="kind"
                    className="mt-2 w-full border border-white/12 bg-neutral-950 px-3 py-3 text-sm text-white"
                  >
                    <option value="video">Landscape desktop video</option>
                    <option value="mobile-video">Vertical mobile video</option>
                    <option value="poster">Poster image</option>
                  </select>
                </label>
                <input
                  name="file"
                  type="file"
                  accept="video/*,image/*"
                  className="w-full border border-white/12 bg-white/7 px-3 py-3 text-sm text-white"
                />
                <p className="text-sm leading-6 text-white/52">
                  This bucket allows up to 100 MB, but Supabase Free projects can still reject
                  files over 50 MB at the project level. Use a landscape MP4/WebM for desktop and
                  a vertical MP4/WebM for mobile. Smaller loops under 25 MB load much better.
                </p>
                <SaveButton>Upload</SaveButton>
              </div>
            </form>
          </div>
        </section>

        <section className="grid gap-8 pb-12 lg:grid-cols-2">
          <div className="border border-white/12 bg-black p-6">
            <h2 className="serif-display text-3xl uppercase tracking-[0.14em]">Music</h2>
            <form action={addMusicEntry} className="mt-7 grid gap-5">
              <TextInput name="soundcloud_url" label="SoundCloud URL" />
              <TextInput name="title_override" label="Title override" />
              <TextInput name="artwork_override" label="Artwork override URL" />
              <SaveButton>Add track</SaveButton>
            </form>
            <MusicAdminList music={music} />
          </div>

          <div className="border border-white/12 bg-black p-6">
            <h2 className="serif-display text-3xl uppercase tracking-[0.14em]">Video</h2>
            <form action={addVideoEntry} className="mt-7 grid gap-5">
              <TextInput name="youtube_url" label="YouTube URL" />
              <TextInput name="youtube_video_id" label="YouTube video ID" />
              <TextInput name="title_override" label="Title override" />
              <TextInput name="sort_order" label="Sort order" type="number" />
              <SaveButton>Add video</SaveButton>
            </form>
            <div className="mt-8 space-y-5">
              {videos.map((entry) => (
                <form key={entry.id} action={updateVideoEntry} className="border border-white/10 p-4">
                  <input type="hidden" name="id" value={entry.id} />
                  <div className="grid gap-4">
                    <TextInput name="youtube_url" label="YouTube URL" defaultValue={entry.youtube_url} />
                    <TextInput name="youtube_video_id" label="Video ID" defaultValue={entry.youtube_video_id} />
                    <TextInput name="title_override" label="Title" defaultValue={entry.title_override} />
                    <TextInput name="sort_order" label="Sort" type="number" defaultValue={String(entry.sort_order || 0)} />
                    <label className="flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-white/56">
                      <input name="visible" type="checkbox" defaultChecked={entry.visible} />
                      Visible
                    </label>
                    <div className="flex gap-3">
                      <SaveButton>Update</SaveButton>
                      <button
                        formAction={deleteVideoEntry}
                        className="border border-white/12 px-4 py-3 text-xs uppercase tracking-[0.2em] text-white/52 transition-opacity hover:opacity-70"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </form>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
