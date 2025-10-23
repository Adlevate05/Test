import {
  Button,
  Select,
  Text,
  Icon,
  Box,
  InlineStack,
  BlockStack,
} from "@shopify/polaris";
import { ProductIcon } from "@shopify/polaris-icons";
import { useCallback, useEffect, useState } from "react";
import { useAppContext } from "app/utils/AppContext";
import black from "../components/Assets/Images/black-tshirt.png";
import blue from "../components/Assets/Images/blue-tshirt.webp";
import red from "../components/Assets/Images/red-tshirt.webp";
import { Link, useNavigate, useNavigation } from "@remix-run/react";
import { useIsSubscribed } from "app/hooks/useIsSubscribed";
import { SubscriptionModal } from "./common/subscription-modal";

type SelectedProduct = {
  id: string;
  title: string;
  image: string;
};

// Explicitly type the selection as product[]
const openPicker = async (
  slotIndex: number,
  setSelectedProducts: React.Dispatch<
    React.SetStateAction<Record<number, SelectedProduct | null>>
  >,
) => {
  try {
    const selection = (await shopify.resourcePicker({
      type: "product",
      multiple: false,
      action: "select" as const,
      filter: {
        hidden: false,
        variants: false,
      },
    })) as Array<{
      id: string;
      title: string;
      images?: { originalSrc: string }[];
    }> | null;

    if (selection && selection.length > 0) {
      const product = selection[0]; // only one because multiple: false
      const selected: SelectedProduct = {
        id: product.id,
        title: product.title,
        image: product.images?.[0]?.originalSrc || "",
      };

      setSelectedProducts((prev) => ({
        ...prev,
        [slotIndex]: selected,
      }));
    }
  } catch (error) {
    console.error("Error opening product picker:", error);
  }
};

