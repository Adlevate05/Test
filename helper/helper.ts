// Discount Block Generation types
export interface DiscountValue {
  label: string;
  title: string;
  quantity: number;
  subtitle?: string;
  badgeText?: string;
  badgeStyle?: string;
  discountValue?: number;
  discountType?: string;
  default?: boolean;
  baseTotal: number;
  customerPays: number;
  discountAmount: number;
  buyQuantity?: number;
  getQuantity?: number;
  discountCode?: string;
  effectivePercentage?: number;
}

export interface OptionStyle {
  badgeText?: string;
  borderColor?: string;
  cardsBackground?: string;
  labelText?: string;
  labelBackground?: string;
  cornerRadius?: number;
  titleColor?: string;
  titleFontSize?: number;
  titleFontStyle?: number;
  selectedBackground?: string;
  priceColor?: string;
  fullPriceColor?: string;
  spacing?: number;
  subtitleColor?: string;
  subtitleFontSize?: number;
  subtitleFontStyle?: number;
  labelFontSize?: number;
  labelFontStyle?: number;
  blockTitleColor?: string;
  blockTitleFontSize?: number;
  blockTitleFontStyle?: number;
  badgeBackground?: string;
}

export interface BlockData {
  html_content: string;
}

export interface Product {
  title?: string;
  image?: {
    src?: string;
  };
  id?: number;
  handle?: string;
}

export interface ProcessTemplateParams {
  block_title: string;
  block: BlockData;
  discountValues: DiscountValue[];
  optionStyles: OptionStyle[];
  productId: string;
  prices: Array<{ variantId?: string }>;
  product?: Product;
  handle?: string;
  blockTitleColor?: string;
  blockTitleFontSize?: string;
  blockTitleStyle?: string;
  buttonborderColor?: string;
  buttoncardsBackground?: string;
  buttoncornerRadius?: string;
  buttonSpacing?: string;
  symbol?: string;
}

/**
 * Processes HTML template by replacing placeholders with dynamic discount values
 * @param params - Template processing parameters
 * @returns Processed HTML content string
 */
