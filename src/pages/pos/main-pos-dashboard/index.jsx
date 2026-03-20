import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import MenuCategory from './components/MenuCategory';
import MenuGrid from './components/MenuGrid';
import OrderCart from './components/OrderCart';
import QuickActions from './components/QuickActions';
import RecentOrders from './components/RecentOrders';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import ConfirmationDialog from '../../../components/ui/ConfirmationDialog';
import { FullscreenLoading } from '../../../components/ui/Loading';
import { useToast } from '../../../hooks/use-toast';
import { useLoadPOSData } from '../../../hooks/use-load-pos-data';
import { useSSESubscription } from '../../../contexts/SSEContext';
import { useOrderStore } from '../../../stores/order.store';
import { useTableStore } from '../../../stores/table.store';
import { useMenuStore } from '../../../stores/menu.store';
import { useStaffStore } from '../../../stores';
import { useRestaurantStore } from '../../../stores/restaurant.store';
import { useCustomerOrderStore } from '../../../stores/customer-order.store';
import { useNotificationStore } from '../../../stores/notification.store';
import { createOrderApi, openRestaurantApi, closeRestaurantApi, getRestaurantDetailsApi, getDraftOrders } from '../../../api/restaurant';
import soundManager from '../../../utils/sounds';

const MainPOSDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedRestaurant = useRestaurantStore((state) => state.selectedRestaurant);
  const updateSelectedRestaurant = useRestaurantStore((state) => state.updateSelectedRestaurant);

  // Customer order store for draft orders
  const customerOrders = useCustomerOrderStore((state) => state.customerOrders);
  const setCustomerOrders = useCustomerOrderStore((state) => state.setCustomerOrders);
  const addCustomerOrder = useCustomerOrderStore((state) => state.addCustomerOrder);
  const removeCustomerOrder = useCustomerOrderStore((state) => state.removeCustomerOrder);
  const addConfirmedOrder = useCustomerOrderStore((state) => state.addConfirmedOrder);
  const updateConfirmedOrder = useCustomerOrderStore((state) => state.updateConfirmedOrder);

  // Notification store
  const addNotification = useNotificationStore((state) => state.addNotification);

  // Order Store
  const addOrder = useOrderStore((state) => state.addOrder);
  const updateOrderStatus = useOrderStore((state) => state.updateOrderStatus);

  // Table Store
  const getTableLabel = useTableStore((state) => state.getTableLabel);
  const setTableStatus = useTableStore((state) => state.setTableStatus);

  // Menu Store
  const categories = useMenuStore((state) => state.categories);
  const menuItems = useMenuStore((state) => state.menuItems);
  const getAvailableMenuItems = useMenuStore((state) => state.getAvailableMenuItems);

  // Local state - MUST be declared BEFORE useEffects that use them
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showRecentOrders, setShowRecentOrders] = useState(false);
  const [isLoadingDraftOrders, setIsLoadingDraftOrders] = useState(false);
  const [isOperational, setIsOperational] = useState(() => selectedRestaurant?.isOpen ?? true);
  const [isTogglingOperational, setIsTogglingOperational] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [cartItems, setCartItems] = useState([]);
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [showClearCartDialog, setShowClearCartDialog] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [orderNumber, setOrderNumber] = useState(null);
  const [currentDraftOrderId, setCurrentDraftOrderId] = useState(null); // Track draft order being reordered
  const [draftCustomerInfo, setDraftCustomerInfo] = useState(null); // Customer info from draft order
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0
  });

  // Refresh restaurant details on every mount to avoid stale persisted data
  useEffect(() => {
    if (!selectedRestaurant?._id) return;
    getRestaurantDetailsApi(selectedRestaurant._id)
      .then((response) => {
        const details = response.data;
        if (details && typeof details === 'object') {
          updateSelectedRestaurant(details);
        }
      })
      .catch((err) => {
        console.warn('[MainPOS] Could not refresh restaurant details:', err);
      });
  }, [selectedRestaurant?._id]);
  // Sync isOperational whenever selectedRestaurant.isOpen changes (e.g. after background refresh)
  useEffect(() => {
    if (selectedRestaurant?.isOpen !== undefined) {
      setIsOperational(selectedRestaurant.isOpen);
    }
  }, [selectedRestaurant?.isOpen]);

  // Load all POS data using custom hook
  const { isLoading: isLoadingData } = useLoadPOSData(
    selectedRestaurant?._id
  );

  // Load draft orders from customer ordering
  useEffect(() => {
    if (!selectedRestaurant?._id) return;

    const loadDraftOrders = async () => {
      try {
        setIsLoadingDraftOrders(true);
        const draftOrders = await getDraftOrders(selectedRestaurant._id);
        console.log('[MainPOS] Loaded draft orders:', draftOrders);
        setCustomerOrders(draftOrders || []);
      } catch (error) {
        console.error('[MainPOS] Failed to load draft orders:', error);
        toast({
          title: 'Lỗi tải đơn hàng',
          description: 'Không thể tải danh sách đơn cần xác nhận',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingDraftOrders(false);
      }
    };

    loadDraftOrders();
  }, [selectedRestaurant?._id]);

  // Auto cleanup expired draft orders
  useEffect(() => {
    const cleanupExpiredOrders = () => {
      if (!customerOrders || customerOrders.length === 0) return;

      const now = Date.now();
      const expiredOrders = customerOrders.filter(order => {
        if (!order.expiredAt) return false;
        return new Date(order.expiredAt).getTime() < now;
      });

      if (expiredOrders.length > 0) {
        const validOrders = customerOrders.filter(order => {
          if (!order.expiredAt) return true;
          return new Date(order.expiredAt).getTime() >= now;
        });

        setCustomerOrders(validOrders);
        console.log(`[MainPOS] Auto-removed ${expiredOrders.length} expired draft orders`);

        // Check if current cart is from an expired draft order
        const expiredIds = expiredOrders.map(o => o._id);
        if (currentDraftOrderId && expiredIds.includes(currentDraftOrderId)) {
          console.log('[MainPOS] Current cart draft order expired, clearing cart');
          setCartItems([]);
          setCurrentDraftOrderId(null);
          setDraftCustomerInfo(null);
          addNotification({
            type: 'warning',
            message: 'Đơn hàng trong giỏ đã hết hạn và bị xóa',
          });
        }

        // Add notification to Header instead of toast
        addNotification({
          type: 'warning',
          message: `${expiredOrders.length} đơn hàng đã hết hạn và bị xóa tự động`,
        });
      }
    };

    // Check immediately when customerOrders changes
    cleanupExpiredOrders();

    // Check every minute
    const interval = setInterval(cleanupExpiredOrders, 60000);

    return () => clearInterval(interval);
  }, [customerOrders, setCustomerOrders, addNotification, currentDraftOrderId]);

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
      setCurrentDraftOrderId(null);
      setDraftCustomerInfo(null);
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

  // SSE Event Handler
  const handleSSEEvent = useCallback((data) => {
    console.log('[MainPOS] Received SSE event:', data);

    switch (data.type) {
      case 'NEW_ORDER':
        if (data.order) {
          addOrder(data.order);
          soundManager.playNewOrder();
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
          toast({
            title: 'Cập nhật đơn hàng',
            description: `Đơn hàng ${data.orderId} đã chuyển sang ${data.status}`,
          });
        }
        break;

      case 'TABLE_UPDATE':
      case 'TABLE_STATUS_UPDATE':
        if (data.tableId && data.status) {
          setTableStatus(data.tableId, data.status);
        }
        break;

      case 'PAYMENT_UPDATE':
        if (data.orderId && data.paymentStatus) {
          updateOrderStatus(data.orderId, { paymentStatus: data.paymentStatus });
          if (data.paymentStatus === 'paid') {
            soundManager.playSuccess();
            toast({
              title: '✅ Thanh toán thành công',
              description: `Đơn hàng ${data.orderId}`,
            });
          }
        }
        break;
      case 'new_draft_order':
        if (data) {
          const draftOrder = data.data;
          console.log('[MainPOS] Received new draft order:', draftOrder);
          // Show notification in Header
          addNotification({
            type: 'info',
            message: `Đơn hàng mới cần xác nhận từ ${draftOrder.customer?.name || 'Khách'} - Bàn ${draftOrder.table}`,
          });
          console.log("Đã send notification for new draft order");
          // Add to customer order store
          addCustomerOrder(draftOrder);

        }
        break;

      case 'new_order_confirmed':
        // Event khi order được confirm
        if (data.data) {
          const confirmedOrder = data.data;
          console.log('[MainPOS] Order confirmed:', confirmedOrder);

          // Xóa order khỏi draft orders
          removeCustomerOrder(confirmedOrder._id);

          // Thêm vào confirmed orders
          addConfirmedOrder(confirmedOrder);

          // Show notification
          addNotification({
            type: 'success',
            message: `Đơn hàng bàn ${confirmedOrder.table} đã được xác nhận`,
          });
        }
        break;

      case 'payment_success':
        // Event khi payment thành công
        if (data.data) {
          const paidOrder = data.data;
          console.log('[MainPOS] Payment successful:', paidOrder);

          // Update toàn bộ dữ liệu order trong confirmed orders
          updateConfirmedOrder(paidOrder._id, paidOrder);

          // Show notification
          addNotification({
            type: 'success',
            message: `Thanh toán thành công cho đơn hàng bàn ${paidOrder.table}`,
          });
        }
        break;

      default:
        console.log('[MainPOS] Unknown event type:', data.type);
    }
  }, [addOrder, updateOrderStatus, setTableStatus, toast, addCustomerOrder, removeCustomerOrder, addConfirmedOrder, updateConfirmedOrder, addNotification]);

  const handleToggleOperational = async () => {
    if (!selectedRestaurant?._id || isTogglingOperational) return;
    setIsTogglingOperational(true);
    try {
      if (isOperational) {
        await closeRestaurantApi(selectedRestaurant._id);
        setIsOperational(false);
        toast({ title: 'Đã đóng cửa', description: 'Nhà hàng đã chuyển sang trạng thái đóng cửa.' });
      } else {
        await openRestaurantApi(selectedRestaurant._id);
        setIsOperational(true);
        toast({ title: 'Đã mở cửa', description: 'Nhà hàng đã chuyển sang trạng thái mở cửa.' });
      }
    } catch (error) {
      console.error('Error toggling restaurant status:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật trạng thái nhà hàng. Vui lòng thử lại!',
        variant: 'destructive',
      });
    } finally {
      setIsTogglingOperational(false);
    }
  };

  // Subscribe to SSE events (1 connection duy nhất từ SSEProvider)
  const { isConnected } = useSSESubscription(handleSSEEvent, 'MainPOSDashboard');

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

  const currentMenuItems = useMemo(() => {
    if (activeCategory === 'all') {
      return getAvailableMenuItems();
    }
    return menuItems.filter(item =>
      item.category === activeCategory && item.status === 'available'
    );
  }, [activeCategory, menuItems, getAvailableMenuItems]);

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
      const existingItem = prevItems.find(cartItem => cartItem._id === item._id);

      if (existingItem) {
        toast({
          title: "Đã cập nhật",
          description: `${item.name} x${existingItem.quantity + 1}`,
        });
        return prevItems.map(cartItem =>
          cartItem._id === item._id
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
        item?._id === itemId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const handleRemoveItem = (itemId) => {
    soundManager.playRemoveItem();
    setCartItems(prevItems => prevItems?.filter(item => item?._id !== itemId));
  };

  const handleUpdateNote = (itemId, note) => {
    setCartItems(prevItems =>
      prevItems?.map(item =>
        item?._id === itemId
          ? { ...item, note }
          : item
      )
    );
  };

  const handleClearCart = () => {
    soundManager.playRemoveItem();
    setCartItems([]);
    setCurrentDraftOrderId(null);
    setDraftCustomerInfo(null);
    toast({
      title: "Đã xóa giỏ hàng",
      description: "Tất cả món đã được xóa",
    });
  };

  const handleCreateOrder = async () => {
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

    // Build order data matching CreateOrderDto
    const orderData = {
      table: tableLabel,
      staffId: selectedStaff || undefined,
      staff: staffName,
      status: 'pending',
      items: cartItems.map(item => ({
        itemId: item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        note: item.note || undefined
      })),
      subtotal: orderSummary.subtotal,
      tax: orderSummary.tax,
      discount: orderSummary.discount,
      total: orderSummary.total
    };

    try {
      setIsCreatingOrder(true);
      const response = await createOrderApi(selectedRestaurant?._id, orderData);

      // Save order to store - server returns order with _id, createdAt, updatedAt
      const createdOrder = {
        ...response.data,
        timestamp: response.data.createdAt,
      };
      addOrder(createdOrder);

      soundManager.playSuccess();
      toast({
        title: "Tạo đơn thành công!",
        description: `Đơn hàng đã được tạo cho ${tableLabel}`,
        variant: "success"
      });

      // Clear cart after creating order
      setCartItems([]);
      setCurrentDraftOrderId(null);
      setDraftCustomerInfo(null);
      setShowMobileCart(false);
    } catch (error) {
      soundManager.playError();
      toast({
        title: "Lỗi tạo đơn",
        description: error?.response?.data?.message || "Không thể tạo đơn hàng. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingOrder(false);
    }
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
    // Barcode search - find item by _id or name
    const foundItem = menuItems.find(item =>
      item._id.includes(barcode) ||
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
    soundManager.playNotification();
    toast({
      title: "Tìm kiếm khách hàng",
      description: `Đang tìm: ${query}`,
    });
  };

  const handleQuickAdd = (item) => {
    handleAddToCart(item);
  };

  const handleConfirmOrder = async (draftOrder) => {
    if (!selectedRestaurant?._id) return;

    // Check if order is expired
    if (draftOrder.expiredAt && new Date(draftOrder.expiredAt).getTime() < Date.now()) {
      soundManager.playError();
      toast({
        title: 'Đơn hàng đã hết hạn',
        description: 'Không thể xác nhận đơn hàng đã hết hạn',
        variant: 'destructive'
      });
      // Remove expired order
      removeCustomerOrder(draftOrder._id);
      return;
    }

    try {
      setIsCreatingOrder(true);

      // Build order data from draft order - send 100% of the data
      const orderData = {
        _id: draftOrder._id, // Include draft order ID so server can link them
        table: draftOrder.table,
        staffId: draftOrder.staffId || undefined,
        staff: draftOrder.staff || 'Chưa phân công',
        status: draftOrder.status || 'pending',
        customer: draftOrder.customer ? {
          customerId: draftOrder.customer.customerId,
          name: draftOrder.customer.name,
          contact: draftOrder.customer.contact
        } : undefined,
        items: draftOrder.items.map(item => ({
          itemId: item.itemId || item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          note: item.note || undefined
        })),
        subtotal: draftOrder.subtotal,
        tax: draftOrder.tax,
        discount: draftOrder.discount || 0,
        total: draftOrder.total
      };

      // Send to server
      const response = await createOrderApi(selectedRestaurant._id, orderData);

      // Save confirmed order to order store
      const confirmedOrder = {
        ...response.data,
        timestamp: response.data.createdAt,
      };
      addOrder(confirmedOrder);

      // Remove from draft orders
      removeCustomerOrder(draftOrder._id);

      soundManager.playSuccess();
      toast({
        title: 'Xác nhận đơn thành công!',
        description: `Đơn hàng từ ${draftOrder.customer?.name || 'Khách'} đã được xác nhận`,
        variant: 'success'
      });

      // Close the panel if no more draft orders
      if (customerOrders.length <= 1) {
        setShowRecentOrders(false);
      }
    } catch (error) {
      console.error('[MainPOS] Error confirming order:', error);
      soundManager.playError();
      toast({
        title: 'Lỗi xác nhận đơn',
        description: error?.response?.data?.message || 'Không thể xác nhận đơn hàng. Vui lòng thử lại.',
        variant: 'destructive'
      });
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handleReorderDraft = async (draftOrder) => {
    if (!selectedRestaurant?._id) return;

    // Check if order is expired
    if (draftOrder.expiredAt && new Date(draftOrder.expiredAt).getTime() < Date.now()) {
      toast({
        title: 'Đơn hàng đã hết hạn',
        description: 'Không thể đặt lại đơn hàng đã hết hạn',
        variant: 'destructive'
      });
      // Remove expired order
      removeCustomerOrder(draftOrder._id);
      return;
    }

    try {
      // Clear current cart and reset
      setCartItems([]);

      // Build cart items from draft order
      const cartItemsToAdd = draftOrder.items?.map((item) => ({
        _id: item.itemId ?? item._id ?? item.name,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        status: 'available',
        note: item.note || ''
      })) || [];

      // Set table from draft order
      if (draftOrder.table) {
        // Try to find table value from label
        const tables = useTableStore.getState().tables;
        const matchedTable = tables.find(t =>
          getTableLabel(t._id) === draftOrder.table ||
          t.name === draftOrder.table
        );
        if (matchedTable) {
          setSelectedTable(matchedTable._id);
        } else {
          // If can't match, set as takeaway/delivery if it matches
          if (draftOrder.table?.includes('Mang đi')) {
            setSelectedTable('takeaway');
          } else if (draftOrder.table?.includes('Giao hàng')) {
            setSelectedTable('delivery');
          }
        }
      }

      // Set staff from draft order
      if (draftOrder.staffId) {
        setSelectedStaff(draftOrder.staffId);
      }

      // Set cart items and track draft order
      setCartItems(cartItemsToAdd);
      setCurrentDraftOrderId(draftOrder._id);
      setDraftCustomerInfo(draftOrder.customer || null);

      // Close the panel and show cart  
      setShowRecentOrders(false);
      setShowMobileCart(true); // Show cart on mobile
    } catch (error) {
      console.error('[MainPOS] Error reordering draft:', error);
      soundManager.playError();
      toast({
        title: 'Lỗi',
        description: 'Không thể thêm món vào giỏ hàng. Vui lòng thử lại.',
        variant: 'destructive'
      });
    }
  };

  const totalItems = useMemo(() => {
    return cartItems?.reduce((total, item) => total + item?.quantity, 0) || 0;
  }, [cartItems]);

  // Show loading screen while fetching data
  if (isLoadingData) {
    return <FullscreenLoading message="Đang tải dữ liệu POS..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        storeName="POS Manager"
        isOperational={isOperational}
        onToggleOperational={handleToggleOperational}
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
            {showRecentOrders ? (
              <RecentOrders
                orders={customerOrders || []}
                onClose={() => setShowRecentOrders(false)}
                onConfirmOrder={handleConfirmOrder}
                onReorderDraft={handleReorderDraft}
              />
            ) : (
              <>
                <div className="p-4 border-b border-border">
                  <h1 className="text-xl font-semibold text-foreground mb-4">
                    Thực đơn
                  </h1>

                  <QuickActions
                    onBarcodeSearch={handleBarcodeSearch}
                    onCustomerSearch={handleCustomerSearch}
                    onQuickAdd={handleQuickAdd}
                    onShowRecentOrders={() => setShowRecentOrders(true)}
                    isShowingRecentOrders={showRecentOrders}
                    draftOrdersCount={customerOrders?.length || 0}
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
                    menuItems={currentMenuItems}
                    onAddToCart={handleAddToCart}
                  />
                </div>
              </>
            )}
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
                draftOrderId={currentDraftOrderId}
                draftCustomerInfo={draftCustomerInfo}
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
                  iconName={isCreatingOrder ? "Loader2" : "FileText"}
                  iconPosition="left"
                  onClick={handleCreateOrder}
                  disabled={isCreatingOrder}
                  className={`hover-scale touch-target ${isCreatingOrder ? 'animate-pulse' : ''}`}
                >
                  {isCreatingOrder ? 'Đang tạo đơn...' : 'Tạo đơn hàng'}
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
            <span>Giỏ hàng ({totalItems})</span>
            {cartItems?.length > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-error text-error-foreground text-xs rounded-full flex items-center justify-center">
                {totalItems}
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
    </div>
  );
};

export default MainPOSDashboard;