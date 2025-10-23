import shopify from "../../shopify.server";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

export async function getAdminAndShopFromRequest(
  req: LoaderFunctionArgs["request"] | ActionFunctionArgs["request"]
) {
  const auth = await shopify.authenticate.admin(req);
  const admin = auth.admin;
  // adjust if your auth object differs:
  // @ts-ignore
  const shopDomain: string = auth?.session?.shop ?? auth?.shop ?? "";
  return { admin, shopDomain };
}
