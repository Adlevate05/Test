// app/components/BundleDealsTable.tsx
import {
  IndexTable,
  Text,
  Badge,
  Button,
  Card,
  Page,
  useIndexResourceState,
  InlineStack,
  TextField,
} from "@shopify/polaris";
import {
  DeleteIcon,
  EditIcon,
  ViewIcon,
  CartIcon,
} from "@shopify/polaris-icons";
import { useState } from "react";

export default function BundleDealsTable() {
  const [searchValue, setSearchValue] = useState('');

  const deals = [
    {
      id: "1",
      title: "Bundle #2",
      products: "All products",
      status: "Active",
      visitors: 0,
      cr: "0%",
      bundles: "0%",
      aov: "PKR 0.00",
      addedRev: "PKR 0",
      totalRev: "PKR 0",
      revPerVisitor: "PKR 0.00",
      profitPerVisitor: "-",
    },
    {
      id: "2",
      title: "Bundle",
      products: "All products",
      status: "Active",
      visitors: 0,
      cr: "0%",
      bundles: "0%",
      aov: "PKR 0.00",
      addedRev: "PKR 0",
      totalRev: "PKR 0",
      revPerVisitor: "PKR 0.00",
      profitPerVisitor: "-",
    },
  ];

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(deals);

  const rowMarkup = deals.map(
    (
      {
        id,
        title,
        products,
        status,
        visitors,
        cr,
        bundles,
        aov,
        addedRev,
        totalRev,
        revPerVisitor,
        profitPerVisitor,
      },
      index
    ) => (
      <IndexTable.Row
        id={id}
        key={id}
        selected={selectedResources.includes(id)}
        position={index}
      >
        <IndexTable.Cell>
          <InlineStack gap="200">
            <Button tone="success" variant="plain" size="micro">
              ⏺
            </Button>
            <div>
              <Text as="span" variant="bodyMd" fontWeight="medium">
                {title}
              </Text>
              <div>
                <Text as="span" tone="subdued" variant="bodySm">
                  {products}
                </Text>
              </div>
            </div>
          </InlineStack>
        </IndexTable.Cell>

        <IndexTable.Cell>
          <Badge tone="success">{status}</Badge>
        </IndexTable.Cell>

        <IndexTable.Cell><div>
          <Text as="span" variant="bodyMd" fontWeight="medium">
            {title}
          </Text>
          <div>
            <Text as="span" tone="subdued" variant="bodySm">
              {products}
            </Text>
          </div>
        </div></IndexTable.Cell>
        <IndexTable.Cell><div>
          <Text as="span" variant="bodyMd" fontWeight="medium">
            {title}
          </Text>
          <div>
            <Text as="span" tone="subdued" variant="bodySm">
              {products}
            </Text>
          </div>
        </div></IndexTable.Cell>
        <IndexTable.Cell><div>
          <Text as="span" variant="bodyMd" fontWeight="medium">
            {title}
          </Text>
          <div>
            <Text as="span" tone="subdued" variant="bodySm">
              {products}
            </Text>
          </div>
        </div></IndexTable.Cell>
        <IndexTable.Cell><div>
          <Text as="span" variant="bodyMd" fontWeight="medium">
            {title}
          </Text>
          <div>
            <Text as="span" tone="subdued" variant="bodySm">
              {products}
            </Text>
          </div>
        </div></IndexTable.Cell>
        <IndexTable.Cell><div>
          <Text as="span" variant="bodyMd" fontWeight="medium">
            {title}
          </Text>
          <div>
            <Text as="span" tone="subdued" variant="bodySm">
              {products}
            </Text>
          </div>
        </div></IndexTable.Cell>
        <IndexTable.Cell><div>
          <Text as="span" variant="bodyMd" fontWeight="medium">
            {title}
          </Text>
          <div>
            <Text as="span" tone="subdued" variant="bodySm">
              {products}
            </Text>
          </div>
        </div></IndexTable.Cell>
        <IndexTable.Cell><div>
          <Text as="span" variant="bodyMd" fontWeight="medium">
            {title}
          </Text>
          <div>
            <Text as="span" tone="subdued" variant="bodySm">
              {products}
            </Text>
          </div>
        </div></IndexTable.Cell>
        <IndexTable.Cell><div>
          <Text as="span" variant="bodyMd" fontWeight="medium">
            {title}
          </Text>
          <div>
            <Text as="span" tone="subdued" variant="bodySm">
              {products}
            </Text>
          </div>
        </div></IndexTable.Cell>

        <IndexTable.Cell>
          <InlineStack gap="200">
            <Button size="micro">Run A/B test</Button>
            <Button size="micro" icon={CartIcon} />
            <Button size="micro" icon={ViewIcon} />
            <Button size="micro" icon={EditIcon} />
            <Button tone="critical" size="micro" icon={DeleteIcon} />
          </InlineStack>
        </IndexTable.Cell>
      </IndexTable.Row>
    )
  );

  return (
    <Page title="Bundle deals"
      fullWidth
      primaryAction={{
        content: 'Create bundle Deal',
           url: '/app/deal-discount-setup',
      }}>
      <Card>
        <TextField
          label=""
          placeholder="Search by name or product"
          value={searchValue}
          onChange={(value) => setSearchValue(value)}
          autoComplete="off"
          inputMode="text"
        />
        <IndexTable
          itemCount={deals.length}
          selectedItemsCount={
            allResourcesSelected ? "All" : selectedResources.length
          }
          onSelectionChange={handleSelectionChange}
          headings={[
            { title: "Deal" },
            { title: "Status" },
            { title: "" },
            { title: "" },
            { title: "" },
            { title: "" },
            { title: "" },
            { title: "" },
            { title: "" },
            { title: "" },
            { title: "Actions" },
          ]}
        >
          {rowMarkup}
        </IndexTable>
      </Card>
    </Page>
  );
}
