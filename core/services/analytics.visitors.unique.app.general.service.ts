import { CreateAnalyticsVisitorUniqueAppGeneralDto } from "../dto/analytics-visitors-unique-app-general.dto";
import { AnalyticsVisitorUniqueAppGeneralRepository } from "../repositories/analytics.visitors.unique.app.general.repository";
import { Prisma } from "@prisma/client";

export class AnalyticsVisitorsUniqueAppGeneralService {
  private readonly repo: AnalyticsVisitorUniqueAppGeneralRepository;

  constructor() {
    this.repo = new AnalyticsVisitorUniqueAppGeneralRepository();
  }

  /**
   * Log a new visitor
   */
  async logVisitor(data: CreateAnalyticsVisitorUniqueAppGeneralDto) {
    return this.repo.createVisitor(data);
  }

  /**
   * Count the number of total visitors
   */
  async countVisitors(
    filter?: Prisma.analytics_visitors_unique_app_generalWhereInput,
  ): Promise<number> {
    return this.repo.countVisitors(filter);
  }

  /**
   * Get Latest record/ visitor
   */
  async getLatestVisitor(
    filter?: Prisma.analytics_visitors_unique_app_generalWhereInput,
  ) {
    return this.repo.getLatestVisitor(filter);
  }
}
