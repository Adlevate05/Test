-- AddForeignKey
ALTER TABLE "public"."primary_specific_products" ADD CONSTRAINT "primary_specific_products_booster_discounts_id_fkey" FOREIGN KEY ("booster_discounts_id") REFERENCES "public"."booster_discounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."primary_except_products" ADD CONSTRAINT "primary_except_products_booster_discounts_id_fkey" FOREIGN KEY ("booster_discounts_id") REFERENCES "public"."booster_discounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bundle_specific_products" ADD CONSTRAINT "bundle_specific_products_booster_discounts_id_fkey" FOREIGN KEY ("booster_discounts_id") REFERENCES "public"."booster_discounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bundle_except_products" ADD CONSTRAINT "bundle_except_products_booster_discounts_id_fkey" FOREIGN KEY ("booster_discounts_id") REFERENCES "public"."booster_discounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
