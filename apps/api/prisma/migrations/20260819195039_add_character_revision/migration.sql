-- CreateTable
CREATE TABLE "CharacterRevision" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "faction" TEXT NOT NULL,
    "biography" TEXT NOT NULL,
    "quotes" TEXT[],
    "history" TEXT[],
    "portrait" TEXT,
    "editedById" TEXT,
    "editedByLabel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CharacterRevision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CharacterRevision_characterId_idx" ON "CharacterRevision"("characterId");

-- AddForeignKey
ALTER TABLE "CharacterRevision" ADD CONSTRAINT "CharacterRevision_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterRevision" ADD CONSTRAINT "CharacterRevision_editedById_fkey" FOREIGN KEY ("editedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

