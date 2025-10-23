-- CreateTable
CREATE TABLE "public"."analytics_visitors" (
    "id" SERIAL NOT NULL,
    "booster_discounts_id" INTEGER NOT NULL,
    "shopify_product_id" TEXT NOT NULL,
    "ip_address" TEXT,
    "platform" TEXT,
    "operating_system" TEXT,
    "browser" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_visitors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "analytics_visitors_booster_discounts_id_idx" ON "public"."analytics_visitors"("booster_discounts_id");

-- CreateIndex
CREATE INDEX "analytics_visitors_shopify_product_id_idx" ON "public"."analytics_visitors"("shopify_product_id");
