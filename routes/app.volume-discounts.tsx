// app/routes/discounts.tsx
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Form, Link } from "@remix-run/react";
import shopify from "../shopify.server";
import React, { useState } from "react";
import {
  Page, Card, DataTable, Pagination, ButtonGroup, Button, EmptyState, Layout, Box,
} from "@shopify/polaris";

// Types
interface DiscountAutomaticApp { __typename: "DiscountAutomaticApp"; title: string; status: string; appDiscountType: { functionId: string }; }
interface DiscountNode { id: string; automaticDiscount: DiscountAutomaticApp; }
interface Edge { node: DiscountNode; }
interface LoaderData { edges: Edge[]; functionId: string; }

// ──────────────────────────────────────────────────────────────────────────────
// LOADER
// ──────────────────────────────────────────────────────────────────────────────
export const loader: LoaderFunction = async ({ request }) => {
  const FUNCTION_ID = process.env.SHOPIFY_PRODUCT_DISCOUNT_ID;
  if (!FUNCTION_ID) {
    throw new Response("SHOPIFY_PRODUCT_DISCOUNT_ID is not set", { status: 500 });
  }

  const { admin } = await shopify.authenticate.admin(request);

  const allDiscounts: Edge[] = [];
  let hasNextPage = true;
  let cursor: string | null = null;

  while (hasNextPage) {
    const query = `#graphql
      query($first: Int, $after: String) {
        automaticDiscountNodes(first: $first, after: $after, query: "type:app AND method:automatic") {
          edges {
            node {
              id
              automaticDiscount {
                __typename
                ... on DiscountAutomaticApp {
                  title
                  status
                  appDiscountType { functionId }
                }
              }
            }
          }
          pageInfo { hasNextPage endCursor }
        }
      }
    `;
    const res = await admin.graphql(query, { variables: { first: 50, after: cursor } });
    const jsonRes = await res.json();
    const data = jsonRes.data.automaticDiscountNodes as {
      edges: Edge[];
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
    };
    allDiscounts.push(...data.edges);
    hasNextPage = data.pageInfo.hasNextPage;
    cursor = data.pageInfo.endCursor;
  }

  const filteredEdges = allDiscounts.filter(({ node }) =>
    node.automaticDiscount.__typename === "DiscountAutomaticApp" &&
    node.automaticDiscount.appDiscountType.functionId === FUNCTION_ID
  );

  return json<LoaderData>({ edges: filteredEdges, functionId: FUNCTION_ID });
};

// ──────────────────────────────────────────────────────────────────────────────
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const deleteId = formData.get("deleteId");
  if (typeof deleteId === "string" && deleteId) {
    const { admin } = await shopify.authenticate.admin(request);
    const mutation = `#graphql
      mutation discountAutomaticDelete($id: ID!) {
        discountAutomaticDelete(id: $id) {
          deletedAutomaticDiscountId
          userErrors { field code message }
        }
      }
    `;
    const res = await admin.graphql(mutation, { variables: { id: deleteId } });
    await res.json();
  }
  return redirect("/app/volume-discounts");
};

// ──────────────────────────────────────────────────────────────────────────────
export default function Discounts() {
  const { edges, functionId } = useLoaderData<LoaderData>();
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  const totalPages = Math.max(1, Math.ceil(edges.length / itemsPerPage));
  const startIndex = currentPage * itemsPerPage;
  const currentItems = edges.slice(startIndex, startIndex + itemsPerPage);

  const rows = currentItems.map(({ node }) => {
    const gid = node.id;
    return [
      node.automaticDiscount.title,
      node.automaticDiscount.status,
      <ButtonGroup key={gid}>
        {/* Example edit link if needed later:
        <Link to={`/app/volume-discount/${encodeURIComponent(functionId)}/${gid.split("/").pop()}`}>
          <Button>Edit</Button>
        </Link> */}
        <Form method="post">
          <input type="hidden" name="deleteId" value={gid} />
          <Button tone="critical" variant="primary" submit>Delete</Button>
        </Form>
      </ButtonGroup>
    ];
  });

  return (
    <Page title="App Discounts">
      <Box paddingBlockEnd="400">
        <ButtonGroup>
          <Link to={`/app/volume-quantity-breaks-same-products/${encodeURIComponent(functionId)}/new`}>
            <Button variant="primary">Quantity breaks (same product)</Button>
          </Link>
          <Link to={`/app/volume-bogo/${encodeURIComponent(functionId)}/new`}>
            <Button variant="primary">Buy X, get Y (BOGO)</Button>
          </Link>
          <Link to={`/app/volume-quantity-breaks-different-products/${encodeURIComponent(functionId)}/new`}>
            <Button variant="primary">Quantity breaks (different products)</Button>
          </Link>
        </ButtonGroup>
      </Box>

      {edges.length > 0 ? (
        <Card>
          <DataTable
            columnContentTypes={["text", "text", "text"]}
            headings={["Title", "Status", "Actions"]}
            rows={rows}
            footerContent={
              <div style={{ display: "flex", justifyContent: "center", padding: 16 }}>
                <Pagination
                  hasPrevious={currentPage > 0}
                  onPrevious={() => setCurrentPage(p => Math.max(0, p - 1))}
                  hasNext={currentPage < totalPages - 1}
                  onNext={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                />
              </div>
            }
          />
        </Card>
      ) : (
        <Layout>
          <Layout.Section>
            <Card>
              <EmptyState
                heading="No discounts found"
                action={{ content: "Create BOGO discount", url: `/app/volume-bogo/${encodeURIComponent(functionId)}/new` }}
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>Create your first app-backed volume discount to get started.</p>
              </EmptyState>
            </Card>
          </Layout.Section>
        </Layout>
      )}
    </Page>
  );
}
