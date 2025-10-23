import prisma from "../../db.server";
import type { Prisma } from "@prisma/client";
import { BaseRepository } from "./base.repository";
import type { CreateAnalyticsBundleRevenueDto } from "../dto/analytics-bundle-revenue.dto";

type AnalyticsBundleRevenue = Prisma.analytics_bundle_revenueGetPayload<{}>;

export class AnalyticsBundleRevenueRepository extends BaseRepository<
  AnalyticsBundleRevenue,
  Prisma.analytics_bundle_revenueWhereInput
> {
  constructor() {
    super(prisma.analytics_bundle_revenue);
  }

  // Get All Orders with optional filter
  async getAllOrders(where?: Prisma.analytics_bundle_revenueWhereInput) {
    return prisma.analytics_bundle_revenue.findMany({
      where,
      orderBy: { createdAt: "desc" }, // optional ordering
    });
  }

  // Count orders based on filter
  async countOrders(
    where?: Prisma.analytics_bundle_revenueWhereInput,
  ): Promise<number> {
    return this.count(where);
  }

  // count order based on booster discount id
  async countBundleOrdersGroupedByDiscount(
    boosterDiscountIds: string[], 
  ): Promise<{ [key: string]: number }> {
    const result = await prisma.analytics_bundle_revenue.groupBy({
      by: ["booster_discounts_id"],
      where: {
        booster_discounts_id: {
          in: boosterDiscountIds, 
        },
      },
      _count: {
        _all: true,
      },
    });

    const countMap: { [key: string]: number } = {}; 

    boosterDiscountIds.forEach((id) => {
      countMap[id] = 0;
    });

    result.forEach((item) => {
      if (item.booster_discounts_id) {
        countMap[item.booster_discounts_id] = item._count._all;
      }
    });

    return countMap;
  }
}
