// app/routes/app.volume-discount.$functionId.new.jsx
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
  ResourceList,
  ResourceItem,
  Thumbnail,
  Modal,
  ButtonGroup,
  Select,
} from "@shopify/polaris";
import shopify from "../shopify.server";

// Loader: fetch products for BOGO selection
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

// Action: create the discount in Shopify
export const action = async ({ request, params }) => {
  const { functionId } = params;
  const { admin } = await shopify.authenticate.admin(request);
  const formData = await request.formData();
  const discount = JSON.parse(formData.get("discount"));
  console.log("Creating discount with functionId:", functionId, "and discount data:", discount);

  const userErrors = [];
  if (!functionId) userErrors.push({ message: "Function ID missing." });
  if (!discount.metafields) userErrors.push({ message: "Configuration missing." });
  if (userErrors.length) return json({ errors: userErrors }, { status: 400 });

  const MUTATION = `#graphql
    mutation CreateAutomaticDiscount($discount: DiscountAutomaticAppInput!) {
      discountAutomaticAppCreate(automaticAppDiscount: $discount) {
        automaticAppDiscount { discountId }
        userErrors { field message code }
      }
    }
  `;
  const resp = await admin.graphql(MUTATION, { variables: { discount } });
  const { data } = await resp.json();
  if (data.discountAutomaticAppCreate.userErrors.length) {
    return json({ errors: data.discountAutomaticAppCreate.userErrors }, { status: 400 });
  }
  return redirect("/app/volume-discounts");
};

export default function NewVolumeBogoDiscount() {
  const { functionId } = useParams();
  const { products } = useLoaderData();
  const submit = useSubmit();
  const actionData = useActionData();

  const [title, setTitle] = useState("");
  const [buyIds, setBuyIds] = useState([]);
  const [freeIds, setFreeIds] = useState([]);
  const [buyQty, setBuyQty] = useState("1");
  const [freeQty, setFreeQty] = useState("1");
  const [type, setType] = useState('free');
  const [value, setValue] = useState('100');
  const [errors, setErrors] = useState([]);

  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showFreeModal, setShowFreeModal] = useState(false);

  const handleSubmit = useCallback(() => {
    const errs = [];
    if (!title) errs.push({ message: 'Title required.' });
    if (buyIds.length === 0) errs.push({ message: 'Select products to buy.' });
    if (freeIds.length === 0) errs.push({ message: 'Select products to get free.' });
    if (Number(buyQty) < 1 || isNaN(Number(buyQty))) errs.push({ message: 'Buy quantity must be 1 or more.' });
    if (Number(freeQty) < 1 || isNaN(Number(freeQty))) errs.push({ message: 'Free quantity must be 1 or more.' });
    if (type !== 'free' && (Number(value) < 0 || isNaN(Number(value)))) errs.push({ message: 'Discount value must be a valid number.' });

    if (errs.length) {
      setErrors(errs);
      return;
    }

    // Correctly map GIDs to numerical IDs
    const buyProductIds = buyIds;
    const freeProductIds = freeIds;

    const config = {
      mode: 'products',
      productIds:[],
      collectionIds:[],
      configurations: [{
        type: 'bogo',
        quantity: Number(buyQty),
        freeQuantity: Number(freeQty),
        buyProductIds: buyProductIds,
        freeProductIds: freeProductIds,
        freeDiscountType: type === 'free' ? 'percentage' : type,
        freeDiscountValue: type === 'free' ? 100 : Number(value)
      }]
    };
    const payload = {
      functionId,
      title,
      startsAt: new Date().toISOString(),
      endsAt: null,
      discountClasses: ['PRODUCT'],
      combinesWith: { orderDiscounts: false, productDiscounts: false, shippingDiscounts: false },
      metafields: [{
        namespace: '$app:volume-discount',
        key: 'function-configuration',
        type: 'json',
        value: JSON.stringify(config)
      }]
    };

    submit({ discount: JSON.stringify(payload) }, { method: 'post' });
  }, [buyIds, freeIds, buyQty, freeQty, title, type, value, submit, functionId]);

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <Text as="h2" variant="headingLg">Buy X, get Y free (BOGO) deal</Text>
            { (actionData?.errors || errors).length > 0 && <Banner tone="critical"><ul>{(actionData?.errors || errors).map((e, i) => <li key={i}>{e.message}</li>)}</ul></Banner> }
            <BlockStack gap="4">
              <TextField label="Title" value={title} onChange={setTitle} autoComplete="off" />
              <TextField label="Buy Qty" type="number" value={buyQty} onChange={setBuyQty} min="1" autoComplete="off" />
              <TextField label="Free Qty" type="number" value={freeQty} onChange={setFreeQty} min="1" autoComplete="off" />
              <Text variant="bodyMd" fontWeight="semibold">Selected Products</Text>
              <ButtonGroup><Button onClick={() => setShowBuyModal(true)}>Select 'Buy' Products</Button><Button onClick={() => setShowFreeModal(true)}>Select 'Get Free' Products</Button></ButtonGroup>
              
              {buyIds.length > 0 && <Box paddingBlockStart="2"><Text as="p" fontWeight="medium">Buy Products: {products.filter(p => buyIds.includes(p.id)).map(p => p.title).join(', ')}</Text></Box>}
              {freeIds.length > 0 && <Box paddingBlockStart="2"><Text as="p" fontWeight="medium">Get Free Products: {products.filter(p => freeIds.includes(p.id)).map(p => p.title).join(', ')}</Text></Box>}
              
              <Button primary onClick={handleSubmit}>Create Deal</Button>
            </BlockStack>
          </Card>
          
          <Modal open={showBuyModal} onClose={() => setShowBuyModal(false)} title="Select 'Buy' Products" primaryAction={{content:'Select', onAction:() => setShowBuyModal(false)}}>
            <Modal.Section>
              <ResourceList
                resourceName={{singular:'product', plural:'products'}}
                items={products}
                selectedItems={buyIds}
                onSelectionChange={setBuyIds}
                selectable
                renderItem={({id,title,imageSrc,imageAlt}) => <ResourceItem id={id} media={<Thumbnail source={imageSrc} alt={imageAlt} />}>{title}</ResourceItem>}
              />
            </Modal.Section>
          </Modal>

          <Modal open={showFreeModal} onClose={() => setShowFreeModal(false)} title="Select 'Get Free' Products" primaryAction={{content:'Select', onAction:() => setShowFreeModal(false)}}>
            <Modal.Section>
              <ResourceList
                resourceName={{singular:'product', plural:'products'}}
                items={products}
                selectedItems={freeIds}
                onSelectionChange={setFreeIds}
                selectable
                renderItem={({id,title,imageSrc,imageAlt}) => <ResourceItem id={id} media={<Thumbnail source={imageSrc} alt={imageAlt} />}>{title}</ResourceItem>}
              />
            </Modal.Section>
          </Modal>

        </Layout.Section>
      </Layout>
    </Page>
  );
}