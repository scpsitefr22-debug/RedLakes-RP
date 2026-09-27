-- CreateEnum
CREATE TYPE "RpEventStatus" AS ENUM ('PLANNED', 'ACTIVE', 'CLOSED', 'CANCELLED');

-- AlterEnum
ALTER TYPE "PlatformEntityType" ADD VALUE 'RP_EVENT';

-- CreateTable
CREATE TABLE "RpEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "briefing" TEXT,
    "status" "RpEventStatus" NOT NULL DEFAULT 'PLANNED',
    "factionId" TEXT,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdByLabel" TEXT,
    "closedByLabel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RpEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RpEventAssignment" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "roleLabel" TEXT NOT NULL,
    "departmentId" TEXT,
    "sector" TEXT,
    "equipment" TEXT,
    "instruction" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RpEventAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RpEvent_status_idx" ON "RpEvent"("status");

-- CreateIndex
CREATE INDEX "RpEventAssignment_playerId_idx" ON "RpEventAssignment"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "RpEventAssignment_eventId_playerId_key" ON "RpEventAssignment"("eventId", "playerId");

-- AddForeignKey
ALTER TABLE "RpEvent" ADD CONSTRAINT "RpEvent_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RpEvent" ADD CONSTRAINT "RpEvent_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RpEventAssignment" ADD CONSTRAINT "RpEventAssignment_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "RpEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RpEventAssignment" ADD CONSTRAINT "RpEventAssignment_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RpEventAssignment" ADD CONSTRAINT "RpEventAssignment_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
