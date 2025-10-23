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
} from "@remix-run/react";
import * as PolarisImport from "@shopify/polaris";
import { ButtonGroup } from "@shopify/polaris";
import { DiscountService } from "../core/services/discount.service";
import { getAdminAndShopFromRequest } from "app/core/shopify/admin-client";
import NeedHelp from "../components/CTA/NeedHelp";
import { getCurrencyForShop } from "app/core/shopify/currency.server";
import { AnalyticsBundleRevenueService } from "app/core/services/analytics.bundle-revenue.service";
import { DeleteConfirmationModal } from "app/helper/deleteModel";
import { useNavigation } from "@remix-run/react";
import { useIsSubscribed } from "app/hooks/useIsSubscribed";
import { SubscriptionModal } from "app/components/common/subscription-modal";

const Polaris = (PolarisImport as any).default || PolarisImport;
const { Page, Card, IndexTable, Text, Button, EmptyState, Layout } = Polaris;

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
  }>;
  total: number;
  currencyCode: string;
  revenue?: number;
}

/* ----------------------------- Loader ---------------------------- */
export async function loader({ request }: LoaderFunctionArgs) {
  // Get search and pagination parameters from the URL
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page") || 1);
  const pageSize = Number(url.searchParams.get("pageSize") || 10);
  const search = url.searchParams.get("search") || "";

  const { admin, shopDomain } = await getAdminAndShopFromRequest(request);
  const service = new DiscountService(admin, shopDomain);
  const analyticsRevenueService = new AnalyticsBundleRevenueService();

  let { revenue } = await analyticsRevenueService.getRevenue();

  const { currencyCode } = await getCurrencyForShop(shopDomain, admin);

  const { data: discounts, total } = await service.getAll({
    page,
    pageSize,
    search,
    shop_name: shopDomain,
  });

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
  });
}

// Action function remains the same
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
      }
    }
    return json({ ok: false });
  }
}

/* ----------------------------- Page Content ---------------------------- */
function DiscountsContent() {
  const { data, total, currencyCode, revenue } =
    useLoaderData<AllDiscountsData>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const fetcher = useFetcher();

  // Add status filter state
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft">(
    "all",
  );

  // Local UI state for per-row toggle (not persisted) — when a row is turned off we show "Draft"
  const [switchState, setSwitchState] = useState<Record<string, boolean>>({});
  const [loadingSwitch, setLoadingSwitch] = useState<Record<string, boolean>>(
    {},
  );

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

  // Filter data based on selected status
  const filteredData = data.filter((discount) => {
    if (statusFilter === "all") return true;

    const rowId = String(discount.id);
    const isOn = isSwitchOn(rowId, discount.deal_status);

    if (statusFilter === "active") {
      return isOn;
    } else if (statusFilter === "draft") {
      return !isOn;
    }
    return true;
  });

  const totalItems = filteredData.length; // Use filtered data length
  const totalPages = Math.ceil(totalItems / pageSize);

  // Empty state
  let rows;

  if (!totalItems) {
    const emptyMessage =
      statusFilter === "all"
        ? "No discounts found"
        : statusFilter === "active"
          ? "No active discounts found"
          : "No draft discounts found";

    const emptySubtext =
      statusFilter === "all"
        ? "Create your first app-backed volume discount to get started."
        : `Switch to "All" to see all your discounts.`;

    rows = (
      <IndexTable.Row id="no-discounts" key="no-discounts">
        <IndexTable.Cell colSpan={3}>
          <div
            style={{ padding: "20px", textAlign: "center", color: "#6B7280" }}
          >
            <Text as="p" variant="bodyMd" fontWeight="medium">
              {emptyMessage}
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              {emptySubtext}
            </Text>
          </div>
        </IndexTable.Cell>
      </IndexTable.Row>
    );
  } else {
    // Build table rows from the filtered items
    rows = filteredData.map((discount) => {
      const rowId = String(discount.id); // IndexTable.Row id must be a string

      const visitorCount = discount.visitor_count || 0; // Use per-discount count
      const bundleOrderCount = discount.bundle_order_count || 0; // Use per-discount count
      const bundleOrderConversion = discount.bundle_order_conversion || 0; // Use per-discount count

      // Hook up the modal's onDelete to your existing Remix action via fetcher
      const handleDelete = (id: string) => {
        fetcher.submit({ intent: "delete", deleteId: id }, { method: "post" });
      };

      const editPath = `/app/discounts/edit/${discount.shopify_discount_id}`;
      const analyticsPath = `/app/analytics-page`;

      const isEditLoading = isNavigatingTo(editPath);
      const isAnalyticsLoading = isNavigatingTo(analyticsPath);

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
                <div style={{ fontSize: 12, color: "#6B7280" }}>
                  All products
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

          {/* Actions column: Run A/B test + small icon buttons (visual) - delete logic preserved */}
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
  }

  return (
    <>
      <Page title="Bundle deals" fullWidth>
        <Card>
          {/* Status filter buttons - Replace the search form with this */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: 16,
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                background: "#f6f6f7",
                borderRadius: 8,
                padding: 2,
                gap: 2,
              }}
            >
              {/* All Filter */}
              <button
                onClick={() => setStatusFilter("all")}
                style={{
                  background: statusFilter === "all" ? "#fff" : "transparent",
                  color: statusFilter === "all" ? "#000" : "#6B7280",
                  padding: "8px 16px",
                  borderRadius: 6,
                  fontWeight: statusFilter === "all" ? 600 : 400,
                  boxShadow:
                    statusFilter === "all"
                      ? "0 1px 3px rgba(16,24,40,0.1)"
                      : "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 14,
                  transition: "all 150ms ease",
                }}
              >
                All
              </button>

              {/* Active Filter */}
              <button
                onClick={() => setStatusFilter("active")}
                style={{
                  background:
                    statusFilter === "active" ? "#fff" : "transparent",
                  color: statusFilter === "active" ? "#000" : "#6B7280",
                  padding: "8px 16px",
                  borderRadius: 6,
                  fontWeight: statusFilter === "active" ? 600 : 400,
                  boxShadow:
                    statusFilter === "active"
                      ? "0 1px 3px rgba(16,24,40,0.1)"
                      : "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 14,
                  transition: "all 150ms ease",
                }}
              >
                Active
              </button>

              {/* Draft Filter */}
              <button
                onClick={() => setStatusFilter("draft")}
                style={{
                  background: statusFilter === "draft" ? "#fff" : "transparent",
                  color: statusFilter === "draft" ? "#000" : "#6B7280",
                  padding: "8px 16px",
                  borderRadius: 6,
                  fontWeight: statusFilter === "draft" ? 600 : 400,
                  boxShadow:
                    statusFilter === "draft"
                      ? "0 1px 3px rgba(16,24,40,0.1)"
                      : "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 14,
                  transition: "all 150ms ease",
                }}
              >
                Draft
              </button>
            </div>
          </div>

          <IndexTable
            itemCount={totalItems || 1} // Use filtered count
            selectable={false}
            headings={[
              { title: <strong>Deal</strong> },
              { title: <strong>Status</strong> },
              { title: <strong>Actions</strong> },
            ]}
          >
            {rows}
          </IndexTable>

          {/* Updated footer to show filter info instead of pagination */}
          <div
            style={{
              paddingTop: 16,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Text variant="bodySm" tone="subdued">
              {statusFilter === "all"
                ? `Showing all ${totalItems} discounts`
                : `Showing ${totalItems} ${statusFilter} discount${totalItems !== 1 ? "s" : ""} of ${total} total`}
            </Text>
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
