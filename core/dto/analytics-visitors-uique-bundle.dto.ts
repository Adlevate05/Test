export interface CreateAnalyticsVisitorUniqueBundleDto {
  booster_discounts_id: number;
  ip_address?: string;
  platform?: string;
  operating_system?: string;
  browser?: string;
  shopify_product_id: string | null;
  shop_name: string;
  date: Date;
}
