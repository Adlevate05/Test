/*
  Warnings:

  - You are about to drop the column `created_at` on the `analytics_visitors_unique_bundle` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `analytics_visitors_unique_bundle` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."analytics_bundle_revenue" ADD COLUMN     "order_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."analytics_visitors_unique_bundle" DROP COLUMN "created_at",
DROP COLUMN "updated_at";
