-- AlterTable
ALTER TABLE "public"."analytics_bundle_revenue" ALTER COLUMN "sku" DROP NOT NULL,
ALTER COLUMN "sku" SET DEFAULT '';
