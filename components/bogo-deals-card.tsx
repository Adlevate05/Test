import React, { useEffect, useState } from "react";
import {
  Button,
  Text,
  BlockStack,
  InlineStack,
  Box,
  Select,
} from "@shopify/polaris";
import { useAppContext } from "app/utils/AppContext";
import { useNavigate, useNavigation } from "@remix-run/react";
import { useIsSubscribed } from "app/hooks/useIsSubscribed";
import { SubscriptionModal } from "./common/subscription-modal";

// BogoDealsSubCardOne
export function BogoDealSubCardOne() {
  const {
    blockTitle,
    cornerRadius,
    bogoPackages,
    calculateOffer,
    renderTemplate,
    cardsBackground,
    borderColor,
    blockTitleColor,
    titleColor,
    subtitleColor,
    priceColor,
    fullPriceColor,
    labelBackground,
    badgeBackground,
    badgeText,
    spacing,
    blockTitleFontSize,
    blockTitleFontStyle,
    titleFontSize,
    titleFontStyle,
    subtitleFontSize,
    subtitleFontStyle,
    selectedBackground,
    labelFontSize,
    labelFontStyle,
    selectedCard,
    setSelectedCard,
  } = useAppContext();

  const handleSelectCard = (cardId: string) => {
    setSelectedCard((prev) => (prev === cardId ? null : cardId));
  };

  useEffect(() => {
    if (bogoPackages.length > 0) {
      const lastId = `pack-${bogoPackages[bogoPackages.length - 1].id}`;
      setSelectedCard(lastId);
    }
  }, [bogoPackages, setSelectedCard]);

  return (
    <div style={{ padding: "16px", borderRadius: `${cornerRadius}px` }}>
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
              fontStyle: blockTitleFontStyle === "Italic" ? "italic" : "normal",
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
      <div className="space-y-2 p-5">
        {bogoPackages.map((pkg) => {
          const { actualPrice, priceToPay, savePercentage, savedAmount } =
            calculateOffer({
              unitPrice: 10,
              buyQuantity: pkg.buyQuantity,
              freeQuantity: pkg.freeQuantity ?? 0,
            });

          const magicCodeArray = {
            saved_percentage: savePercentage,
            saved_total: savedAmount,
          };

          const label = pkg.label || "";
          const subtitle = pkg.subtitle || "";
          const cardId = `pack-${pkg.id}`;
          const isSelected = selectedCard === cardId;

          // Apply context-based theming
          const bgColor = isSelected
            ? (selectedBackground ?? "#FFFFFF")
            : (cardsBackground ?? "#ededed");
          const borderCol = isSelected
            ? (badgeBackground ?? "#000000")
            : (borderColor ?? "#ddd");
          const badgeBg = badgeBackground ?? "#000000";
          const labelBg = labelBackground ?? "#000000";

          return (
            <div
              key={pkg.id}
              className={`border rounded-lg cursor-pointer relative mt-6 transition-all ${isSelected ? "shadow-lg" : ""
                }`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderColor: borderCol,
                background: bgColor,
                borderRadius: `${cornerRadius}px`,
                padding: `${spacing}px`,
              }}
              onClick={() => handleSelectCard(cardId)}
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
                      background: badgeBg,
                      color: badgeText || "#fff",
                      borderRadius: "16px",
                      padding: "2px 12px",
                      fontSize: "12px",
                      fontWeight: 600,
                      boxShadow: `0 2px 8px ${badgeBg}33`,
                    }}
                  >
                    {pkg.badgeText}
                  </span>
                </div>
              )}

              {/* Content */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0px",
                  flex: 1,
                }}
              >
                {/* Radio Button */}
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    border: `2px solid ${badgeBg}`,
                    marginRight: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isSelected ? badgeBg : "#FFFFFF",
                  }}
                >
                  {isSelected && (
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "#FFFFFF",
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
                      fontWeight: subtitleFontStyle === "Bold" ? "700" : "400",
                      fontStyle:
                        subtitleFontStyle === "Italic" ? "italic" : "normal",
                    }}
                  >
                    {renderTemplate(subtitle, magicCodeArray)}
                  </p>
                </div>

                {pkg.label && (
                  <span
                    style={{
                      color: badgeText || "#fff",
                      background: labelBg,
                      fontSize: `${labelFontSize}px`,
                      fontWeight: labelFontStyle === "Bold" ? "700" : "400",
                      fontStyle:
                        labelFontStyle === "Italic" ? "italic" : "normal",
                      borderRadius: "16px",
                      padding: "4px 8px",
                      marginLeft: "8px",
                    }}
                  >
                    {renderTemplate(label, magicCodeArray)}
                  </span>
                )}
              </div>

              {/* Price Section */}
              <div className="flex flex-col justify-between">
                <div
                  style={{
                    color: priceColor,
                    fontSize: "18px",
                    fontWeight: 600,
                  }}
                >
                  {pkg.symbol}
                  {priceToPay}
                </div>
                <div style={{ color: fullPriceColor, fontSize: "14px" }}>
                  <s>
                    {pkg.symbol}
                    {actualPrice}
                  </s>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// BogoDealsSubCardTwo
