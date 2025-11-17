import React from 'react';
import { useNavigate } from 'react-router-dom';
import Image from '../../../../components/AppImage';
import Button from '../../../../components/ui/Button';
import Icon from '../../../../components/AppIcon';


const MenuGrid = ({
  menuItems,
  onAddToCart
}) => {
  const navigate = useNavigate();
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    })?.format(price);
  };

  const getStockStatusColor = (stock) => {
    if (stock === 0) return 'bg-error text-error-foreground';
    if (stock <= 5) return 'bg-warning text-warning-foreground';
    return 'bg-success text-success-foreground';
  };

  const getStockStatusText = (stock) => {
    if (stock === 0) return 'Hết hàng';
    if (stock <= 5) return 'Sắp hết';
    return 'Còn hàng';
  };

  const handleAddNewItem = () => {
    navigate('/menu-management');
  };

  const handleReload = () => {
    window.location.reload();
  };

  // Empty state
  if (!menuItems || menuItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-32 h-32 bg-muted/30 rounded-full flex items-center justify-center mb-6">
          <Icon name="UtensilsCrossed" size={64} className="text-muted-foreground opacity-50" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Không có món nào
        </h3>
        <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
          Danh mục này hiện chưa có món ăn. Vui lòng chọn danh mục khác hoặc thêm món mới.
        </p>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            iconName="Plus"
            iconPosition="left"
            onClick={handleAddNewItem}
          >
            Thêm món mới
          </Button>
          <Button
            variant="default"
            iconName="RefreshCw"
            iconPosition="left"
            onClick={handleReload}
          >
            Tải lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {menuItems?.map((item) => (
        <div
          key={item?.id}
          className={`
            bg-card border border-border rounded-lg overflow-hidden hover-scale transition-smooth
            ${item?.stock_quantity === 0 || item?.status === 'unavailable' ? 'opacity-60' : ''}
          `}
        >
          <div className="relative">
            <div className="w-full h-32 overflow-hidden">
              <Image
                src={item?.image}
                alt={item?.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className={`
              absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium
              ${getStockStatusColor(item?.stock_quantity || 0)}
            `}>
              {getStockStatusText(item?.stock_quantity || 0)}
            </div>
          </div>

          <div className="p-3 flex flex-col">
            <h3 className="font-medium text-card-foreground text-sm mb-1 line-clamp-2">
              {item?.name}
            </h3>
            <div className="h-5 mb-2">
              {item?.description && (
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {item?.description}
                </p>
              )}
            </div>
            <div className="flex items-center justify-between mt-auto">
              <span className="font-semibold text-primary">
                {formatPrice(item?.price)}
              </span>
              <Button
                variant="default"
                size="sm"
                iconName="Plus"
                iconPosition="left"
                onClick={() => onAddToCart(item)}
                disabled={item?.stock_quantity === 0 || item?.status === 'unavailable'}
                className="hover-scale"
              >
                Thêm
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MenuGrid;