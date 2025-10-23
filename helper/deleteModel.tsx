import React, { useState } from "react";
import { Modal, Button } from "@shopify/polaris";
import { DeleteIcon } from "@shopify/polaris-icons";

interface DeleteConfirmationModalProps {
  rowId: string;
  onDelete: (id: string) => void;
  triggerLabel?: string;
}

export function DeleteConfirmationModal({
  rowId,
  onDelete,
}: DeleteConfirmationModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleConfirmDelete = () => {
    onDelete(rowId);
    setIsModalOpen(false);
  };

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <Button
        variant="primary"
        tone="critical"
        icon={DeleteIcon} // Polaris icon source, not a React node
        onClick={handleOpenModal}
        size="slim"
      ></Button>

      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        title="Delete Bundle"
        primaryAction={{
          content: "Delete",
          onAction: handleConfirmDelete,
          destructive: true,
        }}
        secondaryActions={[{ content: "Cancel", onAction: handleCloseModal }]}
      >
        <Modal.Section>
          <p>Are you sure you want to delete this bundle?</p>
        </Modal.Section>
      </Modal>
    </div>
  );
}
