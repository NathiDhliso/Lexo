import type { NavigationConfig, NavigationItem, TypedNavigationItem, NavigationCategory } from '../types';
import { UserTier } from '../types';
import { BarChart3, Building2, Settings, FileText, Users, Calendar, FolderOpen, CreditCard, TrendingUp, DollarSign, Layout, FileCheck } from 'lucide-react';

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
      id: 'core',
      label: 'Core Features',
      icon: BarChart3,
      sections: [
        {
          id: 'main',
          title: 'Workflow',
          items: [
            navigationItems.find(item => item.id === 'dashboard')!,
            navigationItems.find(item => item.id === 'proforma-requests')!,
            navigationItems.find(item => item.id === 'matters')!,
            navigationItems.find(item => item.id === 'invoices')!,
          ],
        },
        {
          id: 'system',
          title: 'System',
          items: [
            navigationItems.find(item => item.id === 'profile')!,
            navigationItems.find(item => item.id === 'settings')!,
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
  items: TypedNavigationItem[], 
  userTier: UserTier
): TypedNavigationItem[] => {
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
