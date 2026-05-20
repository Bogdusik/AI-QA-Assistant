import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const demoDocs = [
  { kind: "test-cases", label: "Test Cases", hint: "Structured positive/negative scenarios" },
  { kind: "checklist", label: "Checklist", hint: "Grouped validation and edge coverage" },
  { kind: "bug-report", label: "Bug Report", hint: "Professional bug report draft" },
  { kind: "api-ideas", label: "API Ideas", hint: "Positive/negative/auth/boundary checks" }
];

export default function DemoLandingPage() {
  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <h1 className="text-2xl font-semibold">Demo Project</h1>
        <p className="text-sm text-slate-600">
          Everything here is read-only. It’s designed so recruiters/interviewers can quickly
          evaluate how AI QA Assistant structures QA artifacts with review workflow and quality
          analysis.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {demoDocs.map((d) => (
          <Link key={d.kind} href={`/demo/${d.kind}`}>
            <Card className="h-full">
              <div className="space-y-2">
                <h2 className="font-semibold">{d.label}</h2>
                <p className="text-sm text-slate-600">{d.hint}</p>
                <Button variant="outline">Open</Button>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
