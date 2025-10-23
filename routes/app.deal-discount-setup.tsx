import {
  Page,
  Layout,
  Text,
  Box,
  InlineStack,
  BlockStack,
} from "@shopify/polaris";
import { useState, useMemo } from "react";
import { QuantityBreaksCard } from "../components/quantity-breaks-card";
import { BOGODealsCard } from "../components/bogo-deals-card";
import { ProductBundleCard } from "../components/product-bundle-card";
import { DifferentProductCard } from "app/components/Different-Products-Card";
import { useAppContext, AppProvider } from "app/utils/AppContext";
import { useNavigate } from "react-router";
import { getCurrencyForShop } from "app/core/shopify/currency.server";
import { getAdminAndShopFromRequest } from "app/core/shopify/admin-client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import getProduct from "app/hooks/getProduct";

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin, shopDomain } = await getAdminAndShopFromRequest(request);
  const { currencyCode } = await getCurrencyForShop(shopDomain, admin);

  const data = await getProduct(admin);
  const allProducts = data?.products?.edges.map((edge: any) => edge.node) || [];

  return { currencyCode, allProducts };
}

export function DealDiscountSetup() {
  const { currencyCode, allProducts } = useLoaderData<typeof loader>();
  const { selectedThemeColor, setSelectedThemeColor } = useAppContext();

  const [selectedColors, setSelectedColors] = useState<{
    [key: string]: string;
  }>({});
  const [selectedSizes, setSelectedSizes] = useState<{ [key: string]: string }>(
    {},
  );

  const handleColorChange = (id: string, color: string) => {
    setSelectedColors((prev) => ({ ...prev, [id]: color }));
  };

  const handleSizeChange = (id: string, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [id]: size }));
  };

  const product = allProducts[0];

  const colorOptions = [
    { label: "Red", value: "red", color: "#FF0000" },
    { label: "Blue", value: "blue", color: "#0000FF" },
    { label: "Green", value: "green", color: "#00FF00" },
  ];

  const sizeOptions = [
    { label: "S", value: "s" },
    { label: "M", value: "m" },
    { label: "L", value: "l" },
  ];

  // Theme colors + light variants
  const themeColors = [
    "#000000", // Black
    "#FF0000", // Red
    "#FF8C00", // Orange
    "#90EE90", // Light Green
    "#00FF00", // Green
    "#00BFFF", // Sky Blue
    "#8A2BE2", // Blue Violet
    "#FF1493", // Deep Pink
  ];

  const lightColors = [
    "#EDEDED", // for Black → even lighter gray
    "#FF9999", // for Red → softer pinkish red
    "#FFCC99", // for Orange → peach
    "#E6FF99", // for Light Green → pastel lime
    "#99FFCC", // for Green → pale mint
    "#99CCFF", // for Sky Blue → powder blue
    "#B799FF", // for Blue Violet → soft lavender
    "#FF99FB", // for Deep Pink → pale pink
  ];

  // Derived value with useMemo
  const lightThemeColor = useMemo(() => {
    const idx = themeColors.indexOf(selectedThemeColor);
    return idx !== -1 ? lightColors[idx] : "#ededed";
  }, [selectedThemeColor]);

  const navigate = useNavigate();

  const header = (
    <Box paddingBlockEnd="400" paddingInline="400">
      <div className="max-w-[945px] mx-auto pt-[25px]">
        <div className="flex items-center justify-between">
          {/* Left: Back arrow and title */}
          <InlineStack align="center" gap="200">
            <Box>
              <button
                type="button"
                onClick={() => navigate("/app")}
                aria-label="Back"
                style={{
                  background: "none",
                  border: "none",
                  paddingTop: "12px",
                  cursor: "pointer",
                }}
              >
                <svg
                  viewBox="0 0 20 20"
                  width="20"
                  height="20"
                  fill="#303030"
                  focusable="false"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.5 10a.75.75 0 0 1-.75.75h-9.69l2.72 2.72a.75.75 0 0 1-1.06 1.06l-4-4a.75.75 0 0 1 0-1.06l4-4a.75.75 0 1 1 1.06 1.06l-2.72 2.72h9.69a.75.75 0 0 1 .75.75Z"
                  />
                </svg>
              </button>
            </Box>
            <BlockStack gap="050">
              <Text as="h1" variant="headingLg" fontWeight="bold">
                Choose a discount type
              </Text>
              <Text as="p" variant="bodyMd" tone="subdued">
                You can fully customize it later.
              </Text>
            </BlockStack>
          </InlineStack>

          {/* Right: Color theme picker */}
          <div className="flex items-center gap-[10px]">
            <Text as="span" variant="bodySm" tone="subdued">
              <span className="text-[14px]">Color theme</span>
            </Text>
            <div
              style={{
                display: "inline-flex",
                border: "1px solid #8C8B8B",
                borderRadius: "6px",
                overflow: "visible",
                background: "#fff",
              }}
            >
              {themeColors.map((color, idx) => {
                const isSelected = selectedThemeColor === color;
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() =>
                      setSelectedThemeColor && setSelectedThemeColor(color)
                    }
                    style={{
                      width: "35px",
                      height: "35px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "transparent",
                      border: "none",
                      padding: 0,
                      margin: 0,
                      position: "relative",
                      borderTopLeftRadius: idx === 0 ? "6px" : "0",
                      borderBottomLeftRadius: idx === 0 ? "6px" : "0",
                      borderTopRightRadius:
                        idx === themeColors.length - 1 ? "6px" : "0",
                      borderBottomRightRadius:
                        idx === themeColors.length - 1 ? "6px" : "0",
                    }}
                  >
                    {/* color circle */}
                    <span
                      style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        backgroundColor: color,
                        display: "block",
                      }}
                    />
                    {/* selected border overlay */}
                    {isSelected && (
                      <span
                        style={{
                          position: "absolute",
                          top: "-1px",
                          left: "-1px",
                          right: "-1px",
                          bottom: "-1px",
                          border: "2px solid #000",
                          borderRadius: "inherit",
                          pointerEvents: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Box>
  );

  return (
    <>
      {header}
      <Page>
        <Layout>
          <Layout.Section>
            <InlineStack gap="400" wrap={false}>
              <Box width="50%">
                <QuantityBreaksCard
                  selectedColors={selectedColors}
                  selectedSizes={selectedSizes}
                  handleColorChange={handleColorChange}
                  handleSizeChange={handleSizeChange}
                  colorOptions={colorOptions}
                  sizeOptions={sizeOptions}
                  themeColor={selectedThemeColor}
                  lightThemeColor={lightThemeColor}
                  className="h-full"
                  currencyCode={currencyCode}
                  product={product}
                />
              </Box>
              <Box width="50%">
                <BOGODealsCard
                  themeColor={selectedThemeColor}
                  lightThemeColor={lightThemeColor}
                  className="h-full"
                  currencyCode={currencyCode}
                />
              </Box>
            </InlineStack>
          </Layout.Section>

          <Layout.Section>
            <InlineStack gap="400" wrap={false}>
              <Box width="50%">
                <DifferentProductCard
                  themeColor={selectedThemeColor}
                  lightThemeColor={lightThemeColor}
                  currencyCode={currencyCode}
                  product={product}
                />
              </Box>
              <Box width="50%">
                <ProductBundleCard themeColor={selectedThemeColor} />
              </Box>
            </InlineStack>
          </Layout.Section>
        </Layout>
      </Page>
    </>
  );
}

// ---- Default Page Export ----
export default function DealPage() {
  return (
    <AppProvider>
      <DealDiscountSetup />
    </AppProvider>
  );
}
