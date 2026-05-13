import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { getActor } from "@/lib/auth/actor";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, FileText, Layers, ClipboardCheck, Bug, Braces } from "lucide-react";

export default async function DashboardPage() {
  const actor = await getActor();
  const where = actor.kind === "user" ? { userId: actor.userId } : { guestSessionId: actor.guestSessionId };

  const [docs, totalCount, typeCounts, reviewCounts] = await Promise.all([
    prisma.document.findMany({
      where,
      select: { id: true, title: true, type: true, status: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 8
    }),
    prisma.document.count({ where }),
    prisma.document.groupBy({
      by: ["type"],
      where,
      _count: { _all: true }
    }),
    prisma.generatedItem.groupBy({
      by: ["reviewStatus"],
      where: { document: where },
      _count: { _all: true }
    })
  ]);

  const total = totalCount;
  const typeCountMap = Object.fromEntries(typeCounts.map((r) => [r.type, r._count._all]));
  const byType = {
    TEST_CASE_SET: typeCountMap["TEST_CASE_SET"] ?? 0,
    CHECKLIST: typeCountMap["CHECKLIST"] ?? 0,
    BUG_REPORT: typeCountMap["BUG_REPORT"] ?? 0,
    API_TEST_SET: typeCountMap["API_TEST_SET"] ?? 0
  };
  const reviewCountMap = Object.fromEntries(reviewCounts.map((r) => [r.reviewStatus, r._count._all]));
  const byReview = {
    PENDING: reviewCountMap["PENDING"] ?? 0,
    ACCEPTED: reviewCountMap["ACCEPTED"] ?? 0,
    REJECTED: reviewCountMap["REJECTED"] ?? 0
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-200 dark:bg-white">
        <div className="bg-gradient-to-r from-brand-50 via-white to-white p-6 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold">Welcome back</h1>
              <p className="max-w-2xl qa-body">
                Build QA artifacts faster with reviewable, explainable AI suggestions. Everything starts as <strong>Pending</strong> until you approve.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="pending">
                <span className="inline-flex items-center gap-2">
                  <ClipboardCheck className="h-3.5 w-3.5" />
                  Pending: {byReview.PENDING}
                </span>
              </Badge>
              <Badge tone="accepted">
                <span className="inline-flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5" />
                  Accepted: {byReview.ACCEPTED}
                </span>
              </Badge>
              <Badge tone="rejected">
                <span className="inline-flex items-center gap-2">
                  <Bug className="h-3.5 w-3.5" />
                  Rejected: {byReview.REJECTED}
                </span>
              </Badge>
            </div>
          </div>

          <div className="mt-6">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Quick Actions</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Generate a new QA artifact in seconds.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Link href="/generate/test-cases">
                <Button className="w-full">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate test cases
                </Button>
              </Link>
              <Link href="/generate/checklist">
                <Button variant="secondary" className="w-full">
                  <FileText className="mr-2 h-4 w-4" />
                  Generate checklist
                </Button>
              </Link>
              <Link href="/generate/bug-report">
                <Button variant="secondary" className="w-full">
                  <Bug className="mr-2 h-4 w-4" />
                  Bug report assistant
                </Button>
              </Link>
              <Link href="/generate/api-ideas">
                <Button variant="secondary" className="w-full">
                  <Braces className="mr-2 h-4 w-4" />
                  API ideas
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400">Total documents</p>
          <p className="mt-1 text-2xl font-semibold">{total}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400">Test case sets</p>
          <p className="mt-1 text-2xl font-semibold">{byType.TEST_CASE_SET}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400">Checklists</p>
          <p className="mt-1 text-2xl font-semibold">{byType.CHECKLIST}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400">Bug reports</p>
          <p className="mt-1 text-2xl font-semibold">{byType.BUG_REPORT}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400">API test sets</p>
          <p className="mt-1 text-2xl font-semibold">{byType.API_TEST_SET}</p>
        </Card>
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold">Recent documents</h2>
        </div>
        {docs.length === 0 ? (
          <Card className="border-dashed">
            <p className="text-sm font-medium">No documents yet</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Generate your first QA artifact from the Quick Actions section above.</p>
          </Card>
        ) : (
          docs.map((doc) => (
            <Card key={doc.id} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{doc.title}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{doc.type}</p>
              </div>
              <Link href={`/documents/${doc.id}`}>
                <Button variant="outline">Open</Button>
              </Link>
            </Card>
          ))
        )}
      </section>
    </div>
  );
}
