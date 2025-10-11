/**
 * Modal Component Examples
 * 
 * This file demonstrates all the ways to use the Modal components
 * in the LexoHub application.
 */

import React, { useState } from 'react';
import { Button } from './Button';
import { Modal, ModalBody, ModalFooter, ModalDescription } from './index';
import { useModalState } from '../../hooks/useModalState';
import { Save, Trash2, AlertTriangle, Info, FileText } from 'lucide-react';

export const ModalExamples: React.FC = () => {
  return (
    <div className="space-y-8 p-6">
      {/* Basic Modal */}
      <section>
        <h2 className="text-xl font-bold mb-4">Basic Modal</h2>
        <BasicModalExample />
      </section>

      {/* Modal Sizes */}
      <section>
        <h2 className="text-xl font-bold mb-4">Modal Sizes</h2>
        <ModalSizesExample />
      </section>

      {/* Modal with Footer */}
      <section>
        <h2 className="text-xl font-bold mb-4">Modal with Footer</h2>
        <ModalWithFooterExample />
      </section>

      {/* Confirmation Modal */}
      <section>
        <h2 className="text-xl font-bold mb-4">Confirmation Modal</h2>
        <ConfirmationModalExample />
      </section>

      {/* Form Modal */}
      <section>
        <h2 className="text-xl font-bold mb-4">Form Modal</h2>
        <FormModalExample />
      </section>

      {/* Modal Options */}
      <section>
        <h2 className="text-xl font-bold mb-4">Modal Options</h2>
        <ModalOptionsExample />
      </section>

      {/* Real-World Examples */}
      <section>
        <h2 className="text-xl font-bold mb-4">Real-World Examples</h2>
        <RealWorldExamples />
      </section>
    </div>
  );
};

// Basic Modal Example
const BasicModalExample: React.FC = () => {
  const { isOpen, open, close } = useModalState();

  return (
    <>
      <Button onClick={open}>Open Basic Modal</Button>
      <Modal isOpen={isOpen} onClose={close} title="Basic Modal">
        <p>This is a basic modal with a title and content.</p>
      </Modal>
    </>
  );
};

// Modal Sizes Example
const ModalSizesExample: React.FC = () => {
  const [size, setSize] = useState<'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'>('md');
  const { isOpen, open, close } = useModalState();

  const openWithSize = (modalSize: typeof size) => {
    setSize(modalSize);
    open();
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => openWithSize('sm')}>
          Small
        </Button>
        <Button size="sm" onClick={() => openWithSize('md')}>
          Medium
        </Button>
        <Button size="sm" onClick={() => openWithSize('lg')}>
          Large
        </Button>
        <Button size="sm" onClick={() => openWithSize('xl')}>
          Extra Large
        </Button>
        <Button size="sm" onClick={() => openWithSize('2xl')}>
          2X Large
        </Button>
        <Button size="sm" onClick={() => openWithSize('full')}>
          Full Width
        </Button>
      </div>
      <Modal isOpen={isOpen} onClose={close} title={`${size.toUpperCase()} Modal`} size={size}>
        <p>This is a {size} modal. Resize your browser to see how it responds.</p>
      </Modal>
    </>
  );
};

// Modal with Footer Example
const ModalWithFooterExample: React.FC = () => {
  const { isOpen, open, close } = useModalState();

  return (
    <>
      <Button onClick={open}>Open Modal with Footer</Button>
      <Modal
        isOpen={isOpen}
        onClose={close}
        title="Modal with Footer"
        footer={
          <>
            <Button variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button variant="primary" onClick={close}>
              Save Changes
            </Button>
          </>
        }
      >
        <p>This modal has action buttons in the footer.</p>
      </Modal>
    </>
  );
};

// Confirmation Modal Example
const ConfirmationModalExample: React.FC = () => {
  const { isOpen, open, close } = useModalState();

  const handleConfirm = () => {
    console.log('Confirmed!');
    close();
  };

  return (
    <>
      <Button variant="danger" icon={<Trash2 />} onClick={open}>
        Delete Item
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={close}
        title="Confirm Deletion"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button variant="danger" icon={<Trash2 />} onClick={handleConfirm}>
              Delete
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-status-error-600">
            <AlertTriangle className="w-6 h-6" />
            <p className="font-semibold">This action cannot be undone</p>
          </div>
          <ModalDescription>
            Are you sure you want to delete this item? All associated data will be permanently
            removed.
          </ModalDescription>
        </div>
      </Modal>
    </>
  );
};

