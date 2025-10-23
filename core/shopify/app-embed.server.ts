interface AppEmbedBlock {
  type: string;
  disabled?: boolean;
  settings?: Record<string, any>;
}

export async function getAppEmbedStatus(
  session: any,
): Promise<"enabled" | "disabled" | "not_found"> {
  const shop = session.shop;
  const accessToken = session.accessToken;

  if (!accessToken) {
    throw new Error("No access token found for shop session");
  }

  const embedUUID = process.env.SHOPIFY_BUNDLE_BOOSTER_ID;
  if (!embedUUID) {
    throw new Error("APP_EMBED_UUID environment variable is missing");
  }

  // 1. Get active theme
  const themesRes = await fetch(
    `https://${shop}/admin/api/${process.env.SHOPIFY_API_VERSION}/themes.json`,
    {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      } as HeadersInit,
    },
  );

  const { themes } = await themesRes.json();
  const activeTheme = themes.find((t: any) => t.role === "main");
  if (!activeTheme) throw new Error("No active theme found");

  // 2. Fetch settings_data.json
  const settingsRes = await fetch(
    `https://${shop}/admin/api/${process.env.SHOPIFY_API_VERSION}/themes/${activeTheme.id}/assets.json?asset[key]=config/settings_data.json`,
    {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      } as HeadersInit,
    },
  );

  const settingsJson = await settingsRes.json();
  const settings = JSON.parse(settingsJson.asset.value);
  const appHandle = process.env.VITE_APP_HANDLE;

  // 3. Look for your app block by UUID
  const blocks: Record<string, AppEmbedBlock> = settings.current.blocks || {};
  const found = Object.values(blocks).find(
    (b: any) =>
      typeof b.type === "string" &&
      b.type.includes(`/apps/${appHandle}/blocks/app-embed/`),
  );

  if (!found) return "not_found";
  return found.disabled ? "disabled" : "enabled";
}
