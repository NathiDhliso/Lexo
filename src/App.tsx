import React, { Suspense, useState, useCallback, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// UI Components
import { LoadingSpinner } from './components/design-system/components/LoadingSpinner';
import { Card, CardContent, Button } from './design-system/components';

// Navigation Components
import { NavigationBar } from './components/navigation';

// Auth
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Types
import type { Page, Matter } from './types';
import { UserTier } from './types';
import {
  DashboardPage,
  MattersPage,
  ClientsPage,
  CalendarPage,
  DocumentsPage,
  InvoicesPage,
  ProfilePage,
  ProFormaPage,
  ProFormaRequestPage
} from './pages';
import RateCardManager from './components/pricing/RateCardManager';

// Create Query Client with proper configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
    },
  },
});

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} />;
    }
    return this.props.children;
  }
}

// Default Error Fallback
const DefaultErrorFallback: React.FC<{ error: Error }> = ({ error }) => {
  const isFeatureError = error.message?.includes('feature') || error.message?.includes('access');
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-100">
      <Card className="max-w-md w-full">
        <CardContent className="text-center">
          <div className="text-status-error-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            {isFeatureError ? 'Feature Access Error' : 'Oops! Something went wrong'}
          </h1>
          <p className="text-neutral-600 mb-4">
            {error.message || 'An unexpected error occurred'}
          </p>
          <div className="space-y-2">
            <Button
              onClick={() => window.location.reload()}
              variant="primary"
              aria-label="Reload the application"
            >
              Reload Application
            </Button>
            {isFeatureError && (
              <Button
                onClick={() => window.location.hash = 'dashboard'}
                variant="secondary"
                aria-label="Go to dashboard"
              >
                Go to Dashboard
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};



// Navigation Component
// Navigation component is now replaced by NavigationBar from ./components/navigation

// Main Layout Component
const MainLayout: React.FC<{ 
  children: React.ReactNode;
  activePage: Page;
  onPageChange: (page: Page) => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}> = ({ children, activePage, onPageChange, sidebarOpen, onToggleSidebar }) => {
  // Removed unused user from useAuth
  const userTier: UserTier = UserTier.ADVOCATE_PRO;
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <NavigationBar
        activePage={activePage}
        onPageChange={onPageChange}
        userTier={userTier}
        onToggleSidebar={onToggleSidebar}
        sidebarOpen={sidebarOpen}
      />
      {/* Main content area */}
      <main className="flex-1">
        <div className="px-3 sm:px-4 md:px-6 py-4 md:py-6">
          {children}
        </div>
      </main>
    </div>
  );
};

// App Content Component (wrapped by AuthProvider)
const AppContent: React.FC = () => {
  const [appState, setAppState] = useState({
    activePage: 'dashboard' as Page,
    currentPage: 'dashboard' as Page,
    selectedMatter: null as Matter | null,
    sidebarOpen: false,
  });






  const handlePageChange = useCallback((page: Page) => {
    setAppState(prev => ({ ...prev, activePage: page, currentPage: page }));
  }, []);





  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (appState.sidebarOpen && !target.closest('nav') && !target.closest('button[aria-label="Open sidebar"]')) {
        setAppState(prev => ({ ...prev, sidebarOpen: false }));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [appState.sidebarOpen]);

  const renderPage = () => {
    switch (appState.activePage) {
      case 'dashboard':
        return <DashboardPage onNavigate={handlePageChange} />;
      case 'matters':
        return <MattersPage onNavigate={handlePageChange} />;
      case 'clients':
        return <ClientsPage onNavigate={handlePageChange} />;
      case 'calendar':
        return <CalendarPage onNavigate={handlePageChange} />;
      case 'documents':
        return <DocumentsPage onNavigate={handlePageChange} />;
      case 'invoices':
        return <InvoicesPage onNavigate={handlePageChange} />;
      case 'proforma':
        return <ProFormaPage />;
      case 'rate-cards':
        return <RateCardManager />;
      case 'profile':
        return <ProfilePage />;
      
      default:
        return <DashboardPage onNavigate={handlePageChange} />;
    }
  };

  return (
    <ProtectedRoute>
      <div className="App">
        <MainLayout
          activePage={appState.activePage}
          onPageChange={handlePageChange}
          sidebarOpen={appState.sidebarOpen}
          onToggleSidebar={() => setAppState(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }))}
        >
          <Suspense fallback={<LoadingSpinner />}>
            {renderPage()}
          </Suspense>
        </MainLayout>
        
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </div>
    </ProtectedRoute>
  );
};

// Main App Component
function App() {
  // Check for public routes that don't require authentication
  const pathname = window.location.pathname;
  const isProFormaRequestRoute = pathname.startsWith('/pro-forma-request/');
  
  // Handle public pro forma request route
  if (isProFormaRequestRoute) {
    const token = pathname.split('/pro-forma-request/')[1];
    return (
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <div className="min-h-screen bg-neutral-50">
            <Suspense fallback={<LoadingSpinner />}>
              <ProFormaRequestPage token={token} />
            </Suspense>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
          </div>
        </ErrorBoundary>
      </QueryClientProvider>
    );
  }

  // Default authenticated app
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;