// Form Modal Example
const FormModalExample: React.FC = () => {
  const { isOpen, open, close } = useModalState();
  const [formData, setFormData] = useState({ name: '', email: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    close();
  };

  return (
    <>
      <Button icon={<FileText />} onClick={open}>
        Create New Item
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={close}
        title="Create New Item"
        footer={
          <>
            <Button variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button variant="primary" icon={<Save />} onClick={handleSubmit}>
              Create
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Enter name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Enter email"
            />
          </div>
        </form>
      </Modal>
    </>
  );
};

// Modal Options Example
const ModalOptionsExample: React.FC = () => {
  const modal1 = useModalState();
  const modal2 = useModalState();
  const modal3 = useModalState();

  return (
    <div className="space-y-3">
      <div>
        <Button onClick={modal1.open}>No Close Button</Button>
        <Modal isOpen={modal1.isOpen} onClose={modal1.close} title="No Close Button" showCloseButton={false}>
          <p>This modal doesn't have a close button in the header.</p>
          <Button variant="primary" onClick={modal1.close} className="mt-4">
            Close
          </Button>
        </Modal>
      </div>

      <div>
        <Button onClick={modal2.open}>No Overlay Close</Button>
        <Modal
          isOpen={modal2.isOpen}
          onClose={modal2.close}
          title="No Overlay Close"
          closeOnOverlayClick={false}
        >
          <p>Clicking outside this modal won't close it.</p>
          <Button variant="primary" onClick={modal2.close} className="mt-4">
            Close
          </Button>
        </Modal>
      </div>

      <div>
        <Button onClick={modal3.open}>No Escape Close</Button>
        <Modal
          isOpen={modal3.isOpen}
          onClose={modal3.close}
          title="No Escape Close"
          closeOnEscape={false}
        >
          <p>Pressing Escape won't close this modal.</p>
          <Button variant="primary" onClick={modal3.close} className="mt-4">
            Close
          </Button>
        </Modal>
      </div>
    </div>
  );
};

// Real-World Examples
const RealWorldExamples: React.FC = () => {
  const editModal = useModalState();
  const deleteModal = useModalState();
  const infoModal = useModalState();

  return (
    <div className="space-y-4">
      {/* Edit Matter Modal */}
      <div className="p-4 border rounded-lg">
        <h3 className="font-semibold mb-3">Edit Matter</h3>
        <Button variant="secondary" icon={<FileText />} onClick={editModal.open}>
          Edit Matter
        </Button>
        <Modal
          isOpen={editModal.isOpen}
          onClose={editModal.close}
          title="Edit Matter"
          size="lg"
          footer={
            <>
              <Button variant="ghost" onClick={editModal.close}>
                Cancel
              </Button>
              <Button variant="primary" icon={<Save />} onClick={editModal.close}>
                Save Changes
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Matter Name</label>
              <input
                type="text"
                defaultValue="Smith vs. Johnson"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Client</label>
              <input
                type="text"
                defaultValue="John Smith"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select className="w-full px-3 py-2 border rounded-lg">
                <option>Active</option>
                <option>Pending</option>
                <option>Closed</option>
              </select>
            </div>
          </div>
        </Modal>
      </div>

      {/* Delete Confirmation */}
      <div className="p-4 border rounded-lg">
        <h3 className="font-semibold mb-3">Delete Confirmation</h3>
        <Button variant="danger" icon={<Trash2 />} onClick={deleteModal.open}>
          Delete Matter
        </Button>
        <Modal
          isOpen={deleteModal.isOpen}
          onClose={deleteModal.close}
          title="Delete Matter"
          size="sm"
          footer={
            <>
              <Button variant="ghost" onClick={deleteModal.close}>
                Cancel
              </Button>
              <Button variant="danger" icon={<Trash2 />} onClick={deleteModal.close}>
                Delete Permanently
              </Button>
            </>
          }
        >
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-status-error-600">
              <AlertTriangle className="w-6 h-6" />
              <p className="font-semibold">This action cannot be undone</p>
            </div>
            <ModalDescription>
              Are you sure you want to delete "Smith vs. Johnson"? All time entries, documents,
              and invoices associated with this matter will be permanently removed.
            </ModalDescription>
          </div>
        </Modal>
      </div>

      {/* Information Modal */}
      <div className="p-4 border rounded-lg">
        <h3 className="font-semibold mb-3">Information Modal</h3>
        <Button variant="ghost" icon={<Info />} onClick={infoModal.open}>
          View Details
        </Button>
        <Modal
          isOpen={infoModal.isOpen}
          onClose={infoModal.close}
          title="Matter Details"
          size="md"
        >
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Matter Number
              </p>
              <p className="font-semibold">MAT-2024-001</p>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Client</p>
              <p className="font-semibold">John Smith</p>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Status</p>
              <p className="font-semibold">Active</p>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Created Date
              </p>
              <p className="font-semibold">January 15, 2024</p>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default ModalExamples;
