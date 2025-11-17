import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import MenuCategory from './components/MenuCategory';
import MenuGrid from './components/MenuGrid';
import OrderCart from './components/OrderCart';
import QuickActions from './components/QuickActions';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import ConfirmationDialog from '../../../components/ui/ConfirmationDialog';
import UnpaidOrdersModal from '../../../components/ui/UnpaidOrdersModal';
import { useToast } from '../../../hooks/use-toast';
import { useOrderStore } from '../../../stores/order.store';
import { useTableStore } from '../../../stores/table.store';
import { useMenuStore } from '../../../stores/menu.store';
import { useStaffStore } from '../../../stores';
import soundManager from '../../../utils/sounds';

const MainPOSDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const addOrder = useOrderStore((state) => state.addOrder);
  const assignOrder = useTableStore((state) => state.assignOrder);
  const getTableLabel = useTableStore((state) => state.getTableLabel);
  const updateTable = useTableStore((state) => state.updateTable);

  // Menu Store
  const categories = useMenuStore((state) => state.categories);
  const menuItems = useMenuStore((state) => state.menuItems);
  const getAvailableMenuItems = useMenuStore((state) => state.getAvailableMenuItems);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isOperational, setIsOperational] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [cartItems, setCartItems] = useState([]);
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showClearCartDialog, setShowClearCartDialog] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [orderNumber, setOrderNumber] = useState(null);
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0
  });

  // Generate order number when cart has items
  useEffect(() => {
    if (cartItems.length > 0 && !orderNumber) {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
      const timeStr = now.getTime().toString().slice(-4);
      setOrderNumber(`HD${dateStr}${timeStr}`);
    } else if (cartItems.length === 0) {
      setOrderNumber(null);
      setSelectedTable(null);
      setSelectedStaff(null);
    }
  }, [cartItems, orderNumber]);

  // Set selected table from navigation state
  useEffect(() => {
    if (location.state?.selectedTable) {
      setSelectedTable(location.state.selectedTable);
      // Clear the state to prevent it from being reused
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // F2: Go to Payment
      if (e.key === 'F2') {
        e.preventDefault();
        if (cartItems.length > 0) {
          handleGoToPayment();
        }
      }
      // F4: Clear cart
      if (e.key === 'F4') {
        e.preventDefault();
        if (cartItems.length > 0) {
          setShowClearCartDialog(true);
        }
      }
      // ESC: Close mobile cart
      if (e.key === 'Escape') {
        setShowMobileCart(false);
        setShowPaymentDialog(false);
      }
      // Number keys 1-5: Switch categories
      if (e.key >= '1' && e.key <= '5' && !e.ctrlKey && !e.altKey) {
        const categoryIndex = parseInt(e.key) - 1;
        if (categories[categoryIndex]) {
          setActiveCategory(categories[categoryIndex].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cartItems, categories]);

  const getCurrentMenuItems = () => {
    if (activeCategory === 'all') {
      return getAvailableMenuItems();
    }
    return menuItems.filter(item =>
      item.category === activeCategory && item.status === 'available'
    );
  };

  const handleAddToCart = (item) => {
    if (item.stock_quantity === 0 || item.status === 'unavailable') {
      soundManager.playError();
      toast({
        title: "Hết hàng",
        description: `${item.name} hiện đã hết hàng`,
        variant: "destructive"
      });
      return;
    }

    soundManager.playAddToCart();
    setCartItems(prevItems => {
      const existingItem = prevItems.find(cartItem => cartItem.id === item.id);

      if (existingItem) {
        toast({
          title: "Đã cập nhật",
          description: `${item.name} x${existingItem.quantity + 1}`,
        });
        return prevItems.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        toast({
          title: "Đã thêm vào giỏ",
          description: `${item?.name}`,
        });
        return [...prevItems, { ...item, quantity: 1, note: '' }];
      }
    });
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }

    setCartItems(prevItems =>
      prevItems?.map(item =>
        item?.id === itemId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const handleRemoveItem = (itemId) => {
    soundManager.playRemoveItem();
    setCartItems(prevItems => prevItems?.filter(item => item?.id !== itemId));
  };

  const handleUpdateNote = (itemId, note) => {
    setCartItems(prevItems =>
      prevItems?.map(item =>
        item?.id === itemId
          ? { ...item, note }
          : item
      )
    );
  };

  const handleClearCart = () => {
    soundManager.playRemoveItem();
    setCartItems([]);
    toast({
      title: "Đã xóa giỏ hàng",
      description: "Tất cả món đã được xóa",
    });
  };

  const handleCreateOrder = () => {
    if (!cartItems.length) {
      soundManager.playError();
      toast({
        title: "Giỏ hàng trống",
        description: "Vui lòng thêm món vào giỏ hàng để tạo đơn",
        variant: "destructive"
      });
      return;
    }

    if (!selectedTable) {
      soundManager.playError();
      toast({
        title: "Chưa chọn bàn",
        description: "Vui lòng chọn bàn trước khi tạo đơn",
        variant: "destructive"
      });
      return;
    }

    // Get table label from value
    const tableLabel = getTableLabel(selectedTable);

    // Get staff info from store (optional)
    let staffName = 'Chưa phân công';
    if (selectedStaff) {
      const getStaffById = useStaffStore.getState().getStaffById;
      const staffInfo = getStaffById(selectedStaff);
      staffName = staffInfo ? staffInfo.name : 'Chưa phân công';
    }

    // Update table status to occupied and assign order
    assignOrder(selectedTable, orderNumber, cartItems.reduce((sum, item) => sum + item.quantity, 0));

    // Create order and save to order store
    const newOrder = {
      id: orderNumber,
      timestamp: new Date(),
      table: tableLabel,
      items: cartItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        notes: item.note || ''
      })),
      subtotal: orderSummary.subtotal,
      discount: orderSummary.discount,
      tax: orderSummary.tax,
      total: orderSummary.total,
      status: 'pending',
      paymentStatus: 'unpaid',
      staff: staffName,
      staffId: selectedStaff,
      customer: null,
      customerPhone: null,
      specialInstructions: null
    };

    // Add to store
    const savedOrder = addOrder(newOrder);

    console.log('Created Order:', savedOrder);

    soundManager.playSuccess();
    toast({
      title: "Tạo đơn thành công!",
      description: `Đơn hàng ${orderNumber} đã được tạo cho ${tableLabel}`,
      variant: "success"
    });

    // Clear cart after creating order (no navigation)
    setCartItems([]);
    setShowMobileCart(false);
  };

  const handleGoToPayment = () => {
    if (cartItems.length === 0) {
      soundManager.playError();
      toast({
        title: "Giỏ hàng trống",
        description: "Vui lòng thêm món vào giỏ hàng trước khi thanh toán",
        variant: "destructive"
      });
      return;
    }

    // Navigate to payment-processing page with order data
    navigate('/payment-processing', {
      state: {
        orderNumber,
        selectedTable,
        cartItems,
        subtotal: orderSummary.subtotal,
        discount: orderSummary.discount,
        tax: orderSummary.tax,
        totalAmount: orderSummary.total,
        fromDashboard: true
      }
    });
  };

  const handleBarcodeSearch = (barcode) => {
    console.log('Searching for barcode:', barcode);
    // Barcode search - find item by ID or name
    const foundItem = menuItems.find(item =>
      item.id.includes(barcode) ||
      item.name.toLowerCase().includes(barcode.toLowerCase())
    );
    if (foundItem) {
      handleAddToCart(foundItem);
    } else {
      soundManager.playError();
      toast({
        title: "Không tìm thấy",
        description: "Không tìm thấy sản phẩm với mã vạch này",
        variant: "destructive"
      });
    }
  };

  const handleCustomerSearch = (query) => {
    console.log('Searching for customer:', query);
    soundManager.playNotification();
    toast({
      title: "Tìm kiếm khách hàng",
      description: `Đang tìm: ${query}`,
    });
  };

  const handleQuickAdd = (item) => {
    handleAddToCart(item);
  };

  const calculateTotal = () => {
    const subtotal = cartItems?.reduce((total, item) => total + (item?.price * item?.quantity), 0);
    const tax = subtotal * 0.1;
    return subtotal + tax;
  };

  const getTotalItems = () => {
    return cartItems?.reduce((total, item) => total + item?.quantity, 0);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        storeName="POS Manager"
        isOperational={isOperational}
        onToggleOperational={() => setIsOperational(!isOperational)}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        userProfile={{ name: "Nguyễn Văn A", role: "owner" }}
      />
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        userRole="owner"
        className="hidden lg:block"
      />
      {/* Mobile Sidebar */}
      {!sidebarCollapsed && (
        <Sidebar
          isCollapsed={false}
          onToggleCollapse={() => setSidebarCollapsed(true)}
          userRole="owner"
          className="lg:hidden"
        />
      )}
      <main className={`
        pt-16 md:pt-16 transition-all duration-300 ease-smooth
        ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'}
      `}>
        <div className="h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)] flex flex-col lg:flex-row">
          {/* Left Panel - Menu */}
          <div className={`
            flex-1 bg-surface border-r border-border overflow-hidden
            ${showMobileCart ? 'hidden lg:flex' : 'flex'}
            flex-col
          `}>
            <div className="p-4 border-b border-border">
              <h1 className="text-xl font-semibold text-foreground mb-4">
                Thực đơn
              </h1>

              <QuickActions
                onBarcodeSearch={handleBarcodeSearch}
                onCustomerSearch={handleCustomerSearch}
                onQuickAdd={handleQuickAdd}
              />

              <MenuCategory
                categories={[
                  { id: 'all', name: 'Tất cả', icon: 'LayoutGrid' },
                  ...categories
                ]}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <MenuGrid
                menuItems={getCurrentMenuItems()}
                onAddToCart={handleAddToCart}
              />
            </div>
          </div>

          {/* Right Panel - Order Cart */}
          <div className={`
            w-full lg:w-96 bg-surface border-l border-border
            ${showMobileCart ? 'flex' : 'hidden lg:flex'}
            flex-col overflow-hidden
          `}>
            <div className="p-4 border-b border-border flex items-center justify-between flex-shrink-0">
              <h2 className="text-lg font-semibold text-foreground">
                Đơn hàng
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMobileCart(false)}
                className="lg:hidden"
              >
                <Icon name="X" size={20} />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <OrderCart
                cartItems={cartItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onUpdateNote={handleUpdateNote}
                onClearCart={() => setShowClearCartDialog(true)}
                orderNumber={orderNumber}
                selectedTable={selectedTable}
                onTableChange={setSelectedTable}
                selectedStaff={selectedStaff}
                onStaffChange={setSelectedStaff}
                onSummaryChange={setOrderSummary}
              />
            </div>

            {cartItems?.length > 0 && (
              <div className="border-t border-border p-4 flex-shrink-0 bg-surface space-y-2">
                {/* Create Order Button */}
                <Button
                  variant="outline"
                  size="default"
                  fullWidth
                  iconName="FileText"
                  iconPosition="left"
                  onClick={handleCreateOrder}
                  className="hover-scale touch-target"
                >
                  Tạo đơn hàng
                </Button>

                {/* Payment Button */}
                <Button
                  variant="success"
                  size="lg"
                  fullWidth
                  iconName="CreditCard"
                  iconPosition="left"
                  onClick={handleGoToPayment}
                  className="hover-scale touch-target"
                >
                  Thanh toán ({new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(orderSummary.total)})
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Nhấn <kbd className="px-1.5 py-0.5 bg-muted rounded text-foreground font-mono">F2</kbd> để thanh toán nhanh
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Cart Toggle Button */}
        <div className="lg:hidden fixed bottom-4 right-4 z-1000">
          <Button
            variant="default"
            size="lg"
            onClick={() => setShowMobileCart(true)}
            className="rounded-full shadow-modal hover-scale relative"
          >
            <Icon name="ShoppingCart" size={24} className="mr-2" />
            <span>Giỏ hàng ({getTotalItems()})</span>
            {cartItems?.length > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-error text-error-foreground text-xs rounded-full flex items-center justify-center">
                {getTotalItems()}
              </span>
            )}
          </Button>
        </div>
      </main>

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        isOpen={showClearCartDialog}
        onClose={() => setShowClearCartDialog(false)}
        onConfirm={handleClearCart}
        title="Xóa giỏ hàng"
        message="Bạn có chắc chắn muốn xóa tất cả món trong giỏ hàng?"
        confirmText="Xóa tất cả"
        cancelText="Hủy"
        variant="danger"
        icon="Trash2"
      />

      <ConfirmationDialog
        isOpen={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        onConfirm={() => {
          // Trigger payment from PaymentSection
          setShowPaymentDialog(false);
        }}
        title="Xác nhận thanh toán"
        message={`Tổng tiền: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(orderSummary.total)}`}
        confirmText="Thanh toán"
        cancelText="Hủy"
        variant="success"
        icon="CreditCard"
      />
    </div>
  );
};

export default MainPOSDashboard;