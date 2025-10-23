// app/routes/app.volume-discount.$functionId.$discountId.edit.jsx
import { useState, useEffect } from "react";
import { json, redirect } from "@remix-run/node";
import {
  useLoaderData,
  useActionData,
  useParams,
  useSubmit,
} from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Box,
  Text,
  TextField,
  Select,
  Banner,
  Button,
  Spinner,
  BlockStack,
} from "@shopify/polaris";
import shopify from "../shopify.server";

// ─── LOADER ────────────────────────────────────────────────────────────────────
export const loader = async ({ request, params }) => {
  const { id } = params;
  const discountId = id; 
  const { admin } = await shopify.authenticate.admin(request);

  const response = await admin.graphql(
    `#graphql
      query GetDiscount($id: ID!) {
        discountNode(id: $id) {
          configurationField: metafield(
            namespace: "$app:volume-discount"
            key: "function-configuration"
          ) {
            id
            value
          }
          discount {
            __typename
            ... on DiscountAutomaticApp {
              title
              discountClass
              combinesWith {
                orderDiscounts
                productDiscounts
                shippingDiscounts
              }
              startsAt
              endsAt
            }
            ... on DiscountCodeApp {
              title
              discountClass
              combinesWith {
                orderDiscounts
                productDiscounts
                shippingDiscounts
              }
              startsAt
              endsAt
              usageLimit
              appliesOncePerCustomer
              codes(first: 1) {
                nodes {
                  code
                }
              }
            }
          }
        }
      }`,
    {
      variables: {
        id: `gid://shopify/DiscountNode/${discountId}`,
      },
    },
  );

  const { data } = await response.json();
  if (!data.discountNode || !data.discountNode.configurationField) {
    return json({ discount: null });
  }

  const cfg        = JSON.parse(data.discountNode.configurationField.value);
  const mfId       = data.discountNode.configurationField.id;
  const disc       = data.discountNode.discount;
  const title      = disc.title;
  const codes      = disc.codes?.nodes || [];
  const config     = { ...cfg, metafieldId: mfId };

  return json({
    discount: {
      title,
      code: codes[0]?.code || "",
      combinesWith: disc.combinesWith,
      usageLimit: disc.usageLimit ?? null,
      appliesOncePerCustomer: disc.appliesOncePerCustomer ?? false,
      startsAt: disc.startsAt,
      endsAt: disc.endsAt,
      configuration: config,
    }
  });
};

