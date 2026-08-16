-- DropIndex
DROP INDEX "Character_clearance_idx";

-- DropIndex
DROP INDEX "GameEvent_clearance_idx";

-- DropIndex
DROP INDEX "ScpObject_clearance_idx";

-- AlterTable
ALTER TABLE "Character" DROP COLUMN "clearance",
ADD COLUMN     "restrictedDepartmentIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Department" DROP COLUMN "clearance";

-- AlterTable
ALTER TABLE "Faction" DROP COLUMN "clearance";

-- AlterTable
ALTER TABLE "GameEvent" DROP COLUMN "clearance",
ADD COLUMN     "restrictedDepartmentIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Grade" DROP COLUMN "clearance";

-- AlterTable
ALTER TABLE "LoreArticle" DROP COLUMN "clearance",
ADD COLUMN     "restrictedDepartmentIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Player" DROP COLUMN "clearance";

-- AlterTable
ALTER TABLE "ScpObject" DROP COLUMN "clearance",
ADD COLUMN     "restrictedDepartmentIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

