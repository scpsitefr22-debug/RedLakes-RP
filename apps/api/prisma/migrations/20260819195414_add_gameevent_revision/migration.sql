-- CreateTable
CREATE TABLE "GameEventRevision" (
    "id" TEXT NOT NULL,
    "gameEventId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "casualties" TEXT,
    "outcome" TEXT NOT NULL,
    "editedById" TEXT,
    "editedByLabel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameEventRevision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GameEventRevision_gameEventId_idx" ON "GameEventRevision"("gameEventId");

-- AddForeignKey
ALTER TABLE "GameEventRevision" ADD CONSTRAINT "GameEventRevision_gameEventId_fkey" FOREIGN KEY ("gameEventId") REFERENCES "GameEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameEventRevision" ADD CONSTRAINT "GameEventRevision_editedById_fkey" FOREIGN KEY ("editedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

