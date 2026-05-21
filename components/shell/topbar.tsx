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
    <div className="sticky top-0 z-50 border-b border-white/10 bg-black backdrop-blur-md">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:hidden">
        <Link href="/" className="font-semibold text-white">
          AI QA Assistant
        </Link>

        <details className="relative">
          <summary className="cursor-pointer rounded-lg border border-white/20 bg-transparent px-3 py-1 text-sm text-white/60 hover:bg-white/5 hover:text-white transition-all duration-200">
            Menu
          </summary>
          <div className="absolute right-0 z-20 mt-2 w-56 rounded-md border border-white/10 bg-black p-2 shadow-xl">
            <nav className="space-y-1 text-sm">
              <Link
                className="block rounded-lg p-2 text-white/60 hover:bg-white/5 hover:text-white transition-all duration-200"
                href="/dashboard"
              >
                Dashboard
              </Link>
              <Link
                className="block rounded-lg p-2 text-white/60 hover:bg-white/5 hover:text-white transition-all duration-200"
                href="/documents"
              >
                Documents
              </Link>
              <Link
                className="block rounded-lg p-2 text-white/60 hover:bg-white/5 hover:text-white transition-all duration-200"
                href="/api-practice"
              >
                API Practice
              </Link>
              <Link
                className="block rounded-lg p-2 text-white/60 hover:bg-white/5 hover:text-white transition-all duration-200"
                href="/sql-practice"
              >
                SQL Practice
              </Link>
              <Link
                className="block rounded-lg p-2 text-white/60 hover:bg-white/5 hover:text-white transition-all duration-200"
                href="/settings"
              >
                Settings
              </Link>
              <details>
                <summary className="cursor-pointer rounded-lg p-2 text-white/60 hover:bg-white/5 hover:text-white transition-all duration-200">
                  Generate
                </summary>
                <div className="space-y-1 px-1 pb-1">
                  <Link
                    className="block rounded-lg p-2 text-white/60 hover:bg-white/5 hover:text-white transition-all duration-200"
                    href="/generate/test-cases"
                  >
                    Test Cases
                  </Link>
                  <Link
                    className="block rounded-lg p-2 text-white/60 hover:bg-white/5 hover:text-white transition-all duration-200"
                    href="/generate/checklist"
                  >
                    Checklist
                  </Link>
                  <Link
                    className="block rounded-lg p-2 text-white/60 hover:bg-white/5 hover:text-white transition-all duration-200"
                    href="/generate/bug-report"
                  >
                    Bug Report
                  </Link>
                  <Link
                    className="block rounded-lg p-2 text-white/60 hover:bg-white/5 hover:text-white transition-all duration-200"
                    href="/generate/api-ideas"
                  >
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
          <p className="truncate text-sm font-medium text-white/60">{pageLabel}</p>
        </div>

        <div className="flex items-center gap-2">
          {status === "loading" ? null : session ? (
            <>
              <span className="hidden text-xs text-white/40 md:inline">{session.user?.email}</span>
              <Button
                type="button"
                className="border border-white/20 bg-transparent text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300"
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
                <Button className="border border-white/20 bg-transparent text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-white text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-300">
                  Create account
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
