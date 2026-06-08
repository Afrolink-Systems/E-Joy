-- First-class per-shop menu categories while preserving Product.category text.
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "iconKey" TEXT NOT NULL DEFAULT 'grid',
    "color" TEXT NOT NULL DEFAULT '#E8C49E',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Product" ADD COLUMN "categoryId" TEXT;

CREATE UNIQUE INDEX "Category_shopId_name_key" ON "Category"("shopId", "name");
CREATE INDEX "Category_shopId_active_sortOrder_idx" ON "Category"("shopId", "active", "sortOrder");
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

INSERT INTO "Category" ("id", "shopId", "name", "iconKey", "color", "sortOrder", "active", "createdAt", "updatedAt")
SELECT
    'cat_' || substr(md5("shopId" || ':' || normalized_name), 1, 24) AS "id",
    "shopId",
    normalized_name AS "name",
    'grid' AS "iconKey",
    '#E8C49E' AS "color",
    (row_number() OVER (PARTITION BY "shopId" ORDER BY normalized_name) - 1) * 10 AS "sortOrder",
    true AS "active",
    CURRENT_TIMESTAMP AS "createdAt",
    CURRENT_TIMESTAMP AS "updatedAt"
FROM (
    SELECT DISTINCT
        "shopId",
        COALESCE(NULLIF(trim("category"), ''), 'General') AS normalized_name
    FROM "Product"
) AS existing_categories;

UPDATE "Product"
SET "categoryId" = "Category"."id",
    "category" = "Category"."name"
FROM "Category"
WHERE "Product"."shopId" = "Category"."shopId"
  AND COALESCE(NULLIF(trim("Product"."category"), ''), 'General') = "Category"."name";

ALTER TABLE "Category"
ADD CONSTRAINT "Category_shopId_fkey"
FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Product"
ADD CONSTRAINT "Product_categoryId_fkey"
FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
