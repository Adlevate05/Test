import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { DiscountService } from "app/core/services/discount.service";
import { getCurrencyForShop } from "app/core/shopify/currency.server";
import { parseUserAgent } from "app/core/helpers/userAgentParser";
import ORDER_CONSTANTS from "app/config/orderConstants";
import { encodeId } from "../utils/idEncoder";
import prisma from "app/db.server";
import { getAppEmbedStatus } from "app/core/shopify/app-embed.server";
import { getDrawerProducts } from "app/helper/helper";
import getProduct from "app/hooks/getProduct";

export async function loader({ request }: LoaderFunctionArgs) {
  // Authenticate as a public App Proxy request
  const { session, admin } = await authenticate.public.appProxy(request);

  if (!session) {
    return json(
      { error: "App is not installed on this shop." },
      { status: 401 },
    );
  }

  const shopDomain = session.shop;
  const service = new DiscountService(admin, shopDomain);

  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page") || 1);
  const pageSize = Number(url.searchParams.get("pageSize") || 10);
  const productId = url.searchParams.get("product_id");

  const isEmbeded = await getAppEmbedStatus(session);

  const rawIp =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const firstIp = rawIp.split(",")[0].trim();
  const ipv4Match = firstIp.match(/(\d{1,3}\.){3}\d{1,3}/);
  const ip = ipv4Match ? ipv4Match[0] : firstIp;

  const userAgent = request.headers.get("user-agent") || "";

  const { os, browser, platform } = parseUserAgent(userAgent);

  const { symbol } = await getCurrencyForShop(shopDomain, admin);

  if (!productId) {
    return json({ error: "Product ID is missing" }, { status: 400 });
  }

  try {
    const data = await getProduct(admin); 

    const allProducts =
      data?.products?.edges.map((edge: any) => edge.node) || [];

    const product = allProducts.find(
      (p: any) => p.id === `gid://shopify/Product/${productId}`,
    );

    if (!product) {
      return json({ error: "Product not found" }, { status: 404 });
    }

    const handle: string = product.handle;
    const prices = product.variants.edges.map((edge: any) => ({
      variantId: edge.node.id,
      price: edge.node.price,
    }));

    const { discount_block, bundleID, shopifyProductIds } =
      await service.getConditionalDiscounts({
        page,
        pageSize,
        productId,
        handle,
        prices,
        ip,
        os,
        browser,
        platform,
        symbol,
      });

    const productIds = shopifyProductIds.map((item) => item.productId);
    const sources = shopifyProductIds.map((item) => item.sourceArray);

    const drawerProducts = await getDrawerProducts(
      allProducts,
      sources,
      productIds,
    );

    let bundle_booster = "false";

    if (discount_block.blockHtml) {
      bundle_booster = "true";
    }

    let bundle_id = encodeId(String(bundleID));

    if (discount_block.blockHtml) {
      return json({
        blockHtml: discount_block.blockHtml,
        bundleid: bundle_id,
        bundlebooster: bundle_booster,
        orderConstants: ORDER_CONSTANTS,
        embedValue: isEmbeded,
        DrawerProducts: drawerProducts,
        Singleproduct: product, 
      });
    } else {
      return json({ blockHtml: null });
    }
  } catch (error: any) {
    console.error("Error fetching product data:", error);
    return json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}
