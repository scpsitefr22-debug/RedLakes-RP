-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "faction" TEXT NOT NULL,
    "biography" TEXT NOT NULL,
    "quotes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "history" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "portrait" TEXT,
    "clearance" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Character_slug_key" ON "Character"("slug");

-- CreateIndex
CREATE INDEX "Character_clearance_idx" ON "Character"("clearance");

