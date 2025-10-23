import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import './style.css'
import type { LoaderFunctionArgs } from "@remix-run/node";
import IntercomClient from "./components/intercomClient";
import { getShopInfo } from "./routes/app";
import { authenticate } from "./shopify.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);
  const shopInfo = await getShopInfo(admin);
   const createdAtUnix = Math.floor(Date.now() / 1000);
  const user = {
    id: shopInfo.id,
    name: shopInfo.name,
    email: shopInfo.myshopifyDomain,
    createdAt: createdAtUnix,
  };

  return { user };
}
export default function App() {
   const { user } = useLoaderData<typeof loader>();
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        />
        <Meta />
        <Links />
      </head>
      <body>
        {/* Global Intercom Messenger */}
        <IntercomClient user={user} />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
