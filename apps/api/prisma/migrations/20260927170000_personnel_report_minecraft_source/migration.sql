-- AlterTable
ALTER TABLE "PersonnelReport" ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "source" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "PersonnelReport_externalId_key" ON "PersonnelReport"("externalId");

