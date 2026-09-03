"use client";

import { useFormStatus } from "react-dom";

export function AdminSubmitButton({
  children = "Save",
  pendingChildren,
  className
}: {
  children?: React.ReactNode;
  pendingChildren?: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className={
        className ||
        "border border-white/24 px-4 py-3 text-xs uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-70 disabled:cursor-wait disabled:opacity-50"
      }
    >
      {pending ? pendingChildren || "Saving..." : children}
    </button>
  );
}
