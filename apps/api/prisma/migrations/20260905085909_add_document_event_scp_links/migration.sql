-- CreateTable
CREATE TABLE "_DocumentEvents" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_DocumentScpObjects" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_DocumentEvents_AB_unique" ON "_DocumentEvents"("A", "B");

-- CreateIndex
CREATE INDEX "_DocumentEvents_B_index" ON "_DocumentEvents"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DocumentScpObjects_AB_unique" ON "_DocumentScpObjects"("A", "B");

-- CreateIndex
CREATE INDEX "_DocumentScpObjects_B_index" ON "_DocumentScpObjects"("B");

-- AddForeignKey
ALTER TABLE "_DocumentEvents" ADD CONSTRAINT "_DocumentEvents_A_fkey" FOREIGN KEY ("A") REFERENCES "ClassifiedDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentEvents" ADD CONSTRAINT "_DocumentEvents_B_fkey" FOREIGN KEY ("B") REFERENCES "GameEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentScpObjects" ADD CONSTRAINT "_DocumentScpObjects_A_fkey" FOREIGN KEY ("A") REFERENCES "ClassifiedDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentScpObjects" ADD CONSTRAINT "_DocumentScpObjects_B_fkey" FOREIGN KEY ("B") REFERENCES "ScpObject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
