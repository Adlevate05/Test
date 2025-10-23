// app/core/services/discount.service.ts
import type {
  DiscountType,
  AnyDiscountCreateInput as AnyDiscountInput,
} from "../dto/discount.dto";
import type { DiscountStrategy } from "../services/discount.strategy";
import {
  createAutomaticAppDiscount,
  deleteAutomaticAppDiscount,
  getAutomaticAppDiscount,
  updateAutomaticAppDiscount,
} from "../repositories/shopify/discount.repository";
import { buildBoosterDiscountEntity } from "../utils/build-booster-entity";
import {
  boosterDiscountRepository,
  BoosterDiscountWithRelations,
} from "../repositories/booster.discount.repository";
import { toNumericIdStringOrThrow } from "../helpers/common";
import type { Prisma } from "@prisma/client";
import prisma from "../../db.server"; // ✅ add this (same import style your repo uses)

import { StatusStrategyFactory } from "../services/strategies/status/status-strategy.factory";
import { ActiveStatusStrategy } from "./strategies/status/active.strategy";
import { DraftStatusStrategy } from "./strategies/status/draft.strategy";
import type { DiscountInput } from "app/utils/types/discount.input.type";

import {
  processSameTemplate,
  processBogoTemplate,
  processDifferentTemplate,
} from "app/helper/helper";

import { AnalyticsVisitorsService } from "./analytics.visitors.service";

// Strategy map keyed by discriminant
type StrategyMap = Record<DiscountType, DiscountStrategy<any, any>>;

// BoosterDiscount for safety
type BoosterDiscount = Prisma.booster_discountsGetPayload<{}>;

// Block Style
type BlockStyle = {
  spacing: number;
  cornerRadius: number;
  selectedStyle: number;
};

const statusFactory = new StatusStrategyFactory({
  active: () => new ActiveStatusStrategy(),
  draft: () => new DraftStatusStrategy(),
});

const analyticsService = new AnalyticsVisitorsService();

export class DiscountService {
  constructor(
    private admin: any,
    private shopDomain: any, // will be used later
    private strategies?: StrategyMap,
  ) {}

  private resolveStrategy(type: DiscountType) {
    if (!this.strategies) {
      throw new Error("Strategies not configured for DiscountService");
    }

    const s = this.strategies[type];
    if (!s) throw new Error(`Unsupported discount type: ${type}`);
    return s;
  }

  /** Route knows the type (independent forms). */
  async create(type: DiscountType, raw: unknown) {
    const strategy = this.resolveStrategy(type);

    // Validate + coerce; inject the discriminant for safety
    const input: AnyDiscountInput = strategy.validate({
      ...(raw as any),
      type,
    });

    // Function/metafield config + meta
    const cfg = strategy.buildFunctionConfig(input);
    const meta = strategy.buildDiscountMeta?.(input) ?? {};

    // Publish-time guard: if startsAt is in the future, clamp to now
    const now = new Date();
    const startsDate = input.startsAt ? new Date(input.startsAt) : now;
    const startsAt = startsDate.toISOString();

    // Per-type namespace
    const namespace = `$app:volume-discount`;

    let discountId: string | null = null;
    let boosterDiscountId: number;

    if (input.status !== "draft") {
      // Build the Admin API payload
      const discountInput: DiscountInput = {
        functionId: input.functionId,
        title: input.nameApp,
        startsAt,
        ...(input.endsAt != null ? { endsAt: input.endsAt } : {}),
        discountClasses: meta.discountClasses ?? ["PRODUCT"],
        combinesWith: {
          orderDiscounts: meta.combinesWith?.orderDiscounts ?? false,
          productDiscounts: meta.combinesWith?.productDiscounts ?? false,
          shippingDiscounts: meta.combinesWith?.shippingDiscounts ?? false,
        },
        metafields: [
          {
            namespace,
            key: "function-configuration",
            type: "json",
            value: JSON.stringify(cfg),
          },
        ],
      };

      const { discountId: createdDiscountId, status } =
        await createAutomaticAppDiscount(this.admin, discountInput);

      discountId = createdDiscountId;

      const boosterEntity = buildBoosterDiscountEntity({
        input,
        shopDomain: this.shopDomain,
        shopifyDiscountId: discountId,
        status,
        deal_status: "active",
      });

      const createdBoosterEntity =
        await boosterDiscountRepository.create(boosterEntity);
      boosterDiscountId = createdBoosterEntity.id;
    } else {
      // Draft only → no Shopify call
      const boosterEntity = buildBoosterDiscountEntity({
        input,
        shopDomain: this.shopDomain,
        shopifyDiscountId: null,
        status: "draft",
        deal_status: "draft",
      });

      const createdBoosterEntity =
        await boosterDiscountRepository.create(boosterEntity);
      boosterDiscountId = createdBoosterEntity.id;
    }

    // Visibility / eligibility handling (runs for both draft + published)
    if (input.visibility === "specific" && input.primarySpecificIds) {
      this.handlePrimarySpecificVisibility(
        input,
        boosterDiscountId,
        this.shopDomain,
      );
    }

    if (input.visibility === "except" && input.primaryExceptIds) {
      this.handlePrimaryExceptVisibility(
        input,
        boosterDiscountId,
        this.shopDomain,
      );
    }

    if (input.eligibility === "bundle_except" && input.bundleExceptIds) {
      this.handleBundleExceptEligibility(
        input,
        boosterDiscountId,
        this.shopDomain,
      );
    }

    if (input.eligibility === "bundle_specific" && input.bundleSpecificIds) {
      this.handleBundleSpecificEligibility(
        input,
        boosterDiscountId,
        this.shopDomain,
      );
    }

    return { shopifyDiscountId: discountId, boosterDiscountId };
  }

