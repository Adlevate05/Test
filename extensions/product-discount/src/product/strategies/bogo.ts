// app/functions/product-discount/strategies/bogo.ts
import type { Candidate, CartInput, DiscountStrategy, ParsedConfig } from "../types";
import { passesVisibility } from "../utils/visibility";

/* ----------------------------- Helpers ----------------------------- */

function hasExplicit(ids?: string[]) {
  return Array.isArray(ids) && ids.length > 0;
}

function sameSet(a?: string[], b?: string[]) {
  if (!a?.length && !b?.length) return true;
  if (!a?.length || !b?.length) return false;
  if (a.length !== b.length) return false;
  const s = new Set(a);
  return b.every((x) => s.has(x));
}

/** Safely compute a sortable unit price; fallback to total/qty, then 0 */
function unitPrice(line: any): number {
  const apq = line?.cost?.amountPerQuantity;
  if (apq && typeof apq.amount === "number") return apq.amount;

  const total = line?.cost?.totalAmount;
  const qty = Math.max(1, Number(line?.quantity ?? 1));
  if (total && typeof total.amount === "number") return total.amount / qty;

  return 0; // cost missing → treat as 0 to keep a stable sort
}

/** Keep only valid product-variant lines with a product id */
function safeVariantLines(lines: any[]) {
  return (lines || []).filter(
    (l) =>
      l &&
      l.merchandise?.__typename === "ProductVariant" &&
      l.merchandise?.product?.id
  );
}

/** Group lines by product id */
function groupLinesByProduct(lines: any[]) {
  const byProduct = new Map<string, any[]>();
  for (const l of lines) {
    const pid = l.merchandise.product.id as string;
    const arr = byProduct.get(pid);
    if (arr) arr.push(l);
    else byProduct.set(pid, [l]);
  }
  return byProduct;
}

/** Build a single candidate for a given tier and eligible buy/free line sets */
function buildCandidate(
  tier: ParsedConfig["bogoTiers"][number],
  buyEligible: any[],
  freeEligible: any[]
): Candidate | null {
  const treatedAsSame =
    (hasExplicit(tier.buyProductIds) &&
      hasExplicit(tier.freeProductIds) &&
      sameSet(tier.buyProductIds, tier.freeProductIds)) ||
    (!hasExplicit(tier.buyProductIds) && !hasExplicit(tier.freeProductIds)); // visibility-based → same pooled set

  const totalBought = buyEligible.reduce((sum, l) => sum + Number(l.quantity || 0), 0);
  const totalFreeEligibleQty = freeEligible.reduce((sum, l) => sum + Number(l.quantity || 0), 0);

  let groups = 0;
  if (treatedAsSame) {
    // Group size = buy + free (e.g. B2G1 => 3 per group)
    groups = Math.floor(totalBought / (tier.quantity + tier.freeQuantity));
  } else {
    const boughtGroups = Math.floor(totalBought / tier.quantity);
    const freeGroups = Math.floor(totalFreeEligibleQty / tier.freeQuantity);
    groups = Math.min(boughtGroups, freeGroups);
  }

  const maxFree = groups * tier.freeQuantity;
  if (maxFree <= 0) return null;

  // Allocate free qty to the cheapest eligible lines first
  let remainingFree = maxFree;
  const targets: Candidate["targets"] = [];
  const freeLinesSorted = [...freeEligible].sort(
    (a, b) => unitPrice(a) - unitPrice(b)
  );

  for (const line of freeLinesSorted) {
    if (remainingFree <= 0) break;
    const lineQty = Math.max(0, Number(line.quantity || 0));
    const applyCount = Math.min(lineQty, remainingFree);
    if (applyCount > 0 && line?.id) {
      targets.push({ cartLine: { id: line.id, quantity: applyCount } });
      remainingFree -= applyCount;
    }
  }

  if (!targets.length) return null;

  const value =
    tier.freeDiscountType === "fixedAmount"
      ? { fixedAmount: { amount: tier.freeDiscountValue } } // currency per unit
      : { percentage: { value: tier.freeDiscountValue } }; // 0..100

  const message = tier.title || "Special Offer";

  return { message, targets, value };
}

/* ----------------------------- Strategy ----------------------------- */

export const BogoStrategy: DiscountStrategy = {
  build(input: CartInput, cfg: ParsedConfig): Candidate[] {
    const out: Candidate[] = [];
    const { mode, specificIds, exceptIds, collectionIds, bogoTiers } = cfg;
    if (!bogoTiers?.length) return out;

    const lines = safeVariantLines(input.cart.lines);

    // Partition tiers
    const explicitTiers = bogoTiers.filter(
      (t) => hasExplicit(t.buyProductIds) || hasExplicit(t.freeProductIds)
    );
    const visibleTiers = bogoTiers.filter(
      (t) => !hasExplicit(t.buyProductIds) && !hasExplicit(t.freeProductIds)
    );

    /* -------------------------------------------------------------
       1) Explicit-ID tiers can stack (apply independently, global)
       ------------------------------------------------------------- */
    for (const tier of explicitTiers) {
      const buyEligible = lines.filter((l) =>
        tier.buyProductIds!.includes(l.merchandise.product.id)
      );
      const freeEligible = lines.filter((l) =>
        tier.freeProductIds!.includes(l.merchandise.product.id)
      );
      if (!buyEligible.length || !freeEligible.length) continue;

      const cand = buildCandidate(tier, buyEligible, freeEligible);
      if (cand) out.push(cand);
    }

    /* ----------------------------------------------------------------
       2) Visibility-based tiers: PER-PRODUCT application (not pooled)
       ---------------------------------------------------------------- */
    // First, filter lines by visibility
    const visibleEligibleAll = lines.filter((l) => {
      const prod = l.merchandise.product;
      const pid = prod.id;
      return passesVisibility(
        pid,
        mode,
        specificIds,
        exceptIds,
        collectionIds,
        (_pid) => (prod.inCollections || []).map((m: any) => m.collectionId)
      );
    });

    if (visibleEligibleAll.length && visibleTiers.length) {
      // Group eligible lines by product id
      const byProduct = groupLinesByProduct(visibleEligibleAll);

      for (const [pid, productLines] of byProduct.entries()) {
        // For same-product BOGO via visibility, buy=free set = this product’s lines
        // Evaluate ALL visibility-based tiers for this product and keep the BEST one
        let best: { cand: Candidate; freeUnits: number } | null = null;

        for (const tier of visibleTiers) {
          const cand = buildCandidate(tier, productLines, productLines);
          if (!cand) continue;
          const freeUnits = cand.targets.reduce(
            (s, t) => s + Number(t.cartLine?.quantity || 0),
            0
          );
          if (freeUnits <= 0) continue;
          if (!best || freeUnits > best.freeUnits) {
            best = { cand, freeUnits };
          }
        }

        if (best) out.push(best.cand);
      }
    }

    return out;
  },
};
