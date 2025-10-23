import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting to seed block_styles');

  const blocks = [
    // Same Style 1 (radio; compatible with radio submit handler)
    {
      handle: 'same-ver-1',
      html_content: `
        <div class="free-bulk-add-to-cart-container_1" data-product-id="{{product_handle}}">
          <div class="content-container">
            <span class="line" style="background-color: {{blockTitleColor}}; flex: 1 !important; height: 1px !important;"></span>
              <p
                id="block_title_1"
                style="font-size: {{blockTitleFontSize}}px !important; font-weight: {{blockTitleFontStyle}} !important; color: {{blockTitleColor}} !important;"
              >
                {{block_title}}
              </p>
            <span class="line" style="background-color: {{blockTitleColor}}; flex: 1 !important; height: 1px !important;"></span>
          </div>

          <form class="free-bulk-cart-form" action="{{cart_add_url}}" method="post" enctype="multipart/form-data">
            <input type="hidden" name="id" value="{{variant_id}}">

            <div class="radio-options-container_1">
              {{#each_discount_option}}
                <div
                  class="radio-option_1 {{option_{{index}}_ineligible}}"
                  data-bg-default="{{cardsBackground}}"
                  data-bg-selected="{{selectedBackground}}"
                  style="border-color: {{borderColor}} !important; border-radius: {{cornerRadius}}px !important; padding: 16px; background-color: {{cardsBackground}} !important;"
                >
                  {{#if option_{{index}}_badgeStyle == 'most-popular'}}
                    <div
                      class="popular-badge"
                      style="color: {{badgeText}} !important; background-color: {{badgeBackground}} !important;"
                    >
                      {{option_{{index}}_badgeText}}
                    </div>
                  {{/if}}

                  <label for="bulk-option-{{index}}-{{block_id}}" class="radio-label_1">
                    <div class="option-content">
                      <div class="option-left">
                        <input
                          type="radio"
                          id="bulk-option-{{index}}-{{block_id}}"
                          name="quantity"
                          value="{{option_{{index}}_quantity}}"
                          data-discount-code="{{option_{{index}}_discount_code}}"
                          data-discount-name="{{option_{{index}}_discount_name}}"
                          {{option_{{index}}_checked}}
                          {{option_{{index}}_disabled}}
                        >
                        <h3 class="responsive_layout" style="color: {{titleColor}} !important; font-size: {{titleFontSize}}px !important; font-weight: {{titleFontStyle}} !important; padding-right: 10px; margin: 0; flex: 1 1 auto; min-width: 0;">
                          {{option_{{index}}_label}}
                        </h3>
                        <span
                          class="saving-badge"
                          style="background-color: {{labelBackground}} !important; border: 2px solid {{labelBackground}} !important; color: {{labelText}} !important; font-size: {{labelFontSize}}px !important; font-weight: {{labelFontStyle}} !important; width: auto !important; flex-shrink: 0; min-width: 70px; display: flex; align-items: center; justify-content: center; padding: 0 8px; box-sizing: border-box;"
                        >
                          {{option_{{index}}_savePercentage}}
                        </span>
                      </div>
                      <div class="option-right">
                        <div class="option-price" style="color: {{priceColor}} !important;">
                          {{currency_symbol}} {{option_{{index}}_customerPays}}
                        </div>
                        <div class="option-savings" style="color: {{fullPriceColor}} !important;">
                          {{currency_symbol}} {{option_{{index}}_baseTotal}}
                        </div>
                      </div>
                    </div>
                    <div
                      class="option-subtitle"
                      style="color: {{subtitleColor}} !important; font-size: {{subtitleFontSize}}px !important; font-weight: {{subtitleFontStyle}} !important; margin-left: 0 !important;"
                    >
                      {{option_{{index}}_subtitle}}
                    </div>
                    <div class="varaints-container"
                    style="padding-top: 15px !important; display: flex !important; flex-direction: row !important; width: fit-content !important; gap: 5px !important; display: none !important;"
                    >
                    </div>
                  </label>
                </div>
              {{/each_discount_option}}
            </div>
          </form>
        </div>
      `,
    },

    // Same Style 2 (radio)
    {
      handle: 'same-ver-2',
      html_content: `
        <div class="free-bulk-add-to-cart-container_2" data-product-id="{{product_handle}}">
          <div class="content-container">
            <span class="line" style="background-color: {{blockTitleColor}}; flex: 1 !important; height: 1px !important;"></span>  
              <p
                id="block_title_2"
                style="font-size: {{blockTitleFontSize}}px !important; font-weight: {{blockTitleFontStyle}} !important; color: {{blockTitleColor}} !important;"
              >
                {{block_title}}
              </p>
            <span class="line" style="background-color: {{blockTitleColor}}; flex: 1 !important; height: 1px !important;"></span>
          </div>

          <form class="free-bulk-cart-form" action="{{cart_add_url}}" method="post" enctype="multipart/form-data">
            <input type="hidden" name="id" value="{{variant_id}}">

            <div class="radio-options-container_2"
            style="display: grid !important; grid-template-columns: 1fr 1fr !important; grid-template-rows: 1fr 1fr !important;"
            >
              {{#each_discount_option}}
              <div
                class="radio-option_2 {{option_{{index}}_ineligible}}"
                data-bg-default="{{buttoncardsBackground}}"
                data-bg-selected="{{selectedBackground}}"
                style="border: 1px solid !important; background-color: {{buttoncardsBackground}} !important; border-color: {{buttonborderColor}} !important; border-radius: {{buttoncornerRadius}}px !important; padding: {{buttonSpacing}}px !important; position:relative !important;"
              >
                <!-- Badge at top -->
                <div
                  class="saving-badge_2"
                  style="background-color: {{labelBackground}} !important; border: 2px solid {{labelBackground}} !important; color: {{labelText}} !important; font-size: {{labelFontSize}}px !important; font-weight: {{labelFontStyle}} !important; border-radius: {{buttoncornerRadius}}px !important; width: 100% !important; flex-shrink: 0; min-width: 70px; display: flex; align-items: center; justify-content: center; padding: 2px 8px; box-sizing: border-box; position: absolute !important;"
                >
                  {{option_{{index}}_savePercentage}}
                </div>
                <input
                  type="radio"
                  id="bulk-option-{{index}}-{{block_id}}"
                  name="quantity"
                  value="{{option_{{index}}_quantity}}"
                  data-total-quantity="{{option_{{index}}_quantity}}"
                  data-paid-quantity="{{option_{{index}}_quantity}}"
                  data-discount-code="{{option_{{index}}_discount_code}}"
                  data-discount-name="{{option_{{index}}_discount_name}}"
                  {{option_{{index}}_disabled}}
                  {{option_{{index}}_checked}}
                  style="margin-top: 10px !important;"
                >
                <label for="bulk-option-{{index}}-{{block_id}}" class="radio-label_2">
                  <div class="option-content_2" style="padding: {{buttonSpacing}}px !important; display: flex; flex-direction: column; gap: 6px;">
                    <!-- Title + subtitle + eligibility -->
                    <div class="option-left_2" style="display: flex; flex-direction: column; gap: 2px;">
                      <h3 class="responsive_layout" style="color: {{titleColor}} !important; font-size: {{titleFontSize}}px !important; font-weight: {{titleFontStyle}} !important; margin: 0;">
                        {{option_{{index}}_label}}
                      </h3>
                      <div
                        class="option-subtitle_2"
                        style="color: {{subtitleColor}} !important; font-size: {{subtitleFontSize}}px !important; font-weight: {{subtitleFontStyle}} !important;"
                      >
                        {{option_{{index}}_subtitle}}
                      </div>
                      <div class="eligibility-message_2">{{option_{{index}}_message}}</div>
                    </div>

                    <!-- Price block aligned right -->
                    <div class="option-right_2" style="margin-top: auto;">
                      <div class="option-price_2" style="color: {{priceColor}} !important; font-size: 16px; font-weight: bold;">
                        {{currency_symbol}} {{option_{{index}}_customerPays}}
                      </div>
                      <div class="option-savings_2" style="color: {{fullPriceColor}} !important; text-decoration: line-through; font-size: 14px;">
                        {{currency_symbol}} {{option_{{index}}_baseTotal}}
                      </div>
                    </div>
                  </div>
                  <div class="varaints-container"
                  style="padding-top: 15px !important; display: flex !important; flex-direction: column !important; width: fit-content !important; gap: 0px !important; display: none !important;"
                  >
                  </div>
                </label>
              </div>
              {{/each_discount_option}}
            </div>
          </form>
        </div>
      `,
    },

    // Same Style 3 (radio)
    {
      handle: 'same-ver-3',
      html_content: `
        <div class="free-bulk-add-to-cart-container_3" data-product-id="{{product_handle}}">
          <div class="content-container" style="--divider-color: {{blockTitleColor}};">
            <span class="line" style="background-color: {{blockTitleColor}}; flex: 1 !important; height: 1px !important;"></span>
              <p
                id="block_title_3"
                style="font-size: {{blockTitleFontSize}}px !important; font-weight: {{blockTitleFontStyle}} !important; color: {{blockTitleColor}} !important;"
              >
                {{block_title}}
              </p>
            <span class="line" style="background-color: {{blockTitleColor}}; flex: 1 !important; height: 1px !important;"></span>
          </div>

          <form class="free-bulk-cart-form" action="{{cart_add_url}}" method="post" enctype="multipart/form-data">
            <input type="hidden" name="id" value="{{variant_id}}">

            <div class="radio-options-container_3">
              {{#each_discount_option}}
                <div
                  class="radio-option_3 {{option_{{index}}_ineligible}}"
                  data-bg-default="{{cardsBackground}}"
                  data-bg-selected="{{selectedBackground}}"
                  style="border-color: {{borderColor}} !important; background-color: {{cardsBackground}} !important; border-radius: {{cornerRadius}}px !important; padding: {{spacing}}px !important; width: 100% !important;"
                >
                  {{#if option_{{index}}_badgeStyle}}
                    <div
                      class="popular-badge_4"
                      style="color: {{badgeText}} !important; background-color: {{badgeBackground}} !important;"
                    >
                      {{option_{{index}}_badgeText}}
                    </div>
                  {{/if}}

                  <label for="free-option-{{index}}-{{block_id}}" class="radio-label_3">
                    <div class="option-content">
                      <div class="option-left-style-3"
                      style="gap: 15px !important;"
                      >
                        <input
                          type="radio"
                          id="bulk-option-{{index}}-{{block_id}}"
                          name="quantity"
                          value="{{option_{{index}}_quantity}}"
                          data-discount-code="{{option_{{index}}_discount_code}}"
                          data-discount-name="{{option_{{index}}_discount_name}}"
                          {{option_{{index}}_checked}}
                          {{option_{{index}}_disabled}}
                        >
                        <h3 class="responsive_layout" style="color: {{titleColor}} !important; font-size: {{titleFontSize}}px !important; font-weight: {{titleFontStyle}} !important; margin: 0; flex: 1 1 auto; min-width: 0;">
                          {{option_{{index}}_label}}
                        </h3>
                        <span
                          class="saving-badge"
                          style="background-color: {{labelBackground}} !important; border: 2px solid {{labelBackground}} !important; color: {{labelText}} !important; font-size: {{labelFontSize}}px !important; font-weight: {{labelFontStyle}} !important; width: auto !important; flex-shrink: 0; min-width: 70px; display: flex; align-items: center; justify-content: center; padding: 0 8px; box-sizing: border-box;"
                        >
                          {{option_{{index}}_savePercentage}}
                        </span>
                        <div class="eligibility-message">{{option_{{index}}_message}}</div>
                      </div>
                      <div class="option-right"
                      style="padding-left: 25px !important;"
                      >
                        <div class="option-price" style="color: {{priceColor}} !important;">
                          {{currency_symbol}} {{option_{{index}}_customerPays}}
                        </div>
                        <div class="option-savings" style="color: {{fullPriceColor}} !important; text-decoration: line-through;">
                          {{currency_symbol}} {{option_{{index}}_baseTotal}}
                        </div>
                      </div>
                    </div>
                    </label>
                    <div
                      class="option-subtitle"
                      style="color: {{subtitleColor}} !important; font-size: {{subtitleFontSize}}px !important; font-weight: {{subtitleFontStyle}} !important; margin-left: 0 !important;"
                    >
                      {{option_{{index}}_subtitle}}
                    </div>
                    <div class="varaints-container"
                    style="padding-top: 15px !important; display: flex !important; flex-direction: row !important; width: fit-content !important; gap: 5px !important; display: none !important;"
                    >
                    </div>
                </div>
              {{/each_discount_option}}
            </div>
          </form>
        </div>
      `,
    },

    // Same Style 4 (radio)
    {
      handle: 'same-ver-4',
      html_content: `
        <div class="free-bulk-add-to-cart-container_4" data-product-id="{{product_handle}}">
          <div class="content-container" style="--divider-color: {{blockTitleColor}};">
            <span class="line" style="background-color: {{blockTitleColor}}; flex: 1 !important; height: 1px !important;"></span>
              <p
                id="block_title_4"
                style="font-size: {{blockTitleFontSize}}px !important; font-weight: {{blockTitleFontStyle}} !important; color: {{blockTitleColor}} !important;"
              >
                {{block_title}}
              </p>
            <span class="line" style="background-color: {{blockTitleColor}}; flex: 1 !important; height: 1px !important;"></span>  
          </div>

          <form class="free-bulk-cart-form" action="{{cart_add_url}}" method="post" enctype="multipart/form-data">
            <input type="hidden" name="id" value="{{variant_id}}">

            <div class="radio-options-container_4"
            style="overflow-x: unset !important; overflow-y: unset !important; display: flex !important; flex-direction: row !important;" 
            >
              {{#each_discount_option}}
                <div
                  class="radio-option_4 {{option_{{index}}_ineligible}}"
                  data-bg-default="{{cardsBackground}}"
                  data-bg-selected="{{selectedBackground}}"
                  style="border-color: {{borderColor}} !important; border-radius: {{cornerRadius}}px !important;  background-color: {{cardsBackground}} !important;  min-width: 170px !important; height: auto !important;"
                >
                  <input
                    type="radio"
                    id="free-option-{{index}}-{{block_id}}"
                    name="quantity"
                    value="{{option_{{index}}_quantity}}"
                    data-total-quantity="{{option_{{index}}_quantity}}"
                    data-paid-quantity="{{option_{{index}}_quantity}}"
                    data-discount-code="{{option_{{index}}_discount_code}}"
                    data-discount-name="{{option_{{index}}_discount_name}}"
                    {{option_{{index}}_disabled}}
                    {{option_{{index}}_checked}}
                  >
                <label for="free-option-{{index}}-{{block_id}}" class="radio-label_4">
                  <div class="option-content_4" style="padding-left: {{spacing}}px !important; padding-right: {{spacing}}px !important; padding-bottom: {{spacing}}px !important; padding-top: 10px; !important;">
                    <div class="option-left_4">
                      <h3 class="responsive_layout" style="color: {{titleColor}} !important; font-size: {{titleFontSize}}px !important; font-weight: {{titleFontStyle}} !important; margin: 0; flex: 1 1 auto; min-width: 0;">
                        {{option_{{index}}_label}}
                      </h3>
                        <div
                          class="option-subtitle_4"
                          style="color: {{subtitleColor}} !important; font-size: {{subtitleFontSize}}px !important; font-weight: {{subtitleFontStyle}} !important;"
                          >
                          {{option_{{index}}_subtitle}}
                        </div>
                        <div
                          class="saving-badge_4"
                          style="background-color: {{labelBackground}} !important; border: 2px solid {{labelBackground}} !important; color: {{labelText}} !important; font-size: {{labelFontSize}}px !important; font-weight: {{labelFontStyle}} !important; border-radius: {{cornerRadius}}px !important; width: auto !important; flex-shrink: 0; min-width: 70px; box-sizing: border-box; transform: none !important; position: unset !important; justify-content: center !important;"
                        >
                          {{option_{{index}}_savePercentage}}
                        </div>
                        <div class="eligibility-message_4">{{option_{{index}}_message}}</div>
                      </div>
                      <div class="option-right_4">
                        <div class="option-price_4" style="color: {{priceColor}} !important; display: contents !important;">
                          {{currency_symbol}} {{option_{{index}}_customerPays}}
                        </div>
                        <div class="option-savings_4" style="color: {{fullPriceColor}} !important; text-decoration: line-through;">
                          {{currency_symbol}} {{option_{{index}}_baseTotal}}
                        </div>
                      </div>
                    </div>
                    <div class="varaints-container"
                    style="padding-top: 15px !important; padding-left: 18px !important; display: flex !important; flex-direction: column !important; width: fit-content !important; gap: 0px !important; display: none !important;"
                    >
                    </div>
                  </label>
                </div>
              {{/each_discount_option}}
            </div>
          </form>
        </div>
      `,
    },

    // Bogo Style 1 (radio)
    {
    handle: 'bogo-ver-1',
    html_content: `
    <div class="free-bulk-add-to-cart-container_1" id="free-bulk-add-to-cart-container"
        data-product-id="{{product_handle}}">
        <div class="content-container" style="--divider-color: {{blockTitleColor}};">
            <span class="line"
                style="background-color: {{blockTitleColor}}; flex: 1 !important; height: 1px !important;"></span>
            <p id="block_title_1"
                style="color: {{blockTitleColor}} !important; font-size: {{blockTitleFontSize}}px !important; font-weight: {{blockTitleFontStyle}} !important;">
                {{block_title}}
            </p>
            <span class="line"
                style="background-color: {{blockTitleColor}}; flex: 1 !important; height: 1px !important;"></span>
        </div>
        <form class="free-bulk-cart-form" action="{{cart_add_url}}" method="post" enctype="multipart/form-data">
            <input type="hidden" name="id" value="{{variant_id}}">
            <div class="radio-options-container_1">
                {{#each_discount_option}}
                <div class="radio-option_1 {{option_{{index}}_ineligible}} {{#if option_{{index}}_has_special_gift}}has-special-gift{{/if}}"
                    data-bg-default="{{cardsBackground}}"
                    data-bg-selected="{{selectedBackground}}"
                    style="border-color: {{borderColor}} !important;  background-color: {{cardsBackground}} !important; border-radius: {{cornerRadius}}px !important; padding: {{spacing}}px !important;"
                    >
                        {{#if option_{{index}}_message}}
                        <div class="eligibility-message">{{option_{{index}}_message}}</div>
                        {{/if}}
                    <label for="free-option-{{index}}-{{block_id}}" class="radio-label_1">
                        <div class="option-content">
                            <div class="option-left-bogo">
                                <input type="radio" id="free-option-{{index}}-{{block_id}}" name="quantity"
                                    value="{{option_{{index}}_quantity}}"
                                    data-total-quantity="{{option_{{index}}_total_quantity}}"
                                    data-paid-quantity="{{option_{{index}}_paid_quantity}}"
                                    data-free-quantity="{{option_{{index}}_free_quantity}}"
                                    data-discount-code="{{option_{{index}}_discount_code}}"
                                    data-discount-name="{{option_{{index}}_discount_name}}"
                                    {{option_{{index}}_disabled}} {{option_{{index}}_checked}}>
                                  <h3 class="responsive_layout" style="color: {{titleColor}} !important; font-size: {{titleFontSize}}px !important; font-weight: {{titleFontStyle}} !important; padding-right: 10px; margin: 0; flex: 1 1 auto; min-width: 0;">
                                    {{option_{{index}}_title}}
                                </h3>
                                <span class="saving-badge"
                                    style="background-color: {{labelBackground}} !important; border: 2px solid {{labelBackground}} !important; color: {{labelText}} !important; font-size: {{labelFontSize}}px !important; font-weight: {{labelFontStyle}} !important;">
                                    {{option_{{index}}_badge}}
                                </span>
                            </div>
                            <div class="option-right">
                                <div class="option-price" style="color: {{priceColor}} !important;">
                                    {{currency_symbol}} {{option_{{index}}_customerPays}}
                                </div>
                                <div class="option-savings" style="color: {{fullPriceColor}} !important;">
                                    {{currency_symbol}} {{option_{{index}}_baseTotal}}
                                </div>
                            </div>
                        </div>
                        <div class="option-subtitle_1"
                        style="color: {{subtitleColor}} !important; font-size: {{subtitleFontSize}}px !important; font-weight: {{subtitleFontStyle}} !important; margin-left: 38px;">
                        {{option_{{index}}_subtitle}}
                    </div>
                        {{#if option_{{index}}_has_special_gift}}
                        <span class="special-gift-badge_1">+ FREE special gift!</span>
                        {{/if}}
                    </label>
                </div>
                {{/each_discount_option}}
            </div>
        </form>
    </div>
    `,
    },

    // Bogo Style 2 (radio)
    {
      handle: 'bogo-ver-2',
      html_content: `
        <div class="free-bulk-add-to-cart-container_2" data-product-id="{{product_handle}}">
          <div class="content-container" style="--divider-color: {{blockTitleColor}};">
            <span class="line" style="background-color: {{blockTitleColor}}; flex: 1 !important; height: 1px !important;"></span>  
              <p
                id="block_title_2"
                style="font-size: {{blockTitleFontSize}}px !important; font-weight: {{blockTitleFontStyle}} !important; color: {{blockTitleColor}} !important;"
              >
                {{block_title}}
              </p>
            <span class="line" style="background-color: {{blockTitleColor}}; flex: 1 !important; height: 1px !important;"></span>
          </div>

          <form class="free-bulk-cart-form" action="{{cart_add_url}}" method="post" enctype="multipart/form-data">
            <input type="hidden" name="id" value="{{variant_id}}">

            <div class="radio-options-container_2"
            style="overflow: unset !important; display: grid !important; grid-template-columns: 1fr 1fr !important; grid-template-rows: 1fr 1fr !important;"
            >
              {{#each_discount_option}}
              <div
                class="radio-option_2 {{option_{{index}}_ineligible}} {{#if option_{{index}}_has_special_gift}}has-special-gift{{/if}}"
                data-bg-default="{{cardsBackground}}"
                data-bg-selected="{{selectedBackground}}"
                style="border: 1px solid {{borderColor}} !important;  background-color: {{cardsBackground}} !important; border-radius: {{cornerRadius}}px !important; padding: {{spacing}}px !important; position:relative !important;"
              >
              <input
              type="radio"
                  id="bulk-option-{{index}}-{{block_id}}"
                  style="margin-top: 10px !important; margin-bottom: 10px !important;"
                  name="quantity"
                  value="{{option_{{index}}_quantity}}"
                  data-total-quantity="{{option_{{index}}_total_quantity}}"
                  data-paid-quantity="{{option_{{index}}_paid_quantity}}"
                  data-free-quantity="{{option_{{index}}_free_quantity}}"
                  data-discount-code="{{option_{{index}}_discount_code}}"
                  data-discount-name="{{option_{{index}}_discount_name}}"
                  {{option_{{index}}_disabled}}
                  {{option_{{index}}_checked}}
                >
                <label for="bulk-option-{{index}}-{{block_id}}" class="radio-label_2">
                  <div class="option-content_2" style="display: flex; flex-direction: column; gap: 6px;">
                    
                    <!-- Left Section -->
                    <div class="option-left_2" style="display: flex; flex-direction: column; gap: 4px;">
                      <h3 style="color: {{titleColor}} !important; font-size: {{titleFontSize}}px !important; font-weight: {{titleFontStyle}} !important; margin: 0;">
                        {{option_{{index}}_title}}
                      </h3>
                      <span
                      class="saving-badge_3"
                      style="background-color: {{labelBackground}} !important; border: 2px solid {{labelBackground}} !important; color: {{labelText}} !important; font-size: {{labelFontSize}}px !important; font-weight: {{labelFontStyle}} !important; border-radius: {{buttoncornerRadius}}px !important; flex-shrink: 0; min-width: 70px; display: flex; align-items: center; justify-content: center; padding: 2px 8px; box-sizing: border-box;"
                      >
                        {{option_{{index}}_badge}}
                      </span>
                      <div
                        class="option-subtitle_2"
                        style="color: {{subtitleColor}} !important; font-size: {{subtitleFontSize}}px !important; font-weight: {{subtitleFontStyle}} !important;"
                      >
                        {{option_{{index}}_subtitle}}
                      </div>
                      {{#if option_{{index}}_message}}
                        <div class="eligibility-message_2">{{option_{{index}}_message}}</div>
                      {{/if}}
                    </div>

                    <!-- Right Section -->
                    <div class="option-right_2" style="margin-top: auto; display: flex !important; flex-direction: column !important; align-items: center !important;">
                      <div class="option-price_2" style="color: {{priceColor}} !important; font-size: 16px; font-weight: bold;">
                        {{currency_symbol}} {{option_{{index}}_customerPays}}
                      </div>
                      <div class="option-savings_2" style="color: {{fullPriceColor}} !important; text-decoration: line-through; font-size: 14px;">
                        {{currency_symbol}} {{option_{{index}}_baseTotal}}
                      </div>
                    </div>
                  </div>

                  {{#if option_{{index}}_has_special_gift}}
                    <span class="special-gift-badge_2">+ FREE special gift!</span>
                  {{/if}}
                </label>
              </div>
              {{/each_discount_option}}
            </div>
          </form>
        </div>
      `,
    },

    // Bogo Style 3 (radio)
    {
    handle: 'bogo-ver-3',
    html_content: `
    <div class="free-bulk-add-to-cart-container_3" id="free-bulk-add-to-cart-container"
        data-product-id="{{product_handle}}">
        <div class="content-container" style="--divider-color: {{blockTitleColor}};">
            <span class="line"
                style="background-color: {{blockTitleColor}}; flex: 1 !important; height: 1px !important;"></span>
            <p id="block_title_3"
                style="color: {{blockTitleColor}} !important; font-size: {{blockTitleFontSize}}px !important; font-weight: {{blockTitleFontStyle}} !important;">
                {{block_title}}
            </p>
            <span class="line"
                style="background-color: {{blockTitleColor}}; flex: 1 !important; height: 1px !important;"></span>
        </div>
        <form class="free-bulk-cart-form" action="{{cart_add_url}}" method="post" enctype="multipart/form-data">
            <input type="hidden" name="id" value="{{variant_id}}">
            <div class="radio-options-container_3">
                {{#each_discount_option}}
                <div class="radio-option_3 {{option_{{index}}_ineligible}} {{#if option_{{index}}_has_special_gift}}has-special-gift{{/if}}"
                  data-bg-default="{{cardsBackground}}"
                  data-bg-selected="{{selectedBackground}}"    
                  style="border-color: {{borderColor}} !important;  background-color: {{cardsBackground}} !important; border-radius: {{cornerRadius}}px !important; padding: {{spacing}}px; width: 100% !important;">
                    <label for="free-option-{{index}}-{{block_id}}" class="radio-label_3">
                        <div class="option-content">
                            <div class="option-left-bogo-3">
                                <input type="radio" id="free-option-{{index}}-{{block_id}}" name="quantity"
                                    value="{{option_{{index}}_quantity}}"
                                    data-total-quantity="{{option_{{index}}_total_quantity}}"
                                    data-paid-quantity="{{option_{{index}}_paid_quantity}}"
                                    data-free-quantity="{{option_{{index}}_free_quantity}}"
                                    data-discount-code="{{option_{{index}}_discount_code}}"
                                    data-discount-name="{{option_{{index}}_discount_name}}" {{option_{{index}}_disabled}}
                                    {{option_{{index}}_checked}}>
                                <h3
                                    style="color: {{titleColor}} !important; font-size: {{titleFontSize}}px !important; font-weight: {{titleFontStyle}} !important;">
                                    {{option_{{index}}_title}}
                                </h3>
                                <span class="saving-badge_3"
                                    style="background-color: {{labelBackground}} !important; border: 2px solid {{labelBackground}} !important; color: {{labelText}} !important; font-size: {{labelFontSize}}px !important; font-weight: {{labelFontStyle}} !important;">
                                    {{option_{{index}}_badge}}
                                </span>
                                {{#if option_{{index}}_message}}
                                <div class="eligibility-message">{{option_{{index}}_message}}</div>
                                {{/if}}
                            </div>
                            <div class="option-right"
                            style="padding-left: 30px !important;"
                            >
                                <div class="option-price" style="color: {{priceColor}} !important;">
                                    {{currency_symbol}} {{option_{{index}}_customerPays}}
                                </div>
                                <div class="option-savings" style="color: {{fullPriceColor}} !important;">
                                    {{currency_symbol}} {{option_{{index}}_baseTotal}}
                                </div>
                            </div>
                        </div>
                        {{#if option_{{index}}_has_special_gift}}
                        <span class="special-gift-badge_3">+ FREE special gift!</span>
                        {{/if}}
                    </label>
                    <div class="option-subtitle_3"
                        style="color: {{subtitleColor}} !important; font-size: {{subtitleFontSize}}px !important; font-weight: {{subtitleFontStyle}} !important; margin-left: 50px !important">
                        {{option_{{index}}_subtitle}}
                    </div>
                </div>
                {{/each_discount_option}}
            </div>
        </form>
    </div>
    `,
    },

    // Bogo Style 4 (radio)
    {
    handle: 'bogo-ver-4',
    html_content: `
    <div class="free-bulk-add-to-cart-container_4" id="free-bulk-add-to-cart-container"
        data-product-id="{{product_handle}}">
        <div class="content-container" style="--divider-color: {{blockTitleColor}};">
            <span class="line"
                style="background-color: {{blockTitleColor}}; flex: 1 !important; height: 1px !important;"></span>
            <p id="block_title_4"
                style="color: {{blockTitleColor}} !important; font-size: {{blockTitleFontSize}}px !important; font-weight: {{blockTitleFontStyle}} !important;">
                {{block_title}}
            </p>
            <span class="line"
                style="background-color: {{blockTitleColor}}; flex: 1 !important; height: 1px !important;"></span>
        </div>
        <form class="free-bulk-cart-form" action="{{cart_add_url}}" method="post" enctype="multipart/form-data">
            <input type="hidden" name="id" value="{{variant_id}}">
            <div class="radio-options-container_4"
            style="overflow-x: unset !important; overflow-y: unset !important; display: flex !important; flex-direction: row !important;"
            >
                {{#each_discount_option}}
                <div class="radio-option_4 {{option_{{index}}_ineligible}} {{#if option_{{index}}_has_special_gift}}has-special-gift{{/if}}"
                    data-bg-default="{{cardsBackground}}"
                    data-bg-selected="{{selectedBackground}}"
                    style="border-color: {{borderColor}} !important; border-radius: {{cornerRadius}}px !important; overflow: unset !important;  background-color: {{cardsBackground}} !important;">
                    <input type="radio" id="free-option-{{index}}-{{block_id}}" name="quantity"
                        value="{{option_{{index}}_quantity}}"
                        data-total-quantity="{{option_{{index}}_total_quantity}}"
                        data-paid-quantity="{{option_{{index}}_paid_quantity}}"
                        data-free-quantity="{{option_{{index}}_free_quantity}}"
                        data-discount-code="{{option_{{index}}_discount_code}}"
                        data-discount-name="{{option_{{index}}_discount_name}}" {{option_{{index}}_disabled}}
                        {{option_{{index}}_checked}}>
                    <label for="free-option-{{index}}-{{block_id}}" class="radio-label_4_bogo">
                        <div class="option-content_4" style="padding-left: {{spacing}}px !important; padding-right: {{spacing}}px !important; padding-bottom: {{spacing}}px !important; padding-top: 10px; !important;">
                            <div class="saving-badge_4"
                                style="background-color: {{labelBackground}} !important; border: 2px solid {{labelBackground}} !important; color: {{labelText}} !important; font-size: {{labelFontSize}}px !important; font-weight: {{labelFontStyle}} !important; border-radius: {{cornerRadius}}px !important; justify-content: center !important;">
                                {{option_{{index}}_badge}}
                            </div>
                            <div class="option-left_4">
                                <h3
                                    style="color: {{titleColor}} !important; font-size: {{titleFontSize}}px !important; font-weight: {{titleFontStyle}} !important;">
                                    {{option_{{index}}_title}}
                                </h3>
                                <div class="option-subtitle_4"
                                    style="color: {{subtitleColor}} !important; font-size: {{subtitleFontSize}}px !important; font-weight: {{subtitleFontStyle}} !important;">
                                    {{option_{{index}}_subtitle}}
                                </div>
                                {{#if option_{{index}}_message}}
                                <div class="eligibility-message_4">{{option_{{index}}_message}}</div>
                                {{/if}}
                            </div>
                            <div class="option-right_4"
                            style="display: flex !important; align-items: center !important; flex-direction: column !important;"
                            >
                                <div class="option-price_4" style="color: {{priceColor}} !important;">
                                    {{currency_symbol}} {{option_{{index}}_customerPays}}
                                </div>
                                <div class="option-savings_4" style="color: {{fullPriceColor}} !important; text-decoration: line-through !important;">
                                    {{currency_symbol}} {{option_{{index}}_baseTotal}}
                                </div>
                            </div>
                        </div>
                        {{#if option_{{index}}_has_special_gift}}
                        <span class="special-gift-badge_4">+ FREE special gift!</span>
                        {{/if}}
                    </label>
                </div>
                {{/each_discount_option}}
            </div>
        </form>
    </div>
    `,
    },

    // Different Style 1 (radio)
    {
      handle: 'different-ver-1',
      html_content: `
        <div class="free-bulk-add-to-cart-container_1" id="free-bulk-add-to-cart-container" data-product-id="{{product_handle}}">
          <div class="content-container" style="--divider-color: {{blockTitleColor}};">
            <span class="line" style="background-color: {{blockTitleColor}}; flex: 1 !important; height: 1px !important;"></span>
            <p
              id="block_title_1"
              style="color: {{blockTitleColor}} !important; font-size: {{blockTitleFontSize}}px !important; font-weight: {{blockTitleFontStyle}} !important;"
            >
              {{block_title}}
            </p>
            <span class="line" style="background-color: {{blockTitleColor}}; flex: 1 !important; height: 1px !important;"></span>
          </div>

          <form class="free-bulk-cart-form" action="{{cart_add_url}}" method="post" enctype="multipart/form-data">
            <input type="hidden" name="id" value="{{variant_id}}">

            <div class="radio-options-container_1"
            style="width: max-content !important;"
            >
              {{#each_discount_option}}
                <div
                  class="radio-option_1 {{option_{{index}}_ineligible}}"
                  data-bg-default="{{cardsBackground}}"
                  data-bg-selected="{{selectedBackground}}"
                  style="border-color: {{borderColor}} !important; border-radius: {{cornerRadius}}px !important; padding: {{spacing}}px !important; background-color: {{cardsBackground}} !important;"
                >
                  <label for="different-option-{{index}}-{{block_id}}" class="radio-label_1">
                    <div class="alignment">
                      <div class="option-content">
                        <div class="option-left-different">
                          <input
                            type="radio"
                            id="different-option-{{index}}-{{block_id}}"
                            name="quantity"
                            value="{{option_{{index}}_total_quantity}}"
                            data-total-quantity="{{option_{{index}}_total_quantity}}"
                            data-paid-quantity="{{option_{{index}}_paid_quantity}}"
                            data-discount-code="{{option_{{index}}_discount_code}}"
                            data-discount-name="{{option_{{index}}_discount_name}}"
                            {{option_{{index}}_disabled}}
                            {{option_{{index}}_checked}}
                          >
                          <div class="title-content" style="display: flex !important; flex-direction: column !important;">
                            <h3 class="responsive_layout" style="color: {{titleColor}} !important; font-size: {{titleFontSize}}px !important; font-weight: {{titleFontStyle}} !important; padding-right: 10px; margin: 0; flex: 1 1 auto; min-width: 0;">
                              {{option_{{index}}_title}}
                            </h3>
                            <p
                              class="option-subtitle"
                              style="color: {{subtitleColor}} !important; font-size: {{subtitleFontSize}}px !important; font-weight: {{subtitleFontStyle}} !important; margin-left: 0 !important;"
                            >
                              {{option_{{index}}_subtitle}}
                            </p>
                          </div>
                          <div class="eligibility-message_1">{{option_{{index}}_message}}</div>
                        </div>
                        <div class="option-right"
                        style="padding-left: 40px !important;"
                        >
                          <div class="option-price" style="color: {{priceColor}} !important;">
                            {{currency_symbol}} {{option_{{index}}_customerPays}}
                          </div>
                          <div class="option-savings" style="color: {{fullPriceColor}} !important;">
                            {{currency_symbol}} {{option_{{index}}_baseTotal}}
                          </div>
                        </div>
                      </div>
                      <div class="choose-buttons-container"
                      style="padding-top: 15px !important; display: flex !important; flex-direction: column !important; width: fit-content !important; gap: 5px !important; display: none !important;"
                      >
                      </div>
                    </div>
                  </label>
                </div>
              {{/each_discount_option}}
            </div>
          </form>
        </div>
        <!-- Sold Out Popup -->
        <div id="soldOutPopup" class="sold-out-popup">
          <div class="popup-content">
            <h3>🚫 Sold Out</h3>
            <p>Sorry, this product is currently out of stock and can’t be added to your cart.</p>
            <button id="closeSoldOutPopup">Okay</button>
          </div>
        </div>
      `,
    },

    // Different Style 2 (radio)
    {
      handle: 'different-ver-2',
      html_content: `
        <div class="free-bulk-add-to-cart-container_3" data-product-id="{{product_handle}}">
          <div class="content-container" style="--divider-color: {{blockTitleColor}};">
            <span class="line" style="background-color: {{blockTitleColor}}; flex: 1 !important; height: 1px !important;"></span>
              <p
                id="block_title_3"
                style="font-size: {{blockTitleFontSize}}px !important; font-weight: {{blockTitleFontStyle}} !important; color: {{blockTitleColor}} !important;"
              >
                {{block_title}}
              </p>
            <span class="line" style="background-color: {{blockTitleColor}}; flex: 1 !important; height: 1px !important;"></span>
          </div>

          <form class="free-bulk-cart-form" action="{{cart_add_url}}" method="post" enctype="multipart/form-data">
            <input type="hidden" name="id" value="{{variant_id}}">

            <div class="radio-options-container_3">
              {{#each_discount_option}}
                <div
                  class="radio-option_2 {{option_{{index}}_ineligible}}"
                  data-bg-default="{{cardsBackground}}"
                  data-bg-selected="{{selectedBackground}}"
                  style="border-color: {{borderColor}} !important;  background-color: {{cardsBackground}} !important; border-radius: {{cornerRadius}}px !important; padding: {{spacing}}px !important; width: 100% !important;"
                >
                  {{#if option_{{index}}_badgeStyle}}
                    <div
                      class="popular-badge_4"
                      style="color: {{badgeText}} !important; background-color: {{badgeBackground}} !important;"
                    >
                      {{option_{{index}}_badgeText}}
                    </div>
                  {{/if}}

                  <label for="different-option-{{index}}-{{block_id}}" class="radio-label_3">
                    <div class="option-content"
                    style="gap: 60px !important;"
                    >
                      <div class="option-left-style-3">
                        <input
                          type="radio"
                          id="different-option-{{index}}-{{block_id}}"
                          name="quantity"
                          value="{{option_{{index}}_total_quantity}}"
                          data-total-quantity="{{option_{{index}}_total_quantity}}"
                          data-paid-quantity="{{option_{{index}}_paid_quantity}}"
                          data-discount-code="{{option_{{index}}_discount_code}}"
                          data-discount-name="{{option_{{index}}_discount_name}}"
                          {{option_{{index}}_checked}}
                          {{option_{{index}}_disabled}}
                        >
                        <div class="title-content" style="display: flex !important; flex-direction: column !important;">
                          <h3 class="responsive_layout" style="color: {{titleColor}} !important; font-size: {{titleFontSize}}px !important; font-weight: {{titleFontStyle}} !important; margin: 0; flex: 1 1 auto; min-width: 0;">
                            {{option_{{index}}_title}}
                          </h3>
                          <p
                          class="option-subtitle"
                          style="color: {{subtitleColor}} !important; font-size: {{subtitleFontSize}}px !important; font-weight: {{subtitleFontStyle}} !important; margin-left: 0 !important;"
                          >
                            {{option_{{index}}_subtitle}}
                          </p>
                        </div>
                        <div class="eligibility-message_3">{{option_{{index}}_message}}</div>
                      </div>
                      <div class="option-right">
                        <div class="option-price" style="color: {{priceColor}} !important;">
                          {{currency_symbol}} {{option_{{index}}_customerPays}}
                        </div>
                        <div class="option-savings" style="color: {{fullPriceColor}} !important; text-decoration: line-through;">
                          {{currency_symbol}} {{option_{{index}}_baseTotal}}
                        </div>
                      </div>
                      </div>
                      <div class="choose-buttons-container"
                      style="padding-top: 15px !important; display: flex !important; flex-direction: column !important; width: fit-content !important; gap: 5px !important; display: none !important;"
                      >
                      </div>
                  </label>
                </div>
              {{/each_discount_option}}
            </div>
          </form>
        </div>
        <!-- Sold Out Popup -->
        <div id="soldOutPopup" class="sold-out-popup">
          <div class="popup-content">
            <h3>🚫 Sold Out</h3>
            <p>Sorry, this product is currently out of stock and can’t be added to your cart.</p>
            <button id="closeSoldOutPopup">Okay</button>
          </div>
        </div>
      `,
    },

    // Different Style 3 (radio)
    {
  handle: 'different-ver-3',
  html_content: `
    <div class="free-bulk-add-to-cart-container_2" data-product-id="{{product_handle}}">
      <div class="content-container">
        <span class="line" style="background-color: {{blockTitleColor}}; flex: 1 !important; height: 1px !important;"></span>  
          <p
            id="block_title_2"
            style="font-size: {{blockTitleFontSize}}px !important; font-weight: {{blockTitleFontStyle}} !important; color: {{blockTitleColor}} !important;"
          >
            {{block_title}}
          </p>
        <span class="line" style="background-color: {{blockTitleColor}}; flex: 1 !important; height: 1px !important;"></span>
      </div>

      <form class="free-bulk-cart-form" action="{{cart_add_url}}" method="post" enctype="multipart/form-data">
        <input type="hidden" name="id" value="{{variant_id}}">

        <div class="radio-options-container_2">
          {{#each_discount_option}}
          <div
            class="radio-option_3 {{option_{{index}}_ineligible}}"
            data-bg-default="{{buttoncardsBackground}}"
            data-bg-selected="{{selectedBackground}}"
            style="border: 1px solid !important; background-color: {{buttoncardsBackground}} !important; border-color: {{buttonborderColor}} !important; border-radius: {{buttoncornerRadius}}px !important; padding: {{buttonSpacing}}px !important;"
            >
            <!-- Badge at top
            <div
            class="saving-badge_3"
            style="background-color: {{labelBackground}} !important; border: 2px solid {{labelBackground}} !important; color: {{labelText}} !important; font-size: {{labelFontSize}}px !important; font-weight: {{labelFontStyle}} !important; border-radius: {{buttoncornerRadius}}px !important; flex-shrink: 0; min-width: 70px; display: flex; align-items: center; justify-content: center; padding: 2px 8px; box-sizing: border-box;"
            >
            {{option_{{index}}_saveAmount}}
            </div>
            -->
            <input
              type="radio"
              id="bulk-option-{{index}}-{{block_id}}"
              name="quantity"
              value="{{option_{{index}}_quantity}}"
              data-total-quantity="{{option_{{index}}_quantity}}"
              data-paid-quantity="{{option_{{index}}_quantity}}"
              data-discount-code="{{option_{{index}}_discount_code}}"
              data-discount-name="{{option_{{index}}_discount_name}}"
              {{option_{{index}}_disabled}}
              {{option_{{index}}_checked}}
            >
          <label for="bulk-option-{{index}}-{{block_id}}" class="radio-label_2">
            <div class="option-content_2" style="padding: {{buttonSpacing}}px !important; display: flex; flex-direction: column; gap: 6px;">
              <!-- Left: title, subtitle, eligibility -->
              <div class="option-left_2" style="display: flex; flex-direction: column; gap: 2px;">
                <h3 class="responsive_layout" style="color: {{titleColor}} !important; font-size: {{titleFontSize}}px !important; font-weight: {{titleFontStyle}} !important; margin: 0;">
                  {{option_{{index}}_title}}
                </h3>
                <div
                  class="option-subtitle_2"
                  style="color: {{subtitleColor}} !important; font-size: {{subtitleFontSize}}px !important; font-weight: {{subtitleFontStyle}} !important;"
                >
                  {{option_{{index}}_subtitle}}
                </div>
                <div class="eligibility-message_2">{{option_{{index}}_message}}</div>
              </div>

              <!-- Right: prices -->
              <div class="option-right_2" style="margin-top: auto;">
                <div class="option-price_2" style="color: {{priceColor}} !important; font-size: 16px; font-weight: bold;">
                  {{currency_symbol}} {{option_{{index}}_customerPays}}
                </div>
                <div class="option-savings_2" style="color: {{fullPriceColor}} !important; text-decoration: line-through; font-size: 14px;">
                  {{currency_symbol}} {{option_{{index}}_baseTotal}}
                </div>
              </div>
              </div>
              <div class="choose-buttons-container"
              style="padding-top: 15px !important; display: flex !important; flex-direction: column !important; width: fit-content !important; gap: 5px !important; display: none !important;"
              >
              </div>
            </label>
          </div>
          {{/each_discount_option}}
        </div>
      </form>
    </div>
    <!-- Sold Out Popup -->
    <div id="soldOutPopup" class="sold-out-popup">
      <div class="popup-content">
        <h3>🚫 Sold Out</h3>
        <p>Sorry, this product is currently out of stock and can’t be added to your cart.</p>
        <button id="closeSoldOutPopup">Okay</button>
      </div>
    </div>
  `,
    },

    // Different Style 4 (radio)
    {
    handle: 'different-ver-4',
    html_content: `
    <div class="free-bulk-add-to-cart-container_4" id="free-bulk-add-to-cart-container"
        data-product-id="{{product_handle}}">
        <div class="content-container" style="--divider-color: {{blockTitleColor}};">
            <span class="line"
                style="background-color: {{blockTitleColor}}; flex: 1 !important; height: 1px !important;"></span>
            <p id="block_title_4"
                style="color: {{blockTitleColor}} !important; font-size: {{blockTitleFontSize}}px !important; font-weight: {{blockTitleFontStyle}} !important;">
                {{block_title}}
            </p>
            <span class="line"
                style="background-color: {{blockTitleColor}}; flex: 1 !important; height: 1px !important;"></span>
        </div>

        <form class="free-bulk-cart-form" action="{{cart_add_url}}" method="post" enctype="multipart/form-data">
            <input type="hidden" name="id" value="{{variant_id}}">

            <div class="radio-options-container_4">
                {{#each_discount_option}}
                <div class="radio-option_4 {{option_{{index}}_ineligible}}"
                    data-bg-default="{{cardsBackground}}"
                    data-bg-selected="{{selectedBackground}}"
                    style="border-color: {{borderColor}} !important; border-radius: {{cornerRadius}}px !important; padding: {{spacing}}px !important;  background-color: {{cardsBackground}} !important; width: 150px !important;">
                    <input
                      type="radio"
                      id="bulk-option-{{index}}-{{block_id}}"
                      name="quantity"
                      value="{{option_{{index}}_quantity}}"
                      data-total-quantity="{{option_{{index}}_quantity}}"
                      data-paid-quantity="{{option_{{index}}_quantity}}"
                      data-discount-code="{{option_{{index}}_discount_code}}"
                      data-discount-name="{{option_{{index}}_discount_name}}"
                      {{option_{{index}}_disabled}}
                      {{option_{{index}}_checked}}
                    >
                    <label for="bulk-option-{{index}}-{{block_id}}" class="radio-label_4_different">
                        <div class="alignment">
                            <div class="option-content_4">
                                <div class="option-left_4">
                                    <h3 class="responsive_layout" style="color: {{titleColor}} !important; font-size: {{titleFontSize}}px !important; font-weight: {{titleFontStyle}} !important; padding-right: 10px; margin: 0; flex: 1 1 auto; min-width: 0;">
                                        {{option_{{index}}_title}}
                                    </h3>
                                    <div class="option-subtitle_4"
                                        style="color: {{subtitleColor}} !important; font-size: {{subtitleFontSize}}px !important; font-weight: {{subtitleFontStyle}} !important;">
                                        {{option_{{index}}_subtitle}}
                                    </div>
                                    <div class="eligibility-message_4">{{option_{{index}}_message}}</div>
                                </div>
                                <div class="option-right" style="display: flex !important; flex-direction: column !important; align-items: center !important;">
                                    <div class="option-price" style="color: {{priceColor}} !important;">
                                        {{currency_symbol}} {{option_{{index}}_customerPays}}
                                    </div>
                                    <div class="option-savings" style="color: {{fullPriceColor}} !important;">
                                        {{currency_symbol}} {{option_{{index}}_baseTotal}}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="choose-buttons-container"
                        style="padding-top: 15px !important; display: flex !important; flex-direction: column !important; width: fit-content !important; gap: 5px !important; display: none !important;"
                        >
                        </div>
                      </label>
                </div>
                {{/each_discount_option}}
            </div>
        </form>
    </div>
    <!-- Sold Out Popup -->
    <div id="soldOutPopup" class="sold-out-popup">
      <div class="popup-content">
        <h3>🚫 Sold Out</h3>
        <p>Sorry, this product is currently out of stock and can’t be added to your cart.</p>
        <button id="closeSoldOutPopup">Okay</button>
      </div>
    </div>
    `,
    },
  ];


  for (const block of blocks) {
    await prisma.block_styles.upsert({
      where: { handle: block.handle },
      update: { html_content: block.html_content },
      create: block,
    });
  }

  console.log('🌱 Seeder finished inserting block_styles');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });