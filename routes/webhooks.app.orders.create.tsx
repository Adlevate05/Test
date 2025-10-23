import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { transformShopifyOrderToDto } from "../core/mappers/shopify-order.mapper";
import { AnalyticsBundleRevenueService } from "../core/services/analytics.bundle-revenue.service";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, payload, topic } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);
  const boosterNote = payload.note_attributes?.find(
    (attr: any) => attr.name === "booster" && attr.value === "true"
  );
  if (boosterNote) {
    const service = new AnalyticsBundleRevenueService();
    const dtos = transformShopifyOrderToDto(payload, shop);
    if (dtos.length > 0) {
      await service.bulkCreate(dtos);
      console.log(`Saved ${dtos.length} bundle revenue rows for order ${payload.id}`);
    } else {
      console.log("No bundle booster data found in this order.");
    }
  }
  return new Response("ok", { status: 200 });
};
