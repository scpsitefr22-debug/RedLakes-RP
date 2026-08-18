-- CreateEnum
CREATE TYPE "ScpProposalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
ALTER TYPE "PlatformEntityType" ADD VALUE 'SCP_OBJECT';

-- AlterTable
ALTER TABLE "ScpObject" ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedBy" TEXT,
ADD COLUMN     "staffNote" TEXT,
ADD COLUMN     "status" "ScpProposalStatus" NOT NULL DEFAULT 'APPROVED',
ADD COLUMN     "submittedById" TEXT;

-- CreateIndex
CREATE INDEX "ScpObject_status_idx" ON "ScpObject"("status");

-- AddForeignKey
ALTER TABLE "ScpObject" ADD CONSTRAINT "ScpObject_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

