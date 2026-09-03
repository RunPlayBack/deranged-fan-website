"use client";

import { GripVertical } from "lucide-react";
import { useEffect, useState } from "react";
import {
  deleteMusicEntry,
  updateMusicEntry,
  updateMusicOrder
} from "@/app/admin/actions";

type MusicRow = Record<string, any>;

function TextInput({
  name,
  label,
  defaultValue
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
}) {
  return (
    <label className="block text-xs uppercase tracking-[0.18em] text-white/56">
      {label}
      <input
        name={name}
        defaultValue={defaultValue || ""}
        className="mt-2 w-full border border-white/12 bg-white/7 px-3 py-3 text-sm normal-case tracking-normal text-white"
      />
    </label>
  );
}

function SaveButton({ children = "Update" }: { children?: React.ReactNode }) {
  return (
    <button className="border border-white/24 px-4 py-3 text-xs uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-70">
      {children}
    </button>
  );
}

function moveItem(items: MusicRow[], fromIndex: number, toIndex: number) {
  const next = [...items];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

export function MusicAdminList({ music }: { music: MusicRow[] }) {
  const [items, setItems] = useState(music);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  useEffect(() => {
    setItems(music);
  }, [music]);

  if (!items.length) {
    return null;
  }

  return (
    <div className="mt-8 space-y-5">
      <form action={updateMusicOrder} className="border border-white/10 bg-white/5 p-4">
        <input type="hidden" name="ids" value={JSON.stringify(items.map((item) => item.id))} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-white/58">
            Drag tracks into the order you want, then save the order.
          </p>
          <SaveButton>Save order</SaveButton>
        </div>
      </form>

      {items.map((entry, index) => (
        <div
          key={entry.id}
          draggable
          onDragStart={(event) => {
            setDraggedId(entry.id);
            event.dataTransfer.effectAllowed = "move";
          }}
          onDragOver={(event) => {
            event.preventDefault();
            const fromIndex = items.findIndex((item) => item.id === draggedId);

            if (fromIndex < 0 || fromIndex === index) {
              return;
            }

            setItems((current) => moveItem(current, fromIndex, index));
          }}
          onDragEnd={() => setDraggedId(null)}
          className={`border border-white/10 p-4 transition-colors ${
            draggedId === entry.id ? "bg-white/10" : "bg-black"
          }`}
        >
          <div className="mb-4 flex items-center gap-3 text-white/48">
            <GripVertical className="h-5 w-5" aria-hidden="true" />
            <span className="text-xs uppercase tracking-[0.2em]">Track {index + 1}</span>
          </div>
          <form action={updateMusicEntry}>
            <input type="hidden" name="id" value={entry.id} />
            <div className="grid gap-4">
              <TextInput
                name="soundcloud_url"
                label="SoundCloud URL"
                defaultValue={entry.soundcloud_url}
              />
              <TextInput name="title_override" label="Title" defaultValue={entry.title_override} />
              <TextInput
                name="artwork_override"
                label="Artwork"
                defaultValue={entry.artwork_override}
              />
              <label className="flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-white/56">
                <input name="visible" type="checkbox" defaultChecked={entry.visible} />
                Visible
              </label>
              <div className="flex gap-3">
                <SaveButton />
                <button
                  formAction={deleteMusicEntry}
                  className="border border-white/12 px-4 py-3 text-xs uppercase tracking-[0.2em] text-white/52 transition-opacity hover:opacity-70"
                >
                  Delete
                </button>
              </div>
            </div>
          </form>
        </div>
      ))}
    </div>
  );
}
