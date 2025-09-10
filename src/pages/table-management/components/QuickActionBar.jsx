import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickActionBar = ({ 
  selectedTable, 
  onQuickStatusChange, 
  onCreateOrder, 
  onViewOrder,
  onPrintBill,
  onCallWaiter 
}) => {
  if (!selectedTable) {
    return (
      <div className="h-16 bg-surface border-t border-border flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Chọn một bàn để hiển thị thao tác nhanh</p>
      </div>
    );
  }

  const getQuickActions = () => {
    const actions = [];

    switch (selectedTable?.status) {
      case 'available':
        actions?.push(
          {
            label: 'Đặt khách',
            icon: 'UserPlus',
            variant: 'default',
            action: () => onQuickStatusChange(selectedTable?.id, 'occupied')
          },
          {
            label: 'Đặt trước',
            icon: 'Clock',
            variant: 'outline',
            action: () => onQuickStatusChange(selectedTable?.id, 'reserved')
          }
        );
        break;

      case 'occupied':
        actions?.push(
          {
            label: 'Tạo đơn',
            icon: 'Plus',
            variant: 'default',
            action: () => onCreateOrder(selectedTable?.id)
          },
          {
            label: 'Xem đơn',
            icon: 'Eye',
            variant: 'outline',
            action: () => onViewOrder(selectedTable?.orderId),
            disabled: !selectedTable?.orderId
          },
          {
            label: 'In hóa đơn',
            icon: 'Printer',
            variant: 'outline',
            action: () => onPrintBill(selectedTable?.id),
            disabled: !selectedTable?.orderId
          },
          {
            label: 'Gọi phục vụ',
            icon: 'Bell',
            variant: 'outline',
            action: () => onCallWaiter(selectedTable?.id)
          }
        );
        break;

      case 'reserved':
        actions?.push(
          {
            label: 'Nhận khách',
            icon: 'Check',
            variant: 'default',
            action: () => onQuickStatusChange(selectedTable?.id, 'occupied')
          },
          {
            label: 'Hủy đặt',
            icon: 'X',
            variant: 'outline',
            action: () => onQuickStatusChange(selectedTable?.id, 'available')
          }
        );
        break;

      case 'cleaning':
        actions?.push(
          {
            label: 'Hoàn thành',
            icon: 'CheckCircle',
            variant: 'success',
            action: () => onQuickStatusChange(selectedTable?.id, 'available')
          }
        );
        break;

      default:
        break;
    }

    return actions;
  };

  const actions = getQuickActions();

  return (
    <div className="h-16 bg-surface border-t border-border flex items-center px-4">
      <div className="flex items-center space-x-4 flex-1">
        {/* Selected Table Info */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
            <span className="font-bold text-sm">{selectedTable?.number}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              Bàn {selectedTable?.number}
            </p>
            <p className="text-xs text-muted-foreground">
              {selectedTable?.currentOccupancy}/{selectedTable?.capacity} khách
              {selectedTable?.assignedServer && ` • ${selectedTable?.assignedServer}`}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`
          px-3 py-1 rounded-full text-xs font-medium
          ${selectedTable?.status === 'available' ? 'bg-success/10 text-success' : ''}
          ${selectedTable?.status === 'occupied' ? 'bg-warning/10 text-warning' : ''}
          ${selectedTable?.status === 'reserved' ? 'bg-error/10 text-error' : ''}
          ${selectedTable?.status === 'cleaning' ? 'bg-primary/10 text-primary' : ''}
        `}>
          {selectedTable?.status === 'available' && 'Trống'}
          {selectedTable?.status === 'occupied' && 'Có khách'}
          {selectedTable?.status === 'reserved' && 'Đã đặt'}
          {selectedTable?.status === 'cleaning' && 'Dọn dẹp'}
        </div>
      </div>
      {/* Quick Actions */}
      <div className="flex items-center space-x-2">
        {actions?.map((action, index) => (
          <Button
            key={index}
            variant={action?.variant}
            size="sm"
            iconName={action?.icon}
            iconPosition="left"
            onClick={action?.action}
            disabled={action?.disabled}
            className="hover-scale"
          >
            {action?.label}
          </Button>
        ))}

        {/* More Actions Menu */}
        <Button
          variant="ghost"
          size="icon"
          className="hover-scale"
        >
          <Icon name="MoreHorizontal" size={16} />
        </Button>
      </div>
    </div>
  );
};

export default QuickActionBar;