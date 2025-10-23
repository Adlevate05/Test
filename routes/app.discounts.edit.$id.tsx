// app/routes/app.discounts.edit.$id.tsx
import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { DiscountService } from "app/core/services/discount.service";
import { getAdminAndShopFromRequest } from "app/core/shopify/admin-client";

// Map discount types -> your editor routes (relative paths!)
const ROUTE_BY_TYPE: Record<
  string,
  (args: { boosterId: number; shopifyId: string }) => string
> = {
  "volume-same-product": ({ shopifyId, boosterId }) =>
    // send user to your main setup page if this type edits there
    `/app/bundle-deal-edit/${boosterId}`,
  "quantity-break-multi-product": ({ boosterId }) =>
    `/app/deals/multi-product-edit/${boosterId}`,
  "bogo": ({ boosterId }) =>
    `/app/deals-bogo-edit/${boosterId}`,
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const discountId = params.id; // path param from /app/discounts/edit/:id
  if (!discountId) {
    return redirect("/app/deal-discount-setup");
  }

  // Read the current admin context from the incoming URL
  const url = new URL(request.url);
  const host = url.searchParams.get("host");
  const shop = url.searchParams.get("shop");
  const embedded = url.searchParams.get("embedded"); // often "1" in embedded apps

  // Your auth helper (should also validate the session)
  const { admin, shopDomain } = await getAdminAndShopFromRequest(request);
  const service = new DiscountService(admin, shopDomain);

  // Try your DB first (fast + you already store type)
  const booster = await service.findByShopifyId(discountId);

  // Compute the destination path inside YOUR app (relative path; no absolute Admin URL)
  const destPath =
    booster && ROUTE_BY_TYPE[booster.discount_type]
      ? ROUTE_BY_TYPE[booster.discount_type]({
          boosterId: booster.id,
          shopifyId: booster.shopify_discount_id,
        })
      : "/app/deal-discount-setup";

  // Preserve required query params so embedded auth stays happy
  const qs = new URLSearchParams();
  if (host) qs.set("host", host);
  if (shop) qs.set("shop", shop);
  if (embedded) qs.set("embedded", embedded);

  const location = qs.toString() ? `${destPath}?${qs.toString()}` : destPath;
  return redirect(location);
}

// Optional component (route is redirect-only, but Remix expects a default export)
export default function _EditRedirect() {
  return null;
}
