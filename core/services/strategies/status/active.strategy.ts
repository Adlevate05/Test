import { boosterDiscountRepository } from './../../../repositories/booster.discount.repository';
import { mapRecordToStrategyDto } from "app/core/dto/booster-discount.mapper";
import { DiscountTypeStrategyFactory } from "../../discount.strategy";
import type { StatusStrategy } from "../../discount.strategy";
import type { AnyDiscountCreateInput } from 'app/core/dto/discount.dto';
import { createAutomaticAppDiscount } from 'app/core/repositories/shopify/discount.repository';
import type { DiscountInput } from 'app/utils/types/discount.input.type';
import { toNumericIdStringOrThrow } from 'app/core/helpers/common';

export class ActiveStatusStrategy implements StatusStrategy {
    async apply(boosterId: number, admin: string): Promise<void> {
        const rec = await boosterDiscountRepository.findByIdWithRelations(boosterId);
        if (!rec) throw new Error("Discount not found");
        // build via the type strategy
        const typeFactory = new DiscountTypeStrategyFactory();
        const strategy = typeFactory.get(rec.discount_type);
        const dto = mapRecordToStrategyDto(rec);
        const input: AnyDiscountCreateInput = strategy.validate({
            ...(dto as any),
            type: rec.discount_type,
        });
        // Function/metafield config + meta
        const cfg = strategy.buildFunctionConfig(input);
        const meta = strategy.buildDiscountMeta?.(input) ?? {};

        // Publish-time guard: if startsAt is in the future, clamp to now (prevents accidental scheduling)
        const now = new Date();
        const startsDate = input.startsAt ? new Date(input.startsAt) : now;
        const startsAt = startsDate.toISOString();
        // Per-type namespace (so volume/bogo/qbmp don’t collide)
        const namespace = `$app:volume-discount`;
        // Build the Admin API payload
        const discountInput: DiscountInput = {
            functionId: input.functionId,
            title: input.nameApp,
            startsAt,
            ...(input.endsAt != null ? { endsAt: input.endsAt } : {}),
            discountClasses: meta.discountClasses ?? ["PRODUCT"],
            combinesWith: {
                orderDiscounts: meta.combinesWith?.orderDiscounts ?? false,
                productDiscounts: meta.combinesWith?.productDiscounts ?? false,
                shippingDiscounts: meta.combinesWith?.shippingDiscounts ?? false,
            },
            metafields: [
                {
                    namespace,
                    key: "function-configuration",
                    type: "json",
                    value: JSON.stringify(cfg),
                },
            ],
        };
        const { status, discountId } = await createAutomaticAppDiscount(
            admin,
            discountInput,
        );
        await boosterDiscountRepository.updateById(boosterId, { status: status.toLowerCase(), shopify_discount_id: toNumericIdStringOrThrow(discountId), });
    }
}