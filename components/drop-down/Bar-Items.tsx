// app/components/drop-down/Bar-Items.tsx
import React, { useEffect, useState } from "react";
import { Text, InlineStack, Icon, Card, Box } from "@shopify/polaris";

import {
  ChevronDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  DeleteIcon,
  PlusIcon,
  SettingsIcon,
  DuplicateIcon,
} from "@shopify/polaris-icons";
import { useAppContext } from "../../utils/AppContext";
import type { Bar } from "../../utils/types/app-context.types";

type PriceMode = "default" | "percentage" | "fixed";

export default function BarItems() {
  const {
    packages,
    addPackage,
    removePackage,
    movePackageUp,
    movePackageDown,
    updatePackage,
    calculateDiscountedPrice,
    barTitleError,
    validateForm,
  } = useAppContext();

  // fallback basePrice (first package price or 100)
  const basePrice = packages[0]?.price ?? 100;

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [openNewestNextRender, setOpenNewestNextRender] = useState(false);

  const handleToggle = (id: string) =>
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleUpdate = (id: string, patch: Partial<Bar>) => {
    // if we are enabling "selectedByDefault", reset all others first
    if (patch.selectedByDefault) {
      packages.forEach((p, i) => {
        if (p.selectedByDefault && p.id !== id) {
          updatePackage(i, { selectedByDefault: false });
        }
      });
    }

    const index = packages.findIndex((p) => p.id === id);
    if (index >= 0) updatePackage(index, patch);
    if (patch.badgeStyle === "most-popular")
      updatePackage(index, { badgeText: "Most Popular" });
  };

  // updatePackage(index, { badgeText: "HOOOOs" });

  const handlePriceModeChange = (bar: Bar, mode: PriceMode) => {
    let discountValue = 0;

    if (mode === "percentage") {
      discountValue =
        bar.discountValue && bar.discountValue > 0
          ? clampPercent(bar.discountValue)
          : 25;
    } else if (mode === "fixed") {
      discountValue =
        bar.discountValue && bar.discountValue > 0
          ? Math.max(0, bar.discountValue)
          : 10;
    }

    const discountedPrice = calculateDiscountedPrice(
      bar.price ?? basePrice,
      mode,
      discountValue,
      bar.quantity,
    );

    handleUpdate(bar.id, { priceMode: mode, discountValue, discountedPrice });
  };

  const handleDiscountChange = (bar: Bar, value: number) => {
    let discountValue = value;
    if (bar.priceMode === "percentage") discountValue = clampPercent(value);
    else discountValue = Math.max(0, value);

    const discountedPrice = calculateDiscountedPrice(
      bar.price ?? basePrice,
      bar.priceMode ?? "default",
      discountValue,
      bar.quantity,
    );

    handleUpdate(bar.id, { discountValue, discountedPrice });
  };

  const handleAddBar = () => {
    const nextIndex = packages.length + 1;

    // original price for this pack
    const price = nextIndex * basePrice;

    // discounted price using your utility
    const discountedPrice = calculateDiscountedPrice(
      price,
      "default",
      0,
      nextIndex,
    );

    addPackage({
      id: crypto.randomUUID(),
      title: `Pack`,
      quantity: nextIndex,
      Blocktitle: "Default Block",
      price,
      priceMode: "default",
      discountValue: 0,
      badgeText: "",
      badgeStyle: "simple",
      label: "",
      discountedPrice,
    });

    // open newly added bar
    setOpenNewestNextRender(true);
  };

  useEffect(() => {
    if (!openNewestNextRender || packages.length === 0) return;
    const newest = packages[packages.length - 1];
    setOpenSections((prev) => ({ ...prev, [newest.id]: true }));
    setOpenNewestNextRender(false);
  }, [openNewestNextRender, packages]);

  const clampPercent = (v: number) => Math.max(1, Math.min(99, Math.floor(v)));

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        {packages.map((bar, index) => (
          <Card key={bar.id} padding="0">
            <Box padding="300">
              <div
                className="flex items-center cursor-pointer"
                onClick={() => handleToggle(bar.id)}
              >
                <SettingsIcon className="h-4 w-4 " />
                <Text as="h3" variant="headingSm" fontWeight="bold">
                  Bar #{index + 1} - pack - {index + 1}
                </Text>

                <div className="ml-auto">
                  <InlineStack gap="100" align="center">
                    <div className="flex gap-2">
                      <div
                        className="cursor-pointer"
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => movePackageUp(index)}
                          className="p-2 rounded-md hover:text-gray-200 flex items-center justify-center"
                        >
                          <ArrowUpIcon className="h-4 w-4 text-gray-700" />
                        </button>
                      </div>
                      <div
                        className="cursor-pointer"
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => movePackageDown(index)}
                          className="p-2 rounded-md flex items-center justify-center"
                        >
                          <ArrowDownIcon className="h-4 w-4 text-gray-700" />
                        </button>
                      </div>
                      <div
                        className="cursor-pointer"
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleAddBar()}
                          className="p-2 rounded-md flex items-center justify-center"
                        >
                          <DuplicateIcon className="h-4 w-4 text-gray-700" />
                        </button>
                      </div>
                      <div
                        className="cursor-pointer"
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => removePackage(index)}
                          className="p-2 rounded-md flex items-center justify-center"
                        >
                          <DeleteIcon className="h-4 w-4 " />
                        </button>
                      </div>
                    </div>

                    <Icon
                      source={ChevronDownIcon}
                      tone={openSections[bar.id] ? "base" : "subdued"}
                    />
                  </InlineStack>
                </div>
              </div>
            </Box>

            {openSections[bar.id] && (
              <Box padding="300">
                {/* Row 1: Quantity | Title | Subtitle */}
                <div className="grid grid-cols-3 gap-4 mb-2">
                  <div>
                    <div className="flex items-center justify-between">
                      <Text as="span" variant="bodySm">
                        Quantity
                      </Text>
                    </div>
                    <input
                      type="number"
                      min={1}
                      className="w-full p-2 rounded border border-gray-300"
                      value={bar.quantity}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        const newPrice = value * basePrice;
                        const discountedPrice = calculateDiscountedPrice(
                          newPrice,
                          bar.priceMode ?? "default",
                          bar.discountValue ?? 0,
                          value,
                        );
                        handleUpdate(bar.id, {
                          quantity: value,
                          price: newPrice,
                          discountedPrice,
                        });
                      }}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Text as="span" variant="bodySm">
                        Title
                      </Text>
                    </div>
                    {/* show error if local title empty or validateForm flagged this package id */}
                    <input
                      type="text"
                      className={`w-full p-2 rounded border ${!bar.title || !bar.title.trim() || (barTitleError && barTitleError.includes(bar.id)) ? "border-red-500" : "border-gray-300"}`}
                      value={bar.title}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleUpdate(bar.id, { title: e.target.value })
                      }
                      onBlur={() => validateForm()}
                    />
                    {!bar.title || !bar.title.trim() ? (
                      <p className="text-red-500 text-sm mt-1">
                        Title is required
                      </p>
                    ) : barTitleError && barTitleError.includes(bar.id) ? (
                      <p className="text-red-500 text-sm mt-1">
                        {barTitleError}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Text as="span" variant="bodySm">
                        Subtitle
                      </Text>
                    </div>
                    <input
                      type="text"
                      className="w-full p-2 rounded border border-gray-300"
                      value={bar.subtitle ?? ""}
                      onChange={(e) =>
                        handleUpdate(bar.id, { subtitle: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Row 2: Price | Percentage / Fixed */}
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <Text as="span" variant="bodySm">
                      Price
                    </Text>
                    <select
                      className="w-full p-2 rounded border border-gray-300"
                      value={bar.priceMode ?? "default"}
                      onChange={(e) =>
                        handlePriceModeChange(bar, e.target.value as PriceMode)
                      }
                    >
                      <option value="default">Default</option>
                      <option value="percentage">
                        Discounted % (e.g. 25% off)
                      </option>
                      <option value="fixed">Specific (e.g. PKR29)</option>
                    </select>
                  </div>

                  {(bar.priceMode === "percentage" ||
                    bar.priceMode === "fixed") && (
                    <div>
                      <Text as="span" variant="bodySm">
                        {bar.priceMode === "percentage"
                          ? "Percentage off"
                          : "Fixed amount off"}
                      </Text>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          className="w-full p-2 rounded border border-gray-300"
                          min={bar.priceMode === "percentage" ? 1 : 0}
                          max={bar.priceMode === "percentage" ? 99 : undefined}
                          step={bar.priceMode === "percentage" ? 1 : 1}
                          value={bar.discountValue ?? ""}
                          onChange={(e) =>
                            handleDiscountChange(bar, Number(e.target.value))
                          }
                        />

                        {bar.priceMode === "percentage" && (
                          <span className="text-gray-500">%</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Row 3: Badge text | Badge style */}
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <Text as="span" variant="bodySm">
                      Badge text
                    </Text>
                    <input
                      type="text"
                      className="w-full p-2 rounded border border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      value={bar.badgeText ?? "Most Popular"}
                      disabled={bar.badgeStyle === "most-popular"}
                      onChange={(e) =>
                        handleUpdate(bar.id, { badgeText: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Text as="span" variant="bodySm">
                      Badge style
                    </Text>
                    <select
                      className="w-full p-2 rounded border border-gray-300"
                      value={bar.badgeStyle ?? "most-popular"}
                      onChange={(e) =>
                        handleUpdate(bar.id, {
                          badgeStyle: e.target.value as any,
                        })
                      }
                    >
                      <option value="most-popular">Most popular</option>
                      <option value="simple">Simple</option>
                    </select>
                  </div>
                </div>

                {/* Row 4: Label | Selected by default */}
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <Text as="span" variant="bodySm">
                      Label
                    </Text>
                    <input
                      type="text"
                      className="w-full p-2 rounded border border-gray-300"
                      value={bar.label ?? ""}
                      onChange={(e) =>
                        handleUpdate(bar.id, { label: e.target.value })
                      }
                    />
                  </div>

                  <div className="flex items-center gap-2 mt-6">
                    <input
                      type="radio"
                      name="selected-default" // same name across all radios
                      className="accent-black"
                      id={`selected-default-${bar.id}`}
                      checked={!!bar.selectedByDefault}
                      onChange={() =>
                        handleUpdate(bar.id, { selectedByDefault: true })
                      }
                    />
                    <label htmlFor={`selected-default-${bar.id}`}>
                      Selected by default
                    </label>
                  </div>
                </div>
              </Box>
            )}
          </Card>
        ))}
      </div>

      <button
        onClick={handleAddBar}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-black text-white px-4 py-2 font-medium hover:bg-gray-900 transition"
      >
        <PlusIcon className="h-4 w-4 fill-white" stroke="none" />
        Add bar
      </button>
    </div>
  );
}
