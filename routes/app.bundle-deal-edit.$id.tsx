import { json, type ActionFunctionArgs, type LoaderFunctionArgs, redirect } from "@remix-run/node";
import { AppProvider } from "../utils/AppContext";
import { parseDiscountDTO } from "../core/http/discount.request.parsers";
import { DiscountService } from "../core/services/discount.service";
import { getAdminAndShopFromRequest } from "../core/shopify/admin-client";
import { strategyMap } from "../core/services/strategies";
import { BundleDealForm } from "app/components/bundle-deal-form";
import { useLoaderData } from "@remix-run/react";
import { parseOptions, toAppContextInitial, toBlockStyle } from "../utils/helpers";
import { getFunctionId } from "app/core/shopify/functions.server";




type ProductListItem = {
  id: string;
  title: string;
  imageSrc: string;
  imageAlt: string;
};

type LoaderData = { products: ProductListItem[], functionId?: string, initial: any };

/* ----------------------------- Loader ---------------------------- */
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { admin, shopDomain } = await getAdminAndShopFromRequest(request);
  const { id } = params;

  if (!id) {
    throw new Response("Missing id", { status: 400 });
  }

  const numericId = Number(id);

  if (isNaN(numericId)) {
    throw new Response("Invalid id", { status: 400 });
  }

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
    }
  );
  const functionId = await getFunctionId(request);

  const service = new DiscountService(
    admin,
    shopDomain,
    strategyMap
  );

  const existing = await service.findById(numericId);
  const styleObj = toBlockStyle(existing?.configuration_block_style);
  const options = parseOptions(existing?.configuration_block_options);
  const toProductGid = (id: string | number) => `gid://shopify/Product/${id}`;
  const mapProdIds = (rows?: Array<{ shopify_product_id: string | number }>) =>
    Array.isArray(rows) ? rows.map(r => toProductGid(r.shopify_product_id)) : [];

  const initial = {
    id: existing?.id,
    bundleName: existing?.name_app ?? existing?.name_app ?? "Bundle deal",
    discountName: existing?.name_store ?? existing?.name_store ?? "Discount Name",
    blockTitle: existing?.block_title ?? existing?.block_title ?? "Block Title",
    visibility: existing?.visibility_primary === "all" ? "all" : existing?.visibility_primary === "specific" ? "specific" : "except",
    startDate: existing?.start_date
      ? existing.start_date.toISOString().split("T")[0] // yyyy-mm-dd
      : undefined,

    startTime: existing?.start_time
      ? existing.start_time // HH:mm
      : undefined,

    endDate: existing?.end_date
      ? existing.end_date.toISOString().split("T")[0]
      : undefined,

    endTime: existing?.end_time
      ? existing.end_time
      : undefined,
    hasEndDate: existing?.end_date ? true : false,
    spacing: styleObj?.spacing,
    badgeText: styleObj?.badgeText,
    labelText: styleObj?.labelText,
    priceColor: styleObj?.priceColor,
    titleColor: styleObj?.titleColor,
    borderColor: styleObj?.borderColor,
    cornerRadius: styleObj?.cornerRadius,
    labelFontSize: styleObj?.labelFontSize,
    selectedStyle: styleObj?.selectedStyle,
    subtitleColor: styleObj?.subtitleColor,
    titleFontSize: styleObj?.titleFontSize,
    fullPriceColor: styleObj?.fullPriceColor,
    labelFontStyle: styleObj?.labelFontStyle,
    titleFontStyle: styleObj?.titleFontStyle,
    badgeBackground: styleObj?.badgeBackground,
    blockTitleColor: styleObj?.blockTitleColor,
    cardsBackground: styleObj?.cardsBackground,
    labelBackground: styleObj?.labelBackground,
    subtitleFontSize: styleObj?.subtitleFontSize,
    subtitleFontStyle: styleObj?.subtitleFontStyle,
    blockTitleFontSize: styleObj?.blockTitleFontSize,
    selectedBackground: styleObj?.selectedBackground,
    blockTitleFontStyle: styleObj?.blockTitleFontStyle,
    packages: options,
    primarySpecificIds: mapProdIds(existing?.primary_specific_products),
    primaryExceptIds: mapProdIds(existing?.primary_except_products),
    bundleSpecificIds: mapProdIds(existing?.bundle_specific_products),
    bundleExceptIds: mapProdIds(existing?.bundle_except_products),
  };
  return json<LoaderData>({ products, functionId, initial });
};

/* ----------------------------- Action ---------------------------- */
export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { admin, shopDomain } = await getAdminAndShopFromRequest(request);
  const numericId = Number(params.id);
  if (isNaN(numericId)) throw new Error("Invalid ID");

  // Parse the posted form into a camelCased DTO (volume-same-product for now)
  const dto = await parseDiscountDTO(request, "volume-same-product");

  const service = new DiscountService(
    admin,
    shopDomain,
    strategyMap
  );

  try {
    await service.update("volume-same-product", dto, numericId);
    return redirect("/app");
  } catch (e: any) {
    return json({ errors: [{ message: e?.message ?? "Failed to update discount" }] }, { status: 400 });
  }
};

// ---- page wrapper ----

export default function BundleDealEdit() {
  const data = useLoaderData<LoaderData>();
  const initialState = toAppContextInitial(data.initial);
  // Make sure to use optional chaining to safely access data.initial.id
  const bundleId = data.initial?.id;

  return (
    <AppProvider initialState={initialState}>
      <BundleDealForm mode="edit" id={bundleId} />
    </AppProvider>
  );
}

