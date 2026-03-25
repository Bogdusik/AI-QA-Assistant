"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function Topbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const pageLabel =
    pathname === "/dashboard"
      ? "Dashboard"
      : pathname.startsWith("/generate")
        ? "Generate"
        : pathname.startsWith("/documents")
          ? "Documents"
          : pathname === "/api-practice"
            ? "API Practice"
            : pathname === "/sql-practice"
              ? "SQL Practice"
              : pathname === "/settings"
                ? "Settings"
                : pathname.startsWith("/demo")
                  ? "Demo Project"
                  : "AI QA Assistant";

  return (
    <div className="border-b border-slate-200 bg-white dark:border-slate-200 dark:bg-white">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:hidden">
        <Link href="/" className="font-semibold">
          AI QA Assistant
        </Link>

        <details className="relative">
          <summary className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-200 dark:bg-white dark:text-slate-700 dark:hover:bg-slate-100">
            Menu
          </summary>
          <div className="absolute right-0 z-20 mt-2 w-56 rounded-md border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-200 dark:bg-white">
            <nav className="space-y-1 text-sm">
              <Link className="block rounded-lg p-2 hover:bg-slate-50 dark:hover:bg-slate-100" href="/dashboard">
                Dashboard
              </Link>
              <Link className="block rounded-lg p-2 hover:bg-slate-50 dark:hover:bg-slate-100" href="/documents">
                Documents
              </Link>
              <Link className="block rounded-lg p-2 hover:bg-slate-50 dark:hover:bg-slate-100" href="/api-practice">
                API Practice
              </Link>
              <Link className="block rounded-lg p-2 hover:bg-slate-50 dark:hover:bg-slate-100" href="/sql-practice">
                SQL Practice
              </Link>
              <Link className="block rounded-lg p-2 hover:bg-slate-50 dark:hover:bg-slate-100" href="/settings">
                Settings
              </Link>
              <details>
                <summary className="cursor-pointer rounded-lg p-2 hover:bg-slate-50 dark:hover:bg-slate-100">Generate</summary>
                <div className="space-y-1 px-1 pb-1">
                  <Link className="block rounded-lg p-2 hover:bg-slate-50 dark:hover:bg-slate-100" href="/generate/test-cases">
                    Test Cases
                  </Link>
                  <Link className="block rounded-lg p-2 hover:bg-slate-50 dark:hover:bg-slate-100" href="/generate/checklist">
                    Checklist
                  </Link>
                  <Link className="block rounded-lg p-2 hover:bg-slate-50 dark:hover:bg-slate-100" href="/generate/bug-report">
                    Bug Report
                  </Link>
                  <Link className="block rounded-lg p-2 hover:bg-slate-50 dark:hover:bg-slate-100" href="/generate/api-ideas">
                    API Ideas
                  </Link>
                </div>
              </details>
            </nav>
          </div>
        </details>
      </div>

      <div className="container-app hidden items-center justify-between py-3 lg:flex">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-900">{pageLabel}</p>
        </div>

        <div className="flex items-center gap-2">
          {status === "loading" ? null : session ? (
            <>
              <span className="hidden text-xs text-slate-500 md:inline dark:text-slate-700">{session.user?.email}</span>
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  void signOut({ callbackUrl: "/" });
                }}
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline">Log in</Button>
              </Link>
              <Link href="/register">
                <Button>Create account</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

