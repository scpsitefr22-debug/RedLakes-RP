-- AlterEnum
BEGIN;
CREATE TYPE "ApplicationType_new" AS ENUM ('STAFF', 'RECHERCHE', 'ADMINISTRATION');
ALTER TABLE "Application" ALTER COLUMN "type" TYPE "ApplicationType_new" USING ("type"::text::"ApplicationType_new");
ALTER TYPE "ApplicationType" RENAME TO "ApplicationType_old";
ALTER TYPE "ApplicationType_new" RENAME TO "ApplicationType";
DROP TYPE "ApplicationType_old";
COMMIT;
