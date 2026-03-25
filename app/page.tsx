import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-brand-50 to-white p-10 shadow-sm">
        <h1 className="text-4xl font-bold tracking-tight">AI QA Assistant</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Turn requirements into QA-ready test cases, checklists, bug drafts, and API test ideas—then review and export
          with a human-in-the-loop workflow.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/demo">
            <Button>Try Demo</Button>
          </Link>
          <Link href="/register">
            <Button>Create account</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">Try guest mode</Button>
          </Link>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          ["Structured Test Cases", "Generate QA-ready scenarios with priority, steps, data and expected outcomes."],
          ["Human Review Workflow", "Every generated item starts pending and can be edited, accepted, or rejected."],
          ["Source Traceability", "See assumptions, evidence, and risk notes for each generated artifact."],
          ["Export-Ready Artifacts", "Export accepted results to Markdown, CSV, or plain text as needed."]
        ].map(([title, text]) => (
          <Card key={title}>
            <h3 className="font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-slate-600">{text}</p>
          </Card>
        ))}
      </section>
    </div>
  );
}
