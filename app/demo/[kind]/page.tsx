import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { DocumentDetailClient } from "@/features/documents/document-detail";
import { DocumentType } from "@prisma/client";

type Props = { params: Promise<{ kind: string }> };

const demoProjectId = "demo_project_1";

const kindToDocType: Record<string, DocumentType> = {
  "test-cases": DocumentType.TEST_CASE_SET,
  checklist: DocumentType.CHECKLIST,
  "bug-report": DocumentType.BUG_REPORT,
  "api-ideas": DocumentType.API_TEST_SET
};

export default async function DemoDocumentPage({ params }: Props) {
  const { kind } = await params;
  const type = kindToDocType[kind];
  if (!type) return notFound();

  const doc = await prisma.document.findFirst({
    where: { isDemo: true, demoProjectId, type },
    include: { generatedItems: { orderBy: { sortOrder: "asc" } }, qualityAnalysis: true }
  });

  if (!doc) return notFound();

  return (
    <DocumentDetailClient
      documentId={doc.id}
      title={doc.title}
      sourceText={doc.sourceText}
      sourceUrl={doc.sourceUrl}
      actorKind="guest"
      readOnly={true}
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
        sourceEvidence: i.sourceEvidence,
        assumptions: i.assumptions,
        riskNotes: i.riskNotes,
        itemType: i.itemType
      }))}
    />
  );
}
