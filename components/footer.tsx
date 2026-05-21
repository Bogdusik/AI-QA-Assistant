import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="container-app py-8">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-white">AI QA Assistant</p>
            <p className="text-sm text-white/60">
              AI-assisted QA productivity with a human-in-the-loop review workflow.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-white">Learn</p>
            <div className="flex flex-col gap-2 text-sm text-white/60">
              <Link
                href="/sql-practice"
                className="hover:text-white transition-colors duration-200"
              >
                SQL Practice Pack
              </Link>
              <Link
                href="/api-practice"
                className="hover:text-white transition-colors duration-200"
              >
                API Practice Pack
              </Link>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-white">Explore</p>
            <div className="flex flex-col gap-2 text-sm text-white/60">
              <Link
                href="/demo/test-cases"
                className="hover:text-white transition-colors duration-200"
              >
                Demo Project
              </Link>
              <Link href="/settings" className="hover:text-white transition-colors duration-200">
                Settings
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 text-xs text-white/40">
          © {new Date().getFullYear()} AI QA Assistant (MVP). All generated suggestions require
          human review before export.
        </div>
      </div>
    </footer>
  );
}
