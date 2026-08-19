-- DropIndex
DROP INDEX "Player_userId_key";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "activeCharacterId" TEXT;

-- Backfill: chaque compte n'avait qu'un seul Player avant ce changement
-- (contrainte unique sur Player.userId) — on le pointe comme personnage actif.
UPDATE "User" u
SET "activeCharacterId" = p.id
FROM "Player" p
WHERE p."userId" = u.id;

-- CreateIndex
CREATE INDEX "Player_userId_idx" ON "Player"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_activeCharacterId_key" ON "User"("activeCharacterId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_activeCharacterId_fkey" FOREIGN KEY ("activeCharacterId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;
