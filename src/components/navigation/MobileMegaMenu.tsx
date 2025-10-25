import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight, X, Search, Settings, LogOut } from 'lucide-react';
import { Icon } from '../design-system/components';
import { ThemeToggle } from '../common/ThemeToggle';
import { NotificationBadge } from './NotificationBadge';
import { CloudStorageIndicator } from './CloudStorageIndicator';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import type { NavigationCategory, Page, UserTier } from '../../types';

interface MobileMegaMenuProps {
  categories: NavigationCategory[];
  onItemClick: (page: Page, hash?: string) => void;
  onActionClick: (action: string) => void;
  userTier: UserTier;
  activePage: Page;
  onClose: () => void;
  notificationCounts?: {
    matters?: number;
    firms?: number;
  };
  cloudStorageStatus?: 'connected' | 'disconnected' | 'warning';
}

interface MobileMenuItemProps {
  item: any;
  onItemClick: (page: Page, hash?: string) => void;
  onActionClick: (action: string) => void;
  userTier: UserTier;
  level?: number;
}

interface MobileSectionProps {
  section: any;
  onItemClick: (page: Page, hash?: string) => void;
  onActionClick: (action: string) => void;
  userTier: UserTier;
  level?: number;
}

interface MobileCategoryProps {
  category: NavigationCategory;
  onItemClick: (page: Page, hash?: string) => void;
  onActionClick: (action: string) => void;
  userTier: UserTier;
  activePage: Page;
  isExpanded: boolean;
  onToggle: () => void;
  notificationCount?: number;
}

// Mobile Menu Item Component
const MobileMenuItem: React.FC<MobileMenuItemProps> = ({
  item,
  onItemClick,
  onActionClick,
  userTier,
  level = 0
}) => {
  // Check if item is available for user tier
  const isAvailable = !item.requiredTier || userTier >= item.requiredTier;

  const handleClick = () => {
    if (!isAvailable) return;

    if (item.action) {
      onActionClick(item.action);
    } else if (item.page) {
      onItemClick(item.page, item.hash);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!isAvailable}
      className={`w-full flex items-center justify-between p-4 text-left transition-all duration-200 min-h-[56px] ${level > 0 ? 'pl-8' : ''
        } ${isAvailable
          ? 'text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100/60 dark:hover:bg-metallic-gray-800/40 active:bg-neutral-200/70 dark:active:bg-metallic-gray-700/50'
          : 'text-neutral-400 dark:text-neutral-600 cursor-not-allowed'
        }`}
      aria-label={item.label}
    >
      <div className="flex items-center gap-3">
        {item.icon && (
          <Icon
            icon={item.icon}
            className={`w-5 h-5 ${isAvailable ? '' : 'opacity-50'}`}
          />
        )}
        <div>
          <div className="font-medium">{item.label}</div>
          {item.description && (
            <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              {item.description}
            </div>
          )}
        </div>
      </div>

      {!isAvailable && (
        <span className="text-xs bg-neutral-200 dark:bg-metallic-gray-700 px-2 py-1 rounded">
          Upgrade
        </span>
      )}
    </button>
  );
};

