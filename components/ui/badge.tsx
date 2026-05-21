import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

export function Badge({
  children,
  tone = "default"
}: {
  children: ReactNode;
  tone?: "default" | "pending" | "accepted" | "rejected";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium transition-shadow duration-200",
        tone === "default" && "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
        tone === "pending" &&
          "bg-amber-500/10 text-amber-600 ring-1 ring-amber-400/40 badge-glow-amber dark:text-amber-400",
        tone === "accepted" &&
          "bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-400/40 badge-glow-green dark:text-emerald-400",
        tone === "rejected" &&
          "bg-red-500/10 text-red-700 ring-1 ring-red-400/40 badge-glow-red dark:text-red-400"
      )}
    >
      {children}
    </span>
  );
}
