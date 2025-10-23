/*
  Warnings:

  - Added the required column `discount_allocation_amount` to the `analytics_bundle_revenue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `item_price` to the `analytics_bundle_revenue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `item_quantity` to the `analytics_bundle_revenue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."analytics_bundle_revenue" ADD COLUMN     "discount_allocation_amount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "item_price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "item_quantity" INTEGER NOT NULL;
