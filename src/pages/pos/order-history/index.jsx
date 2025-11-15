import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import OrderSummaryCards from './components/OrderSummaryCards';
import OrderFilters from './components/OrderFilters';
import OrderTable from './components/OrderTable';
import OrderDetailsModal from './components/OrderDetailsModal';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { useOrderStore } from '../../../stores/order.store';

const OrderHistory = () => {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isOperational, setIsOperational] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [highlightedOrderId, setHighlightedOrderId] = useState(null);

  // Get data from order store
  const orders = useOrderStore((state) => state.orders);
  const getTodayRevenue = useOrderStore((state) => state.getTodayRevenue);
  const getTotalOrders = useOrderStore((state) => state.getTotalOrders);
  const getAverageOrderValue = useOrderStore((state) => state.getAverageOrderValue);
  const updateOrderStatus = useOrderStore((state) => state.updateOrderStatus);
  const deleteOrder = useOrderStore((state) => state.deleteOrder);

  const [filters, setFilters] = useState({
    startDate: new Date()?.toISOString()?.split('T')?.[0],
    endDate: new Date()?.toISOString()?.split('T')?.[0],
    status: 'all',
    paymentStatus: 'all', // Add payment status filter
    paymentMethod: 'all',
    table: 'all',
    searchQuery: '',
    minAmount: '',
    maxAmount: ''
  });

  // Highlight new order from navigation state
  useEffect(() => {
    if (location.state?.highlightOrder) {
      setHighlightedOrderId(location.state.highlightOrder);
      // Clear highlight after 3 seconds
      setTimeout(() => setHighlightedOrderId(null), 3000);
    }
  }, [location]);

  // Calculate summary data from actual orders
  const summaryData = {
    todayRevenue: getTodayRevenue(),
    revenueChange: 12.5, // Calculate based on yesterday's revenue
    totalOrders: getTotalOrders(),
    ordersChange: 5,
    averageOrderValue: getAverageOrderValue(),
    avgChange: -2.3,
    unpaidOrders: orders.filter(o => o.paymentStatus === 'unpaid').length,
    pendingOrders: orders.filter(o => o.status === 'pending').length
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      startDate: new Date()?.toISOString()?.split('T')?.[0],
      endDate: new Date()?.toISOString()?.split('T')?.[0],
      status: 'all',
      paymentMethod: 'all',
      table: 'all',
      searchQuery: '',
      minAmount: '',
      maxAmount: ''
    });
  };

  const handleExport = () => {
    // Mock export functionality
    console.log('Exporting order history to Excel...');
    alert('Đang xuất dữ liệu ra file Excel. Vui lòng đợi...');
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleReprintReceipt = (order) => {
    console.log('Reprinting receipt for order:', order?.id);
    alert(`Đang in lại hóa đơn cho đơn hàng #${order?.id}`);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedOrder(null);
  };

  // Filter orders based on current filters
  const filteredOrders = orders?.filter(order => {
    const orderDate = new Date(order.timestamp)?.toISOString()?.split('T')?.[0];
    const matchesDateRange = orderDate >= filters?.startDate && orderDate <= filters?.endDate;
    const matchesStatus = filters?.status === 'all' || order?.status === filters?.status;
    const matchesPaymentStatus = filters?.paymentStatus === 'all' || order?.paymentStatus === filters?.paymentStatus;
    const matchesPayment = filters?.paymentMethod === 'all' || order?.paymentMethod === filters?.paymentMethod;
    const matchesTable = filters?.table === 'all' ||
      (filters?.table === 'takeaway' && order?.table === 'Mang về') ||
      (filters?.table === 'delivery' && order?.table === 'Giao hàng') ||
      (filters?.table?.startsWith('table-') && order?.table?.includes('Bàn')) ||
      order?.table?.toLowerCase()?.includes(filters?.table?.toLowerCase());

    const matchesSearch = !filters?.searchQuery ||
      order?.id?.toLowerCase()?.includes(filters?.searchQuery?.toLowerCase()) ||
      (order?.customer && order?.customer?.toLowerCase()?.includes(filters?.searchQuery?.toLowerCase())) ||
      (order?.customerPhone && order?.customerPhone?.includes(filters?.searchQuery));

    const matchesAmount = (!filters?.minAmount || order?.total >= parseInt(filters?.minAmount)) &&
      (!filters?.maxAmount || order?.total <= parseInt(filters?.maxAmount));

    return matchesDateRange && matchesStatus && matchesPaymentStatus && matchesPayment && matchesTable && matchesSearch && matchesAmount;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header
        storeName="POS Manager"
        isOperational={isOperational}
        onToggleOperational={() => setIsOperational(!isOperational)}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        userProfile={{ name: "Quản lý", role: "manager" }}
      />
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        userRole="owner"
      />
      <main className={`
        pt-16 transition-all duration-300 ease-smooth
        ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-60'}
      `}>
        <div className="p-6 space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Lịch sử đơn hàng</h1>
              <p className="text-muted-foreground mt-1">
                Theo dõi và quản lý tất cả giao dịch của cửa hàng
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                iconName="RefreshCw"
                iconPosition="left"
                onClick={() => window.location?.reload()}
                className="hover-scale"
              >
                Làm mới
              </Button>
              <Button
                variant="default"
                iconName="Plus"
                iconPosition="left"
                onClick={() => window.open('/main-pos-dashboard', '_blank')}
                className="hover-scale"
              >
                Tạo đơn mới
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <OrderSummaryCards summaryData={summaryData} />

          {/* Filters */}
          <OrderFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onExport={handleExport}
            onClearFilters={handleClearFilters}
          />

          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Hiển thị {filteredOrders?.length} đơn hàng từ tổng số {orders?.length} đơn
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="Filter" size={16} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Đã áp dụng {Object.values(filters)?.filter(v => v && v !== 'all')?.length} bộ lọc
              </span>
            </div>
          </div>

          {/* Orders Table */}
          <OrderTable
            orders={filteredOrders}
            onViewDetails={handleViewDetails}
            onReprintReceipt={handleReprintReceipt}
            highlightedOrderId={highlightedOrderId}
          />

          {/* Empty State */}
          {filteredOrders?.length === 0 && (
            <div className="text-center py-12">
              <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Không tìm thấy đơn hàng
              </h3>
              <p className="text-muted-foreground mb-4">
                Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác
              </p>
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="hover-scale"
              >
                Xóa tất cả bộ lọc
              </Button>
            </div>
          )}
        </div>
      </main>
      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={showDetailsModal}
        onClose={handleCloseDetailsModal}
        onReprintReceipt={handleReprintReceipt}
      />
    </div>
  );
};

export default OrderHistory;