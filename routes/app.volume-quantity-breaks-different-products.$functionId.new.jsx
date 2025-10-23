import { useState, useCallback } from "react";
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

// Loader: fetch a list of products from the shop to populate the selection modal.
export const loader = async ({ request }) => {
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
  const products = data.products.edges.map(edge => {
    const n = edge.node;
    const img = n.images.edges[0]?.node;
    return { id: n.id, title: n.title, imageSrc: img?.transformedSrc || "", imageAlt: img?.altText || n.title };
  });
  return json({ products });
};

// This is the action function that creates the discount in Shopify.
export const action = async ({ request, params }) => {
  const { functionId } = params;
  const { admin } = await shopify.authenticate.admin(request);
  const formData = await request.formData();
  const discount = JSON.parse(formData.get("discount"));

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
  const { userErrors } = data.discountAutomaticAppCreate;

  // Handle errors returned from the API
  if (userErrors && userErrors.length) {
    return json({ errors: userErrors }, { status: 400 });
  }

  // If successful, redirect to the main discounts page.
  return redirect("/app/volume-discounts");
};

// This is the main component for creating the new discount.
export default function NewVolumeDiscount() {
  const { functionId } = useParams();
  const { products } = useLoaderData(); // Get products from the loader
  const submit = useSubmit();
  const actionData = useActionData();

  // State for discount title
  const [discountTitle, setDiscountTitle] = useState("");
  // State for the product selection modal
  const [showProductModal, setShowProductModal] = useState(false);

  // State for the new combined quantity discount
  const [productIds, setProductIds] = useState([]); // Now an array for selection
  const [quantityThreshold, setQuantityThreshold] = useState("3");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("10");

  // State for UI errors
  const [localErrors, setLocalErrors] = useState([]);

  const handleClick = useCallback(() => {
    const errors = [];
    
    // Basic validation to ensure functionId is not empty
    if (!functionId) {
      errors.push({ field: [], message: "Function ID is missing from the URL. Please ensure your app is configured correctly." });
    }

    if (!discountTitle) {
      errors.push({ field: ['discountTitle'], message: "Discount title is required." });
    }
    if (productIds.length === 0) {
      errors.push({ field: ['productIds'], message: "You must specify products for this deal." });
    }
    if (Number(quantityThreshold) < 1) {
      errors.push({ field: ['quantityThreshold'], message: "Quantity threshold must be at least 1." });
    }
    if (Number(discountValue) <= 0) {
      errors.push({ field: ['discountValue'], message: "Discount value must be greater than 0." });
    }

    if (errors.length > 0) {
      setLocalErrors(errors);
      return;
    }

    // Construct the discount configuration object for the new scenario
    const config = {
      configurations: [
        {
          type: "quantity-break-multi-product",
          quantityThreshold: Number(quantityThreshold),
          productIds: productIds,
          discountType: discountType,
          discountValue: Number(discountValue)
        }
      ]
    };

    // Construct the full discount payload
    const payload = {
      functionId,
      title: discountTitle,
      startsAt: new Date().toISOString(),
      endsAt: null,
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
  }, [functionId, discountTitle, productIds, quantityThreshold, discountType, discountValue, submit]);

  const discountOptions = [
    {label: 'Percentage', value: 'percentage'},
    {label: 'Fixed Amount', value: 'fixedAmount'},
  ];

  const allErrors = actionData?.errors || localErrors;

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <Text as="h2" variant="headingLg">Quantity breaks for different products</Text>
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
                  <Text as="h3" variant="headingMd">Deal Configuration</Text>
                  <Button onClick={() => setShowProductModal(true)}>Select Products</Button>
                  {productIds.length > 0 && (
                    <Text as="p" variant="bodyMd" color="subdued">
                      Selected Products: {products.filter(p => productIds.includes(p.id)).map(p => p.title).join(', ')}
                    </Text>
                  )}
                  <TextField
                    label="Minimum Combined Quantity"
                    value={quantityThreshold}
                    onChange={setQuantityThreshold}
                    type="number"
                    min="1"
                    helpText="The total quantity of these products that must be in the cart to get the discount."
                  />
                  <Select
                    label="Discount Type"
                    options={discountOptions}
                    onChange={setDiscountType}
                    value={discountType}
                  />
                  <TextField
                    label={discountType === 'percentage' ? 'Percentage OFF' : 'Fixed Amount OFF'}
                    value={discountValue}
                    onChange={setDiscountValue}
                    type="number"
                    suffix={discountType === 'percentage' ? '%' : '₹'}
                    helpText="The value of the discount applied to all qualifying products."
                  />
                </BlockStack>
              </Box>
            </BlockStack>

            <Box paddingBlockStart="500">
              <Button primary onClick={handleClick} fullWidth>
                Create Deal
              </Button>
            </Box>
          </Card>
        </Layout.Section>
      </Layout>
      
      {/* Product Selection Modal */}
      <Modal
        open={showProductModal}
        onClose={() => setShowProductModal(false)}
        title="Select Products for the Deal"
        primaryAction={{
          content: 'Select',
          onAction: () => setShowProductModal(false),
        }}
      >
        <Modal.Section>
          <ResourceList
            resourceName={{ singular: 'product', plural: 'products' }}
            items={products}
            selectedItems={productIds}
            onSelectionChange={setProductIds}
            selectable
            renderItem={({ id, title, imageSrc, imageAlt }) => (
              <ResourceItem id={id} media={<Thumbnail source={imageSrc} alt={imageAlt} />}>
                {title}
              </ResourceItem>
            )}
          />
        </Modal.Section>
      </Modal>
    </Page>
  );
}