// Mobile Section Component
const MobileSection: React.FC<MobileSectionProps> = ({
  section,
  onItemClick,
  onActionClick,
  userTier,
  level = 0
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border-b border-neutral-200 dark:border-metallic-gray-700 last:border-b-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-neutral-50/60 dark:hover:bg-metallic-gray-800/40 transition-colors min-h-[56px]"
        aria-expanded={isExpanded}
        aria-label={`${section.title} section`}
      >
        <div className="flex items-center gap-3">
          {section.icon && (
            <Icon icon={section.icon} className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          )}
          <div>
            <div className="font-semibold text-neutral-900 dark:text-neutral-100">
              {section.title}
            </div>
            {section.description && (
              <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                {section.description}
              </div>
            )}
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-neutral-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''
            }`}
        />
      </button>

      {/* Animated content */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        <div className="bg-neutral-50/50 dark:bg-metallic-gray-800/20">
          {section.items?.map((item: any, index: number) => (
            <MobileMenuItem
              key={index}
              item={item}
              onItemClick={onItemClick}
              onActionClick={onActionClick}
              userTier={userTier}
              level={level + 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Mobile Category Component
const MobileCategory: React.FC<MobileCategoryProps> = ({
  category,
  onItemClick,
  onActionClick,
  userTier,
  activePage,
  isExpanded,
  onToggle,
  notificationCount
}) => {
  const isActive = activePage === category.page;

  return (
    <div className="border-b border-neutral-200 dark:border-metallic-gray-700">
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-4 text-left transition-all duration-200 min-h-[64px] ${isActive
          ? 'bg-mpondo-gold-100 dark:bg-mpondo-gold-900/30 text-mpondo-gold-900 dark:text-mpondo-gold-400'
          : 'hover:bg-neutral-50 dark:hover:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100'
          }`}
        aria-expanded={isExpanded}
        aria-label={`${category.label} category`}
      >
        <div className="flex items-center gap-4">
          <Icon
            icon={category.icon}
            className={`w-6 h-6 ${isActive
              ? 'text-mpondo-gold-600 dark:text-mpondo-gold-400'
              : 'text-neutral-600 dark:text-neutral-400'
              }`}
          />
          <div className="flex items-center gap-2">
            <div>
              <div className="font-semibold text-lg flex items-center gap-2">
                {category.label}
                {notificationCount && notificationCount > 0 && (
                  <NotificationBadge 
                    count={notificationCount} 
                    variant="warning"
                    size="sm"
                  />
                )}
              </div>
              {category.description && (
                <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  {category.description}
                </div>
              )}
            </div>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''
            } ${isActive
              ? 'text-mpondo-gold-600 dark:text-mpondo-gold-400'
              : 'text-neutral-400'
            }`}
        />
      </button>

      {/* Animated category content */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        <div className="bg-neutral-50/70 dark:bg-metallic-gray-800/30">
          {/* Category main page link */}
          {category.page && (
            <button
              onClick={() => onItemClick(category.page!)}
              className="w-full flex items-center gap-3 p-4 pl-8 text-left hover:bg-neutral-100/60 dark:hover:bg-metallic-gray-700/40 transition-colors min-h-[56px]"
            >
              <ChevronRight className="w-4 h-4 text-neutral-400" />
              <span className="font-medium">View All {category.label}</span>
            </button>
          )}

          {/* Category sections */}
          {category.sections?.map((section, index) => (
            <MobileSection
              key={index}
              section={section}
              onItemClick={onItemClick}
              onActionClick={onActionClick}
              userTier={userTier}
              level={1}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Mobile Mega Menu Component
export const MobileMegaMenu: React.FC<MobileMegaMenuProps> = ({
  categories,
  onItemClick,
  onActionClick,
  userTier,
  activePage,
  onClose,
  notificationCounts = {},
  cloudStorageStatus = 'disconnected'
}) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle category toggle
  const handleCategoryToggle = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
      onClose();
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  // Handle item click with menu close
  const handleItemClick = (page: Page, hash?: string) => {
    onItemClick(page, hash);
    onClose();
  };

  // Handle action click with menu close
  const handleActionClick = (action: string) => {
    onActionClick(action);
    onClose();
  };

  // Handle search
  const handleSearch = () => {
    // Implement search functionality
    toast('Search functionality coming soon!', { icon: 'ℹ️' });
  };

  // Prevent scroll on body when menu is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Mobile Menu */}
      <div
        ref={menuRef}
        className="fixed top-0 right-0 h-full w-full max-w-sm bg-white/70 dark:bg-metallic-gray-900/70 backdrop-blur-3xl shadow-2xl z-50 md:hidden transform transition-transform duration-300 ease-in-out"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-metallic-gray-700 bg-gradient-to-r from-mpondo-gold-500 to-judicial-blue-600 dark:from-mpondo-gold-600 dark:to-judicial-blue-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white dark:bg-metallic-gray-900 rounded-lg flex items-center justify-center theme-shadow-sm">
              <span className="text-mpondo-gold-600 dark:text-mpondo-gold-400 font-bold text-lg">L</span>
            </div>
            <div>
              <div className="font-bold text-white">LexoHub</div>
              <div className="text-xs text-white/90 dark:text-white/80">
                {user?.email?.split('@')[0] || 'User'}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/20 dark:bg-black/20 hover:bg-white dark:bg-metallic-gray-800/30 dark:hover:bg-black/30 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-neutral-200 dark:border-metallic-gray-700">
          <div className="relative">
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-neutral-100 dark:bg-metallic-gray-800 border border-neutral-200 dark:border-metallic-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-mpondo-gold-500 text-neutral-900 dark:text-neutral-100"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="w-4 h-4 text-neutral-400" />
              </button>
            )}
          </div>
        </div>

        {/* Menu Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Quick Actions */}
          <div className="p-4 border-b border-neutral-200 dark:border-metallic-gray-700">
            <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-3">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleActionClick('create-matter')}
                className="p-3 bg-mpondo-gold-100 dark:bg-mpondo-gold-900/30 text-mpondo-gold-900 dark:text-mpondo-gold-300 rounded-lg text-sm font-medium hover:bg-mpondo-gold-200 dark:hover:bg-mpondo-gold-800/40 active:scale-95 transition-all min-h-[48px]"
              >
                New Matter
              </button>
              <button
                onClick={() => handleActionClick('create-proforma')}
                className="p-3 bg-judicial-blue-100 dark:bg-judicial-blue-900/30 text-judicial-blue-900 dark:text-judicial-blue-300 rounded-lg text-sm font-medium hover:bg-judicial-blue-200 dark:hover:bg-judicial-blue-800/40 active:scale-95 transition-all min-h-[48px]"
              >
                Pro Forma
              </button>
            </div>
          </div>

          {/* Navigation Categories */}
          <div className="py-2">
            {categories.map((category) => {
              // Get notification count for this category
              const notificationCount = category.id === 'matters' ? notificationCounts.matters :
                                       category.id === 'firms' ? notificationCounts.firms : 0;
              
              return (
                <MobileCategory
                  key={category.id}
                  category={category}
                  onItemClick={handleItemClick}
                  onActionClick={handleActionClick}
                  userTier={userTier}
                  activePage={activePage}
                  isExpanded={expandedCategory === category.id}
                  onToggle={() => handleCategoryToggle(category.id)}
                  notificationCount={notificationCount}
                />
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-200 dark:border-metallic-gray-700 p-4 space-y-2">
          {/* Cloud Storage Status */}
          <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-metallic-gray-800 rounded-lg">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Cloud Storage
            </span>
            <CloudStorageIndicator
              status={cloudStorageStatus}
              onClick={() => handleItemClick('settings')}
              className="!p-2 !min-h-[40px]"
            />
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Dark Mode
            </span>
            <ThemeToggle />
          </div>

          {/* User Actions */}
          <div className="space-y-1">
            <button
              onClick={() => {
                handleItemClick('settings');
              }}
              className="w-full flex items-center gap-3 p-3 text-left hover:bg-neutral-100 dark:hover:bg-metallic-gray-800 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4 text-neutral-500" />
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Settings
              </span>
            </button>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 p-3 text-left hover:bg-status-error-50 dark:hover:bg-status-error-900/20 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 text-status-error-500" />
              <span className="text-sm font-medium text-status-error-600 dark:text-status-error-400">
                Sign Out
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
