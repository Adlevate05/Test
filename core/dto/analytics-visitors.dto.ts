export interface CreateAnalyticsVisitorDto {
  booster_discounts_id: number;
  shopify_product_id: string | null;
  ip_address?: string;
  platform?: string;
  operating_system?: string;
  browser?: string;
  shop_name: string;
  date: Date;
}
