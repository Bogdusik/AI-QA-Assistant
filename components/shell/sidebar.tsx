"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/documents", label: "Documents" },
  { href: "/api-practice", label: "API Practice" },
  { href: "/sql-practice", label: "SQL Practice" },
  { href: "/settings", label: "Settings" }
];

const generate = [
  { href: "/generate/test-cases", label: "Test Cases" },
  { href: "/generate/checklist", label: "Checklist" },
  { href: "/generate/bug-report", label: "Bug Report" },
  { href: "/generate/api-ideas", label: "API Ideas" }
];

function linkClass(active: boolean) {
  return active
    ? "rounded-lg bg-brand-50 text-brand-700 ring-1 ring-brand-100 dark:bg-brand-500/10 dark:text-brand-300 dark:ring-brand-500/30"
    : "rounded-lg text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:ring-1 hover:ring-brand-500/15 dark:text-slate-700 dark:hover:bg-slate-100 dark:hover:text-slate-900 dark:hover:ring-brand-500/15";
}

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-72 shrink-0 flex-col border-r bg-white dark:border-slate-200 dark:bg-white lg:flex">
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-900">AI QA Assistant</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">AI-assisted QA workflow</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-3 pb-4">
        <div className="space-y-2">
          {nav.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`block p-2 text-sm ${linkClass(pathname === l.href)} dark:bg-transparent`}
            >
              {l.label}
            </Link>
          ))}

          <details className="mt-3">
            <summary className="cursor-pointer rounded-lg p-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-700 dark:hover:bg-slate-100 dark:hover:text-slate-900">
              Generate
            </summary>
            <div className="space-y-1 px-1 pb-1">
              {generate.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`block rounded-lg p-2 text-sm ${
                    pathname === l.href
                      ? "bg-brand-50 text-brand-700 ring-1 ring-brand-100 dark:bg-brand-500/10 dark:text-brand-300 dark:ring-brand-500/30"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-700 dark:hover:bg-slate-100 dark:hover:text-slate-900"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </details>
        </div>
      </div>
    </aside>
  );
}

