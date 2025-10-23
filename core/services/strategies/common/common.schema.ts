// app/core/discounts/strategy/common/common.schema.ts
import { z } from "zod";

export const StyleSchema = z.object({
  cornerRadius: z.number().optional(),
  spacing: z.number().optional(),
  selectedStyle: z.number().optional(),
  cardsBackground: z.string().optional(),
  selectedBackground: z.string().optional(),
  borderColor: z.string().optional(),
  blockTitleColor: z.string().optional(),
  titleColor: z.string().optional(),
  subtitleColor: z.string().optional(),
  priceColor: z.string().optional(),
  fullPriceColor: z.string().optional(),
  labelBackground: z.string().optional(),
  labelText: z.string().optional(),
  badgeBackground: z.string().optional(),
  badgeText: z.string().optional(),
  blockTitleFontSize: z.number().optional(),
  blockTitleFontStyle: z.string().optional(),
  titleFontSize: z.number().optional(),
  titleFontStyle: z.string().optional(),
  subtitleFontSize: z.number().optional(),
  subtitleFontStyle: z.string().optional(),
  labelFontSize: z.number().optional(),
  labelFontStyle: z.string().optional(),
});

export const CommonDiscountSchema = z.object({
  functionId: z.string().min(1),
  blockTitle: z.string().optional(),
  nameApp: z.string().min(1),
  nameStore: z.string().optional(),
  startsAt: z.string().nullable().optional(),
  endsAt: z.string().nullable().optional(),
  startTime: z.string().nullable().optional(),
  endTime: z.string().nullable().optional(),

  visibility: z.enum(["all", "specific", "except"]),
  eligibility: z.union([
    z.enum(["bundle_specific", "bundle_except"]),
    z.literal(""),
  ]).optional(),
  primarySpecificIds: z.array(z.string()).default([]).optional(),
  primaryExceptIds: z.array(z.string()).default([]).optional(),
  bundleSpecificIds: z.array(z.string()).default([]).optional(),
  bundleExceptIds: z.array(z.string()).default([]).optional(),
  collectionIds: z.array(z.string()).default([]).optional(),
  style: StyleSchema.optional(),
  status: z.string().optional(),
})
