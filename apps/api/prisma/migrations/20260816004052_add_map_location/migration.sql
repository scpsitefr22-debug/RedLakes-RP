-- CreateTable
CREATE TABLE "MapLocation" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "history" TEXT NOT NULL,
    "danger" INTEGER NOT NULL,
    "faction" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MapLocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MapLocation_slug_key" ON "MapLocation"("slug");

-- CreateIndex
CREATE INDEX "MapLocation_type_idx" ON "MapLocation"("type");

