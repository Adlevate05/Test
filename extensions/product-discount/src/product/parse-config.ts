// app/functions/product-discount/parse-config.ts
import type { ParsedConfig } from "./types";

export function parseConfig(raw: unknown): ParsedConfig {
  try {
    const cfg = JSON.parse(String(raw || "{}"));

    const list = Array.isArray(cfg.configurations) ? cfg.configurations : [];

    // top-level visibility context (consumed by strategies via passesVisibility)
    const mode = String(cfg.mode || cfg.visibility || "all") as ParsedConfig["mode"];
    const specificIds = Array.isArray(cfg.specificIds)
      ? cfg.specificIds
      : (Array.isArray(cfg.productIds) ? cfg.productIds : []);
    const exceptIds = Array.isArray(cfg.exceptIds) ? cfg.exceptIds : [];
    const collectionIds = Array.isArray(cfg.collectionIds) ? cfg.collectionIds : [];

    const bundleSpecificIds: string[] = Array.isArray(cfg.bundleSpecificIds) ? cfg.bundleSpecificIds : [];
    const bundleExceptIds: string[] = Array.isArray(cfg.bundleExceptIds) ? cfg.bundleExceptIds : [];


    const bogoTiers: ParsedConfig["bogoTiers"] = [];
    const volumeTiers: ParsedConfig["volumeTiers"] = [];
    const multiProductTiers: ParsedConfig["multiProductTiers"] = [];

    for (const c of list) {
      // ----------------- BOGO -----------------
      if (c?.type === "bogo" && c.freeQuantity != null) {
        const quantity = Math.max(1, Math.floor(Number(c.buyQuantity ?? c.quantity ?? 0)));
        const freeQuantity = Math.max(0, Math.floor(Number(c.freeQuantity)));

        const buyProductIds: string[] = Array.isArray(c.buyProductIds) ? c.buyProductIds : [];
        const freeProductIds: string[] = Array.isArray(c.freeProductIds) ? c.freeProductIds : [];

        const freeDiscountType: "fixedAmount" | "percentage" =
          c.freeDiscountType === "fixedAmount" ? "fixedAmount" : "percentage";

        const freeDiscountValue =
          freeDiscountType === "percentage"
            ? Math.max(0, Math.min(100, Number(c.freeDiscountValue ?? 100)))
            : Math.max(0, Number(c.freeDiscountValue ?? 0));

        if (freeQuantity > 0 && quantity > 0) {
          bogoTiers.push({
            quantity,
            freeQuantity,
            buyProductIds,
            freeProductIds,
            freeDiscountType,
            freeDiscountValue,
            title: c.title
          });
        }
        continue;
      }

      // --------- VOLUME (same product) ---------
      if (c?.type === "volume-same-product") {
        const quantity = Math.max(1, Math.floor(Number(c.quantity || 0)));
        const type = c.discountType === "fixedAmount" ? "fixedAmount" : "percentage";
        const value = Math.max(0, Number(c.discountValue));
        if (value > 0) volumeTiers.push({ type, quantity, value });
        continue;
      }

      // --------- MULTI-PRODUCT ---------
      if (c?.type === "quantity-break-multi-product") {
        const quantityThreshold = Math.max(1, Math.floor(Number(c.quantityThreshold || 0)));
        const discountType = c.discountType === "fixedAmount" ? "fixedAmount" : "percentage";
        const discountValue =
          discountType === "percentage"
            ? Math.max(0, Math.min(100, Number(c.discountValue || 0)))
            : Math.max(0, Number(c.discountValue || 0));

        if (quantityThreshold > 0 && discountValue > 0) {
          // store only threshold + discount info; strategy will resolve visibility at runtime
          multiProductTiers.push({ quantityThreshold, discountType, discountValue });
        }
        continue;
      }
    }

    // Sort: higher quantity (volume) first; larger (buy+free) BOGO groups first
    volumeTiers.sort((a, b) => b.quantity - a.quantity);
    bogoTiers.sort((a, b) => (b.quantity + b.freeQuantity) - (a.quantity + a.freeQuantity));

    return { mode, specificIds, exceptIds, collectionIds, bogoTiers, volumeTiers, multiProductTiers, bundleSpecificIds, bundleExceptIds } as ParsedConfig;
  } catch {
    return {
      mode: "all",
      specificIds: [],
      exceptIds: [],
      collectionIds: [],
      bogoTiers: [],
      volumeTiers: [],
      multiProductTiers: [],
      bundleSpecificIds: [],
      bundleExceptIds: [],
    } as ParsedConfig;
  }
}