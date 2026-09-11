-- AlterTable
ALTER TABLE "Character" ADD COLUMN     "minClearanceLevel" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "GameEvent" ADD COLUMN     "minClearanceLevel" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "LoreArticle" ADD COLUMN     "minClearanceLevel" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "LoreRevision" ADD COLUMN     "minClearanceLevel" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "ScpObject" ADD COLUMN     "minClearanceLevel" INTEGER NOT NULL DEFAULT 1;
