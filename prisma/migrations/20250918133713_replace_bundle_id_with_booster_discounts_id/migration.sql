/*
  Warnings:

  - You are about to drop the column `bundle_id` on the `analytics_bundle_revenue` table. All the data in the column will be lost.
  - Added the required column `booster_discounts_id` to the `analytics_bundle_revenue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."analytics_bundle_revenue" DROP COLUMN "bundle_id",
ADD COLUMN     "booster_discounts_id" TEXT NOT NULL;
