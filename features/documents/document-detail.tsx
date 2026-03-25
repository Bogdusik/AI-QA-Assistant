"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Sparkles, ThumbsUp, ThumbsDown, Zap, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

type Item = {
  id: string;
  title: string;
  reviewStatus: "PENDING" | "ACCEPTED" | "REJECTED";
  contentJson: Record<string, unknown>;
  itemType: "TEST_CASE" | "CHECKLIST_ITEM" | "BUG_REPORT" | "API_TEST_IDEA";
  sourceEvidence?: string | null;
  assumptions?: string | null;
  riskNotes?: string | null;
};

export function DocumentDetailClient({
  documentId,
  title,
  sourceText,
  sourceUrl,
  actorKind,
  qualityAnalysis,
  readOnly = false,
  items
}: {
  documentId: string;
  title: string;
  sourceText?: string | null;
  sourceUrl?: string | null;
  actorKind: "user" | "guest";
  qualityAnalysis: {
    id: string;
    overallScore: number;
    strengths: unknown[];
    weaknesses: unknown[];
    suggestions: unknown[];
    explainability: Record<string, unknown>;
  } | null;
  readOnly?: boolean;
  items: Item[];
}) {
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "ACCEPTED" | "REJECTED">("ALL");
  const [clientError, setClientError] = useState("");
  const [analysis, setAnalysis] = useState(qualityAnalysis);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [improveLoadingId, setImproveLoadingId] = useState<string | null>(null);
  const [improveDraft, setImproveDraft] = useState<null | {
    itemId: string;
    oldTitle: string;
    newTitle: string;
    oldContentJson: Record<string, unknown>;
    newContentJson: Record<string, unknown>;
  }>(null);
  const filtered = useMemo(
    () => items.filter((i) => statusFilter === "ALL" || i.reviewStatus === statusFilter),
    [items, statusFilter]
  );

  async function updateStatus(itemId: string, reviewStatus: Item["reviewStatus"]) {
    setClientError("");
    const res = await fetch(`/api/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewStatus })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setClientError(data.error || "Could not update item status.");
      return;
    }
    location.reload();
  }

  async function saveContent(itemId: string, titleText: string, contentJson: Record<string, unknown>) {
    setClientError("");
    const res = await fetch(`/api/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: titleText, contentJson })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setClientError(data.error || "Could not save edits.");
      return;
    }
    location.reload();
  }

  async function bulk(reviewStatus: Item["reviewStatus"]) {
    setClientError("");
    const res = await fetch(`/api/documents/${documentId}/bulk-review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewStatus })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setClientError(data.error || "Bulk review update failed.");
      return;
    }
    location.reload();
  }

  async function runAnalysis() {
    setClientError("");
    setAnalysisLoading(true);
    try {
      const res = await fetch(`/api/documents/${documentId}/quality-analysis`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not run quality analysis.");
      setAnalysis(data.analysis);
    } catch (e) {
      setClientError(e instanceof Error ? e.message : "Could not run quality analysis.");
    } finally {
      setAnalysisLoading(false);
    }
  }

  async function requestImprove(item: Item) {
    setClientError("");
    setImproveDraft(null);
    setImproveLoadingId(item.id);
    try {
      const res = await fetch(`/api/items/${item.id}/improve`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "AI improvement failed.");
      setImproveDraft({
        itemId: item.id,
        oldTitle: item.title,
        newTitle: data.improvedTitle ?? item.title,
        oldContentJson: item.contentJson,
        newContentJson: data.improvedContentJson
      });
    } catch (e) {
      setClientError(e instanceof Error ? e.message : "AI improvement failed.");
    } finally {
      setImproveLoadingId(null);
    }
  }

  async function applyImprove() {
    if (!improveDraft) return;
    setClientError("");
    const res = await fetch(`/api/items/${improveDraft.itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: improveDraft.newTitle,
        contentJson: improveDraft.newContentJson,
        reviewStatus: "PENDING"
      })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setClientError(data.error || "Could not apply improvements.");
      return;
    }
    location.reload();
  }

  const coverage = useMemo(() => {
    const total = items.length;
    const accepted = items.filter((i) => i.reviewStatus === "ACCEPTED");
    const pending = items.filter((i) => i.reviewStatus === "PENDING");
    const rejected = items.filter((i) => i.reviewStatus === "REJECTED");

    const acceptedCount = accepted.length;
    const diversity = new Set(accepted.map((i) => i.itemType)).size;
    const diversityScore = Math.min(diversity, 4) / 4;
    const acceptedScore = Math.min(acceptedCount, 5) / 5;

    const score = Math.round(acceptedScore * 70 + diversityScore * 30);

    let status: "Well covered" | "Partially covered" | "Poorly covered";
    if (acceptedCount === 0) status = "Poorly covered";
    else if (score >= 75) status = "Well covered";
    else if (score >= 45) status = "Partially covered";
    else status = "Poorly covered";

    const explanation: string[] = [];
    if (acceptedCount === 0) {
      explanation.push("No accepted artifacts are available yet, so coverage cannot be considered strong.");
    } else {
      explanation.push(`Accepted artifacts: ${acceptedCount}. Artifact type diversity: ${diversity}.`);
      if (acceptedCount < 2) explanation.push("Add more accepted artifacts to strengthen coverage.");
      if (diversity < 2) explanation.push("Add accepted artifacts from more than one artifact type (e.g., test cases + checklist).");
      if (status === "Well covered") explanation.push("Coverage is strong because there are enough accepted artifacts and multiple artifact types contribute.");
      if (status === "Partially covered") explanation.push("Coverage is moderate; you can improve it by accepting more items and increasing type diversity.");
      if (status === "Poorly covered" && acceptedCount > 0) explanation.push("Coverage is weak; focus on accepting additional items and covering more scenarios.");
    }

    return {
      total,
      accepted,
      pending,
      rejected,
      acceptedCount,
      diversity,
      score,
      status,
      explanation
    };
  }, [items]);

  return (
    <div className="space-y-4">
      {readOnly ? (
        <Card className="border-semantic-warning-100 bg-semantic-warning-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-semantic-warning-700" />
            <p className="text-sm text-slate-900">
              <strong>Demo Project</strong> is read-only. You can review, analyze, and export examples, but you cannot edit or regenerate them.
            </p>
          </div>
        </Card>
      ) : actorKind === "guest" ? (
        <Card className="border-semantic-warning-100 bg-semantic-warning-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-semantic-warning-700" />
            <p className="text-sm text-slate-900">
              You are in guest mode. Create an account to remove usage limits and keep your work beyond this session.
            </p>
          </div>
        </Card>
      ) : null}
      <div className="lg:grid lg:grid-cols-12 lg:gap-6">
        <div className="space-y-4 lg:col-span-7">
          <Card>
            <div className="flex flex-wrap items-center gap-2">
              {["ALL", "PENDING", "ACCEPTED", "REJECTED"].map((s) => (
                <Button
                  key={s}
                  variant={statusFilter === s ? "default" : "outline"}
                  onClick={() => setStatusFilter(s as never)}
                >
                  {s}
                </Button>
              ))}
              {!readOnly && (
                <>
                  <Button className="ml-auto" onClick={() => bulk("ACCEPTED")}>
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    Accept all
                  </Button>
                  <Button variant="destructive" onClick={() => bulk("REJECTED")}>
                    <ThumbsDown className="mr-2 h-4 w-4" />
                    Reject all
                  </Button>
                </>
              )}
              <a href={`/api/documents/${documentId}/export?format=md`}>
                <Button variant="outline">Export Markdown</Button>
              </a>
            </div>
            {clientError && <p className="mt-3 text-sm text-red-600">{clientError}</p>}
          </Card>

          {filtered.length === 0 ? (
            <Card className="border-dashed">
              <div className="space-y-1">
                <p className="text-sm font-medium">No items match this filter.</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Try switching to <strong>ALL</strong> or accept more artifacts to unlock stronger coverage.
                </p>
              </div>
            </Card>
          ) : (
            filtered.map((item) => (
              <Card key={item.id} className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.itemType}</p>
                  </div>
                  <Badge
                    tone={
                      item.reviewStatus === "PENDING"
                        ? "pending"
                        : item.reviewStatus === "ACCEPTED"
                          ? "accepted"
                          : "rejected"
                    }
                  >
                    {item.reviewStatus === "PENDING" ? (
                      <span className="inline-flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" />
                        Pending
                      </span>
                    ) : item.reviewStatus === "ACCEPTED" ? (
                      <span className="inline-flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Accepted
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <XCircle className="h-3.5 w-3.5" />
                        Rejected
                      </span>
                    )}
                  </Badge>
                </div>

                <Textarea
                  defaultValue={JSON.stringify(item.contentJson, null, 2)}
                  rows={10}
                  id={`item-${item.id}`}
                  disabled={readOnly}
                  className="font-mono text-xs"
                />

                {!readOnly && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => {
                        setClientError("");
                        const el = document.getElementById(`item-${item.id}`) as HTMLTextAreaElement | null;
                        if (!el) {
                          setClientError("Edit box not found.");
                          return;
                        }
                        try {
                          const parsed = JSON.parse(el.value) as Record<string, unknown>;
                          void saveContent(item.id, item.title, parsed);
                        } catch {
                          setClientError("Edits must be valid JSON.");
                        }
                      }}
                      variant="outline"
                    >
                      Save edit
                    </Button>
                    <Button onClick={() => updateStatus(item.id, "ACCEPTED")}>
                      <Zap className="mr-2 h-4 w-4" />
                      Accept
                    </Button>
                    <Button variant="destructive" onClick={() => updateStatus(item.id, "REJECTED")}>
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => void requestImprove(item)}
                      disabled={improveLoadingId === item.id}
                      className="border-brand-200 bg-brand-50/30 text-brand-700 hover:bg-brand-50"
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      {improveLoadingId === item.id ? "Improving..." : "Improve with AI"}
                    </Button>
                  </div>
                )}

                {improveDraft?.itemId === item.id && (
                  <Card className="space-y-3 border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">AI improvement preview</p>
                      <Button variant="outline" onClick={() => setImproveDraft(null)}>
                        Cancel
                      </Button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Old</p>
                        <pre className="max-h-64 overflow-auto rounded bg-white p-2 text-[11px]">
                          {JSON.stringify(improveDraft.oldContentJson, null, 2)}
                        </pre>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-300">AI New</p>
                        <pre className="max-h-64 overflow-auto rounded bg-white p-2 text-[11px]">
                          {JSON.stringify(improveDraft.newContentJson, null, 2)}
                        </pre>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={() => void applyImprove()}>Apply improvements</Button>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Applying improvements resets review status to <strong>PENDING</strong> so you can re-approve the updated artifact.
                    </p>
                  </Card>
                )}

                <details className="rounded-lg border border-slate-200 p-3 text-sm">
                  <summary className="cursor-pointer font-medium">Why this was generated</summary>
                  <div className="mt-2 space-y-1">
                    <p>
                      <strong>Evidence:</strong> {item.sourceEvidence || "N/A"}
                    </p>
                    <p>
                      <strong>Assumptions:</strong> {item.assumptions || "N/A"}
                    </p>
                    <p>
                      <strong>Risk note:</strong> {item.riskNotes || "N/A"}
                    </p>
                  </div>
                </details>
              </Card>
            ))
          )}
        </div>

        <div className="space-y-4 lg:col-span-5">
          <Card className="overflow-hidden">
            <div className="rounded-xl bg-gradient-to-r from-brand-50 via-white to-white p-5">
              <h1 className="qa-h1">{title}</h1>
              <p className="mt-2 qa-body">Source URL: {sourceUrl || "Not provided"}</p>
              {sourceText ? (
                <p className="mt-1 whitespace-pre-wrap qa-body">{sourceText}</p>
              ) : (
                <p className="mt-1 qa-body">No source text provided.</p>
              )}
            </div>
          </Card>

          <Card className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="qa-h2">Coverage</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Requirement: {sourceText ? "from your input" : "from document title / linked requirement"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Status</p>
                <p className="mt-1 text-sm font-medium">
                  <span
                    className={
                      coverage.status === "Well covered"
                        ? "text-semantic-success-700"
                        : coverage.status === "Partially covered"
                          ? "text-semantic-warning-700"
                          : "text-semantic-danger-700"
                    }
                  >
                    {coverage.status}
                  </span>{" "}
                  <span className="text-slate-500 dark:text-slate-400">(score {coverage.score}/100)</span>
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Coverage strength</p>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-200">{coverage.score}%</p>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className={
                    coverage.status === "Well covered"
                      ? "h-full bg-semantic-success-700"
                      : coverage.status === "Partially covered"
                        ? "h-full bg-semantic-warning-700"
                        : "h-full bg-semantic-danger-700"
                  }
                  style={{ width: `${coverage.score}%` }}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:bg-slate-900 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">Total items</p>
                <p className="text-lg font-semibold">{coverage.total}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:bg-slate-900 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">Accepted</p>
                <p
                  className={
                    "text-lg font-semibold " +
                    (coverage.acceptedCount === 0
                      ? "text-slate-700 dark:text-slate-200"
                      : "text-semantic-success-700")
                  }
                >
                  {coverage.acceptedCount}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:bg-slate-900 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">Pending</p>
                <p className="text-lg font-semibold text-semantic-warning-700">{coverage.pending.length}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Why it is strong or weak</p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-200">
                {coverage.explanation.map((line, idx) => (
                  <li key={`cov-exp-${idx}`}>{line}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Accepted artifacts contributing to coverage</p>
              {coverage.accepted.length === 0 ? (
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  No accepted items yet. Accept items to improve coverage.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {coverage.accepted.map((i) => (
                    <span
                      key={i.id}
                      className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 dark:bg-white dark:text-slate-900"
                    >
                      {i.title} <span className="text-slate-500 dark:text-slate-400">({i.itemType})</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card className="space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="qa-h2">Quality Analyzer</h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  AI insight panel for clarity and coverage.
                </p>
              </div>
              <div className="flex gap-2">
                {!readOnly && (
                  <Button variant="outline" onClick={runAnalysis} disabled={analysisLoading}>
                    {analysisLoading ? "Analyzing..." : analysis ? "Regenerate analysis" : "Analyze Quality"}
                  </Button>
                )}
                <Button
                  variant="outline"
                  disabled={!analysis}
                  onClick={() => {
                    if (!analysis) return;
                    const text = (analysis.suggestions as string[]).join("\n");
                    void navigator.clipboard.writeText(text);
                  }}
                >
                  Copy suggestions
                </Button>
              </div>
            </div>

            {!analysis ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white/50 p-4 dark:border-slate-200 dark:bg-white/60">
                <div className="space-y-1">
                  <p className="text-sm font-medium">No quality analysis yet</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Analyze accepted items to get a score plus strengths, weaknesses, and improvement suggestions.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-50 ring-1 ring-brand-100">
                    <div className="text-center">
                      <p className="text-xs font-medium text-brand-700">Score</p>
                      <p className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
                        {analysis.overallScore}/100
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs ring-1 ring-slate-200 dark:bg-white dark:ring-slate-200">
                        <Sparkles className="h-4 w-4 text-brand-700" />
                        AI insight summary
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {analysis.overallScore >= 80
                        ? "Strong structure and signal."
                        : analysis.overallScore >= 50
                          ? "Good baseline; tighten missing scenarios."
                          : "Needs review for completeness and clarity."}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-200 dark:bg-white">
                    <p className="flex items-center gap-2 text-sm font-semibold">
                      <CheckCircle2 className="h-4 w-4 text-semantic-success-700" />
                      Strengths
                    </p>
                    <ul className="mt-2 space-y-1 list-disc pl-5">
                      {(analysis.strengths as string[]).map((s, i) => (
                        <li key={`str-${i}`}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-200 dark:bg-white">
                    <p className="flex items-center gap-2 text-sm font-semibold">
                      <AlertTriangle className="h-4 w-4 text-semantic-warning-700" />
                      Weaknesses
                    </p>
                    <ul className="mt-2 space-y-1 list-disc pl-5">
                      {(analysis.weaknesses as string[]).map((s, i) => (
                        <li key={`wk-${i}`}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-200 dark:bg-white">
                    <p className="flex items-center gap-2 text-sm font-semibold">
                      <Zap className="h-4 w-4 text-brand-700" />
                      Suggestions
                    </p>
                    <ul className="mt-2 space-y-1 list-disc pl-5">
                      {(analysis.suggestions as string[]).map((s, i) => (
                        <li key={`sg-${i}`}>{s}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <details className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                  <summary className="cursor-pointer font-medium">Explainability</summary>
                  <div className="mt-3 space-y-3">
                    <div>
                      <p className="text-sm font-medium">Why score was given</p>
                      <ul className="mt-2 list-disc space-y-1 pl-5">
                        {((analysis.explainability.whyScoreGiven as string[]) ?? []).map((line, i) => (
                          <li key={`ws-${i}`}>{line}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-medium">What is missing</p>
                      <ul className="mt-2 list-disc space-y-1 pl-5">
                        {((analysis.explainability.whatIsMissing as string[]) ?? []).map((line, i) => (
                          <li key={`wm-${i}`}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </details>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