  async update(type: DiscountType, raw: unknown, id: number) {
    const strategy = this.resolveStrategy(type);

    // Validate + coerce; inject the discriminant for safety
    const input: AnyDiscountInput = strategy.validate({
      ...(raw as any),
      type,
    });

    // Function/metafield config + meta
    const cfg = strategy.buildFunctionConfig(input);
    const meta = strategy.buildDiscountMeta?.(input) ?? {};
    const booster = await boosterDiscountRepository.findById(id);
    if (!booster) {
      throw new Error(`Booster discount with ID ${id} not found`);
    }

    // Publish-time guard: if startsAt is in the future, clamp to now (prevents accidental scheduling)
    const now = new Date();
    const startsDate = input.startsAt ? new Date(input.startsAt) : now;
    const startsAt = startsDate.toISOString();

    const { metaField } = await getAutomaticAppDiscount(
      this.admin,
      booster?.shopify_discount_id,
    );

    // Build the Admin API payload
    const discountInput: {
      functionId: string;
      title: string;
      startsAt: string;
      endsAt?: string | null;
      discountClasses: string[];
      combinesWith: {
        orderDiscounts: boolean;
        productDiscounts: boolean;
        shippingDiscounts: boolean;
      };
      metafields: Array<{
        id: string;
        value: string;
      }>;
    } = {
      functionId: input.functionId,
      title: input.nameApp,
      startsAt,
      // Only include endsAt if the caller provided it (null means “no end”)
      ...(input.endsAt != null ? { endsAt: input.endsAt } : {}),
      discountClasses: meta.discountClasses ?? ["PRODUCT"],
      combinesWith: {
        orderDiscounts: meta.combinesWith?.orderDiscounts ?? false,
        productDiscounts: meta.combinesWith?.productDiscounts ?? false,
        shippingDiscounts: meta.combinesWith?.shippingDiscounts ?? false,
      },
      metafields: [
        {
          id: metaField,
          value: JSON.stringify(cfg),
        },
      ],
    };
    const { discountId, status } = await updateAutomaticAppDiscount(
      this.admin,
      discountInput,
      booster?.shopify_discount_id,
    );
    await this.deletePrimaryExcept(id, this.shopDomain);
    await this.deletePrimarySpecific(id, this.shopDomain);
    await this.deleteBundleSpecific(id, this.shopDomain);
    await this.deleteBundleExcept(id, this.shopDomain);
    const boosterEntity = buildBoosterDiscountEntity({
      input,
      shopDomain: this.shopDomain,
      shopifyDiscountId: discountId,
      status: status,
    });
    const createdBoosterEntity = await boosterDiscountRepository.updateById(
      id,
      boosterEntity,
    );
    const boosterDiscountId = createdBoosterEntity.id;
    if (input.visibility === "specific" && input.primarySpecificIds) {
      this.handlePrimarySpecificVisibility(
        input,
        boosterDiscountId,
        this.shopDomain,
      );
    }

    if (input.visibility === "except" && input.primaryExceptIds) {
      this.handlePrimaryExceptVisibility(
        input,
        boosterDiscountId,
        this.shopDomain,
      );
    }

    if (input.eligibility === "bundle_except" && input.bundleExceptIds) {
      this.handleBundleExceptEligibility(
        input,
        boosterDiscountId,
        this.shopDomain,
      );
    }

    if (input.eligibility === "bundle_specific" && input.bundleSpecificIds) {
      this.handleBundleSpecificEligibility(
        input,
        boosterDiscountId,
        this.shopDomain,
      );
    }

    return { shopifyDiscountId: discountId, boosterDiscountId };
  }

