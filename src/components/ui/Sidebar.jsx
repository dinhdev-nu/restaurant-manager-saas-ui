import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Sidebar = ({
  isCollapsed = false,
  onToggleCollapse,
  userRole = "owner",
  className = ""
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    {
      label: "Bán hàng",
      path: "/main-pos-dashboard",
      icon: "CashRegister",
      roles: ["staff", "manager", "owner"],
      description: "Giao diện bán hàng chính"
    },
    {
      label: "Bàn ăn",
      path: "/table-management",
      icon: "Table",
      roles: ["staff", "manager", "owner"],
      description: "Quản lý bàn ăn"
    },
    {
      label: "Thanh toán",
      path: "/payment-processing",
      icon: "CreditCard",
      roles: ["staff", "manager", "owner"],
      description: "Xử lý thanh toán"
    },
    {
      label: "Lịch sử",
      path: "/order-history",
      icon: "History",
      roles: ["manager", "owner"],
      description: "Lịch sử đơn hàng"
    },
    {
      label: "Thực đơn",
      path: "/menu-management",
      icon: "Utensils",
      roles: ["manager", "owner"],
      description: "Quản lý thực đơn"
    },
    {
      label: "Nhân viên",
      path: "/staff-management",
      icon: "Users",
      roles: ["owner"],
      description: "Quản lý nhân viên"
    }
  ];

  const filteredNavItems = navigationItems?.filter(item =>
    item?.roles?.includes(userRole)
  );

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isActive = (path) => {
    return location?.pathname === path;
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`
        fixed left-0 top-14 sm:top-16 h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] bg-surface border-r border-border z-1000
        transition-all duration-300 ease-smooth hidden lg:block
        ${isCollapsed ? 'w-16' : 'w-60'}
        ${className}
      `}>
        <div className="flex flex-col h-full">
          {/* Collapse Toggle */}
          <div className="p-4 border-b border-border">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="w-full hover-scale"
            >
              <Icon
                name={isCollapsed ? "ChevronRight" : "ChevronLeft"}
                size={20}
              />
            </Button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-4 space-y-2">
            {filteredNavItems?.map((item) => {
              const active = isActive(item?.path);

              return (
                <Button
                  key={item?.path}
                  variant={active ? "default" : "ghost"}
                  onClick={() => handleNavigation(item?.path)}
                  className={`
                    w-full justify-start touch-target hover-scale transition-smooth
                    ${isCollapsed ? 'px-2' : 'px-4'}
                    ${active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}
                  `}
                >
                  <Icon
                    name={item?.icon}
                    size={20}
                    className={`
                      ${isCollapsed ? 'mx-auto' : 'mr-3'}
                      ${active ? 'text-primary-foreground' : 'text-muted-foreground'}
                    `}
                  />
                  {!isCollapsed && (
                    <div className="flex-1 text-left">
                      <span className={`
                        text-sm font-medium
                        ${active ? 'text-primary-foreground' : 'text-foreground'}
                      `}>
                        {item?.label}
                      </span>
                      <p className={`
                        text-xs mt-0.5
                        ${active ? 'text-primary-foreground/80' : 'text-muted-foreground'}
                      `}>
                        {item?.description}
                      </p>
                    </div>
                  )}
                </Button>
              );
            })}
          </nav>

          {/* Footer Section */}
          {!isCollapsed && (
            <div className="p-4 border-t border-border">
              <div className="action-cluster">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-2 h-2 bg-success rounded-full status-pulse"></div>
                  <span className="text-sm text-muted-foreground">Hệ thống hoạt động</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  <p>Phiên bản: 2.1.0</p>
                  <p>Cập nhật: 02/09/2025</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
      {/* Mobile Sidebar Overlay */}
      <div className={`
        lg:hidden fixed inset-0 z-1050 transition-opacity duration-300
        ${isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}
      `}>
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onToggleCollapse}
        />

        {/* Mobile Sidebar */}
        <aside className={`
          absolute left-0 top-0 h-full w-[280px] max-w-[85vw] bg-surface border-r border-border
          transform transition-transform duration-300 ease-smooth shadow-2xl
          ${isCollapsed ? '-translate-x-full' : 'translate-x-0'}
        `}>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between safe-area-top">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="Store" size={20} color="white" />
                </div>
                <h2 className="font-semibold text-foreground truncate">POS Manager</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleCollapse}
                className="touch-target flex-shrink-0"
              >
                <Icon name="X" size={20} />
              </Button>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 p-4 space-y-2">
              {filteredNavItems?.map((item) => {
                const active = isActive(item?.path);

                return (
                  <Button
                    key={item?.path}
                    variant={active ? "default" : "ghost"}
                    onClick={() => {
                      handleNavigation(item?.path);
                      onToggleCollapse();
                    }}
                    className={`
                      w-full justify-start touch-target hover-scale transition-smooth px-4
                      ${active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}
                    `}
                  >
                    <Icon
                      name={item?.icon}
                      size={20}
                      className={`
                        mr-3
                        ${active ? 'text-primary-foreground' : 'text-muted-foreground'}
                      `}
                    />
                    <div className="flex-1 text-left">
                      <span className={`
                        text-sm font-medium
                        ${active ? 'text-primary-foreground' : 'text-foreground'}
                      `}>
                        {item?.label}
                      </span>
                      <p className={`
                        text-xs mt-0.5
                        ${active ? 'text-primary-foreground/80' : 'text-muted-foreground'}
                      `}>
                        {item?.description}
                      </p>
                    </div>
                  </Button>
                );
              })}
            </nav>

            {/* Mobile Footer */}
            <div className="p-4 border-t border-border safe-area-bottom">
              <div className="action-cluster">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-2 h-2 bg-success rounded-full status-pulse"></div>
                  <span className="text-sm text-muted-foreground">Hệ thống hoạt động</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  <p>Phiên bản: 2.1.0</p>
                  <p>Cập nhật: 02/09/2025</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
};

export default Sidebar;