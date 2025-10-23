let bundleId = null;
let bundleBooster = "";
let properties = {};
let chosenProducts = [];

document.addEventListener("DOMContentLoaded", function () {
  let main_container = document.getElementById(
    "free-bulk-add-to-cart-container",
  );
  if (!main_container) {
    console.error("Main container not found!");
    return;
  }

  const product_id = main_container.dataset.productId;
  const proxyUrl = `/apps/bundle?product_id=${product_id}`;

  fetch(proxyUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }
      return response.json();
    })
    .then((data) => {
      if (data.error) {
        main_container.innerHTML = `<p style="color: red;">Error: ${data.error}</p>`;
        return;
      }

      if (data.blockHtml) {
        main_container.innerHTML = data.blockHtml;
        bundleId = data.bundleid;
        bundleBooster = data.bundlebooster;
        ORDER_CONSTANTS = data.orderConstants;
        embed = data.embedValue;
        drawerProducts = data.DrawerProducts;
        Singleproduct = data.Singleproduct;

        if (embed === "disabled" || embed === "not_found") {
          main_container.style.display = "none";
        } else if (embed === "enabled") {
          main_container.style.display = "block";
        }
      }
    })
    .catch((err) => {
      console.error("Error fetching data from app proxy:", err);
    });
});

// Helper function to inject choose buttons
function injectChooseButtons() {
  const radioOptions = document.querySelectorAll(
    ".free-bulk-cart-form .radio-option_1, \
    .free-bulk-cart-form .radio-option_2, \
    .free-bulk-cart-form .radio-option_3, \
    .free-bulk-cart-form .radio-option_4, \
    .free-bulk-cart-form .radio-label_4_different",
  );

  if (radioOptions.length === 0) return false;

  // ---------- Create modal (once) ----------
  let modal = document.getElementById("custom-product-picker");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "custom-product-picker";
    modal.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.55);
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    `;

    modal.innerHTML = `
      <div style="background:#fff; border-radius:10px; width:50%; max-height:100%; overflow:auto; padding:20px; position:relative;">
        <h3 style="margin-top:0;">Select a Product</h3>
        <input type="text" id="product-search" placeholder="Search products..." 
          style="width:100%; padding:8px; margin-bottom:10px; border:1px solid #ccc; border-radius:5px;">
        <div id="product-list"></div>
        <button id="close-modal" style="position:absolute; top:10px; right:10px; background:none; border:none; font-size:22px; cursor:pointer;">×</button>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector("#close-modal").addEventListener("click", () => {
      modal.style.display = "none";
    });
  }

  // ---------- Render product list in modal ----------
  function renderProductList(targetButton) {
    const listContainer = modal.querySelector("#product-list");
    listContainer.innerHTML = "";

    drawerProducts.forEach((prod) => {
      const firstVariant = prod.variants?.edges?.[0]?.node;
      const price = firstVariant?.price || "N/A";

      const productDiv = document.createElement("div");
      productDiv.style.cssText = `
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 15px;
        border: 1px solid #eee;
        border-radius: 8px;
        padding: 10px;
        margin-bottom: 10px;
        box-shadow: 0 1px 4px rgba(0,0,0,0.05);
      `;

      const currency_symbol = getCurrencySymbol();

      const leftSide = document.createElement("div");
      leftSide.style.display = "flex";
      leftSide.style.alignItems = "center";
      leftSide.style.gap = "12px";

      const img = document.createElement("img");
      img.src = prod.featuredImage?.url || "";
      img.alt = prod.featuredImage?.altText || prod.title;
      img.style.width = "70px";
      img.style.height = "70px";
      img.style.objectFit = "cover";
      img.style.borderRadius = "6px";
      img.style.border = "1px solid #ddd";

      const infoDiv = document.createElement("div");
      const title = document.createElement("h4");
      title.textContent = prod.title;
      title.style.margin = "0 0 4px";
      title.style.fontSize = "16px";

      const priceTag = document.createElement("div");
      priceTag.textContent = `${currency_symbol} ${price}`;
      priceTag.style.color = "#333";
      priceTag.style.fontWeight = "bold";
      priceTag.style.marginBottom = "5px";

      const variantSelect = document.createElement("select");
      variantSelect.style.padding = "4px 6px";
      variantSelect.style.borderRadius = "5px";
      variantSelect.style.border = "1px solid #ccc";
      variantSelect.style.cursor = "pointer";

      prod.variants?.edges?.forEach((v) => {
        const opt = document.createElement("option");
        opt.value = v.node.id; // ✅ Full GID
        opt.textContent =
          v.node.title === "Default Title"
            ? `Default – ${currency_symbol} ${v.node.price}`
            : `${v.node.title} – ${currency_symbol} ${v.node.price}`;
        variantSelect.appendChild(opt);
      });

      infoDiv.appendChild(title);
      infoDiv.appendChild(priceTag);
      infoDiv.appendChild(variantSelect);

      leftSide.appendChild(img);
      leftSide.appendChild(infoDiv);

      const chooseBtn = document.createElement("button");
      chooseBtn.textContent = "Choose";
      chooseBtn.style.background = "#ff9900";
      chooseBtn.style.color = "#fff";
      chooseBtn.style.border = "none";
      chooseBtn.style.borderRadius = "6px";
      chooseBtn.style.padding = "8px 14px";
      chooseBtn.style.cursor = "pointer";
      chooseBtn.style.fontWeight = "bold";

      chooseBtn.addEventListener("click", () => {
        modal.style.display = "none";
        replaceChooseButton(targetButton, prod, variantSelect.value);
      });

      productDiv.appendChild(leftSide);
      productDiv.appendChild(chooseBtn);
      listContainer.appendChild(productDiv);
    });
  }

  // ---------- Replace Choose button with selected product row ----------
  function replaceChooseButton(button, product, selectedVariant) {
    const wrapper = document.createElement("div");
    wrapper.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 10px;
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 8px;
    background: #fafafa;
    width: fit-content;
  `;

    const variantNode = product.variants?.edges?.find(
      (v) => v.node.id === selectedVariant,
    )?.node;

    // Helper to normalize variant ID
    function normalizeVariantId(id) {
      if (!id) return null;
      if (typeof id !== "string") return String(id);
      const match = id.match(/(\d+)$/);
      return match ? match[1] : null;
    }

    chosenProducts.push({
      title: product.title,
      productId: product.id,
      variantId: normalizeVariantId(selectedVariant),
      price: parseFloat(variantNode?.price) || 0,
    });

    // Automatically select correct variant options on product page
    if (variantNode?.selectedOptions) {
      autoSelectVariantOptions(variantNode?.selectedOptions);
    }

    // Fetch currency symbol dynamically
    const currencySymbol = getCurrencySymbol();

    // ---------- UI elements for chosen product ----------
    const img = document.createElement("img");
    img.src = product.featuredImage?.url || "";
    img.alt = product.featuredImage?.altText || product.title;
    img.style.width = "55px";
    img.style.height = "55px";
    img.style.objectFit = "cover";
    img.style.borderRadius = "5px";
    img.style.border = "1px solid #ddd";

    const infoDiv = document.createElement("div");
    infoDiv.style.display = "flex";
    infoDiv.style.flexDirection = "column";

    const title = document.createElement("div");
    title.textContent = product.title;
    title.style.fontWeight = "bold";
    title.style.marginBottom = "3px";

    const variantSelect = document.createElement("select");
    variantSelect.style.padding = "3px 6px";
    variantSelect.style.borderRadius = "4px";
    variantSelect.style.border = "1px solid #ccc";
    variantSelect.style.cursor = "pointer";

    product.variants?.edges?.forEach((v) => {
      const opt = document.createElement("option");
      opt.value = v.node.id;
      opt.textContent =
        v.node.title === "Default Title"
          ? `Default – ${currencySymbol}${v.node.price}`
          : `${v.node.title} – ${currencySymbol}${v.node.price}`;
      if (v.node.id === selectedVariant) opt.selected = true;
      variantSelect.appendChild(opt);
    });

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "×";
    removeBtn.style.cssText = `
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: #999;
  `;
    removeBtn.addEventListener("click", () => {
      wrapper.replaceWith(button);
      button.textContent = "Choose";

      chosenProducts = chosenProducts.filter(
        (p) => p.variantId !== normalizeVariantId(selectedVariant),
      );

      if (parentOption) {
        recalculateOptionPrice(parentOption, currencySymbol);
      }
    });

    infoDiv.appendChild(title);
    infoDiv.appendChild(variantSelect);
    wrapper.appendChild(img);
    wrapper.appendChild(infoDiv);
    wrapper.appendChild(removeBtn);

    let parentOption = null;
    parentOption = button.closest(
      ".radio-option_1, .radio-option_2, .radio-option_3, .radio-option_4, .radio-label_4_different",
    );
    if (!parentOption) {
      const chooseContainer = button.closest(".choose-buttons-container");
      if (chooseContainer) {
        parentOption = chooseContainer.closest(
          ".radio-option_1, .radio-option_2, .radio-option_3, .radio-option_4, .radio-label_4_different",
        );
      }
    }

    if (!parentOption) {
      let node = button.parentElement;
      let maxLevels = 15;

      while (node && maxLevels > 0) {
        if (
          node.classList?.contains("radio-option_1") ||
          node.classList?.contains("radio-option_2") ||
          node.classList?.contains("radio-option_3") ||
          node.classList?.contains("radio-option_4") ||
          node.classList?.contains("radio-label_4_different")
        ) {
          parentOption = node;
          break;
        }
        node = node.parentElement;
        maxLevels--;
      }
    }

    button.replaceWith(wrapper);

    if (parentOption) {
      const optionPriceDiv = parentOption?.querySelector(
        ".option-price, .option-price_2",
      );

      if (optionPriceDiv) {
        if (!optionPriceDiv.dataset.basePrice) {
          const currentPriceText = optionPriceDiv.textContent
            .replace(currencySymbol, "")
            .trim();
          optionPriceDiv.dataset.basePrice = currentPriceText;
        }

        recalculateOptionPrice(parentOption, currencySymbol);
      }
    }

    // Handle variant change
    variantSelect.addEventListener("change", (e) => {
      const newVariantId = e.target.value;
      const newVariant = product.variants?.edges?.find(
        (v) => v.node.id === newVariantId,
      )?.node;

      if (newVariant) {
        const oldVariantId = normalizeVariantId(selectedVariant);
        const newVariantIdNormalized = normalizeVariantId(newVariantId);

        const index = chosenProducts.findIndex(
          (p) => p.variantId === oldVariantId,
        );
        if (index !== -1) {
          chosenProducts[index].variantId = newVariantIdNormalized;
          chosenProducts[index].price = parseFloat(newVariant.price) || 0;
        }

        selectedVariant = newVariantId;

        if (parentOption) {
          recalculateOptionPrice(parentOption, currencySymbol);
        }
      }
    });
  }

  // Helper function to recalculate option price based on base + chosen products
  function recalculateOptionPrice(parentOption, currencySymbol) {
    const optionPriceDiv = parentOption.querySelector(
      ".option-price, .option-price_2",
    );

    if (!optionPriceDiv) return;
    const basePrice = parseFloat(optionPriceDiv.dataset.basePrice) || 0;
    const chosenProductsTotal = chosenProducts.reduce((sum, product) => {
      return sum + (parseFloat(product.price) || 0);
    }, 0);
    const finalPrice = (basePrice + chosenProductsTotal).toFixed(2);
    optionPriceDiv.textContent = `${currencySymbol}${finalPrice}`;
  }

  // ---------- Search filter ----------
  modal.querySelector("#product-search").addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase();
    const items = modal.querySelectorAll("#product-list > div");
    items.forEach((item) => {
      item.style.display = item.textContent.toLowerCase().includes(term)
        ? "flex"
        : "none";
    });
  });

  // ---------- Create choose buttons ----------
  radioOptions.forEach((option) => {
    let radio, chooseContainer;

    if (option.classList.contains("radio-label_4_different")) {
      radio = option.previousElementSibling;
      chooseContainer = option.querySelector(".choose-buttons-container");
    } else {
      radio = option.querySelector('input[type="radio"]');
      chooseContainer = option.querySelector(".choose-buttons-container");
    }

    if (!radio || !chooseContainer) return;

    const quantity = parseInt(radio.dataset.totalQuantity || radio.value, 10);
    chooseContainer.innerHTML = "";

    if (quantity > 1) {
      for (let i = 0; i < quantity - 1; i++) {
        const btn = document.createElement("button");
        btn.textContent = "Choose";
        btn.type = "button";
        btn.className = "choose-btn-dynamic";
        btn.style.backgroundColor = "#000";
        btn.style.color = "#fff";
        btn.style.border = "1px solid #000";
        btn.style.borderRadius = "6px";
        btn.style.padding = "5px 10px";
        btn.style.cursor = "pointer";
        btn.style.marginBottom = "5px";

        btn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          radio.checked = true;
          radio.dispatchEvent(new Event("change", { bubbles: true }));
          renderProductList(btn);
          modal.style.display = "flex";
        });

        chooseContainer.appendChild(btn);
      }
    }

    radio.addEventListener("change", () => {
      document
        .querySelectorAll('input[type="radio"][name="quantity"]')
        .forEach((r) => {
          const parent = r.closest(
            ".radio-option_1, .radio-option_2, .radio-option_3, .radio-option_4, .radio-label_4_different",
          );
          const btnContainer = parent?.querySelector(
            ".choose-buttons-container",
          );
          if (btnContainer)
            btnContainer.style.display = r.checked ? "flex" : "none";
        });
    });
  });

  return true;
}

// Setup MutationObserver to watch for when the block loads (for variants)
function setupVariantBlockObserver() {
  let hasAdded = false;

  const observer = new MutationObserver((mutations) => {
    if (hasAdded) return;

    const radioOptions = document.querySelectorAll(
      ".radio-option_1, .radio-option_2, .radio-option_3, .radio-option_4, .radio-label_4_different",
    );

    const currency_symbol = getCurrencySymbol();

    if (radioOptions.length > 0 && Singleproduct) {
      let success = false;
      radioOptions.forEach((option) => {
        const variantsContainer = option.querySelector(".varaints-container");
        if (variantsContainer) {
          if (renderProductVariants(Singleproduct, option, currency_symbol)) {
            success = true;
          }
        }
      });

      if (success) {
        hasAdded = true;
        observer.disconnect();
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

// Setup MutationObserver to watch for when the block loads
function setupBlockObserver() {
  let hasInjected = false;

  const observer = new MutationObserver((mutations) => {
    if (hasInjected) return;

    const blockContainer = document.getElementById(
      "free-bulk-add-to-cart-container",
    );

    if (blockContainer) {
      if (injectChooseButtons()) {
        hasInjected = true;
        observer.disconnect();
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

// Handle radio form submissions (styles 1, 3, 4)
document.addEventListener("DOMContentLoaded", function () {
  const currency_symbol = getCurrencySymbol();

  const renderAllVariants = () => {
    const radioOptions = document.querySelectorAll(
      ".radio-option_1, .radio-option_2, .radio-option_3, .radio-option_4, .radio-label_4_different",
    );

    let rendered = false;
    radioOptions.forEach((option) => {
      const variantsContainer = option.querySelector(".varaints-container");
      if (variantsContainer && Singleproduct) {
        if (renderProductVariants(Singleproduct, option, currency_symbol)) {
          rendered = true;
        } else {
          return;
        }
      }
    });

    return rendered;
  };

  if (!renderAllVariants()) {
    setupVariantBlockObserver();

    const delays = [100, 500, 1000, 2000];
    delays.forEach((delay) => {
      setTimeout(() => {
        renderAllVariants();
      }, delay);
    });
  }

  if (!injectChooseButtons()) {
    setupBlockObserver();

    const delays = [100, 500, 1000, 2000];
    delays.forEach((delay) => {
      setTimeout(() => {
        const buttons = document.querySelectorAll(".choose-btn-dynamic");
        if (buttons.length === 0) injectChooseButtons();
      }, delay);
    });
  }

  const addToCartBtn =
    document.querySelector(".product-form__submit") ||
    document.querySelector("add-to-cart-component");
  const buyNowBtn =
    document.querySelector(".shopify-payment-button button") ||
    document.querySelector("shopify-buy-it-now-button");

  // ---- Native Add to Cart override ----
  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", async (event) => {
      const selectedRadio = document.querySelector(
        '.free-bulk-cart-form input[type="radio"]:checked',
      );

      if (!selectedRadio) return;

      event.preventDefault();

      let variantId = document.querySelector(
        '.free-bulk-cart-form input[name="id"]',
      )?.value;

      const targetQuantity = parseInt(selectedRadio.value, 10);

      if (
        selectedRadio.disabled ||
        selectedRadio
          .closest(
            ".radio-option_1, .radio-option_2, .radio-option_3, .radio-option_4, .radio-label_4_different",
          )
          ?.classList.contains("ineligible")
      ) {
        return;
      }

      let properties = {};
      if (selectedRadio) {
        const label = document.querySelector(
          `label[for="${selectedRadio.id}"]`,
        );

        function parsePrice(str) {
          if (!str) return 0.0;
          const match = str.match(/(\d+(\.\d+)?)/);
          return match ? parseFloat(parseFloat(match[0]).toFixed(2)) : 0.0;
        }

        if (label) {
          const savingBadgeRaw =
            label?.querySelector("span.saving-badge")?.innerText.trim() || "";
          const optionPriceRaw =
            label?.querySelector("div.option-price")?.innerText.trim() || "";
          const optionSavingsRaw =
            label?.querySelector("div.option-savings")?.innerText.trim() || "";

          const savingBadge = parsePrice(savingBadgeRaw);
          const optionPrice = parsePrice(optionPriceRaw);
          const optionSavings = parsePrice(optionSavingsRaw);

          properties = {
            [ORDER_CONSTANTS.BUNDLE_ID]: bundleId,
            [ORDER_CONSTANTS.BUNDLE_BOOSTER]: bundleBooster,
            savingBadge,
            optionPrice,
            optionSavings,
          };
        }
      }

      try {
        // Do normal addition in cart if no chosen products present
        if (chosenProducts.length === 0) {
          const itemsToAdd = [
            {
              id: variantId,
              quantity: targetQuantity,
              properties: {
                _bundle_booster: properties,
              },
              attributes: {
                booster: bundleBooster || "",
              },
            },
          ];

          // ✅ Merge duplicates before sending
          const mergedItems = Object.values(
            itemsToAdd.reduce((acc, item) => {
              const key = item.id;
              if (!acc[key]) acc[key] = { ...item };
              else acc[key].quantity += item.quantity;
              return acc;
            }, {}),
          );

          // 🧾 Send to Shopify
          const response = await fetch("/cart/add.js", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({ items: mergedItems }),
          });

          const responseText = await response.text();
          if (responseText.includes("sold out")) {
            const popup = document.getElementById("soldOutPopup");
            popup.classList.add("active");

            document
              .getElementById("closeSoldOutPopup")
              .addEventListener("click", () =>
                popup.classList.remove("active"),
              );

            return;
          }
          if (!response.ok) {
            console.error("Shopify cart/add.js response:", responseText);
            throw new Error(`Failed to add to cart: ${responseText}`);
          }

          const responseData = JSON.parse(responseText);

          // Apply discount code if any
          const discountCode = selectedRadio.dataset.discountCode;
          if (
            discountCode &&
            discountCode !== "undefined" &&
            discountCode !== ""
          ) {
            await applyDiscountCode(discountCode);
          }

          document.documentElement.dispatchEvent(
            new CustomEvent("cart:item-added", {
              detail: { variant: responseData, newQuantity: targetQuantity },
            }),
          );

          await updateCartUI();
          await updateCartDrawerAndOpen();

          chosenProducts = [];
        }

        // Add chosen products (extra items)
        if (chosenProducts.length > 0) {
          const itemsToAdd = [
            {
              id: variantId,
              quantity: targetQuantity - 1,
              properties: {
                _bundle_booster: properties,
              },
              attributes: {
                booster: bundleBooster || "",
              },
            },
          ];
          chosenProducts.forEach((prod) => {
            itemsToAdd.push({
              id: prod.variantId,
              quantity: 1,
              properties: {
                _bundle_booster: properties,
              },
              attributes: {
                booster: bundleBooster || "",
              },
            });
          });

          // ✅ Merge duplicates before sending
          const mergedItems = Object.values(
            itemsToAdd.reduce((acc, item) => {
              const key = item.id;
              if (!acc[key]) acc[key] = { ...item };
              else acc[key].quantity += item.quantity;
              return acc;
            }, {}),
          );

          // 🧾 Send to Shopify
          const response = await fetch("/cart/add.js", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({ items: mergedItems }),
          });

          const responseText = await response.text();
          if (responseText.includes("sold out")) {
            const popup = document.getElementById("soldOutPopup");
            popup.classList.add("active");

            document
              .getElementById("closeSoldOutPopup")
              .addEventListener("click", () =>
                popup.classList.remove("active"),
              );

            return;
          }
          if (!response.ok) {
            console.error("Shopify cart/add.js response:", responseText);
            throw new Error(`Failed to add to cart: ${responseText}`);
          }

          const responseData = JSON.parse(responseText);

          // Apply discount code if any
          const discountCode = selectedRadio.dataset.discountCode;
          if (
            discountCode &&
            discountCode !== "undefined" &&
            discountCode !== ""
          ) {
            await applyDiscountCode(discountCode);
          }

          document.documentElement.dispatchEvent(
            new CustomEvent("cart:item-added", {
              detail: { variant: responseData, newQuantity: targetQuantity },
            }),
          );

          await updateCartUI();
          await updateCartDrawerAndOpen();

          chosenProducts = [];
        }
      } catch (error) {
        console.error("Error adding to cart:", error);
      }
    });
  }

  // ---- Buy Now override ----
  if (buyNowBtn) {
    buyNowBtn.addEventListener("click", async (event) => {
      const selectedRadio = document.querySelector(
        '.free-bulk-cart-form input[type="radio"]:checked',
      );

      if (!selectedRadio) return;

      event.preventDefault();

      if (chosenProducts.length === 0) {
        const popup = document.getElementById("emptyPopUp");
        popup.classList.add("active");

        document
          .getElementById("closeemptyPopUp")
          .addEventListener("click", () => popup.classList.remove("active"));

        return;
      }

      const form = selectedRadio.closest("form");
      const variantId = form.querySelector("input[name='id']").value;
      const targetQuantity = parseInt(selectedRadio.value, 10);

      try {
        await fetch("/cart/update.js", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            updates: {
              id: variantId,
              quantity: targetQuantity,
            },
            properties: {
              _bundle_booster: properties,
            },
            attributes: {
              booster: bundleBooster,
            },
          }),
        });

        const discountCode = selectedRadio.dataset.discountCode;
        if (
          discountCode &&
          discountCode !== "undefined" &&
          discountCode !== ""
        ) {
          await fetch(`/discount/${encodeURIComponent(discountCode)}`);
        }

        window.location.href = "/checkout";
      } catch (error) {
        console.error("Error handling Buy Now:", error);
        alert("Error with Buy Now. Please try again.");
      }
    });
  }
});

// Helper function to apply discount codes
async function applyDiscountCode(code) {
  try {
    const response = await fetch("/discount/" + encodeURIComponent(code), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to apply discount code");
    }

    return true;
  } catch (error) {
    console.warn("Discount code application failed:", error);
    return false;
  }
}

// Helper function to update cart UI
async function updateCartUI() {
  try {
    const cartResponse = await fetch("/cart.js");
    const cartData = await cartResponse.json();

    // Update cart count in the header
    const cartIcon =
      document.querySelector("#cart-icon-bubble") ||
      document.querySelector("cart-icon");
    if (cartIcon) {
      const cartCount = cartIcon.querySelector(
        ".cart-count, [data-cart-count]",
      );
      if (cartCount) {
        cartCount.textContent = cartData.item_count;
      }
    }

    // Trigger cart updated event
    document.documentElement.dispatchEvent(
      new CustomEvent("cart:updated", {
        detail: cartData,
      }),
    );

    // Update button eligibility states after cart change
    updateButtonEligibility(cartData);

    return cartData;
  } catch (error) {
    console.error("Failed to update cart UI:", error);
    throw error;
  }
}

// New function to update cart drawer content and open it
async function updateCartDrawerAndOpen() {
  const cartDrawer =
    document.querySelector("cart-drawer") ||
    document.querySelector("cart-notification") ||
    document.querySelector("cart-drawer-component") ||
    document.querySelector('[id*="cart-notification"]') ||
    document.querySelector('[class*="drawer"]');

  if (cartDrawer) {
    try {
      // Fetch fresh page content to get updated cart drawer
      const response = await fetch(window.location.href, {
        headers: {
          Accept: "text/html",
        },
      });

      const html = await response.text();
      const parser = new DOMParser();
      const newDoc = parser.parseFromString(html, "text/html");

      // Update the cart drawer content
      const newCartDrawer =
        newDoc.querySelector("cart-drawer") ||
        newDoc.querySelector("cart-notification") ||
        newDoc.querySelector("cart-drawer-component") ||
        newDoc.querySelector('[id*="cart-notification"]') ||
        newDoc.querySelector('[class*="drawer"]');
      if (newCartDrawer) {
        const currentDrawerInner =
          cartDrawer.querySelector("#cart-notification-product") ||
          cartDrawer.querySelector('[class*="drawer__inner"]');
        const newDrawerInner =
          newCartDrawer.querySelector("#cart-notification-product") ||
          newCartDrawer.querySelector('[class*="drawer__inner"]');

        if (currentDrawerInner && newDrawerInner) {
          currentDrawerInner.innerHTML = newDrawerInner.innerHTML;

          // Only check .is-empty for drawer themes
          if (newDrawerInner.classList.contains("is-empty")) {
            currentDrawerInner.classList.add("is-empty");
          } else {
            currentDrawerInner.classList.remove("is-empty");
          }

          if (!currentDrawerInner.classList.contains("is-empty")) {
            cartDrawer.classList.remove("is-empty");
          }
        }
      }

      // Update cart icon
      const currentCartIcon =
        document.querySelector("#cart-icon-bubble") ||
        document.querySelector("cart-icon");
      const newCartIcon =
        newDoc.querySelector("#cart-icon-bubble") ||
        newDoc.querySelector("cart-icon");
      if (currentCartIcon && newCartIcon) {
        const cartIconContent = newCartIcon.innerHTML;
        if (currentCartIcon.innerHTML !== cartIconContent) {
          currentCartIcon.innerHTML = cartIconContent;
        }
      }

      // Open cart drawer
      setTimeout(() => {
        try {
          if (cartDrawer && typeof cartDrawer.open === "function") {
            cartDrawer.open();
          }
        } catch (error) {
          console.warn("Could not open cart drawer:", error);
          // Fallback: click cart icon to open drawer
          const cartIcon =
            document.querySelector("#cart-icon-bubble") ||
            document.querySelector("cart-icon");
          if (cartIcon) {
            cartIcon.click();
          }
        }
      }, 300);
    } catch (error) {
      console.error("Error refreshing cart drawer:", error);
      // Fallback: try to open cart drawer anyway
      setTimeout(() => {
        const cartIcon = document.querySelector("#cart-icon-bubble");
        document.querySelector("cart-icon");
        if (cartIcon) cartIcon.click();
      }, 300);
    }
  }
}

// Function to update button eligibility
function updateButtonEligibility(cart) {
  // Radio forms eligibility update
  document
    .querySelectorAll(".radio-option_1, .radio-option_3, .radio-option_4")
    .forEach((option) => {
      const radio = option.querySelector('input[type="radio"]');
      if (radio) {
        const variantId = radio
          .closest("form")
          .querySelector('input[name="id"]').value;
        const targetQuantity = parseInt(radio.value, 10);

        // Find current quantity in cart
        let currentQuantity = 0;
        const cartItem = cart.items.find(
          (item) => item.variant_id.toString() === variantId,
        );
        if (cartItem) {
          currentQuantity = cartItem.quantity;
        }

        // Update eligibility
        const isEligible = currentQuantity !== targetQuantity;

        if (isEligible) {
          option.classList.remove("ineligible");
          option.classList.add("eligible");
          radio.disabled = false;

          // Remove eligibility message
          const eligibilityMsg = option.querySelector(".eligibility-message");
          if (eligibilityMsg) {
            eligibilityMsg.remove();
          }
        } else {
          option.classList.remove("eligible");
          option.classList.add("ineligible");
          radio.disabled = true;

          // Add eligibility message if not present
          if (!option.querySelector(".eligibility-message")) {
            const messageDiv = document.createElement("div");
            messageDiv.className = "eligibility-message";
            messageDiv.textContent = `Already in cart (${currentQuantity})`;
            option.appendChild(messageDiv);
          }
        }
      }
    });
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
  fetch("/cart.js")
    .then((response) => response.json())
    .then((cart) => {
      updateButtonEligibility(cart);
    })
    .catch((error) => {
      console.error("Error initializing cart state:", error);
    });
});

document.addEventListener("DOMContentLoaded", function () {
  const buttons = document.querySelectorAll(
    ".quantity-button:not(.ineligible)",
  );

  buttons.forEach((button) => {
    button.addEventListener("click", function () {
      document.querySelectorAll(".quantity-button").forEach((btn) => {
        btn.classList.remove("selected");
      });

      this.classList.add("selected");

      const quantity = this.dataset.totalQuantity;
      const variantId = document.querySelector('[name="id"]').value;

      if (this.dataset.discountCode) {
      }
    });
  });

  // Initialize by selecting the first eligible button
  const firstEligible = document.querySelector(
    ".quantity-button:not(.ineligible)",
  );
  if (firstEligible) {
    firstEligible.classList.add("selected");
  }
});

// Helper to hide content
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".product-option").forEach((option) => {
    const label = option.querySelector("dt");
    if (label && label.textContent.trim().toLowerCase() === "bundle_id:") {
      option.style.display = "none";
    }
  });
});

// Helper to hide saving-badge
document.addEventListener("DOMContentLoaded", () => {
  const hideSaveBadge = () => {
    const radioOptions = document.querySelectorAll(
      ".free-bulk-cart-form .radio-option_1, \
       .free-bulk-cart-form .radio-option_2, \
       .free-bulk-cart-form .radio-option_3, \
       .free-bulk-cart-form .radio-option_4, \
       .free-bulk-cart-form .radio-label_4_different",
    );

    if (radioOptions.length === 0) return;

    radioOptions.forEach((radioOption) => {
      const radio = radioOption.querySelector('input[type="radio"]');
      if (!radio) return;

      const quantity = parseInt(radio.dataset.totalQuantity || radio.value, 10);
      const saveBadge = radioOption.querySelector(
        ".saving-badge, .saving-badge_2, .saving-badge_4",
      );

      if (saveBadge) {
        saveBadge.style.display = quantity === 1 ? "none" : "flex";
      }
    });
  };

  // Run immediately once DOM is loaded
  hideSaveBadge();

  const observer = new MutationObserver(() => hideSaveBadge());
  observer.observe(document.body, { childList: true, subtree: true });
});

// Function to get the FieldSets
async function autoSelectVariantOptions(selectedOptions = []) {
  if (!Array.isArray(selectedOptions) || selectedOptions.length === 0) return;

  selectedOptions.forEach((opt) => {
    const optionName = opt.name.trim();
    const optionValue = opt.value.trim();

    const fieldset = Array.from(document.querySelectorAll("fieldset")).find(
      (fs) => {
        const legend = fs.querySelector("legend");
        return (
          legend &&
          legend.textContent.trim().toLowerCase() === optionName.toLowerCase()
        );
      },
    );

    if (fieldset) {
      const input = Array.from(
        fieldset.querySelectorAll("input[type='radio']"),
      ).find(
        (radio) =>
          radio.value.trim().toLowerCase() === optionValue.toLowerCase(),
      );

      if (input) input.click();
    }
  });
}

// Helper function to render Product Variants
async function renderProductVariants(product, parentElement, currencySymbol) {
  if (!product?.variants?.edges?.length || !parentElement) return false;

  const variantsContainer = parentElement.querySelector(".varaints-container");
  if (!variantsContainer) return false;

  // Initially hidden until its radio is selected
  variantsContainer.style.display = "none";

  const firstVariant = product.variants.edges[0].node;
  if (!firstVariant.selectedOptions?.length) return false;

  const radioInput = parentElement.querySelector('input[type="radio"]');
  const quantity = radioInput
    ? parseInt(radioInput.dataset.totalQuantity || radioInput.value, 10)
    : 1;

  // Clear any previous content
  variantsContainer.innerHTML = "";

  // --- FIXED Visibility toggle logic ---
  if (radioInput) {
    const toggleAllVariantVisibility = () => {
      // Hide all variant containers first
      const allVariantContainers = document.querySelectorAll(
        ".varaints-container",
      );
      allVariantContainers.forEach((vc) => (vc.style.display = "none"));

      // Find the checked radio and show its associated container
      const checkedRadio = document.querySelector(
        `input[type="radio"][name="${radioInput.name}"]:checked`,
      );
      if (checkedRadio) {
        // Find the parent radio option element that contains the variant container
        const radioOption = checkedRadio.closest(
          ".radio-option_1, .radio-option_2, .radio-option_3, .radio-option_4, .radio-label_4_different",
        );
        if (radioOption) {
          const container = radioOption.querySelector(".varaints-container");
          if (container) {
            container.style.display = "flex";
          }
        }
      }
    };

    // Set initial visibility
    toggleAllVariantVisibility();

    // Add event listeners to all radios in the same group
    const allRadios = document.querySelectorAll(
      `input[type="radio"][name="${radioInput.name}"]`,
    );
    allRadios.forEach((r) => {
      r.addEventListener("change", toggleAllVariantVisibility);
    });
  }
  // -------------------------------

  // Rest of your existing code for creating variant selects...
  firstVariant.selectedOptions.forEach((opt) => {
    const optionName = opt.name;

    const optionGroupWrapper = document.createElement("div");
    optionGroupWrapper.classList.add("option-group-wrapper");
    optionGroupWrapper.style.cssText = `margin-bottom: 16px;`;

    // Option label
    const label = document.createElement("label");
    label.textContent = optionName;
    label.style.cssText = `
      display: block;
      font-size: 14px;
      font-weight: 600;
      color: #333;
      margin-bottom: 6px;
    `;
    optionGroupWrapper.appendChild(label);

    // Collect unique values
    const uniqueValues = new Set();
    product.variants.edges.forEach((variantEdge) => {
      const selectedOpt = variantEdge.node.selectedOptions.find(
        (so) => so.name === optionName,
      );
      if (selectedOpt) uniqueValues.add(selectedOpt.value);
    });

    // Create selects for each quantity
    for (let i = 0; i < quantity; i++) {
      const selectWrapper = document.createElement("div");
      selectWrapper.style.cssText = `margin-bottom: 6px;`;

      const select = document.createElement("select");
      select.classList.add("variant-selector");
      select.dataset.optionName = optionName;
      select.dataset.productIndex = i;
      select.style.cssText = `
        padding: 8px 12px;
        border-radius: 4px;
        border: 1px solid #d1d5db;
        cursor: pointer;
        width: 100%;
        font-size: 14px;
        background-color: white;
        color: #333;
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 8px center;
        padding-right: 32px;
      `;

      uniqueValues.forEach((value) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });

      selectWrapper.appendChild(select);
      optionGroupWrapper.appendChild(selectWrapper);
    }

    variantsContainer.appendChild(optionGroupWrapper);
  });

  // Listen for variant changes
  const allSelects = variantsContainer.querySelectorAll(".variant-selector");
  allSelects.forEach((select) => {
    select.addEventListener("change", (e) => {
      const selectedValue = e.target.value;
      const optionName = e.target.dataset.optionName;

      // --- NEW LOGIC: Mirror other selects with same optionName ---
      const sameGroupSelects = variantsContainer.querySelectorAll(
        `.variant-selector[data-option-name="${optionName}"]`,
      );
      sameGroupSelects.forEach((s) => {
        if (s !== e.target) s.value = selectedValue;
      });

      // --- Keep total price consistent ---
      updateVariantPriceAndSelection(product, parentElement, currencySymbol);
    });
  });

  return true;
}

// Helper function to update price based on selected variant options
function updateVariantPriceAndSelection(
  product,
  parentElement,
  currencySymbol,
) {
  const variantsContainer = parentElement.querySelector(".varaints-container");
  if (!variantsContainer) return;

  // Collect all select elements and group them by productIndex
  const allSelects = variantsContainer.querySelectorAll(".variant-selector");

  // Determine how many products (quantities) exist
  const productIndexes = new Set();
  allSelects.forEach((s) =>
    productIndexes.add(parseInt(s.dataset.productIndex, 10)),
  );

  let totalVariantPriceDifference = 0;
  let allMatchingVariants = [];

  // For each product index (Product 1, Product 2, etc.)
  productIndexes.forEach((index) => {
    const selectedValues = {};
    // Gather all options for this product index
    allSelects.forEach((select) => {
      if (parseInt(select.dataset.productIndex, 10) === index) {
        const optionName = select.dataset.optionName;
        selectedValues[optionName] = select.value;
      }
    });

    // Find matching variant for this combination
    const matchingVariant = product.variants.edges.find((variantEdge) => {
      const variant = variantEdge.node;
      return variant.selectedOptions.every(
        (opt) => selectedValues[opt.name] === opt.value,
      );
    });

    if (matchingVariant) {
      allMatchingVariants.push(matchingVariant.node);

      // Handle pricing difference logic
      const optionPriceDiv =
        parentElement.querySelector(".option-price") ||
        parentElement.querySelector(".option-price_2");

      if (optionPriceDiv && !optionPriceDiv.dataset.firstVariantPrice) {
        const firstVariant = product.variants.edges[0].node;
        optionPriceDiv.dataset.firstVariantPrice = firstVariant.price;
      }

      const firstVariantPrice =
        parseFloat(
          optionPriceDiv?.dataset.firstVariantPrice ||
            product.variants.edges[0].node.price,
        ) || 0;
      const currentVariantPrice = parseFloat(matchingVariant.node.price) || 0;

      totalVariantPriceDifference += currentVariantPrice - firstVariantPrice;
    }
  });

  // Update the visible price
  const optionPriceDiv =
    parentElement.querySelector(".option-price") ||
    parentElement.querySelector(".option-price_2");

  if (optionPriceDiv) {
    // Store the original base price only once
    if (!optionPriceDiv.dataset.originalBasePrice) {
      const currentPriceText = optionPriceDiv.textContent
        .replace(currencySymbol, "")
        .trim();
      optionPriceDiv.dataset.originalBasePrice = currentPriceText;
    }

    const originalBasePrice =
      parseFloat(optionPriceDiv.dataset.originalBasePrice) || 0;

    const chosenProductsTotal = (window.chosenProducts || []).reduce(
      (sum, p) => sum + (parseFloat(p.price) || 0),
      0,
    );

    const finalPrice = (
      originalBasePrice +
      totalVariantPriceDifference +
      chosenProductsTotal
    ).toFixed(2);
    optionPriceDiv.textContent = `${currencySymbol}${finalPrice}`;
  }

  // Update hidden input with the first selected variant ID
  if (allMatchingVariants.length > 0) {
    const form = parentElement.closest("form");
    if (form) {
      let variantInput = form.querySelector('input[name="id"]');
      if (variantInput) {
        const numericId =
          allMatchingVariants[0].id.match(/\d+$/)?.[0] ||
          allMatchingVariants[0].id;
        variantInput.value = numericId;
      }
    }

    // Auto-select variant options on main product
    if (allMatchingVariants[0].selectedOptions) {
      autoSelectVariantOptions(allMatchingVariants[0].selectedOptions);
    }
  }
}

// Helper Function to get active currency symbol dynamically
function getCurrencySymbol() {
  const fromShopify =
    window.Shopify?.currency?.activeSymbol || window.Shopify?.currency?.symbol;
  if (fromShopify) return fromShopify.trim();

  const priceText = document.querySelector(".price-item")?.textContent?.trim();
  if (priceText) {
    const match = priceText.match(/^[^\d]+/);
    if (match) return match[0].trim();
  }

  return "$";
}
