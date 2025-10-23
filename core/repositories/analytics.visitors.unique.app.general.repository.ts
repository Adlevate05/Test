import prisma from "../../db.server";
import { Prisma } from "@prisma/client";
import { BaseRepository } from "./base.repository";
import type { CreateAnalyticsVisitorUniqueAppGeneralDto } from "../dto/analytics-visitors-unique-app-general.dto";

type AnalyticsVisitorUniqueAppGeneral =
  Prisma.analytics_visitors_unique_app_generalGetPayload<{}>;

export class AnalyticsVisitorUniqueAppGeneralRepository extends BaseRepository<
  AnalyticsVisitorUniqueAppGeneral,
  Prisma.analytics_visitors_unique_app_generalWhereInput
> {
  constructor() {
    super(prisma.analytics_visitors_unique_app_general);
  }

  async createVisitor(
    data: CreateAnalyticsVisitorUniqueAppGeneralDto,
  ): Promise<AnalyticsVisitorUniqueAppGeneral> {
    return prisma.analytics_visitors_unique_app_general.create({
      data: {
        shop_name: data.shop_name,
        visitors_count: data.visitors_count,
      },
    });
  }

  // Count visitors based on filter
  async countVisitors(
    where?: Prisma.analytics_visitors_unique_app_generalWhereInput,
  ): Promise<number> {
    return this.count(where);
  }

  // Get Latest Visitor Data
  async getLatestVisitor(
    where?: Prisma.analytics_visitors_unique_app_generalWhereInput,
  ) {
    const result = await this.getAll(where, 1, 1, {
      orderBy: { id: "desc" },
    });

    return result.data[0] || null;
  }

  // Get Exact Visitor
  async getExactVisitor(data: {
    shop_name: string;
  }): Promise<AnalyticsVisitorUniqueAppGeneral | null> {
    const { shop_name } = data;

    const filters: Prisma.analytics_visitors_unique_app_generalWhereInput = {
      shop_name: { equals: shop_name },
    };

    const result = await this.getAll(filters, 1, 1, {
      orderBy: { id: "desc" },
    });

    return result.data.length > 0 ? result.data[0] : null;
  }

  async updateVisitorCount(id: number, data: { visitors_count: number }) {
    return await prisma.analytics_visitors_unique_app_general.update({
      where: { id },
      data,
    });
  }
}
