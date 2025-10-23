import { Card, Button,  Select, Text, Icon, Box, InlineStack, BlockStack } from "@shopify/polaris"
import { ProductIcon } from "@shopify/polaris-icons"
import {  useState } from "react";
export function ProductBundleCard({ themeColor }: { themeColor?: string }) {
  const sizeOptions = [
    { label: "Small", value: "small" },
    { label: "Medium", value: "medium" },
    { label: "Large", value: "large" },
  ];
  const colorOptions = [
    { label: "Black", value: "black", color: "#000000" },
    { label: "Red", value: "red", color: "#dc2626" },
    { label: "Blue", value: "blue", color: "#2563eb" },
  ];

  // State for Bundle Card collapse
  const [bundleExpanded, setBundleExpanded] = useState<'card1' | 'card2'>('card1');

  return (
    <>

      
      {/* <Box >
        <BlockStack gap="400">
          <div className="bg-white p-4 rounded-xl shadow-sm" >
            
            <div
              onClick={() => setBundleExpanded('card1')}
              style={{
                cursor: 'pointer',
                boxShadow: bundleExpanded === 'card1' ? `0 2px 8px ${themeColor}` : undefined,
                border: bundleExpanded === 'card1' ? `2px solid ${themeColor}` : '2px solid #e5e7eb',
                borderRadius: 8,
              }}
            >
              <Card padding="400">
                <Box>
                  <BlockStack gap="300">
                    <InlineStack align="space-between" wrap={false}>
                      <InlineStack gap="300" align="center">
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            backgroundColor: "#f3f4f6",
                            borderRadius: "4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Icon source={ProductIcon} />
                        </div>
                        <BlockStack gap="050">
                          <Text as="h3" variant="headingMd">Example product</Text>
                          <Text as="p" variant="bodyMd" tone="subdued">Standard price</Text>
                          <Text as="p" variant="bodySm" tone="subdued">Size, Color</Text>
                        </BlockStack>
                      </InlineStack>
                      <Text as="p" variant="headingMd">Rs.20.00</Text>
                    </InlineStack>
                    {bundleExpanded === 'card1' && (
                      <InlineStack gap="200">
                        <Box width="100px">
                          <Select label="" options={sizeOptions} value="small" onChange={() => { }} />
                        </Box>
                        <Box width="100px">
                          <Select label="" options={colorOptions} value="black" onChange={() => { }} />
                        </Box>
                      </InlineStack>
                    )}
                  </BlockStack>
                </Box>
              </Card>
            </div>
            
            <div
              onClick={() => setBundleExpanded('card2')}
              style={{
                cursor: 'pointer',
                marginTop: 16,
                boxShadow: bundleExpanded === 'card2' ? `0 2px 8px ${themeColor}` : undefined,
                border: bundleExpanded === 'card2' ? `2px solid ${themeColor}` : '2px solid #e5e7eb',
                borderRadius: 8,
              }}
            >
              <Card padding="400" background="bg-surface">
                <BlockStack gap="400">
                  <InlineStack align="space-between" wrap={false}>
                    <InlineStack gap="300" align="center">
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          backgroundColor: "#f3f4f6",
                          borderRadius: "4px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon source={ProductIcon} />
                      </div>
                      <BlockStack gap="050">
                        <Text as="h4" variant="headingMd">Complete the bundle</Text>
                        <Text as="p" variant="bodyMd" tone="subdued">Save Rs.10.00!</Text>
                      </BlockStack>
                    </InlineStack>
                    <BlockStack gap="050" align="end">
                      <Text as="p" variant="headingMd">Rs.40.00</Text>
                      <Text as="p" variant="bodyMd" tone="subdued"><s>Rs.50.00</s></Text>
                    </BlockStack>
                  </InlineStack>
                  {bundleExpanded === 'card2' && (
                    <>
                      
                      <InlineStack align="center" gap="400">
                        
                        <BlockStack align="center" gap="200">
                          <div
                            style={{
                              width: "48px",
                              height: "48px",
                              backgroundColor: "#f3f4f6",
                              borderRadius: "4px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Icon source={ProductIcon} />
                          </div>
                          <Text as="p" variant="bodyMd" fontWeight="medium" alignment="center">Example product</Text>
                          <Text as="p" variant="bodyMd" fontWeight="medium">Rs.16.00</Text>
                          <Text as="p" variant="bodyMd" tone="subdued"><s>Rs.20.00</s></Text>
                          <InlineStack gap="200">
                            <Box width="100px">
                              <Select label="" options={sizeOptions} value="small" onChange={() => { }} />
                            </Box>
                            <Box width="100px">
                              <Select label="" options={colorOptions} value="black" onChange={() => { }} />
                            </Box>
                          </InlineStack>
                        </BlockStack>
                        
                        <BlockStack align="center" gap="200">
                          <div
                            style={{
                              width: "48px",
                              height: "48px",
                              backgroundColor: "#9ca3af",
                              borderRadius: "4px",
                            }}
                          />
                          <Text as="p" variant="bodyMd" fontWeight="medium" alignment="center">Shorts</Text>
                          <Text as="p" variant="bodyMd" fontWeight="medium">Rs.24.00</Text>
                          <Text as="p" variant="bodyMd" tone="subdued"><s>Rs.30.00</s></Text>
                          <Box width="100px">
                            <Select label="" options={sizeOptions} value="small" onChange={() => { }} />
                          </Box>
                        </BlockStack>
                      </InlineStack>

                    </>
                  )}

                </BlockStack>

              </Card>

            </div>
            <BlockStack gap="300" align="center">
              <Text as="p" variant="bodyMd" tone="subdued" alignment="center">
                Complete the bundle
              </Text>
              <Button variant="primary" size="large" fullWidth>
                Choose
              </Button>
            </BlockStack>
          </div>
        </BlockStack>
      </Box> */}
    </ >
  )
}
