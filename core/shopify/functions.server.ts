import { authenticate } from "app/shopify.server";

export async function getFunctionId(request: Request): Promise<string> {
  const { admin } = await authenticate.admin(request);

  const QUERY = `#graphql
    query {
      shopifyFunctions(first: 20) {
        edges {
          node {
            id
            title
            app {
              id
              title
            }
          }
        }
      }
    }
  `;

  const response = await admin.graphql(QUERY);
  const { data } = await response.json();
  const appId = process.env.APP_ID;
  // Ensure we’re comparing GIDs consistently (string comparison)
  const match = data?.shopifyFunctions?.edges?.find(
    (edge: any) => edge?.node?.app?.id === appId
  );
  if (!match) {
    console.warn(`No function found for appId: ${appId}`);
  }
  return match.node.id ?? null;
}
