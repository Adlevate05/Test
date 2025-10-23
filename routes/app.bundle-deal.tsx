// app/routes/app.bundle-deal.tsx
import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { AppProvider } from "../utils/AppContext";
import { parseDiscountDTO } from "../core/http/discount.request.parsers";
import { DiscountService } from "../core/services/discount.service";
import { getAdminAndShopFromRequest } from "../core/shopify/admin-client";
import { strategyMap } from "../core/services/strategies";
import { BundleDealForm } from "app/components/bundle-deal-form";
import { useLoaderData } from "@remix-run/react";
import { toAppContextInitial } from "app/utils/helpers";
import { getFunctionId } from "app/core/shopify/functions.server";

type ProductListItem = {
  id: string;
  title: string;
  imageSrc: string;
  imageAlt: string;
};

type LoaderData = {
  products: ProductListItem[];
  functionId: string;
  initial: any;
};

/* ----------------------------- Loader ---------------------------- */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await getAdminAndShopFromRequest(request);

  const QUERY = `#graphql
    query ListProducts($first: Int!) {
      products(first: $first) {
        edges {
          node {
            id
            title
            images(first: 1) { edges { node { transformedSrc altText } } }
          }
        }
      }
    }
  `;

  const response = await admin.graphql(QUERY, { variables: { first: 50 } });
  const { data } = await response.json();

  const products: ProductListItem[] = (data?.products?.edges ?? []).map(
    (edge: any): ProductListItem => {
      const n = edge.node;
      const img = n.images?.edges?.[0]?.node;
      return {
        id: n.id as string,
        title: n.title as string,
        imageSrc: (img?.transformedSrc as string) || "",
        imageAlt: (img?.altText as string) || (n.title as string),
      };
    },
  );
  const functionId = await getFunctionId(request);
  // ✅ Use URLSearchParams instead of params
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const themeColor = searchParams.get("theme") || "#000000";
  const lightThemeColor = searchParams.get("light") || "#ededed";

  const initial = {
    cardsBackground: lightThemeColor,
    selectedBackground: "#ffffff",
    borderColor: themeColor,
    labelBackground: themeColor,
    badgeBackground: themeColor,
  };

  return json<LoaderData>({ products, functionId, initial });
};

/* ----------------------------- Action ---------------------------- */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, shopDomain } = await getAdminAndShopFromRequest(request);

  const dto = await parseDiscountDTO(request, "volume-same-product");

  const service = new DiscountService(admin, shopDomain, strategyMap);

  try {
    await service.create("volume-same-product", dto);
    return redirect("/app");
  } catch (e: any) {
    return json(
      { errors: [{ message: e?.message ?? "Failed to create discount" }] },
      { status: 400 },
    );
  }
};

// ---- page wrapper ----
export default function BundleDealPage() {
  const data = useLoaderData<LoaderData>();
  const initialState = toAppContextInitial(data.initial);
  // Make sure to use optional chaining to safely access data.initial.id

  return (
    <AppProvider initialState={initialState}>
      {/* Pass theme + light down into form */}
      <BundleDealForm mode="create" />
    </AppProvider>
  );
}
