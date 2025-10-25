import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { LoadingSpinner } from './components/design-system/components';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { NavigationBar } from './components/navigation';
import { UserTier, Page } from './types'

// Lazy load all page components for better performance
// Dashboard and critical pages are eager loaded for faster initial render
import { DashboardPage } from './pages';

// Lazy load heavy pages
const MattersPage = lazy(() => import('./pages/MattersPage'));
const InvoicesPage = lazy(() => import('./pages/InvoicesPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ProFormaRequestsPage = lazy(() => import('./pages/ProFormaRequestsPage').then(m => ({ default: m.ProFormaRequestsPage })));
const PartnerApprovalPage = lazy(() => import('./pages/partner/PartnerApprovalPage').then(m => ({ default: m.PartnerApprovalPage })));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const AuditTrailPage = lazy(() => import('./pages/AuditTrailPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const DisputesPage = lazy(() => import('./pages/DisputesPage'));
const CreditNotesPage = lazy(() => import('./pages/CreditNotesPage'));
const AttorneyRegisterPage = lazy(() => import('./pages/attorney/AttorneyRegisterPage').then(m => ({ default: m.AttorneyRegisterPage })));
const SubmitMatterRequestPage = lazy(() => import('./pages/attorney/SubmitMatterRequestPage').then(m => ({ default: m.SubmitMatterRequestPage })));
const ProFormaRequestPage = lazy(() => import('./pages/ProFormaRequestPage'));
const MatterWorkbenchPage = lazy(() => import('./pages/MatterWorkbenchPage'));
const WIPTrackerPage = lazy(() => import('./pages/WIPTrackerPage'));
const FirmsPage = lazy(() => import('./pages/FirmsPage'));
const DocumentLinkingTest = lazy(() => import('./components/documents/DocumentLinkingTest').then(m => ({ default: m.DocumentLinkingTest })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
    },
  },
});

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const userTier: UserTier = UserTier.ADVOCATE_PRO;
  const navigate = useNavigate();

  const handlePageChange = (page: Page, data?: any) => {
    switch (page) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'proforma':
        // Pro formas are handled via attorney submissions
        navigate('/proforma-requests');
        break;
      case 'proforma-requests':
        navigate('/proforma-requests');
        break;
      case 'matters':
        navigate('/matters');
        break;
      case 'matter-workbench':
        // Expect matterId in data
        if (data?.matterId) {
          navigate(`/matter-workbench/${data.matterId}`, { state: data });
        } else {
          navigate('/matters');
        }
        break;
      case 'wip-tracker':
        navigate('/wip-tracker');
        break;
      case 'firms':
        navigate('/firms');
        break;
      case 'invoices':
        navigate('/invoices');
        break;
      case 'partner-approval':
        navigate('/partner-approval');
        break;
      case 'profile':
        navigate('/profile');
        break;
      case 'settings':
        navigate('/settings');
        break;
      case 'reports':
        navigate('/reports');
        break;
      default:
        navigate('/dashboard');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-gradient-to-br dark:from-metallic-gray-900 dark:via-metallic-gray-800 dark:to-metallic-gray-900 flex flex-col transition-colors duration-300">
      <NavigationBar
        activePage="dashboard"
        onPageChange={handlePageChange}
        userTier={userTier}
        onToggleSidebar={() => {}}
        sidebarOpen={false}
      />
      <main className="flex-1">
        <div className="px-3 sm:px-4 md:px-6 py-4 md:py-6">
          <Suspense fallback={<LoadingSpinner />}>
            {children}
          </Suspense>
        </div>
      </main>
    </div>
  );
};

const AppContent: React.FC = () => {
  return (
    <Routes>
      {/* Public Attorney Routes - No Authentication Required */}
      <Route path="/attorney/register" element={<AttorneyRegisterPage />} />
      <Route path="/attorney/submit-matter-request" element={<SubmitMatterRequestPage />} />
      <Route path="/pro-forma-request/:token" element={<ProFormaRequestPage token="" />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout>
            <DashboardPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <MainLayout>
            <DashboardPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/proforma-requests" element={
        <ProtectedRoute>
          <MainLayout>
            <ProFormaRequestsPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/matters" element={
        <ProtectedRoute>
          <MainLayout>
            <MattersPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/firms" element={
        <ProtectedRoute>
          <MainLayout>
            <FirmsPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/matter-workbench/:matterId" element={
        <ProtectedRoute>
          <MainLayout>
            <MatterWorkbenchPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/wip-tracker" element={
        <ProtectedRoute>
          <MainLayout>
            <WIPTrackerPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/invoices" element={
        <ProtectedRoute>
          <MainLayout>
            <InvoicesPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/notifications" element={
        <ProtectedRoute>
          <MainLayout>
            <NotificationsPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/audit-trail" element={
        <ProtectedRoute>
          <MainLayout>
            <AuditTrailPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/test/documents" element={
        <ProtectedRoute>
          <MainLayout>
            <DocumentLinkingTest />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/reports" element={
        <ProtectedRoute>
          <MainLayout>
            <ReportsPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/disputes" element={
        <ProtectedRoute>
          <MainLayout>
            <DisputesPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/credit-notes" element={
        <ProtectedRoute>
          <MainLayout>
            <CreditNotesPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/retainers" element={
        <ProtectedRoute>
          <MainLayout>
            <DashboardPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/partner-approval" element={
        <ProtectedRoute>
          <MainLayout>
            <PartnerApprovalPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <MainLayout>
            <ProfilePage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <MainLayout>
            <SettingsPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      {/* Attorney Protected Routes - Require Attorney Authentication */}
      {/* Attorney routes removed - only registration and matter request submission remain */}
      
      {/* Catch-all route - redirect to dashboard for authenticated users */}
      <Route path="*" element={
        <ProtectedRoute>
          <Navigate to="/dashboard" replace />
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export const AppRouter: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <HashRouter>
            <AppContent />
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
          </HashRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default AppRouter;
