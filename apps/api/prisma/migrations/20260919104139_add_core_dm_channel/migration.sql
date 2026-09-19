-- CreateEnum
CREATE TYPE "CoreDmChannel" AS ENUM ('PERSONNEL', 'PROFESSIONNEL');

-- AlterTable
ALTER TABLE "CoreDirectMessage" ADD COLUMN     "channel" "CoreDmChannel" NOT NULL DEFAULT 'PERSONNEL';

-- CreateIndex
CREATE INDEX "CoreDirectMessage_channel_idx" ON "CoreDirectMessage"("channel");
