import { MusicShowcase } from "@/components/music-showcase";
import { getMusicEntries } from "@/lib/soundcloud";

export default async function MusicPage() {
  const entries = await getMusicEntries();

  return (
    <main className="flex min-h-screen items-center justify-center px-5 pb-28 pt-64 sm:pt-80">
      <section className="w-full max-w-3xl text-center">
        <h1 className="sr-only">Music</h1>
        {entries.length ? (
          <MusicShowcase entries={entries} />
        ) : (
          <div className="mx-auto max-w-md border border-white/14 bg-black/42 px-7 py-10 text-sm leading-7 text-white/66 backdrop-blur-sm">
            Add a SoundCloud URL in the hidden admin area when the first release is ready.
          </div>
        )}
      </section>
    </main>
  );
}
