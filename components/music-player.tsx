type MusicPlayerProps = {
  html: string | null;
  url: string;
};

export function MusicPlayer({ url }: MusicPlayerProps) {
  const playerUrl = new URL("https://w.soundcloud.com/player/");
  playerUrl.search = new URLSearchParams({
    url,
    color: "#ff5500",
    auto_play: "false",
    hide_related: "true",
    show_comments: "false",
    show_user: "true",
    show_reposts: "false",
    show_teaser: "false",
    visual: "false",
    buying: "false",
    sharing: "false",
    download: "false"
  }).toString();

  return (
    <iframe
      title="SoundCloud player"
      src={playerUrl.toString()}
      className="h-[166px] w-full border-0"
      allow="autoplay"
    />
  );
}
