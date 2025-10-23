// app/core/utils/build-booster-entity.ts
import type { AnyDiscountCreateInput as AnyDiscountInput } from "../dto/discount.dto";
import { splitIso, toNumericIdStringOrThrow } from "../helpers/common";

const toVis = (v?: string | null) => v ?? "all";
// Convert "YYYY-MM-DD" to a JS Date at midnight UTC (DateTime stored without time-of-day)
const toDateOnly = (yyyyMmDd?: string | null): Date | null => {
  if (!yyyyMmDd || !yyyyMmDd.trim()) return null;
  // Save at 00:00:00 UTC so "date-only" is preserved
  return new Date(`${yyyyMmDd}T00:00:00.000Z`);
};

// categories
const PRIMARY_ONLY_TYPES = new Set<string>(["volume-same-product", "bogo"]);

const DUAL_VISIBILITY_TYPES = new Set<string>(["quantity-break-multi-product"]);

export function buildBoosterDiscountEntity(args: {
  input: AnyDiscountInput;
  shopDomain: string;
  shopifyDiscountId: string | null;
  status: string;
  deal_status?: string;
}): {
  shop_name: string;
  shopify_discount_id: string | null;
  shopify_function_id: string | null;
  discount_type: string;

  name_app: string;
  name_store: string;
  block_title: string;

  visibility_primary: string | null;
  visibility_bundle: string | null;

  // Prisma schema: start_date DateTime (required), start_time String (required)
  // end_date DateTime?, end_time String?
  start_date: Date;
  start_time: any;
  end_date: Date | null;
  end_time: any;

  //shopify discount status
  status: string;
  deal_status?: string;

  configuration_block_style: unknown;
  configuration_block_options: unknown;
} {
  const { input, shopDomain, shopifyDiscountId, status, deal_status } = args;
  // Dates coming from UI (ISO strings)
  const start = splitIso(input.startsAt);
  const end = splitIso(input.endsAt ?? undefined);
  const startTime = input.startTime;
  const endTime = input.endTime ?? undefined;

  // Build Date-only values at midnight UTC
  // NOTE: your Prisma model has start_date as required; if startsAt is missing,
  // we default to "today" at midnight to avoid empty-string errors.
  const todayUtcYmd = new Date().toISOString().slice(0, 10);
  const startDateOnly = toDateOnly(start.date ?? todayUtcYmd)!; // required
  const endDateOnly = toDateOnly(end.date ?? null); // optional

  // Names/titles
  const nameApp = input.nameApp ?? "Untitled";
  const nameStore = (input as any).nameStore ?? nameApp;
  const blockTitle = (input as any).blockTitle ?? nameApp;

  // Style/options
  const style = (input as any).style ?? {};
  // prefer array/object from UI; fallback to empty []
  const options: unknown =
    (input as any).options ?? (input as any).packages ?? [];

  // Inputs possibly present from UI
  const visSingle = (input as any).visibility as string | undefined;
  const vbIn = (input as any).eligibility as string | undefined;

  // Visibility resolution per type
  let visibility_primary: string | null = null;
  let visibility_bundle: string | null = null;

  const matches = (
    Array.isArray(input.type) ? input.type : [input.type]
  ).filter((t) => PRIMARY_ONLY_TYPES.has(t));

  if (matches.length === 1) {
    visibility_primary = toVis(visSingle);
    visibility_bundle = null;
  } else if (DUAL_VISIBILITY_TYPES.has(input.type)) {
    visibility_primary = null;
    visibility_bundle = toVis(vbIn ?? vbIn);
  }

  return {
    shop_name: shopDomain,
    shopify_discount_id: shopifyDiscountId
      ? toNumericIdStringOrThrow(shopifyDiscountId)
      : null,
    shopify_function_id: input.functionId,
    discount_type: input.type,

    name_app: nameApp,
    name_store: nameStore,
    block_title: blockTitle,

    visibility_primary,
    visibility_bundle,

    // DATE-ONLY persistence
    start_date: startDateOnly, // Date at 00:00:00Z (required)
    start_time: startTime, // keep constant since you don't use time
    end_date: endDateOnly, // Date at 00:00:00Z or null
    end_time: endTime, // keep constant since you don't use time

    //shopify discount status
    status: status.toLowerCase(),
    deal_status: deal_status ? deal_status.toLowerCase() : undefined,

    configuration_block_style: style,
    configuration_block_options: options,
  };
}
