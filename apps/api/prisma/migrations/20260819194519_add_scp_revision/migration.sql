-- CreateTable
CREATE TABLE "ScpRevision" (
    "id" TEXT NOT NULL,
    "scpObjectId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "class" "ScpClass" NOT NULL,
    "threatLevel" INTEGER NOT NULL,
    "containment" TEXT NOT NULL,
    "history" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT,
    "incidents" JSONB NOT NULL,
    "tests" JSONB NOT NULL,
    "addendums" JSONB NOT NULL,
    "containmentCost" TEXT,
    "personnelAssigned" INTEGER,
    "breachCount" INTEGER,
    "editedById" TEXT,
    "editedByLabel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScpRevision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScpRevision_scpObjectId_idx" ON "ScpRevision"("scpObjectId");

-- AddForeignKey
ALTER TABLE "ScpRevision" ADD CONSTRAINT "ScpRevision_scpObjectId_fkey" FOREIGN KEY ("scpObjectId") REFERENCES "ScpObject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScpRevision" ADD CONSTRAINT "ScpRevision_editedById_fkey" FOREIGN KEY ("editedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