  /**
   *
   * @param input
   * @param boosterDiscountId
   */
  private async handlePrimarySpecificVisibility(
    input: AnyDiscountInput,
    boosterDiscountId: number,
    shopName: string,
  ) {
    await prisma.$transaction(async (tx) => {
      const ids = input.primarySpecificIds ?? [];
      if (input.visibility === "specific" && ids.length) {
        await tx.primary_specific_products.createMany({
          data: ids.map((shopifyProductId: string) => ({
            shop_name: shopName,
            booster_discounts_id: boosterDiscountId,
            shopify_product_id: toNumericIdStringOrThrow(shopifyProductId),
          })),
          skipDuplicates: true, // works because of the composite PK
        });
      }
    });
  }

  /**
   *
   * @param input
   * @param boosterDiscountId
   */
  private async handlePrimaryExceptVisibility(
    input: AnyDiscountInput,
    boosterDiscountId: number,
    shopName: string,
  ) {
    await prisma.$transaction(async (tx) => {
      const ids = input.primaryExceptIds ?? [];
      if (input.visibility === "except" && ids.length) {
        await tx.primary_except_products.createMany({
          data: ids.map((shopifyProductId: string) => ({
            shop_name: shopName,
            booster_discounts_id: boosterDiscountId,
            shopify_product_id: toNumericIdStringOrThrow(shopifyProductId),
          })),
          skipDuplicates: true, // works because of the composite PK
        });
      }
    });
  }

  async getAll({
    page,
    pageSize,
    search,
    shop_name,
    status,
    deal_status,
  }: {
    page: number;
    pageSize: number;
    search: string;
    shop_name?: string;
    status?: string;
    deal_status?: string;
  }) {
    const discounts = await boosterDiscountRepository.getAllDiscounts({
      shopName: shop_name,
      page,
      pageSize,
      search,
      status,
      deal_status,
    });
    return discounts;
  }

  // Delete function
  async delete(boosterDiscountId: number) {
    try {
      let shopifyDiscountId: string;

      const boosterDiscount =
        await boosterDiscountRepository.findById(boosterDiscountId);

      if (!boosterDiscount) {
        throw new Error(`Discount with ID ${boosterDiscountId} not found`);
      }
      shopifyDiscountId = boosterDiscount.shopify_discount_id;

      // Clean up related records
      await this.deletePrimaryExcept(boosterDiscountId, this.shopDomain);
      await this.deletePrimarySpecific(boosterDiscountId, this.shopDomain);
      await this.deleteBundleSpecific(boosterDiscountId, this.shopDomain);
      await this.deleteBundleExcept(boosterDiscountId, this.shopDomain);
      // Delete from database first
      await boosterDiscountRepository.deleteById(boosterDiscountId);

      if (boosterDiscount.deal_status === "draft") {
        return {
          shopifyDiscountId: null,
          boosterDiscountId,
        };
      }

      // Now delete from Shopify using the retrieved ID
      const { deletedDiscountId } = await deleteAutomaticAppDiscount(
        this.admin,
        shopifyDiscountId!,
      );

      return {
        shopifyDiscountId: deletedDiscountId,
        boosterDiscountId,
      };
    } catch (error: any) {
      throw new Error(
        `Failed to delete discount: ${error?.message || "Unknown error"}`,
      );
    }
  }

