"use client";

import Image from "next/image";
import { useState } from "react";
import { Play } from "lucide-react";
import type { VideoEntry } from "@/lib/types";

export function VideoGallery({ videos }: { videos: VideoEntry[] }) {
  const [activeId, setActiveId] = useState(videos[0]?.youtube_video_id);
  const active = videos.find((video) => video.youtube_video_id === activeId) || videos[0];
  const [playing, setPlaying] = useState(false);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="relative aspect-video overflow-hidden border border-white/14 bg-black/54">
        {playing ? (
          <iframe
            className="h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${active.youtube_video_id}?autoplay=1&rel=0`}
            title={active.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group absolute inset-0"
            aria-label={`Play ${active.title}`}
          >
            <Image
              src={active.thumbnail_url}
              alt={`${active.title} thumbnail`}
              fill
              sizes="(max-width: 768px) 92vw, 768px"
              className="object-cover opacity-88 transition-opacity group-hover:opacity-70"
              priority
            />
            <span className="absolute inset-0 bg-black/24" />
            <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-black/34 text-white backdrop-blur-sm">
              <Play className="ml-1 h-7 w-7" fill="currentColor" aria-hidden="true" />
            </span>
          </button>
        )}
      </div>
      <h2 className="mt-6 text-sm uppercase tracking-[0.24em] text-white/82">{active.title}</h2>
      {videos.length > 1 ? (
        <div className="media-scroll mt-7 flex gap-4 overflow-x-auto pb-3">
          {videos.map((video) => (
            <button
              type="button"
              key={video.id}
              onClick={() => {
                setActiveId(video.youtube_video_id);
                setPlaying(false);
              }}
              className={`min-w-44 border p-2 text-left transition-opacity hover:opacity-72 ${
                video.youtube_video_id === active.youtube_video_id
                  ? "border-white/52 bg-white/10"
                  : "border-white/12 bg-black/38"
              }`}
            >
              <span className="relative block aspect-video w-full bg-neutral-950">
                <Image
                  src={video.thumbnail_url}
                  alt={`${video.title} thumbnail`}
                  fill
                  sizes="176px"
                  className="object-cover"
                />
              </span>
              <span className="mt-3 block text-xs uppercase tracking-[0.16em] text-white/78">
                {video.title}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
