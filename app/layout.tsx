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

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://derangedfan.com";
  const title = settings.site_title || "DERANGED FAN";
  const description =
    settings.homepage_quote || "Just the sound of quiet thoughts after midnight.";
  const image = {
    url: settings.background_poster_url || "/opengraph-image",
    width: 1200,
    height: 630,
    alt: title
  };

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    alternates: {
      canonical: "/"
    },
    openGraph: {
      title,
      description,
      url: "/",
      siteName: title,
      type: "website",
      images: [image]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image]
    }
  };
}

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
          mobileVideoUrl={settings.background_mobile_video_url}
          overlayOpacity={settings.background_overlay_opacity}
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
