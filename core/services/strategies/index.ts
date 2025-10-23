// app/core/services/strategies/index.ts
import { VolumeSameProductStrategy } from "../../services/strategies/volume-same-product.strategy";
import { BogoStrategy } from "../../services/strategies/bogo.strategy";
// import others...

import type { DiscountStrategy } from "../discount.strategy";
import type {
  AnyDiscountCreateInput,
} from "../../dto/discount.dto";
import { QuantityBreakMultiProductStrategy } from "./quantity-break-multi-product.strategy";

export const strategyMap: Record<
  AnyDiscountCreateInput["type"],
  DiscountStrategy<any>
> = {
  "volume-same-product": new VolumeSameProductStrategy(),
  "bogo": new BogoStrategy(),
  "quantity-break-multi-product": new QuantityBreakMultiProductStrategy(),
};
