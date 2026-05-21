import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]",
        className
      )}
    >
      {children}
    </div>
  );
}
