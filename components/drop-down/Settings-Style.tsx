// app/components/drop-down/Settings-Style.tsx
import {
  Text,
  InlineStack,
  Checkbox,
  Card,
  BlockStack,
  Box,
  ChoiceList,
  TextField,
  RangeSlider,
  Modal,
  ResourceList,
  ResourceItem,
  Thumbnail,
} from "@shopify/polaris";
import { ChevronDownIcon, SettingsIcon } from "@shopify/polaris-icons";
import { useAppContext } from "app/utils/AppContext";
import { useState } from "react";

export type ProductListItem = {
  id: string;
  title: string;
  imageSrc: string;
  imageAlt: string;
};

export default function SettingsStyle({
  products = [],
}: {
  products?: ProductListItem[];
}) {
  const {
    // names / labels
    bundleName,
    setBundleName,
    discountName,
    setDiscountName,
    blockTitle,
    setBlockTitle,

    // visibility
    visibility,
    setVisibility,

    // selected product ids in context (for submit)
    primarySpecificIds = [],
    setPrimarySpecificIds,
    primaryExceptIds = [],
    setPrimaryExceptIds,

    // dates/times
    startDate,
    setStartDate,
    startTime,
    setStartTime,
    hasEndDate,
    setHasEndDate,
    endDate,
    setEndDate,
    endTime,
    setEndTime,

    // style knobs
    cornerRadius,
    setCornerRadius,
    spacing,
    setSpacing,
    selectedStyle,
    setSelectedStyle,

    // individual color states
    cardsBackground,
    setCardsBackground,
    selectedBackground,
    setSelectedBackground,
    borderColor,
    setBorderColor,
    blockTitleColor,
    setBlockTitleColor,

    titleColor,
    setTitleColor,
    subtitleColor,
    setSubtitleColor,
    priceColor,
    setPriceColor,
    fullPriceColor,
    setFullPriceColor,

    labelBackground,
    setLabelBackground,
    labelText,
    setLabelText,

    badgeBackground,
    setBadgeBackground,
    badgeText,
    setBadgeText,

    blockTitleFontSize,
    setBlockTitleFontSize,
    blockTitleFontStyle,
    setBlockTitleFontStyle,
    titleFontSize,
    setTitleFontSize,
    titleFontStyle,
    setTitleFontStyle,
    subtitleFontSize,
    setSubtitleFontSize,
    subtitleFontStyle,
    setSubtitleFontStyle,
    labelFontSize,
    setLabelFontSize,
    labelFontStyle,
    setLabelFontStyle,

    bundleNameError,
    blockTitleError,

  } = useAppContext();

  // UI-only (accordion)
  const [openSection, setOpenSection] = useState<string | null>("settings");
  const handleToggle = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };
 

  // ===== Product picker modal state (UI-only) =====
  type PickerMode = "specific" | "except" | "viewSpecific" | "viewExcept" | null;
  const [pickerMode, setPickerMode] = useState<PickerMode>(null);
  const [tempSelectedIds, setTempSelectedIds] = useState<string[]>([]);

  const openPicker = async (
    type: "specific" | "except" | "viewSpecific" | "viewExcept",
  ) => {
    let currentSelection: string[] = [];

    switch (type) {
      case "specific":
      case "viewSpecific":
        currentSelection = primarySpecificIds || [];
        break;
      case "except":
      case "viewExcept":
        currentSelection = primaryExceptIds || [];
        break;
    }

    if (type === "specific" || type === "except") {
      try {
        const selection = await shopify.resourcePicker({
          type: "product",
          multiple: true,
          action: "select",
          selectionIds: currentSelection.map((id) => ({ id })),
          filter: { hidden: false, variants: false },
        });

        if (selection) {
          const selectedIds = selection.map((p) => p.id);
          if (type === "specific") setPrimarySpecificIds(selectedIds);
          if (type === "except") setPrimaryExceptIds(selectedIds);
        }
      } catch (error) {
        console.error("Product picker error:", error);
      }
    } else {
      // View-only mode (opens modal)
      setTempSelectedIds(currentSelection);
      setPickerMode(type);
    }
  };


  const closePicker = () => {
    setPickerMode(null);
    setTempSelectedIds([]);
  };

  const confirmPicker = () => {
    if (pickerMode === "specific") {
      setPrimarySpecificIds?.(tempSelectedIds);
    } else if (pickerMode === "except") {
      setPrimaryExceptIds?.(tempSelectedIds);
    }
    closePicker();
  };

  // New Function
  const renderSelectedPreview = (ids: string[]) => {
    if (!ids || ids.length === 0) return null;
    return (
      <div className="hidden">
        <Text as="p" variant="bodySm" tone="subdued">
          Selected: {ids.length} {ids.length === 1 ? "product" : "products"}
        </Text>
      </div>
    );
  };

  const shouldShowSpecificButton = visibility === "specific";
  const shouldShowExceptButton = visibility === "except";

  return (
    <Box>
      <BlockStack gap="400">
        <Card padding="0">
          <Box padding="300">
            <div
              className="flex items-center cursor-pointer mb-1"
              onClick={() => handleToggle("settings")}
            >
              <SettingsIcon className="h-4 w-4 " />
              <Text as="h2" variant="headingMd" fontWeight="bold">
                Settings & Style
              </Text>
              <div className="ml-auto transition-transform duration-200" />
              <ChevronDownIcon className="h-4 w-4 " />
            </div>
          </Box>

          {openSection === "settings" && (
            <Box
              paddingInlineStart="300"
              paddingInlineEnd="300"
              paddingBlockEnd="300"
            >
              <BlockStack gap="300">
                {/* Name (internal) */}
                <TextField
                  label="Name (only visible for you)"
                  value={bundleName}
                  onChange={setBundleName}
                  autoComplete="off"
                  error={bundleNameError}
                />

                {/* Discount name (shown in cart/checkout) */}
                <TextField
                  label="Discount name (shown in cart/checkout)"
                  value={discountName}
                  onChange={setDiscountName}
                  autoComplete="off"
                />

                {/* Block title */}
                <TextField
                  label="Block title"
                  value={blockTitle}
                  onChange={setBlockTitle}
                  autoComplete="off"
                  error={blockTitleError}
                />

                {/* Visibility */}
                <ChoiceList
                  title="Visibility"
                  choices={[
                    { label: "All products", value: "all" },
                    { label: "All products except selected", value: "except" },
                    { label: "Specific selected products", value: "specific" },
                  ]}
                  selected={[visibility]}
                  onChange={([val]) => setVisibility(val as any)}
                />

                {/* Product selection triggers (only when needed). Kept minimal to not disturb layout */}
                {(shouldShowSpecificButton || shouldShowExceptButton) && (
                  <Box paddingBlockStart="200">
                    {shouldShowSpecificButton && (
                      <BlockStack gap="100">
                        {/* Check if any products are selected to show different button layout */}
                        {primarySpecificIds && primarySpecificIds.length > 0 ? (
                          // Show two buttons when products are selected
                          <Box>
                            <div className="flex justify-evenly gap-1">
                              <button
                                type="button"
                                onClick={() => openPicker("specific")}
                                className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 w-[100%]"
                              >
                                Select more products
                              </button>
                              <button
                                type="button"
                                onClick={() => openPicker("viewSpecific")} // Open picker in view mode
                                className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 w-[100%]"
                              >
                                View selected ({primarySpecificIds.length})
                              </button>
                            </div>
                          </Box>
                        ) : (
                          // Show single button when no products are selected
                          <button
                            type="button"
                            onClick={() => openPicker("specific")}
                            className="px-3 py-1 text-sm font-medium text-white bg-black rounded hover:bg-gray-700"
                          >
                            Select products
                          </button>
                        )}
                        {renderSelectedPreview(primarySpecificIds)}
                      </BlockStack>
                    )}

                    {shouldShowExceptButton && (
                      <BlockStack gap="100">
                        {/* Similar logic for except button if needed */}
                        {primaryExceptIds && primaryExceptIds.length > 0 ? (
                          <Box>
                            <div className="flex justify-evenly gap-1">
                              <button
                                type="button"
                                onClick={() => openPicker("except")}
                                className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 w-[100%]"
                              >
                                Select more products to exclude
                              </button>
                              <button
                                type="button"
                                onClick={() => openPicker("viewExcept")} // Open picker in view mode
                                className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 w-[100%]"
                              >
                                View selected ({primaryExceptIds.length})
                              </button>
                            </div>
                          </Box>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openPicker("except")}
                            className="px-3 py-1 text-sm font-medium text-white bg-black rounded hover:bg-gray-700"
                          >
                            Select products to exclude
                          </button>
                        )}
                        {renderSelectedPreview(primaryExceptIds)}
                      </BlockStack>
                    )}
                  </Box>
                )}

                {/* Active dates */}
                <Box>
                  <Box paddingBlockStart="400">
                    <Text as="span" variant="bodySm" fontWeight="semibold">
                      Active dates
                    </Text>
                    <InlineStack gap="200">
                      <TextField
                        label="Start date"
                        type="date"
                        value={startDate ?? ""}
                        onChange={setStartDate}
                        autoComplete="off"
                      />
                      <TextField
                        label="Start time"
                        type="time"
                        value={startTime ?? ""}
                        onChange={setStartTime}
                        autoComplete="off"
                      />
                    </InlineStack>

                    <Checkbox
                      label="Set end date"
                      checked={hasEndDate}
                      onChange={(checked) => setHasEndDate(!!checked)}
                    />
                  </Box>

                  {hasEndDate && (
                    <Box paddingBlockStart="400">
                      <InlineStack gap="200">
                        <TextField
                          label="End date"
                          type="date"
                          value={endDate ?? ""}
                          onChange={setEndDate}
                          autoComplete="off"
                        />
                        <TextField
                          label="End time"
                          type="time"
                          value={endTime ?? ""}
                          onChange={setEndTime}
                          autoComplete="off"
                        />
                      </InlineStack>
                    </Box>
                  )}
                </Box>

                {/* Style & Colors */}
                <hr className="my-4 border-gray-200" />

                <div className="mt-8">
                  <Text as="span" variant="bodySm" fontWeight="semibold">
                    Style
                  </Text>

                  <div className="flex w-full justify-between">
                    {[0, 1, 2, 3].map((idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedStyle(idx)}
                        className={`flex flex-col items-center justify-center w-24 h-20 p-2 rounded-lg transition-all duration-150 ${selectedStyle === idx
                          ? "border-2 border-[#008060] shadow-[0_0_0_2px_#e6f7ec] bg-[#f6f6f7]"
                          : "border border-[#d9d9d9] bg-white"
                          }`}
                        aria-pressed={selectedStyle === idx}
                      >
                        {/* Mock shapes */}
                        {idx === 0 && (
                          <div className="w-16 h-8 flex flex-col justify-between p-1">
                            <Box
                              borderRadius="200"
                              borderWidth="100"
                              borderColor="border"
                              background="bg-surface"
                              padding="0"
                            >
                              <div className="h-2 bg-[#008060] rounded mb-1" />
                              <div className="h-2 bg-[#008060] rounded mb-1" />
                              <div className="h-2 bg-[#008060] rounded" />
                            </Box>
                          </div>
                        )}
                        {idx === 1 && (
                          <div className="w-16 h-8 rounded-lg space-x-1 border border-[#d9d9d9] bg-[#f6f6f7] flex flex-row justify-between p-1">
                            <div className="w-6 h-6 bg-[#008060] rounded" />
                            <div className="w-6 h-6 bg-[#008060] rounded" />
                            <div className="w-6 h-6 bg-[#008060] rounded" />
                          </div>
                        )}
                        {idx === 2 && (
                          <div className="w-16 h-8 rounded-lg border border-[#d9d9d9] bg-[#f6f6f7] flex flex-col justify-between p-1">
                            <div className="h-2 bg-[#008060] rounded mb-1" />
                            <div className="h-2 bg-[#008060] rounded" />
                            <div className="h-2 bg-[#008060] rounded mt-1" />
                          </div>
                        )}
                        {idx === 3 && (
                          <div className="rounded-lg border border-[#d9d9d9] bg-[#f6f6f7] flex flex-col justify-center p-1">
                            <div className="flex items-center gap-1">
                              <span className="w-3 h-3 rounded-full border border-[#008060]" />
                              <span className="w-8 h-2 bg-[#008060] rounded" />
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="w-3 h-3 rounded-full border border-[#008060]" />
                              <span className="w-8 h-2 bg-[#008060] rounded" />
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="w-3 h-3 rounded-full border border-[#008060]" />
                              <span className="w-8 h-2 bg-[#008060] rounded" />
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="w-3 h-3 rounded-full border border-[#008060]" />
                              <span className="w-8 h-2 bg-[#008060] rounded" />
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  <InlineStack gap="400" align="start" wrap={false}>
                    <Box minWidth="250px">
                      <div className="mt-2">
                        <RangeSlider
                          label="Corner radius"
                          value={cornerRadius}
                          onChange={setCornerRadius}
                          output
                          min={0}
                          max={30}
                        />
                      </div>
                    </Box>

                    <Box minWidth="250px">
                      <div className="mt-2">
                        <RangeSlider
                          label="Spacing"
                          value={spacing}
                          onChange={setSpacing}
                          output
                          min={20}
                          max={35}
                        />
                      </div>
                    </Box>
                  </InlineStack>



                  {/* ======= Colors (kept exactly as your UI) ======= */}
                  <div className="mt-7">
                    <Text as="span" variant="bodySm" fontWeight="semibold">
                      Colors
                    </Text>

                    {/* General */}
                    <div className="mt-3">
                      <Text as="span" variant="bodySm">General</Text>
                      <div className="flex gap-6 mt-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={cardsBackground}
                              onChange={(e) => setCardsBackground(e.target.value)}
                              className="w-8 h-8 border-none bg-none"
                            />
                            <span>Cards background</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <input
                              type="color"
                              value={selectedBackground}
                              onChange={(e) => setSelectedBackground(e.target.value)}
                              className="w-8 h-8 border-none bg-none"
                            />
                            <span>Selected background</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={borderColor}
                              onChange={(e) => setBorderColor(e.target.value)}
                              className="w-8 h-8 border-none bg-none"
                            />
                            <span>Border color</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <input
                              type="color"
                              value={blockTitleColor}  // <- updated from blockTitle
                              onChange={(e) => setBlockTitleColor(e.target.value)} // <- updated
                              className="w-8 h-8 border-none bg-none"
                            />
                            <span>Block title</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bar texts */}
                    <div className="mt-5">
                      <Text as="span" variant="bodySm">Bar texts</Text>
                      <div className="flex gap-6 mt-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={titleColor}  // <- updated from title
                              onChange={(e) => setTitleColor(e.target.value)} // <- updated
                              className="w-8 h-8 border-none bg-none"
                            />
                            <span>Title</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <input
                              type="color"
                              value={priceColor}  // <- updated from price
                              onChange={(e) => setPriceColor(e.target.value)} // <- updated
                              className="w-8 h-8 border-none bg-none"
                            />
                            <span>Price</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={subtitleColor}  // <- updated from subtitle
                              onChange={(e) => setSubtitleColor(e.target.value)} // <- updated
                              className="w-8 h-8 border-none bg-none"
                            />
                            <span>Subtitle</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <input
                              type="color"
                              value={fullPriceColor}  // <- updated from fullPrice
                              onChange={(e) => setFullPriceColor(e.target.value)} // <- updated
                              className="w-8 h-8 border-none bg-none"
                            />
                            <span>Full price</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Badge texts */}
                    <div className="mt-5">
                      <Text as="span" variant="bodySm">Badge texts</Text>
                      <div className="flex gap-6 mt-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={badgeBackground}  // <- updated from title
                              onChange={(e) => setBadgeBackground(e.target.value)} // <- updated setLabelBackground
                              className="w-8 h-8 border-none bg-none"
                            />
                            <span>Background</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={labelText}  // <- updated from subtitle
                              onChange={(e) => setBadgeText(e.target.value)} // <- updated 
                              className="w-8 h-8 border-none bg-none"
                            />
                            <span>Text</span>
                          </div>
                        </div>
                      </div>
                    </div>


                    {/* Label texts */}
                    <div className="mt-5">
                      <Text as="span" variant="bodySm">Label texts</Text>
                      <div className="flex gap-6 mt-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={labelBackground}  // <- updated from title
                              onChange={(e) => setLabelBackground(e.target.value)} // <- updated
                              className="w-8 h-8 border-none bg-none"
                            />
                            <span>Background</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={badgeText}  // <- updated from subtitle
                              onChange={(e) => setLabelText(e.target.value)} // <- updated
                              className="w-8 h-8 border-none bg-none"
                            />
                            <span>Text</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Typography */}
                  <div className="mt-8">
                    <Text as="span" variant="bodySm" fontWeight="semibold">
                      Typography
                    </Text>

                    <div className="flex gap-8 mt-4">
                      {/* Block title */}
                      <div className="flex-1">
                        <Text as="span" variant="bodySm">Block title</Text>
                        <div className="flex gap-2 mt-2">
                          <Text as="span" variant="bodySm">Font size</Text>
                          <div className="ml-16">
                            <Text as="span" variant="bodySm">Font style</Text>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-1">
                          <input
                            type="number"
                            min="10"
                            max="32"
                            value={blockTitleFontSize}
                            onChange={(e) => setBlockTitleFontSize(Number(e.target.value))}
                            className="w-12 p-1 border border-[#d9d9d9] rounded"
                          />
                          <span>px</span>
                          <select
                            className="p-1 border border-[#d9d9d9] rounded ml-8"
                            value={blockTitleFontStyle}
                            onChange={(e) => setBlockTitleFontStyle(e.target.value)}
                          >
                            <option>Regular</option>
                            <option>Bold</option>
                            <option>Italic</option>
                          </select>
                        </div>
                      </div>

                      {/* Title */}
                      <div className="flex-1">
                        <Text as="span" variant="bodySm">Title</Text>
                        <div className="flex gap-2 mt-2">
                          <Text as="span" variant="bodySm">Font size</Text>
                          <div className="ml-16">
                            <Text as="span" variant="bodySm">Font style</Text>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-1">
                          <input
                            type="number"
                            min="10"
                            max="32"
                            value={titleFontSize}
                            onChange={(e) => setTitleFontSize(Number(e.target.value))}
                            className="w-12 p-1 border border-[#d9d9d9] rounded"
                          />
                          <span>px</span>
                          <select
                            className="p-1 border border-[#d9d9d9] rounded ml-8"
                            value={titleFontStyle}
                            onChange={(e) => setTitleFontStyle(e.target.value)}
                          >
                            <option>Regular</option>
                            <option>Bold</option>
                            <option>Italic</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-8 mt-4">
                      {/* Subtitle */}
                      <div className="flex-1">
                        <Text as="span" variant="bodySm">Subtitle</Text>
                        <div className="flex gap-2 mt-2">
                          <Text as="span" variant="bodySm">Font size</Text>
                          <div className="ml-16">
                            <Text as="span" variant="bodySm">Font style</Text>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-1">
                          <input
                            type="number"
                            min="10"
                            max="32"
                            value={subtitleFontSize}
                            onChange={(e) => setSubtitleFontSize(Number(e.target.value))}
                            className="w-12 p-1 border border-[#d9d9d9] rounded"
                          />
                          <span>px</span>
                          <select
                            className="p-1 border border-[#d9d9d9] rounded ml-8"
                            value={subtitleFontStyle}
                            onChange={(e) => setSubtitleFontStyle(e.target.value)}
                          >
                            <option>Regular</option>
                            <option>Bold</option>
                            <option>Italic</option>
                          </select>
                        </div>
                      </div>

                      {/* Label */}
                      <div className="flex-1">
                        <Text as="span" variant="bodySm">Label</Text>
                        <div className="flex gap-2 mt-2">
                          <Text as="span" variant="bodySm">Font size</Text>
                          <div className="ml-16">
                            <Text as="span" variant="bodySm">Font style</Text>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-1">
                          <input
                            type="number"
                            min="10"
                            max="32"
                            value={labelFontSize}
                            onChange={(e) => setLabelFontSize(Number(e.target.value))}
                            className="w-12 p-1 border border-[#d9d9d9] rounded"
                          />
                          <span>px</span>
                          <select
                            className="p-1 border border-[#d9d9d9] rounded ml-8"
                            value={labelFontStyle}
                            onChange={(e) => setLabelFontStyle(e.target.value)}
                          >
                            <option>Regular</option>
                            <option>Bold</option>
                            <option>Italic</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>


                </div>
              </BlockStack>
            </Box>
          )}
        </Card>
      </BlockStack>

      {/* ===== Product Picker Modal  ===== */}
      <Modal
        open={pickerMode !== null}
        onClose={closePicker}
        title={
          pickerMode === "except"
            ? "Select products to exclude"
            : pickerMode === "specific"
              ? "Select products"
              : pickerMode === "viewSpecific"
                ? "Selected products"
                : "Excluded products"
        }
        primaryAction={
          pickerMode === "specific" || pickerMode === "except"
            ? { content: "Select", onAction: confirmPicker }
            : undefined
        }
        secondaryActions={[{ content: "Cancel", onAction: closePicker }]}
      >
        <Modal.Section>
          <ResourceList
            resourceName={{ singular: "product", plural: "products" }}
            items={
              pickerMode === "viewSpecific"
                ? products.filter((p) => primarySpecificIds.includes(p.id))
                : pickerMode === "viewExcept"
                  ? products.filter((p) => primaryExceptIds.includes(p.id))
                  : products
            }
            selectedItems={
              pickerMode === "specific" || pickerMode === "except"
                ? tempSelectedIds
                : pickerMode === "viewSpecific"
                  ? primarySpecificIds
                  : pickerMode === "viewExcept"
                    ? primaryExceptIds
                    : []
            }
            onSelectionChange={
              pickerMode === "specific" || pickerMode === "except"
                ? (ids) => setTempSelectedIds(ids as string[])
                : undefined
            }
            selectable
            renderItem={({ id, title, imageSrc, imageAlt }: ProductListItem) => (
              <ResourceItem
                id={id}
                media={<Thumbnail source={imageSrc} alt={imageAlt} />}
                accessibilityLabel={`View ${title}`}
                onClick={() => { }}
              >
                {title}
              </ResourceItem>
            )}
          />
        </Modal.Section>
      </Modal>
    </Box>
  );
}
