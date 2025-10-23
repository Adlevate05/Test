
type CurrencyInfo = { currencyCode: string; moneyFormat: string; symbol: string };

function extractSymbol(format: string) {
  return format.replace(/\{\{.*?amount.*?\}\}/, "").trim();
}

export async function getCurrencyForShop(
  shopDomain: string,
  admin: any
): Promise<CurrencyInfo> {
 
  // 2) fetch once from Shopify if not cached
  
  if (admin) {
    const QUERY = `#graphql
      query { shop { currencyCode currencyFormats { moneyFormat } } }
    `;
    const res = await admin.graphql(QUERY);
    const { data } = await res.json();

    const currencyCode: string = data.shop.currencyCode;
    const moneyFormat: string = data.shop.currencyFormats.moneyFormat;

    return { currencyCode, moneyFormat, symbol: extractSymbol(moneyFormat) };
  }

  // 3) safe fallback
  return { currencyCode: "USD", moneyFormat: "${{amount}}", symbol: "$" };
}
