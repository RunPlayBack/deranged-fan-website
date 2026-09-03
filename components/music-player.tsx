"use client";

import Script from "next/script";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";

type MusicPlayerProps = {
  html: string | null;
  url: string;
};

type SoundCloudWidget = {
  bind: (eventName: string, listener: () => void) => void;
  load: (url: string, options?: Record<string, string | boolean>) => void;
  play: () => void;
};

declare global {
  interface Window {
    SC?: {
      Widget: (iframe: HTMLIFrameElement) => SoundCloudWidget;
    };
  }
}

export type MusicPlayerHandle = {
  loadAndPlay: (url: string) => void;
};

const playerOptions = {
  color: "#ff5500",
  hide_related: true,
  show_comments: false,
  show_user: true,
  show_reposts: false,
  show_teaser: false,
  visual: false,
  buying: false,
  sharing: false,
  download: false
};

function shouldAutoplaySelectedTrack() {
  return window.matchMedia("(min-width: 768px)").matches;
}

function buildPlayerUrl(url: string) {
  const playerUrl = new URL("https://w.soundcloud.com/player/");
  playerUrl.search = new URLSearchParams({
    url,
    auto_play: "false",
    color: playerOptions.color,
    hide_related: String(playerOptions.hide_related),
    show_comments: String(playerOptions.show_comments),
    show_user: String(playerOptions.show_user),
    show_reposts: String(playerOptions.show_reposts),
    show_teaser: String(playerOptions.show_teaser),
    visual: String(playerOptions.visual),
    buying: String(playerOptions.buying),
    sharing: String(playerOptions.sharing),
    download: String(playerOptions.download)
  }).toString();

  return playerUrl.toString();
}

export const MusicPlayer = forwardRef<MusicPlayerHandle, MusicPlayerProps>(function MusicPlayer(
  { url },
  ref
) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const widgetRef = useRef<SoundCloudWidget | null>(null);
  const [playerSrc] = useState(() => buildPlayerUrl(url));

  function getWidget() {
    if (widgetRef.current) {
      return widgetRef.current;
    }

    if (!iframeRef.current || !window.SC?.Widget) {
      return null;
    }

    widgetRef.current = window.SC.Widget(iframeRef.current);
    return widgetRef.current;
  }

  useImperativeHandle(ref, () => ({
    loadAndPlay(nextUrl: string) {
      const widget = getWidget();

      if (!widget) {
        return;
      }

      const autoPlay = shouldAutoplaySelectedTrack();

      if (autoPlay) {
        widget.bind("ready", () => {
          widget.play();
        });
      }

      widget.load(nextUrl, { ...playerOptions, auto_play: autoPlay });
    }
  }));

  return (
    <>
      <Script
        src="https://w.soundcloud.com/player/api.js"
        strategy="afterInteractive"
        onLoad={getWidget}
      />
      <iframe
        ref={iframeRef}
        title="SoundCloud player"
        src={playerSrc}
        className="h-[166px] w-full border-0"
        allow="autoplay"
      />
    </>
  );
});
