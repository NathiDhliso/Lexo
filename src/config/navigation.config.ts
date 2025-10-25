import type { NavigationConfig, NavigationItem } from '../types';
import { UserTier } from '../types';
import { BarChart3, FileText, Users, FolderOpen, CreditCard, DollarSign, FileCheck, CheckSquare, ExternalLink, Clock, Building2, UserPlus, UsersRound } from 'lucide-react';

// Navigation items - Note: Profile and Settings are only in User Menu dropdown, not in main navigation
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
    id: 'firms',
    label: 'Firms',
    href: '/firms',
    page: 'firms',
    icon: Users,
    description: 'Manage instructing law firms',
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
          title: 'Quick Actions',
          items: [
            {
              id: 'create-proforma',
              label: 'Create Pro Forma',
              page: 'proforma-requests',
              icon: FileCheck,
              description: 'Create new quote request',
            },
          ],
        },
        {
          id: 'proforma-views',
          title: 'Views',
          items: [
            {
              id: 'view-proforma',
              label: 'All Requests',
              page: 'proforma-requests',
              icon: FileText,
              description: 'View and manage all requests',
            },
            {
              id: 'proforma-drafts',
              label: 'Draft Requests',
              page: 'proforma-requests',
              icon: FileCheck,
              description: 'Work on draft quotes',
              hash: 'status=draft',
            },
            {
              id: 'proforma-sent',
              label: 'Sent Requests',
              page: 'proforma-requests',
              icon: ExternalLink,
              description: 'View sent quotes awaiting response',
              hash: 'status=sent',
              isNew: true,
            },
          ],
        },
      ],
    },
    {
      id: 'firms',
      label: 'Firms',
      icon: Building2,
      page: 'firms',
      sections: [
        {
          id: 'firm-actions',
          title: 'Quick Actions',
          items: [
            {
              id: 'invite-attorney',
              label: 'Invite Attorney',
              action: 'invite-attorney',
              icon: UserPlus,
              description: 'Send attorney invitation',
              isNew: true,
            },
          ],
        },
        {
          id: 'firm-views',
          title: 'Views',
          items: [
            {
              id: 'view-firms',
              label: 'All Firms',
              page: 'firms',
              icon: Building2,
              description: 'View all law firms',
            },
            {
              id: 'firm-attorneys',
              label: 'Attorneys',
              page: 'firms',
              icon: UsersRound,
              description: 'View and manage attorneys',
              hash: 'view=attorneys',
            },
            {
              id: 'firm-pending',
              label: 'Pending Invitations',
              page: 'firms',
              icon: Clock,
              description: 'View pending attorney invites',
              hash: 'view=pending',
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
          title: 'Quick Actions',
          items: [
            {
              id: 'create-matter',
              label: 'Create Matter',
              action: 'create-matter',
              icon: FileText,
              description: 'Start new case',
            },
          ],
        },
        {
          id: 'matter-views',
          title: 'Views',
          items: [
            {
              id: 'view-matters',
              label: 'All Matters',
              page: 'matters',
              icon: FolderOpen,
              description: 'View all matters',
            },
            {
              id: 'active-matters',
              label: 'Active Matters',
              page: 'matters',
              icon: FileText,
              description: 'View active cases',
              hash: 'tab=active',
            },
            {
              id: 'new-requests',
              label: 'New Requests',
              page: 'matters',
              icon: FileCheck,
              description: 'View new matter requests',
              hash: 'tab=new_requests',
              isNew: true,
            },
          ],
        },
        {
          id: 'matter-tools',
          title: 'Tools',
          items: [
            {
              id: 'time-tracking',
              label: 'Time Tracking',
              page: 'matters',
              icon: Clock,
              description: 'Track billable hours',
              hash: 'view=time',
            },
            {
              id: 'documents',
              label: 'Documents',
              page: 'matters',
              icon: FolderOpen,
              description: 'Upload & manage files',
              hash: 'view=documents',
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
          title: 'Quick Actions',
          items: [
            {
              id: 'create-invoice',
              label: 'Create Invoice',
              action: 'create-invoice',
              icon: CreditCard,
              description: 'Generate new invoice',
            },
          ],
        },
        {
          id: 'invoice-views',
          title: 'Views',
          items: [
            {
              id: 'view-invoices',
              label: 'All Invoices',
              page: 'invoices',
              icon: FileText,
              description: 'View all invoices',
            },
            {
              id: 'draft-invoices',
              label: 'Draft Invoices',
              page: 'invoices',
              icon: FileCheck,
              description: 'Work on draft invoices',
              hash: 'status=draft',
            },
            {
              id: 'unpaid-invoices',
              label: 'Unpaid Invoices',
              page: 'invoices',
              icon: DollarSign,
              description: 'Track unpaid invoices',
              hash: 'status=sent',
            },
          ],
        },
        {
          id: 'invoice-tools',
          title: 'Tools',
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
              hash: 'tab=tracking',
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
