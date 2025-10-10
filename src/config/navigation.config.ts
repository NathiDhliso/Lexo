import type { NavigationConfig, NavigationItem } from '../types';
import { UserTier } from '../types';
import { BarChart3, Settings, FileText, Users, FolderOpen, CreditCard, TrendingUp, DollarSign, FileCheck, CheckSquare, ExternalLink, Clock } from 'lucide-react';

// Navigation items
const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    page: 'dashboard',
    icon: BarChart3,
    description: 'Overview of your practice',
  },
  {
    id: 'proforma-requests',
    label: 'Pro Forma',
    href: '/proforma-requests',
    page: 'proforma-requests',
    icon: FileCheck,
    description: 'Manage quotes and estimates',
    isNew: true,
  },
  {
    id: 'matters',
    label: 'Matters',
    href: '/matters',
    page: 'matters',
    icon: FileText,
    description: 'Manage your cases and matters',
  },
  {
    id: 'invoices',
    label: 'Invoices',
    href: '/invoices',
    page: 'invoices',
    icon: CreditCard,
    description: 'Invoicing and billing',
  },
  {
    id: 'partner-approval',
    label: 'Partner Approval',
    href: '/partner-approval',
    page: 'partner-approval',
    icon: CheckSquare,
    description: 'Review billing readiness',
    isNew: true,
  },
  {
    id: 'profile',
    label: 'Profile',
    href: '/profile',
    page: 'profile',
    icon: Users,
    description: 'Your profile and preferences',
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    page: 'settings',
    icon: Settings,
    description: 'Application settings',
  },
];

// Navigation configuration with categories
export const navigationConfig: NavigationConfig = {
  categories: [
    {
      id: 'proforma',
      label: 'Pro Forma',
      icon: FileCheck,
      sections: [
        {
          id: 'proforma-actions',
          title: 'Actions',
          items: [
            {
              id: 'create-proforma',
              label: 'Create Pro Forma',
              page: 'proforma-requests',
              icon: FileCheck,
              description: 'Create new quote request',
            },
            {
              id: 'view-proforma',
              label: 'View All Requests',
              page: 'proforma-requests',
              icon: FileText,
              description: 'Manage all pro forma requests',
            },
          ],
        },
        {
          id: 'proforma-features',
          title: 'Features',
          items: [
            {
              id: 'attorney-links',
              label: 'Attorney Portal Links',
              page: 'proforma-requests',
              icon: ExternalLink,
              description: 'Generate & send attorney links',
              isNew: true,
            },
            {
              id: 'rate-cards',
              label: 'Rate Cards',
              page: 'proforma-requests',
              icon: CreditCard,
              description: 'Pricing & estimates',
            },
          ],
        },
      ],
    },
    {
      id: 'matters',
      label: 'Matters',
      icon: FileText,
      sections: [
        {
          id: 'matter-actions',
          title: 'Actions',
          items: [
            {
              id: 'create-matter',
              label: 'Create Matter',
              page: 'matters',
              icon: FileText,
              description: 'Start new case',
            },
            {
              id: 'view-matters',
              label: 'View All Matters',
              page: 'matters',
              icon: FolderOpen,
              description: 'Manage all cases',
            },
          ],
        },
        {
          id: 'matter-features',
          title: 'Features',
          items: [
            {
              id: 'time-tracking',
              label: 'Time Entries',
              page: 'matters',
              icon: Clock,
              description: 'Track billable hours',
            },
            {
              id: 'documents',
              label: 'Documents',
              page: 'matters',
              icon: FolderOpen,
              description: 'Upload & manage files',
              isNew: true,
            },
            {
              id: 'scope-amendments',
              label: 'Scope Amendments',
              page: 'matters',
              icon: TrendingUp,
              description: 'Manage scope changes',
            },
          ],
        },
      ],
    },
    {
      id: 'invoicing',
      label: 'Invoicing',
      icon: CreditCard,
      sections: [
        {
          id: 'invoice-actions',
          title: 'Actions',
          items: [
            {
              id: 'create-invoice',
              label: 'Create Invoice',
              page: 'invoices',
              icon: CreditCard,
              description: 'Generate new invoice',
            },
            {
              id: 'view-invoices',
              label: 'View All Invoices',
              page: 'invoices',
              icon: FileText,
              description: 'Manage all invoices',
            },
          ],
        },
        {
          id: 'invoice-features',
          title: 'Features',
          items: [
            {
              id: 'partner-approval',
              label: 'Partner Approval',
              page: 'partner-approval',
              icon: CheckSquare,
              description: 'Review billing readiness',
              isNew: true,
            },
            {
              id: 'payment-tracking',
              label: 'Payment Tracking',
              page: 'invoices',
              icon: DollarSign,
              description: 'Track payments & reminders',
            },
          ],
        },
      ],
    },
  ],
};

// Helper function to get user tier level for comparison
const getUserTierLevel = (tier: UserTier): number => {
  switch (tier) {
    case UserTier.JUNIOR_START:
      return 1;
    case UserTier.ADVOCATE_PRO:
      return 2;
    case UserTier.SENIOR_ADVOCATE:
      return 3;
    case UserTier.CHAMBERS_ENTERPRISE:
      return 4;
    default:
      return 0;
  }
};

// Function to filter navigation items based on user tier
export const getAccessibleNavigationItems = (
  items: NavigationItem[], 
  userTier: UserTier
): NavigationItem[] => {
  const userTierLevel = getUserTierLevel(userTier);
  
  return items.filter(item => {
    // If no minimum tier is specified, item is accessible to all
    if (!item.minTier) {
      return true;
    }
    
    // Check if user's tier level meets the minimum requirement
    const requiredTierLevel = getUserTierLevel(item.minTier);
    return userTierLevel >= requiredTierLevel;
  });
};

// Function to get filtered navigation configuration based on user tier
export const getFilteredNavigationConfig = (userTier: UserTier): NavigationConfig => {
  const filteredCategories = navigationConfig.categories.map(category => ({
    ...category,
    sections: category.sections.map(section => ({
      ...section,
      items: getAccessibleNavigationItems(section.items, userTier)
    })).filter(section => section.items.length > 0)
  })).filter(category => category.sections.length > 0);

  return {
    ...navigationConfig,
    categories: filteredCategories
  };
};

export default navigationConfig;
