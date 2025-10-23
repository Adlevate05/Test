// app/functions/product-discount/run.ts
import { DiscountClass, ProductDiscountSelectionStrategy } from "../generated/api";
import type { Candidate, CartInput, RunResult } from "../src/product/types";
import { parseConfig } from "../src/product/parse-config";
import { VolumeStrategy, BogoStrategy, MultiProductStrategy } from "../src/product/strategies";

export function cartLinesDiscountsGenerateRun(input: CartInput): RunResult {
  if (!input.cart.lines.length) {
    return { operations: [] };
  }

  const isProductDiscount =
    Array.isArray(input.discount.discountClasses) &&
    input.discount.discountClasses.includes(DiscountClass.Product);

  if (!isProductDiscount) {
    return { operations: [] };
  }

  // Make sure input.graphql selects this metafield:
  // discount { metafield(namespace:"$app:volume-discount", key:"function-configuration"){ value } }
  const cfgRaw = input.discount.metafield?.value ?? "{}";
  const cfg = parseConfig(cfgRaw);

  // Compose strategies — order can matter if you later want priority
  const strategies = [MultiProductStrategy, BogoStrategy, VolumeStrategy];

  const candidates: Candidate[] = strategies.flatMap((s) => s.build(input, cfg));

  if (!candidates.length) {
    return { operations: [] };
  }

  return {
    operations: [
      {
        productDiscountsAdd: {
          candidates,
          selectionStrategy: ProductDiscountSelectionStrategy.All,
        },
      },
    ],
  };
}
