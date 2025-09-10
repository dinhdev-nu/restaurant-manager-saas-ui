import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const BulkActionsBar = ({ 
  selectedCount, 
  onClearSelection, 
  onBulkAction,
  onBulkRoleChange,
  onBulkStatusChange 
}) => {
  const roleOptions = [
    { value: 'owner', label: 'Chủ cửa hàng' },
    { value: 'manager', label: 'Quản lý' },
    { value: 'cashier', label: 'Thu ngân' },
    { value: 'kitchen', label: 'Nhân viên bếp' },
    { value: 'waiter', label: 'Phục vụ' },
    { value: 'cleaner', label: 'Vệ sinh' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Kích hoạt' },
    { value: 'inactive', label: 'Vô hiệu hóa' },
    { value: 'on-break', label: 'Tạm nghỉ' }
  ];

  if (selectedCount === 0) return null;

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <Icon name="Check" size={14} color="white" />
            </div>
            <span className="font-medium text-primary">
              Đã chọn {selectedCount} nhân viên
            </span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            iconName="X"
            iconPosition="left"
            className="text-primary hover:text-primary"
          >
            Bỏ chọn
          </Button>
        </div>

        <div className="flex items-center space-x-3">
          {/* Role Change */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-primary">Đổi vai trò:</span>
            <Select
              placeholder="Chọn vai trò"
              options={roleOptions}
              value=""
              onChange={onBulkRoleChange}
              className="w-40"
            />
          </div>

          {/* Status Change */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-primary">Đổi trạng thái:</span>
            <Select
              placeholder="Chọn trạng thái"
              options={statusOptions}
              value=""
              onChange={onBulkStatusChange}
              className="w-40"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 border-l border-primary/20 pl-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onBulkAction('export')}
              iconName="Download"
              iconPosition="left"
              className="border-primary/20 text-primary hover:bg-primary/10"
            >
              Xuất Excel
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onBulkAction('message')}
              iconName="MessageSquare"
              iconPosition="left"
              className="border-primary/20 text-primary hover:bg-primary/10"
            >
              Gửi tin nhắn
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onBulkAction('delete')}
              iconName="Trash2"
              iconPosition="left"
              className="border-error/20 text-error hover:bg-error/10"
            >
              Xóa
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkActionsBar;