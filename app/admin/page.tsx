import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin-dashboard";
import { LoginForm } from "@/components/login-form";
import { DEFAULT_SETTINGS } from "@/lib/defaults";
import { getSiteSettings } from "@/lib/site-settings";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient, hasSupabaseEnv } from "@/lib/supabase/server";

function isApprovedAdmin(email?: string | null) {
  const admins = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  if (!admins.length) {
    return false;
  }

  return Boolean(email && admins.includes(email.toLowerCase()));
}

async function getAdminData() {
  const supabase = createSupabaseAdminClient() || (await createSupabaseServerClient());

  if (!supabase) {
    return { music: [], videos: [] };
  }

  const [music, videos] = await Promise.all([
    supabase
      .from("music_overrides")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false }),
    supabase
      .from("video_overrides")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
  ]);

  return {
    music: music.data || [],
    videos: videos.data || []
  };
}

export default async function AdminPage({
  searchParams
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  if (!hasSupabaseEnv()) {
    return (
      <main className="min-h-screen bg-neutral-950 px-5 py-10 text-white">
        <section className="mx-auto max-w-2xl border border-white/12 bg-black p-8">
          <h1 className="serif-display text-4xl uppercase tracking-[0.18em]">Admin setup</h1>
          <p className="mt-5 leading-7 text-white/68">
            Add the Supabase environment values from <code>.env.example</code>, run the database
            migration, and set <code>ADMIN_EMAILS</code> before using this page.
          </p>
        </section>
      </main>
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase!.auth.getUser();

  if (!data.user) {
    return <LoginForm />;
  }

  if (!isApprovedAdmin(data.user.email)) {
    redirect("/");
  }

  const [settings, adminData] = await Promise.all([getSiteSettings(), getAdminData()]);

  return (
    <AdminDashboard
      settings={{ ...DEFAULT_SETTINGS, ...settings }}
      music={adminData.music}
      videos={adminData.videos}
      adminEmail={data.user.email || ""}
      errorMessage={params.error}
    />
  );
}
