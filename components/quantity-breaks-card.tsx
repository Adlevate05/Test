import { useState, useCallback } from "react";
import {
  Card,
  Button,
  Select,
  Text,
  Icon,
  Box,
  InlineStack,
  BlockStack,
} from "@shopify/polaris";
import { ProductIcon } from "@shopify/polaris-icons";
import { useNavigate, useNavigation } from "@remix-run/react";
import { useAppContext, AppProvider } from "app/utils/AppContext";
import { ChevronDown } from "lucide-react";
import black from "../components/Assets/Images/black-tshirt.png";
import { useIsSubscribed } from "app/hooks/useIsSubscribed";
import { SubscriptionModal } from "./common/subscription-modal";

interface Props {
  selectedColors: { [key: string]: string };
  selectedSizes: { [key: string]: string };
  handleColorChange: (id: string, color: string) => void;
  handleSizeChange: (id: string, size: string) => void;
  colorOptions: { label: string; value: string }[];
  sizeOptions: { label: string; value: string }[];
  themeColor: string;
  lightThemeColor: string;
  className?: string;
  currencyCode?: string;
  product?: any;
}

// QuantityBreaksSubCardOne
export function QuantityBreaksSubCardOne() {
  const {
    blockTitle,
    cornerRadius,
    packages,
    calculateDiscountedPrice,
    renderTemplate,
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
    spacing,
    blockTitleFontSize,
    blockTitleFontStyle,
    titleFontSize,
    titleFontStyle,
    subtitleFontSize,
    subtitleFontStyle,
    labelFontSize,
    labelFontStyle,
    selectedCard,
    setSelectedCard,
  } = useAppContext();

  const [selectedSizes, setSelectedSizes] = useState<{ [key: string]: string }>(
    {},
  );

  const handleSelectCard = (cardId: string) => {
    setSelectedCard((prev) => (prev === cardId ? null : cardId));
  };

  const handleSizeChange = (cardId: string, value: string) => {
    setSelectedSizes((prev) => ({ ...prev, [cardId]: value }));
  };

  const sizeOptions = [
    { label: "S", value: "S" },
    { label: "M", value: "M" },
    { label: "L", value: "L" },
  ];

  return (
    <div className="rounded-[12px] p-0">
      <Box padding="400">
        {/* Header */}
        {blockTitle && (
          <InlineStack align="center" gap="200">
            <div
              className="mt-2"
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
                fontStyle:
                  blockTitleFontStyle === "Italic" ? "italic" : "normal",
              }}
            >
              {blockTitle}
            </p>
            <div
              className="mt-2"
              style={{
                flexGrow: 1,
                height: "2px",
                backgroundColor: blockTitleColor,
              }}
            />
          </InlineStack>
        )}

        {/* Packages */}
        <div className="space-y-5 p-5">
          {packages.map((pkg) => {
            const total = 10 * pkg.quantity;
            const calculateDiscounted = Number(
              calculateDiscountedPrice(
                total,
                pkg.priceMode ?? "default",
                pkg.discountValue ?? 0,
                pkg.quantity,
              ).toFixed(2),
            );

            let saved_total = 0;
            let saved_percentage = 0;
            if (pkg.discountValue != undefined && pkg.discountValue > 0) {
              saved_total = total - calculateDiscounted;
              saved_percentage = (saved_total / total) * 100;
            }

            const magicCodeArray = { saved_percentage, saved_total };
            const label = pkg.label || "";

            const cardId = `pack-${pkg.id}`;
            const isSelected = selectedCard === cardId;

            return (
              <div
                key={pkg.id}
                className={`border rounded-lg cursor-pointer relative mt-6 transition-all ${
                  isSelected ? "shadow-lg" : ""
                }`}
                onClick={() => handleSelectCard(cardId)}
                style={{
                  borderColor: isSelected
                    ? (badgeBackground ?? "#000000")
                    : (borderColor ?? "#ededed"),
                  borderWidth: isSelected ? 2 : 1,
                  background: isSelected
                    ? (selectedBackground ?? "#FFFFFF")
                    : (cardsBackground ?? "#ededed"),
                  borderRadius: `${cornerRadius}px`,
                  padding: `${spacing}px`,
                }}
              >
                {/* Badge */}
                {pkg.badgeText && (
                  <div
                    style={{
                      position: "absolute",
                      top: -18,
                      right: 10,
                      zIndex: 2,
                    }}
                  >
                    <span
                      style={{
                        background: badgeBackground ?? "#000000",
                        color: badgeText || "#FFFFFF",
                        borderRadius: "16px",
                        padding: "2px 12px",
                        fontSize: "12px",
                        fontWeight: 600,
                        boxShadow: `0 2px 8px ${
                          badgeBackground ?? "#000000"
                        }33`,
                      }}
                    >
                      {pkg.badgeText}
                    </span>
                  </div>
                )}

                {/* Card Content */}
                <InlineStack align="space-between">
                  <InlineStack gap="300" align="center">
                    <input
                      type="radio"
                      name="package"
                      checked={isSelected}
                      onChange={() => handleSelectCard(cardId)}
                      className="w-5 h-5 cursor-pointer"
                      style={{ accentColor: badgeBackground ?? "#000000" }}
                    />
                    <div
                      className="w-8 h-8 rounded flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: "#ededed" }}
                    >
                      <Icon source={ProductIcon} />
                    </div>
                    <BlockStack gap="050">
                      <div
                        className="flex flex-row space-x-3 text-xl"
                        style={{
                          color: titleColor,
                          fontSize: `${titleFontSize}px`,
                          fontWeight: titleFontStyle === "Bold" ? "700" : "400",
                          fontStyle:
                            titleFontStyle === "Italic" ? "italic" : "normal",
                        }}
                      >
                        <h1>{pkg.quantity} </h1>
                        <h1>{renderTemplate(pkg.title, magicCodeArray)} </h1>
                        {label?.trim() && (
                          <span
                            className="rounded-full px-3 py-2 text-xs font-semibold"
                            style={{
                              color: labelText,
                              background: labelBackground ?? "#000000",
                              fontSize: `${labelFontSize}px`,
                              fontWeight:
                                labelFontStyle === "Bold" ? "700" : "400",
                              fontStyle:
                                labelFontStyle === "Italic"
                                  ? "italic"
                                  : "normal",
                            }}
                          >
                            {renderTemplate(label, magicCodeArray)}
                          </span>
                        )}
                      </div>
                      {pkg.subtitle && (
                        <div
                          style={{
                            color: subtitleColor,
                            fontSize: `${subtitleFontSize}px`,
                            fontWeight:
                              subtitleFontStyle === "Bold" ? 700 : 400,
                            fontStyle:
                              subtitleFontStyle === "Italic"
                                ? "italic"
                                : "normal",
                          }}
                        >
                          {renderTemplate(pkg.subtitle, magicCodeArray)}
                        </div>
                      )}
                    </BlockStack>
                  </InlineStack>

                  {/* Price Section */}
                  <div className="flex flex-col justify-between">
                    <div className="flex" style={{ color: priceColor }}>
                      <Text as="p" variant="headingMd" fontWeight="bold">
                        {pkg.symbol}
                        {calculateDiscounted}
                      </Text>
                    </div>
                    {pkg.priceMode !== "default" && (
                      <div className="flex">
                        <p style={{ color: fullPriceColor }}>
                          <s>
                            {pkg.symbol}
                            {total}
                          </s>
                        </p>
                      </div>
                    )}
                  </div>
                </InlineStack>

                {/* Expanded Section */}
                {isSelected && (
                  <div
                    className="mt-4"
                    style={{
                      background: "fff",
                      borderRadius: "8px",
                      padding: "12px",
                    }}
                  >
                    <BlockStack gap="300">
                      <Text as="p" variant="bodyMd" fontWeight="medium">
                        Size, Color
                      </Text>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "24px",
                        }}
                      >
                        <Box>
                          <Select
                            label=""
                            options={sizeOptions}
                            value={selectedSizes[cardId] || "M"}
                            onChange={(value) =>
                              handleSizeChange(cardId, value)
                            }
                          />
                        </Box>
                      </div>
                    </BlockStack>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Box>
    </div>
  );
}

// QuantityBreaksSubCardTwo
export function QuantityBreaksSubCardTwo() {
  const {
    blockTitle,
    cornerRadius,
    packages,
    calculateDiscountedPrice,
    renderTemplate,
    borderColor,
    blockTitleColor,
    titleColor,
    subtitleColor,
    priceColor,
    fullPriceColor,
    badgeText,
    spacing,
    blockTitleFontSize,
    blockTitleFontStyle,
    titleFontSize,
    titleFontStyle,
    badgeBackground,
    cardsBackground,
    selectedBackground,
    subtitleFontSize,
    subtitleFontStyle,
    selectedCard,
    labelBackground,
    labelText,
    labelFontSize,
    labelFontStyle,
    setSelectedCard,
  } = useAppContext();

  const [selectedSizes, setSelectedSizes] = useState<{ [key: string]: string }>(
    {},
  );

  const handleSelectCard = (cardId: string) => {
    setSelectedCard((prev) => (prev === cardId ? null : cardId));
  };

  const handleSizeChange = (cardId: string, value: string) => {
    setSelectedSizes((prev) => ({ ...prev, [cardId]: value }));
  };

  const sizeOptions = [
    { label: "S", value: "S" },
    { label: "M", value: "M" },
    { label: "L", value: "L" },
  ];

  return (
    <div className="rounded-[12px] p-0">
      <Box padding="400">
        {/* Header */}
        {blockTitle && (
          <InlineStack align="center" gap="200">
            <div
              className="mt-2"
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
                fontStyle:
                  blockTitleFontStyle === "Italic" ? "italic" : "normal",
              }}
            >
              {blockTitle}
            </p>
            <div
              className="mt-2"
              style={{
                flexGrow: 1,
                height: "2px",
                backgroundColor: blockTitleColor,
              }}
            />
          </InlineStack>
        )}

        {/* Packages */}
        <div className="grid grid-cols-2 gap-5 p-5">
          {packages.map((pkg) => {
            const total = 10 * pkg.quantity;

            const calculateDiscounted = Number(
              calculateDiscountedPrice(
                total,
                pkg.priceMode ?? "default",
                pkg.discountValue ?? 0,
                pkg.quantity,
              ).toFixed(2),
            );

            let saved_total = 0;
            let saved_percentage = 0;

            if (pkg.discountValue != undefined && pkg.discountValue > 0) {
              saved_total = total - calculateDiscounted;
              saved_percentage = (saved_total / total) * 100;
            }
            const label = pkg.label || "";

            const magicCodeArray = { saved_percentage, saved_total };
            const cardId = `pack-${pkg.id}`;
            const isSelected = selectedCard === cardId;
            const borderCol = isSelected
              ? (badgeBackground ?? "#000000")
              : (borderColor ?? "#ddd");

            return (
              <div
                key={pkg.id}
                className={`border rounded-lg cursor-pointer relative mt-2 transition-all ${
                  isSelected ? "shadow-lg" : ""
                }`}
                onClick={() => handleSelectCard(cardId)}
                style={{
                  borderColor: isSelected ? borderColor : "#ededed",
                  borderWidth: isSelected ? 2 : 1,
                  background: isSelected
                    ? (selectedBackground ?? "#FFFFFF")
                    : (cardsBackground ?? "#ededed"),
                  borderRadius: `${cornerRadius}px`,
                  padding: `${spacing}px`,
                }}
              >
                {/* Badge */}
                {pkg.badgeText && (
                  <div
                    style={{
                      position: "absolute",
                      top: -18,
                      right: 10,
                      zIndex: 2,
                    }}
                  >
                    <span
                      style={{
                        background: `${badgeBackground}`,
                        color: badgeText || "#FFFFFF",
                        borderRadius: "16px",
                        padding: "2px 12px",
                        fontSize: "12px",
                        fontWeight: 600,
                        boxShadow: `0 2px 8px #00000033`,
                      }}
                    >
                      {pkg.badgeText}
                    </span>
                  </div>
                )}

                <InlineStack align="space-between">
                  {label?.trim() && (
                    <span
                      className="rounded-full px-3 py-2 text-xs font-semibold"
                      style={{
                        color: labelText,
                        background: labelBackground ?? "#000000",
                        fontSize: `${labelFontSize}px`,
                        fontWeight: labelFontStyle === "Bold" ? "700" : "400",
                        fontStyle:
                          labelFontStyle === "Italic" ? "italic" : "normal",
                        position: "absolute",
                        top: 0,
                        left: 0,
                        textAlign: "center",
                        width: "100%",
                        borderRadius: cornerRadius,
                      }}
                    >
                      {renderTemplate(label, magicCodeArray)}
                    </span>
                  )}

                  {/* Radio Button */}
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
                      margin: "30px auto 12px auto",
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
                  <div
                    className="mainBodyContent"
                    style={{
                      marginTop: "5px",
                    }}
                  >
                    <InlineStack gap="300" align="center">
                      <div
                        className="w-8 h-8 rounded flex items-center justify-center shadow-sm"
                        style={{ backgroundColor: "#ededed" }}
                      >
                        <Icon source={ProductIcon} />
                      </div>

                      <BlockStack gap="050">
                        <div
                          className="space-x-3 text-xl"
                          style={{
                            color: titleColor,
                            fontSize: `${titleFontSize}px`,
                            fontWeight:
                              titleFontStyle === "Bold" ? "700" : "400",
                            fontStyle:
                              titleFontStyle === "Italic" ? "italic" : "normal",
                          }}
                        >
                          <h1>
                            {pkg.quantity}{" "}
                            {renderTemplate(pkg.title, magicCodeArray)}
                          </h1>
                        </div>

                        {pkg.subtitle && (
                          <div
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
                            {renderTemplate(pkg.subtitle, magicCodeArray)}
                          </div>
                        )}
                      </BlockStack>
                    </InlineStack>
                  </div>

                  <div className="flex flex-col justify-between">
                    <div
                      className="flex flex-col"
                      style={{ color: priceColor }}
                    >
                      <p className="text-xl font-black">
                        {pkg.symbol}
                        {calculateDiscounted}
                      </p>
                      <p>Denominations</p>
                    </div>

                    {pkg.priceMode !== "default" && (
                      <div className="flex">
                        <p style={{ color: fullPriceColor }}>
                          <s>
                            {pkg.symbol}
                            {total}
                          </s>
                        </p>
                      </div>
                    )}
                  </div>
                </InlineStack>

                {/* Expanded Section */}
                {isSelected && (
                  <div
                    className="mt-4"
                    style={{
                      background: "#fff",
                      borderRadius: "8px",
                      padding: "12px",
                    }}
                  >
                    <BlockStack gap="300">
                      <Text as="p" variant="bodyMd" fontWeight="medium">
                        Size, Color
                      </Text>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "24px",
                        }}
                      >
                        <Box>
                          <Select
                            label=""
                            options={sizeOptions}
                            value={selectedSizes[cardId] || "M"}
                            onChange={(value) =>
                              handleSizeChange(cardId, value)
                            }
                          />
                        </Box>
                      </div>
                    </BlockStack>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Box>
    </div>
  );
}

// QuantityBreaksSubCardThree
export function QuantityBreaksSubCardThree() {
  const {
    blockTitle,
    cornerRadius,
    packages,
    calculateDiscountedPrice,
    renderTemplate,
    borderColor,
    blockTitleColor,
    titleColor,
    subtitleColor,
    priceColor,
    fullPriceColor,
    badgeBackground,
    cardsBackground,
    selectedBackground,
    spacing,
    blockTitleFontSize,
    blockTitleFontStyle,
    titleFontSize,
    titleFontStyle,
    subtitleFontSize,
    subtitleFontStyle,
    selectedCard,
    labelBackground,
    labelText,
    labelFontSize,
    labelFontStyle,
    setSelectedCard,
  } = useAppContext();

  const [selectedSizes, setSelectedSizes] = useState<{ [key: string]: string }>(
    {},
  );

  const handleSelectCard = (cardId: string) => {
    setSelectedCard((prev) => (prev === cardId ? null : cardId));
  };

  const handleSizeChange = (cardId: string, value: string) => {
    setSelectedSizes((prev) => ({ ...prev, [cardId]: value }));
  };

  const sizeOptions = [
    { label: "S", value: "S" },
    { label: "M", value: "M" },
    { label: "L", value: "L" },
  ];

  return (
    <div className="rounded-[12px] p-0">
      <Box padding="400">
        {/* Header */}
        {blockTitle && (
          <InlineStack align="center" gap="200">
            <div
              className="mt-2"
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
                fontStyle:
                  blockTitleFontStyle === "Italic" ? "italic" : "normal",
              }}
            >
              {blockTitle}
            </p>
            <div
              className="mt-2"
              style={{
                flexGrow: 1,
                height: "2px",
                backgroundColor: blockTitleColor,
              }}
            />
          </InlineStack>
        )}

        {/* Packages */}
        <div className="flex flex-row gap-5 p-5">
          {packages.map((pkg) => {
            const total = 10 * pkg.quantity;
            const calculateDiscounted = Number(
              calculateDiscountedPrice(
                total,
                pkg.priceMode ?? "default",
                pkg.discountValue ?? 0,
                pkg.quantity,
              ).toFixed(2),
            );

            let saved_total = 0;
            let saved_percentage = 0;
            if (pkg.discountValue != undefined && pkg.discountValue > 0) {
              saved_total = total - calculateDiscounted;
              saved_percentage = (saved_total / total) * 100;
            }

            const label = pkg.label || "";

            const magicCodeArray = { saved_percentage, saved_total };
            const cardId = `pack-${pkg.id}`;
            const isSelected = selectedCard === cardId;

            return (
              <div
                key={pkg.id}
                onClick={() => handleSelectCard(cardId)}
                className={`relative border rounded-lg cursor-pointer mt-2 transition ${isSelected ? "shadow-lg" : ""}`}
                style={{
                  borderColor: isSelected
                    ? badgeBackground
                    : (borderColor ?? "#ededed"),
                  borderWidth: isSelected ? 2 : 1,
                  background: isSelected
                    ? (selectedBackground ?? "#FFFFFF")
                    : (cardsBackground ?? "#ededed"),
                  borderRadius: `${cornerRadius}px`,
                  padding: `${spacing}px`,
                }}
              >
                {/* Badge */}
                {pkg.badgeText && (
                  <div
                    style={{
                      position: "absolute",
                      top: -18,
                      right: 10,
                      zIndex: 2,
                    }}
                  >
                    <span
                      style={{
                        background: badgeBackground ?? "#000000",
                        color: "#FFFFFF",
                        borderRadius: "16px",
                        padding: "2px 12px",
                        fontSize: "12px",
                        fontWeight: 600,
                        boxShadow: `0 2px 8px ${badgeBackground ?? "#000000"}33`,
                      }}
                    >
                      {pkg.badgeText}
                    </span>
                  </div>
                )}

                {/* Radio-circle */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2">
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                    style={{
                      borderColor: isSelected ? badgeBackground : "#9CA3AF",
                    }}
                  >
                    {isSelected && (
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: badgeBackground }}
                      />
                    )}
                  </div>
                </div>

                <InlineStack align="space-between">
                  <div style={{ paddingTop: 15, marginTop: 10 }}>
                    <InlineStack gap="300" align="center">
                      <div
                        className="w-8 h-8 rounded flex items-center justify-center shadow-sm"
                        style={{ backgroundColor: "#ededed" }}
                      >
                        <Icon source={ProductIcon} />
                      </div>

                      <BlockStack gap="050">
                        <div
                          className="space-x-3 text-xl"
                          style={{
                            color: titleColor,
                            fontSize: `${titleFontSize}px`,
                            fontWeight:
                              titleFontStyle === "Bold" ? "700" : "400",
                            fontStyle:
                              titleFontStyle === "Italic" ? "italic" : "normal",
                          }}
                        >
                          <h1>
                            {pkg.quantity}{" "}
                            {renderTemplate(pkg.title, magicCodeArray)}
                          </h1>
                        </div>

                        {pkg.subtitle && (
                          <div
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
                            {renderTemplate(pkg.subtitle, magicCodeArray)}
                          </div>
                        )}
                      </BlockStack>
                      {label?.trim() && (
                        <span
                          className="rounded-full px-3 py-2 text-xs font-semibold"
                          style={{
                            color: labelText,
                            background: labelBackground ?? "#000000",
                            fontSize: `${labelFontSize}px`,
                            fontWeight:
                              labelFontStyle === "Bold" ? "700" : "400",
                            fontStyle:
                              labelFontStyle === "Italic" ? "italic" : "normal",
                            marginTop: 10,
                            marginBottom: 10,
                          }}
                        >
                          {renderTemplate(label, magicCodeArray)}
                        </span>
                      )}
                    </InlineStack>
                  </div>

                  <div className="flex flex-col justify-between items-center">
                    <div
                      className="flex flex-col"
                      style={{ color: priceColor }}
                    >
                      <p className="text-xl font-black">
                        {pkg.symbol}
                        {calculateDiscounted}
                      </p>
                      <p>Denominations</p>
                    </div>

                    {pkg.priceMode !== "default" && (
                      <div className="flex">
                        <p style={{ color: fullPriceColor }}>
                          <s>
                            {pkg.symbol}
                            {total}
                          </s>
                        </p>
                      </div>
                    )}
                  </div>
                </InlineStack>

                {/* Extra Options */}
                {isSelected && (
                  <div
                    className="mt-4"
                    style={{
                      background: "#fff",
                      borderRadius: "8px",
                      padding: "12px",
                    }}
                  >
                    <BlockStack gap="300">
                      <Text as="p" variant="bodyMd" fontWeight="medium">
                        Size, Color
                      </Text>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "24px",
                        }}
                      >
                        <Box>
                          <Select
                            label=""
                            options={sizeOptions}
                            value={selectedSizes[cardId] || "M"}
                            onChange={(value) =>
                              handleSizeChange(cardId, value)
                            }
                          />
                        </Box>
                      </div>
                    </BlockStack>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Box>
    </div>
  );
}

// QuantityBreaksSubCardFour
export function QuantityBreaksSubCardFour() {
  const {
    blockTitle,
    cornerRadius,
    packages,
    calculateDiscountedPrice,
    renderTemplate,
    blockTitleColor,
    titleColor,
    subtitleColor,
    priceColor,
    fullPriceColor,
    labelBackground,
    labelText,
    badgeBackground,
    cardsBackground,
    spacing,
    blockTitleFontSize,
    blockTitleFontStyle,
    titleFontSize,
    titleFontStyle,
    subtitleFontSize,
    subtitleFontStyle,
    labelFontSize,
    labelFontStyle,
    selectedCard,
    selectedBackground,
    setSelectedCard,
    borderColor,
  } = useAppContext();

  const [selectedSizes, setSelectedSizes] = useState<{ [key: string]: string }>(
    {},
  );

  const sizeOptions = [
    { label: "$10", value: "10" },
    { label: "$20", value: "20" },
    { label: "$30", value: "30" },
  ];

  const handleSelectCard = (cardId: string) => {
    setSelectedCard((prev) => (prev === cardId ? null : cardId));
  };

  const handleSizeChange = (id: string, value: string) => {
    setSelectedSizes((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div className="rounded-[12px]">
      <Box padding="400">
        {/* Header */}
        {blockTitle && (
          <InlineStack align="center" gap="200">
            <div
              className="mt-2"
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
                fontStyle:
                  blockTitleFontStyle === "Italic" ? "italic" : "normal",
              }}
            >
              {blockTitle}
            </p>
            <div
              className="mt-2"
              style={{
                flexGrow: 1,
                height: "2px",
                backgroundColor: blockTitleColor,
              }}
            />
          </InlineStack>
        )}

        {/* Package Cards */}
        {packages.map((pkg) => {
          const total = 10 * pkg.quantity;

          const discounted = Number(
            calculateDiscountedPrice(
              total,
              pkg.priceMode ?? "default",
              pkg.discountValue ?? 0,
              pkg.quantity,
            ).toFixed(2),
          );

          let saved_total = 0;
          let saved_percentage = 0;
          if (pkg.discountValue != undefined && pkg.discountValue > 0) {
            saved_total = total - discounted;
            saved_percentage = (saved_total / total) * 100;
          }

          const magicCodeArray = { saved_percentage, saved_total };
          const label = pkg.label || "";
          const cardId = `pack-${pkg.id}`;
          const isSelected = selectedCard === cardId;

          return (
            <div
              key={pkg.id}
              className="rounded-lg mt-2 border cursor-pointer transition"
              onClick={() => handleSelectCard(cardId)}
              style={{
                background: isSelected
                  ? (selectedBackground ?? "#FFFFFF")
                  : (cardsBackground ?? "#ededed"),
                borderRadius: `${cornerRadius}px`,
                padding: `${spacing}px`,
                borderColor: isSelected
                  ? (badgeBackground ?? "#000000")
                  : (borderColor ?? "#ddd"),
                borderWidth: isSelected ? 2 : 1,
                boxShadow: isSelected
                  ? `0 2px 8px ${badgeBackground ?? "#000000"}33`
                  : "none",
              }}
            >
              {/* Row */}
              <div className="flex justify-between items-center">
                {/* Left Side: Radio + Info */}
                <div className="flex items-start gap-3">
                  {/* Radio */}
                  <div className="mt-1">
                    <div
                      className="w-4 h-4 border-2 rounded-full flex items-center justify-center"
                      style={{
                        borderColor: isSelected
                          ? (badgeBackground ?? "#000000")
                          : "#9CA3AF",
                      }}
                    >
                      {isSelected && (
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: badgeBackground ?? "#000000",
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Texts */}
                  <div>
                    <div className="flex gap-2 items-center">
                      <h1
                        className="font-bold text-base"
                        style={{
                          color: titleColor,
                          fontSize: `${titleFontSize}px`,
                          fontWeight: titleFontStyle === "Bold" ? "700" : "400",
                          fontStyle:
                            titleFontStyle === "Italic" ? "italic" : "normal",
                        }}
                      >
                        {pkg.quantity}{" "}
                        {renderTemplate(pkg.title, magicCodeArray)}
                      </h1>
                      {label?.trim() && (
                        <span
                          className="px-2 py-1 rounded-md text-xs font-semibold"
                          style={{
                            color: labelText,
                            background:
                              badgeBackground ?? labelBackground ?? "#000000",
                            fontSize: `${labelFontSize}px`,
                            fontWeight:
                              labelFontStyle === "Bold" ? "700" : "400",
                            fontStyle:
                              labelFontStyle === "Italic" ? "italic" : "normal",
                          }}
                        >
                          {renderTemplate(label, magicCodeArray)}
                        </span>
                      )}
                    </div>

                    {pkg.subtitle && (
                      <p
                        className="text-sm"
                        style={{
                          color: subtitleColor,
                          fontSize: `${subtitleFontSize}px`,
                          fontWeight: subtitleFontStyle === "Bold" ? 700 : 400,
                          fontStyle:
                            subtitleFontStyle === "Italic"
                              ? "italic"
                              : "normal",
                        }}
                      >
                        {renderTemplate(pkg.subtitle, magicCodeArray)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Side: Prices */}
                <div className="text-right">
                  <p
                    className="font-bold text-base"
                    style={{ color: priceColor }}
                  >
                    {pkg.symbol}
                    {discounted}
                  </p>
                  {pkg.priceMode !== "default" && (
                    <p
                      className="line-through text-sm"
                      style={{ color: fullPriceColor }}
                    >
                      {pkg.symbol}
                      {total}
                    </p>
                  )}
                </div>
              </div>

              {/* Expanded Section */}
              {isSelected && (
                <div
                  className="mt-4 rounded-md p-3"
                  style={{ background: cardsBackground ?? "#fff" }}
                >
                  <BlockStack gap="300">
                    <Text as="p" variant="bodyMd" fontWeight="medium">
                      Size, Color
                    </Text>
                    <div className="flex items-center gap-6">
                      <Box>
                        <Select
                          label=""
                          options={sizeOptions}
                          value={selectedSizes[cardId] || "10"}
                          onChange={(value) => handleSizeChange(cardId, value)}
                        />
                      </Box>
                    </div>
                  </BlockStack>
                </div>
              )}
            </div>
          );
        })}
      </Box>
    </div>
  );
}

// --- Custom Select ---
type CustomSelectProps = {
  value: string;
  onChange: (val: string) => void;
  options: { label: string; value: string }[];
  style?: React.CSSProperties;
  themeColor?: string;
  className?: string;
};

function CustomSelect({
  value,
  onChange,
  options,
  style,
  themeColor,
}: CustomSelectProps) {
  const [isFocused, setIsFocused] = useState(false);

  const ringColor = themeColor ?? "#000000";

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{
          appearance: "none",
          WebkitAppearance: "none",
          MozAppearance: "none",
          width: "100%",
          padding: "8px 36px 8px 12px",
          borderRadius: "4px",
          backgroundColor: "white",
          fontSize: "14px",
          cursor: "pointer",
          outline: "none",
          border: isFocused ? `2px solid ${ringColor}` : "1px solid #d1d5d6",
          ...style,
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Chevron dropdown icon */}
      <ChevronDown
        size={18}
        style={{
          position: "absolute",
          right: "10px",
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
          color: "#000",
        }}
      />
    </div>
  );
}

export function QuantityBreaksCard({
  themeColor,
  lightThemeColor,
  className = "",
  currencyCode = "",
  product = [],
}: Props) {
  const [expanded, setExpanded] = useState<"pack1" | "pack2">("pack1");

  const { isSubscribed } = useIsSubscribed();

  const navigate = useNavigate();
  const navigation = useNavigation();
  const [showModal, setShowModal] = useState(false);

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

  const isNavigatingTo = (to: string) => {
    const current = navigation.location
      ? navigation.location.pathname + navigation.location.search
      : "";
    return navigation.state !== "idle" && current === to;
  };

  const choosePath = `/app/bundle-deal?type=${encodeURIComponent(
    "productBundle",
  )}&theme=${encodeURIComponent(themeColor)}&light=${encodeURIComponent(
    lightThemeColor,
  )}&currency=${encodeURIComponent(currencyCode)}`;

  const isChooseLoading = isNavigatingTo(choosePath);

  const ColorButton = ({
    color,
    isSelected,
    onClick,
  }: {
    color: string;
    isSelected: boolean;
    onClick: () => void;
  }) => (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "32px",
        height: "32px",
        border: isSelected ? "2px solid black" : "2px solid #ededed",
        borderRadius: "4px",
        boxSizing: "border-box",
        background: "white",
        cursor: "pointer",
      }}
      onClick={onClick}
    >
      <div
        style={{
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          backgroundColor: color,
        }}
      />
    </div>
  );

  return (
    <div className={`h-full ${className}`}>
      <Card>
        <div
          className="rounded-[12px] p-2"
          style={{ backgroundColor: "#F8F9FA" }}
        >
          <BlockStack gap="300">
            {/* Pack 1 card */}
            <div
              className={`rounded-lg cursor-pointer relative transition-all duration-200 ${
                expanded === "pack1" ? "shadow-md" : ""
              }`}
              style={{
                border:
                  expanded === "pack1"
                    ? `2px solid ${themeColor}`
                    : `1px solid ${lightThemeColor}`,
                backgroundColor:
                  expanded === "pack1" ? "#FFFFFF" : lightThemeColor,
                padding: expanded === "pack1" ? "20px" : "16px",
              }}
              onClick={() => setExpanded("pack1")}
            >
              <InlineStack align="space-between">
                <InlineStack gap="300" align="center">
                  <BlockStack gap="050">
                    <Text variant="headingMd" as="h2" fontWeight="semibold">
                      <span className="text-[20px] fontextrabold">1 pack</span>
                    </Text>
                    <Text as="p" variant="bodyMd" tone="subdued">
                      <span className="text-[14px]">Standard price</span>
                    </Text>
                  </BlockStack>
                </InlineStack>
                <Text as="p" variant="headingLg" fontWeight="semibold">
                  {currencyCode} 20.00
                </Text>
              </InlineStack>

              {expanded === "pack1" && (
                <div className="mt-4">
                  <BlockStack gap="300">
                    <div className="flex flex-col items-start gap-1">
                      {/* Only render if selectedOptions exist */}
                      {Product.selectedOptions?.length > 0 && (
                        <>
                          {/* Label */}
                          <Text as="span" variant="bodySm" tone="subdued">
                            {Product.selectedOptions[0][0]?.name}
                          </Text>

                          {/* Dropdown */}
                          <select
                            className="w-[100px] border border-gray-300 rounded-md px-2 py-[6px] text-sm bg-white shadow-sm 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          >
                            {Product.selectedOptions.map(
                              (optionGroup: any[], index: number) => (
                                <option
                                  key={index}
                                  value={optionGroup[0]?.value}
                                >
                                  {optionGroup[0]?.value}
                                </option>
                              ),
                            )}
                          </select>
                        </>
                      )}
                    </div>
                  </BlockStack>
                </div>
              )}
            </div>

            {/* Pack 2 card */}
            <div
              className={`rounded-lg cursor-pointer relative transition-all duration-200 ${
                expanded === "pack2" ? "shadow-md" : ""
              }`}
              style={{
                border:
                  expanded === "pack2"
                    ? `2px solid ${themeColor}`
                    : `1px solid ${lightThemeColor}`,
                backgroundColor:
                  expanded === "pack2" ? "#FFFFFF" : lightThemeColor,
                padding: expanded === "pack2" ? "20px" : "16px",
              }}
              onClick={() => setExpanded("pack2")}
            >
              <InlineStack align="space-between">
                <InlineStack gap="300" align="center">
                  <BlockStack gap="050">
                    <InlineStack gap="200" align="center">
                      <Text as="span" variant="headingMd" fontWeight="semibold">
                        <span className="text-[20px] fontextrabold">
                          2 pack
                        </span>
                      </Text>
                      <div
                        style={{
                          backgroundColor: themeColor,
                          color: "#FFFFFF",
                          padding: "4px 8px",
                          borderRadius: "16px",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}
                      >
                        SAVE {currencyCode} 6.00
                      </div>
                    </InlineStack>
                    <Text
                      as="p"
                      variant="bodyMd"
                      tone="success"
                      fontWeight="medium"
                    >
                      <span className="text-[14px] text-gray-600 font-normal">
                        You save 15%
                      </span>
                    </Text>
                  </BlockStack>
                </InlineStack>
                <BlockStack gap="050" align="end">
                  <Text as="p" variant="headingLg" fontWeight="semibold">
                    {currencyCode} 34.00
                  </Text>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    <s>{currencyCode} 40.00</s>
                  </Text>
                </BlockStack>
              </InlineStack>

              {expanded === "pack2" && (
                <div className="mt-4">
                  <BlockStack gap="400">
                    <div className="flex flex-row items-center gap-3 ">
                      {/* Only render if selectedOptions exist */}
                      {Product.selectedOptions?.length > 0 && (
                        <>
                          {/* Label */}
                          <Text as="span" variant="bodySm" tone="subdued">
                            {Product.selectedOptions[0][0]?.name}
                          </Text>

                          {/* Dropdown */}
                          <select
                            className="w-[100px] border border-gray-300 rounded-md px-2 py-[6px] text-sm bg-white shadow-sm 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          >
                            {Product.selectedOptions.map(
                              (optionGroup: any[], index: number) => (
                                <option
                                  key={index}
                                  value={optionGroup[0]?.value}
                                >
                                  {optionGroup[0]?.value}
                                </option>
                              ),
                            )}
                          </select>
                        </>
                      )}
                    </div>
                    <div className="flex flex-row items-center gap-3 ">
                      {/* Only render if selectedOptions exist */}
                      {Product.selectedOptions?.length > 0 && (
                        <>
                          {/* Label */}
                          <Text as="span" variant="bodySm" tone="subdued">
                            {Product.selectedOptions[0][0]?.name}
                          </Text>

                          {/* Dropdown */}
                          <select
                            className="w-[100px] border border-gray-300 rounded-md px-2 py-[6px] text-sm bg-white shadow-sm 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          >
                            {Product.selectedOptions.map(
                              (optionGroup: any[], index: number) => (
                                <option
                                  key={index}
                                  value={optionGroup[0]?.value}
                                >
                                  {optionGroup[0]?.value}
                                </option>
                              ),
                            )}
                          </select>
                        </>
                      )}
                    </div>
                  </BlockStack>
                </div>
              )}
            </div>

            {/* Footer */}
            <BlockStack gap="300" align="center">
              <Text as="p" variant="bodyMd" tone="subdued" alignment="center">
                Quantity breaks for the same product
              </Text>
              <Button
                variant="primary"
                size="large"
                fullWidth
                onClick={handleChooseClick}
                loading={isChooseLoading}
                disabled={isChooseLoading}
              >
                {isChooseLoading ? undefined : "Choose"}
              </Button>
            </BlockStack>
          </BlockStack>
        </div>
      </Card>
      <SubscriptionModal
        open={showModal}
        onClose={() => setShowModal(false)}
        redirectPath="/app/plans-page"
        message="Please subscribe to unlock this feature."
        title="Subscription Required"
      />
    </div>
  );
}

// not need to do this
export default function QuantityBreaks() {
  return (
    <AppProvider>
      <QuantityBreaksSubCardOne />
    </AppProvider>
  );
}
