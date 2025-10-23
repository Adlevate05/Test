import type { Candidate, CartInput, DiscountStrategy, ParsedConfig } from "../types";
import { passesVisibility } from "../utils/visibility";

export const VolumeStrategy: DiscountStrategy = {
  build(input: CartInput, cfg: ParsedConfig): Candidate[] {
    const out: Candidate[] = [];
    const { mode, specificIds, exceptIds, collectionIds, volumeTiers } = cfg;
    if (!volumeTiers.length) return out;

    for (const line of input.cart.lines) {
      if (line.merchandise.__typename !== "ProductVariant") continue;
      const prod = line.merchandise.product;
      if (!prod) continue;

      const productId = prod.id;
      const ok = passesVisibility(
        productId,
        mode,
        specificIds,
        exceptIds,
        collectionIds,
        (_pid) => (prod.inCollections || []).map((m) => m.collectionId)
      );
      if (!ok) continue;

      const best = volumeTiers.find((t) => line.quantity >= t.quantity);
      if (!best) continue;

      const targets = [{ cartLine: { id: line.id } }];
      const value =
        best.type === "fixedAmount"
          ? { fixedAmount: { amount: best.value } }
          : { percentage: { value: best.value } };

      const message = best.type === "fixedAmount" ? `−${best.value}` : `${best.value}% OFF`;
      out.push({ message, targets, value });
    }

    return out;
  },
};
