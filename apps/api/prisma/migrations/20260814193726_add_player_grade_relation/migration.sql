-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "gradeId" TEXT;

-- CreateIndex
CREATE INDEX "Player_gradeId_idx" ON "Player"("gradeId");

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE SET NULL ON UPDATE CASCADE;
