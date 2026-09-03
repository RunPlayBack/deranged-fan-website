"use client";

import { usePathname } from "next/navigation";

type SocialFooterProps = {
  soundcloudUrl?: string | null;
  youtubeUrl?: string | null;
  spotifyUrl?: string | null;
};

const placeholder = "#";

function SoundCloudMark() {
  return (
    <svg viewBox="0 0 64 32" aria-hidden="true" className="h-5 w-9 fill-current">
      <path d="M26.8 7.6c-1.1 0-2.1.2-3.1.5v19.8h26.1c6.8 0 12.2-5.3 12.2-11.8S56.6 4.2 49.8 4.2c-2.7 0-5.3.9-7.3 2.4C38.9 1.7 33.1-.2 27.8 1.5v6.1h-1z" />
      <path d="M18.7 12.3h2.2v15.6h-2.2zM14.2 14.1h2.1v13.8h-2.1zM9.8 16.6h2v11.3h-2zM5.5 18.7h1.8v9.2H5.5zM1.9 20.8h1.5v7.1H1.9z" />
    </svg>
  );
}

function YouTubeMark() {
  return (
    <svg viewBox="0 0 64 44" aria-hidden="true" className="h-5 w-8 fill-current">
      <path d="M62.6 7.2c-.7-2.8-2.9-5-5.7-5.7C51.9.2 32 .2 32 .2s-19.9 0-24.9 1.3C4.3 2.2 2.1 4.4 1.4 7.2.1 12.3.1 22 .1 22s0 9.7 1.3 14.8c.7 2.8 2.9 5 5.7 5.7 5 1.3 24.9 1.3 24.9 1.3s19.9 0 24.9-1.3c2.8-.7 5-2.9 5.7-5.7C63.9 31.7 63.9 22 63.9 22s0-9.7-1.3-14.8zM25.6 31.4V12.6L42.2 22 25.6 31.4z" />
    </svg>
  );
}

function SpotifyMark() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="h-5 w-5 fill-current">
      <path d="M32 0C14.3 0 0 14.3 0 32s14.3 32 32 32 32-14.3 32-32S49.7 0 32 0zm14.7 46.2c-.5.8-1.6 1.1-2.4.6-6.7-4.1-15.1-5-25.1-2.7-.9.2-1.9-.4-2.1-1.3s.4-1.9 1.3-2.1c10.9-2.5 20.2-1.4 27.7 3.2.8.5 1.1 1.6.6 2.3zm3.9-8.7c-.6 1-2 1.4-3 .7-7.6-4.7-19.3-6.1-28.3-3.3-1.2.4-2.4-.3-2.8-1.5-.3-1.2.3-2.4 1.5-2.8 10.3-3.1 23.2-1.6 32 3.8 1 .6 1.3 2 .6 3.1zm.4-9.1c-9.2-5.4-24.3-5.9-33.1-3.3-1.4.4-2.9-.4-3.3-1.8-.4-1.4.4-2.9 1.8-3.3 10.1-3 26.8-2.4 37.3 3.8 1.3.8 1.7 2.4.9 3.7-.7 1.3-2.3 1.7-3.6.9z" />
    </svg>
  );
}

export function SocialFooter({
  soundcloudUrl,
  youtubeUrl,
  spotifyUrl
}: SocialFooterProps) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const links = [
    {
      label: "SoundCloud",
      href: soundcloudUrl || placeholder,
      icon: SoundCloudMark
    },
    {
      label: "YouTube",
      href: youtubeUrl || placeholder,
      icon: YouTubeMark
    },
    {
      label: "Spotify",
      href: spotifyUrl || placeholder,
      icon: SpotifyMark
    }
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30 flex justify-center px-5 py-6 sm:py-8">
      <div className="flex items-center gap-6">
        {links.map(({ label, href, icon: Icon }) => (
          <a
            key={label}
            href={href}
            target={href === placeholder ? undefined : "_blank"}
            rel={href === placeholder ? undefined : "noreferrer"}
            aria-label={label}
            className="flex h-8 min-w-8 items-center justify-center text-white/78 transition-opacity hover:opacity-60"
          >
            <Icon />
          </a>
        ))}
      </div>
    </footer>
  );
}
