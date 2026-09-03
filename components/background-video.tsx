"use client";

import { useEffect, useRef, useState } from "react";

type BackgroundVideoProps = {
  videoUrl?: string | null;
  posterUrl?: string | null;
};

function getVideoType(url: string) {
  const cleanUrl = url.split("?")[0].toLowerCase();

  if (cleanUrl.endsWith(".webm")) {
    return "video/webm";
  }

  if (cleanUrl.endsWith(".mov") || cleanUrl.endsWith(".qt")) {
    return "video/quicktime";
  }

  return "video/mp4";
}

export function BackgroundVideo({ videoUrl, posterUrl }: BackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !videoUrl || reducedMotion) {
      return;
    }

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.play().catch(() => {
      // Mobile browsers can still block autoplay in low power or data saver modes.
    });
  }, [reducedMotion, videoUrl]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-black" aria-hidden="true">
      <div
        className="background-still absolute inset-0 bg-cover bg-center"
        style={posterUrl ? { backgroundImage: `url(${posterUrl})` } : undefined}
      />
      {videoUrl && !reducedMotion ? (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          poster={posterUrl || undefined}
          autoPlay
          loop
          muted
          playsInline
          disablePictureInPicture
          preload="metadata"
        >
          <source src={videoUrl} type={getVideoType(videoUrl)} />
        </video>
      ) : null}
      <div className="absolute inset-0 bg-black/58" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.28)_62%,rgba(0,0,0,0.72)_100%)]" />
    </div>
  );
}
