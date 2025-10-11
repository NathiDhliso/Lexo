/**
 * Toast Notification Examples
 * 
 * This file demonstrates all the ways to use the toast notification system
 * in the LexoHub application.
 */

import React from 'react';
import { Button } from './Button';
import { toastService } from '../../services/toast.service';
import { Save, Trash2, AlertTriangle, Info } from 'lucide-react';

export const ToastExamples: React.FC = () => {
  return (
    <div className="space-y-8 p-6">
      {/* Basic Toasts */}
      <section>
        <h2 className="text-xl font-bold mb-4">Basic Toast Notifications</h2>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="success"
            onClick={() => toastService.success('Success!', 'Your changes have been saved.')}
          >
            Show Success Toast
          </Button>
          
          <Button
            variant="danger"
            onClick={() => toastService.error('Error!', 'Something went wrong. Please try again.')}
          >
            Show Error Toast
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => toastService.warning('Warning!', 'This action cannot be undone.')}
          >
            Show Warning Toast
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => toastService.info('Info', 'Here is some helpful information.')}
          >
            Show Info Toast
          </Button>
        </div>
      </section>

      {/* Title Only Toasts */}
      <section>
        <h2 className="text-xl font-bold mb-4">Title-Only Toasts</h2>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="success"
            onClick={() => toastService.success('Saved successfully!')}
          >
            Simple Success
          </Button>
          
          <Button
            variant="danger"
            onClick={() => toastService.error('Failed to delete')}
          >
            Simple Error
          </Button>
        </div>
      </section>

      {/* Loading Toast */}
      <section>
        <h2 className="text-xl font-bold mb-4">Loading Toast</h2>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="primary"
            onClick={() => {
              const toastId = toastService.loading('Processing...', 'Please wait while we save your changes.');
              
              // Simulate async operation
              setTimeout(() => {
                toastService.dismiss(toastId);
                toastService.success('Complete!', 'Your changes have been saved.');
              }, 3000);
            }}
          >
            Show Loading Toast
          </Button>
        </div>
      </section>

      {/* Promise-Based Toast */}
      <section>
        <h2 className="text-xl font-bold mb-4">Promise-Based Toast</h2>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="primary"
            icon={<Save />}
            onClick={() => {
              const savePromise = new Promise((resolve, reject) => {
                setTimeout(() => {
                  Math.random() > 0.5 ? resolve('Success') : reject('Error');
                }, 2000);
              });

              toastService.promise(savePromise, {
                loading: 'Saving changes...',
                success: 'Changes saved successfully!',
                error: 'Failed to save changes',
              });
            }}
          >
            Save with Promise Toast
          </Button>
          
          <Button
            variant="danger"
            icon={<Trash2 />}
            onClick={() => {
              const deletePromise = new Promise((resolve) => {
                setTimeout(() => resolve('Deleted'), 1500);
              });

              toastService.promise(deletePromise, {
                loading: 'Deleting item...',
                success: 'Item deleted successfully!',
                error: 'Failed to delete item',
              });
            }}
          >
            Delete with Promise Toast
          </Button>
        </div>
      </section>

      {/* Custom Duration */}
      <section>
        <h2 className="text-xl font-bold mb-4">Custom Duration</h2>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="success"
            onClick={() => toastService.success('Quick toast', 'This will disappear in 2 seconds', { duration: 2000 })}
          >
            2 Second Toast
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => toastService.info('Long toast', 'This will stay for 10 seconds', { duration: 10000 })}
          >
            10 Second Toast
          </Button>
        </div>
      </section>

      {/* Different Positions */}
      <section>
        <h2 className="text-xl font-bold mb-4">Toast Positions</h2>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="ghost"
            onClick={() => toastService.success('Top Right', undefined, { position: 'top-right' })}
          >
            Top Right
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => toastService.success('Top Center', undefined, { position: 'top-center' })}
          >
            Top Center
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => toastService.success('Top Left', undefined, { position: 'top-left' })}
          >
            Top Left
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => toastService.success('Bottom Right', undefined, { position: 'bottom-right' })}
          >
            Bottom Right
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => toastService.success('Bottom Center', undefined, { position: 'bottom-center' })}
          >
            Bottom Center
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => toastService.success('Bottom Left', undefined, { position: 'bottom-left' })}
          >
            Bottom Left
          </Button>
        </div>
      </section>

      {/* Dismiss Actions */}
      <section>
        <h2 className="text-xl font-bold mb-4">Dismiss Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="primary"
            onClick={() => {
              toastService.success('Toast 1');
              toastService.info('Toast 2');
              toastService.warning('Toast 3');
            }}
          >
            Show Multiple Toasts
          </Button>
          
          <Button
            variant="danger"
            onClick={() => toastService.dismissAll()}
          >
            Dismiss All Toasts
          </Button>
        </div>
      </section>

      {/* Real-World Examples */}
      <section>
        <h2 className="text-xl font-bold mb-4">Real-World Examples</h2>
        
        <div className="space-y-4">
          {/* Form Submission */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-3">Form Submission</h3>
            <Button
              variant="primary"
              icon={<Save />}
              onClick={() => {
                const savePromise = new Promise((resolve) => {
                  setTimeout(() => resolve('Saved'), 1500);
                });

                toastService.promise(savePromise, {
                  loading: 'Saving matter...',
                  success: 'Matter saved successfully!',
                  error: 'Failed to save matter',
                });
              }}
            >
              Save Matter
            </Button>
          </div>

          {/* Delete Confirmation */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-3">Delete Action</h3>
            <Button
              variant="danger"
              icon={<Trash2 />}
              onClick={() => {
                toastService.warning('Deleting item...', 'This action cannot be undone');
                
                setTimeout(() => {
                  toastService.success('Item deleted', 'The item has been permanently removed');
                }, 2000);
              }}
            >
              Delete Item
            </Button>
          </div>

          {/* Validation Error */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-3">Validation Error</h3>
            <Button
              variant="primary"
              onClick={() => {
                toastService.error('Validation Error', 'Please fill in all required fields');
              }}
            >
              Submit Invalid Form
            </Button>
          </div>

          {/* Network Error */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-3">Network Error</h3>
            <Button
              variant="primary"
              onClick={() => {
                toastService.error('Connection Error', 'Unable to reach the server. Please check your internet connection.');
              }}
            >
              Simulate Network Error
            </Button>
          </div>

          {/* Success with Info */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-3">Success with Additional Info</h3>
            <Button
              variant="success"
              onClick={() => {
                toastService.success('Invoice Generated', 'Invoice #INV-2024-001 has been created and sent to the client');
              }}
            >
              Generate Invoice
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ToastExamples;
