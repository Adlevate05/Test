import { boosterDiscountRepository } from './../../../repositories/booster.discount.repository';
import type { StatusStrategy } from "../../discount.strategy";
import { deleteAutomaticAppDiscount } from 'app/core/repositories/shopify/discount.repository';

export class DraftStatusStrategy implements StatusStrategy {
    async apply(boosterId: number, admin: string): Promise<void> {
        const rec = await boosterDiscountRepository.findByIdWithRelations(boosterId);
        if (!rec) throw new Error("Discount not found");
        // Now delete from Shopify using the retrieved ID
        await deleteAutomaticAppDiscount(
            admin,
            rec.shopify_discount_id,
        );
        await boosterDiscountRepository.updateById(boosterId, { status: 'draft' });
    }
}