import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="container-app py-8">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <p className="text-sm font-semibold">AI QA Assistant</p>
            <p className="text-sm text-slate-600">
              AI-assisted QA productivity with a human-in-the-loop review workflow.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold">Learn</p>
            <div className="flex flex-col gap-2 text-sm text-slate-700">
              <Link href="/sql-practice" className="hover:text-slate-900">
                SQL Practice Pack
              </Link>
              <Link href="/api-practice" className="hover:text-slate-900">
                API Practice Pack
              </Link>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold">Explore</p>
            <div className="flex flex-col gap-2 text-sm text-slate-700">
              <Link href="/demo/test-cases" className="hover:text-slate-900">
                Demo Project
              </Link>
              <Link href="/settings" className="hover:text-slate-900">
                Settings
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 text-xs text-slate-500">
          © {new Date().getFullYear()} AI QA Assistant (MVP). All generated suggestions require human review before export.
        </div>
      </div>
    </footer>
  );
}

