import { useState, useCallback } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useSubmit, useActionData, useParams, useLoaderData } from "@remix-run/react";
import {
  Button,
  Banner,
  Text,
  TextField,
  Card,
  Layout,
  Page,
  Box,
  BlockStack,
  Select,
  ResourceList,
  ResourceItem,
  Thumbnail,
  Modal,
} from "@shopify/polaris";
import shopify from "../shopify.server";

import { getAdminAndShopFromRequest } from "../core/shopify/admin-client";
import { DiscountService } from "../core/services/discount.service";
import { strategyMap } from "../core/services/strategies";
import { parseDiscountDTO } from "../core/http/discount.request.parsers";

/* ----------------------------- Types ----------------------------- */

type ProductListItem = {
  id: string;
  title: string;
  imageSrc: string;
  imageAlt: string;
};

type LoaderData = { products: ProductListItem[] };

type UiError = { field?: string[]; message: string };

type DiscountMode = "all" | "products" | "collections";
type DiscountKind = "percentage" | "fixedAmount";

/* ----------------------------- Loader ---------------------------- */
// Loader: fetch products for selection modal
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await shopify.authenticate.admin(request);

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

  return json<LoaderData>({ products });
};

/* ----------------------------- Action ---------------------------- */
// Creates the discount using the service + strategy pattern
export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { admin, shopDomain } = await getAdminAndShopFromRequest(request);

  // ✅ Use the generic parser with kebab-case type (it supports flat form fields)
  const dto = await parseDiscountDTO(request, params, "volume-same-product");

  const service = new DiscountService(
    admin,
    shopDomain,
    strategyMap
  );

  try {
    await service.create("volume-same-product", dto); // strategy builds config server-side
    return redirect("/app/volume-discounts");
  } catch (e: any) {
    return json({ errors: [{ message: e?.message ?? "Failed to create discount" }] }, { status: 400 });
  }
};

