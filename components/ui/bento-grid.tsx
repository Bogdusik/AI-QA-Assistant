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
        "group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-white/20 hover:shadow-xl",
        className
      )}
    >
      {children}
    </div>
  );
}
