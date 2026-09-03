"use client";

import { useState } from "react";
import {
  createBackgroundUploadTarget,
  saveBackgroundMediaUrl
} from "@/app/admin/actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function BackgroundUploadForm() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setBusy(true);
    setMessage("Preparing upload...");

    try {
      const supabase = createSupabaseBrowserClient();
      const form = new FormData(formElement);
      const kind = String(form.get("kind") || "");
      const file = form.get("file");

      if (!supabase) {
        throw new Error("Supabase is not configured.");
      }

      if (!(file instanceof File) || !file.size) {
        throw new Error("Choose a file first.");
      }

      const target = await createBackgroundUploadTarget({
        kind,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size
      });

      setMessage("Uploading to Supabase...");
      const { error: uploadError } = await supabase.storage
        .from("site-media")
        .uploadToSignedUrl(target.path, target.token, file, {
          contentType: file.type
        });

      if (uploadError) {
        throw uploadError;
      }

      setMessage("Saving site setting...");
      await saveBackgroundMediaUrl({ kind: target.kind, publicUrl: target.publicUrl });

      setMessage("Upload saved.");
      formElement.reset();
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border border-white/12 bg-black p-6">
      <h2 className="serif-display text-3xl uppercase tracking-[0.14em]">Background upload</h2>
      <div className="mt-7 grid gap-5">
        <label className="block text-xs uppercase tracking-[0.18em] text-white/56">
          Type
          <select
            name="kind"
            className="mt-2 w-full border border-white/12 bg-neutral-950 px-3 py-3 text-sm text-white"
          >
            <option value="video">Landscape desktop video</option>
            <option value="mobile-video">Vertical mobile video</option>
            <option value="poster">Poster image</option>
          </select>
        </label>
        <input
          name="file"
          type="file"
          accept="video/*,image/*"
          className="w-full border border-white/12 bg-white/7 px-3 py-3 text-sm text-white"
        />
        <p className="text-sm leading-6 text-white/52">
          Files upload directly to Supabase. Use a landscape MP4/WebM for desktop and a vertical
          MP4/WebM for mobile. Smaller loops under 25 MB load much better.
        </p>
        <button
          disabled={busy}
          className="border border-white/24 px-4 py-3 text-xs uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-70 disabled:opacity-40"
        >
          {busy ? "Uploading" : "Upload"}
        </button>
        {message ? <p className="text-sm leading-6 text-white/64">{message}</p> : null}
      </div>
    </form>
  );
}
