import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import OrderHistory from './pages/order-history';
import MenuManagement from './pages/menu-management';
import TableManagement from './pages/table-management';
import StaffManagement from './pages/staff-management';
import MainPOSDashboard from './pages/main-pos-dashboard';
import PaymentProcessing from './pages/payment-processing';
import AuthPage from "./pages/auth/index";
import CustomerFeed from './pages/customer-feed';

// Home component với role-based redirect
const Home = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user?.role || 'customer';

  // Redirect dựa trên role
  if (role === 'customer') {
    return <Navigate to="/feed" replace />;
  }

  // Owner, manager, staff -> POS Dashboard
  return <Navigate to="/main-pos-dashboard" replace />;
};

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* Home - Role-based redirect */}
          <Route path="/" element={<Home />} />

          {/* Auth */}
          <Route path="/auth" element={<AuthPage />} />

          {/* Customer Routes */}
          <Route path="/feed" element={<CustomerFeed />} />

          {/* Staff/Manager/Owner Routes */}
          <Route path="/main-pos-dashboard" element={<MainPOSDashboard />} />
          <Route path="/order-history" element={<OrderHistory />} />
          <Route path="/menu-management" element={<MenuManagement />} />
          <Route path="/table-management" element={<TableManagement />} />
          <Route path="/staff-management" element={<StaffManagement />} />
          <Route path="/payment-processing" element={<PaymentProcessing />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
