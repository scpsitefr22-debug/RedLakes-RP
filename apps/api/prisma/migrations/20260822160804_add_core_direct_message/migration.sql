-- CreateTable
CREATE TABLE "CoreDirectMessage" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "senderLabel" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoreDirectMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CoreDirectMessage_senderId_idx" ON "CoreDirectMessage"("senderId");

-- CreateIndex
CREATE INDEX "CoreDirectMessage_recipientId_idx" ON "CoreDirectMessage"("recipientId");

-- CreateIndex
CREATE INDEX "CoreDirectMessage_createdAt_idx" ON "CoreDirectMessage"("createdAt");

-- AddForeignKey
ALTER TABLE "CoreDirectMessage" ADD CONSTRAINT "CoreDirectMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoreDirectMessage" ADD CONSTRAINT "CoreDirectMessage_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

