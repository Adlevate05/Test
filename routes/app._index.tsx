import { useState, useEffect, useRef } from "react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { AnalyticsVisitorsUniqueBundleService } from "app/core/services/analytics.visitors.unique.bundle.service";
import { json, redirect } from "@remix-run/node";
import {
  useLoaderData,
  Form,
  useSearchParams,
  useNavigate,
  useFetcher,
  useNavigation,
} from "@remix-run/react";
import * as PolarisImport from "@shopify/polaris";
import { ButtonGroup } from "@shopify/polaris";
import { DiscountService } from "../core/services/discount.service";
import { getAdminAndShopFromRequest } from "app/core/shopify/admin-client";
import NeedHelp from "../components/CTA/NeedHelp";
import { getCurrencyForShop } from "app/core/shopify/currency.server";
import { AnalyticsBundleRevenueService } from "app/core/services/analytics.bundle-revenue.service";
import { DeleteConfirmationModal } from "app/helper/deleteModel";
import { getAppEmbedStatus } from "app/core/shopify/app-embed.server";
import { createDateFilter } from "app/helper/helper";
import prisma from "app/db.server";
import { useIsSubscribed } from "app/hooks/useIsSubscribed";
import { SubscriptionModal } from "app/components/common/subscription-modal";

const Polaris = (PolarisImport as any).default || PolarisImport;
const {
  Page,
  Card,
  IndexTable,
  Text,
  Button,
  EmptyState,
  Layout,
  Box,
  BlockStack,
  InlineStack,
  ProgressBar,
  Badge,
} = Polaris;

interface AllDiscountsData {
  data: Array<{
    id: number | string;
    name_app: string;
    status: string;
    shopify_discount_id: string;
    deal_status?: string;
    visitor_count: number;
    bundle_order_count?: number;
    bundle_order_conversion?: number;
    visibility_primary?: string;
    visibility_bundle?: string;
  }>;
  total: number;
  currencyCode: string;
  revenue?: number;
  embedPath: string;
  isEmbeded: "disabled" | "enabled" | "not_found";
}

/* ----------------------------- Loader ---------------------------- */
export async function loader({ request }: LoaderFunctionArgs) {
  // Get search and pagination parameters from the URL
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page") || 1);
  const pageSize = Number(url.searchParams.get("pageSize") || 10);
  const search = url.searchParams.get("search") || "";

  const { admin, shopDomain } = await getAdminAndShopFromRequest(request);

  const session = await prisma.session.findFirst({
    where: { shop: shopDomain },
  });

  const response = await admin.graphql(`
  query {
    themes(first: 10) {
      edges {
        node {
          id
          name
          role
        }
      }
    }
  }
`);

  const result = await response.json();

  const mainTheme = result.data.themes.edges.find(
    (edge: any) => edge.node.role.toLowerCase() === "main",
  );

  if (!mainTheme) {
    console.error("Available themes:", result.data.themes.edges);
    throw new Error("No published theme found");
  }

  const themeGid = mainTheme.node.id;
  const themeId = themeGid.split("/").pop();

  const storeName = shopDomain.replace(".myshopify.com", "");
  const embedPath = `https://admin.shopify.com/store/${storeName}/themes/${themeId}/editor?context=apps`;

  const service = new DiscountService(admin, shopDomain);
  const analyticsRevenueService = new AnalyticsBundleRevenueService();

  let dateFilter = createDateFilter("thismonth", "date", shopDomain);

  let { revenue } = await analyticsRevenueService.getRevenue(dateFilter);

  const { currencyCode } = await getCurrencyForShop(shopDomain, admin);

  const { data: discounts, total } = await service.getAll({
    page,
    pageSize,
    search,
    shop_name: shopDomain,
  });

  const isEmbeded = await getAppEmbedStatus(session);

  const analyticsVisitorsUniqueBundleService =
    new AnalyticsVisitorsUniqueBundleService();
  const boosterDiscountIds = discounts
    .map((d) => (typeof d.id === "string" ? parseInt(d.id, 10) : d.id))
    .filter((id) => !isNaN(id));

  const analyticsVisitors =
    await analyticsVisitorsUniqueBundleService.getAnalytics(boosterDiscountIds);

  const discountsWithAnalytics = discounts.map((discount) => {
    const discountId =
      typeof discount.id === "string" ? parseInt(discount.id, 10) : discount.id;
    const analytics = analyticsVisitors[discountId] || {
      visitors: 0,
      orders: 0,
      bundleOrderConversion: 0,
    };

    return {
      ...discount,
      visitor_count: analytics.visitors,
      bundle_order_count: analytics.orders,
      bundle_order_conversion: analytics.bundleOrderConversion.toFixed(2),
    };
  });

  return json<AllDiscountsData>({
    data: discountsWithAnalytics,
    total,
    currencyCode,
    revenue,
    embedPath,
    isEmbeded,
  });
}