// ─── ACTION ────────────────────────────────────────────────────────────────────
export const action = async ({ request, params }) => {
  const { id } = params;
  const discountId = id;
  const { admin }       = await shopify.authenticate.admin(request);
  const formData        = await request.formData();
  const discountPayload = JSON.parse(formData.get("discount"));

  const UPDATE = `#graphql
    mutation UpdateAutomaticDiscount(
      $id: ID!,
      $automaticAppDiscount: DiscountAutomaticAppInput!
    ) {
      discountAutomaticAppUpdate(
        id: $id,
        automaticAppDiscount: $automaticAppDiscount
      ) {
        automaticAppDiscount {
          title
          status
          appDiscountType {
            appKey
            functionId
          }
        }
        userErrors {
          field
          message
        }
      }
    }`;

  const resp = await admin.graphql(UPDATE, {
    variables: {
      id: `gid://shopify/DiscountAutomaticNode/${discountId}`,
      automaticAppDiscount: discountPayload,
    },
  });

  const { data, errors } = await resp.json();
  if (errors) {
    console.error(errors);
    return json({ errors }, { status: 500 });
  }

  const { userErrors } = data.discountAutomaticAppUpdate;
  if (userErrors.length) {
    return json({ errors: userErrors }, { status: 400 });
  }
  return redirect("/app/volume-discounts");
  //return json({ success: true, id: discountId });
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function EditVolumeDiscount() {
  const submit     = useSubmit();
  const actionData = useActionData();
  const { discount } = useLoaderData();
  const [loading, setLoading] = useState(true);

  // form state
  const [mode, setMode]                         = useState("all");
  const [productIds, setProductIds]             = useState("");
  const [collectionIds, setCollectionIds]       = useState("");
  const [bogoBuyIds, setBogoBuyIds]             = useState("");
  const [bogoFreeIds, setBogoFreeIds]           = useState("");
  const [bogoType, setBogoType]                 = useState("percentage");
  const [bogoValue, setBogoValue]               = useState("100");
  const [volPctQty, setVolPctQty]               = useState("5");
  const [volPctVal, setVolPctVal]               = useState("10");
  const [volAmtQty, setVolAmtQty]               = useState("3");
  const [volAmtVal, setVolAmtVal]               = useState("20");
  const [discountTitle, setDiscountTitle]       = useState("");

  useEffect(() => {
    if (!discount) return;
    const cfg = discount.configuration;
    setMode(cfg.mode || "all");
    setDiscountTitle(discount.title || "");
    setProductIds((cfg.productIds || []).join(", "));
    setCollectionIds((cfg.collectionIds || []).join(", "));

    const bogo = (cfg.configurations || []).find(c => c.type === "bogo") || {};
    setBogoBuyIds((bogo.buyProductIds || []).join(", "));
    setBogoFreeIds((bogo.freeProductIds || []).join(", "));
    setBogoType(bogo.freeDiscountType || "percentage");
    setBogoValue(String(bogo.freeDiscountValue || 100));

    const pct = (cfg.configurations || []).find(c => c.type === "percentage") || {};
    setVolPctQty(String(pct.quantity || 5));
    setVolPctVal(String(pct.value || 10));

    const amt = (cfg.configurations || []).find(c => c.type === "fixedAmount") || {};
    setVolAmtQty(String(amt.quantity || 3));
    setVolAmtVal(String(amt.value || 20));

    setLoading(false);
  }, [discount]);

  const handleSubmit = () => {
    const newConfig = {
      mode,
      productIds: productIds.split(",").map(s => s.trim()).filter(Boolean),
      collectionIds: collectionIds.split(",").map(s => s.trim()).filter(Boolean),
      configurations: [
        {
          type: "bogo",
          buyProductIds: bogoBuyIds.split(",").map(s => s.trim()).filter(Boolean),
          freeProductIds: bogoFreeIds.split(",").map(s => s.trim()).filter(Boolean),
          freeDiscountType: bogoType,
          freeDiscountValue: Number(bogoValue),
        },
        {
          type: "percentage",
          quantity: Number(volPctQty),
          value: Number(volPctVal),
        },
        {
          type: "fixedAmount",
          quantity: Number(volAmtQty),
          value: Number(volAmtVal),
        },
      ],
    };

    const payload = {
      title: discountTitle,
      startsAt: discount.startsAt,
      endsAt: discount.endsAt,
      discountClasses: ["PRODUCT"],
      combinesWith: discount.combinesWith,
      metafields: [
        {
          // include existing metafield ID to update instead of creating a new one
          id: discount.configuration.metafieldId,
          // namespace: "$app:volume-discount",
          // key: "function-configuration",
          // type: "json",
          value: JSON.stringify(newConfig),
        },
      ],
    };

    submit(
      { discount: JSON.stringify(payload) },
      { method: "post" }
    );
  };

  if (loading) {
    return (
      <Page>
        <Layout>
          <Layout.Section>
            <Card sectioned>
              <Box paddingBlockStart="400">
                <Spinner accessibilityLabel="Loading…" size="large" />
                <Text alignment="center">Loading discount…</Text>
              </Box>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <Text as="h2" variant="headingLg">Edit BOGO + Volume Discount</Text>

            {actionData?.errors && (
              <Banner tone="critical">
                <ul>
                  {actionData.errors.map((e, i) => (
                    <li key={i}>{e.field?.join(".")}: {e.message}</li>
                  ))}
                </ul>
              </Banner>
            )}
            {actionData?.success && (
              <Banner tone="positive">Successfully updated discount {actionData.id}</Banner>
            )}

            <BlockStack gap="500">
              <Box paddingBlockStart="400">
                <BlockStack gap="200">
                  <Text as="h3" variant="headingMd">Discount Details</Text>
                  <TextField
                    label="Discount Title"
                    value={discountTitle}
                    onChange={setDiscountTitle}
                    helpText="Enter a descriptive title for your discount."
                  />
                </BlockStack>
              </Box>

              {/* Scope */}
              <Text as="h3" variant="headingMd">Scope</Text>
              <Select
                label="Apply to"
                options={[
                  { label: "All Products", value: "all" },
                  { label: "Specific Products", value: "products" },
                  { label: "Specific Collections", value: "collections" },
                ]}
                value={mode}
                onChange={setMode}
              />
              {mode === "products" && (
                <TextField
                  label="Product IDs (comma-separated)"
                  value={productIds}
                  onChange={setProductIds}
                />
              )}
              {mode === "collections" && (
                <TextField
                  label="Collection IDs (comma-separated)"
                  value={collectionIds}
                  onChange={setCollectionIds}
                />
              )}

              {/* BOGO */}
              <Text as="h3" variant="headingMd">BOGO Discount</Text>
              <TextField
                label="Buy Product IDs"
                value={bogoBuyIds}
                onChange={setBogoBuyIds}
                helpText="Comma-separated"
              />
              <TextField
                label="Free Product IDs"
                value={bogoFreeIds}
                onChange={setBogoFreeIds}
              />
              <Select
                label="Discount Type"
                options={[
                  { label: "Percentage", value: "percentage" },
                  { label: "Fixed Amount", value: "fixedAmount" },
                ]}
                value={bogoType}
                onChange={setBogoType}
              />
              <TextField
                label={bogoType === "percentage" ? "Percentage OFF" : "Fixed Amount OFF"}
                value={bogoValue}
                onChange={setBogoValue}
                type="number"
                suffix={bogoType === "percentage" ? "%" : "₹"}
              />

              {/* Volume % */}
              <Text as="h3" variant="headingMd">Volume (Percentage)</Text>
              <TextField
                label="Min Quantity"
                value={volPctQty}
                onChange={setVolPctQty}
                type="number"
              />
              <TextField
                label="Percent OFF"
                value={volPctVal}
                onChange={setVolPctVal}
                type="number"
                suffix="%"
              />

              {/* Volume ₹ */}
              <Text as="h3" variant="headingMd">Volume (Fixed Amount)</Text>
              <TextField
                label="Min Quantity"
                value={volAmtQty}
                onChange={setVolAmtQty}
                type="number"
              />
              <TextField
                label="₹ OFF"
                value={volAmtVal}
                onChange={setVolAmtVal}
                type="number"
                prefix="₹"
              />
            </BlockStack>

            <Box paddingBlockStart="500">
              <Button primary onClick={handleSubmit} fullWidth>
                Update Discount
              </Button>
            </Box>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
