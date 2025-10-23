import { useEffect, useState } from "react";
import { useMantle } from "@heymantle/react";

type MantleSubscription = {
  id: string;
  active: boolean;
  billingStatus: "trialing" | "active" | "canceled" | string;
};

export function useIsSubscribed() {
  const { customer } = useMantle();
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
      const subscription = customer?.subscription as MantleSubscription | undefined;
      setIsSubscribed(!!subscription?.active);
  }, [customer]);

  return { isSubscribed };
}