  private async deletePrimaryExcept(
    boosterDiscountId: number,
    shopName: string,
  ) {
    await prisma.$transaction(async (tx) => {
      await tx.primary_except_products.deleteMany({
        where: {
          shop_name: shopName,
          booster_discounts_id: boosterDiscountId,
        },
      });
    });
  }

  private async deleteBundleExcept(
    boosterDiscountId: number,
    shopName: string,
  ) {
    await prisma.$transaction(async (tx) => {
      await tx.bundle_except_products.deleteMany({
        where: {
          shop_name: shopName,
          booster_discounts_id: boosterDiscountId,
        },
      });
    });
  }

  private async deleteBundleSpecific(
    boosterDiscountId: number,
    shopName: string,
  ) {
    await prisma.$transaction(async (tx) => {
      await tx.bundle_specific_products.deleteMany({
        where: {
          shop_name: shopName,
          booster_discounts_id: boosterDiscountId,
        },
      });
    });
  }

  private async deletePrimarySpecific(
    boosterDiscountId: number,
    shopName: string,
  ) {
    await prisma.$transaction(async (tx) => {
      await tx.primary_specific_products.deleteMany({
        where: {
          shop_name: shopName,
          booster_discounts_id: boosterDiscountId,
        },
      });
    });
  }

  async getConditionalDiscounts({
    page,
    pageSize,
    productId,
    handle,
    prices,
    ip,
    os,
    browser,
    platform,
    symbol,
  }: {
    page: number;
    pageSize: number;
    productId?: string;
    handle?: string;
    prices?: { variantId: string; price: number }[];
    ip?: string;
    os?: string;
    browser?: string;
    platform?: string;
    symbol?: string;
  }) {
    let discounts = await boosterDiscountRepository.getProductDiscount({
      shopName: this.shopDomain,
      page,
      pageSize,
      productId,
    });

    const discountsForId =
      await boosterDiscountRepository.getProductDiscountForId({
        shopName: this.shopDomain,
        page,
        pageSize,
      });

    const shopifyProductIds = await this.getProductIds(discountsForId);

    const discount = await this.findMatchingDiscount(discounts, productId!);

    let block_handle = await this.determineHandle(discount);

    const discount_block = await this.getDiscountBlock(
      discount,
      prices,
      block_handle,
      productId,
      handle,
      ip,
      os,
      browser,
      platform,
      symbol,
    );

    const bundleID = discount?.id;

    return { discount_block, bundleID, shopifyProductIds };
  }

  private async findMatchingDiscount(discount: any, productId: string) {
    if (!discount?.data || !Array.isArray(discount.data)) return null;

    const checkArrays = [
      "primary_specific_products",
      "primary_except_products",
      "bundle_specific_products",
      "bundle_except_products",
    ];

    let specificMatch: any = null;
    let exceptMatch: any = null;
    let allMatch: any = null;

    for (const d of discount.data) {
      if (
        d.visibility_primary === "specific" ||
        d.visibility_bundle === "bundle_specific"
      ) {
        const matches = checkArrays.some((key) =>
          (d[key] as any[])?.some((p) => p.shopify_product_id === productId),
        );
        if (matches) {
          specificMatch = d;
          break;
        }
      }

      if (
        d.visibility_primary === "except" ||
        d.visibility_bundle === "bundle_except"
      ) {
        const isExcluded = checkArrays.some((key) =>
          (d[key] as any[])?.some((p) => p.shopify_product_id === productId),
        );
        if (!isExcluded) {
          exceptMatch = d;
        }
      }

      const allArraysEmpty = checkArrays.every(
        (key) => !(d[key] as any[]) || (d[key] as any[]).length === 0,
      );
      if (allArraysEmpty && d.visibility_primary === "all") {
        allMatch = d;
      }
    }

    if (specificMatch) return specificMatch;
    if (exceptMatch) return exceptMatch;
    if (allMatch) return allMatch;

    return null;
  }

