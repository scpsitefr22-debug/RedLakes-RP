-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "IncidentThreatClass" ADD VALUE 'Observation';
ALTER TYPE "IncidentThreatClass" ADD VALUE 'Restriction';
ALTER TYPE "IncidentThreatClass" ADD VALUE 'ConformiteForcee';
ALTER TYPE "IncidentThreatClass" ADD VALUE 'Defaillance';

-- AlterTable
ALTER TABLE "IncidentReport" ADD COLUMN     "conclusion" TEXT,
ADD COLUMN     "recommendation" TEXT;
