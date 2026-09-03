"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/music", label: "MUSIC" },
  { href: "/video", label: "VIDEO" }
];

export function Navigation({ siteTitle }: { siteTitle: string }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="fixed left-0 right-0 top-[8vh] z-30 flex justify-center px-5 text-center sm:top-[10vh]">
      <nav aria-label="Primary navigation" className="flex flex-col items-center">
        <Link
          href="/"
          aria-current={pathname === "/" ? "page" : undefined}
          className={`serif-display text-6xl font-medium uppercase leading-none tracking-[0.12em] text-white transition-opacity hover:opacity-80 sm:text-8xl md:text-9xl ${
            pathname === "/" ? "opacity-100" : "opacity-90"
          }`}
        >
          {siteTitle}
        </Link>
        <ul className="mt-5 flex items-center justify-center gap-6 text-[11px] font-medium uppercase tracking-[0.28em] text-white/74 sm:mt-6 sm:gap-10 sm:text-sm">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex border px-3 py-1.5 leading-none transition-opacity hover:opacity-100 sm:px-4 ${
                    active
                      ? "border-white/72 text-white opacity-100"
                      : "border-white/46 text-white/82 opacity-84"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
