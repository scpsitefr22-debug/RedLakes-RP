-- CreateEnum
CREATE TYPE "IncidentThreatClass" AS ENUM ('Safe', 'Euclid', 'Keter', 'Thaumiel', 'Apollyon');

-- CreateTable
CREATE TABLE "IncidentReport" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "incidentAt" TIMESTAMP(3) NOT NULL,
    "anomalyLabel" TEXT NOT NULL,
    "threatClass" "IncidentThreatClass" NOT NULL DEFAULT 'Euclid',
    "factsTag" TEXT,
    "narrative" TEXT NOT NULL,
    "personnelRows" JSONB NOT NULL DEFAULT '[]',
    "equipmentRows" JSONB NOT NULL DEFAULT '[]',
    "totalCost" INTEGER NOT NULL DEFAULT 0,
    "authorLabel" TEXT NOT NULL,
    "authorRole" TEXT,
    "validatorLabel" TEXT,
    "validatorRole" TEXT,
    "restrictedDepartmentIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "minClearanceLevel" INTEGER NOT NULL DEFAULT 1,
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IncidentReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IncidentReport_slug_key" ON "IncidentReport"("slug");

-- CreateIndex
CREATE INDEX "IncidentReport_incidentAt_idx" ON "IncidentReport"("incidentAt");

-- AddForeignKey
ALTER TABLE "IncidentReport" ADD CONSTRAINT "IncidentReport_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
