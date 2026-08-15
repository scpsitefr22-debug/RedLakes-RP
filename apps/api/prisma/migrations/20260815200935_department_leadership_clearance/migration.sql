-- AlterTable
ALTER TABLE "Department" ADD COLUMN     "clearance" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "leadership" TEXT[] DEFAULT ARRAY[]::TEXT[];

