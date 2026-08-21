-- CreateTable
CREATE TABLE "LoreRevision" (
    "id" TEXT NOT NULL,
    "loreArticleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "category" "LoreCategory" NOT NULL,
    "status" "LoreStatus" NOT NULL,
    "restrictedDepartmentIds" TEXT[],
    "featured" BOOLEAN NOT NULL,
    "coverImage" TEXT,
    "tags" TEXT[],
    "editedById" TEXT,
    "editedByLabel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoreRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsRevision" (
    "id" TEXT NOT NULL,
    "newsArticleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "category" TEXT NOT NULL,
    "image" TEXT,
    "featured" BOOLEAN NOT NULL,
    "editedById" TEXT,
    "editedByLabel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MapLocationRevision" (
    "id" TEXT NOT NULL,
    "mapLocationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "history" TEXT NOT NULL,
    "danger" INTEGER NOT NULL,
    "faction" TEXT,
    "editedById" TEXT,
    "editedByLabel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MapLocationRevision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LoreRevision_loreArticleId_idx" ON "LoreRevision"("loreArticleId");

-- CreateIndex
CREATE INDEX "NewsRevision_newsArticleId_idx" ON "NewsRevision"("newsArticleId");

-- CreateIndex
CREATE INDEX "MapLocationRevision_mapLocationId_idx" ON "MapLocationRevision"("mapLocationId");

-- AddForeignKey
ALTER TABLE "LoreRevision" ADD CONSTRAINT "LoreRevision_loreArticleId_fkey" FOREIGN KEY ("loreArticleId") REFERENCES "LoreArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoreRevision" ADD CONSTRAINT "LoreRevision_editedById_fkey" FOREIGN KEY ("editedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsRevision" ADD CONSTRAINT "NewsRevision_newsArticleId_fkey" FOREIGN KEY ("newsArticleId") REFERENCES "NewsArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsRevision" ADD CONSTRAINT "NewsRevision_editedById_fkey" FOREIGN KEY ("editedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapLocationRevision" ADD CONSTRAINT "MapLocationRevision_mapLocationId_fkey" FOREIGN KEY ("mapLocationId") REFERENCES "MapLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapLocationRevision" ADD CONSTRAINT "MapLocationRevision_editedById_fkey" FOREIGN KEY ("editedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

