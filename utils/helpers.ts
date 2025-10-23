import { Prisma } from "@prisma/client";
import { BogoPackageArraySchema } from "app/core/services/strategies/bogo.strategy";
import { MultiPackageArraySchema } from "app/core/services/strategies/quantity-break-multi-product.strategy";
import { VolumeSamePackageArraySchema } from "app/core/services/strategies/volume-same-product.strategy";
import { console } from "inspector";

export function formatDate(inputDate: string): string {
  if (!inputDate) return 'N/A';

  // Parse the inputDate as an ISO string
  const date = new Date(inputDate); // This handles ISO 8601 format automatically

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return 'N/A'; // If the date is invalid, return 'N/A'
  }

  // Extract day, month, and year
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = date.getFullYear();

  return `${day}-${month}-${year}`; // Format: DD-MM-YYYY
}

export function toAppContextInitial(initial: any) {
  return {
    bundleName: initial.bundleName,
    discountName: initial.discountName,
    blockTitle: initial.blockTitle,
    visibility: initial.visibility,
    eligibilty: initial.eligibilty,
    startDate: initial.startDate,
    startTime: initial.startTime,
    endDate: initial.endDate,
    endTime: initial.endTime,
    hasEndDate: initial.hasEndDate ?? false,
    spacing: initial.spacing,
    badgeText: initial.badgeText,
    labelText: initial.labelText,
    priceColor: initial.priceColor,
    titleColor: initial.titleColor,
    borderColor: initial.borderColor,
    cornerRadius: initial.cornerRadius,
    labelFontSize: initial.labelFontSize,
    selectedStyle: initial.selectedStyle,
    subtitleColor: initial.subtitleColor,
    titleFontSize: initial.titleFontSize,
    fullPriceColor: initial.fullPriceColor,
    labelFontStyle: initial.labelFontStyle,
    titleFontStyle: initial.titleFontStyle,
    badgeBackground: initial.badgeBackground,
    blockTitleColor: initial.blockTitleColor,
    cardsBackground: initial.cardsBackground,
    labelBackground: initial.labelBackground,
    subtitleFontSize: initial.subtitleFontSize,
    subtitleFontStyle: initial.subtitleFontStyle,
    blockTitleFontSize: initial.blockTitleFontSize,
    selectedBackground: initial.selectedBackground,
    blockTitleFontStyle: initial.blockTitleFontStyle,
    packages: initial.packages ?? [],
    bogoPackages: initial.bogoPackages ?? [],
    multiPackages: initial.multiPackages ?? [],
    primarySpecificIds: initial.primarySpecificIds ?? [],
    primaryExceptIds: initial.primaryExceptIds ?? [],
    bundleSpecificIds: initial.bundleSpecificIds ?? [],
    bundleExceptIds: initial.bundleExceptIds ?? [],
  };
}

export function toBlockStyle(value: Prisma.JsonValue | null | undefined) {
  // if it's a stringified JSON, parse it
  const raw =
    typeof value === "string" ? safeParseJSON(value) : value;

  // ensure it's a plain object (not array/null/primitive)
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  return undefined;
}


export function parseOptions(raw: Prisma.JsonValue | string | null | undefined) {
  let data: unknown = raw;

  if (typeof raw === "string") {
    try { data = JSON.parse(raw); } catch { data = undefined; }
  }

  const parsed = VolumeSamePackageArraySchema.safeParse(data);
  return parsed.success ? parsed.data : [];
}

export function parseBogoOptions(raw: Prisma.JsonValue | string | null | undefined) {
  let data: unknown = raw;

  if (typeof raw === "string") {
    try { data = JSON.parse(raw); } catch { data = undefined; }
  }

  const parsed = BogoPackageArraySchema.safeParse(data);
  return parsed.success ? parsed.data : [];
}

export function parseMultiOptions(raw: Prisma.JsonValue | string | null | undefined) {
  let data: unknown = raw;

  if (typeof raw === "string") {
    try { data = JSON.parse(raw); } catch { data = undefined; }
  }

  const parsed = MultiPackageArraySchema.safeParse(data);
  return parsed.success ? parsed.data : [];
}

function safeParseJSON(s: string) {
  try { return JSON.parse(s); } catch { return undefined; }
}
