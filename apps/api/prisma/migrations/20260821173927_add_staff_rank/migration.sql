-- CreateEnum
CREATE TYPE "StaffRank" AS ENUM ('SURVEILLANT', 'OFFICIER', 'COORDINATEUR_GENERAL');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "staffRank" "StaffRank";

