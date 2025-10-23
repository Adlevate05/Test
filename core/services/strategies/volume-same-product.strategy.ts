// app/core/discounts/volume-same-product.strategy.ts
import { z } from "zod";
import type { DiscountStrategy } from "../discount.strategy"; // ✅ correct path
import type { VolumeSameProductCreateInput } from "../../dto/discount.dto";
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

export const VolumeSamePackageArraySchema = z.array(pkgSchema);
export type PackageItem = z.infer<typeof pkgSchema>;

const SameVolumeSchema = CommonDiscountSchema.extend({
  type: z.literal("volume-same-product"),
  packages: z.array(pkgSchema).optional(),
})
  .superRefine((v, ctx) => {
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
  })
  .superRefine((v, ctx) => {
    if (
      v.visibility === "specific" &&
      (!v.primarySpecificIds || v.primarySpecificIds.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select at least one product for visibility=specific",
        path: ["primarySpecificIds"],
      });
    }
    if (
      v.visibility === "except" &&
      (!v.primaryExceptIds || v.primaryExceptIds.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select at least one product for visibility=except",
        path: ["primaryExceptIds"],
      });
    }
  });

export class VolumeSameProductStrategy
  implements DiscountStrategy<VolumeSameProductCreateInput>
{
  // Satisfy the interface discriminator
  readonly type = "volume-same-product" as const;

  validate(raw: unknown): VolumeSameProductCreateInput {
    const normalized =
      typeof raw === "object" && raw
        ? {
            ...raw,

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

    return SameVolumeSchema.parse(normalized);
  }

  /**
   * Build the Function metafield config.
   * Includes legacy single-tier + optional packages for modern UI.
   * Targeting is handled on the Discount resource, not here.
   */
  buildFunctionConfig(input: VolumeSameProductCreateInput) {
    return {
      mode: input.visibility,
      collectionIds: input.collectionIds ?? [],
      specificIds: input.primarySpecificIds ?? [],
      exceptIds: input.primaryExceptIds ?? [],
      status: input.status,
      deal_status: input.deal_status,
      configurations: input.packages?.map((p) => ({
        type: this.type,
        quantity: p.quantity,
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
