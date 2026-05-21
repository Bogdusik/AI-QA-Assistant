import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800 to-indigo-950 p-10 shadow-xl">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]"
        />
        <div className="relative">
          <h1 className="text-4xl font-bold tracking-tight text-white">AI QA Assistant</h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            Turn requirements into QA-ready test cases, checklists, bug drafts, and API test
            ideas—then review and export with a human-in-the-loop workflow.
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/demo">
              <Button className="border-indigo-500 bg-indigo-500 text-white hover:bg-indigo-600">
                Try Demo
              </Button>
            </Link>
            <Link href="/register">
              <Button className="border-indigo-500 bg-indigo-500 text-white hover:bg-indigo-600">
                Create account
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                variant="outline"
                className="border-white/20 bg-transparent text-slate-300 hover:bg-white/10 hover:text-white"
              >
                Try guest mode
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          [
            "Structured Test Cases",
            "Generate QA-ready scenarios with priority, steps, data and expected outcomes."
          ],
          [
            "Human Review Workflow",
            "Every generated item starts pending and can be edited, accepted, or rejected."
          ],
          [
            "Source Traceability",
            "See assumptions, evidence, and risk notes for each generated artifact."
          ],
          [
            "Export-Ready Artifacts",
            "Export accepted results to Markdown, CSV, or plain text as needed."
          ]
        ].map(([title, text]) => (
          <Card key={title}>
            <h3 className="font-semibold text-white">{title}</h3>
            <p className="mt-2 text-sm text-slate-400">{text}</p>
          </Card>
        ))}
      </section>
    </div>
  );
}
