// @ts-check
import {
  DiscountClass,
  ProductDiscountSelectionStrategy,
} from "../generated/api";

/**
 * @typedef {import("../generated/api").CartInput} CartInput
 * @typedef {import("../generated/api").CartLinesDiscountsGenerateRunResult} RunResult
 */

/**
 * Parse configuration JSON into BOGO and Volume tiers
 */
function parseConfig(raw) {
  try {
    const cfg = JSON.parse(String(raw || "{}"));
    const list = Array.isArray(cfg.configurations) ? cfg.configurations : [];

    const bogoTiers = [];
    const volumeTiers = [];

    for (const c of list) {
      const quantity = Math.max(1, Math.floor(Number(c.quantity || 0)));
      if (c.type === "bogo" && c.freeQuantity != null) {
        const freeQuantity = Math.max(0, Math.floor(Number(c.freeQuantity)));
        const buyProductIds = Array.isArray(c.buyProductIds) ? c.buyProductIds : [];
        const freeProductIds = Array.isArray(c.freeProductIds) ? c.freeProductIds : [];
        if (
          freeQuantity > 0 &&
          buyProductIds.length > 0 &&
          freeProductIds.length > 0
        ) {
          bogoTiers.push({ quantity, freeQuantity, buyProductIds, freeProductIds });
        }
      } else {
        const type = c.type === "fixedAmount" ? "fixedAmount" : "percentage";
        const value = Math.max(0, Number(c.value));
        if (value > 0) {
          volumeTiers.push({ type, quantity, value });
        }
      }
    }

    // Sort BOGO tiers by descending (quantity + freeQuantity)
    bogoTiers.sort(
      (a, b) => b.quantity + b.freeQuantity - (a.quantity + a.freeQuantity)
    );
    // Sort Volume tiers by descending quantity
    volumeTiers.sort((a, b) => b.quantity - a.quantity);

    return {
      mode: cfg.mode || "all",
      productIds: Array.isArray(cfg.productIds) ? cfg.productIds : [],
      collectionIds: Array.isArray(cfg.collectionIds) ? cfg.collectionIds : [],
      bogoTiers,
      volumeTiers,
    };
  } catch {
    return {
      mode: "all",
      productIds: [],
      collectionIds: [],
      bogoTiers: [],
      volumeTiers: [],
    };
  }
}

/**
 * @param {CartInput} input
 * @returns {RunResult}
 */
export function cartLinesDiscountsGenerateRun(input) {
  if (!input.cart.lines.length) {
    return { operations: [] };
  }

  // Only handle product-scoped discounts
  const isProductDiscount =
    Array.isArray(input.discount.discountClasses) &&
    input.discount.discountClasses.includes(DiscountClass.Product);
  if (!isProductDiscount) {
    return { operations: [] };
  }

  const {
    mode,
    productIds,
    collectionIds,
    bogoTiers,
    volumeTiers,
  } = parseConfig(input.discount.metafield?.value);

  /** @type {Array<{
    message: string,
    targets: { cartLine: { id: string } }[],
    value: { percentage?: { value: number }; fixedAmount?: { amount: number } };
  }>} */
  const candidates = [];

  // 1) CROSS-PRODUCT BOGO
  for (const tier of bogoTiers) {
    // Sum purchased of buyProductIds
    const totalBought = input.cart.lines
      .filter(
        (line) =>
          line.merchandise.__typename === "ProductVariant" &&
          tier.buyProductIds.includes(line.merchandise.product.id)
      )
      .reduce((sum, line) => sum + line.quantity, 0);

    const groupSize = tier.quantity + tier.freeQuantity;
    const groups = Math.floor(totalBought / groupSize);
    const maxFree = groups * tier.freeQuantity;
    if (maxFree <= 0) continue;

    let remainingFree = maxFree;
    const targets = [];
    for (const line of input.cart.lines) {
      if (
        remainingFree <= 0 ||
        line.merchandise.__typename !== "ProductVariant"
      )
        continue;
      const pid = line.merchandise.product.id;
      if (tier.freeProductIds.includes(pid)) {
        const applyCount = Math.min(line.quantity, remainingFree);
        for (let i = 0; i < applyCount; i++) {
          targets.push({ cartLine: { id: line.id } });
        }
        remainingFree -= applyCount;
      }
    }

    if (targets.length) {
      candidates.push({
        message: `Buy ${tier.quantity}, get ${maxFree} free`,
        targets,
        value: { percentage: { value: 100 } },
      });
    }
  }

  // 2) VOLUME DISCOUNTS – only the single best tier per line
  for (const line of input.cart.lines) {
    if (line.merchandise.__typename !== "ProductVariant") continue;
    const prod = line.merchandise.product;
    if (!prod) continue;

    if (mode === "products" && !productIds.includes(prod.id)) continue;
    if (mode === "collections") {
      const inCols = (prod.inCollections || []).map((m) => m.collectionId);
      if (!inCols.some((id) => collectionIds.includes(id))) continue;
    }

    const best = volumeTiers.find((t) => line.quantity >= t.quantity);
    if (!best) continue;

    const targets = [{ cartLine: { id: line.id } }];
    const message =
      best.type === "percentage"
        ? `${best.value}% OFF`
        : `₹${best.value} OFF`;
    const value =
      best.type === "percentage"
        ? { percentage: { value: best.value } }
        : { fixedAmount: { amount: best.value } };

    candidates.push({ message, targets, value });
  }

  if (!candidates.length) {
    return { operations: [] };
  }

  // 3) APPLY ALL CANDIDATES
  return {
    operations: [
      {
        productDiscountsAdd: {
          candidates,
          selectionStrategy: ProductDiscountSelectionStrategy.First,
        },
      },
    ],
  };
}
