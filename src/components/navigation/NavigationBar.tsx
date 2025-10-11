import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, ChevronDown, Bell, User, LogOut, Settings } from 'lucide-react';
import lexoLogo from '../../Public/Assets/lexo-logo.png';
import { MegaMenu } from './MegaMenu';
import { MobileMegaMenu } from './MobileMegaMenu';
import GlobalCommandBar from './GlobalCommandBar';
import { RealTimeTicker } from './RealTimeTicker';
import AlertsDropdown from '../notifications/AlertsDropdown';
import { Button, Icon } from '../design-system/components';
import { NewMatterMultiStep } from '../matters/NewMatterMultiStep';
import { CreateProFormaModal } from '../proforma/CreateProFormaModal';
import { GenerateInvoiceModal } from '../invoices/GenerateInvoiceModal';

import { navigationConfig, getFilteredNavigationConfig } from '../../config/navigation.config';
import { useKeyboardShortcuts, useClickOutside } from '../../hooks';
import { smartNotificationsService } from '../../services/smart-notifications.service';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { ThemeToggle } from '../common/ThemeToggle';
import type { 
  NavigationState, 
  Page, 
  UserTier
} from '../../types';
import type { NotificationBadge, SmartNotification } from '../../services/smart-notifications.service';
import { useNavigate } from 'react-router-dom';

