-- CreateEnum
CREATE TYPE "ScpClass" AS ENUM ('Safe', 'Euclid', 'Keter', 'Thaumiel', 'Apollyon');

-- CreateTable
CREATE TABLE "ScpObject" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "class" "ScpClass" NOT NULL,
    "threatLevel" INTEGER NOT NULL,
    "containment" TEXT NOT NULL,
    "history" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT,
    "incidents" JSONB NOT NULL DEFAULT '[]',
    "tests" JSONB NOT NULL DEFAULT '[]',
    "addendums" JSONB NOT NULL DEFAULT '[]',
    "containmentCost" TEXT,
    "personnelAssigned" INTEGER,
    "breachCount" INTEGER,
    "clearance" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScpObject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScpObject_slug_key" ON "ScpObject"("slug");

-- CreateIndex
CREATE INDEX "ScpObject_class_idx" ON "ScpObject"("class");

-- CreateIndex
CREATE INDEX "ScpObject_clearance_idx" ON "ScpObject"("clearance");

