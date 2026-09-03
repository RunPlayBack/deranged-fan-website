import Image from "next/image";
import { MusicPlayer } from "@/components/music-player";
import { getMusicEntries } from "@/lib/soundcloud";

export default async function MusicPage() {
  const entries = await getMusicEntries();
  const featured = entries[0];

  return (
    <main className="flex min-h-screen items-center justify-center px-5 pb-28 pt-64 sm:pt-80">
      <section className="w-full max-w-3xl text-center">
        <h1 className="sr-only">Music</h1>
        {featured ? (
          <div className="mx-auto max-w-xl">
            <div className="relative mx-auto aspect-square w-full max-w-[420px] overflow-hidden border border-white/14 bg-black/45">
              {featured.artwork_url ? (
                <Image
                  src={featured.artwork_url}
                  alt={`${featured.title} artwork`}
                  fill
                  sizes="(max-width: 640px) 88vw, 420px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-neutral-950 text-xs uppercase tracking-[0.35em] text-white/34">
                  DERANGED FAN
                </div>
              )}
            </div>
            <h2 className="mt-6 text-base uppercase tracking-[0.28em] text-white/86">
              {featured.title}
            </h2>
            <div className="mt-5">
              <MusicPlayer html={featured.player_html} url={featured.soundcloud_url} />
            </div>
            {entries.length > 1 ? (
              <div className="media-scroll mt-8 flex gap-4 overflow-x-auto pb-3">
                {entries.slice(1).map((entry) => (
                  <a
                    key={entry.id}
                    href={entry.soundcloud_url}
                    target="_blank"
                    rel="noreferrer"
                    className="min-w-44 border border-white/12 bg-black/38 p-3 text-left transition-opacity hover:opacity-72"
                  >
                    <div className="relative aspect-square w-full bg-neutral-950">
                      {entry.artwork_url ? (
                        <Image
                          src={entry.artwork_url}
                          alt={`${entry.title} artwork`}
                          fill
                          sizes="176px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <p className="mt-3 text-xs uppercase tracking-[0.18em] text-white/78">
                      {entry.title}
                    </p>
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="mx-auto max-w-md border border-white/14 bg-black/42 px-7 py-10 text-sm leading-7 text-white/66 backdrop-blur-sm">
            Add a SoundCloud URL in the hidden admin area when the first release is ready.
          </div>
        )}
      </section>
    </main>
  );
}
