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
      <div className="border-b border-white/10 p-6">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {titleLabel}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          Provide clear input and optional context. The generator returns reviewable output you can
          accept, reject, or improve.
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-5 space-y-4 px-6 pb-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm text-slate-300">
            <span className="block font-medium">Document title</span>
            <Input
              id="doc-title"
              placeholder="Document title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>
          <label className="space-y-1 text-sm text-slate-300">
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
          <label className="text-sm text-slate-300">
            <span className="mb-2 block font-medium">Screenshot upload (optional)</span>
            <input
              id="source-screenshot"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="text-sm text-slate-400 file:mr-3 file:cursor-pointer file:rounded-md file:border file:border-white/10 file:bg-slate-800 file:px-3 file:py-1.5 file:text-sm file:text-slate-300 file:transition-colors file:hover:bg-slate-700 file:hover:text-white"
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
              <span className="mt-1 block text-xs text-slate-500">Uploaded: {screenshotName}</span>
            )}
          </label>
          <label className="text-sm text-slate-300">
            <span className="mb-2 block font-medium">PDF upload (optional)</span>
            <input
              id="source-pdf"
              type="file"
              accept="application/pdf"
              className="text-sm text-slate-400 file:mr-3 file:cursor-pointer file:rounded-md file:border file:border-white/10 file:bg-slate-800 file:px-3 file:py-1.5 file:text-sm file:text-slate-300 file:transition-colors file:hover:bg-slate-700 file:hover:text-white"
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
              <span className="mt-1 block text-xs text-slate-500">Uploaded: {pdfName}</span>
            )}
          </label>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300" htmlFor="source-text">
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
          <p className="mt-1 text-xs text-slate-500">{sourceText.length} characters</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm text-slate-300">
            <span className="block font-medium">Domain</span>
            <select
              id="domain-type"
              className="w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 hover:border-white/20"
              value={domainType}
              onChange={(e) => setDomainType(e.target.value)}
            >
              <option value="WEB">Web</option>
              <option value="MOBILE">Mobile</option>
              <option value="API">API</option>
              <option value="GENERAL">General</option>
            </select>
            <p className="text-xs text-slate-500">Helps AI tailor scenarios to your environment.</p>
          </label>
          <label className="space-y-1 text-sm text-slate-300">
            <span className="block font-medium">Detail level</span>
            <select
              id="detail-level"
              className="w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 hover:border-white/20"
              value={detailLevel}
              onChange={(e) => setDetailLevel(e.target.value)}
            >
              <option value="SHORT">Short</option>
              <option value="NORMAL">Normal</option>
              <option value="DETAILED">Detailed</option>
            </select>
            <p className="text-xs text-slate-500">Choose how deep the generator should go.</p>
          </label>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300" htmlFor="extra-payload">
            Structured extra context (JSON)
          </label>
          <Textarea
            id="extra-payload"
            className="font-mono text-slate-300"
            value={extraPayload}
            onChange={(e) => setExtraPayload(e.target.value)}
            rows={6}
            placeholder={payloadHint}
          />
          <p className="mt-1 text-xs text-slate-500">
            Tip: use this for acceptance criteria, edge cases, constraints, or sample inputs.
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-400" role="status" aria-live="polite">
            {error}
          </p>
        )}

        {loading ? (
          <div className="relative inline-flex h-10 w-40 select-none items-center justify-center overflow-hidden rounded-md bg-indigo-500 text-sm font-medium text-white">
            <span className="relative z-10">Generating…</span>
            <div className="shimmer-overlay" />
          </div>
        ) : (
          <Button
            type="submit"
            className="w-full border-indigo-500 bg-indigo-500 text-white hover:bg-indigo-600 sm:w-auto"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Generate
          </Button>
        )}
      </form>
    </Card>
  );
}
