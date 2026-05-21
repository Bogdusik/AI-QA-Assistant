import { cn } from "@/lib/utils/cn";
import type { InputHTMLAttributes } from "react";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 hover:border-white/20 focus:border-white/40 focus:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-200",
        className
      )}
      {...props}
    />
  );
}
