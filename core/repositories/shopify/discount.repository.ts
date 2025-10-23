export async function createAutomaticAppDiscount(
  admin: any,
  discountInput: any,
) {
  const MUTATION = `#graphql
    mutation CreateAutomaticDiscount($discount: DiscountAutomaticAppInput!) {
      discountAutomaticAppCreate(automaticAppDiscount: $discount) {
        automaticAppDiscount { discountId, status }
        userErrors { field message code }
      }
    }`;

  const r = await admin.graphql(MUTATION, {
    variables: { discount: discountInput },
  });

  const { data } = await r.json();
  const res = data?.discountAutomaticAppCreate;

  if (res?.userErrors?.length) {
    throw new Error(res.userErrors.map((e: any) => e.message).join("; "));
  }
  return {
    discountId: res.automaticAppDiscount.discountId,
    status: res.automaticAppDiscount.status,
  };
}

export async function getAutomaticAppDiscount(
  admin: any,
  discountId: string,
) {
  const QUERY = `#graphql
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
      }`;

  const r = await admin.graphql(QUERY, {
    variables: { id: toDiscountNodeGid(discountId) },
  });

  const { data } = await r.json();
  const res = data?.discountNode.configurationField;

  if (!res) {
    throw new Error("Discount not found");
  }
  return {
    metaField: data.discountNode.configurationField.id,
  };
};

export async function updateAutomaticAppDiscount(
  admin: any,
  discountInput: any,
  discountId: string
) {
  const MUTATION = `#graphql
    mutation discountAutomaticAppUpdate($discount: DiscountAutomaticAppInput!, $id: ID!) {
      discountAutomaticAppUpdate(automaticAppDiscount: $discount, id: $id) {
        automaticAppDiscount { discountId, status }
        userErrors { field message code }
      }
    }`;

  const r = await admin.graphql(MUTATION, {
    variables: { discount: discountInput, id: toDiscountGid(discountId) },
  });

  const { data } = await r.json();
  const res = data?.discountAutomaticAppUpdate;

  if (res?.userErrors?.length) {
    throw new Error(res.userErrors.map((e: any) => e.message).join("; "));
  }
  return {
    discountId: res.automaticAppDiscount.discountId,
    status: res.automaticAppDiscount.status,
  };
}

// Delete Discount Function
export async function deleteAutomaticAppDiscount(
  admin: any,
  discountId: string,
) {
  const MUTATION = `#graphql
        mutation discountAutomaticDelete($id: ID!) {
          discountAutomaticDelete(id: $id) {
            deletedAutomaticDiscountId
            userErrors { field code message }
          }
        }`;
  const r = await admin.graphql(MUTATION, {
    variables: { id: toDiscountGid(discountId)  },
  });

  const { data } = await r.json();
  const res = data?.discountAutomaticDelete;

  if (res?.userErrors?.length) {
    throw new Error(res.userErrors.map((e: any) => e.message).join("; "));
  }

  return {
    deletedDiscountId: res.deletedAutomaticDiscountId,
  };
}

function toDiscountGid(numericId: string | number) {
  return `gid://shopify/DiscountAutomaticNode/${numericId}`;
}

function toDiscountNodeGid(numericId: string | number) {
  return `gid://shopify/DiscountNode/${numericId}`;
}
