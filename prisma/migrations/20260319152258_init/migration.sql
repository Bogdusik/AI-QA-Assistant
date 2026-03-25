-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "demoProjectId" TEXT,
ADD COLUMN     "isDemo" BOOLEAN NOT NULL DEFAULT false;
