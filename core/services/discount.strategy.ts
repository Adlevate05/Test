// app/core/discounts/strategy.ts
import type {
  AnyDiscountCreateInput,
} from "../dto/discount.dto";
import { BogoStrategy } from "./strategies/bogo.strategy";
import { QuantityBreakMultiProductStrategy } from "./strategies/quantity-break-multi-product.strategy";
import { VolumeSameProductStrategy } from "./strategies/volume-same-product.strategy";

export interface DiscountStrategy<
  TInput extends AnyDiscountCreateInput = AnyDiscountCreateInput,
  TFnCfg = unknown
> {
  readonly type: TInput["type"];
  validate(raw: unknown): TInput;
  buildFunctionConfig(input: TInput): TFnCfg;
  buildDiscountMeta?(input: TInput): {
    combinesWith?: { orderDiscounts?: boolean; productDiscounts?: boolean; shippingDiscounts?: boolean };
    discountClasses?: string[];
  };
}

// status strategies decide WHAT to do for a status (delete/create etc.)
export interface StatusStrategy {
  apply(boosterId: number, admin: string): Promise<void>;
}

export class DiscountTypeStrategyFactory {
  private readonly strategies: Record<string, DiscountStrategy<any, any>>;

  constructor() {
    this.strategies = {
      "bogo": new BogoStrategy(),
      "volume-same-product": new VolumeSameProductStrategy(),
      "quantity-break-multi-product": new QuantityBreakMultiProductStrategy(),
    };
  }

  get(type: string): DiscountStrategy<any, any> {
    const strategy = this.strategies[type];
    if (!strategy) {
      throw new Error(`No discount strategy registered for type: ${type}`);
    }
    return strategy;
  }
}