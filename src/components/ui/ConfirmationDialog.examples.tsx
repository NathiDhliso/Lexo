/**
 * ConfirmationDialog Component Examples
 * 
 * This file demonstrates all the ways to use the ConfirmationDialog component
 * in the LexoHub application.
 */

import React from 'react';
import { Button } from './Button';
import { ConfirmationDialog } from './ConfirmationDialog';
import { useModalState } from '../../hooks/useModalState';
import { useConfirmation } from '../../hooks/useConfirmation';
import { Trash2, Save, AlertTriangle, FileText } from 'lucide-react';
import { toastService } from '../../services/toast.service';

export const ConfirmationDialogExamples: React.FC = () => {
  return (
    <div className="space-y-8 p-6">
      {/* Basic Variants */}
      <section>
        <h2 className="text-xl font-bold mb-4">Confirmation Dialog Variants</h2>
        <VariantsExample />
      </section>

      {/* With Async Actions */}
      <section>
        <h2 className="text-xl font-bold mb-4">With Async Actions</h2>
        <AsyncActionsExample />
      </section>

      {/* Using useConfirmation Hook */}
      <section>
        <h2 className="text-xl font-bold mb-4">Using useConfirmation Hook</h2>
        <UseConfirmationExample />
      </section>

      {/* Custom Text */}
      <section>
        <h2 className="text-xl font-bold mb-4">Custom Button Text</h2>
        <CustomTextExample />
      </section>

      {/* Real-World Examples */}
      <section>
        <h2 className="text-xl font-bold mb-4">Real-World Examples</h2>
        <RealWorldExamples />
      </section>
    </div>
  );
};

// Variants Example
const VariantsExample: React.FC = () => {
  const infoModal = useModalState();
  const warningModal = useModalState();
  const dangerModal = useModalState();

  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="ghost" onClick={infoModal.open}>
        Info Dialog
      </Button>
      <ConfirmationDialog
        isOpen={infoModal.isOpen}
        onClose={infoModal.close}
        onConfirm={() => {
          console.log('Info confirmed');
          infoModal.close();
        }}
        variant="info"
        title="Information"
        message="This is an informational confirmation dialog."
      />

      <Button variant="secondary" onClick={warningModal.open}>
        Warning Dialog
      </Button>
      <ConfirmationDialog
        isOpen={warningModal.isOpen}
        onClose={warningModal.close}
        onConfirm={() => {
          console.log('Warning confirmed');
          warningModal.close();
        }}
        variant="warning"
        title="Warning"
        message="This action may have consequences. Are you sure you want to continue?"
      />

      <Button variant="danger" onClick={dangerModal.open}>
        Danger Dialog
      </Button>
      <ConfirmationDialog
        isOpen={dangerModal.isOpen}
        onClose={dangerModal.close}
        onConfirm={() => {
          console.log('Danger confirmed');
          dangerModal.close();
        }}
        variant="danger"
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
      />
    </div>
  );
};

// Async Actions Example
const AsyncActionsExample: React.FC = () => {
  const { isOpen, open, close } = useModalState();

  const handleAsyncConfirm = async () => {
    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 2000));
    toastService.success('Item deleted successfully!');
  };

  return (
    <>
      <Button variant="danger" icon={<Trash2 />} onClick={open}>
        Delete with Async Action
      </Button>
      <ConfirmationDialog
        isOpen={isOpen}
        onClose={close}
        onConfirm={handleAsyncConfirm}
        variant="danger"
        title="Delete Item"
        message="This will permanently delete the item. Are you sure?"
      />
    </>
  );
};

// useConfirmation Hook Example
const UseConfirmationExample: React.FC = () => {
  const { confirm, confirmationState } = useConfirmation();

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete Matter',
      message: 'Are you sure you want to delete this matter? All associated data will be permanently removed.',
      variant: 'danger',
    });

    if (confirmed) {
      toastService.success('Matter deleted successfully!');
    } else {
      toastService.info('Deletion cancelled');
    }
  };

  const handleSave = async () => {
    const confirmed = await confirm({
      title: 'Save Changes',
      message: 'Do you want to save your changes?',
      variant: 'info',
      confirmText: 'Save',
    });

    if (confirmed) {
      toastService.success('Changes saved!');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button variant="danger" icon={<Trash2 />} onClick={handleDelete}>
          Delete with Hook
        </Button>
        <Button variant="primary" icon={<Save />} onClick={handleSave}>
          Save with Hook
        </Button>
      </div>
      <ConfirmationDialog {...confirmationState} />
    </div>
  );
};

