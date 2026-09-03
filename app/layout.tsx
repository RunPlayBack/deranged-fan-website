import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { SocialFooter } from "@/components/social-footer";
import { BackgroundVideo } from "@/components/background-video";
import { getSiteSettings } from "@/lib/site-settings";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600"]
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"]
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "DERANGED FAN",
  description: "Just the sound of quiet thoughts after midnight.",
  openGraph: {
    title: "DERANGED FAN",
    description: "Just the sound of quiet thoughts after midnight.",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "DERANGED FAN",
    description: "Just the sound of quiet thoughts after midnight."
  }
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();

  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="sans-body">
        <BackgroundVideo
          posterUrl={settings.background_poster_url}
          videoUrl={settings.background_video_url}
        />
        <div className="relative z-10 min-h-screen">
          <Navigation siteTitle={settings.site_title} />
          {children}
          <SocialFooter
            soundcloudUrl={settings.soundcloud_url}
            spotifyUrl={settings.spotify_url}
            youtubeUrl={settings.youtube_url}
          />
        </div>
      </body>
    </html>
  );
}
