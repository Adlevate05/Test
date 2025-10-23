import prisma from "../../db.server";
import { Prisma } from "@prisma/client";
import { BaseRepository, PaginatedResponse } from "./base.repository";
import type { CreateAnalyticsVisitorDto } from "../dto/analytics-visitors.dto";

type AnalyticsVisitor = Prisma.analytics_visitorsGetPayload<{}>;

export class AnalyticsVisitorsRepository extends BaseRepository<
  AnalyticsVisitor,
  Prisma.analytics_visitorsWhereInput
> {
  constructor() {
    super(prisma.analytics_visitors);
  }

  async createVisitor(
    data: CreateAnalyticsVisitorDto,
  ): Promise<AnalyticsVisitor> {
    return prisma.analytics_visitors.create({
      data: {
        booster_discounts_id: data.booster_discounts_id,
        shopify_product_id: data.shopify_product_id,
        ip_address: data.ip_address,
        platform: data.platform,
        operating_system: data.operating_system,
        browser: data.browser,
        shop_name: data.shop_name,
        date: data.date,
      },
    });
  }

  // Count visitors based on filter
  async countVisitors(
    where?: Prisma.analytics_visitorsWhereInput,
  ): Promise<number> {
    return this.count(where);
  }

  // Get All the records from the table and check for insertion
  async getExactVisitor(data: {
    ip_address?: string;
    browser?: string;
    shopify_product_id: string | null;
    date: Date; // direct match with your date column
    shop_name: string;
  }): Promise<AnalyticsVisitor | null> {
    const { ip_address, browser, shopify_product_id, date, shop_name } = data;

    const filters: Prisma.analytics_visitorsWhereInput = {
      AND: [
        { shop_name: { equals: shop_name } },
        { ip_address: ip_address },
        { browser: browser },
        { shopify_product_id: shopify_product_id },
        { date: date }, // direct check
      ],
    };

    const result = await this.getAll(filters, 1, 1, {
      orderBy: { id: "desc" },
    });

    return result.data.length > 0 ? result.data[0] : null;
  }
}
