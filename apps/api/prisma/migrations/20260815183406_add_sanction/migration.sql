-- CreateEnum
CREATE TYPE "SanctionType" AS ENUM ('AVERTISSEMENT', 'BLAME', 'MISE_A_PIED', 'RETROGRADATION', 'BANNISSEMENT');

-- CreateEnum
CREATE TYPE "SanctionStatus" AS ENUM ('ACTIVE', 'EXPIREE', 'LEVEE');

-- CreateTable
CREATE TABLE "Sanction" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "type" "SanctionType" NOT NULL,
    "status" "SanctionStatus" NOT NULL DEFAULT 'ACTIVE',
    "reason" TEXT NOT NULL,
    "note" TEXT,
    "issuedById" TEXT,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "liftedAt" TIMESTAMP(3),
    "liftedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sanction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Sanction_playerId_idx" ON "Sanction"("playerId");

-- CreateIndex
CREATE INDEX "Sanction_status_idx" ON "Sanction"("status");

-- AddForeignKey
ALTER TABLE "Sanction" ADD CONSTRAINT "Sanction_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sanction" ADD CONSTRAINT "Sanction_issuedById_fkey" FOREIGN KEY ("issuedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sanction" ADD CONSTRAINT "Sanction_liftedById_fkey" FOREIGN KEY ("liftedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

