import { createContext, useContext } from "react";

export type CurrencyCtx = {
  currencyCode: string;
  symbol: string;
  moneyFormat?: string;
};

const Ctx = createContext<CurrencyCtx | null>(null);

export const CurrencyProvider = Ctx.Provider;

export function useCurrency() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCurrency must be used within <CurrencyProvider>");
  return v;
}