  private async getProductIds(discounts: any) {
    if (!discounts?.data || !Array.isArray(discounts.data)) return [];

    const checkArrays = [
      "primary_specific_products",
      "primary_except_products",
      "bundle_specific_products",
      "bundle_except_products",
    ];

    const result: {
      discountId: string;
      sourceArray: string;
      productId: string;
    }[] = [];

    for (const discount of discounts.data) {
      const discountId = discount.id?.toString();
      if (!discountId) continue;

      for (const key of checkArrays) {
        const arr = discount[key];
        if (Array.isArray(arr)) {
          for (const item of arr) {
            if (item?.shopify_product_id) {
              result.push({
                discountId,
                sourceArray: key,
                productId: item.shopify_product_id,
              });
            }
          }
        }
      }
    }

    return result;
  }

  private async determineHandle(discount: BoosterDiscount | null) {
    if (!discount) return "";

    const style = discount.configuration_block_style as BlockStyle | undefined;
    const selectedStyle = style?.selectedStyle ?? 0;

    // Discount Types
    const type = discount.discount_type;

    let handle = "";

    if (type === "volume-same-product") {
      switch (selectedStyle) {
        case 0:
          handle = "same-ver-1";
          break;
        case 1:
          handle = "same-ver-2";
          break;
        case 2:
          handle = "same-ver-4";
          break;
        case 3:
          handle = "same-ver-3";
          break;
      }
    } else if (type === "bogo") {
      switch (selectedStyle) {
        case 0:
          handle = "bogo-ver-1";
          break;
        case 2:
          handle = "bogo-ver-2";
          break;
        case 1:
          handle = "bogo-ver-4";
          break;
        case 3:
          handle = "bogo-ver-3";
          break;
      }
    } else if (type === "quantity-break-multi-product") {
      switch (selectedStyle) {
        case 0:
          handle = "different-ver-1";
          break;
        case 3:
          handle = "different-ver-2";
          break;
        case 1:
          handle = "different-ver-3";
          break;
        case 2:
          handle = "different-ver-4";
          break;
      }
    }

    return handle;
  }

