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
    ? "rounded-lg bg-white/10 text-white ring-1 ring-white/20"
    : "rounded-lg text-slate-300 hover:bg-white/5 hover:text-white";
}

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-72 shrink-0 flex-col border-r border-white/10 bg-slate-900 lg:flex">
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-white">AI QA Assistant</p>
            <p className="text-xs text-slate-400">AI-assisted QA workflow</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-3 pb-4">
        <div className="space-y-2">
          {nav.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`block p-2 text-sm ${linkClass(pathname === l.href)}`}
            >
              {l.label}
            </Link>
          ))}

          <details className="mt-3">
            <summary className="cursor-pointer rounded-lg p-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
              Generate
            </summary>
            <div className="space-y-1 px-1 pb-1">
              {generate.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`block rounded-lg p-2 text-sm ${
                    pathname === l.href
                      ? "bg-white/10 text-white ring-1 ring-white/20"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
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
