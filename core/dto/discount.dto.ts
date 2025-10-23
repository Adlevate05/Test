/** Discriminator for all discount variants */
export type DiscountType =
  | "volume-same-product"
  | "bogo"
  | "quantity-break-multi-product";

/** Shared fields your parser outputs in camelCase */
export interface DiscountCommon {
  /** Discriminant */
  type: DiscountType;
  /** Infra */
  functionId: string;
  /** Naming & display */
  blockTitle?: string;  // optional UI block label (kept separately if you use it)
  nameApp: string;     // optional internal/app name
  nameStore?: string;   // optional storefront name

  /** Timing */
  startsAt?: string | null;
  endsAt?: string | null;
  endTime?: string | null;
  startTime?: string | null;
  
  /** Status */
  status?: string;
  deal_status?: string;
  
  /** Targeting (visibility model replaces mode) */
  visibility: "all" | "specific" | "except" | "";
  eligibility?: "bundle_specific" | "bundle_except" | "";
  /** Used when visibility === "specific" */
  primarySpecificIds?: string[];
  bundleSpecificIds?: string[];
  /** Used when visibility === "except" */
  primaryExceptIds?: string[];
  bundleExceptIds?: string[];
  /** Collections are optional but useful if you support them */
  collectionIds?: string[];

  /** Optional blobs from the UI */
  style?: Record<string, any>;
  options?: Record<string, any>;
}

/** UI package (bar) normalized shape */
export interface VolumePackage {
  quantity: number;
  discountType: "percentage" | "fixedAmount";
  discountValue: number;

  // optional UI fields we may want to persist
  title?: string;
  subtitle?: string;
  label?: string;
  badgeText?: string;
  badgeStyle?: string;
  selectedByDefault?: boolean;
}

export interface BogoPackage {
  buyQuantity: number;
  freeQuantity: number;
  title?: string;
  subtitle?: string;
  label?: string;
  badgeText?: string;
  badgeStyle?: string;
  selectedByDefault?: boolean;
}

export interface MultiPackage {
  quantity: number;
  discountType: "percentage" | "fixedAmount";
  discountValue: number;
  title?: string;
  subtitle?: string;
  label?: string;
  badgeText?: string;
  badgeStyle?: string;
  selectedByDefault?: boolean;
}

/** ---------- Volume (same product) ---------- */
export interface VolumeSameProductCreateInput extends DiscountCommon {
  type: "volume-same-product";
  packages?: VolumePackage[];
}

/** ---------- BOGO ---------- */
export interface BogoCreateInput extends DiscountCommon {
  type: "bogo";
  packages?: BogoPackage[];
}

export interface MultiCreateInput extends DiscountCommon {
  type: "quantity-break-multi-product";
  packages?: MultiPackage[];
}

/** ---------- Union for “any discount create” ---------- */
export type AnyDiscountCreateInput =
  | VolumeSameProductCreateInput
  | BogoCreateInput
  | MultiCreateInput