  async calculateDiscountValues(
    discount: BoosterDiscount | null,
    price: number,
  ): Promise<{ discountValues: any[]; optionStyles: any[] }> {
    if (!discount) {
      return { discountValues: [], optionStyles: [] };
    }

    // Cast JSON fields
    const configBlockOpt: any[] = Array.isArray(
      discount.configuration_block_options,
    )
      ? discount.configuration_block_options
      : [discount.configuration_block_options ?? []];

    const configBlockStyles: any[] =
      discount.configuration_block_style &&
      typeof discount.configuration_block_style === "object"
        ? [discount.configuration_block_style]
        : [];

    // Discount Types
    const type = discount.discount_type;
    const hasVolumeSameProduct = type === "volume-same-product";
    const hasBogoProduct = type === "bogo";
    const hasMultiProduct = type === "quantity-break-multi-product";

    let discountValues: any[] = [];
    let optionStyles: any[] = [];

    if (hasVolumeSameProduct || hasMultiProduct) {
      discountValues = configBlockOpt.map((opt) => {
        const quantity = Number(opt.quantity ?? 1);
        const discountValue = Number(opt.discountValue ?? 0);

        const baseTotal = price * quantity;
        const discountAmount =
          discountValue > 0 ? (baseTotal * discountValue) / 100 : 0;
        const customerPays = baseTotal - discountAmount;

        return {
          label: String(opt.label ?? ""),
          title: String(opt.title ?? ""),
          quantity,
          subtitle: String(opt.subtitle ?? ""),
          badgeText: String(opt.badgeText ?? ""),
          badgeStyle: String(opt.badgeStyle ?? ""),
          discountValue,
          discountType: String(opt.discountType ?? ""),
          default: Boolean(opt.selectedByDefault ?? false),
          baseTotal: baseTotal.toFixed(2),
          customerPays: customerPays.toFixed(2),
          discountAmount: discountAmount.toFixed(2),
        };
      });

      optionStyles = configBlockStyles.map((style) => ({
        badgeText: String(style.badgeText ?? ""),
        borderColor: String(style.borderColor ?? ""),
        cardsBackground: String(style.cardsBackground ?? ""),
        labelText: String(style.labelText ?? ""),
        labelBackground: String(style.labelBackground ?? ""),
        cornerRadius: Number(style.cornerRadius ?? 0),
        titleColor: String(style.titleColor ?? ""),
        titleFontSize: Number(style.titleFontSize ?? 0),
        titleFontStyle: this.mapFontWeight(String(style.titleFontStyle ?? "")),
        selectedBackground: String(style.selectedBackground ?? ""),
        priceColor: String(style.priceColor ?? ""),
        fullPriceColor: String(style.fullPriceColor ?? ""),
        spacing: Number(style.spacing ?? 0),
        subtitleColor: String(style.subtitleColor ?? ""),
        subtitleFontSize: Number(style.subtitleFontSize ?? 0),
        subtitleFontStyle: this.mapFontWeight(
          String(style.subtitleFontStyle ?? ""),
        ),
        labelFontSize: Number(style.labelFontSize ?? 0),
        labelFontStyle: this.mapFontWeight(String(style.labelFontStyle ?? "")),
        blockTitleColor: String(style.blockTitleColor ?? ""),
        blockTitleFontSize: Number(style.blockTitleFontSize ?? 0),
        blockTitleFontStyle: this.mapFontWeight(
          String(style.blockTitleFontStyle ?? ""),
        ),
        badgeBackground: String(style.badgeBackground ?? ""),
      }));
    } else if (hasBogoProduct) {
      discountValues = configBlockOpt
        .map((opt) => {
          const buyQuantity = Number(opt.buyQuantity ?? 0);
          const getQuantity = Number(opt.freeQuantity ?? 0);

          if (buyQuantity <= 0 || price <= 0) return null;

          const baseTotal = (buyQuantity + getQuantity) * price;
          const customerPays = buyQuantity * price;
          const discountAmount = baseTotal - customerPays;
          const effectivePercentage =
            (getQuantity / (buyQuantity + getQuantity)) * 100;
          let quantity = buyQuantity + getQuantity;

          return {
            label: String(opt.label ?? ""),
            title: String(opt.title ?? ""),
            subtitle: String(opt.subtitle ?? ""),
            badge: String(opt.badgeText ?? ""),
            badgeStyle: String(opt.badgeStyle ?? ""),
            buyQuantity,
            getQuantity,
            quantity,
            discountType: String(opt.discountType ?? ""),
            default: Boolean(opt.selectedByDefault ?? false),
            baseTotal: baseTotal.toFixed(2),
            customerPays: customerPays.toFixed(2),
            discountAmount: discountAmount.toFixed(2),
            effectivePercentage,
          };
        })
        .filter(Boolean);

      optionStyles = configBlockStyles.map((style) => ({
        badgeText: String(style.badgeText ?? ""),
        borderColor: String(style.borderColor ?? ""),
        cardsBackground: String(style.cardsBackground ?? ""),
        labelText: String(style.labelText ?? ""),
        labelBackground: String(style.labelBackground ?? ""),
        cornerRadius: Number(style.cornerRadius ?? 0),
        titleColor: String(style.titleColor ?? ""),
        titleFontSize: Number(style.titleFontSize ?? 0),
        titleFontStyle: this.mapFontWeight(String(style.titleFontStyle ?? "")),
        selectedBackground: String(style.selectedBackground ?? ""),
        priceColor: String(style.priceColor ?? ""),
        fullPriceColor: String(style.fullPriceColor ?? ""),
        spacing: Number(style.spacing ?? 0),
        subtitleColor: String(style.subtitleColor ?? ""),
        subtitleFontSize: Number(style.subtitleFontSize ?? 0),
        subtitleFontStyle: this.mapFontWeight(
          String(style.subtitleFontStyle ?? ""),
        ),
        labelFontSize: Number(style.labelFontSize ?? 0),
        labelFontStyle: this.mapFontWeight(String(style.labelFontStyle ?? "")),
        blockTitleColor: String(style.blockTitleColor ?? ""),
        blockTitleFontSize: Number(style.blockTitleFontSize ?? 0),
        blockTitleFontStyle: this.mapFontWeight(
          String(style.blockTitleFontStyle ?? ""),
        ),
        badgeBackground: String(style.badgeBackground ?? ""),
      }));
    }

    return { discountValues, optionStyles };
  }

