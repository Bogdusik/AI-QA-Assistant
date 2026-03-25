-- CreateTable
CREATE TABLE "QualityAnalysis" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "strengths" JSONB NOT NULL,
    "weaknesses" JSONB NOT NULL,
    "suggestions" JSONB NOT NULL,
    "explainability" JSONB NOT NULL,
    "analysisJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QualityAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QualityAnalysis_documentId_key" ON "QualityAnalysis"("documentId");

-- AddForeignKey
ALTER TABLE "QualityAnalysis" ADD CONSTRAINT "QualityAnalysis_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
