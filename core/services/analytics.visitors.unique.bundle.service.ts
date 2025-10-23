import { CreateAnalyticsVisitorUniqueBundleDto } from "../dto/analytics-visitors-uique-bundle.dto";
import { AnalyticsVisitorUniqueBundleRepository } from "../repositories/analytics.visitors.unique.bundle.repository";
import { AnalyticsBundleRevenueRepository } from "../repositories/analytics.bundle-revenue.repository";
import { Prisma } from "@prisma/client";

export class AnalyticsVisitorsUniqueBundleService {
  private readonly repo: AnalyticsVisitorUniqueBundleRepository;
  private readonly revenuerepo: AnalyticsBundleRevenueRepository;

  constructor() {
    this.repo = new AnalyticsVisitorUniqueBundleRepository();
    this.revenuerepo = new AnalyticsBundleRevenueRepository();
  }

  /**
   * Log a new visitor
   */
  async logVisitor(data: CreateAnalyticsVisitorUniqueBundleDto) {
    return this.repo.createVisitor(data);
  }

  /**
   * Count the number of total visitors
   */
  async countVisitors(
    filter?: Prisma.analytics_visitors_unique_bundleWhereInput,
  ): Promise<number> {
    return this.repo.countVisitors(filter);
  }

  async getAnalytics(boosterDiscountIds: number[] | string[]) {
    const visitorsPromise = this.repo.countVisitorsGroupedByDiscount(
      boosterDiscountIds as number[],
    );

    const orderIds = boosterDiscountIds.map(String);
    const ordersPromise =
      this.revenuerepo.countBundleOrdersGroupedByDiscount(orderIds);

    const [visitors, orders] = await Promise.all([
      visitorsPromise,
      ordersPromise,
    ]);

    const analytics: {
      [key: string]: {
        visitors: number;
        orders: number;
        bundleOrderConversion: number;
      };
    } = {};

    boosterDiscountIds.forEach((id) => {
      const visitorCount = visitors[id as number] || 0;
      const orderCount = orders[id as string] || 0;

      const bundleOrderConversion =
        visitorCount > 0 ? (orderCount / visitorCount) * 100 : 0;

      analytics[id] = {
        visitors: visitorCount,
        orders: orderCount,
        bundleOrderConversion,
      };
    });

    return analytics;
  }

  /**
   * Get Latest record/ visitor
   */
  async getLatestVisitor(
    filter?: Prisma.analytics_visitors_unique_bundleWhereInput,
  ) {
    return this.repo.getLatestVisitor(filter);
  }
}
