// app/core/discounts/volume-same-product.strategy.ts
import { z } from "zod";
import type { DiscountStrategy } from "../discount.strategy"; // ✅ correct path
import type { MultiCreateInput } from "../../dto/discount.dto";
import { CommonDiscountSchema } from "./common/common.schema";

/** package (bar) normalized by the parser from options.packages */
const pkgSchema = z.object({
  quantity: z.number().int().min(1),
  discountType: z.enum(["percentage", "fixedAmount"]),
  discountValue: z.number(),
  title: z.string().min(1, { message: "Title is required" }),
  subtitle: z.string().optional(),
  label: z.string().optional(),
  badgeText: z.string().optional(),
  badgeStyle: z.string().optional(),
  selectedByDefault: z.boolean().optional(),
});

export const MultiPackageArraySchema = z.array(pkgSchema);
export type PackageItem = z.infer<typeof pkgSchema>;

const MultiSchema = CommonDiscountSchema.extend({
  type: z.literal("quantity-break-multi-product"),
  eligibility: z.enum(["bundle_specific", "bundle_except"]),
  visibility: z
    .union([z.enum(["all", "specific", "except"]), z.literal("")])
    .default(""),
  packages: z.array(pkgSchema).optional(),
}).superRefine((v, ctx) => {
  for (let i = 0; i < (v.packages?.length ?? 0); i++) {
    const p = v.packages![i]!;
    if (
      p.discountType === "percentage" &&
      (p.discountValue < 0 || p.discountValue > 99)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Package percentage must be between 1 and 99",
        path: ["packages", i, "discountValue"],
      });
    }

    if (p.discountType === "fixedAmount" && p.discountValue < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Package fixed amount must be ≥ 0",
        path: ["packages", i, "discountValue"],
      });
    }
  }

  if (
    v.eligibility === "bundle_except" &&
    (!v.bundleExceptIds || v.bundleExceptIds.length === 0)
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Select at least one product for eligibility=bundle_except",
      path: ["bundleExceptIds"],
    });
  }
  if (
    v.eligibility === "bundle_specific" &&
    (!v.bundleSpecificIds || v.bundleSpecificIds.length === 0)
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Select at least one product for eligibility=bundle_specific",
      path: ["bundleSpecificIds"],
    });
  }
});

export class QuantityBreakMultiProductStrategy
  implements DiscountStrategy<MultiCreateInput>
{
  // Satisfy the interface discriminator
  readonly type = "quantity-break-multi-product" as const;

  validate(raw: unknown): MultiCreateInput {
    const normalized =
      typeof raw === "object" && raw
        ? {
            ...raw,

            bundleSpecificIds: (raw as any).bundleSpecificIds?.map((x: any) => {
              if (typeof x === "object") {
                const id = x.shopify_product_id || x.id || "";
                return id.startsWith("gid://shopify/Product/")
                  ? id
                  : `gid://shopify/Product/${id}`;
              }
              return typeof x === "string" &&
                !x.startsWith("gid://shopify/Product/")
                ? `gid://shopify/Product/${x}`
                : x;
            }),

            bundleExceptIds: (raw as any).bundleExceptIds?.map((x: any) => {
              if (typeof x === "object") {
                const id = x.shopify_product_id || x.id || "";
                return id.startsWith("gid://shopify/Product/")
                  ? id
                  : `gid://shopify/Product/${id}`;
              }
              return typeof x === "string" &&
                !x.startsWith("gid://shopify/Product/")
                ? `gid://shopify/Product/${x}`
                : x;
            }),

            primarySpecificIds: (raw as any).primarySpecificIds?.map(
              (x: any) => {
                if (typeof x === "object") {
                  const id = x.shopify_product_id || x.id || "";
                  return id.startsWith("gid://shopify/Product/")
                    ? id
                    : `gid://shopify/Product/${id}`;
                }
                return typeof x === "string" &&
                  !x.startsWith("gid://shopify/Product/")
                  ? `gid://shopify/Product/${x}`
                  : x;
              },
            ),

            primaryExceptIds: (raw as any).primaryExceptIds?.map((x: any) => {
              if (typeof x === "object") {
                const id = x.shopify_product_id || x.id || "";
                return id.startsWith("gid://shopify/Product/")
                  ? id
                  : `gid://shopify/Product/${id}`;
              }
              return typeof x === "string" &&
                !x.startsWith("gid://shopify/Product/")
                ? `gid://shopify/Product/${x}`
                : x;
            }),
          }
        : raw;

    return MultiSchema.parse(normalized);
  }

  /**
   * Build the Function metafield config.
   * Includes legacy single-tier + optional packages for modern UI.
   * Targeting is handled on the Discount resource, not here.
   */
  buildFunctionConfig(input: MultiCreateInput) {
    return {
      mode: input.eligibility,
      bundleExceptIds: input.bundleExceptIds ?? [],
      bundleSpecificIds: input.bundleSpecificIds ?? [],
      configurations: input.packages?.map((p) => ({
        type: this.type,
        quantityThreshold: p.quantity,
        discountType: p.discountType,
        discountValue: p.discountValue,
        title: p.title,
        subtitle: p.subtitle,
        label: p.label,
      })),
    };
  }

  buildDiscountMeta() {
    return {
      discountClasses: ["PRODUCT"],
      combinesWith: {
        orderDiscounts: false,
        productDiscounts: false,
        shippingDiscounts: false,
      },
    };
  }
}
