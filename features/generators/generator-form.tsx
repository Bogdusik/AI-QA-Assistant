"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles } from "lucide-react";

type Kind = "TEST_CASE_SET" | "CHECKLIST" | "BUG_REPORT" | "API_TEST_SET";

export function GeneratorForm({
  kind,
  titleLabel,
  sourceLabel,
  payloadHint
}: {
  kind: Kind;
  titleLabel: string;
  sourceLabel: string;
  payloadHint: string;
}) {
  const [title, setTitle] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [domainType, setDomainType] = useState("GENERAL");
  const [detailLevel, setDetailLevel] = useState("NORMAL");
  const [extraPayload, setExtraPayload] = useState("{}");
  const [screenshotName, setScreenshotName] = useState("");
  const [pdfName, setPdfName] = useState("");
  const [sourceFilePath, setSourceFilePath] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let payload: unknown;
      try {
        payload = JSON.parse(extraPayload || "{}");
      } catch {
        throw new Error("Structured extra context must be valid JSON.");
      }
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: kind,
          title,
          sourceText,
          sourceUrl,
          sourceFilePath,
          domainType,
          detailLevel,
          payload
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed.");
      router.push(`/documents/${data.documentId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid input");
    } finally {
      setLoading(false);
    }
  }

  async function upload(file: File, mode: "image" | "pdf") {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("mode", mode);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    setSourceFilePath(data.filePath);
    if (mode === "image") setScreenshotName(data.originalName);
    if (mode === "pdf") {
      setPdfName(data.originalName);
      if (data.extractedText && !sourceText) setSourceText(data.extractedText);
    }
  }

  return (
    <Card className="max-w-5xl overflow-hidden">
      <div className="rounded-2xl bg-gradient-to-r from-brand-50 via-white to-white p-6">
        <h1 className="qa-h1">{titleLabel}</h1>
        <p className="qa-body mt-2">
          Provide clear input and optional context. The generator returns reviewable output you can
          accept, reject, or improve.
        </p>
      </div>
      <form onSubmit={onSubmit} className="mt-5 px-6 pb-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm text-slate-900 dark:text-slate-900">
            <span className="block font-medium">Document title</span>
            <Input
              id="doc-title"
              placeholder="Document title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>
          <label className="space-y-1 text-sm text-slate-900 dark:text-slate-900">
            <span className="block font-medium">Optional URL</span>
            <Input
              id="source-url"
              placeholder="Optional URL"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
            />
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-slate-900 dark:text-slate-900">
            <span className="mb-1 block font-medium">Screenshot upload (optional)</span>
            <input
              id="source-screenshot"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  await upload(file, "image");
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Upload failed");
                }
              }}
            />
            {screenshotName && (
              <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                Uploaded: {screenshotName}
              </span>
            )}
          </label>
          <label className="text-sm text-slate-900 dark:text-slate-900">
            <span className="mb-1 block font-medium">PDF upload (optional)</span>
            <input
              id="source-pdf"
              type="file"
              accept="application/pdf"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  await upload(file, "pdf");
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Upload failed");
                }
              }}
            />
            {pdfName && (
              <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                Uploaded: {pdfName}
              </span>
            )}
          </label>
        </div>
        <div>
          <label
            className="mb-1 block text-sm font-medium text-slate-900 dark:text-slate-900"
            htmlFor="source-text"
          >
            {sourceLabel}
          </label>
          <Textarea
            id="source-text"
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            rows={8}
            required
            placeholder="Paste requirement, feature details, or bug information..."
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {sourceText.length} characters
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm text-slate-900 dark:text-slate-900">
            <span className="block font-medium">Domain</span>
            <select
              id="domain-type"
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 hover:border-brand-500/50 dark:border-slate-200 dark:bg-white dark:focus:border-brand-500 dark:hover:border-brand-500/60"
              value={domainType}
              onChange={(e) => setDomainType(e.target.value)}
            >
              <option value="WEB">Web</option>
              <option value="MOBILE">Mobile</option>
              <option value="API">API</option>
              <option value="GENERAL">General</option>
            </select>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Helps AI tailor scenarios to your environment.
            </p>
          </label>
          <label className="space-y-1 text-sm text-slate-900 dark:text-slate-900">
            <span className="block font-medium">Detail level</span>
            <select
              id="detail-level"
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 hover:border-brand-500/50 dark:border-slate-200 dark:bg-white dark:focus:border-brand-500 dark:hover:border-brand-500/60"
              value={detailLevel}
              onChange={(e) => setDetailLevel(e.target.value)}
            >
              <option value="SHORT">Short</option>
              <option value="NORMAL">Normal</option>
              <option value="DETAILED">Detailed</option>
            </select>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Choose how deep the generator should go.
            </p>
          </label>
        </div>
        <div>
          <label
            className="mb-1 block text-sm font-medium text-slate-900 dark:text-slate-900"
            htmlFor="extra-payload"
          >
            Structured extra context (JSON)
          </label>
          <Textarea
            id="extra-payload"
            value={extraPayload}
            onChange={(e) => setExtraPayload(e.target.value)}
            rows={6}
            placeholder={payloadHint}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Tip: use this for acceptance criteria, edge cases, constraints, or sample inputs.
          </p>
        </div>
        {error && (
          <p className="text-sm text-red-600" role="status" aria-live="polite">
            {error}
          </p>
        )}
        {loading ? (
          <div className="relative inline-flex h-10 w-40 select-none items-center justify-center overflow-hidden rounded-md bg-brand-500 text-sm font-medium text-white">
            <span className="relative z-10">Generating…</span>
            <div className="shimmer-overlay" />
          </div>
        ) : (
          <Button type="submit" className="w-full sm:w-auto">
            <Sparkles className="mr-2 h-4 w-4" />
            Generate
          </Button>
        )}
      </form>
    </Card>
  );
}
