// app/routes/app.volume-discount.$functionId.new.jsx
import { useState, useCallback } from "react";
import { json, redirect } from "@remix-run/node";
import { useSubmit, useActionData, useParams } from "@remix-run/react";
import { Button, Banner, Text, TextField, Card, Layout, Page, Box, BlockStack, Select } from "@shopify/polaris";
import shopify from "../shopify.server";

// This is the action function that creates the discount in Shopify.
export const action = async ({ request, params }) => {
  const { functionId } = params;
  const { admin } = await shopify.authenticate.admin(request);
  const formData = await request.formData();
  const discount = JSON.parse(formData.get("discount"));
  console.log("Creating discount with functionId:", functionId, "and discount data:", discount);

  // Check if functionId is missing from the URL parameters
  if (!functionId) {
    return json({ errors: [{ message: "Function ID is missing from the URL." }] }, { status: 400 });
  }

  // The GraphQL mutation to create an automatic app discount.
  // The 'automaticAppDiscount' variable holds all the discount configuration.
  const mutation = `#graphql
    mutation CreateAutomaticDiscount($discount: DiscountAutomaticAppInput!) {
      discountAutomaticAppCreate(automaticAppDiscount: $discount) {
        automaticAppDiscount { discountId }
        userErrors { field message code }
      }
    }`;

  const response = await admin.graphql(mutation, { variables: { discount } });
  const { data } = await response.json();
  const { userErrors, automaticAppDiscount } = data.discountAutomaticAppCreate;

  // Handle errors returned from the API
  if (userErrors.length) {
    return json({ errors: userErrors }, { status: 400 });
  }

  // If successful, redirect to the main discounts page.
  return redirect("/app");
};

