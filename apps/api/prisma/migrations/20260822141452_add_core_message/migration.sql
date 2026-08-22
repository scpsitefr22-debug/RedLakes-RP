-- CreateTable
CREATE TABLE "CoreMessage" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "authorLabel" TEXT NOT NULL,
    "factionId" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoreMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CoreMessage_factionId_idx" ON "CoreMessage"("factionId");

-- CreateIndex
CREATE INDEX "CoreMessage_createdAt_idx" ON "CoreMessage"("createdAt");

-- AddForeignKey
ALTER TABLE "CoreMessage" ADD CONSTRAINT "CoreMessage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoreMessage" ADD CONSTRAINT "CoreMessage_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

