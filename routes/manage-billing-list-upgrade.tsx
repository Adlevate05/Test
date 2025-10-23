// app/routes/manage-billing.tsx
import * as React from "react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { MantleClient } from "@heymantle/client";
import { MantleProvider, useMantle } from "@heymantle/react";
import { authenticate } from "../shopify.server";

type LoaderData = {
  mantleAppId: string;
  customerApiToken: string;
  planIds: string[];
  returnUrl: string;
};

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
    accessToken: session.accessToken, // offline OAuth token
    name: shopInfo.name,
    email: shopInfo.email,
  });

  if ("error" in identified) {
    console.error("Mantle identify failed:", identified.error);
    throw new Response("Mantle identify failed", { status: 500 });
  }

  return json<LoaderData>({
    mantleAppId: process.env.MANTLE_APP_ID!,
    customerApiToken: identified.apiToken,
    planIds: [
      "7ae20d17-2813-465c-af57-85a25384038b",
      "e78162ea-b659-437b-aa1f-3ef002bed61a",
      "1bf38e2a-cef4-4993-922e-bc6dddfe66c5",
    ],
    returnUrl: "/after-billing",
  });
};

type ShopInfo = {
  id: string;
  name: string;
  email: string;
  myshopifyDomain: string;
  primaryDomain: string;
};

export async function getShopInfo(admin: any): Promise<ShopInfo> {
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

/* ----------------------- Client components ----------------------- */

function HostedPlansButton({
  planIds,
  returnUrl,
}: {
  planIds: string[];
  returnUrl: string;
}) {
  const { createHostedSession } = useMantle();
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  const onClick = async () => {
    setBusy(true);
    setErr(null);

    const session = await createHostedSession({
      type: "plans",
      config: { planIds, returnUrl },
    });

    if ("error" in session) {
      console.error("Mantle hosted session failed:", session.error);
      setErr("Could not start billing session. Please try again.");
      setBusy(false);
      return;
    }

    // Break out of Shopify Admin iframe
    window.top!.location.href = session.url;
  };

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <button onClick={onClick} disabled={busy} style={{ padding: "8px 12px" }}>
        {busy ? "Opening…" : "Upgrade Plan"}
      </button>
      {err ? <small style={{ color: "crimson" }}>{err}</small> : null}
    </div>
  );
}

export default function ManageBillingPage() {
  const { mantleAppId, customerApiToken, planIds, returnUrl } =
    useLoaderData<LoaderData>();

  return (
    <MantleProvider appId={mantleAppId} customerApiToken={customerApiToken}>
      <div style={{ padding: "2rem", maxWidth: 640 }}>
        <h2 style={{ marginBottom: 8 }}>Manage Billing</h2>
        <p style={{ marginBottom: 16 }}>
          Click below to open the hosted plan selection page.
        </p>
        <HostedPlansButton planIds={planIds} returnUrl={returnUrl} />
      </div>
    </MantleProvider>
  );
}
