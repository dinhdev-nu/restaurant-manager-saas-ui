import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import OrderSummaryCards from './components/OrderSummaryCards';
import OrderFilters from './components/OrderFilters';
import OrderTable from './components/OrderTable';
import OrderDetailsModal from './components/OrderDetailsModal';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const OrderHistory = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isOperational, setIsOperational] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filters, setFilters] = useState({
    startDate: new Date()?.toISOString()?.split('T')?.[0],
    endDate: new Date()?.toISOString()?.split('T')?.[0],
    status: 'all',
    paymentMethod: 'all',
    table: 'all',
    searchQuery: '',
    minAmount: '',
    maxAmount: ''
  });

  // Mock data for order history
  const mockOrders = [
    {
      id: "ORD001",
      timestamp: new Date(Date.now() - 3600000),
      customer: "Nguyễn Văn An",
      customerPhone: "0901234567",
      table: "Bàn 5",
      staff: "Trần Thị Mai",
      items: [
        { name: "Phở bò tái", quantity: 2, price: 65000, notes: "Ít hành" },
        { name: "Trà đá", quantity: 2, price: 10000 },
        { name: "Nem rán", quantity: 1, price: 45000 }
      ],
      total: 185000,
      paymentMethod: "cash",
      status: "completed",
      specialInstructions: "Giao nhanh, khách đang đợi",
      discount: 0
    },
    {
      id: "ORD002",
      timestamp: new Date(Date.now() - 7200000),
      customer: null,
      customerPhone: null,
      table: "Mang về",
      staff: "Lê Văn Đức",
      items: [
        { name: "Cơm gà nướng", quantity: 1, price: 55000 },
        { name: "Coca Cola", quantity: 1, price: 15000 }
      ],
      total: 70000,
      paymentMethod: "momo",
      status: "completed",
      specialInstructions: null,
      discount: 0
    },
    {
      id: "ORD003",
      timestamp: new Date(Date.now() - 10800000),
      customer: "Phạm Thị Lan",
      customerPhone: "0987654321",
      table: "Bàn 12",
      staff: "Nguyễn Văn Hùng",
      items: [
        { name: "Lẩu thái", quantity: 1, price: 180000 },
        { name: "Rau củ lẩu", quantity: 1, price: 35000 },
        { name: "Bia Saigon", quantity: 4, price: 25000 }
      ],
      total: 315000,
      paymentMethod: "card",
      status: "completed",
      specialInstructions: "Lẩu cay vừa phải",
      discount: 15000
    },
    {
      id: "ORD004",
      timestamp: new Date(Date.now() - 14400000),
      customer: "Hoàng Minh Tuấn",
      customerPhone: "0912345678",
      table: "Giao hàng",
      staff: "Trần Thị Mai",
      items: [
        { name: "Bánh mì thịt nướng", quantity: 3, price: 25000 },
        { name: "Cà phê sữa đá", quantity: 2, price: 20000 }
      ],
      total: 115000,
      paymentMethod: "zalopay",
      status: "processing",
      specialInstructions: "Giao đến tầng 5, phòng 502",
      discount: 0
    },
    {
      id: "ORD005",
      timestamp: new Date(Date.now() - 18000000),
      customer: null,
      customerPhone: null,
      table: "Bàn 3",
      staff: "Lê Văn Đức",
      items: [
        { name: "Bún bò Huế", quantity: 1, price: 50000 },
        { name: "Chả cá", quantity: 1, price: 35000 }
      ],
      total: 85000,
      paymentMethod: "cash",
      status: "cancelled",
      specialInstructions: "Khách hủy do chờ quá lâu",
      discount: 0
    },
    {
      id: "ORD006",
      timestamp: new Date(Date.now() - 21600000),
      customer: "Vũ Thị Hoa",
      customerPhone: "0934567890",
      table: "Bàn 8",
      staff: "Nguyễn Văn Hùng",
      items: [
        { name: "Gỏi cuốn", quantity: 2, price: 30000 },
        { name: "Bún thịt nướng", quantity: 2, price: 45000 },
        { name: "Nước chanh", quantity: 2, price: 15000 }
      ],
      total: 180000,
      paymentMethod: "banking",
      status: "completed",
      specialInstructions: null,
      discount: 0
    }
  ];

  // Mock summary data
  const summaryData = {
    todayRevenue: 1150000,
    revenueChange: 12.5,
    totalOrders: 28,
    ordersChange: 5,
    averageOrderValue: 125000,
    avgChange: -2.3,
    popularItem: "Phở bò tái",
    popularItemCount: 8
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
  const filteredOrders = mockOrders?.filter(order => {
    const orderDate = new Date(order.timestamp)?.toISOString()?.split('T')?.[0];
    const matchesDateRange = orderDate >= filters?.startDate && orderDate <= filters?.endDate;
    const matchesStatus = filters?.status === 'all' || order?.status === filters?.status;
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

    return matchesDateRange && matchesStatus && matchesPayment && matchesTable && matchesSearch && matchesAmount;
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
        userRole="manager"
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
              Hiển thị {filteredOrders?.length} đơn hàng từ tổng số {mockOrders?.length} đơn
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