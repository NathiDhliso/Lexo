import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { Plus, Download, Trash2, Check, ArrowRight } from 'lucide-react';

/**
 * Button Component Documentation
 * 
 * The Button component is a comprehensive, accessible button implementation
 * following the LexoHub design system with Mpondo Gold and Judicial Blue theme colors.
 * 
 * ## Features
 * - Multiple variants (primary, secondary, ghost, danger, success)
 * - Three sizes (sm, md, lg) with proper touch targets (minimum 44x44px)
 * - Loading states with spinner
 * - Icon support with left/right positioning
 * - Full accessibility support (ARIA attributes, keyboard navigation)
 * - Responsive design with mobile-first approach
 * 
 * ## Accessibility
 * - Minimum 44x44px touch targets for mobile
 * - ARIA attributes for screen readers
 * - Keyboard navigation support (Tab, Enter, Space)
 * - Visible focus indicators
 * - Disabled state properly communicated
 * 
 * ## Usage Guidelines
 * - Use `primary` for main actions (Save, Submit, Create)
 * - Use `secondary` for alternative actions (Cancel, Back)
 * - Use `ghost` for tertiary actions (View Details, Learn More)
 * - Use `danger` for destructive actions (Delete, Remove)
 * - Use `success` for positive confirmations (Approve, Confirm)
 */
const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile button component with multiple variants, sizes, and states.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger', 'success'],
      description: 'Visual style variant of the button',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the button',
    },
    loading: {
      control: 'boolean',
      description: 'Shows loading spinner and disables interaction',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the button',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Makes button take full width of container',
    },
    iconPosition: {
      control: 'select',
      options: ['left', 'right'],
      description: 'Position of the icon relative to text',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Primary Button
 * 
 * Use for main actions like "Save", "Submit", "Create"
 */
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

/**
 * Secondary Button
 * 
 * Use for alternative actions like "Cancel", "Back"
 */
export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

/**
 * Ghost Button
 * 
 * Use for tertiary actions like "View Details", "Learn More"
 */
export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
};

/**
 * Danger Button
 * 
 * Use for destructive actions like "Delete", "Remove"
 */
export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Danger Button',
  },
};

/**
 * Success Button
 * 
 * Use for positive confirmations like "Approve", "Confirm"
 */
export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Success Button',
  },
};

/**
 * Small Size
 * 
 * Compact button for tight spaces
 */
export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small Button',
  },
};

/**
 * Medium Size (Default)
 * 
 * Standard button size for most use cases
 */
export const Medium: Story = {
  args: {
    size: 'md',
    children: 'Medium Button',
  },
};

/**
 * Large Size
 * 
 * Prominent button for important actions
 */
export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large Button',
  },
};

/**
 * With Icon (Left)
 * 
 * Button with icon on the left side
 */
export const WithIconLeft: Story = {
  args: {
    icon: <Plus />,
    iconPosition: 'left',
    children: 'Add Item',
  },
};

/**
 * With Icon (Right)
 * 
 * Button with icon on the right side
 */
export const WithIconRight: Story = {
  args: {
    icon: <ArrowRight />,
    iconPosition: 'right',
    children: 'Continue',
  },
};

/**
 * Icon Only
 * 
 * Button with only an icon (remember to add aria-label)
 */
export const IconOnly: Story = {
  args: {
    icon: <Download />,
    ariaLabel: 'Download file',
    children: undefined,
  },
};

/**
 * Loading State
 * 
 * Button showing loading spinner
 */
export const Loading: Story = {
  args: {
    loading: true,
    children: 'Loading...',
  },
};

/**
 * Disabled State
 * 
 * Button in disabled state
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled Button',
  },
};

/**
 * Full Width
 * 
 * Button that takes full width of container
 */
export const FullWidth: Story = {
  args: {
    fullWidth: true,
    children: 'Full Width Button',
  },
  parameters: {
    layout: 'padded',
  },
};

/**
 * All Variants
 * 
 * Showcase of all button variants
 */
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="success">Success</Button>
    </div>
  ),
};

/**
 * All Sizes
 * 
 * Showcase of all button sizes
 */
export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

/**
 * Common Patterns
 * 
 * Real-world button usage examples
 */
export const CommonPatterns: Story = {
  render: () => (
    <div className="flex flex-col gap-6 p-6">
      {/* Form Actions */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Form Actions</h3>
        <div className="flex gap-3">
          <Button variant="primary">Save Changes</Button>
          <Button variant="ghost">Cancel</Button>
        </div>
      </div>

      {/* Create Actions */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Create Actions</h3>
        <div className="flex gap-3">
          <Button variant="secondary" icon={<Plus />}>
            New Matter
          </Button>
          <Button variant="secondary" icon={<Plus />}>
            New Invoice
          </Button>
        </div>
      </div>

      {/* Destructive Actions */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Destructive Actions</h3>
        <div className="flex gap-3">
          <Button variant="danger" icon={<Trash2 />}>
            Delete
          </Button>
          <Button variant="ghost">Cancel</Button>
        </div>
      </div>

      {/* Success Actions */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Success Actions</h3>
        <Button variant="success" icon={<Check />}>
          Approve
        </Button>
      </div>

      {/* Icon Buttons */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Icon Buttons</h3>
        <div className="flex gap-3">
          <Button variant="ghost" icon={<Download />} ariaLabel="Download" />
          <Button variant="ghost" icon={<Trash2 />} ariaLabel="Delete" />
          <Button variant="ghost" icon={<Plus />} ariaLabel="Add" />
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

/**
 * Accessibility Example
 * 
 * Buttons with proper ARIA attributes
 */
export const AccessibilityExample: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Button
        icon={<Download />}
        ariaLabel="Download report"
        ariaHasPopup="menu"
      >
        Download
      </Button>
      <Button
        icon={<Plus />}
        ariaLabel="Create new item"
        ariaExpanded={false}
      >
        Create
      </Button>
    </div>
  ),
};

/**
 * Mobile Touch Targets
 * 
 * All buttons meet minimum 44x44px touch target size
 */
export const MobileTouchTargets: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4 bg-neutral-100 dark:bg-neutral-800">
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
        All buttons meet the minimum 44x44px touch target size for mobile accessibility
      </p>
      <div className="flex gap-3">
        <Button size="sm">Small (44px)</Button>
        <Button size="md">Medium (44px)</Button>
        <Button size="lg">Large (48px)</Button>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};
