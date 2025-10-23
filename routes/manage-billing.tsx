import { LoaderFunction, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { MantleClient } from "@heymantle/client";
import { authenticate } from "../shopify.server";
import React from "react";

export const loader: LoaderFunction = async ({ request }) => {
    const { admin, session } = await authenticate.admin(request);
    const shopInfo = await getShopInfo(admin);
    // 1. Mantle app client
    const client = new MantleClient({
        appId: process.env.MANTLE_APP_ID!,
        apiKey: process.env.MANTLE_API_KEY!,
    });

    // 2. Identify merchant
    const identified = await client.identify({
        platform: "shopify",
        platformId: shopInfo.id,
        myshopifyDomain: shopInfo.myshopifyDomain,
        accessToken: session.accessToken, // ✅ offline OAuth token
        name: shopInfo.name,
        email: shopInfo.email,
    });

    if ("error" in identified) {
        console.error("Mantle identify failed:", identified.error);
        throw new Response("Mantle identify failed", { status: 500 });
    }

    const customerApiToken = identified.apiToken;

    // 3. Customer-bound Mantle client
    const customerClient = new MantleClient({
        appId: process.env.MANTLE_APP_ID!,
        apiKey: process.env.MANTLE_API_KEY!,
        customerApiToken,
    });

    // 4. Create hosted billing session
    const result = await customerClient.subscribe({
        planIds: [
            "7ae20d17-2813-465c-af57-85a25384038b",
            "e78162ea-b659-437b-aa1f-3ef002bed61a",
            "1bf38e2a-cef4-4993-922e-bc6dddfe66c5",
        ],
        returnUrl: "https://winds-ambien-eligibility-ellis.trycloudflare.com/after-billing",
        hosted: true,
    });

    console.log("Mantle subscribe result:", result);


    if ("error" in result) {
        console.error("Mantle subscribe failed:", result.error);
        throw new Response("Billing setup failed", { status: 500 });
    }

    const confirmationUrl = result.confirmationUrl?.toString();
    if (!confirmationUrl) {
        throw new Response("No confirmation URL from Mantle", { status: 500 });
    }

    // ✅ Return JSON instead of redirect
    return json({ confirmationUrl });
};

// Utility to fetch shop info
export async function getShopInfo(admin: any) {
    const QUERY = `#graphql
    query {
      shop {
        id
        name
        email
        myshopifyDomain
        primaryDomain { url host }
        currencyCode
        currencyFormats { moneyFormat }
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
        currencyCode: data.shop.currencyCode,
    };
}

// Component: redirect merchant to Mantle billing
export default function ManageBillingPage() {
    const { confirmationUrl } = useLoaderData<typeof loader>();

    React.useEffect(() => {
        if (confirmationUrl) {
            // ✅ Smooth iframe escape
            window.top!.location.href = confirmationUrl;
        }
    }, [confirmationUrl]);

    return <p>Redirecting to billing…</p>;
}
