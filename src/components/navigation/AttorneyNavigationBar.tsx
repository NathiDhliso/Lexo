import React, { useState, useRef } from 'react';
import { User, LogOut, ChevronDown, FileText, CreditCard, Bell, Settings as SettingsIcon } from 'lucide-react';
import lexoLogo from '../../Public/Assets/lexo-logo.png';
import { Button } from '../design-system/components';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { ThemeToggle } from '../common/ThemeToggle';
import { useNavigate, useLocation } from 'react-router-dom';
import { useClickOutside, useEscapeKey } from '../../hooks';

export const AttorneyNavigationBar: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useClickOutside(userMenuRef, () => setUserMenuOpen(false));
  useEscapeKey(() => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  });

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/attorney/login');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const navItems = [
    { label: 'Dashboard', path: '/attorney/dashboard', icon: FileText },
    { label: 'My Matters', path: '/attorney/matters', icon: FileText },
    { label: 'Invoices', path: '/attorney/invoices', icon: CreditCard },
    { label: 'Pro Formas', path: '/attorney/proformas', icon: FileText },
  ];

  return (
    <nav 
      className="sticky top-0 z-50 w-full bg-white dark:bg-metallic-gray-900 border-b border-neutral-200 dark:border-metallic-gray-700"
      aria-label="Attorney portal navigation"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => navigate('/attorney/dashboard')}
            className="flex items-center gap-2 group transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-mpondo-gold-500 rounded-lg p-1"
            aria-label="Go to attorney dashboard"
          >
            <img 
              src={lexoLogo} 
              alt="LexoHub Client Portal" 
              className="h-8 w-8 object-contain transition-transform group-hover:rotate-3" 
            />
            <div className="flex flex-col items-start">
              <span className="text-lg font-bold bg-gradient-to-r from-mpondo-gold-600 to-judicial-blue-600 bg-clip-text text-transparent">
                LexoHub
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">Client Portal</span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1" role="navigation">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-metallic-gray-800 transition-colors"
                aria-label={item.label}
                aria-current={location.pathname === item.path ? 'page' : undefined}
              >
                <item.icon className="w-4 h-4" aria-hidden="true" />
                {item.label}
              </button>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:flex relative"
              onClick={() => navigate('/attorney/notifications')}
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" aria-hidden="true" />
            </Button>

            {/* Theme Toggle */}
            <div className="hidden md:block">
              <ThemeToggle />
            </div>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-label="User account menu"
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
              >
                <User className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">{user?.email?.split('@')[0] || 'Client'}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
              </Button>
              
              {userMenuOpen && (
                <div 
                  className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-metallic-gray-800 border border-neutral-200 dark:border-metallic-gray-700 rounded-lg shadow-lg z-50"
                  role="menu"
                  aria-label="User account options"
                >
                  <div className="py-1">
                    <button
                      onClick={() => {
                        navigate('/attorney/profile');
                        setUserMenuOpen(false);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-metallic-gray-700"
                      role="menuitem"
                    >
                      <User className="w-4 h-4" aria-hidden="true" />
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        navigate('/attorney/settings');
                        setUserMenuOpen(false);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-metallic-gray-700"
                      role="menuitem"
                    >
                      <SettingsIcon className="w-4 h-4" aria-hidden="true" />
                      Settings
                    </button>
                    <hr className="my-1 border-neutral-200 dark:border-metallic-gray-700" role="separator" />
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-status-error-600 dark:text-status-error-400 hover:bg-status-error-50 dark:hover:bg-status-error-900/20"
                      role="menuitem"
                    >
                      <LogOut className="w-4 h-4" aria-hidden="true" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-mpondo-gold-500 hover:bg-mpondo-gold-600 text-white"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <div className="relative w-5 h-5">
                <span className={`absolute left-0 top-1 w-5 h-0.5 bg-white transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                <span className={`absolute left-0 top-2.5 w-5 h-0.5 bg-white transition-all ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`absolute left-0 top-4 w-5 h-0.5 bg-white transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div 
          id="mobile-menu"
          className="md:hidden border-t border-neutral-200 dark:border-metallic-gray-700 bg-white dark:bg-metallic-gray-900"
          role="navigation"
          aria-label="Mobile navigation menu"
        >
          <div className="px-4 py-2 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-metallic-gray-800"
                aria-current={location.pathname === item.path ? 'page' : undefined}
              >
                <item.icon className="w-5 h-5" aria-hidden="true" />
                {item.label}
              </button>
            ))}
            <button
              onClick={() => {
                navigate('/attorney/notifications');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-metallic-gray-800"
            >
              <Bell className="w-5 h-5" aria-hidden="true" />
              Notifications
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
