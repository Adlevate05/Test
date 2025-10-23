// Only types here (no runtime imports), so use `import type`
export type Visibility = "all" | "specific" | "except";
export type Eligibilty = "bundle_specific" | "bundle_except";

export type PriceMode = "default" | "percentage" | "fixed";

export type Bar = {
  id: string;
  title: string;
  quantity: number;
  Blocktitle: string;
  subtitle?: string;
  priceMode?: PriceMode;
  discountType?: string;
  price?: number;
  discountValue?: number;
  badgeText?: string;
  badgeStyle?: string;
  label?: string;
  discountedPrice?: number;
  selectedByDefault?: boolean;
  saved_percentage?: string;
  saved_total?: string;
  symbol: string;
  currencyCode: string;
};

export type BogoBar = {
  id: string;
  title: string;
  buyQuantity: number;
  freeQuantity?: number;
  Blocktitle: string;
  subtitle?: string;
  priceMode?: PriceMode;
  price?: number;
  discountValue?: number;
  badgeText?: string;
  badgeStyle?: string;
  label?: string;
  discountedPrice?: number;
  selectedByDefault?: boolean;
  symbol: string;
  currencyCode: string;
};

export type MultiBar = {
  id: string;
  title: string;
  quantity: number;
  Blocktitle: string;
  discountType?: string;
  subtitle?: string;
  priceMode?: PriceMode;
  price?: number;
  discountValue?: number;
  badgeText?: string;
  badgeStyle?: string;
  label?: string;
  discountedPrice?: number;
  selectedByDefault?: boolean;
  symbol: string;
  currencyCode: string;
};

export type AppInitialState = {
  bundleName?: string;
  discountName?: string;
  blockTitle?: string;

  visibility?: Visibility;
  eligibilty?: Eligibilty;

  startDate?: string;
  startTime?: string;
  hasEndDate?: boolean;
  endDate?: string;
  endTime?: string;

  cornerRadius?: number;
  spacing?: number;
  selectedStyle?: number;

  primarySpecificIds?: string[];
  bundleSpecificIds?: string[];
  bundleExceptIds?: string[];
  primaryExceptIds?: string[];

  // Colors
  cardsBackground?: string;
  selectedBackground?: string;
  borderColor?: string;
  blockTitleColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  priceColor?: string;
  fullPriceColor?: string;
  labelBackground?: string;
  labelText?: string;
  badgeBackground?: string;
  badgeText?: string;

  // Typography
  blockTitleFontSize?: number;
  blockTitleFontStyle?: string;
  titleFontSize?: number;
  titleFontStyle?: string;
  subtitleFontSize?: number;
  subtitleFontStyle?: string;
  labelFontSize?: number;
  labelFontStyle?: string;

  // Bars (optional)
  packages?: Bar[];
  bogoPackages?: BogoBar[];
  multiPackages?: MultiBar[];

  // theme
  themeColor?: string;
  lightThemeColor?: string;
  borderThemeColor?: string;
};
