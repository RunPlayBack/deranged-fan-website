"use client";

import { useEffect, useRef, useState } from "react";

type BackgroundVideoProps = {
  videoUrl?: string | null;
  mobileVideoUrl?: string | null;
  posterUrl?: string | null;
};

const FALLBACK_MOBILE_VIDEO_URL =
  "https://ugfuairncdxyeiceotss.supabase.co/storage/v1/object/public/site-media/video/1788398731880-mobile-vertical.mp4";

export function BackgroundVideo({ videoUrl, mobileVideoUrl, posterUrl }: BackgroundVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [needsGesture, setNeedsGesture] = useState(false);
  const effectiveMobileVideoUrl = mobileVideoUrl || FALLBACK_MOBILE_VIDEO_URL || videoUrl;

  useEffect(() => {
    const videos = Array.from(
      containerRef.current?.querySelectorAll<HTMLVideoElement>("video") || []
    );
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!videos.length || reducedMotion) {
      return;
    }

    let cancelled = false;

    const tryPlay = async () => {
      if (cancelled || document.visibilityState === "hidden") {
        return;
      }

      const attempts = videos.map(async (video) => {
        video.muted = true;
        video.defaultMuted = true;
        video.playsInline = true;
        video.setAttribute("muted", "");
        video.setAttribute("playsinline", "");
        video.setAttribute("webkit-playsinline", "");
        video.setAttribute("x-webkit-airplay", "deny");

        try {
          await video.play();
          return true;
        } catch {
          return false;
        }
      });

      const results = await Promise.all(attempts);
      setNeedsGesture(!results.some(Boolean));
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void tryPlay();
      }
    };

    videos.forEach((video) => video.load());
    void tryPlay();

    videos.forEach((video) => {
      video.addEventListener("loadedmetadata", tryPlay);
      video.addEventListener("canplay", tryPlay);
    });
    window.addEventListener("pageshow", tryPlay);
    document.addEventListener("visibilitychange", handleVisibility);
    const unlockPlayback = () => {
      void tryPlay();
    };

    document.addEventListener("touchstart", unlockPlayback, { once: true, passive: true });
    document.addEventListener("pointerdown", unlockPlayback, { once: true, passive: true });

    return () => {
      cancelled = true;
      videos.forEach((video) => {
        video.removeEventListener("loadedmetadata", tryPlay);
        video.removeEventListener("canplay", tryPlay);
      });
      window.removeEventListener("pageshow", tryPlay);
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("touchstart", unlockPlayback);
      document.removeEventListener("pointerdown", unlockPlayback);
    };
  }, [videoUrl, effectiveMobileVideoUrl]);

  return (
    <div ref={containerRef} className="fixed inset-0 z-0 overflow-hidden bg-black" aria-hidden="true">
      <div
        className="background-still absolute inset-0 bg-cover bg-center"
        style={posterUrl ? { backgroundImage: `url(${posterUrl})` } : undefined}
      />
      {videoUrl ? (
        <video
          className="background-video-media background-video-desktop"
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
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      ) : null}
      {effectiveMobileVideoUrl ? (
        <video
          className="background-video-media background-video-mobile"
          poster={posterUrl || undefined}
          autoPlay
          loop
          muted
          playsInline
          disablePictureInPicture
          disableRemotePlayback
          preload="metadata"
          {...({ "webkit-playsinline": "true", "x-webkit-airplay": "deny" } as Record<
            string,
            string
          >)}
        >
          <source src={effectiveMobileVideoUrl} type="video/mp4" />
        </video>
      ) : null}
      {(videoUrl || effectiveMobileVideoUrl) && needsGesture ? (
        <button
          type="button"
          aria-label="Play background video"
          onClick={() => {
            const videos = Array.from(
              containerRef.current?.querySelectorAll<HTMLVideoElement>("video") || []
            );
            void Promise.all(videos.map((video) => video.play().catch(() => null))).then(() =>
              setNeedsGesture(false)
            );
          }}
          className="absolute inset-0 z-20 cursor-default bg-transparent"
        />
      ) : null}
      <div className="absolute inset-0 bg-black/58" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.28)_62%,rgba(0,0,0,0.72)_100%)]" />
    </div>
  );
}
