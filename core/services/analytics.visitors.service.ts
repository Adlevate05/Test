import type { CreateAnalyticsVisitorDto } from "../dto/analytics-visitors.dto";
import { AnalyticsVisitorsRepository } from "../repositories/analytics.visitors.repository";
import { AnalyticsVisitorsUniqueBundleService } from "./analytics.visitors.unique.bundle.service";
import { AnalyticsVisitorsUniqueAppGeneralService } from "./analytics.visitors.unique.app.general.service";
import { AnalyticsVisitorUniqueAppGeneralRepository } from "../repositories/analytics.visitors.unique.app.general.repository";
import { Prisma } from "@prisma/client";

export class AnalyticsVisitorsService {
  private readonly repo: AnalyticsVisitorsRepository;
  private readonly uniqueBundleService: AnalyticsVisitorsUniqueBundleService;
  private readonly uniqueAppGeneralService: AnalyticsVisitorsUniqueAppGeneralService;
  private readonly uniqueAppGeneralRepo: AnalyticsVisitorUniqueAppGeneralRepository;

  constructor() {
    this.repo = new AnalyticsVisitorsRepository();
    this.uniqueBundleService = new AnalyticsVisitorsUniqueBundleService();
    this.uniqueAppGeneralService =
      new AnalyticsVisitorsUniqueAppGeneralService();
    this.uniqueAppGeneralRepo =
      new AnalyticsVisitorUniqueAppGeneralRepository();
  }

  /**
   * Log a new visitor (always inserts in parent table, conditionally in child tables)
   */
  async logVisitor(data: CreateAnalyticsVisitorDto) {
    // 1. Check if this exact visitor already exists
    const existingVisitor = await this.repo.getExactVisitor({
      ip_address: data.ip_address,
      browser: data.browser,
      shopify_product_id: data.shopify_product_id,
      date: data.date,
      shop_name: data.shop_name,
    });

    // 2. Always insert in parent visitors table
    const visitorCreated = await this.repo.createVisitor(data);

    // 3. If this is a *new* unique visitor (different ip/browser/product/date),
    if (!existingVisitor) {
      const unique_entry = await this.uniqueBundleService.logVisitor({
        ip_address: data.ip_address,
        browser: data.browser,
        booster_discounts_id: data.booster_discounts_id,
        shopify_product_id: data.shopify_product_id,
        shop_name: data.shop_name,
        date: data.date,
      });

      if (unique_entry) {
        const existingShop = await this.uniqueAppGeneralRepo.getExactVisitor({
          shop_name: data.shop_name,
        });

        if (existingShop) {
          await this.uniqueAppGeneralRepo.updateVisitorCount(existingShop.id, {
            visitors_count: existingShop.visitors_count + 1,
          });
        } else {
          await this.uniqueAppGeneralService.logVisitor({
            shop_name: data.shop_name,
            visitors_count: 1,
          });
        }
      }
    }

    return visitorCreated;
  }

  /**
   * Count the number of total visitors
   */
  async countVisitors(
    filter?: Prisma.analytics_visitorsWhereInput,
  ): Promise<number> {
    return this.repo.countVisitors(filter);
  }

  /**
   * Insertion according to record matching
   */
  async getExactVisitor(data: {
    ip_address?: string;
    browser?: string;
    shopify_product_id: string | null;
    date: Date;
    shop_name: string;
  }) {
    return this.repo.getExactVisitor(data);
  }
}
