# DERANGED FAN

A minimal, cinematic artist website built with Next.js App Router, TypeScript, Tailwind CSS, Supabase, and Vercel.

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in the values.

3. Run the app:

   ```bash
   npm run dev
   ```

## Supabase setup

1. Create a Supabase project.
2. In the Supabase SQL editor, run `supabase/migrations/001_initial_schema.sql`.
3. Create an auth user for yourself.
4. Add your auth email to `public.admin_users`:

   ```sql
   insert into public.admin_users (email) values ('you@example.com');
   ```

5. Set `ADMIN_EMAILS` in `.env.local` and Vercel to the same approved admin email or comma-separated list.
6. The migration creates the public `site-media` storage bucket for the background video and poster image.

## Required environment variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAILS`
- `NEXT_PUBLIC_SITE_URL`

## Optional environment variables

- `YOUTUBE_API_KEY`: enables automatic YouTube channel video loading.
- `SOUNDCLOUD_CLIENT_ID`: reserved for official SoundCloud API access if available later.

## Admin

Visit `/admin` directly. It is not linked from the public site.

Admin can edit site settings, add social links, set a YouTube channel ID, upload or replace the full-screen landscape background video, vertical mobile background video, and poster image, add fallback SoundCloud entries, and add or reorder manual YouTube videos.

Supabase Free projects have a global 50 MB Storage upload limit. Keep background loops under 50 MB on Free, or use a Pro project for larger uploads. Smaller loops under 25 MB are best for the final site experience.

## SoundCloud

The site does not depend on SoundCloud API approval. Add SoundCloud track or playlist URLs in `/admin`; the app uses SoundCloud oEmbed for player, title, artwork, and metadata when available.

## YouTube

Add a YouTube Data API key and channel ID to automatically load newest channel videos server-side. Visitors never receive the API key. If the API fails or quota is exhausted, the page still renders and can fall back to manual videos added in `/admin`.

## Vercel deployment

1. Push this repository to GitHub.
2. Import the project in Vercel.
3. Add the environment variables listed above.
4. Deploy.
5. After deployment, set `NEXT_PUBLIC_SITE_URL` to the final Vercel or custom-domain URL.
6. To connect a custom domain later, add it in Vercel project settings and update `NEXT_PUBLIC_SITE_URL`.
