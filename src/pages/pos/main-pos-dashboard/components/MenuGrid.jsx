import React from 'react';
import Image from '../../../../components/AppImage';
import Button from '../../../../components/ui/Button';


const MenuGrid = ({
  menuItems,
  onAddToCart
}) => {
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

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {menuItems?.map((item) => (
        <div
          key={item?.id}
          className={`
            bg-card border border-border rounded-lg overflow-hidden hover-scale transition-smooth
            ${item?.stock === 0 ? 'opacity-60' : ''}
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
              ${getStockStatusColor(item?.stock)}
            `}>
              {getStockStatusText(item?.stock)}
            </div>
          </div>

          <div className="p-3">
            <h3 className="font-medium text-card-foreground text-sm mb-1 line-clamp-2">
              {item?.name}
            </h3>
            <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
              {item?.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-primary">
                {formatPrice(item?.price)}
              </span>
              <Button
                variant="default"
                size="sm"
                iconName="Plus"
                iconPosition="left"
                onClick={() => onAddToCart(item)}
                disabled={item?.stock === 0}
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