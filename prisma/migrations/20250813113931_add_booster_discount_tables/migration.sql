-- DropForeignKey
ALTER TABLE "public"."bundle_except_products" DROP CONSTRAINT "bundle_except_products_booster_discounts_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."bundle_specific_products" DROP CONSTRAINT "bundle_specific_products_booster_discounts_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."primary_except_products" DROP CONSTRAINT "primary_except_products_booster_discounts_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."primary_specific_products" DROP CONSTRAINT "primary_specific_products_booster_discounts_id_fkey";
