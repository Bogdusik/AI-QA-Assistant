"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, FileSearch } from "lucide-react";

type Doc = {
  id: string;
  title: string;
  type: string;
  status: string;
  createdAt: string;
};

const SELECT_CLASS =
  "rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 hover:border-white/20";

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [q, setQ] = useState("");
  const [type, setType] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ q, type, status });
    try {
      const res = await fetch(`/api/documents?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load documents.");
      setDocs(data.documents ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load documents.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Saved Documents
          </h1>
          <p className="text-sm leading-relaxed text-slate-400">
            Review, export, and manage generated QA artifacts.
          </p>
        </div>
      </div>

      <Card>
        <div className="grid gap-3 md:grid-cols-4">
          <Input
            aria-label="Search documents by title"
            placeholder="Search title..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            aria-label="Filter by document type"
            className={SELECT_CLASS}
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="ALL">All types</option>
            <option value="TEST_CASE_SET">Test cases</option>
            <option value="CHECKLIST">Checklist</option>
            <option value="BUG_REPORT">Bug report</option>
            <option value="API_TEST_SET">API ideas</option>
          </select>
          <select
            aria-label="Filter by review status"
            className={SELECT_CLASS}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="ALL">All status</option>
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <Button
            className="border-indigo-500 bg-indigo-500 text-white hover:bg-indigo-600"
            onClick={load}
            disabled={loading}
          >
            {loading ? "Loading..." : "Apply filters"}
          </Button>
        </div>
        {error && (
          <p className="mt-3 text-sm text-red-400" role="status" aria-live="polite">
            {error}
          </p>
        )}
      </Card>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Card key={idx} className="animate-pulse">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-2">
                  <div className="h-4 w-64 rounded bg-slate-700" />
                  <div className="h-3 w-48 rounded bg-slate-700" />
                </div>
                <div className="flex gap-2">
                  <div className="h-9 w-24 rounded bg-slate-700" />
                  <div className="h-9 w-24 rounded bg-slate-700" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : docs.length === 0 ? (
        <Card className="border-dashed">
          <div className="flex items-start gap-3">
            <FileSearch className="mt-0.5 h-5 w-5 text-indigo-400" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-white">No documents yet</p>
              <p className="text-sm text-slate-400">
                Generate your first QA artifact and it will appear here for review and export.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/generate/test-cases">
                  <Button className="border-indigo-500 bg-indigo-500 text-white hover:bg-indigo-600">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate test cases
                  </Button>
                </Link>
                <Link href="/generate/checklist">
                  <Button className="border border-white/20 bg-transparent text-white hover:bg-white/10 hover:border-white/40">
                    Generate checklist
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        docs.map((doc) => (
          <Card key={doc.id} className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-medium text-white">{doc.title}</p>
              <p className="text-sm text-slate-500">
                {doc.type} • {new Date(doc.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              <a href={`/api/documents/${doc.id}/export?format=md`}>
                <Button className="border border-white/20 bg-transparent text-white hover:bg-white/10 hover:border-white/40">
                  Export
                </Button>
              </a>
              <Button
                className="border border-white/20 bg-transparent text-white hover:bg-white/10 hover:border-white/40"
                onClick={async () => {
                  setError("");
                  try {
                    const res = await fetch("/api/documents", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ documentId: doc.id })
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || "Could not duplicate document.");
                    if (data.documentId) window.location.href = `/documents/${data.documentId}`;
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Could not duplicate document.");
                  }
                }}
              >
                Duplicate
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  setError("");
                  try {
                    const res = await fetch(`/api/documents/${doc.id}`, { method: "DELETE" });
                    const data = await res.json().catch(() => ({}));
                    if (!res.ok) throw new Error(data.error || "Could not delete document.");
                    load();
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Could not delete document.");
                  }
                }}
              >
                Delete
              </Button>
              <Link href={`/documents/${doc.id}`}>
                <Button className="border-indigo-500 bg-indigo-500 text-white hover:bg-indigo-600">
                  Open
                </Button>
              </Link>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
