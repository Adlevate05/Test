import {
  Text,
  Card,
  BlockStack,
  Box,
  ChoiceList,
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



export default function VolumeDiscount({


  products = [],
}: {
  products?: ProductListItem[];
}) {
  const {
    //eligibilty
    eligibilty,
    setEligibilty,
    // selected product ids in context (for submit)
    bundleSpecificIds = [],
    setBundleSpecificIds,
    bundleExceptIds = [],
    setBundleExceptIds,

  } = useAppContext();

  // UI-only (accordion)
  const [openSection, setOpenSection] = useState<string | null>("settings");
  const handleToggle = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  // ===== Product picker modal state (UI-only) =====
  type PickerMode = "bundle_specific" | "bundle_except" | "viewSelected" | "viewExcept" | null;
  const [pickerMode, setPickerMode] = useState<PickerMode>(null);
  const [tempSelectedIds, setTempSelectedIds] = useState<string[]>([]);

  const openPicker = async (
    type: "bundle_specific" | "bundle_except" | "viewSelected" | "viewExcept"
  ) => {
    let currentSelection: string[] = [];

    switch (type) {
      case "bundle_specific":
      case "viewSelected":
        currentSelection = bundleSpecificIds || [];
        break;
      case "bundle_except":
      case "viewExcept":
        currentSelection = bundleExceptIds || [];
        break;
    }

    if (type === "bundle_specific" || type === "bundle_except") {
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
          if (type === "bundle_specific") setBundleSpecificIds(selectedIds);
          if (type === "bundle_except") setBundleExceptIds(selectedIds);
        }
      } catch (error) {
        console.error("Product picker error:", error);
      }
    } else {
      // Optional: use Polaris modal to *view* selected items if needed
      setTempSelectedIds(currentSelection);
      setPickerMode(type);
    }
  };


  const closePicker = () => {
    setPickerMode(null);
    setTempSelectedIds([]);
  };

  const confirmPicker = () => {
    if (pickerMode === "bundle_specific") {
      setBundleSpecificIds?.(tempSelectedIds);
    } else if (pickerMode === "bundle_except") {
      setBundleExceptIds?.(tempSelectedIds);
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

  const shouldShowSelectedButton = eligibilty === "bundle_specific";
  const shouldShowExceptButton = eligibilty === "bundle_except";

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
                Volume discount bundle with other products
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
                {/* Eligibilty */}
                <ChoiceList
                  title="Eligibilty"
                  choices={[
                    { label: "Selected products", value: "bundle_specific" },
                    { label: "All products except selected", value: "bundle_except" },
                  ]}
                  selected={[eligibilty]}
                  onChange={([val]) => setEligibilty(val as any)}
                />

                {/* Product selection triggers (only when needed). Kept minimal to not disturb layout */}
                {(shouldShowSelectedButton || shouldShowExceptButton) && (
                  <Box paddingBlockStart="200">
                    {shouldShowSelectedButton && (
                      <BlockStack gap="100">
                        {/* Check if any products are selected to show different button layout */}
                        {bundleSpecificIds && bundleSpecificIds.length > 0 ? (
                          // Show two buttons when products are selected
                          <Box>
                            <div className="flex justify-evenly gap-1">
                              <button
                                type="button"
                                onClick={() => openPicker("bundle_specific")}
                                className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 w-[100%]"
                              >
                                Select more products
                              </button>
                              <button
                                type="button"
                                onClick={() => openPicker("viewSelected")} // Open picker in view mode
                                className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 w-[100%]"
                              >
                                View selected ({bundleSpecificIds.length})
                              </button>
                            </div>
                          </Box>
                        ) : (
                          // Show single button when no products are selected
                          <button
                            type="button"
                            onClick={() => openPicker("bundle_specific")}
                            className="px-3 py-1 text-sm font-medium text-white bg-black rounded hover:bg-gray-700"
                          >
                            Select products
                          </button>
                        )}
                        {renderSelectedPreview(bundleSpecificIds)}
                      </BlockStack>
                    )}

                    {shouldShowExceptButton && (
                      <BlockStack gap="100">
                        {/* Similar logic for except button if needed */}
                        {bundleExceptIds && bundleExceptIds.length > 0 ? (
                          <Box>
                            <div className="flex justify-evenly gap-1">
                              <button
                                type="button"
                                onClick={() => openPicker("bundle_except")}
                                className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 w-[100%]"
                              >
                                Select more products to exclude
                              </button>
                              <button
                                type="button"
                                onClick={() => openPicker("viewExcept")} // Open picker in view mode
                                className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 w-[100%]"
                              >
                                View selected ({bundleExceptIds.length})
                              </button>
                            </div>
                          </Box>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openPicker("bundle_except")}
                            className="px-3 py-1 text-sm font-medium text-white bg-black rounded hover:bg-gray-700"
                          >
                            Select products to exclude
                          </button>
                        )}
                        {renderSelectedPreview(bundleExceptIds)}
                      </BlockStack>
                    )}
                  </Box>
                )}
              </BlockStack>
            </Box>
          )}
        </Card>
      </BlockStack>

      {/* ===== Product Picker Modal (Polaris portal; design-matched) ===== */}
      
      <Modal
        open={pickerMode !== null}
        onClose={closePicker}
        title={
          pickerMode === "bundle_except"
            ? "Select products to exclude"
            : pickerMode === "bundle_specific"
              ? "Select products"
              : pickerMode === "viewSelected"
                ? "Selected products"
                : "Excluded products"
        }
        primaryAction={
          pickerMode === "bundle_specific" || pickerMode === "bundle_except"
            ? { content: "Select", onAction: confirmPicker }
            : undefined
        }
        secondaryActions={[{ content: "Cancel", onAction: closePicker }]}
      >
        <Modal.Section>
          <ResourceList
            resourceName={{ singular: "product", plural: "products" }}
            items={
              pickerMode === "viewSelected"
                ? products.filter((p) => bundleSpecificIds.includes(p.id))
                : pickerMode === "viewExcept"
                  ? products.filter((p) => bundleExceptIds.includes(p.id))
                  : products
            }
            selectedItems={
              pickerMode === "bundle_specific" || pickerMode === "bundle_except"
                ? tempSelectedIds
                : pickerMode === "viewSelected"
                  ? bundleSpecificIds
                  : pickerMode === "viewExcept"
                    ? bundleExceptIds
                    : []
            }
            onSelectionChange={
              pickerMode === "bundle_specific" || pickerMode === "bundle_except"
                ? (ids) => setTempSelectedIds(ids as string[])
                : undefined // disable selection updates in view mode
            }
            selectable
            renderItem={({ id, title, imageSrc, imageAlt }: ProductListItem) => (
              <ResourceItem
                id={id}
                media={<Thumbnail source={imageSrc} alt={imageAlt} />}
                accessibilityLabel={`View ${title}`}
                onClick={() => { }} // do nothing, just visual
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
