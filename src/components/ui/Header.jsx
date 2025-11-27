import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import { useAuthStore, useRestaurantStore } from '../../stores';
import { logoutApi } from '../../api/auth';

const Header = ({
  storeName = "POS Manager",
  isOperational = true,
  onToggleOperational,
  onToggleSidebar,
  userProfile = { name: "Admin", role: "owner" }
}) => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const selectedRestaurant = useRestaurantStore((state) => state.selectedRestaurant);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const location = useLocation();

  const posRoutes = ['/', '/main-pos-dashboard', '/payment-processing', '/order-history', '/menu-management', '/staff-management', '/table-management'];
  const isPOSPage = posRoutes.some(route => location.pathname.includes(route));
  const displayStoreName = selectedRestaurant?.restaurantName || storeName;
  const restaurantLogo = selectedRestaurant?.logo || '/assets/images/restaurant_logo.png';

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

      // Clear Zustand store
      logout(false); // Keep saved credentials

      // Navigate to auth page
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API fails, still logout locally
      logout(false);
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

  return (
    <header className="fixed top-0 left-0 right-0 h-14 sm:h-16 bg-surface border-b border-border z-1100">
      <div className="flex items-center justify-between h-full px-2 sm:px-4">
        {/* Left Section - Logo and Mobile Menu */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Mobile Sidebar Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="lg:hidden touch-target"
          >
            <Icon name="Menu" size={20} />
          </Button>

          {/* Logo and Store Name */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {isPOSPage && selectedRestaurant ? (
              <img
                src={restaurantLogo}
                alt={displayStoreName}
                className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="Store" size={20} color="white" />
              </div>
            )}
            <div className="hidden sm:block">
              <h1 className="text-base sm:text-lg font-semibold text-foreground truncate max-w-[120px] sm:max-w-[200px] lg:max-w-none">{displayStoreName}</h1>
            </div>
          </div>
        </div>

        {/* Center Section - Quick Actions */}
        {isPOSPage && (
          <div className="hidden md:flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              iconName="Search"
              iconPosition="left"
              className="hover-scale"
            >
              Tìm kiếm
            </Button>

            <Button
              variant="outline"
              size="sm"
              iconName="UserPlus"
              iconPosition="left"
              className="hover-scale"
            >
              Khách hàng
            </Button>

            <Button
              variant="default"
              size="sm"
              iconName="Receipt"
              iconPosition="left"
              className="hover-scale"
            >
              Tạo hóa đơn
            </Button>
          </div>
        )}

        {/* Right Section - Status, Notifications, User */}
        <div className="flex items-center space-x-1 sm:space-x-3">
          {/* Real-time Clock - Modern Design */}
          <div className="hidden xl:flex items-center space-x-3 px-4 py-2">
            <div className="flex items-center space-x-2">
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
          </div>

          {/* Operational Status Toggle */}
          {isPOSPage && (
            <div className="hidden lg:flex items-center space-x-2">
              <span className="text-sm text-muted-foreground hidden xl:inline">Trạng thái:</span>
              <Button
                variant={isOperational ? "success" : "secondary"}
                size="sm"
                onClick={onToggleOperational}
                iconName={isOperational ? "Play" : "Pause"}
                iconPosition="left"
                className="hover-scale"
              >
                <span className="hidden xl:inline">{isOperational ? "Mở cửa" : "Đóng cửa"}</span>
                <span className="xl:hidden">{isOperational ? "Mở" : "Đóng"}</span>
              </Button>
            </div>
          )}

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative hover-scale touch-target"
            >
              <Icon name="Bell" size={20} />
              {notifications?.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-error-foreground text-xs rounded-full flex items-center justify-center">
                  {notifications?.length}
                </span>
              )}
            </Button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 sm:right-0 top-full mt-2 w-[calc(100vw-1rem)] sm:w-80 max-w-sm bg-popover border border-border rounded-lg shadow-modal z-1150 -mr-2 sm:mr-0">
                <div className="p-4 border-b border-border">
                  <h3 className="font-medium text-popover-foreground">Thông báo</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
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

          {/* User Profile Menu or Restaurant Info */}
          <div className="relative">
            {isPOSPage ? (
              <div className="flex items-center space-x-2 px-3 py-2 bg-muted/50 rounded-md border border-border/50 hidden md:flex">
                <img
                  src={restaurantLogo}
                  alt={displayStoreName}
                  className="w-8 h-8 rounded-full object-cover border border-border/30"
                />
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">{displayStoreName}</p>
                  <p className="text-xs text-muted-foreground">POS</p>
                </div>
              </div>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 hover-scale"
                >
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Icon name="User" size={16} color="white" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-foreground">{userProfile?.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{userProfile?.role}</p>
                  </div>
                  <Icon name="ChevronDown" size={16} className="hidden md:block" />
                </Button>

                {/* User Menu Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-lg shadow-modal z-1150">
                    <div className="p-2">
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
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      {/* Mobile Quick Actions */}
      {isPOSPage && (
        <div className="md:hidden px-2 sm:px-4 py-2 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between gap-1 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              iconName="Search"
              className="flex-1 touch-target text-xs sm:text-sm"
            >
              <span className="hidden xs:inline">Tìm</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconName="UserPlus"
              className="flex-1 touch-target text-xs sm:text-sm"
            >
              <span className="hidden xs:inline">Khách</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              iconName="Receipt"
              className="flex-1 touch-target text-xs sm:text-sm"
            >
              <span className="hidden xs:inline">Hóa đơn</span>
            </Button>
            <Button
              variant={isOperational ? "success" : "secondary"}
              size="sm"
              iconName={isOperational ? "Play" : "Pause"}
              onClick={onToggleOperational}
              className="touch-target"
            >
              <span className="hidden sm:inline">{isOperational ? "Mở" : "Đóng"}</span>
            </Button>
          </div>
        </div>
      )}
      {/* Click outside handlers */}
      {(showUserMenu || showNotifications) && (
        <div
          className="fixed inset-0 z-1000"
          onClick={() => {
            setShowUserMenu(false);
            setShowNotifications(false);
          }}
        />
      )}
    </header>
  );
};

export default Header;