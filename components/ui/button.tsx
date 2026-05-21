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
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-all duration-300 focus:outline-none disabled:opacity-60",
        variant === "default" &&
          "bg-white text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:shadow-white/40",
        variant === "secondary" &&
          "border border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/40",
        variant === "outline" &&
          "border border-white/20 bg-transparent text-white hover:bg-white/10 hover:border-white/40",
        variant === "destructive" &&
          "bg-red-600/90 text-white hover:bg-red-600 border border-red-500/30",
        variant === "ghost" && "text-white/60 hover:bg-white/5 hover:text-white",
        className
      )}
      {...props}
    />
  );
}
