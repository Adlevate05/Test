// Helper function for help modal
import { useState } from "react";
import * as PolarisImport from "@shopify/polaris";
const Polaris = (PolarisImport as any).default || PolarisImport;
const { Button, Modal, BlockStack, Text, List } = Polaris;
export default function NeedHelp() {
  const [active, setActive] = useState(false);
  const toggleModal = () => setActive((prev) => !prev);
  return (
    <>
      <div className="flex flex-col items-start gap-2">
        <Button size="slim" plain onClick={toggleModal}>
          Need help?
        </Button>
      </div>
      <Modal
        open={active}
        onClose={toggleModal}
        title="Need some help?"
        size="large"
        primaryAction={{
          content: "Got it",
          onAction: toggleModal,
        }}
      >
        <Modal.Section>
          <BlockStack gap="6">
            <Text as="p" variant="bodyMd">
              To make your bundles visible in your store, you need to activate
              the theme extension. Follow these steps:
            </Text>
            {/* Numbered List in Polaris */}
            <List type="number">
              <List.Item>
                In the Shopify admin, go to{" "}
                <strong>Online Store → Customize</strong>.
              </List.Item>
              <List.Item>
                At the top, select the theme you want to edit.
              </List.Item>
              <List.Item>
                In the left sidebar, scroll down to <strong>App Embeds</strong>.
              </List.Item>
              <List.Item>
                Find <strong>Adlevate – Product Bundles</strong> in the list.
              </List.Item>
              <List.Item>
                Toggle the switch to activate the extension.
              </List.Item>
              <List.Item>
                Click <strong>Save</strong> in the top right corner.
              </List.Item>
            </List>
            <Text as="p" variant="bodyMd">
              After saving, bundles will appear automatically on your product
              pages.
            </Text>
            <Text as="p" variant="bodyMd">
              If you don’t see the extension listed, make sure:
            </Text>
            {/* Bullet List in Polaris */}
            <List type="bullet">
              <List.Item>You have installed the app correctly.</List.Item>
              <List.Item>
                You are editing a live theme (not an old unpublished one).
              </List.Item>
              <List.Item>
                Need more help? Contact our support team and we’ll guide you
                through the process.
              </List.Item>
            </List>
          </BlockStack>
        </Modal.Section>
      </Modal>
    </>
  );
}
