import type {
  CartInput,
  CartLinesDiscountsGenerateRunResult,
} from "../../generated/api";

export type { CartInput, CartLinesDiscountsGenerateRunResult as RunResult };

export type Target = { cartLine: { id: string; quantity?: number } };

export type Value =
  | { percentage: { value: number }; fixedAmount?: never }
  | { fixedAmount: { amount: number }; percentage?: never };

export type Candidate = {
  message?: string;
  targets: Target[];
  value: Value;
};

// What each strategy must implement
export interface DiscountStrategy {
  build(input: CartInput, cfg: ParsedConfig): Candidate[];
}

/** Parsed configuration shape returned by parse-config.ts */
export type ParsedConfig = {
  mode: "all" | "specific" | "except" | "collections" |"bundle_specific" | "bundle_except";
  specificIds: string[];
  exceptIds: string[];
  collectionIds: string[];
  bundleSpecificIds: string[];
  bundleExceptIds: string[];

  volumeTiers: Array<{ type: "percentage" | "fixedAmount"; quantity: number; value: number }>;
  bogoTiers: Array<{
    quantity: number;
    freeQuantity: number;
    buyProductIds: string[];
    freeProductIds: string[];
    freeDiscountType: "percentage" | "fixedAmount";
    freeDiscountValue: number;
    title:string
  }>;
  multiProductTiers: Array<{
    quantityThreshold: number;
    discountType: "percentage" | "fixedAmount";
    discountValue: number;
  }>;
};
