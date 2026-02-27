import React, { useState, useEffect, useCallback } from 'react';
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
import { useRestaurantStore } from '../../../stores/restaurant.store';
import { getOrdersApi } from '../../../api/restaurant';
import { useSSESubscription } from '../../../contexts/SSEContext';
import { useToast } from '../../../hooks/use-toast';
import soundManager from '../../../utils/sounds';

const OrderHistory = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isOperational, setIsOperational] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [highlightedOrderId, setHighlightedOrderId] = useState(null);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalFetched, setTotalFetched] = useState(0);

  // Get selected restaurant
  const selectedRestaurant = useRestaurantStore((state) => state.selectedRestaurant);

  // Get data from order store
  const orders = useOrderStore((state) => state.orders);
  const setOrders = useOrderStore((state) => state.setOrders);
  const appendOrders = useOrderStore((state) => state.appendOrders);
  const addOrder = useOrderStore((state) => state.addOrder);
  const getTodayRevenue = useOrderStore((state) => state.getTodayRevenue);
  const getTotalOrders = useOrderStore((state) => state.getTotalOrders);
  const getAverageOrderValue = useOrderStore((state) => state.getAverageOrderValue);
  const updateOrderStatus = useOrderStore((state) => state.updateOrderStatus);
  const deleteOrder = useOrderStore((state) => state.deleteOrder);

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: 'all',
    paymentStatus: 'all',
    table: 'all',
    searchQuery: '',
    minAmount: '',
    maxAmount: ''
  });

  // Fetch orders from API
  useEffect(() => {
    const loadOrders = async () => {
      if (selectedRestaurant?._id) {
        setIsLoadingOrders(true);
        setCurrentPage(1);
        setHasMore(true);
        try {
          const ordersData = await getOrdersApi(
            selectedRestaurant._id,
            1,
            filters.status !== 'all' ? filters.status : null
          );

          // Map API data to component format and let store handle orderId generation
          const mappedOrders = ordersData?.map(order => ({
            ...order,
            timestamp: order.createdAt || order.updatedAt,
            customer: order.customer || null,
            customerPhone: order.customerPhone || null,
            paymentMethod: order.paymentMethod || null,
          })) || [];

          setOrders(mappedOrders);
          setTotalFetched(mappedOrders.length);
          setHasMore(mappedOrders.length === 20); // If got 20 items, likely has more
        } catch (error) {
          console.error('Error loading orders:', error);
          // setOrders([]);
          setHasMore(false);
        } finally {
          setIsLoadingOrders(false);
        }
      }
    };

    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRestaurant?._id, filters.status]);

  // Reset pagination when filters change (except status which triggers reload above)
  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
  }, [filters.startDate, filters.endDate, filters.paymentStatus, filters.table, filters.searchQuery, filters.minAmount, filters.maxAmount]);

  // Highlight new order from navigation state
  useEffect(() => {
    if (location.state?.highlightOrder) {
      setHighlightedOrderId(location.state.highlightOrder);
      // Clear highlight after 3 seconds
      setTimeout(() => setHighlightedOrderId(null), 3000);
    }
  }, [location]);

  // SSE Event Handler for real-time order updates
  const handleSSEEvent = useCallback((data) => {
    console.log('[OrderHistory] Received SSE event:', data);

    switch (data.type) {
      case 'NEW_ORDER':
        if (data.order) {
          addOrder(data.order);
          soundManager.playNewOrder();
          setHighlightedOrderId(data.order._id);
          setTimeout(() => setHighlightedOrderId(null), 3000);
          toast({
            title: '🔔 Đơn hàng mới!',
            description: `Bàn ${data.order.table || 'Mang về'} - ${data.order.items?.length || 0} món`,
          });
        }
        break;

      case 'ORDER_UPDATE':
      case 'ORDER_STATUS_UPDATE':
        if (data.orderId && data.status) {
          updateOrderStatus(data.orderId, data.status);
        }
        break;

      case 'PAYMENT_UPDATE':
        if (data.orderId && data.paymentStatus) {
          updateOrderStatus(data.orderId, { paymentStatus: data.paymentStatus });
          if (data.paymentStatus === 'paid') {
            soundManager.playSuccess();
          }
        }
        break;

      default:
        console.log('[OrderHistory] Unknown event type:', data.type);
    }
  }, [addOrder, updateOrderStatus, toast]);

  // Subscribe to SSE events (1 connection duy nhất từ SSEProvider)
  const { isConnected } = useSSESubscription(handleSSEEvent, 'OrderHistory');

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
      startDate: '',
      endDate: '',
      status: 'all',
      paymentStatus: 'all',
      table: 'all',
      searchQuery: '',
      minAmount: '',
      maxAmount: ''
    });
  };

  const handleLoadMore = async () => {
    if (!hasMore || isLoadingMore || !selectedRestaurant?._id) return;

    setIsLoadingMore(true);
    const nextPage = currentPage + 1;

    try {
      const ordersData = await getOrdersApi(
        selectedRestaurant._id,
        nextPage,
        filters.status !== 'all' ? filters.status : null
      );

      const mappedOrders = ordersData?.map(order => ({
        ...order,
        timestamp: order.createdAt || order.updatedAt,
        customer: order.customer || null,
        customerPhone: order.customerPhone || null,
        paymentMethod: order.paymentMethod || null,
      })) || [];

      if (mappedOrders.length > 0) {
        // Append new orders to existing ones
        appendOrders(mappedOrders);
        setCurrentPage(nextPage);
        setTotalFetched(prev => prev + mappedOrders.length);
        setHasMore(mappedOrders.length === 20);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more orders:', error);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
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
    console.log('Reprinting receipt for order:', order?._id);
    alert(`Đang in lại hóa đơn cho đơn hàng #${order?.orderId || order?._id}`);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedOrder(null);
  };

  // Filter orders based on current filters
  const filteredOrders = orders?.filter(order => {
    const orderDate = new Date(order.timestamp)?.toISOString()?.split('T')?.[0];

    // Only apply date filter if both startDate and endDate are provided
    const matchesDateRange = (!filters?.startDate && !filters?.endDate) ||
      (filters?.startDate && filters?.endDate && orderDate >= filters?.startDate && orderDate <= filters?.endDate) ||
      (filters?.startDate && !filters?.endDate && orderDate >= filters?.startDate) ||
      (!filters?.startDate && filters?.endDate && orderDate <= filters?.endDate);

    const matchesStatus = filters?.status === 'all' || order?.status === filters?.status;
    const matchesPaymentStatus = filters?.paymentStatus === 'all' || order?.paymentStatus === filters?.paymentStatus;
    const matchesTable = filters?.table === 'all' ||
      (filters?.table === 'takeaway' && order?.table === 'takeaway') ||
      (filters?.table === 'delivery' && order?.table === 'delivery') ||
      (filters?.table?.startsWith('table-') && order?.table?.includes('Bàn')) ||
      order?.table?.toLowerCase()?.includes(filters?.table?.toLowerCase());

    const matchesSearch = !filters?.searchQuery ||
      order?.orderId?.toLowerCase()?.includes(filters?.searchQuery?.toLowerCase()) ||
      order?._id?.toLowerCase()?.includes(filters?.searchQuery?.toLowerCase());

    const matchesAmount = (!filters?.minAmount || order?.total >= parseInt(filters?.minAmount)) &&
      (!filters?.maxAmount || order?.total <= parseInt(filters?.maxAmount));

    return matchesDateRange && matchesStatus && matchesPaymentStatus && matchesTable && matchesSearch && matchesAmount;
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
          {isLoadingOrders ? (
            <div className="text-center py-12">
              <Icon name="Loader2" size={48} className="text-muted-foreground mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Đang tải dữ liệu...
              </h3>
              <p className="text-muted-foreground">
                Vui lòng chờ trong giây lát
              </p>
            </div>
          ) : (
            <>
              <OrderTable
                orders={filteredOrders}
                onViewDetails={handleViewDetails}
                onReprintReceipt={handleReprintReceipt}
                highlightedOrderId={highlightedOrderId}
              />

              {/* Load More Button */}
              {!isLoadingOrders && orders?.length > 0 && hasMore && (
                <div className="flex flex-col items-center gap-3 py-6">
                  <Button
                    variant="outline"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    iconName={isLoadingMore ? "Loader2" : "ChevronDown"}
                    iconPosition="right"
                    className="hover-scale"
                  >
                    {isLoadingMore ? 'Đang tải...' : 'Tải thêm đơn hàng'}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Mỗi lần tải thêm 20 đơn hàng
                  </p>
                </div>
              )}

              {/* End of list message */}
              {!isLoadingOrders && orders?.length > 0 && !hasMore && (
                <div className="text-center py-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 text-sm text-muted-foreground">
                    <Icon name="CheckCircle2" size={16} />
                    <span>Đã tải tất cả {totalFetched} đơn hàng từ server</span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Empty State - Only show when not loading */}
          {!isLoadingOrders && filteredOrders?.length === 0 && (
            <div className="text-center py-12">
              <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Không tìm thấy đơn hàng
              </h3>
              <p className="text-muted-foreground mb-4">
                {orders?.length === 0
                  ? 'Chưa có đơn hàng nào trong hệ thống'
                  : 'Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác'
                }
              </p>
              {orders?.length > 0 && (
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="hover-scale"
                >
                  Xóa tất cả bộ lọc
                </Button>
              )}
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