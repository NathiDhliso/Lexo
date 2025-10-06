import { BarChart3, Briefcase, FileText, Receipt, User } from 'lucide-react';

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: any;
  description?: string;
}

export const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: BarChart3,
    description: 'Overview of matters, pro formas, and invoices'
  },
  {
    id: 'matters',
    label: 'Matters',
    path: '/matters',
    icon: Briefcase,
    description: 'Manage your legal matters'
  },
  {
    id: 'proforma',
    label: 'Pro Forma',
    path: '/proforma',
    icon: FileText,
    description: 'Create and manage pro forma invoices'
  },
  {
    id: 'invoices',
    label: 'Invoices',
    path: '/invoices',
    icon: Receipt,
    description: 'Manage invoices and payments'
  },
  {
    id: 'profile',
    label: 'Profile',
    path: '/profile',
    icon: User,
    description: 'Your profile and settings'
  }
];

export const navigationConfig = {
  items: navigationItems
};

export default navigationConfig;