  private mapFontWeight(style: string): number {
    switch (style.toLowerCase()) {
      case "thin":
        return 100;
      case "extra light":
      case "extralight":
        return 200;
      case "light":
        return 300;
      case "normal":
      case "regular":
        return 400;
      case "medium":
        return 500;
      case "semi bold":
      case "semibold":
        return 600;
      case "bold":
        return 700;
      case "extra bold":
      case "extrabold":
        return 800;
      case "black":
        return 900;
      default:
        return 400;
    }
  }

  private async getDiscountBlock(
    discount: BoosterDiscount | null,
    prices: { variantId: string; price: number }[] = [],
    block_handle: string,
    productId?: string,
    handle?: string,
    ip?: string,
    os?: string,
    browser?: string,
    platform?: string,
    symbol?: string,
  ) {
    const hasVolumeSameProduct =
      discount?.discount_type === "volume-same-product";
    const hasBogoProduct = discount?.discount_type === "bogo";
    const hasMultiProduct =
      discount?.discount_type === "quantity-break-multi-product";

    const { discountValues, optionStyles } = await this.calculateDiscountValues(
      discount,
      prices[0]?.price,
    );

    const blockTitleColor = optionStyles[0]?.blockTitleColor ?? "#000000";
    const blockTitleFontSize = optionStyles[0]?.blockTitleFontSize ?? 12;
    const blockTitleStyle = optionStyles[0]?.blockTitleFontStyle ?? "400";

    const buttonborderColor = optionStyles[0]?.borderColor ?? "#000000";
    const buttoncardsBackground = optionStyles[0]?.cardsBackground ?? "#ffffff";
    const buttoncornerRadius = optionStyles[0]?.cornerRadius ?? 12;
    const buttonSpacing = optionStyles[0]?.spacing ?? 12;

    const block_title = discount?.block_title || "Volume Discounts";

    const block = await prisma.block_styles.findUnique({
      where: { handle: block_handle },
    });

    if (!block) {
      return { blockHtml: "", error: "Block not found" };
    }

    let htmlContent = "";

    if (productId) {
      if (hasVolumeSameProduct) {
        htmlContent = processSameTemplate({
          block,
          block_title,
          productId,
          discountValues,
          optionStyles,
          prices,
          handle,
          blockTitleColor,
          blockTitleFontSize,
          blockTitleStyle,
          buttonborderColor,
          buttoncardsBackground,
          buttoncornerRadius,
          buttonSpacing,
          symbol,
        });
        if (discount) {
          await analyticsService.logVisitor({
            booster_discounts_id: discount.id,
            shopify_product_id: productId,
            ip_address: ip,
            operating_system: os,
            browser: browser,
            platform: platform,
            shop_name: this.shopDomain,
            date: new Date(),
          });
        }
      } else if (hasBogoProduct) {
        htmlContent = processBogoTemplate({
          block,
          block_title,
          productId,
          discountValues,
          optionStyles,
          prices,
          handle,
          blockTitleColor,
          blockTitleFontSize,
          blockTitleStyle,
          buttonborderColor,
          buttoncardsBackground,
          buttoncornerRadius,
          buttonSpacing,
          symbol,
        });
        if (discount) {
          await analyticsService.logVisitor({
            booster_discounts_id: discount.id,
            shopify_product_id: productId,
            ip_address: ip,
            operating_system: os,
            browser: browser,
            platform: platform,
            shop_name: this.shopDomain,
            date: new Date(),
          });
        }
      } else if (hasMultiProduct) {
        htmlContent = processDifferentTemplate({
          block,
          block_title,
          productId,
          discountValues,
          optionStyles,
          prices,
          handle,
          blockTitleColor,
          blockTitleFontSize,
          blockTitleStyle,
          buttonborderColor,
          buttoncardsBackground,
          buttoncornerRadius,
          buttonSpacing,
          symbol,
        });
        if (discount) {
          await analyticsService.logVisitor({
            booster_discounts_id: discount.id,
            shopify_product_id: productId,
            ip_address: ip,
            operating_system: os,
            browser: browser,
            platform: platform,
            shop_name: this.shopDomain,
            date: new Date(),
          });
        }
      }
    }

    return { blockHtml: htmlContent };
  }

