import prisma from "../../db.server";
import { Prisma } from "@prisma/client";
import { BaseRepository } from "./base.repository";
import type { CreateAnalyticsVisitorUniqueBundleDto } from "../dto/analytics-visitors-uique-bundle.dto";

type AnalyticsVisitorUniqueBundle =
  Prisma.analytics_visitors_unique_bundleGetPayload<{}>;

export class AnalyticsVisitorUniqueBundleRepository extends BaseRepository<
  AnalyticsVisitorUniqueBundle,
  Prisma.analytics_visitors_unique_bundleWhereInput
> {
  constructor() {
    super(prisma.analytics_visitors_unique_bundle);
  }

  async createVisitor(
    data: CreateAnalyticsVisitorUniqueBundleDto,
  ): Promise<AnalyticsVisitorUniqueBundle> {
    return prisma.analytics_visitors_unique_bundle.create({
      data: {
        ip_address: data.ip_address,
        browser: data.browser,
        booster_discounts_id: data.booster_discounts_id,
        shopify_product_id: data.shopify_product_id,
        shop_name: data.shop_name,
        date: data.date,
      },
    });
  }

  // Count visitors based on filter
  async countVisitors(
    where?: Prisma.analytics_visitors_unique_bundleWhereInput,
  ): Promise<number> {
    return this.count(where);
  }

  // Get Latest Visitor Data
  async getLatestVisitor(
    where?: Prisma.analytics_visitors_unique_bundleWhereInput,
  ) {
    const result = await this.getAll(where, 1, 1, {
      orderBy: { id: "desc" },
    });

    return result.data[0] || null;
  }

  // Count Visitors batched by discount IDs
  async countVisitorsGroupedByDiscount(
    boosterDiscountIds: number[],
  ): Promise<{ [key: number]: number }> {
    const result = await prisma.analytics_visitors_unique_bundle.groupBy({
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

    const countMap: { [key: number]: number } = {};

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
