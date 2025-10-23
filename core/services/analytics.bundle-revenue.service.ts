import type { CreateAnalyticsBundleRevenueDto } from "../dto/analytics-bundle-revenue.dto";
import { AnalyticsBundleRevenueRepository } from "../repositories/analytics.bundle-revenue.repository";
import { AnalyticsVisitorUniqueBundleRepository } from "../repositories/analytics.visitors.unique.bundle.repository";

export class AnalyticsBundleRevenueService {
  private readonly repo: AnalyticsBundleRevenueRepository;
  private readonly visitorRepo: AnalyticsVisitorUniqueBundleRepository;

  constructor() {
    this.repo = new AnalyticsBundleRevenueRepository();
    this.visitorRepo = new AnalyticsVisitorUniqueBundleRepository();
  }

  async create(dto: CreateAnalyticsBundleRevenueDto) {
    return await this.repo.create(dto);
  }

  async bulkCreate(dtos: CreateAnalyticsBundleRevenueDto[]) {
    return await this.repo.createMany(dtos);
  }

  async getRevenue(dateFilter?: any) {
    const orders = await this.repo.getAllOrders(dateFilter);
    const bundleOrderCount = await this.repo.countOrders(dateFilter);
    const bundleVisitors = await this.visitorRepo.countVisitors(dateFilter);

    // Group by order number
    const groupedOrders = orders.reduce(
      (acc, order) => {
        const orderNum = order.shopify_order_number;
        if (!acc[orderNum]) {
          acc[orderNum] = [];
        }
        acc[orderNum].push(order);
        return acc;
      },
      {} as Record<string, typeof orders>,
    );

    // Calculate revenue per unique order
    const revenues = Object.entries(groupedOrders).map(
      ([orderNum, orderGroup]) => {
        const itemPrice = orderGroup.reduce((sum, o) => sum + o.item_price, 0);
        const totalCustomerPays = orderGroup.reduce(
          (sum, o) => sum + o.customer_pays,
          0,
        );

        const revenue = totalCustomerPays - itemPrice;

        // Use date if available, otherwise fall back to createdAt
        const orderDate = orderGroup[0].date || orderGroup[0].createdAt;
        const createdAt = new Date(orderDate);

        return {
          orderNumber: orderNum,
          date: createdAt.toISOString().split("T")[0], // YYYY-MM-DD
          revenue: parseFloat(revenue.toFixed(2)),
        };
      },
    );

    // Sum all unique order revenues for the total
    const totalRevenue = revenues.reduce((sum, r) => sum + r.revenue, 0);

    // Bundle Order Conversion
    const bundleOrderConversion =
      bundleVisitors > 0 ? (bundleOrderCount / bundleVisitors) * 100 : 0;

    return {
      revenue: parseFloat(totalRevenue.toFixed(2)), // total revenue
      revenues, // individual revenues
      bundleOrderCount, // untouched
      bundleOrderConversion: parseInt(bundleOrderConversion.toFixed(2)),
    };
  }
}