interface NavigationBarProps {
  activePage: Page;
  onPageChange: (page: Page) => void;
  userTier: UserTier;
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  activePage,
  onPageChange,
  userTier,
}) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  // Navigation state
  const [navigationState, setNavigationState] = useState<NavigationState>({
    activePage,
    activeCategory: null,
    hoveredCategory: null,
    megaMenuOpen: false,
    mobileMenuOpen: false,
  });

  // UI state
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [commandBarOpen, setCommandBarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Modal state
  const [modalState, setModalState] = useState({
    createMatter: false,
    createProForma: false,
    generateInvoice: false
  });

  // Notification state
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [notificationBadges, setNotificationBadges] = useState<NotificationBadge[]>([]);

  // Refs
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const alertsRef = useRef<HTMLDivElement>(null);

  // Get filtered navigation config based on user tier
  const filteredConfig = getFilteredNavigationConfig(navigationConfig, userTier);

  // Handle scroll for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle category hover
  const handleCategoryHover = (categoryId: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    setNavigationState(prev => ({
      ...prev,
      hoveredCategory: categoryId,
      activeCategory: categoryId,
      megaMenuOpen: true
    }));
  };

  // Handle category leave
  const handleCategoryLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    hoverTimeoutRef.current = setTimeout(() => {
      setNavigationState(prev => ({
        ...prev,
        hoveredCategory: null,
        megaMenuOpen: false,
        activeCategory: null
      }));
    }, 150); // Short delay to allow moving to mega menu
  };

  // Handle mega menu hover
  const handleMegaMenuHover = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  // Handle mega menu leave
  const handleMegaMenuLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setNavigationState(prev => ({
        ...prev,
        hoveredCategory: null,
        megaMenuOpen: false,
        activeCategory: null
      }));
    }, 150);
  };

  // Handle mobile menu toggle with improved animation
  const handleMobileMenuToggle = () => {
    setNavigationState(prev => ({
      ...prev,
      mobileMenuOpen: !prev.mobileMenuOpen
    }));
    
    // Prevent body scroll when menu is open
    if (!navigationState.mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  // Close mobile menu and restore scroll
  const closeMobileMenu = () => {
    setNavigationState(prev => ({ ...prev, mobileMenuOpen: false }));
    document.body.style.overflow = '';
  };

  // Handle page navigation
  const handlePageNavigation = (page: Page) => {
    onPageChange(page);
    setNavigationState(prev => ({
      ...prev,
      activePage: page,
      megaMenuOpen: false,
      mobileMenuOpen: false,
      activeCategory: null,
      hoveredCategory: null
    }));
    
    // Restore body scroll
    document.body.style.overflow = '';
  };

  // Handle action clicks
  const handleActionClick = (action: string) => {
    switch (action) {
      case 'create-matter':
        setModalState(prev => ({ ...prev, createMatter: true }));
        break;
      case 'create-proforma':
        setModalState(prev => ({ ...prev, createProForma: true }));
        break;
      case 'quick-invoice':
      case 'create-invoice':
        setModalState(prev => ({ ...prev, generateInvoice: true }));
        break;
      default:
        console.log('Action clicked:', action);
    }
    
    // Close menus
    setNavigationState(prev => ({
      ...prev,
      megaMenuOpen: false,
      mobileMenuOpen: false,
    }));
    
    // Restore body scroll
    document.body.style.overflow = '';
  };

  // Click outside handlers
  useClickOutside(userMenuRef, () => setUserMenuOpen(false));
  useClickOutside(alertsRef, () => setAlertsOpen(false));

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'k',
      ctrlKey: true,
      action: () => setCommandBarOpen(true),
      description: 'Open command bar'
    },
    {
      key: 'Escape',
      action: () => {
        setNavigationState(prev => ({
          ...prev,
          megaMenuOpen: false,
          mobileMenuOpen: false
        }));
        setCommandBarOpen(false);
        setUserMenuOpen(false);
        setAlertsOpen(false);
        document.body.style.overflow = '';
      },
      description: 'Close menus'
    }
  ]);

  // Load notifications
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const notifs = await smartNotificationsService.getNotifications();
        const badge = await smartNotificationsService.getBadgeInfo();
        setNotifications(notifs);
        setNotificationBadges([badge]);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    };

    loadNotifications();
  }, []);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  // Calculate total notification count
  const totalNotificationCount = notificationBadges.reduce((sum, badge) => sum + badge.count, 0);

  return (
    <>
      {/* Main Navigation Bar */}
      <nav 
         className={`sticky top-0 z-50 w-full transition-all duration-300 ${
           isScrolled 
             ? 'bg-white/95 dark:bg-metallic-gray-900/95 backdrop-blur-md shadow-lg border-b border-neutral-200/50 dark:border-metallic-gray-700/50' 
             : 'bg-white dark:bg-metallic-gray-900 border-b border-neutral-200 dark:border-metallic-gray-700'
         }`}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Real-time ticker */}
        <RealTimeTicker />

        <div className="w-full max-w-full px-3 sm:px-4 md:px-6">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3 md:gap-4">
              <button
                onClick={() => handlePageNavigation('dashboard')}
                className="flex items-center gap-2 md:gap-3 group transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-mpondo-gold-500 focus:ring-offset-2 rounded-lg p-1"
                aria-label="Go to dashboard"
              >
                <img 
                  src={lexoLogo} 
                  alt="LexoHub" 
                  className="h-8 w-8 md:h-10 md:w-10 object-contain transition-transform group-hover:rotate-3" 
                />
                <span className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-mpondo-gold-600 to-judicial-blue-600 bg-clip-text text-transparent">
                  LexoHub
                </span>
              </button>
            </div>

            {/* Desktop Navigation - Hidden on mobile */}
            <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {filteredConfig.categories.map((category) => {
                const isActive = activePage === category.page;
                const isHovered = navigationState.hoveredCategory === category.id;
                
                return (
                  <div
                    key={category.id}
                    className="relative"
                    onMouseEnter={() => handleCategoryHover(category.id)}
                    onMouseLeave={handleCategoryLeave}
                  >
                    <button
                      onClick={() => category.page && handlePageNavigation(category.page)}
                      className={`flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg text-sm lg:text-base font-medium transition-all duration-200 min-h-[44px] ${
                        isActive || isHovered
                          ? 'bg-mpondo-gold-100 dark:bg-mpondo-gold-900/30 text-mpondo-gold-900 dark:text-mpondo-gold-400 px-4 py-2 text-sm font-medium text-center'
                          : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-metallic-gray-800 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200'
                      }`}
                      aria-expanded={navigationState.megaMenuOpen && navigationState.activeCategory === category.id}
                      aria-haspopup="menu"
                    >
                      <Icon icon={category.icon} className="w-4 h-4 lg:w-5 lg:h-5" />
                      <span className="hidden lg:inline">{category.label}</span>
                      <ChevronDown className={`w-3 h-3 lg:w-4 lg:h-4 transition-transform duration-200 ${
                        navigationState.megaMenuOpen && navigationState.activeCategory === category.id ? 'rotate-180' : ''
                      }`} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Search - Desktop only */}
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:flex items-center gap-2 min-h-[44px]"
                onClick={() => setCommandBarOpen(true)}
                aria-label="Open search (Ctrl+K)"
              >
                <Icon icon={Search} className="w-4 h-4" />
                <span className="hidden lg:inline text-sm text-neutral-500 dark:text-neutral-400">
                  Search...
                </span>
                <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-1 text-xs bg-neutral-100 dark:bg-metallic-gray-700 rounded border">
                  ⌘K
                </kbd>
              </Button>

              {/* Quick Actions */}
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:flex items-center gap-2 min-h-[44px] bg-mpondo-gold-500 hover:bg-mpondo-gold-600 dark:bg-mpondo-gold-600 dark:hover:bg-mpondo-gold-700 text-white dark:text-metallic-gray-900 shadow-sm hover:shadow-md transition-all"
                onClick={() => handleActionClick('create-matter')}
                aria-label="Quick create"
              >
                <Icon icon={Plus} className="w-4 h-4" />
                <span className="hidden lg:inline">Create</span>
              </Button>

              {/* Notifications */}
              <div className="relative" ref={alertsRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative min-h-[44px] min-w-[44px]"
                  onClick={() => setAlertsOpen(!alertsOpen)}
                  aria-label={`Notifications ${totalNotificationCount > 0 ? `(${totalNotificationCount} unread)` : ''}`}
                >
                  <Icon icon={Bell} className="w-4 h-4 md:w-5 md:h-5" />
                  {totalNotificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-status-error-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      {totalNotificationCount > 99 ? '99+' : totalNotificationCount}
                    </span>
                  )}
                </Button>
                
                {alertsOpen && (
                  <AlertsDropdown
                    notifications={notifications}
                    badges={notificationBadges}
                    onClose={() => setAlertsOpen(false)}
                    onNotificationClick={(notification) => {
                      if (notification.actionUrl) {
                        handlePageNavigation(notification.actionUrl as Page);
                      }
                      setAlertsOpen(false);
                    }}
                  />
                )}
              </div>

              {/* Theme Toggle - Desktop only */}
              <div className="hidden md:block">
                <ThemeToggle />
              </div>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 min-h-[44px]"
                  aria-label="User menu"
                  onClick={() => setUserMenuOpen((open) => !open)}
                >
                  <Icon icon={User} className="w-4 h-4" />
                  <span className="hidden sm:inline">{user?.email?.split('@')[0] || 'User'}</span>
                  <Icon icon={ChevronDown} className={`w-3 h-3 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </Button>
                {userMenuOpen && (
                   <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-metallic-gray-800 border border-neutral-200 dark:border-metallic-gray-700 rounded-lg shadow-lg z-50">
                     <div className="py-1">
                       <button
                         onClick={() => {
                           onPageChange('settings');
                           setUserMenuOpen(false);
                         }}
                         className="flex items-center gap-2 w-full px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-metallic-gray-700 transition-colors min-h-[44px]"
                       >
                         <Icon icon={Settings} className="w-4 h-4" />
                         Settings
                       </button>
                       <hr className="my-1 border-neutral-200 dark:border-metallic-gray-700" />
                       <button
                         onClick={handleSignOut}
                         className="flex items-center gap-2 w-full px-4 py-2 text-sm text-status-error-600 dark:text-status-error-400 hover:bg-status-error-50 dark:hover:bg-status-error-900/20 transition-colors min-h-[44px]"
                       >
                         <Icon icon={LogOut} className="w-4 h-4" />
                         Sign Out
                       </button>
                     </div>
                   </div>
                 )}
              </div>

              {/* Mobile Menu Toggle - Enhanced */}
              <button
                onClick={handleMobileMenuToggle}
                className="md:hidden mobile-menu-toggle relative z-50 flex items-center justify-center min-h-[48px] min-w-[48px] rounded-xl bg-gradient-to-br from-mpondo-gold-500 to-mpondo-gold-600 dark:from-mpondo-gold-600 dark:to-mpondo-gold-700 hover:from-mpondo-gold-600 hover:to-mpondo-gold-700 dark:hover:from-mpondo-gold-500 dark:hover:to-mpondo-gold-600 shadow-md hover:shadow-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-mpondo-gold-500 dark:focus:ring-mpondo-gold-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-metallic-gray-900"
                aria-label={navigationState.mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={navigationState.mobileMenuOpen}
              >
                <div className="relative w-6 h-6">
                  {/* Hamburger to X animation */}
                  <span className={`absolute left-0 top-1 w-6 h-0.5 bg-white dark:bg-metallic-gray-900 transition-all duration-300 ease-in-out ${
                    navigationState.mobileMenuOpen ? 'rotate-45 translate-y-2' : ''
                  }`} />
                  <span className={`absolute left-0 top-3 w-6 h-0.5 bg-white dark:bg-metallic-gray-900 transition-all duration-300 ease-in-out ${
                    navigationState.mobileMenuOpen ? 'opacity-0' : ''
                  }`} />
                  <span className={`absolute left-0 top-5 w-6 h-0.5 bg-white dark:bg-metallic-gray-900 transition-all duration-300 ease-in-out ${
                    navigationState.mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
                  }`} />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Mega Menu */}
        {navigationState.megaMenuOpen && navigationState.activeCategory && (
          <div
            ref={megaMenuRef}
            onMouseEnter={handleMegaMenuHover}
            onMouseLeave={handleMegaMenuLeave}
            className="hidden md:block absolute top-full left-0 w-full bg-white dark:bg-metallic-gray-900 border-b border-neutral-200 dark:border-metallic-gray-700 shadow-soft z-40"
          >
            <MegaMenu
              category={filteredConfig.categories.find(c => c.id === navigationState.activeCategory)!}
              onItemClick={handlePageNavigation}
              onActionClick={handleActionClick}
              userTier={userTier}
            />
          </div>
        )}
      </nav>

      {/* Mobile Menu - Enhanced */}
      {navigationState.mobileMenuOpen && (
        <MobileMegaMenu
          categories={filteredConfig.categories}
          onItemClick={handlePageNavigation}
          onActionClick={handleActionClick}
          userTier={userTier}
          activePage={navigationState.activePage}
          onClose={closeMobileMenu}
        />
      )}

      {/* Global Command Bar Modal */}
      {commandBarOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl">
            <GlobalCommandBar
              onNavigate={handlePageNavigation}
              onAction={handleActionClick}
            />
          </div>
          <button
            onClick={() => setCommandBarOpen(false)}
            className="absolute inset-0 w-full h-full cursor-default"
            aria-label="Close search"
          />
        </div>
      )}

      {/* Modals */}
      {modalState.createMatter && (
        <NewMatterMultiStep
          isOpen={modalState.createMatter}
          onClose={() => setModalState(prev => ({ ...prev, createMatter: false }))}
          onComplete={(newMatter) => {
            setModalState(prev => ({ ...prev, createMatter: false }));
            toast.success(`Matter "${newMatter.title}" created successfully`);
            handlePageNavigation('matters');
          }}
        />
      )}

      {modalState.createProForma && (
        <CreateProFormaModal
          isOpen={modalState.createProForma}
          onClose={() => setModalState(prev => ({ ...prev, createProForma: false }))}
          onSuccess={() => {
            setModalState(prev => ({ ...prev, createProForma: false }));
            toast.success('Pro Forma request created successfully');
            handlePageNavigation('proforma-requests');
          }}
        />
      )}

      {modalState.generateInvoice && (
        <GenerateInvoiceModal
          isOpen={modalState.generateInvoice}
          onClose={() => setModalState(prev => ({ ...prev, generateInvoice: false }))}
          onSuccess={() => {
            setModalState(prev => ({ ...prev, generateInvoice: false }));
            toast.success('Invoice generated successfully');
            handlePageNavigation('invoices');
          }}
        />
      )}  
  </>
  );
};
