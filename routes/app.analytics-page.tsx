import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate, useSearchParams } from "@remix-run/react";
import { createDateFilter } from "../helper/helper";
import "../components/MsGlobal.css";
import { AnalyticsVisitorsUniqueBundleService } from "app/core/services/analytics.visitors.unique.bundle.service";
import { AnalyticsBundleRevenueService } from "app/core/services/analytics.bundle-revenue.service";
import React, { useEffect, useRef, useState } from "react";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  Button,
  Icon,
  InlineStack,
  Box,
  Divider,
  InlineGrid,
  Tooltip as PolarisToolTip,
  Popover,
  ActionList,
} from "@shopify/polaris";
import { MenuIcon, InfoIcon } from "@shopify/polaris-icons";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Legend,
  Filler,
  Tooltip as ChartToolTip,
} from "chart.js";
import { getCurrencyForShop } from "app/core/shopify/currency.server";
import { getAdminAndShopFromRequest } from "app/core/shopify/admin-client";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const timePeriod = url.searchParams.get("timePeriod") || "last30d";
  const { admin, shopDomain } = await getAdminAndShopFromRequest(request);

  const analyticsVisitorsUniqueBundleService =
    new AnalyticsVisitorsUniqueBundleService();
  const analyticsRevenueService = new AnalyticsBundleRevenueService();
  const dateFilter = createDateFilter(timePeriod, "date", shopDomain);
  //console.log(dateFilter)

  let total_visitor =
    await analyticsVisitorsUniqueBundleService.countVisitors(dateFilter);
  let { revenue, revenues, bundleOrderCount, bundleOrderConversion } =
    await analyticsRevenueService.getRevenue(dateFilter);

  const { currencyCode } = await getCurrencyForShop(shopDomain, admin);

  return json({
    total_visitor,
    currencyCode,
    revenue,
    revenues,
    bundleOrderCount,
    bundleOrderConversion,
    selectedTimePeriod: timePeriod,
  });
}

// Register required chart.js components
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Legend,
  ChartToolTip,
  Filler,
);

