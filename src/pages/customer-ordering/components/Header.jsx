import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import OrdersDropdown from './OrdersDropdown';
import { useAuthStore, useRestaurantStore } from '../../../stores';
import { useCustomerOrderStore } from '../../../stores/customer-order.store';
import { logoutApi } from '../../../api/auth';

const Header = ({
  isOperational = true,
  onToggleOperational,
  ordersCount = 0,
  user = null
}) => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const selectedRestaurant = useRestaurantStore((state) => state.selectedRestaurant);
  const customerOrders = useCustomerOrderStore((state) => state.customerOrders);
  const getCustomerOrdersByUser = useCustomerOrderStore((state) => state.getCustomerOrdersByUser);

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const displayStoreName = selectedRestaurant?.restaurantName;
  const restaurantLogo = selectedRestaurant?.logo || '/assets/images/restaurant_logo.png';

  // User info with fallback - Map API data correctly
  const isGuest = !user;
  const userAvatar = user?.avatar || '/assets/images/user_avatar.jpg';
  const userName = user?.user_name || 'Khách lạ';

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const notifications = [
    { id: 1, type: 'warning', message: 'Món gà rán sắp hết hàng', time: '5 phút trước' },
    { id: 2, type: 'success', message: 'Đơn hàng #1234 đã thanh toán', time: '10 phút trước' },
    { id: 3, type: 'info', message: 'Ca làm việc mới bắt đầu', time: '15 phút trước' }
  ];

  const handleLogout = async () => {
    try {
      // Call API logout
      await logoutApi();

      // Clear all localStorage and Zustand store
      logout();

      // Navigate to auth page
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API fails, still logout locally
      logout();
      navigate('/auth');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'warning': return 'AlertTriangle';
      case 'success': return 'CheckCircle';
      case 'error': return 'XCircle';
      default: return 'Info';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'warning': return 'text-warning';
      case 'success': return 'text-success';
      case 'error': return 'text-error';
      default: return 'text-primary';
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const dayName = days[date.getDay()];
    return `${dayName}, ${date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })}`;
  };

  // Get user's orders
  const userOrders = user ? getCustomerOrdersByUser(user._id) : customerOrders;

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-sm border-b border-border z-[1100]">
      <div className="flex items-center justify-between h-full px-2 sm:px-4 lg:px-8 xl:px-16 max-w-[1920px] mx-auto">
        {/* Left Section - Logo and Store Name */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Logo and Store Name */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <img
              src={restaurantLogo}
              alt={displayStoreName}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover border border-border/30 flex-shrink-0"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/assets/images/restaurant_logo.png';
              }}
            />

            <div>
              <h1 className="text-sm sm:text-base lg:text-lg font-semibold text-foreground truncate max-w-[100px] sm:max-w-[200px] lg:max-w-none">{displayStoreName}</h1>
            </div>
          </div>
        </div>

        {/* Right Section - Status, Notifications, User */}
        <div className="flex items-center space-x-1 sm:space-x-3">

          {/* Center Section - Real-time Clock */}
          <div className="hidden md:flex items-center space-x-2">
            <Icon name="Clock" size={16} className="text-primary" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground font-mono tracking-wider">
                {formatTime(currentTime)}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDate(currentTime)}
              </span>
            </div>
          </div>

          {/* Operational Status Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground hidden xl:inline">Trạng thái:</span>
            <Button
              variant={isOperational ? "success" : "secondary"}
              size="sm"
              onClick={onToggleOperational}
              iconName={isOperational ? "Play" : "Pause"}
              iconPosition="left"
              className="hover-scale"
            >
              <span className="hidden sm:inline">{isOperational ? "Mở cửa" : "Đóng cửa"}</span>
              <span className="sm:hidden">{isOperational ? "Mở" : "Đóng"}</span>
            </Button>
          </div>

          {/* Cart Icon with Orders Dropdown */}
          {/* Hiển thị danh sách orders đã tạo (cả desktop và mobile) */}
          <div className="relative">
            <button
              onClick={() => setShowOrders(!showOrders)}
              className="relative w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
            >
              <Icon name="Receipt" size={20} />
              {ordersCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-white text-xs font-semibold flex items-center justify-center">
                  {ordersCount > 99 ? '99+' : ordersCount}
                </span>
              )}
            </button>

            {/* Orders History Dropdown */}
            {showOrders && (
              <OrdersDropdown orders={userOrders} user={user} />
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
            >
              <Icon name="Bell" size={20} />
              {notifications?.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full animate-pulse"
                  style={{ background: 'var(--accent)' }} />
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 top-20 sm:top-full sm:mt-2 w-auto sm:w-80 bg-popover border border-border rounded-lg shadow-modal z-1150">
                <div className="p-4 border-b border-border">
                  <h3 className="font-medium text-popover-foreground">Thông báo</h3>
                </div>
                <div className="max-h-[60vh] sm:max-h-64 overflow-y-auto">
                  {notifications?.map((notification) => (
                    <div key={notification?.id} className="p-4 border-b border-border last:border-b-0 hover:bg-muted/50 transition-smooth">
                      <div className="flex items-start space-x-3">
                        <Icon
                          name={getNotificationIcon(notification?.type)}
                          size={16}
                          className={getNotificationColor(notification?.type)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-popover-foreground">{notification?.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{notification?.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-border">
                  <Button variant="ghost" size="sm" fullWidth>
                    Xem tất cả thông báo
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 hover-scale"
            >
              {userAvatar ? (
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-border/50">
                  <img
                    src={userAvatar}
                    alt={userName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      // If image fails, replace with icon fallback
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div class="w-full h-full bg-primary flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>';
                    }}
                  />
                </div>
              ) : (
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Icon name="User" size={16} color="white" />
                </div>
              )}
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-foreground">{userName}</p>
                <p className="text-xs text-muted-foreground">
                  {isGuest ? 'Chưa đăng nhập' : 'Người dùng'}
                </p>
              </div>
            </Button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 top-20 sm:top-full sm:mt-2 w-auto sm:w-48 bg-popover border border-border rounded-lg shadow-modal z-1150">
                <div className="p-2">
                  {isGuest ? (
                    // Guest Menu
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        fullWidth
                        iconName="LogIn"
                        iconPosition="left"
                        className="justify-start"
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate('/auth?mode=login');
                        }}
                      >
                        Đăng nhập
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        fullWidth
                        iconName="UserPlus"
                        iconPosition="left"
                        className="justify-start"
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate('/auth?mode=signup');
                        }}
                      >
                        Đăng ký
                      </Button>
                    </>
                  ) : (
                    // Authenticated User Menu
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        fullWidth
                        iconName="User"
                        iconPosition="left"
                        className="justify-start"
                      >
                        Hồ sơ cá nhân
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        fullWidth
                        iconName="Settings"
                        iconPosition="left"
                        className="justify-start"
                      >
                        Cài đặt
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        fullWidth
                        iconName="HelpCircle"
                        iconPosition="left"
                        className="justify-start"
                      >
                        Trợ giúp
                      </Button>
                      <div className="border-t border-border my-1"></div>
                      <Button
                        variant="ghost"
                        size="sm"
                        fullWidth
                        iconName="LogOut"
                        iconPosition="left"
                        className="justify-start text-error hover:text-error"
                        onClick={handleLogout}
                      >
                        Đăng xuất
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Click outside handlers */}
      {(showUserMenu || showNotifications || showOrders) && (
        <div
          className="fixed inset-0 z-1000"
          onClick={() => {
            setShowUserMenu(false);
            setShowNotifications(false);
            setShowOrders(false);
          }}
        />
      )}
    </header>
  );
};

export default Header;