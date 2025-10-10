import React from 'react';
import { ArrowRight, Star, Zap, Crown, Lock } from 'lucide-react';
import { Button } from '../design-system/components';
import { getAccessibleNavigationItems } from '../../config/navigation.config';
import type { 
  NavigationCategory, 
  NavigationItem, 
  NavigationSection, 
  Page
} from '../../types';
import { UserTier } from '../../types';

interface MegaMenuProps {
  category: NavigationCategory;
  onItemClick: (page: Page) => void;
  userTier: UserTier;
  className?: string;
}

interface MegaMenuItemProps {
  item: NavigationItem;
  onItemClick: (page: Page) => void;
  userTier: UserTier;
}

interface MegaMenuSectionProps {
  section: NavigationSection;
  onItemClick: (page: Page) => void;
  userTier: UserTier;
}

// Individual menu item component
const MegaMenuItem: React.FC<MegaMenuItemProps> = ({ 
  item, 
  onItemClick, 
  userTier 
}) => {
  const Icon = item.icon;
  const isAccessible = !item.minTier || 
    (item.minTier && getUserTierLevel(userTier) >= getUserTierLevel(item.minTier));
  
  const handleClick = () => {
    if (isAccessible && item.page) {
      onItemClick(item.page);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if ((event.key === 'Enter' || event.key === ' ') && isAccessible && item.page) {
      event.preventDefault();
      onItemClick(item.page);
    }
  };

  return (
    <div
      className={`group relative p-2.5 rounded-lg transition-all duration-200 min-h-[44px] flex items-center ${
        isAccessible
          ? 'hover:bg-neutral-50 dark:hover:bg-metallic-gray-800 active:bg-neutral-100 dark:active:bg-metallic-gray-700 cursor-pointer touch-manipulation'
          : 'opacity-60 cursor-not-allowed'
      }`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={isAccessible ? 0 : -1}
      role="menuitem"
      aria-disabled={!isAccessible}
    >
      <div className="flex items-center gap-3 w-full">
        {/* Icon */}
        <div className={`flex-shrink-0 w-8 h-8 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center ${
          isAccessible 
            ? 'bg-mpondo-gold-100 dark:bg-mpondo-gold-900/30 text-mpondo-gold-600 dark:text-mpondo-gold-400 group-hover:bg-mpondo-gold-200 dark:group-hover:bg-mpondo-gold-900/50' 
            : 'bg-neutral-100 dark:bg-metallic-gray-800 text-neutral-400 dark:text-neutral-600'
        }`}>
          {Icon ? <Icon className="w-4 h-4" /> : null}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <h4 className={`font-medium text-sm ${
              isAccessible ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-500 dark:text-neutral-600'
            }`}>
              {item.label}
            </h4>
            
            {/* Badges */}
            <div className="flex items-center gap-1 flex-wrap">
              {item.isNew && (
                <span className="px-1.5 py-0.5 text-xs bg-status-success-100 dark:bg-status-success-900/30 text-status-success-800 dark:text-status-success-300 rounded-full">
                  New
                </span>
              )}
              {item.badge && (
                <span className="px-1.5 py-0.5 text-xs bg-judicial-blue-100 dark:bg-judicial-blue-900/30 text-judicial-blue-800 dark:text-judicial-blue-300 rounded-full">
                  {item.badge}
                </span>
              )}
              {item.isComingSoon && (
                <span className="px-1.5 py-0.5 text-xs bg-neutral-100 dark:bg-metallic-gray-800 text-neutral-600 dark:text-neutral-400 rounded-full">
                  Soon
                </span>
              )}
              {!isAccessible && (
                <Lock className="w-3 h-3 text-neutral-400" />
              )}
            </div>
          </div>
          
          {item.description && (
            <p className={`text-xs mt-1 line-clamp-2 ${
              isAccessible ? 'text-neutral-600 dark:text-neutral-400' : 'text-neutral-400 dark:text-neutral-600'
            }`}>
              {item.description}
            </p>
          )}
        </div>

        {/* Arrow indicator for accessible items */}
        {isAccessible && item.page && (
          <ArrowRight className="w-4 h-4 text-neutral-400 dark:text-neutral-500 opacity-60 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0" />
        )}
      </div>

      {/* Upgrade prompt for inaccessible items */}
      {!isAccessible && item.requiresUpgrade && (
        <div className="absolute inset-0 bg-white/90 dark:bg-metallic-gray-900/90 rounded-lg flex items-center justify-center">
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={(e) => {
              e.stopPropagation();
              // Handle upgrade flow
            }}
          >
            <Crown className="w-3 h-3 mr-1" />
            Upgrade
          </Button>
        </div>
      )}
    </div>
  );
};

// Section component
const MegaMenuSection: React.FC<MegaMenuSectionProps> = ({ 
  section, 
  onItemClick, 
  userTier 
}) => {
  const accessibleItems = getAccessibleNavigationItems(section.items, userTier);
  
  if (accessibleItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 bg-white dark:bg-metallic-gray-800 rounded-xl border border-neutral-200 dark:border-metallic-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-xs font-bold text-judicial-blue-600 dark:text-judicial-blue-400 uppercase tracking-wider mb-4 pb-2 border-b border-neutral-100 dark:border-metallic-gray-700">
        {section.title}
      </h3>
      <div className="space-y-2">
        {section.items.map((item) => (
          <MegaMenuItem
            key={item.id}
            item={item}
            onItemClick={onItemClick}
            userTier={userTier}
          />
        ))}
      </div>
    </div>
  );
};

// Featured items component
const FeaturedItems: React.FC<{
  items: NavigationItem[];
  onItemClick: (page: Page) => void;
  userTier: UserTier;
}> = ({ items, onItemClick, userTier }) => {
  const accessibleItems = getAccessibleNavigationItems(items, userTier);
  
  if (accessibleItems.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-mpondo-gold-50 to-judicial-blue-50 dark:from-mpondo-gold-950/20 dark:to-judicial-blue-950/20 rounded-lg p-4 border border-mpondo-gold-200 dark:border-mpondo-gold-800">
      <div className="flex items-center gap-2 mb-3">
        <Star className="w-4 h-4 text-mpondo-gold-600 dark:text-mpondo-gold-400" />
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Featured Workflow</h3>
      </div>
      <div className="space-y-1 sm:space-y-2">
        {accessibleItems.map((item) => {
          const Icon = item.icon;
          const isAccessible = !item.minTier || 
            (item.minTier && getUserTierLevel(userTier) >= getUserTierLevel(item.minTier));

          return (
            <div
              key={item.id}
              className={`flex items-center gap-3 p-2 sm:p-2 rounded-lg transition-colors min-h-[44px] ${
                isAccessible
                  ? 'hover:bg-white/60 dark:hover:bg-metallic-gray-900/60 active:bg-white/80 dark:active:bg-metallic-gray-900/80 cursor-pointer touch-manipulation'
                  : 'opacity-60 cursor-not-allowed'
              }`}
              onClick={() => isAccessible && item.page && onItemClick(item.page)}
              role="menuitem"
              tabIndex={isAccessible ? 0 : -1}
            >
              {Icon && (
                <div className="w-6 h-6 rounded bg-white/80 dark:bg-metallic-gray-800/80 flex items-center justify-center">
                  <Icon className="w-3 h-3 text-mpondo-gold-600 dark:text-mpondo-gold-400" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {item.label}
                  </span>
                  {item.isNew && (
                    <Zap className="w-3 h-3 text-status-success-600 dark:text-status-success-400" />
                  )}
                </div>
                {item.description && (
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">{item.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Helper function to get tier level for comparison
const getUserTierLevel = (tier: UserTier): number => {
  const tierLevels = {
    [UserTier.JUNIOR_START]: 0,
    [UserTier.ADVOCATE_PRO]: 1,
    [UserTier.SENIOR_ADVOCATE]: 2,
    [UserTier.CHAMBERS_ENTERPRISE]: 3
  };
  return tierLevels[tier];
};

// Main MegaMenu component
export const MegaMenu: React.FC<MegaMenuProps> = ({
  category,
  onItemClick,
  userTier,
  className = ''
}) => {
  // Filter sections to only show those with accessible items
  const accessibleSections = category.sections.filter(section => 
    getAccessibleNavigationItems(section.items, userTier).length > 0
  );

  // Determine grid columns based on content with mobile responsiveness
  const getGridColumns = () => {
    const sectionCount = accessibleSections.length;
    const hasFeatured = category.featured && category.featured.length > 0;
    
    if (hasFeatured) {
      return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    }
    
    if (sectionCount === 3) {
      return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    }
    
    if (sectionCount === 2) {
      return 'grid-cols-1 md:grid-cols-2';
    }
    
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  };

  return (
    <div 
      className={`max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8 ${className}`}
      role="menu"
      aria-label={`${category.label} menu`}
    >
      {/* Category Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-mpondo-gold-100 dark:bg-mpondo-gold-900/30 rounded-lg">
            <category.icon className="w-6 h-6 text-mpondo-gold-600 dark:text-mpondo-gold-400" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            {category.label}
          </h2>
        </div>
        {category.description && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400 ml-14">{category.description}</p>
        )}
      </div>

      {/* Menu Content Grid */}
      <div className={`grid gap-6 ${getGridColumns()}`}>
        {/* Navigation Sections */}
        {accessibleSections.map((section) => (
          <MegaMenuSection
            key={section.id}
            section={section}
            onItemClick={onItemClick}
            userTier={userTier}
          />
        ))}

        {/* Featured Items */}
        {category.featured && category.featured.length > 0 && (
          <FeaturedItems
            items={category.featured}
            onItemClick={onItemClick}
            userTier={userTier}
          />
        )}
      </div>

      {/* Footer Actions */}
      <div className="mt-10 pt-6 border-t border-neutral-200 dark:border-metallic-gray-700">
        <div className="flex items-center justify-between">
          <div className="text-sm text-neutral-500 dark:text-neutral-400">
            Explore all {category.label.toLowerCase()} features
          </div>
          <div className="text-xs text-neutral-400 dark:text-neutral-500">
            {accessibleSections.reduce((acc, section) => acc + section.items.length, 0)} features available
          </div>
        </div>
      </div>
    </div>
  );
};
