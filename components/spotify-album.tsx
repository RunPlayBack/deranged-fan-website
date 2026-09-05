import Image from "next/image";

const SPOTIFY_ALBUM_URL = "https://open.spotify.com/album/0zZPAmPzBFHj3NXivYvAnY";
const SPOTIFY_EMBED_URL = "https://open.spotify.com/embed/album/0zZPAmPzBFHj3NXivYvAnY";

export function SpotifyAlbum() {
  return (
    <section className="mx-auto mt-12 w-full max-w-xl border border-white/14 bg-black/44 p-4 text-center backdrop-blur-sm sm:p-5">
      <div className="mx-auto flex max-w-[420px] flex-col items-center gap-5">
        <a
          href={SPOTIFY_ALBUM_URL}
          target="_blank"
          rel="noreferrer"
          aria-label="Open Almost Somewhere by Deranged Fan on Spotify"
          className="relative block aspect-square w-full max-w-[220px] overflow-hidden bg-neutral-950"
        >
          <Image
            src="/almost-somewhere.jpg"
            alt="Almost Somewhere album artwork"
            fill
            sizes="220px"
            className="object-cover"
          />
        </a>
        <div className="min-w-0">
          <p className="text-[0.68rem] uppercase tracking-[0.24em] text-white/48">Spotify album</p>
          <h2 className="mt-2 text-base uppercase tracking-[0.2em] text-white/88">
            Almost Somewhere
          </h2>
          <a
            href={SPOTIFY_ALBUM_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center border border-white/16 px-4 py-2 text-[0.7rem] uppercase tracking-[0.22em] text-white/76 transition hover:bg-white hover:text-black"
          >
            Listen on Spotify
          </a>
        </div>
      </div>
      <iframe
        title="Almost Somewhere by Deranged Fan on Spotify"
        src={SPOTIFY_EMBED_URL}
        className="mt-5 h-[152px] w-full border-0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      />
    </section>
  );
}
