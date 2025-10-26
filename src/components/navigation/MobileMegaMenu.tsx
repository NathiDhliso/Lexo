import React, { useState } from 'react';
import { ChevronDown, ChevronRight, ArrowRight, Star, Zap, Crown, Lock } from 'lucide-react';
import { Button } from '../design-system/components';
import { getAccessibleNavigationItems } from '../../config/navigation.config';
import type { 
  NavigationCategory, 
  NavigationItem, 
  NavigationSection, 
  Page, 
  UserTier 
} from '../../types';

interface MobileMegaMenuProps {
  categories: NavigationCategory[];
  onItemClick: (page: Page) => void;
  onActionClick?: (action: string) => void;
  userTier: UserTier;
  activePage: Page;
  onClose: () => void;
}

interface MobileCategoryProps {
  category: NavigationCategory;
  onItemClick: (page: Page) => void;
  onActionClick?: (action: string) => void;
  userTier: UserTier;
  activePage: Page;
  isExpanded: boolean;
  onToggle: () => void;
}

interface MobileSectionProps {
  section: NavigationSection;
  onItemClick: (page: Page) => void;
  onActionClick?: (action: string) => void;
  userTier: UserTier;
}

const getUserTierLevel = (tier: UserTier): number => {
  const levels = { junior_start: 1, junior_plus: 2, senior: 3, partner: 4 };
  return levels[tier] || 1;
};

// Mobile menu item component
const MobileMenuItem: React.FC<{
  item: NavigationItem;
  onItemClick: (page: Page) => void;
  onActionClick?: (action: string) => void;
  userTier: UserTier;
}> = ({ item, onItemClick, onActionClick, userTier }) => {
  const Icon = item.icon;
  const isAccessible = !item.minTier || 
    (item.minTier && getUserTierLevel(userTier) >= getUserTierLevel(item.minTier));
  
  const handleClick = () => {
    if (isAccessible) {
      if (item.action && onActionClick) {
        onActionClick(item.action);
      } else if (item.page) {
        onItemClick(item.page);
      }
    }
  };

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg transition-colors min-h-[52px] ${
        isAccessible
          ? 'active:bg-neutral-100 dark:active:bg-metallic-gray-700 cursor-pointer touch-manipulation'
          : 'opacity-60 cursor-not-allowed'
      }`}
      onClick={handleClick}
      role="menuitem"
      tabIndex={isAccessible ? 0 : -1}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
        isAccessible 
          ? 'bg-mpondo-gold-100 dark:bg-mpondo-gold-900/30 text-mpondo-gold-600 dark:text-mpondo-gold-400' 
          : 'bg-neutral-100 dark:bg-metallic-gray-700 text-neutral-400 dark:text-neutral-600'
      }`}>
        {Icon ? <Icon className="w-5 h-5" /> : null}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h4 className={`font-medium text-base ${
              isAccessible ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-500 dark:text-neutral-600'
            }`}>
              {item.label}
            </h4>
            
            {/* Badges */}
            <div className="flex items-center gap-1 mt-1">
              {item.isNew && (
                <span className="px-1.5 py-0.5 text-xs bg-status-success-100 text-status-success-800 rounded-full">
                  New
                </span>
              )}
              {item.badge && (
                <span className="px-1.5 py-0.5 text-xs bg-judicial-blue-100 text-judicial-blue-800 rounded-full">
                  {item.badge}
                </span>
              )}
              {item.isComingSoon && (
                <span className="px-1.5 py-0.5 text-xs bg-neutral-100 text-neutral-600 rounded-full">
                  Soon
                </span>
              )}
              {!isAccessible && (
                <Lock className="w-3 h-3 text-neutral-400" />
              )}
            </div>
          </div>
          
          {/* Arrow indicator */}
          {isAccessible && item.page && (
            <ArrowRight className="w-5 h-5 text-neutral-400 dark:text-neutral-500 flex-shrink-0" />
          )}
        </div>
        
        {item.description && (
          <p className={`text-sm mt-1 line-clamp-2 ${
            isAccessible ? 'text-neutral-600 dark:text-neutral-400' : 'text-neutral-400 dark:text-neutral-600'
          }`}>
            {item.description}
          </p>
        )}
      </div>
    </div>
  );
};

