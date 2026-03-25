"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary" | "outline" | "destructive" | "ghost";
};

export function Button({ className, variant = "default", ...props }: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-brand-500 hover:ring-1 hover:ring-brand-500/20 disabled:opacity-60",
        variant === "default" &&
          "bg-brand-500 text-white hover:bg-brand-700 dark:bg-brand-50 dark:text-brand-700 dark:hover:bg-brand-100 border border-brand-500/45",
        variant === "secondary" &&
          "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 border border-slate-300/80",
        variant === "outline" && "border border-slate-300 bg-white hover:bg-slate-50 dark:border-slate-200 dark:bg-white dark:hover:bg-slate-50",
        variant === "destructive" && "bg-red-600 text-white hover:bg-red-700",
        variant === "ghost" && "hover:bg-slate-100 dark:hover:bg-slate-100",
        className
      )}
      {...props}
    />
  );
}
