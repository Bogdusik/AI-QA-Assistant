import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

export function BentoGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("grid auto-rows-[minmax(160px,auto)] grid-cols-3 gap-4", className)}>
      {children}
    </div>
  );
}

export function BentoGridItem({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-white/30 hover:shadow-[0_0_40px_rgba(255,255,255,0.08)]",
        className
      )}
    >
      {children}
    </div>
  );
}
