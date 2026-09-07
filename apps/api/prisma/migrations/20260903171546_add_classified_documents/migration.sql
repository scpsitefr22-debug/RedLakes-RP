-- CreateEnum
CREATE TYPE "ClassifiedDocumentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "ClassifiedDocument" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "status" "ClassifiedDocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "restrictedDepartmentIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "factionId" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "authorId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassifiedDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassifiedDocumentRevision" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "status" "ClassifiedDocumentStatus" NOT NULL,
    "restrictedDepartmentIds" TEXT[],
    "factionId" TEXT,
    "tags" TEXT[],
    "attachments" TEXT[],
    "editedById" TEXT,
    "editedByLabel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassifiedDocumentRevision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClassifiedDocument_slug_key" ON "ClassifiedDocument"("slug");

-- CreateIndex
CREATE INDEX "ClassifiedDocument_status_idx" ON "ClassifiedDocument"("status");

-- CreateIndex
CREATE INDEX "ClassifiedDocument_factionId_idx" ON "ClassifiedDocument"("factionId");

-- CreateIndex
CREATE INDEX "ClassifiedDocumentRevision_documentId_idx" ON "ClassifiedDocumentRevision"("documentId");

-- AddForeignKey
ALTER TABLE "ClassifiedDocument" ADD CONSTRAINT "ClassifiedDocument_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassifiedDocument" ADD CONSTRAINT "ClassifiedDocument_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassifiedDocumentRevision" ADD CONSTRAINT "ClassifiedDocumentRevision_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "ClassifiedDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassifiedDocumentRevision" ADD CONSTRAINT "ClassifiedDocumentRevision_editedById_fkey" FOREIGN KEY ("editedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
