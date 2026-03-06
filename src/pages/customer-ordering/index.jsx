import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import Header from './components/Header';
import MenuCategory from './components/MenuCategory';
import MenuGrid from './components/MenuGrid';
import OrderCart from './components/OrderCart';
import QuickActions from './components/QuickActions';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';
import { useToast } from '../../hooks/use-toast';
import { useLoadPOSData } from '../../hooks/use-load-pos-data';
import { useSSESubscription } from '../../contexts/SSEContext';
import { useTableStore } from '../../stores/table.store';
import { useMenuStore } from '../../stores/menu.store';
import { useStaffStore, useAuthStore } from '../../stores';
import { useCustomerOrderStore } from '../../stores/customer-order.store';
import { useRestaurantStore } from '../../stores/restaurant.store';
import {
  createDraftOrderApi,
  getRestaurantDetailsApi,
  getMenuItemsApi,
  getTablesApi,
  getOrdersForUserApi,
} from '../../api/restaurant';

// Helper: Validate MongoDB ObjectId format (24 hex characters)
const isValidMongoId = (id) => {
  return /^[a-f\d]{24}$/i.test(id);
};

const CustomerOrdering = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { restaurantId: urlRestaurantId } = useParams();

  // If restaurantId comes from URL params, this is the URL-based route
  const isUrlRoute = Boolean(urlRestaurantId);

  const selectedRestaurant = useRestaurantStore((state) => state.selectedRestaurant);
  const user = useAuthStore((state) => state.user);

  // Local state for URL-based route data (fetched via authenticated APIs)
  const [urlRestaurant, setUrlRestaurant] = useState(null);
  const [urlMenuItems, setUrlMenuItems] = useState([]);
  const [urlTables, setUrlTables] = useState([]);
  const [isLoadingUrlData, setIsLoadingUrlData] = useState(false);

  // Fetch data for URL-based route via restaurantId param
  // Step 1: Validate restaurantId and fetch details first
  // Step 2: Check if restaurant is open
  // Step 3: If valid and open, fetch menu and tables
  useEffect(() => {
    if (!isUrlRoute) return;

    const fetchData = async () => {
      setIsLoadingUrlData(true);

      try {
        // Step 1: Validate MongoDB ObjectId format
        if (!isValidMongoId(urlRestaurantId)) {
          toast({
            title: 'Lỗi',
            description: 'ID nhà hàng không hợp lệ.',
            variant: 'destructive'
          });
          // Redirect to feed or previous page
          navigate('/feed', { replace: true });
          return;
        }

        // Step 2: Fetch restaurant details first
        const detailsResponse = await getRestaurantDetailsApi(urlRestaurantId);
        const restaurant = detailsResponse.metadata || detailsResponse;

        if (!restaurant || !restaurant._id) {
          toast({
            title: 'Không tìm thấy',
            description: 'Nhà hàng không tồn tại.',
            variant: 'destructive'
          });
          navigate('/feed', { replace: true });
          return;
        }

        // Step 3: Set restaurant state (allow entry even if closed)
        setUrlRestaurant(restaurant);
        setIsOperational(restaurant.isOpen || false);

        // Show warning if restaurant is closed but allow entry
        if (!restaurant.isOpen) {
          toast({
            title: 'Nhà hàng đã đóng cửa',
            description: `${restaurant.name || 'Nhà hàng này'} hiện đang đóng cửa. Bạn có thể xem thực đơn nhưng không thể đặt hàng.`,
            variant: 'warning'
          });
        }

        // Step 4: Fetch menu, tables và orders trong parallel
        const [menuRes, tablesRes, ordersRes] = await Promise.allSettled([
          getMenuItemsApi(urlRestaurantId),
          getTablesApi(urlRestaurantId),
          getOrdersForUserApi(urlRestaurantId),
        ]);

        if (menuRes.status === 'fulfilled') {
          const data = menuRes.value;
          // Menu API returns {active: [], inactive: [], totalItems}
          if (data?.active) {
            setUrlMenuItems([
              ...data.active.map((item) => ({ ...item, status: 'available' })),
              ...(data.inactive || []).map((item) => ({ ...item, status: 'unavailable' })),
            ]);
          } else if (Array.isArray(data)) {
            setUrlMenuItems(data);
          }
        }

        if (tablesRes.status === 'fulfilled') {
          setUrlTables(tablesRes.value || []);
        }

        if (ordersRes.status === 'fulfilled') {
          const { orders = [], draftOrders = [] } = ordersRes.value || {};
          setCustomerOrders(draftOrders);
          setConfirmedOrders(orders);
        }

      } catch (err) {
        toast({
          title: 'Lỗi',
          description: err.response?.data?.message || 'Không thể tải thông tin nhà hàng.',
          variant: 'destructive'
        });
        // Redirect on error
        navigate(location.state?.from || '/feed', { replace: true });
      } finally {
        setIsLoadingUrlData(false);
      }
    };

    fetchData();
  }, [urlRestaurantId]);

  // Customer Order Store - riêng cho customer
  const addCustomerOrder = useCustomerOrderStore((state) => state.addCustomerOrder);
  const removeCustomerOrder = useCustomerOrderStore((state) => state.removeCustomerOrder);
  const addConfirmedOrder = useCustomerOrderStore((state) => state.addConfirmedOrder);
  const updateConfirmedOrder = useCustomerOrderStore((state) => state.updateConfirmedOrder);
  const customerOrders = useCustomerOrderStore((state) => state.customerOrders);
  const confirmedOrders = useCustomerOrderStore((state) => state.confirmedOrders);
  const getCustomerOrdersByUser = useCustomerOrderStore((state) => state.getCustomerOrdersByUser);
  const getConfirmedOrdersByUser = useCustomerOrderStore((state) => state.getConfirmedOrdersByUser);
  const setCustomerOrders = useCustomerOrderStore((state) => state.setCustomerOrders);
  const setConfirmedOrders = useCustomerOrderStore((state) => state.setConfirmedOrders);

  const getTableLabel = useTableStore((state) => state.getTableLabel);

  // Menu Store (used only for store-based route)
  const storeCategories = useMenuStore((state) => state.categories);
  const storeMenuItems = useMenuStore((state) => state.menuItems);
  const getAvailableMenuItems = useMenuStore((state) => state.getAvailableMenuItems);

  // Resolved data based on route type
  const effectiveRestaurantId = isUrlRoute ? urlRestaurantId : selectedRestaurant?._id;
  const effectiveRestaurant = isUrlRoute ? urlRestaurant : selectedRestaurant;

  // For store-based route (/order), keep loading via hook as before
  // Customer ordering doesn't need staff data
  useLoadPOSData(isUrlRoute ? null : selectedRestaurant?._id, {
    loadStaff: false
  });

  // Sync isOperational for store-based route
  useEffect(() => {
    if (!isUrlRoute && selectedRestaurant?.isOpen !== undefined) {
      setIsOperational(selectedRestaurant.isOpen);
    }
  }, [isUrlRoute, selectedRestaurant?.isOpen]);

  // Fetch draft orders và confirmed orders cho store-based route (URL route đã fetch trong useEffect trên)
  useEffect(() => {
    if (isUrlRoute) return;
    if (!effectiveRestaurantId) return;

    const fetchOrders = async () => {
      try {
        const response = await getOrdersForUserApi(effectiveRestaurantId);
        const { orders = [], draftOrders = [] } = response || {};
        setCustomerOrders(draftOrders);
        setConfirmedOrders(orders);
      } catch (error) {
        // Silent failure for fetch orders (may be non-critical)
      }
    };

    fetchOrders();
  }, [effectiveRestaurantId, isUrlRoute]);

  // Build categories from urlMenuItems for URL-based route
  // const urlCategories = useMemo(() => {
  //   if (!isUrlRoute) return [];
  //   const seen = new Set();
  //   const cats = [];
  //   urlMenuItems.forEach((item) => {
  //     if (item.category && !seen.has(item.category)) {
  //       seen.add(item.category);
  //       cats.push({ id: item.category, name: item.category });
  //     }
  //   });
  //   return cats;
  // }, [urlMenuItems, isUrlRoute]);

  const categories = storeCategories;
  const menuItems = isUrlRoute ? urlMenuItems : storeMenuItems;

  const [isOperational, setIsOperational] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [cartItems, setCartItems] = useState([]);
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [showClearCartDialog, setShowClearCartDialog] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [orderNumber, setOrderNumber] = useState(null);
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0
  });
  const [notifications, setNotifications] = useState([]);

  // Add notification to list
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now(),
      time: new Date().toISOString(),
      ...notification
    };
    setNotifications(prev => {
      const updated = [newNotification, ...prev].slice(0, 10);
      return updated;
    });
  }, []);

  // SSE Event Handler - Listen for order confirmations
  const handleSSEEvent = useCallback((data) => {
    console.log('[CustomerOrdering] Received SSE event:', data);

    switch (data.type) {
      case 'new_order_confirmed':
        // Event khi order được confirm bởi restaurant
        if (data.data) {
          const confirmedOrder = data.data;
          console.log('[CustomerOrdering] Order confirmed:', confirmedOrder);

          // Xóa order khỏi draft orders
          removeCustomerOrder(confirmedOrder._id);

          // Thêm vào confirmed orders
          addConfirmedOrder(confirmedOrder);

          // Push notification
          addNotification({
            type: 'success',
            message: `Đơn hàng bàn ${confirmedOrder.table} đã được xác nhận`,
            orderId: confirmedOrder._id
          });

          // Show toast
          toast({
            title: '✅ Đơn hàng đã được xác nhận',
            description: `Đơn hàng bàn ${confirmedOrder.table} đã được nhà hàng xác nhận`,
            variant: 'success'
          });
        }
        break;

      case 'payment_success':
        // Event khi payment thành công
        if (data.data) {
          const paidOrder = data.data;

          // Update toàn bộ dữ liệu order trong confirmed orders (trừ _id)
          updateConfirmedOrder(paidOrder._id, paidOrder);

          // Push notification
          addNotification({
            type: 'success',
            message: `Thanh toán thành công cho đơn hàng bàn ${paidOrder.table}`,
            orderId: paidOrder._id
          });

          // Show toast
          toast({
            title: '💳 Thanh toán thành công',
            description: `Đơn hàng bàn ${paidOrder.table} đã được thanh toán`,
            variant: 'success'
          });
        }
        break;
      default:
        console.log('[CustomerOrdering] Unknown event type:', data.type);
    }
  }, [removeCustomerOrder, addConfirmedOrder, updateConfirmedOrder, addNotification, toast]);

  // Subscribe to SSE events
  const { isConnected: isSSEConnected } = useSSESubscription(handleSSEEvent, 'CustomerOrdering');

  // Check for expired draft orders every minute
  useEffect(() => {
    const checkExpiredOrders = () => {
      const now = Date.now();
      const allDraftOrders = user ? getCustomerOrdersByUser(user._id) : customerOrders;

      allDraftOrders.forEach(order => {
        if (order.expiredAt) {
          const expiryTime = new Date(order.expiredAt).getTime();
          const timeLeft = expiryTime - now;

          // Nếu hết hạn
          if (timeLeft <= 0) {
            addNotification({
              type: 'error',
              message: `Đơn hàng bàn ${order.table} đã hết hạn`,
              orderId: order._id
            });
            // Xóa draft order hết hạn
            removeCustomerOrder(order._id);
          }
          // Cảnh báo trước 5 phút
          else if (timeLeft <= 5 * 60 * 1000 && timeLeft > 4 * 60 * 1000) {
            addNotification({
              type: 'warning',
              message: `Đơn hàng bàn ${order.table} sắp hết hạn (còn ${Math.floor(timeLeft / 60000)} phút)`,
              orderId: order._id
            });
          }
        }
      });
    };

    // Check ngay khi mount
    checkExpiredOrders();

    // Check mỗi 60 giây
    const interval = setInterval(checkExpiredOrders, 60000);

    return () => clearInterval(interval);
  }, [customerOrders, user, getCustomerOrdersByUser, addNotification, removeCustomerOrder]);

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
      setCustomerName('');
      setCustomerContact('');
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
      if (isUrlRoute) {
        return urlMenuItems.filter((item) => item.status !== 'unavailable');
      }
      return getAvailableMenuItems();
    }
    return menuItems.filter(item =>
      item.category === activeCategory && item.status !== 'unavailable'
    );
  }, [activeCategory, menuItems, urlMenuItems, isUrlRoute, getAvailableMenuItems]);

  const handleAddToCart = (item) => {
    if (item.stock_quantity === 0 || item.status === 'unavailable') {
      toast({
        title: "Hết hàng",
        description: `${item.name} hiện đã hết hàng`,
        variant: "destructive"
      });
      return;
    }

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
    setCartItems([]);
    toast({
      title: "Đã xóa giỏ hàng",
      description: "Tất cả món đã được xóa",
    });
  };

  const handleCreateOrder = async () => {
    // Check if restaurant is operational
    if (!isOperational) {
      toast({
        title: "Nhà hàng đã đóng cửa",
        description: "Không thể đặt hàng khi nhà hàng đã đóng cửa.",
        variant: "destructive"
      });
      return;
    }

    if (!cartItems.length) {
      toast({
        title: "Giỏ hàng trống",
        description: "Vui lòng thêm món vào giỏ hàng để tạo đơn",
        variant: "destructive"
      });
      return;
    }

    if (!selectedTable) {
      toast({
        title: "Chưa chọn bàn",
        description: "Vui lòng chọn bàn trước khi tạo đơn",
        variant: "destructive"
      });
      return;
    }

    // Check customer info for guest users
    if (!user && !customerName.trim()) {
      toast({
        title: "Thiếu thông tin khách hàng",
        description: "Vui lòng nhập tên khách hàng",
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
      customer: {
        customerId: user?._id || undefined,
        name: user ? user.user_name : customerName.trim(),
        contact: user ? user.email : customerContact.trim() || undefined,
      },
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
      const response = await createDraftOrderApi(effectiveRestaurantId, orderData);

      // Lưu order vào customer order store (tách biệt với POS)
      const createdOrder = {
        ...response.metadata,
        timestamp: response.metadata.createdAt,
      };
      addCustomerOrder(createdOrder);

      toast({
        title: "Tạo đơn thành công!",
        description: `Đơn hàng đã được tạo cho ${tableLabel}`,
        variant: "success"
      });

      // Clear cart after creating order
      setCartItems([]);
      setShowMobileCart(false);
    } catch (error) {
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
    // Check if restaurant is operational
    if (!isOperational) {
      toast({
        title: "Nhà hàng đã đóng cửa",
        description: "Không thể thanh toán khi nhà hàng đã đóng cửa.",
        variant: "destructive"
      });
      return;
    }

    if (cartItems.length === 0) {
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
      toast({
        title: "Không tìm thấy",
        description: "Không tìm thấy sản phẩm với mã vạch này",
        variant: "destructive"
      });
    }
  };

  const handleCustomerSearch = (query) => {
    toast({
      title: "Tìm kiếm khách hàng",
      description: `Đang tìm: ${query}`,
    });
  };

  const handleQuickAdd = (item) => {
    handleAddToCart(item);
  };

  const totalItems = useMemo(() => {
    return cartItems?.reduce((total, item) => total + item?.quantity, 0) || 0;
  }, [cartItems]);

  // Số đơn hàng đã tạo cho Header cart icon
  const ordersCount = useMemo(() => {
    if (user) {
      const draftCount = getCustomerOrdersByUser(user._id)?.length || 0;
      const confirmedCount = getConfirmedOrdersByUser(user._id)?.length || 0;
      return draftCount + confirmedCount;
    }
    return (customerOrders?.length || 0) + (confirmedOrders?.length || 0);
  }, [customerOrders, confirmedOrders, user, getCustomerOrdersByUser, getConfirmedOrdersByUser]);

  return (
    <div className="min-h-screen bg-background">
      <Header
        isOperational={isOperational}
        ordersCount={ordersCount}
        draftOrders={user ? getCustomerOrdersByUser(user._id) : customerOrders}
        confirmedOrders={user ? getConfirmedOrdersByUser(user._id) : confirmedOrders}
        notifications={notifications}
        user={user}
        restaurantName={effectiveRestaurant?.name || effectiveRestaurant?.restaurantName}
        restaurantLogo={effectiveRestaurant?.logo}
      />
      <main className={`
        pt-16 md:pt-16 transition-all duration-300 ease-smooth
      `}>
        <div className="h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)] flex flex-col lg:flex-row ">
          {/* Left Panel - Menu */}
          <div className={`
            flex-1 bg-surface border-r border-border overflow-hidden
            ${showMobileCart ? 'hidden lg:flex' : 'flex'}
            flex-col pl-2 sm:pl-4 lg:pl-8 xl:pl-15 pr-4
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
                menuItems={currentMenuItems}
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
                onSummaryChange={setOrderSummary}
                user={user}
                customerName={customerName}
                onCustomerNameChange={setCustomerName}
                customerContact={customerContact}
                onCustomerContactChange={setCustomerContact}
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
                  disabled={isCreatingOrder || !isOperational}
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
                  disabled={!isOperational}
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

        {/* Mobile: Floating button to open current cart */}
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

export default CustomerOrdering;