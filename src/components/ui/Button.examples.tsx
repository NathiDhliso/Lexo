/**
 * Button Component Examples
 * 
 * This file demonstrates all the ways to use the Button and AsyncButton components
 * in the LexoHub application.
 */

import React from 'react';
import { Button, AsyncButton } from './index';
import { Save, Plus, Trash2, Download, ArrowRight } from 'lucide-react';

export const ButtonExamples: React.FC = () => {
  return (
    <div className="space-y-8 p-6">
      {/* Variants */}
      <section>
        <h2 className="text-xl font-bold mb-4">Button Variants</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="danger">Danger Button</Button>
          <Button variant="success">Success Button</Button>
        </div>
      </section>

      {/* Sizes */}
      <section>
        <h2 className="text-xl font-bold mb-4">Button Sizes</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </section>

      {/* With Icons */}
      <section>
        <h2 className="text-xl font-bold mb-4">Buttons with Icons</h2>
        <div className="flex flex-wrap gap-3">
          <Button icon={<Plus />} iconPosition="left">
            Add Item
          </Button>
          <Button variant="secondary" icon={<Save />} iconPosition="left">
            Save Changes
          </Button>
          <Button variant="ghost" icon={<Download />} iconPosition="left">
            Download
          </Button>
          <Button variant="danger" icon={<Trash2 />} iconPosition="left">
            Delete
          </Button>
          <Button icon={<ArrowRight />} iconPosition="right">
            Continue
          </Button>
        </div>
      </section>

      {/* Loading States */}
      <section>
        <h2 className="text-xl font-bold mb-4">Loading States</h2>
        <div className="flex flex-wrap gap-3">
          <Button loading>Loading...</Button>
          <Button variant="secondary" loading>
            Processing
          </Button>
          <Button variant="danger" loading>
            Deleting
          </Button>
        </div>
      </section>

      {/* Disabled States */}
      <section>
        <h2 className="text-xl font-bold mb-4">Disabled States</h2>
        <div className="flex flex-wrap gap-3">
          <Button disabled>Disabled Primary</Button>
          <Button variant="secondary" disabled>
            Disabled Secondary
          </Button>
          <Button variant="ghost" disabled>
            Disabled Ghost
          </Button>
        </div>
      </section>

      {/* Full Width */}
      <section>
        <h2 className="text-xl font-bold mb-4">Full Width Buttons</h2>
        <div className="space-y-3 max-w-md">
          <Button fullWidth>Full Width Primary</Button>
          <Button variant="secondary" fullWidth>
            Full Width Secondary
          </Button>
        </div>
      </section>

      {/* Async Buttons */}
      <section>
        <h2 className="text-xl font-bold mb-4">Async Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <AsyncButton
            variant="primary"
            onAsyncClick={async () => {
              await new Promise((resolve) => setTimeout(resolve, 2000));
            }}
            successMessage="Operation completed successfully!"
          >
            Save Data
          </AsyncButton>
          
          <AsyncButton
            variant="danger"
            icon={<Trash2 />}
            onAsyncClick={async () => {
              await new Promise((resolve) => setTimeout(resolve, 1500));
            }}
            successMessage="Item deleted"
          >
            Delete Item
          </AsyncButton>
          
          <AsyncButton
            variant="secondary"
            icon={<Download />}
            onAsyncClick={async () => {
              // Simulate download
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }}
            successMessage="Download started"
          >
            Download Report
          </AsyncButton>
        </div>
      </section>

      {/* Icon-Only Buttons (with aria-label for accessibility) */}
      <section>
        <h2 className="text-xl font-bold mb-4">Icon-Only Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="ghost"
            size="sm"
            icon={<Plus />}
            ariaLabel="Add new item"
          >
            <span className="sr-only">Add</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<Download />}
            ariaLabel="Download file"
          >
            <span className="sr-only">Download</span>
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 />}
            ariaLabel="Delete item"
          >
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </section>

      {/* Dropdown Trigger Buttons */}
      <section>
        <h2 className="text-xl font-bold mb-4">Dropdown Trigger Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="ghost"
            ariaHasPopup="menu"
            ariaExpanded={false}
          >
            Actions ▼
          </Button>
          <Button
            variant="secondary"
            ariaHasPopup="menu"
            ariaExpanded={false}
          >
            More Options ▼
          </Button>
        </div>
      </section>

      {/* Real-World Examples */}
      <section>
        <h2 className="text-xl font-bold mb-4">Real-World Examples</h2>
        
        {/* Form Actions */}
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-3">Form Actions</h3>
            <div className="flex gap-2">
              <Button variant="ghost">Cancel</Button>
              <AsyncButton
                variant="primary"
                onAsyncClick={async () => {
                  await new Promise((resolve) => setTimeout(resolve, 1500));
                }}
                successMessage="Form submitted successfully!"
              >
                Submit
              </AsyncButton>
            </div>
          </div>

          {/* Card Actions */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-3">Card Actions</h3>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" icon={<Download />}>
                Export
              </Button>
              <Button variant="secondary" size="sm" icon={<Save />}>
                Save
              </Button>
              <Button variant="danger" size="sm" icon={<Trash2 />}>
                Delete
              </Button>
            </div>
          </div>

          {/* Navigation Actions */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-3">Navigation Actions</h3>
            <div className="flex gap-2">
              <Button variant="ghost">Back</Button>
              <Button variant="primary" icon={<ArrowRight />} iconPosition="right">
                Continue
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ButtonExamples;
