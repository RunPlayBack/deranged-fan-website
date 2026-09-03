type MusicPlayerProps = {
  html: string | null;
  url: string;
};

export function MusicPlayer({ html, url }: MusicPlayerProps) {
  if (html) {
    return (
      <div
        className="[&_iframe]:w-full [&_iframe]:border-0"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex border border-white/22 px-5 py-3 text-xs uppercase tracking-[0.24em] text-white/82 transition-opacity hover:opacity-68"
    >
      Open on SoundCloud
    </a>
  );
}
