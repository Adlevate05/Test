-- AlterTable
ALTER TABLE "public"."analytics_visitors" ADD COLUMN     "shop_name" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "public"."analytics_visitors_unique_app_general" ADD COLUMN     "shop_name" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "public"."analytics_visitors_unique_bundle" ADD COLUMN     "shop_name" TEXT NOT NULL DEFAULT '';
