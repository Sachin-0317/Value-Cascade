import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/store/AuthContext';
import { ToastProvider } from '@/components/Toast';
import { ProtectedRoute } from '@/app/ProtectedRoute';
import { AppShellLayout } from '@/layouts/AppShellLayout';

import LandingPage from '@/pages/marketing/LandingPage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import SelectWorkspacePage from '@/pages/auth/SelectWorkspacePage';

import DashboardPage from '@/pages/app/DashboardPage';
import AnalysisPage from '@/pages/app/AnalysisPage';
import InventoryPage from '@/pages/app/InventoryPage';
import MarketplacePage from '@/pages/app/MarketplacePage';
import ListingsPage from '@/pages/app/ListingsPage';
import ProcurementPage from '@/pages/app/ProcurementPage';
import OrdersPage from '@/pages/app/OrdersPage';
import LogisticsPage from '@/pages/app/LogisticsPage';
import TraceabilityPage from '@/pages/app/TraceabilityPage';
import AnalyticsPage from '@/pages/app/AnalyticsPage';
import ReportsPage from '@/pages/app/ReportsPage';
import MessagesPage from '@/pages/app/MessagesPage';
import NotificationsPage from '@/pages/app/NotificationsPage';
import ProfilePage from '@/pages/app/ProfilePage';
import SettingsPage from '@/pages/app/SettingsPage';
import AdminPage from '@/pages/admin/AdminPage';
import NotFoundPage from '@/pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/select-workspace"
            element={
              <ProtectedRoute>
                <SelectWorkspacePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppShellLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="analysis" element={<AnalysisPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="marketplace" element={<MarketplacePage />} />
            <Route path="listings" element={<ListingsPage />} />
            <Route path="procurement" element={<ProcurementPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="logistics" element={<LogisticsPage />} />
            <Route path="traceability" element={<TraceabilityPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
