// put this in a shared `types.ts` file if multiple modules use it
export interface DiscountInput {
  functionId: string;
  title: string;
  startsAt: string;
  endsAt?: string | null;
  discountClasses: string[];
  combinesWith: {
    orderDiscounts: boolean;
    productDiscounts: boolean;
    shippingDiscounts: boolean;
  };
  metafields: Array<{
    namespace: string;
    key: string;
    type: "json";
    value: string;
  }>;
}
