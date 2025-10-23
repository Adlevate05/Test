-- CreateTable
CREATE TABLE "public"."analytics_visitors_unique_bundle" (
    "id" SERIAL NOT NULL,
    "booster_discounts_id" INTEGER NOT NULL,
    "shopify_product_id" TEXT,
    "visitors_count" INTEGER NOT NULL,

    CONSTRAINT "analytics_visitors_unique_bundle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "analytics_visitors_unique_bundle_booster_discounts_id_idx" ON "public"."analytics_visitors_unique_bundle"("booster_discounts_id");

-- CreateIndex
CREATE INDEX "analytics_visitors_unique_bundle_shopify_product_id_idx" ON "public"."analytics_visitors_unique_bundle"("shopify_product_id");