// Mobile section component
const MobileSection: React.FC<MobileSectionProps> = ({ 
  section, 
  onItemClick, 
  onActionClick,
  userTier 
}) => {
  const accessibleItems = getAccessibleNavigationItems(section.items, userTier);
  
  if (accessibleItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-bold text-judicial-blue-600 dark:text-judicial-blue-400 uppercase tracking-wider mb-3 px-3">
        {section.title}
      </h3>
      <div className="space-y-1">
        {section.items.map((item) => (
          <MobileMenuItem
            key={item.id}
            item={item}
            onItemClick={onItemClick}
            onActionClick={onActionClick}
            userTier={userTier}
          />
        ))}
      </div>
    </div>
  );
};

// Mobile category component with accordion behavior
const MobileCategory: React.FC<MobileCategoryProps> = ({
  category,
  onItemClick,
  onActionClick,
  userTier,
  activePage,
  isExpanded,
  onToggle
}) => {
  const Icon = category.icon;
  const isActive = activePage === category.page;
  const accessibleSections = category.sections.filter(section => 
    getAccessibleNavigationItems(section.items, userTier).length > 0
  );

  return (
    <div className="border-b border-neutral-200 dark:border-metallic-gray-700 last:border-b-0">
      {/* Category Header */}
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-5 text-left transition-colors min-h-[60px] ${
          isActive
            ? 'bg-mpondo-gold-50 dark:bg-mpondo-gold-900/20 text-mpondo-gold-900 dark:text-mpondo-gold-400'
            : 'text-neutral-700 dark:text-neutral-300 active:bg-neutral-50 dark:active:bg-metallic-gray-800'
        }`}
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          <Icon className="w-6 h-6" />
          <span className="font-semibold text-lg">{category.label}</span>
        </div>
        <ChevronDown 
          className={`w-6 h-6 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="bg-neutral-50 dark:bg-metallic-gray-900 px-3 py-4">
          {/* Quick access to main category page */}
          {category.page && (
            <div className="mb-4">
              <button
                onClick={() => onItemClick(category.page!)}
                className="w-full flex items-center gap-3 p-4 bg-white dark:bg-metallic-gray-800 rounded-lg shadow-sm active:bg-neutral-50 dark:active:bg-metallic-gray-700 transition-colors min-h-[56px]"
              >
                <div className="w-10 h-10 bg-mpondo-gold-100 dark:bg-mpondo-gold-900/30 text-mpondo-gold-600 dark:text-mpondo-gold-400 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <span className="font-semibold text-base text-neutral-900 dark:text-neutral-100">
                    View {category.label}
                  </span>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">
                    {category.description || `Access all ${category.label.toLowerCase()} features`}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
              </button>
            </div>
          )}

          {/* Sections */}
          <div className="space-y-4">
            {accessibleSections.map((section) => (
              <MobileSection
                key={section.id}
                section={section}
                onItemClick={onItemClick}
                onActionClick={onActionClick}
                userTier={userTier}
              />
            ))}

            {/* Featured Items */}
            {category.featured && category.featured.length > 0 && (
              <div className="bg-gradient-to-br from-mpondo-gold-50 to-judicial-blue-50 dark:from-mpondo-gold-950/20 dark:to-judicial-blue-950/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-5 h-5 text-mpondo-gold-600 dark:text-mpondo-gold-400" />
                  <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">Featured</h3>
                </div>
                <div className="space-y-1">
                  {getAccessibleNavigationItems(category.featured, userTier).map((item) => (
                    <MobileMenuItem
                      key={item.id}
                      item={item}
                      onItemClick={onItemClick}
                      onActionClick={onActionClick}
                      userTier={userTier}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Main Mobile Mega Menu component
export const MobileMegaMenu: React.FC<MobileMegaMenuProps> = ({
  categories,
  onItemClick,
  onActionClick,
  userTier,
  activePage,
  onClose
}) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const handleCategoryToggle = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const handleItemClick = (page: Page) => {
    onItemClick(page);
    onClose();
  };

  const handleActionClick = (action: string) => {
    if (onActionClick) {
      onActionClick(action);
    }
    onClose();
  };

  return (
    <div id="mobile-mega-menu" className="lg:hidden fixed inset-0 z-40">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Menu Panel */}
      <div className="absolute inset-x-0 top-0 bottom-0 bg-white dark:bg-metallic-gray-900 border-t border-neutral-200 dark:border-metallic-gray-700 overflow-y-auto pt-16">
        <div className="divide-y divide-neutral-200 dark:divide-metallic-gray-700">
          {categories.map((category) => (
            <MobileCategory
              key={category.id}
              category={category}
              onItemClick={handleItemClick}
              onActionClick={handleActionClick}
              userTier={userTier}
              activePage={activePage}
              isExpanded={expandedCategory === category.id}
              onToggle={() => handleCategoryToggle(category.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
