import logo from "../components/Plans/logo.png";
import splendidge from "../components/Plans/splendidge.png";
import "../components/Plans/Plans.css";
import React from "react";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Button,
  Icon,
  Banner,
  Spinner,
  Frame,
  Toast,
  Modal,
} from "@shopify/polaris";
import { StarIcon } from "@shopify/polaris-icons";
import { useMantle } from "@heymantle/react";
import { redirect, useNavigate, useFetcher } from "@remix-run/react";
import { getAdminAndShopFromRequest } from "app/core/shopify/admin-client";
import { DiscountService } from "app/core/services/discount.service";
import { ActionFunctionArgs } from "@remix-run/node";

// Plan type from Mantle
type MantlePlan = {
  id: string;
  name: string;
  description?: string | null;
  monthlyAmount: number;
  presentmentAmount: number;
  currencyCode: string;
  total: number;
  recurringInterval: string; // "day" | "year"
  recurringIntervalCount: number; // 30 or 1
  trialDays?: number;
};

// Subscription type from Mantle
type MantleSubscription = {
  id: string;
  active: boolean;
  billingStatus: "trialing" | "active" | "canceled" | string;
  trialStartsAt?: string;
  trialExpiresAt?: string;
  billingCycleAnchor?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  plan: {
    id: string;
    name: string;
    presentmentAmount: number;
    currencyCode: string;
    total: number;
    recurringInterval: string;
    recurringIntervalCount: number;
  };
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const status = formData.get("status");
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page") || 1);
  const pageSize = Number(url.searchParams.get("pageSize") || 10);
  const search = url.searchParams.get("search") || "";
  const { admin, shopDomain } = await getAdminAndShopFromRequest(request);

  const service = new DiscountService(admin, shopDomain);

  if (intent === "updateStatus") {
    await service.cancelPlanOperations(
      String(status),
      shopDomain,
      page,
      pageSize,
      search,
    );
  }
  return redirect("/app/plans-page");
}

