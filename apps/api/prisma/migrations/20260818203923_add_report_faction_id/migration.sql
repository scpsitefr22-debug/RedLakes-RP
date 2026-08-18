-- AlterTable
ALTER TABLE "PersonnelReport" ADD COLUMN     "factionId" TEXT;

-- CreateIndex
CREATE INDEX "PersonnelReport_factionId_idx" ON "PersonnelReport"("factionId");

-- AddForeignKey
ALTER TABLE "PersonnelReport" ADD CONSTRAINT "PersonnelReport_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

