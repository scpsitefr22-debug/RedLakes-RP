-- CreateEnum
CREATE TYPE "FactionRelationStatus" AS ENUM ('ALLIE', 'NEUTRE', 'TENSION', 'HOSTILE');

-- CreateTable
CREATE TABLE "FactionRelation" (
    "id" TEXT NOT NULL,
    "factionAId" TEXT NOT NULL,
    "factionBId" TEXT NOT NULL,
    "status" "FactionRelationStatus" NOT NULL DEFAULT 'NEUTRE',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FactionRelation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FactionRelation_factionAId_idx" ON "FactionRelation"("factionAId");

-- CreateIndex
CREATE INDEX "FactionRelation_factionBId_idx" ON "FactionRelation"("factionBId");

-- CreateIndex
CREATE UNIQUE INDEX "FactionRelation_factionAId_factionBId_key" ON "FactionRelation"("factionAId", "factionBId");

-- AddForeignKey
ALTER TABLE "FactionRelation" ADD CONSTRAINT "FactionRelation_factionAId_fkey" FOREIGN KEY ("factionAId") REFERENCES "Faction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FactionRelation" ADD CONSTRAINT "FactionRelation_factionBId_fkey" FOREIGN KEY ("factionBId") REFERENCES "Faction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
