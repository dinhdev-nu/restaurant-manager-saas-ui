import React from 'react';
import Icon from '../../../../components/AppIcon';
import Image from '../../../../components/AppImage';
import Button from '../../../../components/ui/Button';

const StaffCard = ({
  staff,
  onEdit,
  onToggleStatus,
  onViewDetails,
  onDelete
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-success';
      case 'on-break': return 'text-warning';
      case 'inactive': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'active': return 'bg-success/10';
      case 'on-break': return 'bg-warning/10';
      case 'inactive': return 'bg-error/10';
      default: return 'bg-muted/10';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'owner': return 'bg-primary text-primary-foreground';
      case 'manager': return 'bg-accent text-accent-foreground';
      case 'cashier': return 'bg-secondary text-secondary-foreground';
      case 'kitchen': return 'bg-success text-success-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-interactive transition-smooth">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-muted">
              <Image
                src={staff?.avatar}
                alt={staff?.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className={`
              absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-card
              ${staff?.status === 'active' ? 'bg-success' : staff?.status === 'on-break' ? 'bg-warning' : 'bg-error'}
            `} />
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-card-foreground text-lg">{staff?.name}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`
                px-2 py-1 rounded-full text-xs font-medium
                ${getRoleColor(staff?.role)}
              `}>
                {staff?.roleDisplay}
              </span>
              <span className={`
                px-2 py-1 rounded-full text-xs font-medium
                ${getStatusBg(staff?.status)} ${getStatusColor(staff?.status)}
              `}>
                {staff?.statusDisplay}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(staff)}
            className="hover-scale"
          >
            <Icon name="Edit" size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onViewDetails(staff)}
            className="hover-scale"
          >
            <Icon name="Eye" size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(staff)}
            className="hover-scale text-error hover:text-error"
          >
            <Icon name="Trash2" size={16} />
          </Button>
        </div>
      </div>
      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Icon name="Phone" size={14} />
          <span>{staff?.phone}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Icon name="Mail" size={14} />
          <span>{staff?.email}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Icon name="Calendar" size={14} />
          <span>Ca: {staff?.shift}</span>
        </div>
      </div>
      {/* Performance Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <p className="text-lg font-semibold text-card-foreground">{staff?.ordersToday}</p>
          <p className="text-xs text-muted-foreground">Đơn hôm nay</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-card-foreground">{staff?.hoursWorked}h</p>
          <p className="text-xs text-muted-foreground">Giờ làm việc</p>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onToggleStatus(staff)}
          className="flex-1 hover-scale"
          iconName={staff?.status === 'active' ? 'Pause' : 'Play'}
          iconPosition="left"
        >
          {staff?.status === 'active' ? 'Tạm nghỉ' : 'Kích hoạt'}
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={() => onEdit(staff)}
          className="flex-1 hover-scale"
          iconName="Settings"
          iconPosition="left"
        >
          Chỉnh sửa
        </Button>
      </div>
    </div>
  );
};

export default StaffCard;