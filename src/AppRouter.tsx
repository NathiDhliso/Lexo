import React, { Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { LoadingSpinner } from './components/design-system/components';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AttorneyProtectedRoute } from './components/auth/AttorneyProtectedRoute';
import { NavigationBar } from './components/navigation';
import { AttorneyNavigationBar } from './components/navigation/AttorneyNavigationBar';
import { UserTier, Page } from './types'

import {
  DashboardPage,
  MattersPage,
  InvoicesPage,
  ProfilePage,
  SettingsPage,
  ProFormaRequestsPage,
  PartnerApprovalPage,
  NotificationsPage,
  AuditTrailPage,
  ReportsPage,
  DisputesPage,
  CreditNotesPage,
  AttorneyDashboardPage,
  AttorneyMattersPage,
  AttorneyInvoicesPage,
  AttorneyProFormasPage,
  AttorneyNotificationsPage,
  AttorneyProfilePage,
  AttorneySettingsPage,
  AttorneyRegisterPage,
  AttorneyLoginPage
} from './pages';

import ProFormaRequestPage from './pages/ProFormaRequestPage';
import MatterWorkbenchPage from './pages/MatterWorkbenchPage';
import { ProFormaSubmissionPage } from './pages/attorney/ProFormaSubmissionPage';
import { EngagementSigningPage } from './pages/attorney/EngagementSigningPage';

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

  const handlePageChange = (page: Page) => {
    switch (page) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'proforma-requests':
        navigate('/proforma-requests');
        break;
      case 'matters':
        navigate('/matters');
        break;
      case 'matter-workbench':
        navigate('/matter-workbench');
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

const AttorneyLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-gradient-to-br dark:from-metallic-gray-900 dark:via-metallic-gray-800 dark:to-metallic-gray-900 flex flex-col transition-colors duration-300">
      <AttorneyNavigationBar />
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
      <Route path="/attorney/login" element={<AttorneyLoginPage />} />
      <Route path="/pro-forma-request/:token" element={<ProFormaRequestPage token="" />} />
      <Route path="/attorney/proforma/:token" element={<ProFormaSubmissionPage />} />
      <Route path="/attorney/engagement/:token" element={<EngagementSigningPage />} />
      
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
      
      <Route path="/matter-workbench" element={
        <ProtectedRoute>
          <MainLayout>
            <MatterWorkbenchPage />
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
      <Route path="/attorney/dashboard" element={
        <AttorneyProtectedRoute>
          <AttorneyLayout>
            <AttorneyDashboardPage />
          </AttorneyLayout>
        </AttorneyProtectedRoute>
      } />
      
      <Route path="/attorney/matters" element={
        <AttorneyProtectedRoute>
          <AttorneyLayout>
            <AttorneyMattersPage />
          </AttorneyLayout>
        </AttorneyProtectedRoute>
      } />
      
      <Route path="/attorney/invoices" element={
        <AttorneyProtectedRoute>
          <AttorneyLayout>
            <AttorneyInvoicesPage />
          </AttorneyLayout>
        </AttorneyProtectedRoute>
      } />
      
      <Route path="/attorney/proformas" element={
        <AttorneyProtectedRoute>
          <AttorneyLayout>
            <AttorneyProFormasPage />
          </AttorneyLayout>
        </AttorneyProtectedRoute>
      } />
      
      <Route path="/attorney/notifications" element={
        <AttorneyProtectedRoute>
          <AttorneyLayout>
            <AttorneyNotificationsPage />
          </AttorneyLayout>
        </AttorneyProtectedRoute>
      } />
      
      <Route path="/attorney/profile" element={
        <AttorneyProtectedRoute>
          <AttorneyLayout>
            <AttorneyProfilePage />
          </AttorneyLayout>
        </AttorneyProtectedRoute>
      } />
      
      <Route path="/attorney/settings" element={
        <AttorneyProtectedRoute>
          <AttorneyLayout>
            <AttorneySettingsPage />
          </AttorneyLayout>
        </AttorneyProtectedRoute>
      } />
      
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