const AnalyticsPage: React.FC = () => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [popoverActive, setPopoverActive] = useState(false);

  const timePeriodOptions = [
    { label: "Today", value: "today" },
    { label: "Yesterday", value: "yesterday" },
    { label: "Last 7d", value: "last7d" },
    { label: "Last 30d", value: "last30d" },
    { label: "Last 90d", value: "last90d" },
    { label: "Last 365d", value: "last365d" },
    { label: "Last month", value: "lastmonth" },
    { label: "Last 12 months", value: "last12months" },
    { label: "Last year", value: "lastyear" },
  ];

  const {
    total_visitor,
    currencyCode,
    revenue,
    revenues,
    bundleOrderCount,
    bundleOrderConversion,
    selectedTimePeriod,
  } = useLoaderData<typeof loader>();

  const togglePopoverActive = () => setPopoverActive(!popoverActive);

  const handleActionClick = (value: string) => {
    setPopoverActive(false);

    // Navigate to the same page with the new time period parameter
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("timePeriod", value);
    navigate(`?${newSearchParams.toString()}`, { replace: true });
  };

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    // Prepare labels and data from revenues
    const labels = revenues.map((r) => r.date);
    const dataPoints = revenues.map((r) => r.revenue);

    chartInstanceRef.current = new Chart(chartRef.current, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Daily Revenue",
            data: dataPoints,
            borderColor: "#006FBB",
            backgroundColor: "rgba(0, 111, 187, 0.1)",
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: "#006FBB",
            pointBorderColor: "#FFFFFF",
            pointBorderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: "index",
            intersect: false,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            titleColor: "#FFFFFF",
            bodyColor: "#FFFFFF",
            borderColor: "#006FBB",
            borderWidth: 1,
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: {
              color: "#6B7280",
              font: { size: 12 },
            },
          },
          y: {
            beginAtZero: true,
            grid: { color: "#E5E7EB" },
            border: { display: false },
            ticks: {
              color: "#6B7280",
              font: { size: 12 },
              callback: (value) => `${currencyCode}` + value,
            },
          },
        },
        interaction: {
          mode: "nearest",
          axis: "x",
          intersect: false,
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [revenues, currencyCode]);

  const DonutChart = ({
    value = 0,
    total = 100,
  }: {
    value?: number;
    total?: number;
  }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    const strokeDasharray = `${percentage} ${100 - percentage}`;
    return (
      <div className="flex justify-center items-center">
        <div className="relative w-24 h-24 sm:w-32 sm:h-32">
          <svg
            className="w-full h-full transform -rotate-90"
            viewBox="0 0 36 36"
          >
            <path
              className="text-gray-200"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-blue-600"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeDashoffset="0"
              strokeLinecap="round"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-semibold text-gray-700">{value}</span>
          </div>
        </div>
      </div>
    );
  };

  const StatCard = ({
    title,
    value,
    trend,
    trendValue,
    tooltip,
  }: {
    title: string;
    value: string | number;
    trend?: "up" | "down" | "neutral";
    trendValue?: string;
    tooltip?: string;
  }) => (
    <Card>
      <BlockStack gap="300">
        <InlineStack align="space-between">
          <Text variant="headingSm" as="h6" tone="subdued">
            {title}
          </Text>
          {tooltip && (
            <PolarisToolTip content={tooltip} width="wide">
              <Box>
                <Icon source={InfoIcon} tone="subdued" />
              </Box>
            </PolarisToolTip>
          )}
        </InlineStack>
        <Text variant="heading2xl" as="h3">
          {value}
        </Text>
        {trend && trendValue && (
          <InlineStack gap="200" align="start">
            <Box
              padding="100"
              background={trend === "up" ? "bg-surface-success" : "bg-surface"}
              borderRadius="100"
            >
              <Text
                variant="bodySm"
                tone={trend === "up" ? "success" : "subdued"}
                fontWeight="semibold"
                as="span"
              >
                {trend === "up" ? "↗" : "–"} {trendValue}
              </Text>
            </Box>
            <Text variant="bodySm" tone="subdued" as="p">
              vs 10 Jul - 8 Aug, 2025
            </Text>
          </InlineStack>
        )}
      </BlockStack>
    </Card>
  );

  return (
    <div className="custom_analytics_page">
      <Page
        title="Analytics"
        subtitle="Track your bundle performance and revenue"
      >
        <BlockStack gap="500">
          <InlineStack align="space-between">
            <div className="custom_button_styling_1">
              <Button
                icon={MenuIcon}
                variant="tertiary"
                onClick={() => window.location.reload()}
              >
                All bundle deals
              </Button>
            </div>

            <div className="custom_button_styling_2">
              <Popover
                active={popoverActive}
                activator={
                  <Button
                    variant="plain"
                    onClick={togglePopoverActive}
                    disclosure={popoverActive ? "up" : "down"}
                  >
                    {timePeriodOptions.find(
                      (option) => option.value === selectedTimePeriod,
                    )?.label || "Last 30d"}
                  </Button>
                }
                onClose={togglePopoverActive}
              >
                <ActionList
                  items={timePeriodOptions.map((option) => ({
                    content: option.label,
                    onAction: () => handleActionClick(option.value),
                  }))}
                />
              </Popover>
            </div>
          </InlineStack>
          <InlineGrid columns={{ xs: 1, sm: 2, md: 4 }} gap="400">
            <StatCard
              title="Visitors"
              value={total_visitor}
              trend="up"
              trendValue={`${bundleOrderConversion}%`}
              tooltip="All visitors that reached any product page that has a bundle widget."
            />
            <StatCard
              title="Bundle orders"
              value={bundleOrderCount}
              tooltip="All orders where customers made a bundle order with our app."
            />
            <StatCard
              title="Conversion to bundle"
              value={`${bundleOrderConversion}%`}
              tooltip="Conversion rate of customers who made a bundle order with our app."
            />
            <StatCard
              title="Added revenue"
              value={`${currencyCode} ${revenue}`}
              tooltip="Additional revenue made with our app. If single product is priced at $10 and customer orders a bundle of 2 priced at $18, additional revenue is $8."
            />
          </InlineGrid>
          <Layout>
            <Layout.Section variant="oneHalf">
              <Card>
                <BlockStack gap="400">
                  <BlockStack gap="200">
                    <Text variant="headingSm" as="h6">
                      Bundle conversion
                    </Text>
                    <Text tone="subdued" as="p">
                      See how many customers are converting to bundles.
                    </Text>
                  </BlockStack>
                  <Divider />
                  <div className="py-4">
                    <DonutChart value={bundleOrderConversion} total={100} />
                  </div>
                  <Box
                    padding="300"
                    background="bg-surface-secondary"
                    borderRadius="200"
                  >
                    <InlineStack align="space-between">
                      <Text variant="bodySm" tone="subdued" as="span">
                        Total conversions
                      </Text>
                      <Text variant="bodySm" fontWeight="semibold" as="p">
                        {bundleOrderConversion}%
                      </Text>
                    </InlineStack>
                  </Box>
                </BlockStack>
              </Card>
            </Layout.Section>
            <Layout.Section variant="oneHalf">
              <div className="Revenue_Section">
                <Card>
                  <BlockStack gap="400">
                    <BlockStack gap="200">
                      <Text variant="headingSm" as="h6">
                        Daily added revenue
                      </Text>
                      <Text variant="bodySm" tone="subdued" as="span">
                        {currencyCode} {revenue}
                      </Text>
                      <Text tone="subdued" as="p">
                        See how much additional revenue you're making with this
                        app every day.
                      </Text>
                    </BlockStack>
                    <Divider />
                    <div className="h-48 sm:h-[163px] p-4">
                      <canvas ref={chartRef} className="w-full h-full" />
                    </div>
                    <InlineStack align="space-between" blockAlign="center">
                      <InlineStack gap="200">
                        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                        <Text variant="bodySm" as="span" tone="subdued">
                          Last 30 days
                        </Text>
                      </InlineStack>
                      <Text variant="bodySm" as="span" tone="subdued">
                        Previous 30 days
                      </Text>
                    </InlineStack>
                  </BlockStack>
                </Card>
              </div>
            </Layout.Section>
          </Layout>
        </BlockStack>
      </Page>
    </div>
  );
};

export default AnalyticsPage;
