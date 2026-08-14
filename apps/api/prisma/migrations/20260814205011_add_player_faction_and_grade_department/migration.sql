-- AlterTable
ALTER TABLE "Grade" ADD COLUMN     "departmentRefId" TEXT;

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "factionId" TEXT;

-- CreateIndex
CREATE INDEX "Grade_departmentRefId_idx" ON "Grade"("departmentRefId");

-- CreateIndex
CREATE INDEX "Player_factionId_idx" ON "Player"("factionId");

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_departmentRefId_fkey" FOREIGN KEY ("departmentRefId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
