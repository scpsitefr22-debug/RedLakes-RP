-- CreateEnum
CREATE TYPE "AssignmentEntityType" AS ENUM ('FACTION', 'DEPARTMENT', 'TEAM');

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "teamId" TEXT;

-- CreateTable
CREATE TABLE "PlayerAssignment" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "entityType" "AssignmentEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "role" TEXT,
    "note" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlayerAssignment_playerId_idx" ON "PlayerAssignment"("playerId");

-- CreateIndex
CREATE INDEX "PlayerAssignment_entityType_entityId_idx" ON "PlayerAssignment"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "PlayerAssignment_playerId_entityType_endedAt_idx" ON "PlayerAssignment"("playerId", "entityType", "endedAt");

-- CreateIndex
CREATE INDEX "Player_teamId_idx" ON "Player"("teamId");

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerAssignment" ADD CONSTRAINT "PlayerAssignment_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

