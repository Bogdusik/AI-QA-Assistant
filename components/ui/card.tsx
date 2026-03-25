import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

export function Card({
  className,
  children
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-300 bg-gradient-to-br from-white via-white to-brand-50/20 p-5 shadow-sm ring-1 ring-slate-300/80 transition-colors hover:ring-brand-500/60 hover:shadow-md dark:border-slate-200 dark:bg-white dark:text-slate-900 dark:ring-brand-500/30",
        className
      )}
    >
      {children}
    </div>
  );
}
