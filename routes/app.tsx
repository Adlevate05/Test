import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider as ShopifyAppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

import { authenticate } from "../shopify.server";
import { CurrencyProvider } from "../utils/CurrencyContext";
import { getCurrencyForShop } from "app/core/shopify/currency.server";
import { MantleClient } from "@heymantle/client";
import { MantleProvider } from "@heymantle/react";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // 1. Shopify auth
  const { admin, session } = await authenticate.admin(request);
  const shopDomain = session?.shop ?? "";
  const shopInfo = await getShopInfo(admin);

  // 2. Currency (optional)
  const currency = await getCurrencyForShop(shopDomain, admin);

  // 3. Mantle identify
  const mantle = new MantleClient({
    appId: process.env.MANTLE_APP_ID!,
    apiKey: process.env.MANTLE_API_KEY!,
  });

  const identified = await mantle.identify({
    platform: "shopify",
    platformId: shopInfo.id,
    myshopifyDomain: shopInfo.myshopifyDomain,
    accessToken: session.accessToken,
    name: shopInfo.name,
    email: shopInfo.email,
  });

  if ("error" in identified || !identified.apiToken) {
    console.error("Mantle identify failed:", identified);
    throw new Response("Mantle identify failed", { status: 500 });
  }

  // 4. Send data to client
  return json({
    apiKey: process.env.SHOPIFY_API_KEY || "",
    currency,
    mantleAppId: process.env.MANTLE_APP_ID!,
    customerApiToken: identified.apiToken,
  });
};

export default function App() {
  const { apiKey, currency, mantleAppId, customerApiToken } = useLoaderData<typeof loader>();
  return (
    <ShopifyAppProvider isEmbeddedApp apiKey={apiKey}>
      <CurrencyProvider value={currency}>
        <MantleProvider appId={mantleAppId} customerApiToken={customerApiToken}>
          <NavMenu>
            <Link to="/app" rel="home">Home</Link>
            <Link to="/app/bundles-page" rel="bundles-page">Bundles</Link>
            <Link to="/app/analytics-page" rel="analytics-page">Analytics</Link>
            <Link to="/app/plans-page" rel="plans-page">Plans</Link>
            {/* <Link to="/manage-billing-list">
              <button>Heymantle Plans</button>
            </Link> */}
          </NavMenu>
          <Outlet />
        </MantleProvider>
      </CurrencyProvider>
    </ShopifyAppProvider>
  );
}

// Shopify needs Remix to catch thrown responses
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};

// ----- SHOP INFO HELPER -----
export async function getShopInfo(admin: any) {
  const QUERY = `#graphql
    query {
      shop {
        id
        name
        email
        myshopifyDomain
        primaryDomain { host }
      }
    }
  `;
  const res = await admin.graphql(QUERY);
  const { data } = await res.json();

  return {
    id: data.shop.id,
    name: data.shop.name,
    email: data.shop.email,
    myshopifyDomain: data.shop.myshopifyDomain,
    primaryDomain: data.shop.primaryDomain.host,
  };
}