const PricingPage: React.FC = () => {
  const { customer, plans, client } = useMantle();
  const [showCancelConfirm, setShowCancelConfirm] = React.useState(false);
  const [cancelLoading, setCancelLoading] = React.useState(false);
  const fetcher = useFetcher();

  // Cast subscription to our custom type
  const subscription = customer?.subscription as MantleSubscription | undefined;
  const activePlanId = subscription?.plan?.id;

  const shop = customer?.myshopifyDomain;
  const shopHandle = shop?.replace(".myshopify.com", "");
  const appHandle = import.meta.env.VITE_APP_HANDLE;
  const returnUrl = `https://admin.shopify.com/store/${shopHandle}/apps/${appHandle}/app/plans-page`;

  // ✅ Auto-select toggle based on current plan interval
  const [isYearly, setIsYearly] = React.useState(false);
  React.useEffect(() => {
    if (subscription?.plan?.recurringInterval === "year") {
      setIsYearly(true);
    } else {
      setIsYearly(false);
    }
  }, [subscription?.plan?.recurringInterval]);

  // Toast + loading state
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const [loadingPlanId, setLoadingPlanId] = React.useState<string | null>(null);

  const handleSelectPlan = async (plan: MantlePlan) => {
    if (plan.id === activePlanId) {
      setToastMessage("You are already on this plan");
      return;
    }

    try {
      setLoadingPlanId(plan.id);
      setToastMessage(`Redirecting to confirm ${plan.name} plan...`);

      const newSub = await client.subscribe({
        planId: plan.id,
        returnUrl: returnUrl,
      });

      if ("error" in newSub) {
        console.error("Subscription error:", newSub.error);
        setToastMessage("Subscription failed. Please try again.");
        setLoadingPlanId(null);
        return;
      }

      // Redirect to Shopify billing page
      const url = newSub.confirmationUrl;
      if (url != null) {
        window.open(url, "_top");
      } else {
        window.top!.location.href = returnUrl;
      }
    } catch (err) {
      console.error("Subscribe error:", err);
      setToastMessage("Something went wrong. Please try again.");
      setLoadingPlanId(null);
    }
  };

  const handleCancelPlan = async () => {
    try {
      setCancelLoading(true);
      setToastMessage("Cancelling subscription...");

      const result = await client.cancelSubscription({
        cancelReason: "merchant_request",
      });

      if ("error" in result) {
        console.error("Cancel error:", result.error);
        setToastMessage("Failed to cancel plan. Try again.");
      } else {
        setToastMessage("Subscription cancelled successfully.");
        fetcher.submit(
          { intent: "updateStatus", status: "draft" },
          { method: "post" },
        );
        window.top!.location.href = returnUrl;
      }
    } catch (err) {
      console.error("Cancel failed:", err);
      setToastMessage("Something went wrong while cancelling.");
    } finally {
      setCancelLoading(false);
    }
  };

  const formatInterval = (interval: string, count: number) => {
    if (interval === "day" && count === 30) return "month";
    if (interval === "year" && count === 1) return "year";
    return `${count} ${interval}${count > 1 ? "s" : ""}`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTrialDaysLeft = (trialExpiresAt?: string) => {
    if (!trialExpiresAt) return null;
    const now = new Date();
    const expires = new Date(trialExpiresAt);
    const diff = Math.ceil(
      (expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diff > 0 ? diff : 0;
  };

  // Split Mantle plans into monthly vs yearly
  const allPlans = plans as unknown as MantlePlan[];
  const monthlyPlans = allPlans.filter(
    (p) => p.recurringInterval === "day" && p.recurringIntervalCount === 30,
  );
  const yearlyPlans = allPlans.filter(
    (p) => p.recurringInterval === "year" && p.recurringIntervalCount === 1,
  );

  const displayedPlans = isYearly ? yearlyPlans : monthlyPlans;

  // ✅ Detect if trial is active (even if billingStatus says "active")
  const trialActive =
    subscription?.trialExpiresAt &&
    new Date(subscription.trialExpiresAt) > new Date();

  return (
    <Frame>
      {toastMessage && (
        <Toast content={toastMessage} onDismiss={() => setToastMessage(null)} />
      )}

      <div className="custom_analytics_page">
        {/* <div className="custom_banner_styling">
          <Banner title="This app is free for development stores." tone="info">
            When your store goes live, all bundle deals will be hidden until you
            choose a plan and approve subscription.
          </Banner>
        </div> */}

        <Page>
          <BlockStack gap="600">
            {/* Header + Toggle */}
            <Layout>
              <Layout.Section>
                <InlineStack align="space-between" blockAlign="center">
                  <Text variant="heading2xl" as="h2">
                    Choose Your Plan
                  </Text>

                  {/* <InlineStack gap="300" blockAlign="center">
                    <Text as="span">Monthly</Text>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isYearly}
                        onChange={(e) => setIsYearly(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="toggle-btn"></div>
                    </label>
                    <Text as="span">Yearly</Text>
                    <Button size="slim" variant="secondary">
                      Save 30%
                    </Button>
                  </InlineStack> */}
                </InlineStack>
              </Layout.Section>
            </Layout>

            {/* Current subscription banner */}
            {subscription && (
              <Layout>
                <Layout.Section>
                  <Banner tone={trialActive ? "warning" : "success"}>
                    <InlineStack align="space-between" blockAlign="center">
                      <Text as="h3" variant="headingLg">
                        Current Plan: {subscription.plan.name}
                      </Text>

                      <Button
                        tone="critical"
                        variant="secondary"
                        onClick={() => setShowCancelConfirm(true)}
                      >
                        Cancel Plan
                      </Button>
                    </InlineStack>

                    {trialActive ? (
                      <p>
                        Trial active –{" "}
                        <b>
                          {getTrialDaysLeft(subscription.trialExpiresAt)} days
                          left
                        </b>{" "}
                        (until {formatDate(subscription.trialExpiresAt)})<br />
                        First billing on{" "}
                        <b>{formatDate(subscription.trialExpiresAt)}</b>
                      </p>
                    ) : (
                      <p>
                        Next billing on{" "}
                        <b>{formatDate(subscription.currentPeriodEnd)}</b>
                      </p>
                    )}
                  </Banner>
                </Layout.Section>
              </Layout>
            )}

            {/* Dynamic Plans */}
            <Layout>
              {displayedPlans.length === 0 ? (
                <Layout.Section>
                  <Spinner accessibilityLabel="Loading plans" size="large" />
                </Layout.Section>
              ) : (
                displayedPlans.map((plan) => {
                  const isActive = plan.id === activePlanId;

                  return (
                    <Layout.Section key={plan.id} variant="oneThird">
                      <Card tone={isActive ? "success" : undefined}>
                        <BlockStack gap="300">
                          <Text variant="heading2xl" as="h3">
                            {plan.name}{" "}
                            {isActive && (
                              <Text as="span" tone="success">
                                (Current)
                              </Text>
                            )}
                          </Text>

                          {plan.description && (
                            <Text as="p">{plan.description}</Text>
                          )}

                          <Text as="p">
                            <b className="font-black text-lg">
                              {plan.currencyCode} {plan.total.toFixed(2)}
                            </b>{" "}
                            /{" "}
                            {formatInterval(
                              plan.recurringInterval,
                              plan.recurringIntervalCount,
                            )}
                          </Text>

                          {plan.trialDays ? (
                            <Text as="p" tone="subdued">
                              {plan.trialDays}-day free trial
                            </Text>
                          ) : (
                            <Text as="p" tone="subdued">
                              No free trial
                            </Text>
                          )}

                          <hr />
                          <div className="random_button">
                            <Button
                              variant={isActive ? "secondary" : "primary"}
                              tone={
                                isActive
                                  ? undefined // grey when current
                                  : loadingPlanId === plan.id
                                    ? "primary" // blue while loading
                                    : "success" // green normally
                              }
                              fullWidth
                              disabled={isActive}
                              loading={loadingPlanId === plan.id}
                              onClick={() => handleSelectPlan(plan)}
                            >
                              {isActive
                                ? "Current Plan"
                                : loadingPlanId === plan.id
                                  ? "Redirecting..."
                                  : plan.trialDays
                                    ? `Start ${plan.trialDays}-day free trial`
                                    : "Subscribe"}
                            </Button>
                          </div>
                        </BlockStack>
                      </Card>
                    </Layout.Section>
                  );
                })
              )}
            </Layout>
            {showCancelConfirm && (
              <Modal
                open={showCancelConfirm}
                onClose={() => setShowCancelConfirm(false)}
                title="Cancel Subscription"
                primaryAction={{
                  content: cancelLoading ? "Cancelling..." : "Yes, Cancel",
                  destructive: true,
                  onAction: async () => {
                    await handleCancelPlan();
                    setShowCancelConfirm(false);
                  },
                  loading: cancelLoading,
                  disabled: cancelLoading,
                }}
                secondaryActions={[
                  {
                    content: "No, Keep Plan",
                    onAction: () => setShowCancelConfirm(false),
                    disabled: cancelLoading,
                  },
                ]}
              >
                <Modal.Section>
                  <Text as="p">
                    Are you sure you want to cancel your current plan? You may
                    lose access to premium features immediately.
                  </Text>
                </Modal.Section>
              </Modal>
            )}

            {/* Testimonials */}
            {/* <Layout>
              <Layout.Section>
                <Text variant="headingLg" as="h2">
                  Our customer success stories
                </Text>
              </Layout.Section>
            </Layout>
            <Layout>
              <Layout.Section variant="oneHalf">
                <Card>
                  <BlockStack gap="300">
                    <InlineStack gap="100">
                      {Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <Icon key={i} source={StarIcon} tone="caution" />
                        ))}
                    </InlineStack>
                    <Text as="p">
                      I really like the app, my AOV tripled in few days and above
                      all the team is exceptional, very reactive, very professional.
                    </Text>
                    <InlineStack gap="200" blockAlign="center">
                      <img
                        className="splendige-img"
                        src={splendidge}
                        alt="Customer"
                      />
                    </InlineStack>
                  </BlockStack>
                </Card>
              </Layout.Section>
              <Layout.Section variant="oneHalf">
                <Card>
                  <BlockStack gap="300">
                    <InlineStack gap="100">
                      {Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <Icon key={i} source={StarIcon} tone="warning" />
                        ))}
                    </InlineStack>
                    <Text as="p">
                      Excellent app and support. Yours is the only one with great
                      support and easy to use. Well done!
                    </Text>
                    <InlineStack gap="200" blockAlign="center">
                      <img className="logo-img" src={logo} alt="Customer Logo" />
                    </InlineStack>
                  </BlockStack>
                </Card>
              </Layout.Section>
            </Layout> */}
          </BlockStack>
        </Page>
      </div>
    </Frame>
  );
};

export default PricingPage;
