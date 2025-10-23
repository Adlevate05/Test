import * as React from "react";
import { LoaderFunction, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { MantleClient } from "@heymantle/client";
import { MantleProvider, useMantle } from "@heymantle/react";
import { authenticate } from "../shopify.server";

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
    throw new Response("Mantle identify failed", { status: 500 });
  }

  return json({
    mantleAppId: process.env.MANTLE_APP_ID!,
    customerApiToken: identified.apiToken,
    returnUrl: "/app", // where to come back after closing
  });
};

async function getShopInfo(admin: any) {
  const QUERY = `#graphql
    query {
      shop {
        id
        name
        email
        myshopifyDomain
      }
    }
  `;
  const res = await admin.graphql(QUERY);
  const { data } = await res.json();
  return data.shop;
}

function HostedAccountButton({ returnUrl }: { returnUrl: string }) {
  const { createHostedSession } = useMantle();

  const onClick = async () => {
    const session = await createHostedSession({
      type: "account",
      config: { returnUrl },
    });

    if ("error" in session) {
      console.error("Mantle account session failed:", session.error);
      alert("Could not open account page");
      return;
    }

    window.top!.location.href = session.url;
  };

  return <button onClick={onClick}>Manage Account</button>;
}

export default function ManageAccountPage() {
  const { mantleAppId, customerApiToken, returnUrl } =
    useLoaderData<typeof loader>();

  return (
    <MantleProvider appId={mantleAppId} customerApiToken={customerApiToken}>
      <div style={{ padding: "2rem" }}>
        <h2>Account Settings</h2>
        <p>Manage your subscription, cancel, or view invoices:</p>
        <HostedAccountButton returnUrl={returnUrl} />
      </div>
    </MantleProvider>
  );
}
