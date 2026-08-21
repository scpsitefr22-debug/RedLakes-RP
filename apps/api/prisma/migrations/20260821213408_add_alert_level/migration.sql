-- CreateEnum
CREATE TYPE "AlertLevel" AS ENUM ('NORMAL', 'VIGILANCE', 'ALERTE', 'CRISE');

-- AlterTable
ALTER TABLE "SystemState" ADD COLUMN     "alertLevel" "AlertLevel" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "alertNote" TEXT,
ADD COLUMN     "alertUpdatedAt" TIMESTAMP(3);

