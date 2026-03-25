import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { DocumentDetailClient } from "@/features/documents/document-detail";
import { getActor } from "@/lib/auth/actor";

type Props = { params: Promise<{ id: string }> };

export default async function DocumentDetailPage({ params }: Props) {
  const { id } = await params;
  const actor = await getActor();
  const doc = await prisma.document.findUnique({
    where: { id },
    include: { generatedItems: { orderBy: { sortOrder: "asc" } }, qualityAnalysis: true }
  });
  if (!doc) return notFound();
  if (actor.kind === "user" && doc.userId !== actor.userId) return notFound();
  if (actor.kind === "guest" && doc.guestSessionId !== actor.guestSessionId) return notFound();
  return (
    <DocumentDetailClient
      documentId={doc.id}
      title={doc.title}
      sourceText={doc.sourceText}
      sourceUrl={doc.sourceUrl}
      actorKind={actor.kind}
      qualityAnalysis={
        doc.qualityAnalysis
          ? {
              id: doc.qualityAnalysis.id,
              overallScore: doc.qualityAnalysis.overallScore,
              strengths: doc.qualityAnalysis.strengths as unknown[],
              weaknesses: doc.qualityAnalysis.weaknesses as unknown[],
              suggestions: doc.qualityAnalysis.suggestions as unknown[],
              explainability: doc.qualityAnalysis.explainability as Record<string, unknown>
            }
          : null
      }
      items={doc.generatedItems.map((i) => ({
        id: i.id,
        title: i.title,
        reviewStatus: i.reviewStatus,
        contentJson: i.contentJson as Record<string, unknown>,
        itemType: i.itemType,
        sourceEvidence: i.sourceEvidence,
        assumptions: i.assumptions,
        riskNotes: i.riskNotes
      }))}
    />
  );
}
