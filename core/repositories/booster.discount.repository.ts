import prisma from "../../db.server";
import { Prisma } from "@prisma/client";
import { BaseRepository } from "./base.repository";
import type { PaginatedResponse } from "./base.repository";

// The BoosterDiscount type from Prisma is used for type safety
type BoosterDiscount = Prisma.booster_discountsGetPayload<{}>;

// Extending BoosterDiscount type to include count
type BoosterDiscountWithCount = BoosterDiscount & {
  _count?: {
    primary_specific_products?: number;
    primary_except_products?: number;
    bundle_specific_products?: number;
    bundle_except_products?: number;
  };
};

// Define a type for all optional parameters
type GetAllDiscountsOptions = {
  page: number;
  pageSize: number;
  shopName: string | undefined; // Add the optional shopName property
  search?: string; // Add the optional search property
  productId?: string; // Add the optional productId property
  status?: string; // Add the optional status property
  deal_status?: string; // Add the optional deal_status property
};

const boosterInclude = Prisma.validator<Prisma.booster_discountsInclude>()({
  primary_specific_products: true,
  primary_except_products: true,
  bundle_specific_products: true,
  bundle_except_products: true,
});

export type BoosterDiscountWithRelations = Prisma.booster_discountsGetPayload<{
  include: {
    primary_specific_products: true;
    primary_except_products: true;
    bundle_specific_products: true;
    bundle_except_products: true;
  };
}>;

export class BoosterDiscountRepository extends BaseRepository<
  BoosterDiscount,
  Prisma.booster_discountsWhereInput
> {
  constructor() {
    super(prisma.booster_discounts);
  }

  /**
   * Fetches active discounts with pagination, sorting, and additional filters.
   *
   * @param options An object containing all query parameters.
   * @returns A promise that resolves to a PaginatedResponse of BoosterDiscount.
   */
  async getAllDiscounts(
    options: GetAllDiscountsOptions,
  ): Promise<PaginatedResponse<BoosterDiscount>> {
    const { page, pageSize, search, shopName, status, deal_status } = options;
    const filters: Prisma.booster_discountsWhereInput = {
      AND: [{ shop_name: { equals: shopName } }],
      status: status ? { equals: status } : undefined,
      deal_status: deal_status ? { equals: deal_status } : undefined,
    };

    // Add the search filter if a search term is provided
    if (search) {
      (filters.AND as Prisma.booster_discountsWhereInput[]).push({
        // Assuming 'name_app' is the field you want to search on
        name_app: { contains: search, mode: "insensitive" },
      });
    }

    // Pass the updated filters to your underlying getAll function
    return this.getAll(filters, page, pageSize, { orderBy: { id: "desc" } });
  }

  // getProductDiscount
  /**
   * Fetches discounts directly from booster_discounts table
   * where status is active and both visibility_primary & visibility_bundle are not null.
   *
   * @param options Query options for pagination and filtering
   */
  async getProductDiscount(
    options: GetAllDiscountsOptions,
  ): Promise<PaginatedResponse<BoosterDiscountWithCount>> {
    const { page, pageSize, shopName, productId } = options;

    return await this.getAll(
      {
        shop_name: { equals: shopName },
        status: { equals: "active" },
        OR: [
          { AND: [{ visibility_primary: { not: null } }] },
          { AND: [{ visibility_bundle: { not: null } }] },
        ],
      },
      page,
      pageSize,
      {
        orderBy: { id: "desc" },
        include: {
          primary_specific_products: {
            where: { shopify_product_id: productId },
          },
          primary_except_products: {
            where: { shopify_product_id: productId },
          },
          bundle_specific_products: {
            where: { shopify_product_id: productId },
          },
          bundle_except_products: {
            where: { shopify_product_id: productId },
          },
        },
      },
    );
  }

  async findByShopifyId(
    shopify_discount_id: string,
    shopDomain: string,
  ): Promise<BoosterDiscount | null> {
    return this.model.findFirst({
      where: {
        shopify_discount_id: shopify_discount_id,
        shop_name: shopDomain,
      },
    });
  }

  async findById(id: number) {
    return this.model.findUnique({
      where: { id },
    });
  }

  async findByIdWithRelations(
    id: number,
  ): Promise<BoosterDiscountWithRelations | null> {
    const rec = await this.model.findUnique({
      where: { id },
      include: boosterInclude,
    } as any);
    return rec as BoosterDiscountWithRelations | null;
  }

  // getProductDiscountForID
  /**
   * Fetches discounts directly from booster_discounts table
   * where status is active and both visibility_primary & visibility_bundle are not null.
   *
   * @param options Query options for pagination and filtering
   */
  async getProductDiscountForId(
    options: GetAllDiscountsOptions,
  ): Promise<PaginatedResponse<BoosterDiscountWithCount>> {
    const { page, pageSize, shopName, } = options;

    return await this.getAll(
      {
        shop_name: { equals: shopName },
        status: { equals: "active" },
        OR: [
          { AND: [{ visibility_primary: { not: null } }] },
          { AND: [{ visibility_bundle: { not: null } }] },
        ],
      },
      page,
      pageSize,
      {
        orderBy: { id: "desc" },
        include: {
          primary_specific_products: {},
          primary_except_products: {},
          bundle_specific_products: {},
          bundle_except_products: {},
        },
      },
    );
  }
}

// Export a single instance to be used throughout the application
export const boosterDiscountRepository = new BoosterDiscountRepository();
