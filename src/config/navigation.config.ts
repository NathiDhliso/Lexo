import type { NavigationConfig, NavigationItem, TypedNavigationItem, NavigationCategory } from '../types';
import { UserTier } from '../types';
import { BarChart3, Building2, Settings, FileText, Users, Calendar, FolderOpen, CreditCard, TrendingUp, DollarSign } from 'lucide-react';

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
    id: 'matters',
    label: 'Matters',
    href: '/matters',
    page: 'matters',
    icon: FileText,
    description: 'Manage your cases and matters',
  },
  {
    id: 'clients',
    label: 'Clients',
    href: '/clients',
    page: 'clients',
    icon: Users,
    description: 'Client management and relationships',
  },
  {
    id: 'calendar',
    label: 'Calendar',
    href: '/calendar',
    page: 'calendar',
    icon: Calendar,
    description: 'Schedule and appointments',
  },
  {
    id: 'documents',
    label: 'Documents',
    href: '/documents',
    page: 'documents',
    icon: FolderOpen,
    description: 'Document management system',
  },
  {
    id: 'billing',
    label: 'Billing',
    href: '/billing',
    page: 'billing',
    icon: CreditCard,
    description: 'Invoicing and financial management',
  },
  {
    id: 'rate-cards',
    label: 'Rate Cards',
    href: '/rate-cards',
    page: 'rate-cards',
    icon: DollarSign,
    description: 'Manage pricing and rate structures',
  },
  {
    id: 'reports',
    label: 'Reports',
    href: '/reports',
    page: 'reports',
    icon: TrendingUp,
    description: 'Analytics and reporting',
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    page: 'settings',
    icon: Settings,
    description: 'Application settings and preferences',
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
          label: 'Main',
          items: [
            navigationItems.find(item => item.id === 'dashboard')!,
            navigationItems.find(item => item.id === 'matters')!,
            navigationItems.find(item => item.id === 'clients')!,
          ],
        },
        {
          id: 'productivity',
          label: 'Productivity',
          items: [
            navigationItems.find(item => item.id === 'calendar')!,
            navigationItems.find(item => item.id === 'documents')!,
          ],
        },
      ],
    },
    {
      id: 'business',
      label: 'Business Management',
      icon: Building2,
      sections: [
        {
          id: 'financial',
          label: 'Financial',
          items: [
            navigationItems.find(item => item.id === 'billing')!,
            navigationItems.find(item => item.id === 'rate-cards')!,
            navigationItems.find(item => item.id === 'reports')!,
          ],
        },
      ],
    },
    {
      id: 'system',
      label: 'System',
      icon: Settings,
      sections: [
        {
          id: 'configuration',
          label: 'Configuration',
          items: [
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