  /**
   *
   * @param input
   * @param boosterDiscountId
   */
  private async handleBundleSpecificEligibility(
    input: AnyDiscountInput,
    boosterDiscountId: number,
    shopName: string,
  ) {
    await prisma.$transaction(async (tx) => {
      const ids = input.bundleSpecificIds ?? [];
      if (input.eligibility === "bundle_specific" && ids.length) {
        await tx.bundle_specific_products.createMany({
          data: ids.map((shopifyProductId: string) => ({
            shop_name: shopName,
            booster_discounts_id: boosterDiscountId,
            shopify_product_id: toNumericIdStringOrThrow(shopifyProductId),
          })),
          skipDuplicates: true, // works because of the composite PK
        });
      }
    });
  }

  /**
   *
   * @param input
   * @param boosterDiscountId
   */
  private async handleBundleExceptEligibility(
    input: AnyDiscountInput,
    boosterDiscountId: number,
    shopName: string,
  ) {
    await prisma.$transaction(async (tx) => {
      const ids = input.bundleExceptIds ?? [];
      if (input.eligibility === "bundle_except" && ids.length) {
        await tx.bundle_except_products.createMany({
          data: ids.map((shopifyProductId: string) => ({
            shop_name: shopName,
            booster_discounts_id: boosterDiscountId,
            shopify_product_id: toNumericIdStringOrThrow(shopifyProductId),
          })),
          skipDuplicates: true, // works because of the composite PK
        });
      }
    });
  }

  // Delete function
  async deleteByDiscountId(shopifyDiscountId: string) {
    try {
      const boosterDiscount = await boosterDiscountRepository.findByShopifyId(
        shopifyDiscountId,
        this.shopDomain,
      );

      if (boosterDiscount?.deal_status === "draft") {
        return true;
      }

      if (!boosterDiscount) {
        throw new Error(`Discount with ID ${shopifyDiscountId} not found`);
      }
      const boosterDiscountId = boosterDiscount.id;
      if (!boosterDiscount) {
        throw new Error(`Discount with ID ${shopifyDiscountId} not found`);
      }
      if (boosterDiscountId) {
        if (boosterDiscount.visibility_primary === "except") {
          await this.deletePrimaryExcept(boosterDiscountId, this.shopDomain);
        } else if (boosterDiscount.visibility_primary === "specific") {
          await this.deletePrimarySpecific(boosterDiscountId, this.shopDomain);
        }
        await boosterDiscountRepository.deleteById(boosterDiscountId);
      }
    } catch (error: any) {
      throw new Error(
        `Failed to delete discount: ${error?.message || "Unknown error"}`,
      );
    }
    return true;
  }

  async findByShopifyId(
    shopifyDiscountId: string,
  ): Promise<BoosterDiscount | null> {
    const boosterDiscount = await boosterDiscountRepository.findByShopifyId(
      shopifyDiscountId,
      this.shopDomain,
    );
    return boosterDiscount;
  }

  async findById(
    boosterId: number,
  ): Promise<BoosterDiscountWithRelations | null> {
    return await boosterDiscountRepository.findByIdWithRelations(boosterId);
  }

  async updateDealStatus(
    boosterId: number,
    deal_status: any,
  ): Promise<BoosterDiscount> {
    const strategy = statusFactory.get(deal_status);
    strategy.apply(boosterId, this.admin);
    if (deal_status === "draft") {
      return await boosterDiscountRepository.updateById(boosterId, {
        deal_status,
        status: "draft",
      });
    }
    return await boosterDiscountRepository.updateById(boosterId, {
      deal_status,
      status: "active",
    });
  }

  async cancelPlanOperations(
    status: string,
    shopDomain: string,
    page: number,
    pageSize: number,
    search: string,
  ) {
    const discounts = await this.getAll({
      page,
      pageSize,
      search,
      shop_name: shopDomain,
      status: "active",
      deal_status: "active",
    });

    const discountIds = discounts.data.map((discount) => discount.id);

    for (const id of discountIds) {
      await this.updateDealStatus(id, status);
    }
  }
}
