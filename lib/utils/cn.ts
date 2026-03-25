import { clsx } from "clsx";

// Keep minimal: clsx-only to avoid type-package coupling issues.
export function cn(...inputs: Array<string | undefined | null | false | Record<string, boolean>>) {
  return clsx(...inputs);
}
