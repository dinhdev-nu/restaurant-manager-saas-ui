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
import { useAuthStore } from './stores';

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
  const selectedRestaurant = localStorage.getItem('selectedRestaurant');

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
            element={<RestaurantSelector />}
          />          {/* Customer Feed */}
          <Route
            path="/feed"
            element={
              <ProtectedRoute>
                <CustomerFeed />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Require Restaurant Selection */}
          <Route
            path="/"
            element={
              <RestaurantRoute>
                <MainPOSDashboard />
              </RestaurantRoute>
            }
          />
          <Route
            path="/main-pos-dashboard"
            element={
              <RestaurantRoute>
                <MainPOSDashboard />
              </RestaurantRoute>
            }
          />
          <Route
            path="/menu-management"
            element={
              <RestaurantRoute>
                <MenuManagement />
              </RestaurantRoute>
            }
          />
          <Route
            path="/order-history"
            element={
              <RestaurantRoute>
                <OrderHistory />
              </RestaurantRoute>
            }
          />
          <Route
            path="/staff-management"
            element={
              <RestaurantRoute>
                <StaffManagement />
              </RestaurantRoute>
            }
          />
          <Route
            path="/table-management"
            element={
              <RestaurantRoute>
                <TableManagement />
              </RestaurantRoute>
            }
          />
          <Route
            path="/payment-processing"
            element={
              <RestaurantRoute>
                <PaymentProcessing />
              </RestaurantRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;

