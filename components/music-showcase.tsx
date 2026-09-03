"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { MusicPlayer } from "@/components/music-player";
import type { MusicEntry } from "@/lib/types";

export function MusicShowcase({ entries }: { entries: MusicEntry[] }) {
  const [activeId, setActiveId] = useState(entries[0]?.id);
  const [shouldAutoplay, setShouldAutoplay] = useState(false);
  const active = entries.find((entry) => entry.id === activeId) || entries[0];
  const otherEntries = useMemo(
    () => entries.filter((entry) => entry.id !== active.id),
    [active.id, entries]
  );

  return (
    <div className="mx-auto max-w-xl">
      <div className="relative mx-auto aspect-square w-full max-w-[420px] overflow-hidden border border-white/14 bg-black/45">
        {active.artwork_url ? (
          <Image
            src={active.artwork_url}
            alt={`${active.title} artwork`}
            fill
            sizes="(max-width: 640px) 88vw, 420px"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-neutral-950 text-xs uppercase tracking-[0.35em] text-white/34">
            DERANGED FAN
          </div>
        )}
      </div>
      <h2 className="mt-6 text-base uppercase tracking-[0.28em] text-white/86">{active.title}</h2>
      <div className="mt-5">
        <MusicPlayer
          key={`${active.id}-${shouldAutoplay ? "play" : "load"}`}
          html={active.player_html}
          url={active.soundcloud_url}
          autoPlay={shouldAutoplay}
        />
      </div>
      {otherEntries.length ? (
        <div className="media-scroll mt-8 flex gap-4 overflow-x-auto pb-3">
          {otherEntries.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => {
                setShouldAutoplay(true);
                setActiveId(entry.id);
              }}
              className="min-w-44 border border-white/12 bg-black/38 p-3 text-left transition-opacity hover:opacity-72"
            >
              <span className="relative block aspect-square w-full bg-neutral-950">
                {entry.artwork_url ? (
                  <Image
                    src={entry.artwork_url}
                    alt={`${entry.title} artwork`}
                    fill
                    sizes="176px"
                    className="object-cover"
                  />
                ) : null}
              </span>
              <span className="mt-3 block text-xs uppercase tracking-[0.18em] text-white/78">
                {entry.title}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