export function processSameTemplate(params: ProcessTemplateParams): string {
  const {
    block_title,
    block,
    discountValues,
    optionStyles,
    productId,
    handle,
    prices,
    product,
    blockTitleColor,
    blockTitleFontSize,
    blockTitleStyle,
    buttonborderColor,
    buttoncardsBackground,
    buttoncornerRadius,
    buttonSpacing,
    symbol,
  } = params;

  // Start with general replacements
  let htmlContent = block.html_content
    .replace(/{{product_id}}/g, productId)
    .replace(/{{cart_add_url}}/g, `/cart/add`)
    .replace(/{{variant_id}}/g, prices[0]?.variantId?.split("/").pop() || "")
    .replace(/{{product_handle}}/g, handle || "")
    .replace(/{{block_title}}/g, block_title)
    .replace(/{{blockTitleColor}}/g, blockTitleColor || "")
    .replace(/{{blockTitleFontSize}}/g, blockTitleFontSize || "")
    .replace(/{{blockTitleFontStyle}}/g, blockTitleStyle || "")
    .replace(/{{buttonborderColor}}/g, buttonborderColor || "")
    .replace(/{{buttoncardsBackground}}/g, buttoncardsBackground || "")
    .replace(/{{buttoncornerRadius}}/g, buttoncornerRadius || "")
    .replace(/{{buttonSpacing}}/g, buttonSpacing || "")
    .replace(/{{currency_symbol}}/g, symbol || "")
    .replace(/{{block_id}}/g, Math.floor(Math.random() * 1000000).toString());

  // Process dynamic discount options
  if (discountValues && discountValues.length > 0) {
    // Create a dynamic section for each discount option
    let eachDiscountContent = "";

    discountValues.forEach((discount, index) => {
      // Replace index with actual number (2, 3, 4, etc.) since option 1 is reserved for single item
      const optionIndex = index + 2;

      // Create a chunk for this specific discount option with all its properties
      let optionContent =
        htmlContent.match(
          /{{#each_discount_option}}([\s\S]*?){{\/each_discount_option}}/,
        )?.[1] || "";

      if (optionContent) {
        // Replace all option_{{index}} placeholders with the actual index
        optionContent = optionContent.replace(
          /option_{{index}}/g,
          `option_${optionIndex}`,
        );

        // Get the corresponding style for this discount option
        const correspondingStyle = optionStyles[index] || optionStyles[0] || {};

        // Replace the rest of the placeholders with actual values
        optionContent = optionContent
          .replace(/{{index}}/g, index.toString())
          .replace(
            new RegExp(`{{option_${optionIndex}_label}}`, "g"),
            `${discount.quantity} ${discount.title}`,
          )
          .replace(
            new RegExp(`{{option_${optionIndex}_checked}}`, "g"),
            discount.default ? 'checked="checked"' : "",
          )
          .replace(
            new RegExp(`{{option_${optionIndex}_subtitle}}`, "g"),
            discount.subtitle
              ? discount.subtitle.replace(
                  /{{saved_percentage}}/g,
                  `${Number(discount.discountValue || 0).toFixed(0)}%`,
                )
              : "",
          )
          .replace(new RegExp(`{{option_${optionIndex}_message}}`, "g"), "")
          .replace(
            new RegExp(`{{option_${optionIndex}_customerPays}}`, "g"),
            discount.customerPays?.toString() || "",
          )
          .replace(
            new RegExp(`{{option_${optionIndex}_baseTotal}}`, "g"),
            discount.baseTotal?.toString() || "",
          )
          .replace(
            new RegExp(`{{option_${optionIndex}_savePercentage}}`, "g"),
            discount.label
              ? discount.label.replace(
                  /{{saved_total}}/g,
                  `${symbol} ${Number(discount.discountAmount || 0).toFixed(2)}`,
                )
              : "",
          )
          .replace(
            new RegExp(`{{option_${optionIndex}_badge}}`, "g"),
            correspondingStyle.badgeText ||
              discount.label ||
              `${discount.discountValue}%`,
          )
          .replace(
            new RegExp(`{{option_${optionIndex}_quantity}}`, "g"),
            discount.quantity?.toString() || "",
          )
          .replace(
            new RegExp(`{{option_${optionIndex}_total_quantity}}`, "g"),
            discount.quantity?.toString() || "",
          )
          .replace(
            new RegExp(`{{option_${optionIndex}_paid_quantity}}`, "g"),
            discount.buyQuantity?.toString() || "",
          )
          .replace(
            new RegExp(`{{option_${optionIndex}_free_quantity}}`, "g"),
            discount.getQuantity?.toString() || "",
          )
          .replace(
            new RegExp(`{{option_${optionIndex}_discount_code}}`, "g"),
            discount.discountCode || "",
          )
          .replace(
            new RegExp(`{{option_${optionIndex}_discount_name}}`, "g"),
            discount.title || `${discount.quantity} pack`,
          )
          .replace(new RegExp(`{{option_${optionIndex}_checked}}`, "g"), "")
          .replace(new RegExp(`{{option_${optionIndex}_disabled}}`, "g"), "")
          .replace(new RegExp(`{{option_${optionIndex}_ineligible}}`, "g"), "")
          .replace(
            new RegExp(`{{option_${optionIndex}_isPopular}}`, "g"),
            index === 0 ? "true" : "false",
          )
          .replace(
            new RegExp(`{{option_${optionIndex}_popular_text}}`, "g"),
            "Most Popular",
          )
          .replace(
            new RegExp(`{{option_${optionIndex}_has_special_gift}}`, "g"),
            "false",
          )
          .replace(
            new RegExp(`{{option_${optionIndex}_base_product_image}}`, "g"),
            product?.image?.src || "",
          )
          .replace(
            new RegExp(`{{option_${optionIndex}_base_product_title}}`, "g"),
            product?.title || "",
          );

        // Apply style-specific replacements
        const styleReplacements: Record<string, string> = {
          badgeText: correspondingStyle.badgeText || "",
          borderColor: correspondingStyle.borderColor || "",
          cardsBackground: correspondingStyle.cardsBackground || "",
          labelText: correspondingStyle.labelText || "",
          labelBackground: correspondingStyle.labelBackground || "",
          cornerRadius: correspondingStyle.cornerRadius?.toString() || "",
          titleColor: correspondingStyle.titleColor || "",
          titleFontSize: correspondingStyle.titleFontSize?.toString() || "",
          titleFontStyle: correspondingStyle.titleFontStyle?.toString() || "",
          selectedBackground: correspondingStyle.selectedBackground || "",
          priceColor: correspondingStyle.priceColor || "",
          fullPriceColor: correspondingStyle.fullPriceColor || "",
          spacing: correspondingStyle.spacing?.toString() || "",
          subtitleColor: correspondingStyle.subtitleColor || "",
          subtitleFontSize:
            correspondingStyle.subtitleFontSize?.toString() || "",
          subtitleFontStyle:
            correspondingStyle.subtitleFontStyle?.toString() || "",
          labelFontSize: correspondingStyle.labelFontSize?.toString() || "",
          labelFontStyle: correspondingStyle.labelFontStyle?.toString() || "",
          blockTitleColor: correspondingStyle.blockTitleColor || "",
          blockTitleFontSize:
            correspondingStyle.blockTitleFontSize?.toString() || "",
          blockTitleFontStyle:
            correspondingStyle.blockTitleFontStyle?.toString() || "",
          badgeBackground: correspondingStyle.badgeBackground || "",
        };

        // Apply all style replacements
        Object.entries(styleReplacements).forEach(([key, value]) => {
          optionContent = optionContent.replace(
            new RegExp(`{{${key}}}`, "g"),
            value,
          );
        });

        eachDiscountContent += optionContent;
      }
    });

    // Replace the {{#each_discount_option}} block with our dynamically generated content
    htmlContent = htmlContent.replace(
      /{{#each_discount_option}}[\s\S]*?{{\/each_discount_option}}/g,
      eachDiscountContent,
    );
  } else {
    // If no discount values, remove the entire each_discount_option block
    htmlContent = htmlContent.replace(
      /{{#each_discount_option}}[\s\S]*?{{\/each_discount_option}}/g,
      "",
    );
  }

  // Handle conditional blocks with #if statements
  const ifRegex = /{{#if ([^}]+)}}([\s\S]*?){{\/if}}/g;
  let match;
  while ((match = ifRegex.exec(htmlContent)) !== null) {
    const condition = match[1];
    const content = match[2];

    // Check if condition evaluates to true
    let replaceWith = "";
    if (condition.includes("option_1_")) {
      // Single option conditions
      replaceWith = content;
    } else if (
      condition.match(/option_\d+_isPopular/) &&
      condition.includes("true")
    ) {
      // Popular badge - keep for first discount option
      replaceWith = content;
    } else if (condition.match(/option_\d+_has_special_gift/)) {
      // No special gifts in this implementation
      replaceWith = "";
    } else if (condition.match(/option_\d+_message/)) {
      // Messages
      replaceWith = "";
    }

    // Replace the whole if block with the content or empty string
    htmlContent = htmlContent.replace(match[0], replaceWith);
  }

  return htmlContent;
}

/**
 * Processes HTML template by replacing placeholders with dynamic discount values
 * @param params - Template processing parameters
 * @returns Processed HTML content string
 */
export function processBogoTemplate(params: ProcessTemplateParams): string {
  const {
    block_title,
    block,
    discountValues,
    optionStyles,
    productId,
    handle,
    prices,
    product,
    blockTitleColor,
    blockTitleFontSize,
    blockTitleStyle,
    symbol,
  } = params;

  // Start with general replacements
  let htmlContent = block.html_content
    .replace(/{{product_id}}/g, productId)
    .replace(/{{cart_add_url}}/g, `/cart/add`)
    .replace(/{{variant_id}}/g, prices[0]?.variantId?.split("/").pop() || "")
    .replace(/{{product_handle}}/g, handle || "")
    .replace(/{{block_title}}/g, block_title)
    .replace(/{{blockTitleColor}}/g, blockTitleColor || "")
    .replace(/{{blockTitleFontSize}}/g, blockTitleFontSize || "")
    .replace(/{{blockTitleFontStyle}}/g, blockTitleStyle || "")
    .replace(/{{currency_symbol}}/g, symbol || "")
    .replace(/{{block_id}}/g, Math.floor(Math.random() * 1000000).toString());

  // Process dynamic discount options
  if (discountValues && discountValues.length > 0) {
    // Create a dynamic section for each discount option
    let eachDiscountContent = "";

    discountValues.forEach((discount, index) => {
      // Replace index with actual number (2, 3, 4, etc.) since option 1 is reserved for single item
      const optionIndex = index + 2;

      // Create a chunk for this specific discount option with all its properties
      let optionContent =
        htmlContent.match(
          /{{#each_discount_option}}([\s\S]*?){{\/each_discount_option}}/,
        )?.[1] || "";

      if (optionContent) {
        // Replace all option_{{index}} placeholders with the actual index
        optionContent = optionContent.replace(
          /option_{{index}}/g,
          `option_${optionIndex}`,
        );

        // Get the corresponding style for this discount option
        const correspondingStyle = optionStyles[index] || optionStyles[0] || {};

        // Replace the rest of the placeholders with actual values
        optionContent = optionContent
          .replace(/{{index}}/g, index.toString())
          .replace(
            new RegExp(`{{option_${optionIndex}_title}}`, "g"),
            `${discount.title}`,
          )
          .replace(
            new RegExp(`{{option_${optionIndex}_subtitle}}`, "g"),
            `${discount.subtitle}`,
          )
          .replace(new RegExp(`{{option_${optionIndex}_message}}`, "g"), "")
          .replace(
            new RegExp(`{{option_${optionIndex}_customerPays}}`, "g"),
            discount.customerPays?.toString() || "",
          )
          .replace(
            new RegExp(`{{option_${optionIndex}_baseTotal}}`, "g"),
            discount.baseTotal?.toString() || "",
          )
          .replace(
            new RegExp(`{{option_${optionIndex}_savePercentage}}`, "g"),
            discount.discountValue?.toString() || "0",
          )
          .replace(
            new RegExp(`{{option_${optionIndex}_badge}}`, "g"),
            discount.label
              ? discount.label.replace(
                  /{{saved_total}}/g,
                  `${discount.effectivePercentage?.toFixed(0)}%`,
                )
              : "",
          )
          .replace(
            new RegExp(`{{option_${optionIndex}_checked}}`, "g"),
            discount.default ? 'checked="checked"' : "",
          )
          .replace(
            new RegExp(`{{option_${optionIndex}_quantity}}`, "g"),
            discount.quantity?.toString() || "",
          )
          .replace(
            new RegExp(`{{option_${optionIndex}_total_quantity}}`, "g"),
            discount.quantity?.toString() || "",
          )
          .replace(
            new RegExp(`{{option_${optionIndex}_paid_quantity}}`, "g"),
            discount.buyQuantity?.toString() || "",
          )
          .replace(
            new RegExp(`{{option_${optionIndex}_free_quantity}}`, "g"),
            discount.getQuantity?.toString() || "",
          )
          .replace(
            new RegExp(`{{option_${optionIndex}_discount_code}}`, "g"),
            discount.discountCode || "",
          )
          .replace(
            new RegExp(`{{option_${optionIndex}_discount_name}}`, "g"),
            discount.title || `${discount.quantity} pack`,
          )
          .replace(new RegExp(`{{option_${optionIndex}_checked}}`, "g"), "")
          .replace(new RegExp(`{{option_${optionIndex}_disabled}}`, "g"), "")
          .replace(new RegExp(`{{option_${optionIndex}_ineligible}}`, "g"), "")
          .replace(
            new RegExp(`{{option_${optionIndex}_badgeStyle}}`, "g"),
            discount.badgeStyle || "",
          )
          .replace(
            new RegExp(`{{option_${optionIndex}_badgeText}}`, "g"),
            discount.badgeText || "",
          )
          .replace(
            new RegExp(`{{option_${optionIndex}_has_special_gift}}`, "g"),
            "false",
          )
          .replace(
            new RegExp(`{{option_${optionIndex}_base_product_image}}`, "g"),
            product?.image?.src || "",
          )
          .replace(
            new RegExp(`{{option_${optionIndex}_base_product_title}}`, "g"),
            product?.title || "",
          );

        // Apply style-specific replacements
        const styleReplacements: Record<string, string> = {
          badgeText: correspondingStyle.badgeText || "",
          borderColor: correspondingStyle.borderColor || "",
          cardsBackground: correspondingStyle.cardsBackground || "",
          labelText: correspondingStyle.labelText || "",
          labelBackground: correspondingStyle.labelBackground || "",
          cornerRadius: correspondingStyle.cornerRadius?.toString() || "",
          titleColor: correspondingStyle.titleColor || "",
          titleFontSize: correspondingStyle.titleFontSize?.toString() || "",
          titleFontStyle: correspondingStyle.titleFontStyle?.toString() || "",
          selectedBackground: correspondingStyle.selectedBackground || "",
          priceColor: correspondingStyle.priceColor || "",
          fullPriceColor: correspondingStyle.fullPriceColor || "",
          spacing: correspondingStyle.spacing?.toString() || "",
          subtitleColor: correspondingStyle.subtitleColor || "",
          subtitleFontSize:
            correspondingStyle.subtitleFontSize?.toString() || "",
          subtitleFontStyle:
            correspondingStyle.subtitleFontStyle?.toString() || "",
          labelFontSize: correspondingStyle.labelFontSize?.toString() || "",
          labelFontStyle: correspondingStyle.labelFontStyle?.toString() || "",
          badgeBackground: correspondingStyle.badgeBackground || "",
        };

        // Apply all style replacements
        Object.entries(styleReplacements).forEach(([key, value]) => {
          optionContent = optionContent.replace(
            new RegExp(`{{${key}}}`, "g"),
            value,
          );
        });

        eachDiscountContent += optionContent;
      }
    });

    // Replace the {{#each_discount_option}} block with our dynamically generated content
    htmlContent = htmlContent.replace(
      /{{#each_discount_option}}[\s\S]*?{{\/each_discount_option}}/g,
      eachDiscountContent,
    );
  } else {
    // If no discount values, remove the entire each_discount_option block
    htmlContent = htmlContent.replace(
      /{{#each_discount_option}}[\s\S]*?{{\/each_discount_option}}/g,
      "",
    );
  }

  // Handle conditional blocks with #if statements
  const ifRegex = /{{#if ([^}]+)}}([\s\S]*?){{\/if}}/g;
  let match;
  while ((match = ifRegex.exec(htmlContent)) !== null) {
    const condition = match[1];
    const content = match[2];

    // Check if condition evaluates to true
    let replaceWith = "";
    if (condition.includes("option_1_")) {
      // Single option conditions
      replaceWith = content;
    } else if (
      condition.match(/option_\d+_isPopular/) &&
      condition.includes("true")
    ) {
      // Popular badge - keep for first discount option
      replaceWith = content;
    } else if (condition.match(/option_\d+_has_special_gift/)) {
      // No special gifts in this implementation
      replaceWith = "";
    } else if (condition.match(/option_\d+_message/)) {
      // Messages
      replaceWith = "";
    }

    // Replace the whole if block with the content or empty string
    htmlContent = htmlContent.replace(match[0], replaceWith);
  }

  return htmlContent;
}

/**
 * Processes HTML template by replacing placeholders with dynamic discount values
 * @param params - Template processing parameters
 * @returns Processed HTML content string
 */
export function processDifferentTemplate(
  params: ProcessTemplateParams,
): string {
  const {
    block_title,
    block,
    discountValues,
    optionStyles,
    productId,
    handle,
    prices,
    product,
    blockTitleColor,
    blockTitleFontSize,
    blockTitleStyle,
    buttonborderColor,
    buttoncardsBackground,
    buttoncornerRadius,
    buttonSpacing,
    symbol,
  } = params;

  // Start with general replacements
  let htmlContent = block.html_content
    .replace(/{{product_id}}/g, productId)
    .replace(/{{cart_add_url}}/g, `/cart/add`)
    .replace(/{{variant_id}}/g, prices[0]?.variantId?.split("/").pop() || "")
    .replace(/{{product_handle}}/g, handle || "")
    .replace(/{{block_title}}/g, block_title)
    .replace(/{{blockTitleColor}}/g, blockTitleColor || "")
    .replace(/{{blockTitleFontSize}}/g, blockTitleFontSize || "")
    .replace(/{{blockTitleFontStyle}}/g, blockTitleStyle || "")
    .replace(/{{buttonborderColor}}/g, buttonborderColor || "")
    .replace(/{{buttoncardsBackground}}/g, buttoncardsBackground || "")
    .replace(/{{buttoncornerRadius}}/g, buttoncornerRadius || "")
    .replace(/{{buttonSpacing}}/g, buttonSpacing || "")
    .replace(/{{currency_symbol}}/g, symbol || "")
    .replace(/{{block_id}}/g, Math.floor(Math.random() * 1000000).toString());

  // Process dynamic discount options
  if (discountValues && discountValues.length > 0) {
    // Create a dynamic section for each discount option
    let eachDiscountContent = "";

    discountValues.forEach((discount, index) => {
      // Replace index with actual number (2, 3, 4, etc.) since option 1 is reserved for single item
      const optionIndex = index + 2;

      // Create a chunk for this specific discount option with all its properties
      let optionContent =
        htmlContent.match(
          /{{#each_discount_option}}([\s\S]*?){{\/each_discount_option}}/,
        )?.[1] || "";

      if (optionContent) {
        // Replace all option_{{index}} placeholders with the actual index
        optionContent = optionContent.replace(
          /option_{{index}}/g,
          `option_${optionIndex}`,
        );

        // Get the corresponding style for this discount option
        const correspondingStyle = optionStyles[index] || optionStyles[0] || {};

        // Replace the rest of the placeholders with actual values
        optionContent = optionContent
          .replace(/{{index}}/g, index.toString())
          .replace(
            new RegExp(`{{option_${optionIndex}_title}}`, "g"),
            `${discount.title}`,
          )
          .replace(
            new RegExp(`{{option_${optionIndex}_subtitle}}`, "g"),
            `${discount.subtitle}`,
          )
          .replace(new RegExp(`{{option_${optionIndex}_message}}`, "g"), "")
          .replace(
            new RegExp(`{{option_${optionIndex}_customerPays}}`, "g"),
            discount.customerPays?.toString() || "",
          )
          .replace(
            new RegExp(`{{option_${optionIndex}_baseTotal}}`, "g"),
            discount.baseTotal?.toString() || "",
          )
          .replace(
            new RegExp(`{{option_${optionIndex}_saveAmount}}`, "g"),
            discount.label
              ? discount.label.replace(
                  /{{saved_total}}/g,
                  `${symbol} ${Number(discount.discountAmount || 0).toFixed(2)}`,
                )
              : ``,
          )
          .replace(
            new RegExp(`{{option_${optionIndex}_checked}}`, "g"),
            discount.default ? 'checked="checked"' : "",
          )
          .replace(
            new RegExp(`{{option_${optionIndex}_quantity}}`, "g"),
            discount.quantity?.toString() || "",
          )
          .replace(
            new RegExp(`{{option_${optionIndex}_total_quantity}}`, "g"),
            discount.quantity?.toString() || "",
          )
          .replace(
            new RegExp(`{{option_${optionIndex}_paid_quantity}}`, "g"),
            discount.buyQuantity?.toString() || "",
          )
          .replace(
            new RegExp(`{{option_${optionIndex}_free_quantity}}`, "g"),
            discount.getQuantity?.toString() || "",
          )
          .replace(
            new RegExp(`{{option_${optionIndex}_discount_code}}`, "g"),
            discount.discountCode || "",
          )
          .replace(
            new RegExp(`{{option_${optionIndex}_discount_name}}`, "g"),
            discount.title || `${discount.quantity} pack`,
          )
          .replace(new RegExp(`{{option_${optionIndex}_checked}}`, "g"), "")
          .replace(new RegExp(`{{option_${optionIndex}_disabled}}`, "g"), "")
          .replace(new RegExp(`{{option_${optionIndex}_ineligible}}`, "g"), "")
          .replace(
            new RegExp(`{{option_${optionIndex}_badgeStyle}}`, "g"),
            discount.badgeStyle || "",
          )
          .replace(
            new RegExp(`{{option_${optionIndex}_badgeText}}`, "g"),
            discount.badgeText || "",
          )
          .replace(
            new RegExp(`{{option_${optionIndex}_has_special_gift}}`, "g"),
            "false",
          )
          .replace(
            new RegExp(`{{option_${optionIndex}_base_product_image}}`, "g"),
            product?.image?.src || "",
          )
          .replace(
            new RegExp(`{{option_${optionIndex}_base_product_title}}`, "g"),
            product?.title || "",
          );

        // Apply style-specific replacements
        const styleReplacements: Record<string, string> = {
          badgeText: correspondingStyle.badgeText || "",
          borderColor: correspondingStyle.borderColor || "",
          cardsBackground: correspondingStyle.cardsBackground || "",
          labelText: correspondingStyle.labelText || "",
          labelBackground: correspondingStyle.labelBackground || "",
          cornerRadius: correspondingStyle.cornerRadius?.toString() || "",
          titleColor: correspondingStyle.titleColor || "",
          titleFontSize: correspondingStyle.titleFontSize?.toString() || "",
          titleFontStyle: correspondingStyle.titleFontStyle?.toString() || "",
          selectedBackground: correspondingStyle.selectedBackground || "",
          priceColor: correspondingStyle.priceColor || "",
          fullPriceColor: correspondingStyle.fullPriceColor || "",
          spacing: correspondingStyle.spacing?.toString() || "",
          subtitleColor: correspondingStyle.subtitleColor || "",
          subtitleFontSize:
            correspondingStyle.subtitleFontSize?.toString() || "",
          subtitleFontStyle:
            correspondingStyle.subtitleFontStyle?.toString() || "",
          labelFontSize: correspondingStyle.labelFontSize?.toString() || "",
          labelFontStyle: correspondingStyle.labelFontStyle?.toString() || "",
          badgeBackground: correspondingStyle.badgeBackground || "",
        };

        // Apply all style replacements
        Object.entries(styleReplacements).forEach(([key, value]) => {
          optionContent = optionContent.replace(
            new RegExp(`{{${key}}}`, "g"),
            value,
          );
        });

        eachDiscountContent += optionContent;
      }
    });

    // Replace the {{#each_discount_option}} block with our dynamically generated content
    htmlContent = htmlContent.replace(
      /{{#each_discount_option}}[\s\S]*?{{\/each_discount_option}}/g,
      eachDiscountContent,
    );
  } else {
    // If no discount values, remove the entire each_discount_option block
    htmlContent = htmlContent.replace(
      /{{#each_discount_option}}[\s\S]*?{{\/each_discount_option}}/g,
      "",
    );
  }

  // Handle conditional blocks with #if statements
  const ifRegex = /{{#if ([^}]+)}}([\s\S]*?){{\/if}}/g;
  let match;
  while ((match = ifRegex.exec(htmlContent)) !== null) {
    const condition = match[1];
    const content = match[2];

    // Check if condition evaluates to true
    let replaceWith = "";
    if (condition.includes("option_1_")) {
      // Single option conditions
      replaceWith = content;
    } else if (
      condition.match(/option_\d+_isPopular/) &&
      condition.includes("true")
    ) {
      // Popular badge - keep for first discount option
      replaceWith = content;
    } else if (condition.match(/option_\d+_has_special_gift/)) {
      // No special gifts in this implementation
      replaceWith = "";
    } else if (condition.match(/option_\d+_message/)) {
      // Messages
      replaceWith = "";
    }

    // Replace the whole if block with the content or empty string
    htmlContent = htmlContent.replace(match[0], replaceWith);
  }

  return htmlContent;
}

// Helper function for date filtering
export function createDateFilter(
  timePeriod: string,
  field: "date",
  shopDomain: String | null,
): any {
  const now = new Date();
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  const createFilter = (dateCondition: any) => {
    const filter: any = {
      [field]: dateCondition,
    };

    if (shopDomain) {
      filter.shop_name = {
        equals: shopDomain,
      };
    }

    return filter;
  };

  switch (timePeriod) {
    case "today":
      return createFilter({
        gte: today,
        lt: tomorrow,
      });

    case "yesterday":
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      return createFilter({
        gte: yesterday,
        lt: today,
      });

    case "last7d":
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return createFilter({
        gte: sevenDaysAgo,
      });

    case "last30d":
      const thirtyDaysAgo = new Date(
        today.getTime() - 30 * 24 * 60 * 60 * 1000,
      );
      return createFilter({
        gte: thirtyDaysAgo,
      });

    case "thismonth":
      const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfNextMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        1,
      );
      return createFilter({
        gte: startOfThisMonth,
        lt: startOfNextMonth,
      });

    case "last90d":
      const ninetyDaysAgo = new Date(
        today.getTime() - 90 * 24 * 60 * 60 * 1000,
      );
      return createFilter({
        gte: ninetyDaysAgo,
      });

    case "last365d":
      const oneYearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
      return createFilter({
        gte: oneYearAgo,
      });

    case "lastmonth":
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return createFilter({
        gte: lastMonth,
        lt: thisMonth,
      });

    case "last12months":
      const twelveMonthsAgo = new Date(
        now.getFullYear() - 1,
        now.getMonth(),
        now.getDate(),
      );
      return createFilter({
        gte: twelveMonthsAgo,
      });

    case "lastyear":
      const lastYear = new Date(now.getFullYear() - 1, 0, 1);
      const thisYear = new Date(now.getFullYear(), 0, 1);
      return createFilter({
        gte: lastYear,
        lt: thisYear,
      });

    default:
      const defaultThirtyDaysAgo = new Date(
        today.getTime() - 30 * 24 * 60 * 60 * 1000,
      );
      return createFilter({
        gte: defaultThirtyDaysAgo,
      });
  }
}

// Helper function for getting Drawer Products
export function getDrawerProducts(
  allProducts: any,
  sources: any,
  productIds: any,
) {
  let drawerProducts = [];
  let matchedProducts = allProducts.filter((p: any) =>
    productIds.includes(p.id.replace("gid://shopify/Product/", "")),
  );

  if (
    sources.includes("bundle_specific_products") ||
    sources.includes("primary_specific_products")
  ) {
    drawerProducts = matchedProducts;
  }

  if (
    sources.includes("bundle_except_products") ||
    sources.includes("primary_except_products")
  ) {
    drawerProducts = allProducts.filter(
      (p: any) =>
        !productIds.includes(p.id.replace("gid://shopify/Product/", "")),
    );
  }
  return drawerProducts;
}
