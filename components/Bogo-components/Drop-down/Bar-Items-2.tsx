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
} from "@shopify/polaris-icons";
import { useAppContext } from "../../../utils/AppContext";
import type { BogoBar } from "../../../utils/types/app-context.types";

type PriceMode = "default" | "percentage" | "fixed";

export default function BarItems2() {
  const {
    bogoPackages,
    selectedStyle,
    bogoAddPackage,
    bogoRemovePackage,
    bogoMovePackageUp,
    bogoMovePackageDown,
    bogoUpdatePackage,
    barTitleError,
    validateForm,
  } = useAppContext();

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [openNewestNextRender, setOpenNewestNextRender] = useState(false);

  const handleToggle = (id: string) =>
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleUpdate = (id: string, patch: Partial<BogoBar>) => {

    if (patch.selectedByDefault) {
      bogoPackages.forEach((p, i) => {
        if (p.selectedByDefault && p.id !== id) {
          bogoUpdatePackage(i, { selectedByDefault: false });
        }
      });
    }

    const index = bogoPackages.findIndex((p) => p.id === id);
    if (index >= 0) bogoUpdatePackage(index, patch);
    if (patch.badgeStyle === "most-popular") bogoUpdatePackage(index, { badgeText: "Most Popular" });
  };

  const handleAddBar = () => {
    const nextIndex = bogoPackages.length + 1;
    bogoAddPackage({
      title: `Pack`,
      buyQuantity: nextIndex,
      freeQuantity: nextIndex + 1,
    });
    setOpenNewestNextRender(true);
  };

  useEffect(() => {
    if (!openNewestNextRender || bogoPackages.length === 0) return;
    const newest = bogoPackages[bogoPackages.length - 1];
    setOpenSections((prev) => ({ ...prev, [newest.id]: true }));
    setOpenNewestNextRender(false);
  }, [openNewestNextRender, bogoPackages]);

  const clampPercent = (v: number) => Math.max(1, Math.min(99, Math.floor(v)));
  // const toNumber = (s: string) => {
  //   const n = Number(s);
  //   return Number.isFinite(n) ? n : 0;
  // };

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        {bogoPackages.map((bar, index) => {
          console.log()
          return (
            <Card key={bar.id} padding="0">
              <Box padding="300">
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => handleToggle(bar.id)}
                >
                  <SettingsIcon className="h-4 w-4 " />
                  <Text as="h3" variant="headingSm" fontWeight="bold">
                    Bar #{index + 1} - {bar.title} - {bar.buyQuantity}
                  </Text>

                  <div className="ml-auto">
                    <InlineStack gap="100" align="center">
                      <div className="flex gap-2">
                        {/* stop header toggle on control clicks */}
                        <div
                          className="cursor-pointer"
                          onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => bogoMovePackageUp(index)}
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
                            onClick={() => bogoMovePackageDown(index)}
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
                            onClick={() => bogoRemovePackage(index)}
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
                <Box padding="300" paddingBlockStart="0">
                  {/* Top Row: Buy/Get/Free Quantity Layout */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex items-end gap-2">
                      <div>
                        <div className="text-center mb-1 pl-[17px]">
                          <Text as="span" variant="bodySm" tone="subdued">
                            Quantity
                          </Text>
                        </div>
                        <div className="flex items-center gap-2">
                          <Text as="span" variant="bodyMd" fontWeight="medium">
                            Buy
                          </Text>
                          <input
                            type="number"
                            min={1}
                            className="w-16 p-2 rounded border border-gray-300 text-center"
                            value={bar.buyQuantity}
                            onChange={(e) => {
                              const value = Number(e.target.value);
                              handleUpdate(bar.id, { buyQuantity: value });
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="text-center mb-1 pl-[12px]">
                          <Text as="span" variant="bodySm" tone="subdued">
                            Quantity
                          </Text>
                        </div>
                        <div className="flex items-center gap-2">
                          <Text as="span" variant="bodyMd" tone="subdued">
                            , get
                          </Text>
                          <input
                            type="number"
                            min={1}
                            className="w-16 p-2 rounded border border-gray-300 text-center"
                            value={bar.freeQuantity || 1}
                            onChange={(e) => {
                              const value = Number(e.target.value);
                              handleUpdate(bar.id, { freeQuantity: value });
                            }}
                          />
                          <Text as="span" variant="bodyMd" tone="subdued">
                            free!
                          </Text>
                        </div>
                      </div>
                    </div>

                    <div className="ml-35 ">
                      <p>
                        Price
                      </p>
                      <select
                      disabled
                        className="w-full p-2 rounded border border-gray-300 text-gray-500 underline cursor-not-allowed"
                        value={bar.priceMode ?? "default"}
                        onChange={(e) => {
                          const mode = e.target.value as PriceMode;
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

                          handleUpdate(bar.id, {
                            priceMode: mode,
                            discountValue,
                          });
                        }}
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
                              max={
                                bar.priceMode === "percentage" ? 99 : undefined
                              }
                              step={bar.priceMode === "percentage" ? 1 : 0.01}
                              value={bar.discountValue ?? ""}
                              onChange={(e) => {
                                let value = Number(e.target.value) || 0;
                                if (bar.priceMode === "percentage")
                                  value = clampPercent(value);
                                else value = Math.max(0, value);
                                handleUpdate(bar.id, { discountValue: value });
                              }}
                            />
                            {bar.priceMode === "percentage" && (
                              <span className="text-gray-500">%</span>
                            )}
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Title and Subtitle Row */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <Text as="span" variant="bodySm" fontWeight="medium">
                          Title
                        </Text>
                        <button className="text-gray-400 hover:text-gray-600">
                          <Icon source={SettingsIcon} />
                        </button>
                      </div>
                      <input
                        type="text"
                        className={`w-full p-2 rounded border ${(!bar.title || !bar.title.trim()) || (barTitleError && barTitleError.includes(bar.id)) ? "border-red-500" : "border-gray-300"}`}
                        value={bar.title}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleUpdate(bar.id, { title: e.target.value })
                        }
                        onBlur={() => validateForm()}
                      />
                      {(!bar.title || !bar.title.trim()) ? (
                        <p className="text-red-500 text-sm mt-1">Title is required</p>
                      ) : barTitleError && barTitleError.includes(bar.id) ? (
                        <p className="text-red-500 text-sm mt-1">{barTitleError}</p>
                      ) : null}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <Text as="span" variant="bodySm" fontWeight="medium">
                          Subtitle
                        </Text>
                        <button className="text-gray-400 hover:text-gray-600">
                          <Icon source={SettingsIcon} />
                        </button>
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

                  {/* Row 3: Badge text | Badge style */}
                  {selectedStyle == 0 && (<div className="grid grid-cols-2 gap-4 mb-2">
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
                        onChange={(e) => {
                          console.log(e.target.value)
                          handleUpdate(bar.id, {
                            badgeStyle: e.target.value as any
                          })
                        }
                        }
                      >
                        <option value="most-popular">Most popular</option>
                        <option value="simple">Simple</option>
                      </select>
                    </div>
                  </div>)}

                  {/* Label Row */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <Text as="span" variant="bodySm" fontWeight="medium">
                        Label
                      </Text>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Icon source={SettingsIcon} />
                      </button>
                    </div>
                    <input
                      type="text"
                      className="w-full p-2 rounded border border-gray-300"
                      value={bar.label ?? ""}
                      placeholder="SAVE {{saved_percentage}}"
                      onChange={(e) =>
                        handleUpdate(bar.id, { label: e.target.value })
                      }
                    />
                  </div>

                  {/* Selected by Default Checkbox */}
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      className="accent-black"
                      id={`selected-default-${bar.id}`}
                      checked={!!bar.selectedByDefault}
                      onChange={(e) =>
                        handleUpdate(bar.id, {
                          selectedByDefault: e.currentTarget.checked,
                        })
                      }
                    />
                    <label htmlFor={`selected-default-${bar.id}`}>
                      <Text as="span" variant="bodySm">
                        Selected by default
                      </Text>
                    </label>
                  </div>
                </Box>
              )}
            </Card>
          );
        })}
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
