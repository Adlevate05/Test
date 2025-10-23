// app/components/SubscriptionModal.tsx
import {Modal, Text} from "@shopify/polaris";
import { useNavigate } from "@remix-run/react";

interface SubscriptionModalProps {
  open: boolean;
  onClose: () => void;
  redirectPath?: string;
  message?: string;
  title?: string;
}

export function SubscriptionModal({
  open,
  onClose,
  redirectPath = "/app/plans-page",
  message = "Please subscribe to unlock this feature.",
  title = "Subscription Required",
}: SubscriptionModalProps) {
  const navigate = useNavigate();

  const handleSubscribe = () => {
    onClose();
    navigate(redirectPath);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      primaryAction={{ content: "Subscribe", onAction: handleSubscribe }}
      secondaryActions={[{ content: "Cancel", onAction: onClose }]}
    >
      <Modal.Section>
        <Text as="p" variant="bodyMd">
          {message}
        </Text>
      </Modal.Section>
    </Modal>
  );
}