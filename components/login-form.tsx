"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Signing in...");
    const supabase = createSupabaseBrowserClient();
    const form = new FormData(event.currentTarget);

    if (!supabase) {
      setMessage("Supabase is not configured yet.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password"))
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    window.location.reload();
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-5 py-10 text-white">
      <form
        onSubmit={handleSubmit}
        className="mx-auto mt-20 max-w-sm border border-white/12 bg-black p-8"
      >
        <h1 className="serif-display text-4xl uppercase tracking-[0.18em]">Admin</h1>
        <label className="mt-8 block text-xs uppercase tracking-[0.2em] text-white/62">
          Email
          <input
            name="email"
            type="email"
            required
            className="mt-3 w-full border border-white/12 bg-white/7 px-3 py-3 text-sm text-white"
          />
        </label>
        <label className="mt-5 block text-xs uppercase tracking-[0.2em] text-white/62">
          Password
          <input
            name="password"
            type="password"
            required
            className="mt-3 w-full border border-white/12 bg-white/7 px-3 py-3 text-sm text-white"
          />
        </label>
        <button
          type="submit"
          className="mt-7 w-full border border-white/28 px-4 py-3 text-xs uppercase tracking-[0.24em] text-white transition-opacity hover:opacity-70"
        >
          Sign in
        </button>
        {message ? <p className="mt-5 text-sm text-white/64">{message}</p> : null}
      </form>
    </main>
  );
}
