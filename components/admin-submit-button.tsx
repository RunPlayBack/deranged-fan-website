"use client";

import type { ButtonHTMLAttributes } from "react";
import { useFormStatus } from "react-dom";

export function AdminSubmitButton({
  children = "Save",
  pendingChildren,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  pendingChildren?: React.ReactNode;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      {...props}
      className={
        className ||
        "border border-white/24 px-4 py-3 text-xs uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-70 disabled:cursor-wait disabled:opacity-50"
      }
    >
      {pending ? pendingChildren || "Saving..." : children}
    </button>
  );
}
