import { decodeId } from "app/utils/idEncoder";
import type { CreateAnalyticsBundleRevenueDto } from "../dto/analytics-bundle-revenue.dto";

export function transformShopifyOrderToDto(
  order: any,
  shopName: string,
): CreateAnalyticsBundleRevenueDto[] {
  const dtos: CreateAnalyticsBundleRevenueDto[] = [];

  if (!order.line_items) return dtos;

  for (const item of order.line_items) {
    let boosterData: any = {};
    const bundleProperty = item.properties?.find(
      (p: any) => p.name === "_bundle_booster",
    );

    const discountAllocationAmount = parseFloat(
      item.discount_allocations?.[0]?.amount || "0",
    );

    if (bundleProperty) {
      if (typeof bundleProperty.value === "object") {
        boosterData = bundleProperty.value;
      } else {
        try {
          boosterData = JSON.parse(bundleProperty.value);
        } catch {
          boosterData = {};
        }
      }

      const b_total = item.current_quantity * parseFloat(item.price);
      const c_pays =
        item.current_quantity * parseFloat(item.price) -
        discountAllocationAmount;

      dtos.push({
        booster_discounts_id: decodeId(boosterData.bundle_id)?.toString() ?? "",
        shopify_order_id: String(order.id),
        shopify_order_number: String(order.order_number),
        shopify_product_id: String(item.product_id),
        shopify_variant_id: String(item.variant_id),
        sku: item.sku ?? "",
        shop_name: shopName,
        item_quantity: item.current_quantity,
        item_price: parseFloat(item.price),
        discount_allocation_amount: discountAllocationAmount,
        base_total: b_total,
        customer_pays: c_pays,
        discount_amount: discountAllocationAmount,
        currency: order.currency,
        date: new Date(),
      });
    }
  }
  return dtos;
}