// Custom Text Example
const CustomTextExample: React.FC = () => {
  const { isOpen, open, close } = useModalState();

  return (
    <>
      <Button onClick={open}>Custom Button Text</Button>
      <ConfirmationDialog
        isOpen={isOpen}
        onClose={close}
        onConfirm={() => {
          console.log('Confirmed');
          close();
        }}
        variant="warning"
        title="Proceed with Action"
        message="This action will affect multiple items. Do you want to proceed?"
        confirmText="Yes, Proceed"
        cancelText="No, Go Back"
      />
    </>
  );
};

// Real-World Examples
const RealWorldExamples: React.FC = () => {
  const deleteMatterModal = useModalState();
  const archiveMatterModal = useModalState();
  const sendInvoiceModal = useModalState();
  const discardChangesModal = useModalState();

  const handleDeleteMatter = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toastService.success('Matter deleted successfully!');
  };

  const handleArchiveMatter = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toastService.success('Matter archived successfully!');
  };

  const handleSendInvoice = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toastService.success('Invoice sent to client!');
  };

  const handleDiscardChanges = () => {
    toastService.info('Changes discarded');
  };

  return (
    <div className="space-y-4">
      {/* Delete Matter */}
      <div className="p-4 border rounded-lg">
        <h3 className="font-semibold mb-3">Delete Matter</h3>
        <Button variant="danger" icon={<Trash2 />} onClick={deleteMatterModal.open}>
          Delete Matter
        </Button>
        <ConfirmationDialog
          isOpen={deleteMatterModal.isOpen}
          onClose={deleteMatterModal.close}
          onConfirm={handleDeleteMatter}
          variant="danger"
          title="Delete Matter"
          message="Are you sure you want to delete 'Smith vs. Johnson'? All time entries, documents, and invoices associated with this matter will be permanently removed."
          confirmText="Delete Permanently"
        />
      </div>

      {/* Archive Matter */}
      <div className="p-4 border rounded-lg">
        <h3 className="font-semibold mb-3">Archive Matter</h3>
        <Button variant="secondary" onClick={archiveMatterModal.open}>
          Archive Matter
        </Button>
        <ConfirmationDialog
          isOpen={archiveMatterModal.isOpen}
          onClose={archiveMatterModal.close}
          onConfirm={handleArchiveMatter}
          variant="warning"
          title="Archive Matter"
          message="This will move the matter to the archive. You can restore it later if needed."
          confirmText="Archive"
        />
      </div>

      {/* Send Invoice */}
      <div className="p-4 border rounded-lg">
        <h3 className="font-semibold mb-3">Send Invoice</h3>
        <Button variant="primary" icon={<FileText />} onClick={sendInvoiceModal.open}>
          Send Invoice
        </Button>
        <ConfirmationDialog
          isOpen={sendInvoiceModal.isOpen}
          onClose={sendInvoiceModal.close}
          onConfirm={handleSendInvoice}
          variant="info"
          title="Send Invoice"
          message="This will send invoice #INV-2024-001 to the client via email. Do you want to proceed?"
          confirmText="Send Invoice"
        />
      </div>

      {/* Discard Changes */}
      <div className="p-4 border rounded-lg">
        <h3 className="font-semibold mb-3">Discard Changes</h3>
        <Button variant="ghost" onClick={discardChangesModal.open}>
          Discard Changes
        </Button>
        <ConfirmationDialog
          isOpen={discardChangesModal.isOpen}
          onClose={discardChangesModal.close}
          onConfirm={handleDiscardChanges}
          variant="warning"
          title="Discard Changes"
          message="You have unsaved changes. Are you sure you want to discard them?"
          confirmText="Discard"
          cancelText="Keep Editing"
        />
      </div>
    </div>
  );
};

export default ConfirmationDialogExamples;
