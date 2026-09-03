"use client";

import Script from "next/script";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";

type MusicPlayerProps = {
  html: string | null;
  url: string;
};

type SoundCloudWidget = {
  load: (url: string, options?: Record<string, string | boolean>) => void;
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
  hide_related: "true",
  show_comments: "false",
  show_user: "true",
  show_reposts: "false",
  show_teaser: "false",
  visual: "false",
  buying: "false",
  sharing: "false",
  download: "false"
};

function buildPlayerUrl(url: string, autoPlay = false) {
  const playerUrl = new URL("https://w.soundcloud.com/player/");
  playerUrl.search = new URLSearchParams({
    url,
    auto_play: autoPlay ? "true" : "false",
    ...playerOptions
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

      if (widget) {
        widget.load(nextUrl, { ...playerOptions, auto_play: true });
        return;
      }

      if (iframeRef.current) {
        iframeRef.current.src = buildPlayerUrl(nextUrl, true);
      }
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