// This is the main component for creating the new discount.
export default function NewVolumeDiscount() {
  const { functionId } = useParams();
  const submit = useSubmit();
  const actionData = useActionData();

  // State for discount title
  const [discountTitle, setDiscountTitle] = useState("");

  // State for discount scope
  const [mode, setMode] = useState("products");
  const [productIds, setProductIds] = useState("");
  const [collectionIds, setCollectionIds] = useState("");

  // State for BOGO discount
  const [bogoBuyProductIds, setBogoBuyProductIds] = useState("");
  const [bogoGetFreeProductIds, setBogoGetFreeProductIds] = useState("");
  const [bogoDiscountType, setBogoDiscountType] = useState("percentage");
  const [bogoDiscountValue, setBogoDiscountValue] = useState("100");
  const [bogoBuyQuantity, setBogoBuyQuantity] = useState("1");
  const [bogoFreeQuantity, setBogoFreeQuantity] = useState("1");

  // State for UI errors
  const [localErrors, setLocalErrors] = useState([]);

  const handleClick = () => {
    const errors = [];
    console.log("Creating BOGO discount with functionId:", functionId);
    // Basic validation to ensure functionId is not empty
    if (!functionId) {
      errors.push({ field: [], message: "Function ID is missing from the URL. Please ensure your app is configured correctly." });
    }

    // Add validation for the new dynamic fields
    if (Number(bogoBuyQuantity) < 1) {
      errors.push({ field: ['bogoBuyQuantity'], message: "Quantity to buy must be at least 1." });
    }
    if (Number(bogoFreeQuantity) < 1) {
      errors.push({ field: ['bogoFreeQuantity'], message: "Quantity to get free must be at least 1." });
    }

    if (errors.length > 0) {
      setLocalErrors(errors);
      return;
    }

    // Determine the final discount type and value based on user selection
    const finalDiscountType = bogoDiscountType === 'free' ? 'percentage' : bogoDiscountType;
    const finalDiscountValue = bogoDiscountType === 'free' ? 100 : Number(bogoDiscountValue);

    // Construct the discount configuration object
    const config = {
      mode: mode,
      productIds: productIds.split(',').map(id => id.trim()).filter(id => id),
      collectionIds: collectionIds.split(',').map(id => id.trim()).filter(id => id),
      configurations: [
        {
          type: "bogo",
          quantity: Number(bogoBuyQuantity),
          freeQuantity: Number(bogoFreeQuantity),
          buyProductIds: bogoBuyProductIds.split(',').map(id => id.trim()).filter(id => id),
          freeProductIds: bogoGetFreeProductIds.split(',').map(id => id.trim()).filter(id => id),
          // Use the new final values here
          freeDiscountType: finalDiscountType,
          freeDiscountValue: finalDiscountValue
        }
      ]
    };

    // Construct the full discount payload
    const payload = {
      // The functionId is included here for the API call
      functionId,
      title: discountTitle,
      startsAt: new Date().toISOString(),
      endsAt: null,
      // Note: The discountClasses array might need to be adjusted based on
      // the types of discounts being created (e.g., 'PRODUCT_AND_BOGO').
      discountClasses: ["PRODUCT"],
      combinesWith: {
        orderDiscounts: false,
        productDiscounts: false,
        shippingDiscounts: false
      },
      metafields: [
        {
          namespace: "$app:volume-discount",
          key: "function-configuration",
          type: "json",
          value: JSON.stringify(config)
        }
      ]
    };

    

    // Submit the form with the discount payload
    submit(
      { discount: JSON.stringify(payload) },
      { method: "post" }
    );
  };

  const bogoDiscountOptions = [
    // {label: 'Percentage', value: 'percentage'},
    // {label: 'Fixed Amount', value: 'fixedAmount'},
    {label: 'Free', value: 'free'},
  ];

  const modeOptions = [
    // {label: 'All Products', value: 'all'},
    {label: 'Specific Products', value: 'products'},
    // {label: 'Specific Collections', value: 'collections'},
  ];

  const allErrors = actionData?.errors || localErrors;

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <Text as="h2" variant="headingLg">Create a New BOGO</Text>
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

            {actionData?.discountId && (
              <Banner tone="positive">
                <Text>
                  Successfully created discount with ID:{" "}
                  <Text as="span" fontWeight="bold">
                    {actionData.discountId}
                  </Text>
                </Text>
              </Banner>
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

              <Box paddingBlockStart="400">
                <BlockStack gap="200">
                  <Text as="h3" variant="headingMd">Discount Scope</Text>
                  <Select
                    label="Apply discount to"
                    options={modeOptions}
                    onChange={setMode}
                    value={mode}
                    helpText="Choose whether to apply the volume discount specific ones."
                  />
                  {/* {mode === "products" && (
                    <TextField
                      label="Product IDs (comma-separated)"
                      value={productIds}
                      onChange={setProductIds}
                      helpText="Enter the Product IDs for the volume discount, separated by commas."
                    />
                  )} */}
                  {mode === "collections" && (
                    <TextField
                      label="Collection IDs (comma-separated)"
                      value={collectionIds}
                      onChange={setCollectionIds}
                      helpText="Enter the Collection IDs for the volume discount, separated by commas."
                    />
                  )}
                </BlockStack>
              </Box>

              <Box paddingBlockStart="400">
                <BlockStack gap="200">
                  <Text as="h3" variant="headingMd">BOGO Discount</Text>
                  <TextField
                    label="Buy Product IDs (comma-separated)"
                    value={bogoBuyProductIds}
                    onChange={setBogoBuyProductIds}
                    helpText="Enter the Product IDs for the items the customer must buy, separated by commas."
                  />
                  <TextField
                    label="Get Free Product IDs (comma-separated)"
                    value={bogoGetFreeProductIds}
                    onChange={setBogoGetFreeProductIds}
                    helpText="Enter the Product IDs for the items the customer gets for free, separated by commas."
                  />
                  <TextField
                    label="Quantity to Buy"
                    value={bogoBuyQuantity}
                    onChange={setBogoBuyQuantity}
                    type="number"
                    min="1"
                    helpText="The number of products the customer must buy."
                  />
                  <TextField
                    label="Quantity to Get Free"
                    value={bogoFreeQuantity}
                    onChange={setBogoFreeQuantity}
                    type="number"
                    min="1"
                    helpText="The number of products the customer gets for free."
                  />
                  <Select
                    label="Discount Type"
                    options={bogoDiscountOptions}
                    onChange={setBogoDiscountType}
                    value={bogoDiscountType}
                  />
                  {/* {bogoDiscountType !== 'free' && (
                    <TextField
                      label={bogoDiscountType === 'percentage' ? 'Percentage OFF' : 'Fixed Amount OFF'}
                      value={bogoDiscountValue}
                      onChange={setBogoDiscountValue}
                      type="number"
                      suffix={bogoDiscountType === 'percentage' ? '%' : '₹'}
                      helpText="The value of the discount for the second item."
                    />
                  )} */}
                </BlockStack>
              </Box>
            </BlockStack>

            <Box paddingBlockStart="500">
              <Button primary onClick={handleClick} fullWidth>
                Create BOGO Deal
              </Button>
            </Box>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}