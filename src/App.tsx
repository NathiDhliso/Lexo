import React, { Suspense, useState, useCallback, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// UI Components
import { LoadingSpinner } from './components/design-system/components';
import { Card, CardContent, Button } from './components/design-system/components';

// Navigation Components
import { NavigationBar } from './components/navigation';

// Auth
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Types
import type { Page, Matter } from './types';
import { UserTier } from './types';
import {
  DashboardPage,
  MattersPage,
  InvoicesPage,
  ProfilePage,
  SettingsPage,
  ProFormaRequestsPage,
  PartnerApprovalPage
} from './pages';
import ProFormaRequestPage from './pages/ProFormaRequestPage';
import MatterWorkbenchPage from './pages/MatterWorkbenchPage';
import { ProFormaSubmissionPage } from './pages/attorney/ProFormaSubmissionPage';
import { EngagementSigningPage } from './pages/attorney/EngagementSigningPage';
import { CloudStorageCallbackPage } from './pages/CloudStorageCallbackPage';

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
  const userTier: UserTier = UserTier.ADVOCATE_PRO;
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-neutral-50 dark:bg-gradient-to-br dark:from-metallic-gray-900 dark:via-metallic-gray-800 dark:to-metallic-gray-900 flex flex-col transition-colors duration-300">
      <NavigationBar
        activePage={activePage}
        onPageChange={onPageChange}
        userTier={userTier}
        onToggleSidebar={onToggleSidebar}
        sidebarOpen={sidebarOpen}
      />
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        <div className="w-full max-w-full px-3 sm:px-4 md:px-6 py-4 md:py-6">
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
      case 'proforma-requests':
        return <ProFormaRequestsPage onNavigate={handlePageChange} />;
      case 'matters':
        return <MattersPage onNavigate={handlePageChange} />;
      case 'matter-workbench':
        return <MatterWorkbenchPage onNavigate={handlePageChange} />;
      case 'invoices':
        return <InvoicesPage onNavigate={handlePageChange} />;
      case 'partner-approval':
        return <PartnerApprovalPage />;
      case 'profile':
        return <ProfilePage />;
      case 'settings':
        return <SettingsPage />;
      
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
  // Check for public routes
  const checkPublicRoutes = () => {
    const hash = window.location.hash;
    const pathname = window.location.pathname;
    
    console.log('Checking public routes:', { hash, pathname });
    
    // Check for hash-based routes
    if (hash.startsWith('#/pro-forma-request/')) {
      console.log('Matched pro-forma-request route');
      return { type: 'proforma', token: hash.substring(2).split('/').pop() };
    }
    if (hash.startsWith('#/attorney/proforma/')) {
      console.log('Matched attorney/proforma route');
      return { type: 'attorney-proforma', token: hash.substring(2).split('/').pop() };
    }
    if (hash.startsWith('#/attorney/engagement/')) {
      console.log('Matched attorney/engagement route');
      return { type: 'attorney-engagement', token: hash.substring(2).split('/').pop() };
    }
    if (hash === '#/settings/cloud-storage/callback' || hash.startsWith('#/settings/cloud-storage/callback')) {
      console.log('Matched cloud storage callback route');
      return { type: 'cloud-storage-callback' };
    }
    
    // Check for pathname-based routes
    if (pathname.startsWith('/pro-forma-request/')) {
      console.log('Matched pathname pro-forma-request route');
      return { type: 'proforma', token: pathname.split('/').pop() };
    }
    if (pathname.startsWith('/attorney/proforma/')) {
      console.log('Matched pathname attorney/proforma route');
      return { type: 'attorney-proforma', token: pathname.split('/').pop() };
    }
    if (pathname.startsWith('/attorney/engagement/')) {
      console.log('Matched pathname attorney/engagement route');
      return { type: 'attorney-engagement', token: pathname.split('/').pop() };
    }
    if (pathname.startsWith('/settings/cloud-storage/callback')) {
      console.log('Matched pathname cloud storage callback route');
      return { type: 'cloud-storage-callback' };
    }
    
    console.log('No public route matched');
    return null;
  };

  const publicRoute = checkPublicRoutes();
  
  if (publicRoute) {
    let PageComponent;
    
    switch (publicRoute.type) {
      case 'proforma':
        PageComponent = <ProFormaRequestPage token={publicRoute.token} />;
        break;
      case 'attorney-proforma':
        PageComponent = <ProFormaSubmissionPage />;
        break;
      case 'attorney-engagement':
        PageComponent = <EngagementSigningPage />;
        break;
      case 'cloud-storage-callback':
        PageComponent = <CloudStorageCallbackPage />;
        break;
      default:
        PageComponent = <ProFormaRequestPage token={publicRoute.token} />;
    }
    
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ErrorBoundary>
            <div className="App">
              {PageComponent}
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
        </ThemeProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <ErrorBoundary>
            <AppContent />
          </ErrorBoundary>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
