-- AlterTable
ALTER TABLE "public"."Session" ALTER COLUMN "expires" SET DATA TYPE TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."booster_discounts" (
    "id" SERIAL NOT NULL,
    "shop_name" TEXT NOT NULL,
    "shopify_discount_id" TEXT NOT NULL,
    "shopify_function_id" TEXT NOT NULL,
    "discount_type" TEXT NOT NULL,
    "name_app" TEXT NOT NULL,
    "name_store" TEXT NOT NULL,
    "block_title" TEXT NOT NULL,
    "visibility_primary" TEXT NOT NULL,
    "visibility_bundle" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_date" TIMESTAMP(3),
    "end_time" TEXT,
    "configuration_block_style" JSONB NOT NULL,
    "configuration_block_options" JSONB NOT NULL,

    CONSTRAINT "booster_discounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."primary_specific_products" (
    "shop_name" TEXT NOT NULL,
    "booster_discounts_id" INTEGER NOT NULL,
    "shopify_product_id" TEXT NOT NULL,

    CONSTRAINT "primary_specific_products_pkey" PRIMARY KEY ("shop_name","booster_discounts_id","shopify_product_id")
);

-- CreateTable
CREATE TABLE "public"."primary_except_products" (
    "shop_name" TEXT NOT NULL,
    "booster_discounts_id" INTEGER NOT NULL,
    "shopify_product_id" TEXT NOT NULL,

    CONSTRAINT "primary_except_products_pkey" PRIMARY KEY ("shop_name","booster_discounts_id","shopify_product_id")
);

-- CreateTable
CREATE TABLE "public"."bundle_specific_products" (
    "shop_name" TEXT NOT NULL,
    "booster_discounts_id" INTEGER NOT NULL,
    "shopify_product_id" TEXT NOT NULL,

    CONSTRAINT "bundle_specific_products_pkey" PRIMARY KEY ("shop_name","booster_discounts_id","shopify_product_id")
);

-- CreateTable
CREATE TABLE "public"."bundle_except_products" (
    "shop_name" TEXT NOT NULL,
    "booster_discounts_id" INTEGER NOT NULL,
    "shopify_product_id" TEXT NOT NULL,

    CONSTRAINT "bundle_except_products_pkey" PRIMARY KEY ("shop_name","booster_discounts_id","shopify_product_id")
);

-- CreateIndex
CREATE INDEX "booster_discounts_shop_name_idx" ON "public"."booster_discounts"("shop_name");

-- CreateIndex
CREATE INDEX "booster_discounts_start_date_idx" ON "public"."booster_discounts"("start_date");

-- CreateIndex
CREATE INDEX "primary_specific_products_booster_discounts_id_idx" ON "public"."primary_specific_products"("booster_discounts_id");

-- CreateIndex
CREATE INDEX "primary_except_products_booster_discounts_id_idx" ON "public"."primary_except_products"("booster_discounts_id");

-- CreateIndex
CREATE INDEX "bundle_specific_products_booster_discounts_id_idx" ON "public"."bundle_specific_products"("booster_discounts_id");

-- CreateIndex
CREATE INDEX "bundle_except_products_booster_discounts_id_idx" ON "public"."bundle_except_products"("booster_discounts_id");