// New function
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const { admin, shopDomain } = await getAdminAndShopFromRequest(request);

  const service = new DiscountService(admin, shopDomain);
  const deleteId = formData.get("deleteId");

  if (intent === "delete") {
    if (deleteId && typeof deleteId === "string") {
      const boosterDiscountId = parseInt(deleteId, 10);
      if (!isNaN(boosterDiscountId)) {
        await service.delete(boosterDiscountId);
      }
    }
    return redirect("/app");
  }

  if (intent === "updateStatus") {
    const id = formData.get("id");
    const status = formData.get("status");

    if (id && status && typeof id === "string" && typeof status === "string") {
      const boosterDiscountId = parseInt(id, 10);
      if (!isNaN(boosterDiscountId)) {
        await service.updateDealStatus(boosterDiscountId, status);
        return json({ ok: true });
      }
    }

    return json({ ok: false, error: "Invalid id or status" });
  }

  //update status action can be added here
}

// Utility function to get next reset date
function getNextResetDate(): string {
  const today = new Date();
  // next month
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  // format like "1 Oct"
  return nextMonth.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });
}

/* ----------------------------- Page Content ---------------------------- */
function DiscountsContent() {
  const { data, total, currencyCode, revenue, embedPath, isEmbeded } =
    useLoaderData<AllDiscountsData>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const fetcher = useFetcher();

  const navigation = useNavigation();
  const isNavigatingTo = (to: string) =>
    navigation.state !== "idle" && navigation.location?.pathname === to;

  useEffect(() => {
    // when discounts load/reload, sync initial switch state
    const initial: Record<string, boolean> = {};
    data.forEach((d) => {
      initial[String(d.id)] = d.deal_status?.toLowerCase() === "active";
    });
    setSwitchState(initial);
  }, [data]);

  // Get current page and page size from the URL search parameters
  const page = Number(searchParams.get("page") || 1);
  const pageSize = Number(searchParams.get("pageSize") || 10);
  const searchValue = searchParams.get("search") || "";

  // Controlled input for the search field
  const [searchTerm, setSearchTerm] = useState(searchValue);

  // Debounce and auto-search: when user stops typing, navigate with new search query
  const firstSearchRef = useRef(true);
  useEffect(() => {
    // skip the initial effect run that syncs URL -> local state
    if (firstSearchRef.current) {
      firstSearchRef.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(Array.from(searchParams.entries()));

      if (searchTerm && searchTerm.trim() !== "") {
        params.set("search", searchTerm.trim());
      } else {
        params.delete("search");
      }

      // reset to first page on new search and preserve pageSize
      params.set("page", "1");
      params.set("pageSize", String(pageSize));

      navigate(`${window.location.pathname}?${params.toString()}`);
    }, 650);

    return () => window.clearTimeout(timer);
  }, [searchTerm, navigate, searchParams, pageSize]);

  // Local UI state for per-row toggle (not persisted) -- when a row is turned off we show "Draft"
  const [switchState, setSwitchState] = useState<Record<string, boolean>>({});
  const [loadingSwitch, setLoadingSwitch] = useState<Record<string, boolean>>(
    {},
  );

  const isSwitchOn = (id: string, status?: string) => {

    // 1. If we already have a tracked state, use it
    if (Object.prototype.hasOwnProperty.call(switchState, id)) {
      return !!switchState[id];
    }

    // 2. Fall back to status
    if (status?.toLowerCase() === "active") return true;
    if (status?.toLowerCase() === "draft") return false;

    // 3. Default (if status is missing or unknown)
    return false;
  };

  const { isSubscribed } = useIsSubscribed();
  const [showModal, setShowModal] = useState(false);

  const toggleSwitch = (id: string, currentOn: boolean) => {
    const newStatus = currentOn ? "draft" : "active";

    if (!isSubscribed) {
      setShowModal(true);
      return;
    }

    setLoadingSwitch((prev) => ({ ...prev, [id]: true }));
    setSwitchState((prev) => ({ ...prev, [id]: !currentOn }));

    fetcher.submit(
      { intent: "updateStatus", id, status: newStatus },
      { method: "post" },
    );
  };

  useEffect(() => {
    if (fetcher.state === "idle") {
      setLoadingSwitch({});
    }
  }, [fetcher.state]);

  const analyticsPath = `/app/analytics-page`;
  const isAnalyticsLoading = isNavigatingTo(analyticsPath);

  const createPath = "/app/deal-discount-setup";
  const isCreateLoading = isNavigatingTo(createPath);

  const createBundleDealAction = {
    content: isCreateLoading ? undefined : "Create bundle deal",
    onAction: () => navigate(createPath),
    loading: isCreateLoading,
    disabled: isCreateLoading,
  };

  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedStep, setExpandedStep] = useState<number | null>(0);
  const [completedSteps, setCompletedSteps] = useState([false]);

  const toggleStep = (index: number, forceOpen = false) => {
    if (forceOpen) {
      setExpandedStep(index);
      return;
    }
    setExpandedStep(expandedStep === index ? null : index);
  };

  useEffect(() => {
    setSearchTerm(searchValue);
  }, [searchValue]);

  const totalItems = total;
  const totalPages = Math.ceil(totalItems / pageSize);

  const embedProgress = isEmbeded === "enabled" ? 1 : 0;

  let progress = 0;
  if (!totalItems) {
    progress = embedProgress * 50;
  } else {
    const manualCompletedCount = completedSteps.filter(Boolean).length;
    const totalSteps = 1 + completedSteps.length;
    progress = ((embedProgress + manualCompletedCount) / totalSteps) * 100;
  }

  // Empty state
  if (!totalItems) {
    return (
      <Page title="Get started with Adlevate Product Bundles!">
        <Layout>
          <Layout.Section>
            {/* Setup Guide Card */}
            {isExpanded ? (
              <Card>
                <Box padding="400">
                  <BlockStack gap="400">
                    {/* Header */}
                    <InlineStack align="space-between" blockAlign="start">
                      <Text variant="headingMd" as="h2">
                        Setup guide
                      </Text>
                      <Button
                        variant="plain"
                        onClick={() => setIsExpanded(false)}
                        accessibilityLabel="Close setup guide"
                      >
                        ✕
                      </Button>
                    </InlineStack>

                    <ProgressBar
                      progress={progress}
                      size="small"
                      color="green"
                    />

                    <div
                      style={{
                        borderColor: "var(--p-color-border)",
                        borderStyle: "solid",
                        borderWidth: "1px",
                        borderRadius: "var(--p-border-radius-300)",
                      }}
                    >
                      <BlockStack gap="400">
                        {/* Step 1 */}
                        <div
                          style={{
                            cursor: "pointer",
                            borderBottom: "1px solid var(--p-color-border)",
                          }}
                        >
                          <Box
                            padding="400"
                            borderRadius="200"
                            border="base"
                            background="bg-surface"
                            onClick={() => toggleStep(0)}
                          >
                            <Text variant="headingSm" as="h3">
                              1. Activate Adlevate Product Bundles on your
                              storefront
                              {isEmbeded === "enabled" && (
                                <span
                                  style={{
                                    color: "green",
                                    marginLeft: "0.5rem",
                                  }}
                                >
                                  ✔
                                </span>
                              )}
                            </Text>

                            {expandedStep === 0 && (
                              <>
                                <Text variant="bodyMd" as="p" tone="subdued">
                                  Activate the widget by clicking the button
                                  below and then clicking "Save" on the
                                  following page.
                                </Text>
                                <Box paddingBlockStart="200">
                                  <Button
                                    variant="primary"
                                    onClick={() => {
                                      window.open(embedPath, "_blank");
                                    }}
                                  >
                                    <span
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.4rem",
                                      }}
                                    >
                                      <span
                                        className="Polaris-Icon"
                                        style={{ display: "flex" }}
                                      >
                                        <svg
                                          viewBox="0 0 20 20"
                                          className="Polaris-Icon__Svg"
                                          focusable="false"
                                          aria-hidden="true"
                                        >
                                          <path d="M11.75 3.5a.75.75 0 0 0 0 1.5h2.19l-4.97 4.97a.75.75 0 1 0 1.06 1.06l4.97-4.97v2.19a.75.75 0 0 0 1.5 0v-4a.75.75 0 0 0-.75-.75h-4Z"></path>
                                          <path d="M15 10.967a.75.75 0 0 0-1.5 0v2.783c0 .69-.56 1.25-1.25 1.25h-6c-.69 0-1.25-.56-1.25-1.25v-6c0-.69.56-1.25 1.25-1.25h2.783a.75.75 0 0 0 0-1.5h-2.783a2.75 2.75 0 0 0-2.75 2.75v6a2.75 2.75 0 0 0 2.75 2.75h6a2.75 2.75 0 0 0 2.75-2.75v-2.783Z"></path>
                                        </svg>
                                      </span>
                                      Activate app embed
                                    </span>
                                  </Button>
                                </Box>
                              </>
                            )}
                          </Box>
                        </div>

                        {/* Step 2 */}
                        <div style={{ cursor: "pointer" }}>
                          <Box
                            paddingBlockStart="0"
                            padding="400"
                            borderRadius="200"
                            border="base"
                            background="bg-surface"
                            onClick={() => toggleStep(1)}
                          >
                            <Text variant="headingSm" as="h3">
                              2. Create your first bundle deal
                            </Text>
                            {expandedStep === 1 && (
                              <>
                                <Text variant="bodyMd" as="p" tone="subdued">
                                  Choose a bundle template and customize it to
                                  your liking.
                                </Text>
                                <Box paddingBlockStart="200">
                                  <Button
                                    variant="primary"
                                    onClick={() => {
                                      navigate(createPath);
                                      setCompletedSteps([true]);
                                      toggleStep(1, true);
                                    }}
                                    loading={isCreateLoading}
                                    disabled={isCreateLoading}
                                  >
                                    {isCreateLoading
                                      ? "Loading..."
                                      : "Create bundle deal"}
                                  </Button>
                                </Box>
                              </>
                            )}
                          </Box>
                        </div>
                      </BlockStack>
                    </div>
                  </BlockStack>
                </Box>
              </Card>
            ) : (
              <Card>
                <Box padding="400">
                  <InlineStack align="space-between" blockAlign="center">
                    <InlineStack gap="300" blockAlign="center">
                      <Text variant="headingMd" as="h2">
                        Setup guide
                      </Text>
                    </InlineStack>
                    <Button plain onClick={() => setIsExpanded(true)}>
                      Expand
                    </Button>
                  </InlineStack>
                </Box>
              </Card>
            )}

            {/* Empty State Card */}
            <Box
              paddingBlockStart="400"
              style={{ marginBottom: "20px", marginTop: "20px" }}
            >
              <Card>
                <EmptyState
                  heading="No discounts found"
                  action={createBundleDealAction}
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>
                    Create your first app-backed volume discount to get started.
                  </p>
                </EmptyState>
              </Card>
            </Box>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  // Build table rows from the server-paginated items
  const rows = data.map((discount) => {
    const rowId = String(discount.id); // IndexTable.Row id must be a string

    const visitorCount = discount.visitor_count || 0; // Use per-discount count
    const bundleOrderCount = discount.bundle_order_count || 0; // Use per-discount count
    const bundleOrderConversion = discount.bundle_order_conversion || 0; // Use per-discount count

    const editPath = `/app/discounts/edit/${discount.shopify_discount_id}`;
    const isEditLoading = isNavigatingTo(editPath);

    return (
      <IndexTable.Row id={rowId} key={rowId}>
        {/* Deal column: toggle + title + subtitle (clean spacing) */}
        <IndexTable.Cell>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* visual toggle (UI only) */}
            <div style={{ width: 44, flexShrink: 0 }}>
              {(() => {
                const on = isSwitchOn(rowId, discount.deal_status);
                const isLoading = loadingSwitch[rowId];
                return (
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleSwitch(rowId, on)}
                    style={{
                      width: 40,
                      height: 22,
                      borderRadius: 12,
                      background: on ? "#34D399" : "#E6E9EE",
                      padding: 3,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: on ? "flex-end" : "flex-start",
                      transition: "background 150ms ease",
                      position: "relative",
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div
                        style={{
                          width: 14,
                          height: 14,
                          border: "2px solid #fff",
                          borderTop: "2px solid rgba(255,255,255,0.3)",
                          borderRadius: "50%",
                          animation: "spin 1s linear infinite",
                        }}
                      />
                    ) : (
                      <span
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: 14,
                          background: "#FFFFFF",
                          boxShadow: "0 1px 2px rgba(16,24,40,0.05)",
                        }}
                      />
                    )}
                    {/* Spinner animation */}
                    <style>
                      {`
                        @keyframes spin {
                          0% { transform: rotate(0deg);}
                          100% { transform: rotate(360deg);}
                        }
                      `}
                    </style>
                  </button>
                );
              })()}
            </div>

            <div style={{ lineHeight: 1.1 }}>
              <div
                onClick={() =>
                  navigate(
                    `/app/discounts/edit/${discount.shopify_discount_id}`,
                  )
                }
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    navigate(
                      `/app/discounts/edit/${discount.shopify_discount_id}`,
                    );
                  }
                }}
                style={{
                  cursor: "pointer",
                  color: "var(--p-color-text-interactive)",
                  fontWeight: 600,
                }}
              >
                {discount.name_app}
              </div>
              <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                {(() => {
                  const value =
                    discount.visibility_primary &&
                    discount.visibility_primary !== "null"
                      ? discount.visibility_primary
                      : discount.visibility_bundle;

                  const mapping: Record<string, string> = {
                    all: "All Products",
                    specific: "Specific selected products",
                    except: "All products except selected",
                    bundle_specific: "Specific selected products",
                    bundle_except: "All products except selected",
                  };

                  return mapping[value as keyof typeof mapping] || value;
                })()}
              </div>
            </div>
          </div>
        </IndexTable.Cell>
        {/* Status + compact stats column: tighter layout */}
        <IndexTable.Cell>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div>
              {(() => {
                const on = isSwitchOn(rowId, discount.deal_status);
                const label = on ? discount.deal_status || "Active" : "Draft";
                const bg = on ? "#DFF6E9" : "#F3F4F6";
                const color = on ? "#065F46" : "#374151";
                return (
                  <span
                    style={{
                      display: "inline-block",
                      background: bg,
                      color,
                      padding: "6px 10px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {label}
                  </span>
                );
              })()}
            </div>

            <div
              style={{
                marginLeft: 12,
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0,1fr))",
                gap: 16,
                minWidth: 240,
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "#9CA3AF" }}>Visitors</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>
                  {visitorCount}
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "#9CA3AF" }}>CR</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>
                  {bundleOrderConversion}%
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "#9CA3AF" }}>Bundles</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>
                  {bundleOrderCount}
                </div>
              </div>
            </div>
          </div>
        </IndexTable.Cell>
        {/* Actions column: Run A/B test + small icon buttons (visual) - delete now uses confirmation modal */}
        <IndexTable.Cell>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 10,
            }}
          >
            {/* small icon buttons (visual only) */}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Button
                plain
                ariaLabel="Analytics"
                title="Analytics"
                onClick={() => navigate(analyticsPath)}
                size="slim"
                loading={isAnalyticsLoading}
                disabled={isAnalyticsLoading}
                icon={
                  isAnalyticsLoading ? undefined : (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect
                        x="3"
                        y="10"
                        width="3"
                        height="11"
                        rx="0.5"
                        fill="#374151"
                      />
                      <rect
                        x="10"
                        y="5"
                        width="3"
                        height="16"
                        rx="0.5"
                        fill="#374151"
                      />
                      <rect
                        x="17"
                        y="2"
                        width="3"
                        height="19"
                        rx="0.5"
                        fill="#374151"
                      />
                    </svg>
                  )
                }
              />

              <Button
                plain
                ariaLabel="Edit"
                title="Edit"
                onClick={() => navigate(editPath)}
                size="slim"
                loading={isEditLoading}
                disabled={isEditLoading}
                icon={
                  isEditLoading ? undefined : (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3 21l3-1 11-11 1-3L17 3 6 14 3 21z"
                        fill="#374151"
                      />
                    </svg>
                  )
                }
              />

              {/* Delete with confirmation modal */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <DeleteConfirmationModal
                  rowId={rowId}
                  onDelete={(id) => {
                    fetcher.submit(
                      { intent: "delete", deleteId: id },
                      { method: "post" },
                    );
                  }}
                />
              </div>
            </div>
          </div>
        </IndexTable.Cell>
        <SubscriptionModal
          open={showModal}
          onClose={() => setShowModal(false)}
          redirectPath="/app/plans-page"
          message="Please subscribe to unlock this feature."
          title="Subscription Required"
        />
      </IndexTable.Row>
    );
  });

  return (
    <>
      {/* Top overview cards - equal width and full space (Tailwind) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg-grid-cols-3 lg:grid-cols-3 gap-5 px-6 mb-4 mt-7 w-full">
        {/* Usage Overview Card */}
        <div className="bg-white rounded-xl shadow-sm flex">
          <div className="flex-1 min-w-0 p-4 flex flex-col justify-between">
            <div className="flex-1">
              <div className="text-base font-semibold mb-1.5">
                Usage overview
              </div>
              <div className="text-sm text-gray-500">
                {currencyCode} {revenue} /co added revenue this month
              </div>

              <div className="mt-3">
                <div className="h-2 bg-gray-100 rounded-md overflow-hidden">
                  <div className="w-1/5 h-full bg-green-100" />
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-400">
                  <div>
                    {currencyCode} {revenue}
                  </div>
                  <div>Resets on {getNextResetDate()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Card */}
        <div className="bg-white rounded-xl shadow-sm flex">
          <div className="flex-1 min-w-0 p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="text-base font-semibold mb-1.5">Analytics</div>
                <div>
                  <div className="text-xs text-gray-500">
                    This month's added revenue
                  </div>
                  <div className="font-semibold">
                    {currencyCode} {revenue}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <Button
                  plain
                  aria-label="Analytics"
                  accessibilityLabel="Analytics"
                  onClick={() => navigate(analyticsPath)}
                  size="slim"
                  loading={isAnalyticsLoading}
                  disabled={isAnalyticsLoading}
                >
                  {isAnalyticsLoading ? null : "View full analytics"}
                </Button>
                <div className="text-right">
                  <div className="text-xs text-gray-500">
                    All time added revenue
                  </div>
                  <div className="font-semibold">
                    {currencyCode} {revenue}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Theme Extension Card */}
        <div className="bg-white rounded-xl shadow-sm flex">
          <div className="flex-1 min-w-0 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="text-base font-semibold">Theme extension</div>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold
                    ${
                      isEmbeded === "enabled"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }
                  `}
                >
                  {/* Status Dot */}
                  <span
                    className={`w-2 h-2 rounded-full mr-1
                      ${isEmbeded === "enabled" ? "bg-green-500" : "bg-red-500"}
                    `}
                  ></span>
                  {isEmbeded === "enabled" ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="text-sm text-gray-500 mt-2">
                Bundles widget is visible in product pages.
              </div>
            </div>

            <div className="mt-3">
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                {(isEmbeded === "disabled" || isEmbeded === "not_found") && (
                  <Box>
                    <Button
                      variant="primary"
                      onClick={() => {
                        window.open(embedPath, "_blank");
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                        }}
                      >
                        <span
                          className="Polaris-Icon"
                          style={{ display: "flex" }}
                        >
                          <svg
                            viewBox="0 0 20 20"
                            className="Polaris-Icon__Svg"
                            focusable="false"
                            aria-hidden="true"
                          >
                            <path d="M11.75 3.5a.75.75 0 0 0 0 1.5h2.19l-4.97 4.97a.75.75 0 1 0 1.06 1.06l4.97-4.97v2.19a.75.75 0 0 0 1.5 0v-4a.75.75 0 0 0-.75-.75h-4Z"></path>
                            <path d="M15 10.967a.75.75 0 0 0-1.5 0v2.783c0 .69-.56 1.25-1.25 1.25h-6c-.69 0-1.25-.56-1.25-1.25v-6c0-.69.56-1.25 1.25-1.25h2.783a.75.75 0 0 0 0-1.5h-2.783a2.75 2.75 0 0 0-2.75 2.75v6a2.75 2.75 0 0 0 2.75 2.75h6a2.75 2.75 0 0 0 2.75-2.75v-2.783Z"></path>
                          </svg>
                        </span>
                        Activate app embed
                      </span>
                    </Button>
                  </Box>
                )}
                <NeedHelp />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Page
        title="Bundle deals"
        fullWidth
        primaryAction={createBundleDealAction}
      >
        <Card>
          {/* Search form (full-width, borderless) -- auto-search on pause; button removed */}
          <Form
            method="get"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: 16,
              width: "100%",
            }}
          >
            <div
              style={{
                width: "100%",
                boxShadow: "0 8px 24px rgba(16,24,40,0.06)",
                borderRadius: 12,
                background: "#fff",
                padding: "8px 12px",
              }}
            >
              <input
                type="search"
                name="search"
                placeholder="Search by name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoComplete="off"
                style={{
                  width: "100%",
                  height: 40,
                  border: "none",
                  outline: "none",
                  boxShadow: "none",
                  padding: "0 6px",
                  fontSize: 14,
                  background: "transparent",
                  color: "#374151",
                }}
              />
            </div>
            {/* Keep current pageSize in the URL when searching (for non-JS fallback) */}
            <input type="hidden" name="pageSize" value={String(pageSize)} />
          </Form>

          <IndexTable
            itemCount={totalItems}
            selectable={false}
            headings={[
              { title: <strong>Deal</strong> },
              { title: <strong>Status</strong> },
              { title: <strong>Actions</strong> },
            ]}
          >
            {rows}
          </IndexTable>

          {/* Pager that updates the URL */}
          <div
            style={{
              paddingTop: 16,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 10,
            }}
          >
            <ButtonGroup>
              <Form method="get">
                <input type="hidden" name="page" value={String(page - 1)} />
                <input type="hidden" name="pageSize" value={String(pageSize)} />
                <input type="hidden" name="search" value={searchValue} />
                <Button disabled={page <= 1} submit>
                  Previous
                </Button>
              </Form>
              <Form method="get">
                <input type="hidden" name="page" value={String(page + 1)} />
                <input type="hidden" name="pageSize" value={String(pageSize)} />
                <input type="hidden" name="search" value={searchValue} />
                <Button disabled={page >= totalPages} submit>
                  Next
                </Button>
              </Form>
            </ButtonGroup>
            <Text>{`Page ${page} of ${totalPages}`}</Text>
          </div>
        </Card>
      </Page>
    </>
  );
}

/* ----------------------------- Page Wrapper ---------------------------- */
export default function DiscountsTest() {
  return (
    <Polaris.AppProvider>
      <DiscountsContent />
    </Polaris.AppProvider>
  );
}
