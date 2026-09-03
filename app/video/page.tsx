import { VideoGallery } from "@/components/video-gallery";
import { getSiteSettings } from "@/lib/site-settings";
import { getVideoEntries } from "@/lib/youtube";

export default async function VideoPage() {
  const settings = await getSiteSettings();
  const videos = await getVideoEntries(settings);

  return (
    <main className="flex min-h-screen items-center justify-center px-5 pb-28 pt-64 sm:pt-80">
      <section className="w-full max-w-4xl text-center">
        <h1 className="sr-only">Video</h1>
        {videos.length ? (
          <VideoGallery videos={videos} />
        ) : (
          <div className="mx-auto max-w-md border border-white/14 bg-black/42 px-7 py-10 text-sm leading-7 text-white/66 backdrop-blur-sm">
            Add a YouTube channel ID or manual video URL in the hidden admin area when visuals are ready.
          </div>
        )}
      </section>
    </main>
  );
}
