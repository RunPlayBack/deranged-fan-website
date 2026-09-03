"use client";

import { useEffect, useRef, useState } from "react";

type BackgroundVideoProps = {
  videoUrl?: string | null;
  posterUrl?: string | null;
};

export function BackgroundVideo({ videoUrl, posterUrl }: BackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [needsGesture, setNeedsGesture] = useState(false);

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

    let cancelled = false;

    const tryPlay = async () => {
      if (cancelled || document.visibilityState === "hidden") {
        return;
      }

      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.setAttribute("muted", "");
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      video.setAttribute("x-webkit-airplay", "deny");

      try {
        await video.play();
        setNeedsGesture(false);
      } catch {
        setNeedsGesture(true);
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void tryPlay();
      }
    };

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.setAttribute("x-webkit-airplay", "deny");

    video.load();
    void tryPlay();

    video.addEventListener("loadedmetadata", tryPlay);
    video.addEventListener("canplay", tryPlay);
    window.addEventListener("pageshow", tryPlay);
    document.addEventListener("visibilitychange", handleVisibility);
    const unlockPlayback = () => {
      void tryPlay();
    };

    document.addEventListener("touchstart", unlockPlayback, { once: true, passive: true });
    document.addEventListener("pointerdown", unlockPlayback, { once: true, passive: true });

    return () => {
      cancelled = true;
      video.removeEventListener("loadedmetadata", tryPlay);
      video.removeEventListener("canplay", tryPlay);
      window.removeEventListener("pageshow", tryPlay);
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("touchstart", unlockPlayback);
      document.removeEventListener("pointerdown", unlockPlayback);
    };
  }, [reducedMotion, videoUrl]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-black" aria-hidden="true">
      <div
        className="background-still absolute inset-0 bg-cover bg-center"
        style={posterUrl ? { backgroundImage: `url(${posterUrl})` } : undefined}
      />
      {videoUrl && !reducedMotion ? (
        <video
          key={videoUrl}
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover [transform:translateZ(0)]"
          src={videoUrl}
          poster={posterUrl || undefined}
          autoPlay
          loop
          muted
          playsInline
          disablePictureInPicture
          disableRemotePlayback
          preload="auto"
          {...({ "webkit-playsinline": "true", "x-webkit-airplay": "deny" } as Record<
            string,
            string
          >)}
        />
      ) : null}
      {videoUrl && needsGesture && !reducedMotion ? (
        <button
          type="button"
          aria-label="Play background video"
          onClick={() => {
            void videoRef.current?.play().then(() => setNeedsGesture(false));
          }}
          className="absolute inset-0 z-20 cursor-default bg-transparent"
        />
      ) : null}
      <div className="absolute inset-0 bg-black/58" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.28)_62%,rgba(0,0,0,0.72)_100%)]" />
    </div>
  );
}
