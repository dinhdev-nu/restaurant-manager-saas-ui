import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
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

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* Define your route here */}
          <Route path="/" element={<MainPOSDashboard />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/order-history" element={<OrderHistory />} />
          <Route path="/menu-management" element={<MenuManagement />} />
          <Route path="/table-management" element={<TableManagement />} />
          <Route path="/staff-management" element={<StaffManagement />} />
          <Route path="/main-pos-dashboard" element={<MainPOSDashboard />} />
          <Route path="/payment-processing" element={<PaymentProcessing />} />
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
