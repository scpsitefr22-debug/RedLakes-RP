-- AlterTable
ALTER TABLE "GameEvent" ADD COLUMN     "factionId" TEXT;

-- CreateIndex
CREATE INDEX "GameEvent_factionId_idx" ON "GameEvent"("factionId");

-- AddForeignKey
ALTER TABLE "GameEvent" ADD CONSTRAINT "GameEvent_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
