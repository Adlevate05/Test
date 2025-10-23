import { useLoaderData, useFetcher } from "@remix-run/react";
import { Button, Box, Card } from "@shopify/polaris";
import { ArrowLeftIcon } from "@shopify/polaris-icons";
import { useRef } from "react";

import DropDown2 from "app/components/Bogo-components/drop-down";
import { useAppContext } from "../../utils/AppContext";
import {
  BogoDealSubCardOne,
  BogoDealSubCardTwo,
  BogoDealSubCardThree,
  BogoDealSubCardFour,
} from "../../components/bogo-deals-card";
import { useIsSubscribed } from "app/hooks/useIsSubscribed";
import { getApiMessage } from "app/utils/apiErrors";

const toIso = (date?: string, time?: string) => {
  if (!date) return undefined;
  const t = time && time.trim() ? time : "00:00";
  const dtLocal = new Date(`${date}T${t}:00`);
  return isNaN(dtLocal.getTime()) ? undefined : dtLocal.toISOString();
};

type ProductListItem = {
  id: string;
  title: string;
  imageSrc: string;
  imageAlt: string;
};
type LoaderData = { products: ProductListItem[]; functionId: string };

type BogoDealFormProps = {
  mode: "create" | "edit";
  id?: string;
};

export function BogoDealForm({ mode, id }: BogoDealFormProps) {
  const { products, functionId } = useLoaderData<LoaderData>();
  const fetcher = useFetcher();
  const { isSubscribed } = useIsSubscribed();

  const {
    blockTitle,
    bundleName,
    discountName,
    visibility,
    startDate,
    startTime,
    endDate,
    endTime,
    cornerRadius,
    spacing,
    selectedStyle,
    bogoPackages,
    cardsBackground,
    selectedBackground,
    borderColor,
    blockTitleColor,
    titleColor,
    subtitleColor,
    priceColor,
    fullPriceColor,
    labelBackground,
    labelText,
    badgeBackground,
    badgeText,
    blockTitleFontSize,
    blockTitleFontStyle,
    titleFontSize,
    titleFontStyle,
    subtitleFontSize,
    subtitleFontStyle,
    labelFontSize,
    labelFontStyle,
    primarySpecificIds = [],
    primaryExceptIds = [],
    validateForm,
  } = useAppContext();

  const submittingAction = useRef<"draft" | "active" | null>(null);

  const renderSelectedComponent = () => {
    switch (selectedStyle) {
      case 0:
        return <BogoDealSubCardOne />;
      case 1:
        return <BogoDealSubCardTwo />;
      case 2:
        return <BogoDealSubCardThree />;
      case 3:
        return <BogoDealSubCardFour />;
      default:
        return <p className="text-gray-500">No matching component found.</p>;
    }
  };
  const handleSubmit = (status: "draft" | "active") => {
    if (!validateForm()) return;
    submittingAction.current = status;

    const fd = new FormData();
    fd.set("type", "bogo");
    fd.set("function_id", functionId);
    fd.set("status", status);

    const title = (blockTitle ?? "").trim() || "Bundle deal";
    fd.set("block_title", title);
    fd.set("name_app", bundleName ?? "");
    fd.set("name_store", discountName ?? "");

    fd.set("visibility", visibility);
    if (visibility === "specific")
      primarySpecificIds.forEach((x) => fd.append("primary_specific_ids[]", x));
    if (visibility === "except")
      primaryExceptIds.forEach((x) => fd.append("primary_except_ids[]", x));

    const startsAt = toIso(startDate, startTime);
    const endsAt = endDate ? toIso(endDate, endTime) : undefined;
    if (startsAt) fd.set("starts_at", startsAt);
    if (startTime) fd.set("start_time", startTime);
    if (endsAt) fd.set("ends_at", endsAt);
    if (endTime) fd.set("end_time", endTime);

    fd.set(
      "style",
      JSON.stringify({
        cornerRadius,
        spacing,
        selectedStyle,
        cardsBackground,
        selectedBackground,
        borderColor,
        blockTitleColor,
        titleColor,
        subtitleColor,
        priceColor,
        fullPriceColor,
        labelBackground,
        labelText,
        badgeBackground,
        badgeText,
        blockTitleFontSize,
        blockTitleFontStyle,
        titleFontSize,
        titleFontStyle,
        subtitleFontSize,
        subtitleFontStyle,
        labelFontSize,
        labelFontStyle,
      }),
    );
    fd.set("options", JSON.stringify({ bogoPackages }));

    fetcher.submit(fd, {
      method: "post",
      action:
        mode === "edit" ? `/app/deals-bogo-edit/${id}` : `/app/deals/bogo/`,
    });
  };

  const responseData = (fetcher as any)?.data;
  const apiMessage = getApiMessage(responseData);
  const isSubmitting = fetcher.state !== "idle";
  const isDraftLoading = isSubmitting && submittingAction.current === "draft";
  const isPublishLoading =
    isSubmitting && submittingAction.current === "active";

  return (
    <Box padding="0" minHeight="100vh">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button
              icon={ArrowLeftIcon}
              url={mode === "create" ? "/app/deal-discount-setup" : "/app"}
              variant="plain"
            />
            <p className="text-xl font-semibold">BOGO deal</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          <div className="w-full lg:w-1/2 lg:pr-6">
            <DropDown2 products={products} />
          </div>
          <div className="w-full lg:w-1/2 pt-12 lg:pt-0 lg:pl-6 lg:sticky lg:top-0 lg:self-start">
            <Card>
              <div className="w-full max-w-md mx-auto">
                <div className="mt-4">{renderSelectedComponent()}</div>
                {/* API messages */}
                {apiMessage && (
                  <div className="mt-4">
                    <Card>
                      <div className="p-4">
                        <div className="mb-2 font-semibold">Error:</div>
                        <div className="text-sm text-rose-600">{apiMessage}</div>
                      </div>
                    </Card>
                  </div>
                )}
                <div className="flex justify-end gap-4 mt-8">
                  <div className="Draft_button">
                    <Button
                      size="slim"
                      onClick={() => handleSubmit("draft")}
                      loading={isDraftLoading}
                      disabled={isDraftLoading || isPublishLoading || !isSubscribed}
                    >
                      Save As Draft
                    </Button>
                  </div>
                  <Button
                    variant="primary"
                    size="slim"
                    onClick={() => handleSubmit("active")}
                    loading={isPublishLoading}
                    disabled={isPublishLoading || isDraftLoading || !isSubscribed}
                  >
                    Publish
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Box>
  );
}
