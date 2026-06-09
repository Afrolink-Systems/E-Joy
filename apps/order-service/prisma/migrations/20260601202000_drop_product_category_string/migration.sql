-- Remove the legacy Product.category string after categoryId backfill.
INSERT INTO "Category" ("id", "shopId", "name", "iconKey", "color", "sortOrder", "active", "createdAt", "updatedAt")
SELECT
    'cat_' || substr(md5("Shop"."id" || ':General'), 1, 24) AS "id",
    "Shop"."id" AS "shopId",
    'General' AS "name",
    'grid' AS "iconKey",
    '#E8C49E' AS "color",
    999 AS "sortOrder",
    true AS "active",
    CURRENT_TIMESTAMP AS "createdAt",
    CURRENT_TIMESTAMP AS "updatedAt"
FROM "Shop"
WHERE EXISTS (
    SELECT 1
    FROM "Product"
    WHERE "Product"."shopId" = "Shop"."id"
      AND "Product"."categoryId" IS NULL
)
ON CONFLICT ("shopId", "name") DO NOTHING;

UPDATE "Product"
SET "categoryId" = "Category"."id"
FROM "Category"
WHERE "Product"."shopId" = "Category"."shopId"
  AND "Category"."name" = 'General'
  AND "Product"."categoryId" IS NULL;

ALTER TABLE "Product" DROP CONSTRAINT IF EXISTS "Product_categoryId_fkey";
ALTER TABLE "Product" ALTER COLUMN "categoryId" SET NOT NULL;
ALTER TABLE "Product"
ADD CONSTRAINT "Product_categoryId_fkey"
FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Product" DROP COLUMN "category";
