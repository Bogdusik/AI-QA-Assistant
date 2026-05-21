import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="container-app py-8">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-white">AI QA Assistant</p>
            <p className="text-sm text-slate-400">
              AI-assisted QA productivity with a human-in-the-loop review workflow.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-white">Learn</p>
            <div className="flex flex-col gap-2 text-sm text-slate-300">
              <Link href="/sql-practice" className="hover:text-white">
                SQL Practice Pack
              </Link>
              <Link href="/api-practice" className="hover:text-white">
                API Practice Pack
              </Link>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-white">Explore</p>
            <div className="flex flex-col gap-2 text-sm text-slate-300">
              <Link href="/demo/test-cases" className="hover:text-white">
                Demo Project
              </Link>
              <Link href="/settings" className="hover:text-white">
                Settings
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 text-xs text-slate-400">
          © {new Date().getFullYear()} AI QA Assistant (MVP). All generated suggestions require
          human review before export.
        </div>
      </div>
    </footer>
  );
}