const renderSelectedPreview = (
  product: SelectedProduct | null,
  onClear: () => void,
) => {
  if (!product) return null;

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between gap-3 p-2 border rounded-md bg-white">
        <div className="flex items-center gap-3">
          {product.image && (
            <img
              src={product.image}
              alt={product.title}
              className="w-10 h-10 object-cover rounded"
            />
          )}
          <Text as="span" variant="bodyMd" fontWeight="medium">
            {product.title}
          </Text>
        </div>
        {/* Cross button */}
        <button
          type="button"
          onClick={onClear}
          className="ml-2 text-gray-500 hover:text-red-600 font-bold"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

// Card 1 - Vertical List Style
export function DifferentProductCardOne() {
  const {
    spacing,
    blockTitle,
    cornerRadius,
    multiPackages,
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
    calculateDiscountedPrice_3,
    renderTemplate,
    selectedCard,
    setSelectedCard,
  } = useAppContext();

  useEffect(() => {
    if (multiPackages.length > 0) {
      const lastId = `pack-${multiPackages[multiPackages.length - 1].id}`;
      setSelectedCard(lastId);
    }
  }, [multiPackages, setSelectedCard]);

  const [selectedProducts, setSelectedProducts] = useState<
    Record<number, SelectedProduct | null>
  >({});

  const handleCardSelect = (cardId: string) => {
    setSelectedCard((prev) => (prev === cardId ? null : cardId));
  };

  return (
    <div style={{ padding: "16px" }}>
      {/* Header */}
      {blockTitle && (
        <InlineStack align="center" gap="200">
          <div
            style={{
              flexGrow: 1,
              height: "2px",
              backgroundColor: blockTitleColor,
            }}
          />
          <p
            style={{
              color: blockTitleColor,
              fontSize: `${blockTitleFontSize}px`,
              fontWeight: blockTitleFontStyle === "Bold" ? "700" : "400",
              fontStyle: blockTitleFontStyle === "Italic" ? "italic" : "normal",
            }}
          >
            {blockTitle}
          </p>
          <div
            style={{
              flexGrow: 1,
              height: "2px",
              backgroundColor: blockTitleColor,
            }}
          />
        </InlineStack>
      )}

      {/* Dynamic Packages */}
      <BlockStack gap="200">
        {multiPackages.map((pkg, index) => {
          const unitPrice = 10;
          const quantity = pkg.quantity;

          const totalBefore = unitPrice * quantity;
          const totalAfter = Number(
            calculateDiscountedPrice_3(
              unitPrice,
              pkg.priceMode ?? "default",
              pkg.discountValue ?? 0,
              quantity,
            ).toFixed(2),
          );

          const saved_total = totalBefore - totalAfter;
          const saved_percentage =
            saved_total > 0 ? (saved_total / totalBefore) * 100 : 0;

          const magicCodeArray = {
            totalBefore,
            totalAfter,
            saved_total,
            saved_percentage,
          };
          const label = pkg.label || "";
          const subtitle = pkg.subtitle || "";
          const cardId = `pack-${pkg.id}`;
          const isSelected = selectedCard === cardId;

          // Context-based theming
          const bgColor = isSelected
            ? (selectedBackground ?? "#fff")
            : (cardsBackground ?? "#ededed");
          const borderCol = isSelected
            ? (borderColor ?? "#000")
            : (borderColor ?? "#ddd");
          const badgeBg = badgeBackground ?? "#000";
          const labelBg = labelBackground ?? "#000";

          return (
            <div key={pkg.id} style={{ position: "relative" }}>
              {/* Badge */}
              {/* {pkg.badgeText && (
                <div className="absolute -top-2 right-4 z-10">
                  <span
                    className="relative inline-block px-3 py-1 rounded-full text-[12px] font-semibold leading-none"
                    style={{ background: badgeBg, color: badgeText ?? "#fff" }}
                  >
                    {pkg.badgeText}
                  </span>
                  <span
                    aria-hidden="true"
                    className="absolute right-2 -bottom-1 block h-2.5 w-2.5 rotate-45 -skew-x-12 rounded-bl-[2px]"
                    style={{ background: labelBg }}
                  />
                </div>
              )} */}

              <div
                style={{
                  backgroundColor: bgColor,
                  border: `1px solid ${borderCol}`,
                  borderRadius: cornerRadius,
                  padding: spacing,
                  cursor: "pointer",
                  marginBottom: index < multiPackages.length - 1 ? "8px" : "0",
                }}
                onClick={() => handleCardSelect(cardId)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        border: `2px solid ${borderCol}`,
                        backgroundColor: isSelected ? borderCol : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {isSelected && (
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            backgroundColor: "#fff",
                            borderRadius: "50%",
                          }}
                        />
                      )}
                    </div>

                    <div>
                      <p
                        style={{
                          color: titleColor,
                          fontSize: `${titleFontSize}px`,
                          fontWeight: titleFontStyle === "Bold" ? "700" : "400",
                          fontStyle:
                            titleFontStyle === "Italic" ? "italic" : "normal",
                        }}
                      >
                        {renderTemplate(pkg.title, magicCodeArray)}
                      </p>
                      <p
                        style={{
                          color: subtitleColor,
                          fontSize: `${subtitleFontSize}px`,
                          fontWeight:
                            subtitleFontStyle === "Bold" ? "700" : "400",
                          fontStyle:
                            subtitleFontStyle === "Italic"
                              ? "italic"
                              : "normal",
                        }}
                      >
                        {renderTemplate(subtitle, magicCodeArray)}
                      </p>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <p style={{ color: priceColor }}>
                      {pkg.symbol}
                      {totalAfter}
                    </p>
                    <p style={{ color: fullPriceColor ?? "#999" }}>
                      <s>
                        {pkg.symbol}
                        {totalBefore}
                      </s>
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <div
                    style={{
                      marginTop: "12px",
                      paddingTop: "12px",
                      borderTop: `1px solid ${cardsBackground}`,
                    }}
                  >
                    {Array.from({ length: pkg.quantity - 1 }).map(
                      (_, slotIndex) => {
                        const product = selectedProducts[slotIndex] || null;

                        return (
                          <div key={slotIndex} style={{ marginBottom: "8px" }}>
                            {!product ? (
                              <button
                                type="button"
                                onClick={() =>
                                  openPicker(slotIndex, setSelectedProducts)
                                }
                                className="px-3 py-1 text-sm font-medium text-white rounded"
                                style={{ background: borderCol, color: "#fff" }}
                              >
                                Choose
                              </button>
                            ) : (
                              renderSelectedPreview(product, () =>
                                setSelectedProducts((prev) => ({
                                  ...prev,
                                  [slotIndex]: null,
                                })),
                              )
                            )}
                          </div>
                        );
                      },
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </BlockStack>
    </div>
  );
}

// Card 2 - Three Column Grid Style
export function DifferentProductCardTwo() {
  const {
    spacing,
    blockTitle,
    cornerRadius,
    multiPackages,
    cardsBackground,
    selectedBackground,
    borderColor,
    blockTitleColor,
    titleColor,
    subtitleColor,
    priceColor,
    fullPriceColor,
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
    calculateDiscountedPrice_3,
    renderTemplate,
    selectedCard,
    setSelectedCard,
  } = useAppContext();

  const [selectedProducts, setSelectedProducts] = useState<
    Record<number, SelectedProduct | null>
  >({});

  useEffect(() => {
    if (multiPackages.length > 0) {
      const lastId = `pack-${multiPackages[multiPackages.length - 1].id}`;
      setSelectedCard(lastId);
    }
  }, [multiPackages, setSelectedCard]);

  const handleCardSelect = (cardId: string) => {
    setSelectedCard((prev) => (prev === cardId ? null : cardId));
  };

  return (
    <div style={{ padding: "16px" }}>
      {/* Header */}
      {blockTitle && (
        <InlineStack align="center" gap="200">
          <div
            style={{
              flexGrow: 1,
              height: "2px",
              backgroundColor: blockTitleColor,
            }}
          />
          <p
            style={{
              color: blockTitleColor,
              fontSize: `${blockTitleFontSize}px`,
              fontWeight: blockTitleFontStyle === "Bold" ? "700" : "400",
              fontStyle: blockTitleFontStyle === "Italic" ? "italic" : "normal",
            }}
          >
            {blockTitle}
          </p>
          <div
            style={{
              flexGrow: 1,
              height: "2px",
              backgroundColor: blockTitleColor,
            }}
          />
        </InlineStack>
      )}

      {/* Three Column Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "8px",
          marginTop: "16px",
        }}
      >
        {multiPackages.map((pkg) => {
          const unitPrice = 10;
          const quantity = pkg.quantity;

          const totalBefore = unitPrice * quantity;
          const totalAfter = Number(
            calculateDiscountedPrice_3(
              unitPrice,
              pkg.priceMode ?? "default",
              pkg.discountValue ?? 0,
              quantity,
            ).toFixed(2),
          );

          const saved_total = totalBefore - totalAfter;
          const saved_percentage =
            saved_total > 0 ? (saved_total / totalBefore) * 100 : 0;

          const magicCodeArray = {
            totalBefore,
            totalAfter,
            saved_total,
            saved_percentage,
          };
          const label = pkg.label || "";
          const subtitle = pkg.subtitle || "";

          const cardId = `pack-${pkg.id}`;
          const isSelected = selectedCard === cardId;

          // Context-based theming
          const bgColor = isSelected
            ? (selectedBackground ?? "#fff")
            : (cardsBackground ?? "#ededed");
          const borderCol = borderColor ?? "#ddd";
          const badgeBg = badgeBackground ?? "#000";

          return (
            <button
              key={pkg.id}
              type="button"
              className="relative w-full text-left"
              style={{
                backgroundColor: bgColor,
                border: isSelected
                  ? `2px solid ${borderCol}`
                  : `1px solid ${borderCol}`,
                borderRadius: cornerRadius || 14,
                padding: spacing,
                cursor: "pointer",
                textAlign: "center",
              }}
              onClick={() => handleCardSelect(cardId)}
            >
              {/* Top-fixed label */}
              {/* {pkg.label && (
                <span
                  className="absolute left-1/2 -translate-x-1/2 top-0 w-[100%] inline-block px-3 py-1 rounded-full text-[11px] font-medium leading-none"
                  style={{
                    color: badgeText ?? "#000",
                    background: badgeBg,
                    fontSize: `${labelFontSize}px`,
                    fontWeight: labelFontStyle === "Bold" ? "700" : "400",
                    fontStyle:
                      labelFontStyle === "Italic" ? "italic" : "normal",
                  }}
                >
                  {renderTemplate(label, magicCodeArray)}
                </span>
              )} */}

              {/* Radio Circle */}
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  border: `2px solid ${borderCol}`,
                  backgroundColor: isSelected ? borderCol : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 8px auto",
                }}
              >
                {isSelected && (
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      backgroundColor: "#fff",
                      borderRadius: "50%",
                    }}
                  />
                )}
              </div>

              {/* Title */}
              <p
                style={{
                  color: titleColor,
                  fontSize: `${titleFontSize}px`,
                  fontWeight: titleFontStyle === "Bold" ? "700" : "400",
                  fontStyle: titleFontStyle === "Italic" ? "italic" : "normal",
                  marginBottom: "4px",
                  paddingTop: "10px",
                }}
              >
                {renderTemplate(pkg.title, magicCodeArray)}
              </p>

              {/* Subtitle */}
              {pkg.subtitle && (
                <p
                  style={{
                    color: subtitleColor,
                    fontSize: `${subtitleFontSize}px`,
                    fontWeight: subtitleFontStyle === "Bold" ? "700" : "400",
                    fontStyle:
                      subtitleFontStyle === "Italic" ? "italic" : "normal",
                    marginBottom: "6px",
                  }}
                >
                  {renderTemplate(subtitle, magicCodeArray)}
                </p>
              )}

              {/* Prices */}
              <p style={{ color: priceColor, fontWeight: "bold" }}>
                {pkg.symbol}
                {totalAfter}
              </p>
              <p style={{ color: fullPriceColor ?? "#999" }}>
                <s>
                  {pkg.symbol}
                  {totalBefore}
                </s>
              </p>

              {/* Extra product slots if selected */}
              {isSelected && (
                <div
                  style={{
                    marginTop: "12px",
                    paddingTop: "12px",
                    borderTop: `1px solid ${cardsBackground}`,
                  }}
                >
                  {Array.from({ length: pkg.quantity - 1 }).map(
                    (_, slotIndex) => {
                      const product = selectedProducts[slotIndex] || null;

                      return (
                        <div key={slotIndex} style={{ marginBottom: "8px" }}>
                          {!product ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openPicker(slotIndex, setSelectedProducts);
                              }}
                              className="px-3 py-1 text-sm font-medium text-white rounded"
                              style={{
                                background: borderCol,
                                color: "#fff",
                              }}
                            >
                              Choose
                            </button>
                          ) : (
                            renderSelectedPreview(product, () =>
                              setSelectedProducts((prev) => ({
                                ...prev,
                                [slotIndex]: null,
                              })),
                            )
                          )}
                        </div>
                      );
                    },
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Card 3 - Two Top, One Bottom Layout
export function DifferentProductCardThree() {
  const {
    spacing,
    blockTitle,
    cornerRadius,
    multiPackages,
    cardsBackground,
    selectedBackground,
    borderColor,
    blockTitleColor,
    titleColor,
    subtitleColor,
    priceColor,
    fullPriceColor,
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
    calculateDiscountedPrice_3,
    renderTemplate,
    selectedCard,
    setSelectedCard,
  } = useAppContext();

  const [selectedProducts, setSelectedProducts] = useState<
    Record<number, SelectedProduct | null>
  >({});

  useEffect(() => {
    if (multiPackages.length > 0) {
      const lastId = `pack-${multiPackages[multiPackages.length - 1].id}`;
      setSelectedCard(lastId);
    }
  }, [multiPackages, setSelectedCard]);

  const handleCardSelect = (cardId: string) => {
    setSelectedCard((prev) => (prev === cardId ? null : cardId));
  };

  return (
    <div style={{ padding: "16px" }}>
      {/* Header */}
      {blockTitle && (
        <InlineStack align="center" gap="200">
          <div
            style={{
              flexGrow: 1,
              height: "2px",
              backgroundColor: blockTitleColor,
            }}
          />
          <p
            style={{
              color: blockTitleColor,
              fontSize: `${blockTitleFontSize}px`,
              fontWeight: blockTitleFontStyle === "Bold" ? "700" : "400",
              fontStyle: blockTitleFontStyle === "Italic" ? "italic" : "normal",
              paddingTop: "10px",
            }}
          >
            {blockTitle}
          </p>
          <div
            style={{
              flexGrow: 1,
              height: "2px",
              backgroundColor: blockTitleColor,
            }}
          />
        </InlineStack>
      )}

      {/* Two-Column Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px",
          marginTop: "16px",
          marginBottom: "8px",
        }}
      >
        {multiPackages.map((pkg) => {
          const unitPrice = 10;
          const quantity = pkg.quantity;
          const totalBefore = unitPrice * quantity;
          const totalAfter = Number(
            calculateDiscountedPrice_3(
              unitPrice,
              pkg.priceMode ?? "default",
              pkg.discountValue ?? 0,
              quantity,
            ).toFixed(2),
          );

          const saved_total = totalBefore - totalAfter;
          const saved_percentage =
            saved_total > 0 ? (saved_total / totalBefore) * 100 : 0;

          const magicCodeArray = {
            totalBefore,
            totalAfter,
            saved_total,
            saved_percentage,
          };
          const label = pkg.label || "";
          const subtitle = pkg.subtitle || "";
          const cardId = `pack-${pkg.id}`;
          const isSelected = selectedCard === cardId;

          // Context-based theming
          const bgColor = isSelected
            ? (selectedBackground ?? "#fff")
            : (cardsBackground ?? "#ededed");
          const borderCol = borderColor ?? "#ddd";
          const badgeBg = badgeBackground ?? "#000";

          return (
            <div
              key={pkg.id}
              className="relative"
              style={{
                backgroundColor: bgColor,
                border: isSelected
                  ? `2px solid ${borderCol}`
                  : `1px solid ${borderCol}`,
                borderRadius: cornerRadius || 12,
                padding: spacing,
                cursor: "pointer",
                textAlign: "center",
              }}
              onClick={() => handleCardSelect(cardId)}
            >
              {/* Badge / Label */}
              {/* {pkg.label && (
                <span
                  className="absolute left-1/2 -translate-x-1/2 top-0 w-[100%] inline-block px-3 py-1 rounded-full text-[11px] font-medium leading-none"
                  style={{
                    color: badgeText ?? "#000",
                    background: badgeBg,
                    fontSize: `${labelFontSize}px`,
                    fontWeight: labelFontStyle === "Bold" ? "700" : "400",
                    fontStyle:
                      labelFontStyle === "Italic" ? "italic" : "normal",
                  }}
                >
                  {renderTemplate(label, magicCodeArray)}
                </span>
              )} */}

              {/* Radio Circle */}
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  border: `2px solid ${borderCol}`,
                  backgroundColor: isSelected ? borderCol : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 8px auto",
                }}
              >
                {isSelected && (
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      backgroundColor: "#fff",
                      borderRadius: "50%",
                    }}
                  />
                )}
              </div>

              {/* Title */}
              <p
                style={{
                  color: titleColor,
                  fontSize: `${titleFontSize}px`,
                  fontWeight: titleFontStyle === "Bold" ? "700" : "400",
                  fontStyle: titleFontStyle === "Italic" ? "italic" : "normal",
                }}
              >
                {renderTemplate(pkg.title, magicCodeArray)}
              </p>

              {/* Subtitle */}
              {pkg.subtitle && (
                <p
                  style={{
                    color: subtitleColor,
                    fontSize: `${subtitleFontSize}px`,
                    fontWeight: subtitleFontStyle === "Bold" ? "700" : "400",
                    fontStyle:
                      subtitleFontStyle === "Italic" ? "italic" : "normal",
                  }}
                >
                  {renderTemplate(subtitle, magicCodeArray)}
                </p>
              )}

              {/* Price */}
              <p style={{ color: priceColor, fontWeight: "700" }}>
                {pkg.symbol}
                {totalAfter}
              </p>
              <p style={{ color: fullPriceColor ?? "#999" }}>
                <s>
                  {pkg.symbol}
                  {totalBefore}
                </s>
              </p>

              {/* Product Chooser */}
              {isSelected && (
                <div
                  style={{
                    marginTop: "12px",
                    paddingTop: "12px",
                    borderTop: `1px solid ${cardsBackground}`,
                  }}
                >
                  {Array.from({ length: pkg.quantity - 1 }).map(
                    (_, slotIndex) => {
                      const product = selectedProducts[slotIndex] || null;

                      return (
                        <div key={slotIndex} style={{ marginBottom: "8px" }}>
                          {!product ? (
                            <button
                              type="button"
                              onClick={() =>
                                openPicker(slotIndex, setSelectedProducts)
                              }
                              className="px-3 py-1 text-sm font-medium rounded"
                              style={{
                                background: borderCol,
                                color: "#fff",
                              }}
                            >
                              Choose
                            </button>
                          ) : (
                            renderSelectedPreview(product, () =>
                              setSelectedProducts((prev) => ({
                                ...prev,
                                [slotIndex]: null,
                              })),
                            )
                          )}
                        </div>
                      );
                    },
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Card 4 - Ver 1 layout but with transparent structure
export function DifferentProductCardFour() {
  const {
    spacing,
    blockTitle,
    cornerRadius,
    multiPackages,
    cardsBackground,
    selectedBackground,
    borderColor,
    blockTitleColor,
    titleColor,
    subtitleColor,
    priceColor,
    fullPriceColor,
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
    calculateDiscountedPrice_3,
    renderTemplate,
    selectedCard,
    setSelectedCard,
  } = useAppContext();

  const [selectedProducts, setSelectedProducts] = useState<
    Record<number, SelectedProduct | null>
  >({});

  useEffect(() => {
    if (multiPackages.length > 0) {
      const lastId = `pack-${multiPackages[multiPackages.length - 1].id}`;
      setSelectedCard(lastId);
    }
  }, [multiPackages, setSelectedCard]);

  const handleCardSelect = (cardId: string) => {
    setSelectedCard((prev) => (prev === cardId ? null : cardId));
  };

  return (
    <div style={{ padding: "16px" }}>
      {/* Header */}
      {blockTitle && (
        <InlineStack align="center" gap="200">
          <div
            style={{
              flexGrow: 1,
              height: "2px",
              backgroundColor: blockTitleColor,
            }}
          />
          <p
            style={{
              color: blockTitleColor,
              fontSize: `${blockTitleFontSize}px`,
              fontWeight: blockTitleFontStyle === "Bold" ? "700" : "400",
              fontStyle: blockTitleFontStyle === "Italic" ? "italic" : "normal",
            }}
          >
            {blockTitle}
          </p>
          <div
            style={{
              flexGrow: 1,
              height: "2px",
              backgroundColor: blockTitleColor,
            }}
          />
        </InlineStack>
      )}

      {/* Simple List */}
      <BlockStack gap="100">
        {multiPackages.map((pkg) => {
          const unitPrice = 10;
          const quantity = pkg.quantity;
          const totalBefore = unitPrice * quantity;
          const totalAfter = Number(
            calculateDiscountedPrice_3(
              unitPrice,
              pkg.priceMode ?? "default",
              pkg.discountValue ?? 0,
              quantity,
            ).toFixed(2),
          );

          const saved_total = totalBefore - totalAfter;
          const saved_percentage =
            saved_total > 0 ? (saved_total / totalBefore) * 100 : 0;

          const magicCodeArray = {
            totalBefore,
            totalAfter,
            saved_total,
            saved_percentage,
          };
          const label = pkg.label || "";
          const subtitle = pkg.subtitle || "";
          const cardId = `pack-${pkg.id}`;
          const isSelected = selectedCard === cardId;

          const bgColor = isSelected
            ? (selectedBackground ?? "#fff")
            : (cardsBackground ?? "#ededed");
          const borderCol = borderColor ?? "#ddd";
          const badgeBg = badgeBackground ?? "#000";

          return (
            <div
              key={pkg.id}
              style={{
                backgroundColor: bgColor,
                borderRadius: cornerRadius,
                border: isSelected
                  ? `2px solid ${borderCol}`
                  : `1px solid ${borderCol}`,
                padding: spacing,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
              onClick={() => handleCardSelect(cardId)}
            >
              {/* Main row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  {/* Radio circle */}
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      border: `2px solid ${borderCol}`,
                      backgroundColor: isSelected ? borderCol : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isSelected && (
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          backgroundColor: "#fff",
                          borderRadius: "50%",
                        }}
                      />
                    )}
                  </div>

                  <div>
                    <p
                      style={{
                        color: titleColor,
                        fontSize: `${titleFontSize}px`,
                        fontWeight: titleFontStyle === "Bold" ? "700" : "400",
                        fontStyle:
                          titleFontStyle === "Italic" ? "italic" : "normal",
                      }}
                    >
                      {renderTemplate(pkg.title, magicCodeArray)}
                    </p>

                    {pkg.subtitle && (
                      <p
                        style={{
                          color: subtitleColor,
                          fontSize: `${subtitleFontSize}px`,
                          fontWeight:
                            subtitleFontStyle === "Bold" ? "700" : "400",
                          fontStyle:
                            subtitleFontStyle === "Italic"
                              ? "italic"
                              : "normal",
                        }}
                      >
                        {renderTemplate(subtitle, magicCodeArray)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div style={{ textAlign: "right" }}>
                  <p
                    style={{
                      color: priceColor,
                      fontWeight: "700",
                      fontSize: "14px",
                    }}
                  >
                    {pkg.symbol}
                    {totalAfter}
                  </p>
                  <p style={{ color: fullPriceColor ?? "#999" }}>
                    <s>
                      {pkg.symbol}
                      {totalBefore}
                    </s>
                  </p>
                </div>
              </div>

              {/* Expanded content - only when selected */}
              {isSelected && (
                <div
                  style={{
                    marginTop: "12px",
                    paddingTop: "12px",
                    borderTop: `1px solid ${cardsBackground}`,
                  }}
                >
                  {Array.from({ length: pkg.quantity - 1 }).map(
                    (_, slotIndex) => {
                      const product = selectedProducts[slotIndex] || null;
                      return (
                        <div key={slotIndex} style={{ marginBottom: "8px" }}>
                          {!product ? (
                            <button
                              type="button"
                              onClick={() =>
                                openPicker(slotIndex, setSelectedProducts)
                              }
                              className="px-3 py-1 text-sm font-medium rounded"
                              style={{
                                background: borderCol,
                                color: "#fff",
                              }}
                            >
                              Choose
                            </button>
                          ) : (
                            renderSelectedPreview(product, () =>
                              setSelectedProducts((prev) => ({
                                ...prev,
                                [slotIndex]: null,
                              })),
                            )
                          )}
                        </div>
                      );
                    },
                  )}
                </div>
              )}
            </div>
          );
        })}
      </BlockStack>
    </div>
  );
}

// Main Card
export function DifferentProductCard({
  themeColor = "#000000",
  lightThemeColor = "#EDEDED",
  borderThemeColor,
  currencyCode = "",
  product = [],
}: {
  themeColor?: string;
  lightThemeColor?: string;
  borderThemeColor?: string;
  currencyCode?: string;
  product?: any;
}) {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const [showModal, setShowModal] = useState(false);
  const { isSubscribed } = useIsSubscribed();

  const choosePath = `/app/deals/multi-product?type=${encodeURIComponent(
    "differentProduct",
  )}&theme=${encodeURIComponent(themeColor)}&light=${encodeURIComponent(
    lightThemeColor,
  )}`;

  const [selectedProducts, setSelectedProducts] = useState<
    Record<number, SelectedProduct | null>
  >({});

  const handleChooseClick = () => {
    if (isSubscribed) {
      navigate(choosePath);
    } else {
      setShowModal(true);
    }
  };

  const Product = {
    image: product?.featuredImage?.url || "",
    imageAlt: product?.featuredImage?.altText || "",
    title: product?.title || "",
    selectedOptions:
      product?.variants?.edges?.map((edge: any) => edge.node.selectedOptions) ||
      [],
  };

  const isCreateLoading =
    navigation.state !== "idle" &&
    navigation.location &&
    navigation.location.pathname + navigation.location.search === choosePath;

  const [expanded, setExpanded] = useState<"pack1" | "pack2">("pack1");

  return (
    <Box>
      <div className="p-4 rounded-xl shadow-sm" style={{ background: "#fff" }}>
        {/* Pack 1 */}
        <div
          className={`border-2 rounded-lg p-4 cursor-pointer relative ${
            expanded === "pack1" ? "shadow-lg" : "border-gray-200"
          }`}
          onClick={() => setExpanded("pack1")}
          style={{
            border:
              expanded === "pack1"
                ? `2px solid ${themeColor}`
                : `1px solid ${lightThemeColor}`,
            backgroundColor: expanded === "pack1" ? "#FFFFFF" : lightThemeColor,
          }}
        >
          <InlineStack align="space-between">
            <InlineStack gap="300" align="center">
              <BlockStack gap="050">
                <Text as="h3" variant="headingXl">
                  One T-shirt
                </Text>
                <Text as="p" variant="bodyMd" tone="subdued">
                  Standard price
                </Text>
              </BlockStack>
            </InlineStack>
            <Text as="p" variant="headingXl">
              {currencyCode} 20.00
            </Text>
          </InlineStack>

          {expanded === "pack1" && (
            <div className="mt-4">
              <BlockStack gap="300">
                {/* Single Product */}
                <div className="flex items-center gap-6">
                  {/* Image */}
                  <div className="pl-5">
                    <img
                      src={Product.image}
                      alt={Product.imageAlt}
                      className="w-[50px] h-[50px] rounded-md object-cover"
                    />
                  </div>

                  {/* Text + Select */}
                  <div className="flex flex-col">
                    <Text as="h3" variant="headingMd">
                      {Product.title}
                    </Text>

                    {/* Extract name once and show select */}
                    {Product.selectedOptions?.length > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        {/* Label */}
                        <Text as="span" variant="bodySm">
                          {Product.selectedOptions[0][0]?.name}:
                        </Text>

                        {/* Dropdown */}
                        <select className="border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                          {Product.selectedOptions.map(
                            (optionGroup: any[], index: number) => (
                              <option key={index} value={optionGroup[0]?.value}>
                                {optionGroup[0]?.value}
                              </option>
                            ),
                          )}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </BlockStack>
            </div>
          )}
        </div>

        {/* Pack 2 */}
        <div
          className={`border-2 rounded-lg p-4 cursor-pointer relative mt-3 ${
            expanded === "pack2" ? "shadow-lg" : "border-gray-200"
          }`}
          onClick={() => setExpanded("pack2")}
          style={{
            border:
              expanded === "pack2"
                ? `2px solid ${themeColor}`
                : `1px solid ${lightThemeColor}`,
            backgroundColor: expanded === "pack2" ? "#FFFFFF" : lightThemeColor,
          }}
        >
          {/* Most Popular Badge */}
          <div style={{ position: "absolute", top: -18, right: 10, zIndex: 2 }}>
            <span
              style={{
                background: themeColor,
                color: "white",
                borderRadius: "16px",
                padding: "2px 12px",
                fontSize: "12px",
                fontWeight: 600,
                boxShadow: `0 2px 8px ${borderThemeColor}`,
              }}
            >
              Most Popular
            </span>
          </div>

          <InlineStack align="space-between">
            <InlineStack gap="300" align="center">
              <BlockStack gap="050">
                <Text as="h1" variant="headingXl">
                  Two T-shirts
                </Text>
                <div className="h-6 rounded-full text-[12px] font-bold text-black">
                  You SAVE {currencyCode} 6.00
                </div>
              </BlockStack>
            </InlineStack>
            <BlockStack gap="050" align="end">
              <Text as="p" variant="headingXl">
                {currencyCode} 34.00
              </Text>
              <Text as="p" variant="headingMd" tone="subdued">
                <s>{currencyCode} 40.00</s>
              </Text>
            </BlockStack>
          </InlineStack>

          {expanded === "pack2" && (
            <div className="mt-4">
              <BlockStack gap="300">
                {/* Two products */}
                {/* Single Product */}
                <div className="flex items-center gap-6">
                  {/* Image */}
                  <div className="pl-5">
                    <img
                      src={Product.image}
                      alt={Product.imageAlt}
                      className="w-[50px] h-[50px] rounded-md object-cover"
                    />
                  </div>

                  {/* Text + Select */}
                  <div className="flex flex-col">
                    <Text as="h3" variant="headingMd">
                      {Product.title}
                    </Text>

                    {/* Extract name once and show select */}
                    {Product.selectedOptions?.length > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        {/* Label */}
                        <Text as="span" variant="bodySm">
                          {Product.selectedOptions[0][0]?.name}:
                        </Text>

                        {/* Dropdown */}
                        <select className="border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                          {Product.selectedOptions.map(
                            (optionGroup: any[], index: number) => (
                              <option key={index} value={optionGroup[0]?.value}>
                                {optionGroup[0]?.value}
                              </option>
                            ),
                          )}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Choose Button */}
                {Array.from({ length: 1 }).map((_, slotIndex) => {
                  const product = selectedProducts[slotIndex] || null;
                  return (
                    <div key={slotIndex} style={{ marginBottom: "8px" }}>
                      {!product ? (
                        <button
                          type="button"
                          onClick={() =>
                            openPicker(slotIndex, setSelectedProducts)
                          }
                          className="px-3 py-1 text-sm font-medium rounded"
                          style={{
                            background: themeColor,
                            color: "#fff",
                            marginLeft: "19px",
                            marginTop: 3,
                          }}
                        >
                          Choose
                        </button>
                      ) : (
                        renderSelectedPreview(product, () =>
                          setSelectedProducts((prev) => ({
                            ...prev,
                            [slotIndex]: null,
                          })),
                        )
                      )}
                    </div>
                  );
                })}
              </BlockStack>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4">
          <BlockStack gap="300" align="center">
            <Text as="p" variant="bodyMd" tone="subdued" alignment="center">
              quantity breaks for different products
            </Text>
            <Button
              variant="primary"
              size="large"
              fullWidth
              loading={isCreateLoading}
              disabled={isCreateLoading}
              onClick={handleChooseClick}
            >
              {isCreateLoading ? undefined : "Choose"}
            </Button>
          </BlockStack>
        </div>
        <SubscriptionModal
          open={showModal}
          onClose={() => setShowModal(false)}
          redirectPath="/app/plans-page"
          message="Please subscribe to unlock this feature."
          title="Subscription Required"
        />
      </div>
    </Box>
  );
}
