-- AlterTable
ALTER TABLE "ClassifiedDocument" ADD COLUMN     "minClearanceLevel" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "ClassifiedDocumentRevision" ADD COLUMN     "minClearanceLevel" INTEGER NOT NULL DEFAULT 1;
