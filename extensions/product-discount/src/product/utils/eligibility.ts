// app/functions/product-discount/eligibility.ts
import type { ParsedConfig } from "../types";

/**
 * Eligibility check for bundle modes only.
 * - bundle_specific => only products in bundleSpecificIds are eligible (minus bundleExceptIds).
 * - bundle_except   => all products are eligible EXCEPT those in bundleExceptIds.
 */
export function isEligibleProduct(productId: string, cfg: ParsedConfig): boolean {
  const allow = Array.isArray(cfg.bundleSpecificIds) ? cfg.bundleSpecificIds : [];
  const deny  = Array.isArray(cfg.bundleExceptIds)   ? cfg.bundleExceptIds   : [];

  console.log("productId:", productId);
  console.log("Allow:", allow);
  console.log("Deny:", deny);
  console.log("Mode:", cfg.mode);

  switch (cfg.mode) {
    case "bundle_specific": {
      if (!allow.includes(productId)) return false;
      if (deny.includes(productId)) return false;
      return true;
    }
    case "bundle_except": {
      return !deny.includes(productId);
    }
    default:
      return false; // if mode missing or invalid, default to no eligibility
  }
}

export function eligibleLines<TLine extends {
  id: string;
  quantity: number;
  merchandise: { __typename: string; product?: { id: string } };
}>(lines: TLine[], cfg: ParsedConfig): TLine[] {
  return lines.filter(
    (l) =>
      l.merchandise.__typename === "ProductVariant" &&
      l.merchandise.product &&
      isEligibleProduct(l.merchandise.product.id, cfg)
  );
}
