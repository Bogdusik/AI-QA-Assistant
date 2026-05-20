import { prisma } from "@/lib/db/prisma";
import { getActor } from "@/lib/auth/actor";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const actor = await getActor();
  const where =
    actor.kind === "user" ? { userId: actor.userId } : { guestSessionId: actor.guestSessionId };

  const [docs, totalCount, typeCounts, reviewCounts] = await Promise.all([
    prisma.document.findMany({
      where,
      select: { id: true, title: true, type: true, status: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 8
    }),
    prisma.document.count({ where }),
    prisma.document.groupBy({ by: ["type"], where, _count: { _all: true } }),
    prisma.generatedItem.groupBy({
      by: ["reviewStatus"],
      where: { document: where },
      _count: { _all: true }
    })
  ]);

  const typeCountMap = Object.fromEntries(typeCounts.map((r) => [r.type, r._count._all]));
  const reviewCountMap = Object.fromEntries(
    reviewCounts.map((r) => [r.reviewStatus, r._count._all])
  );

  return (
    <DashboardClient
      total={totalCount}
      byType={{
        TEST_CASE_SET: typeCountMap["TEST_CASE_SET"] ?? 0,
        CHECKLIST: typeCountMap["CHECKLIST"] ?? 0,
        BUG_REPORT: typeCountMap["BUG_REPORT"] ?? 0,
        API_TEST_SET: typeCountMap["API_TEST_SET"] ?? 0
      }}
      byReview={{
        PENDING: reviewCountMap["PENDING"] ?? 0,
        ACCEPTED: reviewCountMap["ACCEPTED"] ?? 0,
        REJECTED: reviewCountMap["REJECTED"] ?? 0
      }}
      recentDocs={docs}
    />
  );
}
