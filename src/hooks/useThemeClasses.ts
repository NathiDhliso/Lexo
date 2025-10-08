import { useTheme } from '../contexts/ThemeContext';

export const useThemeClasses = () => {
  const { effectiveTheme } = useTheme();

  const getThemeClass = (lightClass: string, darkClass: string) => {
    return effectiveTheme === 'dark' ? darkClass : lightClass;
  };

  const themeClasses = {
    card: 'theme-card',
    buttonPrimary: 'theme-button-primary',
    buttonSecondary: 'theme-button-secondary',
    input: 'theme-input',
    navbar: 'theme-navbar',
    dropdown: 'theme-dropdown',
    dropdownItem: 'theme-dropdown-item',
    surface: 'theme-surface',
    surfaceRaised: 'theme-surface-raised',
    textPrimary: 'theme-text-primary',
    textSecondary: 'theme-text-secondary',
    textTertiary: 'theme-text-tertiary',
    border: 'theme-border',
    statusSuccess: 'theme-status-success',
    statusWarning: 'theme-status-warning',
    statusError: 'theme-status-error',
    statusInfo: 'theme-status-info',
    interactive: 'theme-interactive',
    megaMenu: 'theme-mega-menu',
    megaMenuItem: 'theme-mega-menu-item',
    modalOverlay: 'theme-modal-overlay',
    modal: 'theme-modal',
    badge: 'theme-badge',
    badgeSuccess: 'theme-badge-success',
    badgeWarning: 'theme-badge-warning',
    badgeError: 'theme-badge-error',
    badgeInfo: 'theme-badge-info',
    link: 'theme-link',
    divider: 'theme-divider',
    tooltip: 'theme-tooltip',
    toggleSwitch: 'theme-toggle-switch',
    progressBar: 'theme-progress-bar',
    progressFill: 'theme-progress-fill',
    skeleton: 'theme-skeleton',
    alert: 'theme-alert',
    alertSuccess: 'theme-alert-success',
    alertWarning: 'theme-alert-warning',
    alertError: 'theme-alert-error',
    alertInfo: 'theme-alert-info',
    table: 'theme-table',
    tab: 'theme-tab',
    accordionHeader: 'theme-accordion-header',
    accordionContent: 'theme-accordion-content',
  };

  const getCombinedClasses = (...classes: string[]) => {
    return classes.filter(Boolean).join(' ');
  };

  return {
    effectiveTheme,
    getThemeClass,
    themeClasses,
    getCombinedClasses,
  };
};

export default useThemeClasses;
