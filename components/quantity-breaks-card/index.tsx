// app/components/quantity-breaks-card/index.tsx (example one of them)
import React from "react";
import { Card, Box, Text, Button } from "@shopify/polaris";
import { useAppContext } from "../../utils/AppContext";

export function QuantityBreaksSubCardOne() {
  const { packages } = useAppContext();

  return (
    <Card>
      <Box padding="300" >
        <Text as="h3" variant="headingSm" fontWeight="bold">
          Quantity Breaks – Preview
        </Text>

        <div className="space-y-2">
          {packages.map((bar, i) => (
            <div key={bar.id} className="flex items-center justify-between rounded border p-3">
              <div>
                <div className="font-medium">{bar.title || `Bar #${i + 1}`}</div>
                <div className="text-sm text-gray-500">
                  {bar.subtitle ?? "Standard price"} • Qty: {bar.quantity}
                  {bar.badgeText ? ` • ${bar.badgeText}` : ""}
                </div>
              </div>
              <Button size="slim" variant={bar.selectedByDefault ? "primary" : "secondary"}>
                {bar.selectedByDefault ? "Selected" : "Select"}
              </Button>
            </div>
          ))}
        </div>
      </Box>
    </Card>
  );
}
