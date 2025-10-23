import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { toNumericIdStringOrThrow } from "app/core/helpers/common";
import { DiscountService } from "app/core/services/discount.service";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, session, payload, topic } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);
  const { admin_graphql_api_id } = payload as {
    admin_graphql_api_id: string;
    deleted_at?: string;
  };
  if (session) {
    const shopifyDiscountId = toNumericIdStringOrThrow(admin_graphql_api_id);
    if (shopifyDiscountId) {
      const service = new DiscountService(
        session,
        shop
      );
      await service.deleteByDiscountId(shopifyDiscountId);
    }
  }
  return new Response();
};
