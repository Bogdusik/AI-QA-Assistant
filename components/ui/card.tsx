import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-slate-800/60 p-5 backdrop-blur-sm shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-xl hover:shadow-indigo-500/10",
        className
      )}
    >
      {children}
    </div>
  );
}
