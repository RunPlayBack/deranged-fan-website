import { getSiteSettings } from "@/lib/site-settings";

export default async function Home() {
  const settings = await getSiteSettings();

  return (
    <main className="flex min-h-screen items-center justify-center px-6 pb-24 pt-60 text-center sm:pt-72">
      <section className="animate-[fadeIn_900ms_ease-out]">
        <h1 className="sr-only">{settings.site_title}</h1>
        <p className="mx-auto max-w-xl text-sm leading-7 text-white/72 sm:text-base">
          {settings.homepage_quote}
        </p>
      </section>
    </main>
  );
}
