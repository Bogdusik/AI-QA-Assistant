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
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
        tone === "default" && "bg-slate-100 text-slate-700",
        tone === "pending" &&
          "bg-semantic-warning-100 text-semantic-warning-700 ring-1 ring-semantic-warning-100 shadow-sm dark:bg-semantic-warning-100 dark:text-semantic-warning-700",
        tone === "accepted" &&
          "bg-semantic-success-100 text-semantic-success-700 ring-1 ring-semantic-success-100 shadow-sm dark:bg-semantic-success-100 dark:text-semantic-success-700",
        tone === "rejected" &&
          "bg-semantic-danger-100 text-semantic-danger-700 ring-1 ring-semantic-danger-100 shadow-sm dark:bg-semantic-danger-100 dark:text-semantic-danger-700"
      )}
    >
      {children}
    </span>
  );
}
