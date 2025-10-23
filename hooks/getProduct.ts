import { json } from "@remix-run/node";

export default async function getProduct(admin: any) {
  const productsQuery = `
    query getAllProducts($first: Int!) {
      products(first: $first) {
        edges {
          node {
            id
            handle
            title
            featuredImage {
              url
              altText
            }
            variants(first: 50) {
              edges {
                node {
                  id
                  title
                  price
                  selectedOptions {
                    name
                    value
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const response = await admin.graphql(productsQuery, {
    variables: { first: 250 },
  });

  // The response body can only be read once
  const body = await response.json();

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${JSON.stringify(body)}`);
  }

  return body.data;
}
