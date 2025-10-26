import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, Search, Plus, ChevronDown, Bell, User, LogOut, Settings } from 'lucide-react';
import lexoLogo from '../../Public/Assets/lexo-logo.png';
import { Button, Icon } from '../design-system/components';
import { MegaMenu } from './MegaMenu';
import { MobileMegaMenu } from './MobileMegaMenu';
import GlobalCommandBar from './GlobalCommandBar';
import { RealTimeTicker, TickerItem } from './RealTimeTicker';
import AlertsDropdown from '../notifications/AlertsDropdown';
import { NewMatterMultiStep } from '../matters/NewMatterMultiStep';

import { navigationConfig, getFilteredNavigationConfig } from '../../config/navigation.config';
import { useKeyboardShortcuts, useClickOutside } from '../../hooks';
import { smartNotificationsService } from '../../services/smart-notifications.service';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { ThemeToggle } from '../common/ThemeToggle';
import type { 
  NavigationCategory, 
  NavigationState, 
  Page, 
  UserTier,
  NavigationA11y 
} from '../../types';
import { UserTier as UserTierValue } from '../../types';
import type { NotificationBadge, SmartNotification } from '../../services/smart-notifications.service';
import { useNavigate } from 'react-router-dom';

interface NavigationBarProps {
  activePage: Page;
  onPageChange: (page: Page) => void;
  userTier?: UserTier;
  className?: string;
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  activePage,
  onPageChange,
  userTier = UserTierValue.JUNIOR_START,
  className = '',
  onToggleSidebar,
  sidebarOpen
}) => {
  const [navigationState, setNavigationState] = useState<NavigationState>({
    activeCategory: null,
    activePage,
    megaMenuOpen: false,
    mobileMenuOpen: false,
    hoveredCategory: null
  });

  const [commandBarOpen, setCommandBarOpen] = useState(false);
  const [notificationBadges, setNotificationBadges] = useState<NotificationBadge[]>([]);
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  // Modal state management
  const [modalState, setModalState] = useState({
    createMatter: false,
    createProForma: false,
    createInvoice: false
  });
  
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navBarRef = useRef<HTMLElement>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const commandBarRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const { user, signOut } = useAuth();

  // Get filtered navigation config based on user tier
  const filteredConfig = getFilteredNavigationConfig(userTier);

  // Handle category hover with delay
  const handleCategoryHover = (categoryId: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    hoverTimeoutRef.current = setTimeout(() => {
      setNavigationState(prev => ({
        ...prev,
        hoveredCategory: categoryId,
        megaMenuOpen: true,
        activeCategory: categoryId
      }));
    }, 300); // 300ms hover delay as per PRD
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

  // Handle action clicks for modal opening
  const handleActionClick = (action: string) => {
    // Close mega menu when action is triggered
    setNavigationState(prev => ({
      ...prev,
      megaMenuOpen: false,
      mobileMenuOpen: false,
      activeCategory: null,
      hoveredCategory: null
    }));

    // Open appropriate modal based on action
    switch (action) {
      case 'create-matter':
        setModalState(prev => ({ ...prev, createMatter: true }));
        break;
      case 'create-proforma':
        handlePageNavigation('proforma-requests');
        toast.success('Opening Pro Forma creation...');
        break;
      case 'create-invoice':
        setModalState(prev => ({ ...prev, createInvoice: true }));
        break;
      default:
        console.warn(`Unknown action: ${action}`);
        break;
    }
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
  };

  // New: handle ticker item clicks that may include full paths or page keys
  const navigate = useNavigate();
  const handleTickerItemClick = (item: TickerItem) => {
    const target = item?.navigateTo;
    if (!target) return;
    const pageKeys: string[] = [
      'dashboard',
      'proforma-requests',
      'matters',
      'matter-workbench',
      'invoices',
      'partner-approval',
      'profile',
      'settings',
      'reports'
    ];

    if (pageKeys.includes(target)) {
      handlePageNavigation(target as Page);
      return;
    }

    if (target.startsWith('/')) {
      // Map detail paths to base pages since router doesn't define :id routes yet
      if (target.startsWith('/invoices')) {
        handlePageNavigation('invoices');
        return;
      }
      if (target.startsWith('/matters')) {
        handlePageNavigation('matters');
        return;
      }
      if (target.startsWith('/proforma')) {
        handlePageNavigation('proforma-requests');
        return;
      }
      // Fallback to direct navigation for other paths
      navigate(target);
      setNavigationState(prev => ({
        ...prev,
        megaMenuOpen: false,
        mobileMenuOpen: false,
        activeCategory: null,
        hoveredCategory: null
      }));
    }
  };

  // Handle mobile menu toggle
  const toggleMobileMenu = () => {
    setNavigationState(prev => ({
      ...prev,
      mobileMenuOpen: !prev.mobileMenuOpen
    }));
  };

  // Handle command bar toggle
  const toggleCommandBar = () => {
    setCommandBarOpen(!commandBarOpen);
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
    setUserMenuOpen(false);
  };

  // Alerts dropdown state
  const [alertsOpen, setAlertsOpen] = useState(false);
  const alertsRef = useRef<HTMLDivElement>(null);
  useClickOutside(alertsRef, () => setAlertsOpen(false));
  
  // User menu click outside
  useClickOutside(userMenuRef, () => setUserMenuOpen(false));



  // Close all dropdowns
  const closeAllDropdowns = () => {
    setCommandBarOpen(false);
    setNavigationState(prev => ({
      ...prev,
      megaMenuOpen: false,
      activeCategory: null,
      hoveredCategory: null
    }));
  };

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'k',
      ctrlKey: true,
      action: toggleCommandBar,
      description: 'Open command bar'
    },
    {
      key: 'k',
      metaKey: true,
      action: toggleCommandBar,
      description: 'Open command bar'
    },
    {
      key: 'Escape',
      action: closeAllDropdowns,
      description: 'Close all menus'
    }
  ]);

  // Click outside handlers
  useClickOutside(commandBarRef, () => setCommandBarOpen(false), commandBarOpen);

  // Keyboard navigation for categories
  const handleKeyDown = (event: React.KeyboardEvent, categoryId?: string) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        if (categoryId) {
          event.preventDefault();
          handleCategoryHover(categoryId);
        }
        break;
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Update active page when prop changes
  useEffect(() => {
    setNavigationState(prev => ({
      ...prev,
      activePage
    }));
  }, [activePage]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (navigationState.mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [navigationState.mobileMenuOpen]);

  // Subscribe to notifications
  useEffect(() => {
    const unsubscribeBadges = smartNotificationsService.subscribeToBadges((badge) => {
      // Wrap single badge in array for compatibility
      setNotificationBadges([badge]);
    });
    const unsubscribeNotifications = smartNotificationsService.subscribe(setNotifications);

    return () => {
      unsubscribeBadges();
      unsubscribeNotifications();
    };
  }, []);

  // Get accessibility props for category buttons
  const getCategoryA11yProps = (category: NavigationCategory): NavigationA11y => ({
    ariaLabel: `${category.label} menu`,
    ariaExpanded: navigationState.activeCategory === category.id,
    ariaHaspopup: true,
    role: 'button',
    tabIndex: 0
  });

  // Get notification badge for a category
  const getCategoryBadge = (categoryPage?: Page) => {
    if (!categoryPage || notificationBadges.length === 0) return null;
    // Return the global badge (no per-page filtering for now)
    return notificationBadges[0];
  };

  return (
    <nav 
      ref={navBarRef}
      className={`bg-white/80 dark:bg-metallic-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-metallic-gray-900/60 border-b border-neutral-200 dark:border-metallic-gray-700 sticky top-0 z-50`}
    >
      {/* Real-Time Ticker */}
      <RealTimeTicker onItemClick={handleTickerItemClick} />

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => handlePageNavigation('dashboard')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              aria-label="Go to dashboard"
            >
              <img src={lexoLogo} alt="LexoHub Logo" className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 object-contain" style={{ background: 'transparent' }} />
              <span className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-100">LexoHub</span>
            </button>

            {/* Desktop Navigation Categories */}
            <div className="hidden lg:flex items-center space-x-1">
              {filteredConfig.categories.map((category) => {
                const CategoryIcon = category.icon;
                const isActive = navigationState.activePage === category.page;
                const isHovered = navigationState.hoveredCategory === category.id;
                const a11yProps = getCategoryA11yProps(category);

                const badge = getCategoryBadge(category.page);

                return (
                  <div
                    key={category.id}
                    className="relative"
                    onMouseEnter={() => handleCategoryHover(category.id)}
                    onMouseLeave={handleCategoryLeave}
                  >
                    <button
                      onClick={() => category.page && handlePageNavigation(category.page)}
                      onKeyDown={(e) => handleKeyDown(e, category.id)}
                      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'text-mpondo-gold-600 dark:text-mpondo-gold-400 font-semibold'
                          : isHovered
                          ? 'bg-neutral-100 dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100'
                          : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-metallic-gray-800 hover:text-neutral-900 dark:hover:text-neutral-100'
                      }`}
                      aria-label={a11yProps.ariaLabel}
                      aria-expanded={a11yProps.ariaExpanded}
                      aria-haspopup={a11yProps.ariaHaspopup}
                      role={a11yProps.role}
                      tabIndex={a11yProps.tabIndex}
                    >
                      <CategoryIcon className="w-4 h-4" />
                      <span>{category.label}</span>
                      
                      {/* Notification Badge */}
                      {badge && badge.count > 0 && (
                        <span 
                          className={`inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium rounded-full ${
                            badge.hasUrgent 
                              ? 'bg-status-error-500 text-white' 
                              : 'bg-mpondo-gold-500 text-white'
                          }`}
                          aria-label={`${badge.count} notifications`}
                        >
                          {badge.count > 99 ? '99+' : badge.count}
                        </span>
                      )}
                      
                      <Icon 
                        icon={ChevronDown}
                        noGradient
                        className={`w-3 h-3 transition-transform duration-200 ${
                          isHovered ? 'rotate-180' : ''
                        }`} 
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Search Button - Opens Command Bar */}
            <button
              onClick={toggleCommandBar}
              className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-metallic-gray-800 rounded-lg transition-colors"
              aria-label="Search (Ctrl+K)"
              title="Search (Ctrl+K)"
            >
              <Search className="w-4 h-4" />
              <span className="hidden md:inline">Search...</span>
              <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-xs font-mono bg-neutral-100 dark:bg-metallic-gray-800 border border-neutral-200 dark:border-metallic-gray-700 rounded">
                ⌘K
              </kbd>
            </button>

            {/* Theme Toggle - Desktop Only */}
            <div className="hidden lg:block">
              <ThemeToggle />
            </div>

             {/* Notifications Button */}
             <div className="relative" ref={alertsRef}>
               <Button
                 variant="ghost"
                 size="sm"
                 className="flex items-center gap-2"
                 aria-label="Notifications"
                 onClick={() => setAlertsOpen((open) => !open)}
               >
                 <Icon icon={Bell} className="w-4 h-4" />
                 <span className="hidden sm:inline">Alerts</span>
                 {notificationBadges.length > 0 && (
                   <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium bg-status-error-500 text-white rounded-full">
                     {notificationBadges.reduce((sum, badge) => sum + badge.count, 0)}
                   </span>
                 )}
               </Button>
               {alertsOpen && (
                 <AlertsDropdown onNavigate={(page: string) => handlePageNavigation(page as Page)} onClose={() => setAlertsOpen(false)} />
               )}
             </div>

             {/* User Menu */}
             <div className="relative" ref={userMenuRef}>
               <Button
                 variant="ghost"
                 size="sm"
                 className="flex items-center gap-2"
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
                       className="flex items-center gap-2 w-full px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-metallic-gray-700 transition-colors"
                     >
                       <Icon icon={Settings} className="w-4 h-4" />
                       Settings
                     </button>
                     <hr className="my-1 border-neutral-200 dark:border-metallic-gray-700" />
                     <button
                       onClick={handleSignOut}
                       className="flex items-center gap-2 w-full px-4 py-2 text-sm text-status-error-600 dark:text-status-error-400 hover:bg-status-error-50 dark:hover:bg-status-error-900/20 transition-colors"
                     >
                       <Icon icon={LogOut} className="w-4 h-4" />
                       Sign Out
                     </button>
                   </div>
                </div>
              )}
            </div>

             {/* Mobile Menu Toggle */}
             <button
               aria-controls="mobile-mega-menu"
               aria-expanded={navigationState.mobileMenuOpen}
               aria-label={navigationState.mobileMenuOpen ? 'Close menu' : 'Open menu'}
               onClick={() => setNavigationState(prev => ({ ...prev, mobileMenuOpen: !prev.mobileMenuOpen }))}
               className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-metallic-gray-800 transition-colors"
               title={navigationState.mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
               type="button"
             >
               {navigationState.mobileMenuOpen ? (
                 <X className="w-6 h-6 text-neutral-700 dark:text-neutral-300" />
               ) : (
                 <Menu className="w-6 h-6 text-neutral-700 dark:text-neutral-300" />
               )}
             </button>
          </div>
        </div>
      </div>

      {/* Mega Menu */}
      {navigationState.megaMenuOpen && navigationState.activeCategory && (
        <div
          ref={megaMenuRef}
          onMouseEnter={handleMegaMenuHover}
          onMouseLeave={handleMegaMenuLeave}
          className="absolute top-full left-0 w-full bg-white dark:bg-metallic-gray-900 border-b border-neutral-200 dark:border-metallic-gray-700 shadow-soft z-40"
        >
          <MegaMenu
            category={filteredConfig.categories.find(c => c.id === navigationState.activeCategory)!}
            onItemClick={(page: Page, _queryParams?: Record<string, string>) => handlePageNavigation(page)}
            onActionClick={handleActionClick}
            userTier={userTier}
          />
        </div>
      )}

      {/* Mobile Menu */}
      {navigationState.mobileMenuOpen && (
        <MobileMegaMenu
          categories={filteredConfig.categories}
          onItemClick={handlePageNavigation}
          onActionClick={handleActionClick}
          userTier={userTier}
          activePage={navigationState.activePage}
          onClose={() => setNavigationState(prev => ({ ...prev, mobileMenuOpen: false }))}
        />
      )}

      {/* Command Bar Modal */}
      {commandBarOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          <div className="absolute inset-0 bg-black/50 dark:bg-black/70" onClick={toggleCommandBar} />
          <div ref={commandBarRef} className="relative w-full max-w-2xl">
            <GlobalCommandBar
              onNavigate={(page) => {
                handlePageNavigation(page);
                toggleCommandBar();
              }}
              onAction={(actionId: string) => {
                handleActionClick(actionId);
                toggleCommandBar();
              }}
            />
          </div>
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

      {modalState.createInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Generate Invoice</h3>
            <p className="text-neutral-600 mb-4">
              Create professional invoices with automated fee calculations and Bar-compliant formatting.
            </p>
            <div className="space-y-3">
              <Button 
                variant="primary" 
                className="w-full"
                onClick={() => {
                  setModalState(prev => ({ ...prev, createInvoice: false }));
                  handlePageNavigation('invoices');
                  toast.success('Opening invoice generation...');
                }}
              >
                Open Invoice Generator
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setModalState(prev => ({ ...prev, createInvoice: false }))}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

    </nav>
  );
};