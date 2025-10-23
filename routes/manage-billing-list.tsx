import * as React from "react";
import { LoaderFunction, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { MantleClient } from "@heymantle/client";
import { MantleProvider, useMantle } from "@heymantle/react";
import { authenticate } from "../shopify.server";

// ----- SERVER: Identify merchant and return tokens -----
export const loader: LoaderFunction = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  const shopInfo = await getShopInfo(admin);

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

  if ("error" in identified) {
    console.error("Mantle identify failed:", identified.error);
    throw new Response("Mantle identify failed", { status: 500 });
  }

  return json({
    mantleAppId: process.env.MANTLE_APP_ID!,
    customerApiToken: identified.apiToken,
    // planIds: [
    //   "7ae20d17-2813-465c-af57-85a25384038b",
    //   "e78162ea-b659-437b-aa1f-3ef002bed61a",
    //   "1bf38e2a-cef4-4993-922e-bc6dddfe66c5",
    // ],
    returnUrl: "/after-billing",
  });
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

// ----- CLIENT: Auto-redirect component -----
function HostedPlansAutoRedirect({
  returnUrl,
}: {
  returnUrl: string;
}) {
  const { createHostedSession } = useMantle();

  React.useEffect(() => {
    (async () => {
      const session = await createHostedSession({
        type: "plans",
        config: { returnUrl },
      });

      if ("error" in session) {
        console.error("Mantle hosted session failed:", session.error);
        alert("Could not start billing session");
        return;
      }

      // ✅ Immediately redirect out of iframe
      window.top!.location.href = session.url;
    })();
  }, [createHostedSession, returnUrl]);

  return <p>Redirecting to billing page…</p>;
}

// ----- CLIENT: Page wrapper -----
export default function ManageBillingPage() {
  const { mantleAppId, customerApiToken, returnUrl } =
    useLoaderData<typeof loader>();

  return (
    <MantleProvider appId={mantleAppId} customerApiToken={customerApiToken}>
      <HostedPlansAutoRedirect  returnUrl={returnUrl} />
    </MantleProvider>
  );
}
