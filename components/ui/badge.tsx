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
        tone === "default" && "border border-white/20 bg-white/5 text-white/60 badge-glow-white",
        tone === "pending" && "border border-white/20 bg-white/5 text-white/60 badge-glow-white",
        tone === "accepted" &&
          "border border-emerald-400/30 bg-emerald-400/5 text-emerald-400 badge-glow-green",
        tone === "rejected" && "border border-red-400/30 bg-red-400/5 text-red-400 badge-glow-red"
      )}
    >
      {children}
    </span>
  );
}
