-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'GUEST');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('TEST_CASE_SET', 'CHECKLIST', 'BUG_REPORT', 'API_TEST_SET');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('TEXT', 'URL', 'SCREENSHOT', 'PDF', 'MIXED');

-- CreateEnum
CREATE TYPE "DomainType" AS ENUM ('WEB', 'MOBILE', 'API', 'GENERAL');

-- CreateEnum
CREATE TYPE "DetailLevel" AS ENUM ('SHORT', 'NORMAL', 'DETAILED');

-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('TEST_CASE', 'CHECKLIST_ITEM', 'BUG_REPORT', 'API_TEST_IDEA');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "FeatureUsed" AS ENUM ('TEST_CASE_GENERATION', 'CHECKLIST_GENERATION', 'BUG_REPORT_ASSISTANT', 'API_TEST_IDEAS');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "guestSessionId" TEXT,
    "type" "DocumentType" NOT NULL,
    "title" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "sourceType" "SourceType" NOT NULL,
    "sourceText" TEXT,
    "sourceUrl" TEXT,
    "sourceFilePath" TEXT,
    "domainType" "DomainType" NOT NULL DEFAULT 'GENERAL',
    "detailLevel" "DetailLevel" NOT NULL DEFAULT 'NORMAL',
    "outputMarkdown" TEXT,
    "outputJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedItem" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "itemType" "ItemType" NOT NULL,
    "title" TEXT NOT NULL,
    "contentJson" JSONB NOT NULL,
    "contentMarkdown" TEXT,
    "reviewStatus" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "sourceEvidence" TEXT,
    "assumptions" TEXT,
    "riskNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneratedItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequirementLink" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "parentRequirementText" TEXT NOT NULL,
    "linkedArtifactType" TEXT NOT NULL,
    "coverageNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequirementLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsageLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "guestSessionKey" TEXT,
    "featureUsed" "FeatureUsed" NOT NULL,
    "tokensEstimated" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsageLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuestSession" (
    "id" TEXT NOT NULL,
    "sessionKey" TEXT NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuestSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "GuestSession_sessionKey_key" ON "GuestSession"("sessionKey");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_guestSessionId_fkey" FOREIGN KEY ("guestSessionId") REFERENCES "GuestSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedItem" ADD CONSTRAINT "GeneratedItem_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequirementLink" ADD CONSTRAINT "RequirementLink_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageLog" ADD CONSTRAINT "UsageLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