/* --------------------------- Component --------------------------- */
export default function NewVolumeDiscount() {
  const { functionId } = useParams<{ functionId: string }>();
  const { products } = useLoaderData<LoaderData>();
  const submit = useSubmit();
  const actionData = useActionData<{ errors?: UiError[] }>();

  // State
  const [discountTitle, setDiscountTitle] = useState<string>("");
  const [discountType, setDiscountType] = useState<DiscountKind>("percentage");

  const [mode, setMode] = useState<DiscountMode>("all");
  const [productIds, setProductIds] = useState<string[]>([]);
  const [collectionIds, setCollectionIds] = useState<string>("");

  const [quantity, setQuantity] = useState<string>("5");
  const [value, setValue] = useState<string>("10");

  const [localErrors, setLocalErrors] = useState<UiError[]>([]);
  const [showProductModal, setShowProductModal] = useState<boolean>(false);

  const handleClick = useCallback(() => {
    const errors: UiError[] = [];

    if (!functionId) {
      errors.push({
        field: [],
        message: "Function ID is missing from the URL. Please ensure your app is configured correctly.",
      });
    }
    if (!discountTitle) {
      errors.push({ field: ["title"], message: "Discount title is required." });
    }
    if (Number(quantity) < 1) {
      errors.push({ field: ["quantity"], message: "Quantity must be at least 1." });
    }
    if (Number(value) < 1) {
      errors.push({ field: ["discountValue"], message: "Discount value must be a positive number." });
    }
    if (mode === "products" && productIds.length === 0) {
      errors.push({ field: ["productIds"], message: "Please select at least one product." });
    }

    if (errors.length > 0) {
      setLocalErrors(errors);
      return;
    }

    // ✅ FLAT FORMDATA submit – no JSON blob, no metafields/config on the client
    const fd = new FormData();
    // You can omit functionId (server will inject from params), but including is fine:
    if (functionId) fd.set("functionId", functionId);

    fd.set("title", discountTitle);
    fd.set("mode", mode);
    productIds.forEach((id) => fd.append("productIds[]", id));
    fd.set("collectionIds", collectionIds); // parser accepts csv or [] pattern
    fd.set("quantity", quantity); // keep as string; parser will coerce to number
    fd.set("discountType", discountType);
    fd.set("discountValue", value); // keep as string; parser will coerce

    // optional timing
    // fd.set("startsAt", new Date().toISOString());
    // fd.set("endsAt", "");

    submit(fd, { method: "post" });
  }, [functionId, discountTitle, mode, productIds, collectionIds, quantity, discountType, value, submit]);

  const modeOptions = [
    { label: "All Products", value: "all" },
    { label: "Specific Products", value: "products" },
  ] as const;

  const discountTypeOptions = [
    { label: "Percentage", value: "percentage" },
    { label: "Fixed Amount", value: "fixedAmount" },
  ] as const;

  const allErrors: UiError[] = actionData?.errors ?? localErrors;

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Card>
            <Text as="h2" variant="headingLg">
              Quantity breaks for the same product
            </Text>

            {allErrors.length > 0 && (
              <Banner tone="critical">
                <ul>
                  {allErrors.map((e, i) => (
                    <li key={i}>
                      {e.field?.join(".")}: {e.message}
                    </li>
                  ))}
                </ul>
              </Banner>
            )}

            <BlockStack gap="500">
              <Box paddingBlockStart="400">
                <BlockStack gap="200">
                  <Text as="h3" variant="headingMd">
                    Discount Details
                  </Text>
                  <TextField
                    label="Discount Title"
                    value={discountTitle}
                    onChange={(v) => setDiscountTitle(v)}
                    autoComplete="off"
                    helpText="Enter a descriptive title for your discount."
                  />
                </BlockStack>
              </Box>

              <Box paddingBlockStart="400">
                <BlockStack gap="200">
                  <Text as="h3" variant="headingMd">
                    Discount Scope
                  </Text>
                  <Select
                    label="Apply discount to"
                    options={modeOptions as any}
                    onChange={(v) => setMode(v as DiscountMode)}
                    value={mode}
                    helpText="Choose whether to apply the volume discount to all products or specific ones."
                  />
                  {mode === "products" && (
                    <>
                      <Button onClick={() => setShowProductModal(true)}>Select Products</Button>
                      {productIds.length > 0 && (
                        <Text as="p" variant="bodyMd" tone="subdued">
                          Selected Products:{" "}
                          {products
                            .filter((p) => productIds.includes(p.id))
                            .map((p) => p.title)
                            .join(", ")}
                        </Text>
                      )}
                    </>
                  )}
                  {mode === "collections" && (
                    <TextField
                      label="Collection IDs (comma-separated)"
                      value={collectionIds}
                      onChange={(v) => setCollectionIds(v)}
                      autoComplete="off"
                      helpText="Enter the Collection IDs for the volume discount, separated by commas."
                    />
                  )}
                </BlockStack>
              </Box>

              <Box paddingBlockStart="400">
                <BlockStack gap="200">
                  <Text as="h3" variant="headingMd">
                    Volume Discount Configuration
                  </Text>
                  <Select
                    label="Discount Type"
                    options={discountTypeOptions as any}
                    onChange={(v) => setDiscountType(v as DiscountKind)}
                    value={discountType}
                  />
                  <TextField
                    label="Quantity"
                    value={quantity}
                    onChange={(v) => setQuantity(v)}
                    type="number"
                    min={1}
                    autoComplete="off"
                    helpText="Minimum quantity to be eligible for this discount."
                  />
                  {discountType === "percentage" && (
                    <TextField
                      label="Percentage OFF"
                      value={value}
                      onChange={(v) => setValue(v)}
                      type="number"
                      min={1}
                      max={100}
                      suffix="%"
                      autoComplete="off"
                      helpText="The percentage to discount."
                    />
                  )}
                  {discountType === "fixedAmount" && (
                    <TextField
                      label="Fixed Amount OFF"
                      value={value}
                      onChange={(v) => setValue(v)}
                      type="number"
                      min={1}
                      prefix="₹"
                      autoComplete="off"
                      helpText="The fixed amount to discount per line item."
                    />
                  )}
                </BlockStack>
              </Box>
            </BlockStack>

            <Box paddingBlockStart="500">
              <Button onClick={handleClick} fullWidth>
                Create Volume Discount
              </Button>
            </Box>
          </Card>
        </Layout.Section>
      </Layout>

      {/* Product Selection Modal */}
      <Modal
        open={showProductModal}
        onClose={() => setShowProductModal(false)}
        title="Select Products"
        primaryAction={{
          content: "Select",
          onAction: () => setShowProductModal(false),
        }}
      >
        <Modal.Section>
          <ResourceList
            resourceName={{ singular: "product", plural: "products" }}
            items={products}
            selectedItems={productIds}
            onSelectionChange={(ids) => setProductIds(ids as string[])}
            selectable
            renderItem={({ id, title, imageSrc, imageAlt }: ProductListItem) => (
              <ResourceItem
                id={id}
                media={<Thumbnail source={imageSrc} alt={imageAlt} />}
                onClick={() => { /* no-op: selection is handled by ResourceList */ }}
                accessibilityLabel={`Select ${title}`}
              >
                {title}
              </ResourceItem>
            )}
          />
        </Modal.Section>
      </Modal>
    </Page>
  );
}
