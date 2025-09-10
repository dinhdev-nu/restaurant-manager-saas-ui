import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const MenuItemCard = ({ 
  item, 
  onEdit, 
  onDelete, 
  onToggleAvailability,
  isSelected,
  onSelect 
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'text-success';
      case 'low_stock': return 'text-warning';
      case 'unavailable': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available': return 'CheckCircle';
      case 'low_stock': return 'AlertTriangle';
      case 'unavailable': return 'XCircle';
      default: return 'Circle';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available': return 'Có sẵn';
      case 'low_stock': return 'Sắp hết';
      case 'unavailable': return 'Hết hàng';
      default: return 'Không xác định';
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    })?.format(price);
  };

  return (
    <div className={`
      bg-card border border-border rounded-lg p-4 hover:shadow-interactive transition-smooth
      ${isSelected ? 'ring-2 ring-primary' : ''}
    `}>
      {/* Header with checkbox and actions */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(item?.id, e?.target?.checked)}
            className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
          />
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
            <Image
              src={item?.image}
              alt={item?.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(item)}
            className="w-8 h-8"
          >
            <Icon name="Edit" size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(item?.id)}
            className="w-8 h-8 text-error hover:text-error"
          >
            <Icon name="Trash2" size={16} />
          </Button>
        </div>
      </div>
      {/* Item details */}
      <div className="space-y-2">
        <div>
          <h3 className="font-medium text-foreground text-sm">{item?.name}</h3>
          <p className="text-xs text-muted-foreground">{item?.category}</p>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-semibold text-primary text-sm">
            {formatPrice(item?.price)}
          </span>
          <div className={`flex items-center space-x-1 ${getStatusColor(item?.status)}`}>
            <Icon name={getStatusIcon(item?.status)} size={12} />
            <span className="text-xs">{getStatusText(item?.status)}</span>
          </div>
        </div>

        {item?.stock_quantity !== undefined && (
          <div className="text-xs text-muted-foreground">
            Tồn kho: {item?.stock_quantity} {item?.unit || 'phần'}
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Cập nhật: {new Date(item.updated_at)?.toLocaleDateString('vi-VN')}
        </div>

        {/* Quick availability toggle */}
        <div className="pt-2 border-t border-border">
          <Button
            variant={item?.status === 'available' ? 'outline' : 'default'}
            size="sm"
            fullWidth
            onClick={() => onToggleAvailability(item?.id, item?.status)}
            iconName={item?.status === 'available' ? 'EyeOff' : 'Eye'}
            iconPosition="left"
          >
            {item?.status === 'available' ? 'Tạm ngưng' : 'Kích hoạt'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;