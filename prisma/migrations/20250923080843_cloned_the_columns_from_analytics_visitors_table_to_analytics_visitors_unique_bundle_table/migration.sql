/*
  Warnings:

  - You are about to drop the column `visitors_count` on the `analytics_visitors_unique_bundle` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."analytics_visitors_unique_bundle" DROP COLUMN "visitors_count",
ADD COLUMN     "browser" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "ip_address" TEXT,
ADD COLUMN     "operating_system" TEXT,
ADD COLUMN     "platform" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
