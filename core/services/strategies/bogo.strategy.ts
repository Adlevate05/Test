// app/core/discounts/volume-same-product.strategy.ts
import { z } from "zod";
import type { DiscountStrategy } from "../discount.strategy"; // ✅ correct path
import type { BogoCreateInput } from "app/core/dto/discount.dto";
import { CommonDiscountSchema } from "./common/common.schema";

/** package (bar) normalized by the parser from options.packages */
const pkgSchema = z.object({
  buyQuantity: z.number().int().min(1),
  freeQuantity: z.number().int().min(1),
  title: z.string().min(1, { message: "Title is required" }),
  subtitle: z.string().optional(),
  label: z.string().optional(),
  badgeText: z.string().optional(),
  badgeStyle: z.string().optional(),
  selectedByDefault: z.boolean().optional(),
});

export const BogoPackageArraySchema = z.array(pkgSchema);
export type BogoPackageItem = z.infer<typeof pkgSchema>;

const BogoSchema = CommonDiscountSchema.extend({
  type: z.literal("bogo"),
  packages: z.array(pkgSchema).optional(),
}).superRefine((v, ctx) => {
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

export class BogoStrategy implements DiscountStrategy<BogoCreateInput> {
  readonly type = "bogo" as const;

  validate(raw: unknown): BogoCreateInput {
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

    return BogoSchema.parse(normalized);
  }

  buildFunctionConfig(input: BogoCreateInput) {
    return {
      mode: input.visibility, // all | specific | except
      collectionIds: input.collectionIds ?? [],
      specificIds: input.primarySpecificIds ?? [],
      exceptIds: input.primaryExceptIds ?? [],
      configurations: input.packages?.map((p) => ({
        type: this.type,
        buyQuantity: p.buyQuantity,
        freeQuantity: p.freeQuantity,
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
