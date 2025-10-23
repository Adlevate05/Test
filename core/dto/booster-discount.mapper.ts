import type { BoosterDiscountWithRelations } from "../repositories/booster.discount.repository";

export function mapRecordToStrategyDto(rec:BoosterDiscountWithRelations) {
  return {
    // required fields
    type: rec.discount_type,
    functionId: rec.shopify_function_id,
    id: rec.id.toString(),   // if strategies expect string IDs
    blockTitle: rec.block_title ?? undefined,
    nameApp: rec.name_app ?? undefined,
    nameStore: rec.name_store ?? undefined,
    // timing
    startsAt: rec.start_date ? rec.start_date.toISOString() : null,
    endsAt: rec.end_date ? rec.end_date.toISOString() : null,
    startTime: rec.start_time ?? null,
    endTime: rec.end_time ?? null,

    // targeting
    visibility: rec.visibility_primary ?? "", // provide default if needed
    eligibility: rec.visibility_bundle ?? "",

    // conditionally include arrays
    primarySpecificIds: rec.primary_specific_products ?? undefined,
    bundleSpecificIds: rec.bundle_specific_products ?? undefined,
    primaryExceptIds: rec.primary_except_products ?? undefined,
    bundleExceptIds: rec.bundle_except_products ?? undefined,

    // optional blobs
    style: rec.configuration_block_style ?? undefined,
    packages: rec.configuration_block_options ?? undefined,
  };
}
