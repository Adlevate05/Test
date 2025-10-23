export interface CreateAnalyticsBundleRevenueDto {
  shopify_order_id: string;
  shopify_order_number: string;
  shopify_product_id: string;
  shopify_variant_id: string;
  sku: string;
  booster_discounts_id: string;
  base_total: number;
  customer_pays: number;
  discount_amount: number;
  currency: string;
  shop_name: string;
  item_quantity: number;
  item_price: number;
  discount_allocation_amount: number;
  date: Date;
}
