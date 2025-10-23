// app/functions/product-discount/strategies/multi.ts
import type { Candidate, CartInput, DiscountStrategy, ParsedConfig } from "../types";
import { eligibleLines } from "../utils/eligibility";

export const MultiProductStrategy: DiscountStrategy = {
  build(input: CartInput, cfg: ParsedConfig): Candidate[] {
    const out: Candidate[] = [];
    const tiers = cfg.multiProductTiers ?? [];
    if (!tiers.length) return out;

    const lines = eligibleLines(input.cart.lines, cfg);
    if (!lines.length) return out;

    for (const tier of tiers) {
      const totalQty = lines.reduce((sum, l) => sum + l.quantity, 0);
      if (totalQty < tier.quantityThreshold) continue;
      const targets = lines.map((l) => ({ cartLine: { id: l.id } }));
      const value =
        tier.discountType === "fixedAmount"
          ? { fixedAmount: { amount: tier.discountValue } }
          : { percentage: { value: tier.discountValue } };

      out.push({ targets, value });
    }

    return out;
  },
};
