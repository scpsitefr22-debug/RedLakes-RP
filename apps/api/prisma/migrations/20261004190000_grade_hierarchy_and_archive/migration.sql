-- Hierarchie reglable par branche et retrait (reversible) des metiers.
ALTER TABLE "Grade" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Grade" ADD COLUMN "archivedAt" TIMESTAMP(3);

-- Ordre de depart = celui que le site affichait jusqu'ici dans chaque
-- branche (habilitation, puis salaire, puis nom), pour que rien ne bouge
-- tant que le staff n'a pas refait la hierarchie.
UPDATE "Grade" AS g
SET "sortOrder" = o.rang
FROM (
  SELECT id, row_number() OVER (
    PARTITION BY branch
    ORDER BY "clearanceLevel" DESC, pay DESC, name ASC
  ) AS rang
  FROM "Grade"
) AS o
WHERE g.id = o.id;

-- CreateIndex
CREATE INDEX "Grade_branch_sortOrder_idx" ON "Grade"("branch", "sortOrder");
