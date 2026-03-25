import { cn } from "@/lib/utils/cn";
import type { InputHTMLAttributes } from "react";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-md border border-slate-400 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 hover:border-brand-500/60 dark:border-slate-200 dark:bg-white dark:text-slate-900 dark:focus:border-brand-500 dark:hover:border-brand-500/60",
        className
      )}
      {...props}
    />
  );
}
