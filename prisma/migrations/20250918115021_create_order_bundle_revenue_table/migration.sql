-- CreateTable
CREATE TABLE "public"."analytics_bundle_revenue" (
    "id" SERIAL NOT NULL,
    "shopify_order_id" TEXT NOT NULL,
    "shopify_order_number" TEXT NOT NULL,
    "shopify_product_id" TEXT NOT NULL,
    "shopify_variant_id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "shop_name" TEXT NOT NULL,
    "bundle_id" TEXT NOT NULL,
    "base_total" DOUBLE PRECISION NOT NULL,
    "customer_pays" DOUBLE PRECISION NOT NULL,
    "discount_amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analytics_bundle_revenue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "analytics_bundle_revenue_shopify_order_id_idx" ON "public"."analytics_bundle_revenue"("shopify_order_id");

-- CreateIndex
CREATE INDEX "analytics_bundle_revenue_shopify_order_number_idx" ON "public"."analytics_bundle_revenue"("shopify_order_number");

-- CreateIndex
CREATE INDEX "analytics_bundle_revenue_shopify_product_id_idx" ON "public"."analytics_bundle_revenue"("shopify_product_id");

-- CreateIndex
CREATE INDEX "analytics_bundle_revenue_shopify_variant_id_idx" ON "public"."analytics_bundle_revenue"("shopify_variant_id");
