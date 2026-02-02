import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import OrderHistory from './pages/pos/order-history';
import MenuManagement from './pages/pos/menu-management';
import TableManagement from './pages/pos/table-management';
import StaffManagement from './pages/pos/staff-management';
import MainPOSDashboard from './pages/pos/main-pos-dashboard';
import PaymentProcessing from './pages/pos/payment-processing';
import AuthPage from "./pages/auth/index";
import CustomerFeed from './pages/customer-feed';
import RestaurantSelector from './pages/restaurant-selector';
import { useAuthStore, useRestaurantStore } from './stores';
import Dashboard from "pages/analysis-reporting";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { token } = useAuthStore();
  if (!token) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

// Restaurant Selection Required Route
const RestaurantRoute = ({ children }) => {
  const { token } = useAuthStore();
  const selectedRestaurant = useRestaurantStore((state) => state.selectedRestaurant);

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  if (!selectedRestaurant) {
    return <Navigate to="/restaurant-selector" replace />;
  }

  return children;
};

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* Auth */}
          <Route path="/auth" element={<AuthPage />} />

          {/* Restaurant Selector - After Login */}
          <Route
            path="/restaurant-selector"
            element={
              <ProtectedRoute>
                <RestaurantSelector />
              </ProtectedRoute>
            }
          />

          {/* Customer Feed */}
          <Route
            path="/feed"
            element={
              <ProtectedRoute>
                <CustomerFeed />
              </ProtectedRoute>
            }
          />

          {/* Analysis & Reporting */}
          <Route path="/analysis-reporting" element={<Dashboard />} />

          {/* POS Routes - PUBLIC for easy UI development */}
          <Route path="/" element={<MainPOSDashboard />} />
          <Route path="/main-pos-dashboard" element={<MainPOSDashboard />} />
          <Route path="/menu-management" element={<MenuManagement />} />
          <Route path="/order-history" element={<OrderHistory />} />
          <Route path="/staff-management" element={<StaffManagement />} />
          <Route path="/table-management" element={<TableManagement />} />
          <Route path="/payment-processing" element={<PaymentProcessing />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;

