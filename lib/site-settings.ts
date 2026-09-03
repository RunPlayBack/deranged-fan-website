import { DEFAULT_SETTINGS, SETTINGS_ID } from "@/lib/defaults";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SiteSettings } from "@/lib/types";

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return DEFAULT_SETTINGS;
  }

  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", SETTINGS_ID)
    .single();

  if (error || !data) {
    return DEFAULT_SETTINGS;
  }

  return { ...DEFAULT_SETTINGS, ...data };
}