export function BogoDealSubCardTwo() {
  const {
    blockTitle,
    cornerRadius,
    bogoPackages,
    renderTemplate,
    calculateOffer,
    cardsBackground,
    borderColor,
    blockTitleColor,
    titleColor,
    subtitleColor,
    priceColor,
    fullPriceColor,
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
    selectedBackground,
    selectedCard,
    setSelectedCard,
  } = useAppContext();

  const handleSelectCard = (cardId: string) => {
    setSelectedCard((prev) => (prev === cardId ? null : cardId));
  };

  return (
    <div style={{ padding: "16px", borderRadius: `${cornerRadius}px` }}>
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

      {/* Grid Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "12px",
          marginTop: "16px",
        }}
      >
        {bogoPackages.map((pkg) => {
          const { actualPrice, priceToPay, savePercentage, savedAmount } =
            calculateOffer({
              unitPrice: 10,
              buyQuantity: pkg.buyQuantity,
              freeQuantity: pkg.freeQuantity ?? 0,
            });

          const magicCodeArray = {
            saved_percentage: savePercentage,
            saved_total: savedAmount,
          };

          const label = pkg.label || "";
          const subtitle = pkg.subtitle || "";
          const cardId = `pack-${pkg.id}`;
          const isSelected = selectedCard === cardId;

          // Use context-based colors only
          const bgColor = isSelected
            ? (selectedBackground ?? "#FFFFFF")
            : (cardsBackground ?? "#ededed");
          const borderCol = isSelected
            ? (badgeBackground ?? "#000000")
            : (borderColor ?? "#ddd");
          const badgeBg = badgeBackground ?? "#000000";

          return (
            <div
              key={pkg.id}
              style={{
                backgroundColor: bgColor,
                border: `1px solid ${borderCol}`,
                cursor: "pointer",
                textAlign: "center",
                position: "relative",
                borderRadius: `${cornerRadius}px`,
                padding: `${spacing}px`,
                boxShadow: isSelected ? `0 4px 10px ${borderCol}33` : "none",
                transition: "all 0.2s ease",
              }}
              onClick={() => handleSelectCard(cardId)}
            >
              {/* Label at Top */}
              {pkg.label && (
                <div
                  style={{
                    display: "inline-block",
                    backgroundColor: badgeBg,
                    borderRadius: "12px",
                    padding: "2px 10px",
                    marginBottom: "12px",
                    position: "absolute",
                    width: "100%",
                    transform: "translateX(-50%)",
                    top: 0,
                    whiteSpace: "nowrap",
                    color: badgeText || "#fff",
                    fontSize: `${labelFontSize}px`,
                    fontWeight: labelFontStyle === "Bold" ? "700" : "400",
                    fontStyle:
                      labelFontStyle === "Italic" ? "italic" : "normal",
                  }}
                >
                  {renderTemplate(label, magicCodeArray)}
                </div>
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
                  margin: "15px auto 12px auto",
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

              {/* Title + Subtitle */}
              <div>
                <h1
                  style={{
                    color: titleColor,
                    fontSize: `${titleFontSize}px`,
                    fontWeight: titleFontStyle === "Bold" ? "700" : "400",
                    fontStyle:
                      titleFontStyle === "Italic" ? "italic" : "normal",
                  }}
                >
                  {renderTemplate(pkg.title, magicCodeArray)}
                </h1>
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
              </div>

              {/* Price Section */}
              <div className="flex flex-col mt-3">
                <div
                  style={{
                    color: priceColor,
                    fontSize: "18px",
                    fontWeight: 600,
                  }}
                >
                  {pkg.symbol}
                  {priceToPay}
                </div>
                {pkg.priceMode !== "default" && (
                  <div
                    style={{
                      color: fullPriceColor,
                      fontSize: "14px",
                      marginTop: "4px",
                    }}
                  >
                    <s>
                      {pkg.symbol}
                      {actualPrice}
                    </s>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// BogoDealsSubCardThree
export function BogoDealSubCardThree() {
  const { blockTitle, cornerRadius, calculateOffer, renderTemplate } =
    useAppContext();

  const {
    bogoPackages,
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
    <div style={{ padding: "16px", borderRadius: `${cornerRadius}px` }}>
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

      {/* Packages */}
      <div className="grid grid-cols-2 gap-5 p-5">
        {bogoPackages.map((pkg) => {
          const { actualPrice, priceToPay, savePercentage, savedAmount } =
            calculateOffer({
              unitPrice: 10,
              buyQuantity: pkg.buyQuantity,
              freeQuantity: pkg.freeQuantity ?? 0,
            });

          const magicCodeArray = {
            saved_percentage: savePercentage,
            saved_total: savedAmount,
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
            ? (badgeBackground ?? "#000000")
            : (borderColor ?? "#ddd");
          const badgeBg = badgeBackground ?? "#000000";

          return (
            <div
              key={pkg.id}
              onClick={() => handleSelectCard(cardId)}
              className={`relative border rounded-lg cursor-pointer mt-2 transition ${isSelected ? "shadow-lg" : ""
                }`}
              style={{
                borderColor: borderCol,
                background: bgColor,
                borderRadius: `${cornerRadius}px`,
                padding: `${spacing}px`,
              }}
            >
              <InlineStack align="space-between">
                <InlineStack gap="300" align="center">
                  <BlockStack gap="050">
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
                        margin: "15px auto 12px auto",
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

                    {/* Title + Badge + Subtitle */}
                    <div
                      style={{
                        textAlign: "center", // centers inline/inline-block children
                      }}
                    >
                      {/* Title */}
                      <h1
                        style={{
                          color: titleColor,
                          fontSize: `${titleFontSize}px`,
                          fontWeight: titleFontStyle === "Bold" ? "700" : "400",
                          fontStyle:
                            titleFontStyle === "Italic" ? "italic" : "normal",
                          display: "inline-block",
                          marginRight: "8px",
                        }}
                      >
                        {pkg.buyQuantity}{" "}
                        {renderTemplate(pkg.title, magicCodeArray)}
                      </h1>

                      {/* Badge */}
                      {pkg.label && (
                        <span
                          style={{
                            background: badgeBg,
                            color: badgeText,
                            borderRadius: "16px",
                            padding: "2px 12px",
                            boxShadow: `0 2px 8px ${badgeBg}33`,
                            fontSize: `${labelFontSize}px`,
                            fontWeight:
                              labelFontStyle === "Bold" ? "700" : "400",
                            fontStyle:
                              labelFontStyle === "Italic" ? "italic" : "normal",
                            display: "inline-block",
                            marginTop: 10,
                          }}
                        >
                          {renderTemplate(label, magicCodeArray)}
                        </span>
                      )}

                      {/* Subtitle (on new line but centered) */}
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
                            marginTop: "4px",
                          }}
                        >
                          <Text as="p">
                            {renderTemplate(subtitle, magicCodeArray)}
                          </Text>
                        </div>
                      )}
                      {/* Price Section */}
                      <div className="flex flex-col items-center text-center">
                        {/* Price + Denominations */}
                        <div
                          className="flex flex-col items-center"
                          style={{ color: priceColor }}
                        >
                          <p className="text-xl font-black">
                            {pkg.symbol}
                            {priceToPay}
                          </p>
                          <p>Denominations</p>
                        </div>

                        {/* Strikethrough Price */}
                        {pkg.priceMode !== "default" && (
                          <div className="mt-1">
                            <p style={{ color: fullPriceColor }}>
                              <s>
                                {pkg.symbol}
                                {actualPrice}
                              </s>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </BlockStack>
                </InlineStack>
              </InlineStack>

              {/* Extra Options for selected card */}
              {isSelected && (
                <div
                  className="mt-4"
                  style={{
                    background: selectedBackground,
                    borderRadius: `${cornerRadius}px`,
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
      </div>
    </div>
  );
}

// BogoDealsSubCardFour
export function BogoDealSubCardFour() {
  const {
    blockTitle,
    cornerRadius,
    bogoPackages,
    renderTemplate,
    calculateOffer,
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

  const handleSelectCard = (cardId: string) => {
    setSelectedCard((prev) => (prev === cardId ? null : cardId));
  };

  return (
    <div style={{ padding: "16px", borderRadius: `${cornerRadius}px` }}>
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

      {/* Packages */}
      <div className="space-y-2 p-5">
        {bogoPackages.map((pkg) => {
          const { actualPrice, priceToPay, savePercentage, savedAmount } =
            calculateOffer({
              unitPrice: 10,
              buyQuantity: pkg.buyQuantity,
              freeQuantity: pkg.freeQuantity ?? 0,
            });

          const magicCodeArray = {
            saved_percentage: savePercentage,
            saved_total: savedAmount,
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
            ? (badgeBackground ?? "#000000")
            : (borderColor ?? "#ddd");
          const badgeBg = badgeBackground ?? "#000000";

          return (
            <div
              key={pkg.id}
              onClick={() => handleSelectCard(cardId)}
              className={`border rounded-lg cursor-pointer relative mt-6 ${isSelected ? "shadow-lg" : ""
                }`}
              style={{
                borderColor: borderCol,
                background: bgColor,
                borderRadius: `${cornerRadius}px`,
                padding: `${spacing}px`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {/* Left Section */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  flex: 1,
                }}
              >
                {/* Radio Circle */}
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    border: `2px solid ${badgeBg}`,
                    backgroundColor: isSelected ? badgeBg : "transparent",
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

                {/* Title + Subtitle */}
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
                      fontWeight: subtitleFontStyle === "Bold" ? "700" : "400",
                      fontStyle:
                        subtitleFontStyle === "Italic" ? "italic" : "normal",
                    }}
                  >
                    {renderTemplate(subtitle, magicCodeArray)}
                  </p>
                </div>

                {/* Badge */}
                {pkg.label && (
                  <span
                    className="rounded-full px-3 py-2 text-xs font-semibold"
                    style={{
                      color: badgeText || "#fff",
                      background: badgeBg,
                      fontSize: `${labelFontSize}px`,
                      fontWeight: labelFontStyle === "Bold" ? "700" : "400",
                      fontStyle:
                        labelFontStyle === "Italic" ? "italic" : "normal",
                    }}
                  >
                    {renderTemplate(label, magicCodeArray)}
                  </span>
                )}
              </div>

              {/* Price Section */}
              <div className="flex flex-col justify-between items-end">
                <div style={{ color: priceColor }}>
                  <Text as="p" variant="headingMd" fontWeight="bold">
                    {pkg.symbol}
                    {priceToPay}
                  </Text>
                </div>
                <div>
                  {pkg.priceMode !== "default" && (
                    <p style={{ color: fullPriceColor }}>
                      <s>
                        {pkg.symbol}
                        {actualPrice}
                      </s>
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// BogoDealCardMain
export function BOGODealsCard({
  themeColor = "#000000",
  lightThemeColor = "#EDEDED",
  borderThemeColor = "",
  className = "",
  currencyCode = "",
}) {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const [showModal, setShowModal] = useState(false);
  const { isSubscribed } = useIsSubscribed();



  const choosePath = `/app/deals/bogo?type=${encodeURIComponent(
    "bogo",
  )}&theme=${encodeURIComponent(themeColor)}&light=${encodeURIComponent(
    lightThemeColor,
  )}`;

  const handleChooseClick = () => {
    if (isSubscribed) {
      navigate(choosePath)
    } else {
      setShowModal(true)
    }
  }

  // ✅ Same logic you used in QuantityBreaksCard
  const isCreateLoading =
    navigation.state !== "idle" &&
    navigation.location &&
    navigation.location.pathname + navigation.location.search === choosePath;

  const deals = [
    {
      id: 1,
      title: "Buy 1, get 1 free",
      savings: "SAVE 50%",
      price: `${currencyCode} 20.00`,
      originalPrice: `${currencyCode} 40.00`,
    },
    {
      id: 2,
      title: "Buy 2, get 3 free",
      savings: "SAVE 60%",
      price: `${currencyCode} 40.00`,
      originalPrice: `${currencyCode} 100.00`,
    },
    {
      id: 3,
      title: "Buy 3, get 6 free",
      savings: "SAVE 67%",
      price: `${currencyCode} 60.00`,
      originalPrice: `${currencyCode} 180.00`,
    },
  ];

  const [selectedDealId, setSelectedDealId] = useState(1);

  return (
    <div
      className={`h-full w-full flex-1 ${className}`}
      style={{
        maxWidth: "465px",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div className="findme h-full">
        <div
          className="Polaris-Box h-full"
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "12px",
            padding: "16px",
            paddingTop: "32px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          {/* Deals List */}
          <div
            style={{
              marginBottom: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {deals.map((deal) => {
              const isSelected = deal.id === selectedDealId;
              return (
                <div
                  key={deal.id}
                  style={{
                    backgroundColor: isSelected ? "#FFFFFF" : lightThemeColor,
                    border: isSelected
                      ? `2px solid ${themeColor}`
                      : `1px solid ${lightThemeColor}`,
                    borderRadius: "16px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    position: "relative",
                    overflow: "hidden",
                    outline: `1px solid ${themeColor}4d`,
                  }}
                  onClick={() => setSelectedDealId(deal.id)}
                >
                  {/* Deal content */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "8px 12px",
                      borderRadius: "14px",
                    }}
                  >
                    {/* Radio Button */}
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        border: `2px solid ${themeColor}`,
                        marginRight: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: isSelected ? themeColor : "#FFFFFF",
                      }}
                    >
                      {isSelected && (
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor: "#FFFFFF",
                          }}
                        />
                      )}
                    </div>
                    {/* Text + savings */}
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "16px",
                            fontWeight: "500",
                            color: "#000000",
                          }}
                        >
                          {deal.title}
                        </span>
                        <span
                          style={{
                            backgroundColor: themeColor,
                            color: "#FFFFFF",
                            padding: "4px 8px",
                            borderRadius: "16px",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          {deal.savings}
                        </span>
                      </div>
                      {/* Price */}
                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            fontSize: "18px",
                            fontWeight: "600",
                            color: "#000000",
                          }}
                        >
                          {deal.price}
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#666666",
                            textDecoration: "line-through",
                          }}
                        >
                          {deal.originalPrice}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Extra gift only for deal 3 */}
                  {deal.id === 3 && (
                    <div
                      style={{
                        backgroundColor: isSelected
                          ? themeColor
                          : lightThemeColor,
                        padding: "12px 16px",
                        borderBottomLeftRadius: "14px",
                        borderBottomRightRadius: "14px",
                      }}
                    >
                      <span
                        style={{
                          color: isSelected ? "#FFFFFF" : "#000000",
                          fontSize: "14px",
                          fontWeight: "600",
                        }}
                      >
                        + FREE special gift!
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {/* Description */}
          <div
            style={{
              textAlign: "center",
              marginBottom: "16px",
            }}
          >
            <span style={{ color: "#666666", fontSize: "14px" }}>
              Buy X, get Y free (BOGO) deal
            </span>
          </div>
          {/* Choose Button */}
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
        </div>
      </div>
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
