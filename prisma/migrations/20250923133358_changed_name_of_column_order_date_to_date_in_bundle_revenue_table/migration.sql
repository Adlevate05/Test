/*
  Warnings:

  - You are about to drop the column `order_date` on the `analytics_bundle_revenue` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."analytics_bundle_revenue" DROP COLUMN "order_date",
ADD COLUMN     "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP;
