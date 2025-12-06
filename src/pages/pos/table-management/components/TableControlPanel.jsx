import React, { useState } from 'react';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';

const TableControlPanel = ({
  selectedTable,
  onTableUpdate,
  onAddTable,
  onDeleteTable,
  tables = []
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTableForm, setNewTableForm] = useState({
    number: '',
    capacity: 4,
    shape: 'rectangular',
    x: 100,
    y: 100
  });

  const shapeOptions = [
    { value: 'rectangular', label: 'Hình chữ nhật' },
    { value: 'circular', label: 'Hình tròn' }
  ];

  const availableServers = [
    { value: 'nguyen_van_a', label: 'Nguyễn Văn A' },
    { value: 'tran_thi_b', label: 'Trần Thị B' },
    { value: 'le_van_c', label: 'Lê Văn C' },
    { value: 'pham_thi_d', label: 'Phạm Thị D' }
  ];

  const handleAddTable = () => {
    if (newTableForm?.number) {
      try {
        onAddTable({
          ...newTableForm,
          status: 'available'
        });
        setNewTableForm({
          number: '',
          capacity: 4,
          shape: 'rectangular',
          x: 100,
          y: 100
        });
        setShowAddForm(false);
      } catch (error) {
        // Error is already handled by parent component with toast
        // Just keep the form open for user to fix
      }
    }
  };

  const handleStatusChange = (newStatus) => {
    if (selectedTable) {
      onTableUpdate(selectedTable?._id, { status: newStatus });
    }
  };

  const handleServerAssignment = (serverId) => {
    if (selectedTable) {
      const server = availableServers?.find(s => s?.value === serverId);
      onTableUpdate(selectedTable?._id, {
        assignedServer: server ? server?.label : null
      });
    }
  };

  const getStatusStats = () => {
    const stats = {
      total: tables?.length,
      available: tables?.filter(t => t?.status === 'available')?.length,
      occupied: tables?.filter(t => t?.status === 'occupied')?.length,
      reserved: tables?.filter(t => t?.status === 'reserved')?.length,
      cleaning: tables?.filter(t => t?.status === 'cleaning')?.length
    };
    return stats;
  };

  const stats = getStatusStats();

  return (
    <div className="w-80 bg-surface border-l border-border h-full flex flex-col relative">
      {/* Header */}
      <div className="p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Quản lý bàn</h2>
        </div>

        {/* Add New Table Button - Prominent */}
        <Button
          variant="default"
          size="sm"
          fullWidth
          iconName="Plus"
          iconPosition="left"
          onClick={() => setShowAddForm(true)}
          className="mb-3"
        >
          Thêm bàn mới
        </Button>
      </div>
      {/* Statistics */}
      <div className="p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-foreground">Thống kê</h3>
          <span className="text-xs text-muted-foreground">{stats?.total} bàn</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            <span className="text-sm font-semibold text-success">{stats?.available}</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-warning rounded-full"></div>
            <span className="text-sm font-semibold text-warning">{stats?.occupied}</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-error rounded-full"></div>
            <span className="text-sm font-semibold text-error">{stats?.reserved}</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span className="text-sm font-semibold text-primary">{stats?.cleaning}</span>
          </div>
        </div>
      </div>
      {/* Selected Table Info */}
      {selectedTable ? (
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-4 space-y-3">
            <h3 className="text-sm font-medium text-foreground">
              Bàn {selectedTable?.number}
            </h3>

            {/* Status Control */}
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Trạng thái</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={selectedTable?.status === 'available' ? 'success' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusChange('available')}
                >
                  Trống
                </Button>
                <Button
                  variant={selectedTable?.status === 'occupied' ? 'warning' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusChange('occupied')}
                >
                  Có khách
                </Button>
                <Button
                  variant={selectedTable?.status === 'reserved' ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusChange('reserved')}
                >
                  Đã đặt
                </Button>
                <Button
                  variant={selectedTable?.status === 'cleaning' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusChange('cleaning')}
                >
                  Dọn dẹp
                </Button>
              </div>
            </div>

            {/* Server Assignment */}
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Phân công nhân viên</label>
              <Select
                options={[
                  { value: '', label: 'Chưa phân công' },
                  ...availableServers
                ]}
                value={availableServers?.find(s => s?.label === selectedTable?.assignedServer)?.value || ''}
                onChange={handleServerAssignment}
                placeholder="Chọn nhân viên"
              />
            </div>

            {/* Table Actions */}
            <div className="space-y-2">
              <Button
                variant="destructive"
                size="sm"
                fullWidth
                iconName="Trash2"
                iconPosition="left"
                onClick={() => onDeleteTable(selectedTable?._id)}
                disabled={selectedTable?.status === 'occupied'}
              >
                Xóa bàn
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto min-h-0 flex items-center justify-center">
          <div className="text-center text-muted-foreground p-4">
            <Icon name="MousePointer" size={32} className="mx-auto mb-2" />
            <p className="text-sm">Chọn một bàn để xem chi tiết</p>
          </div>
        </div>
      )}

      {/* Add New Table Modal */}
      {showAddForm && (
        <div className="absolute inset-0 bg-surface z-50 flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between flex-shrink-0">
            <h3 className="text-lg font-semibold text-foreground">Thêm bàn mới</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAddForm(false)}
            >
              <Icon name="X" size={20} />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Số bàn</label>
              <Input
                type="text"
                placeholder="Ví dụ: 09"
                value={newTableForm?.number}
                onChange={(e) => setNewTableForm(prev => ({ ...prev, number: e?.target?.value }))}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Sức chứa (người)</label>
              <Input
                type="number"
                min="1"
                max="20"
                value={newTableForm?.capacity}
                onChange={(e) => setNewTableForm(prev => ({ ...prev, capacity: parseInt(e?.target?.value) || 1 }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Hình dạng</label>
              <Select
                options={shapeOptions}
                value={newTableForm?.shape}
                onChange={(value) => setNewTableForm(prev => ({ ...prev, shape: value }))}
              />
            </div>

            <div className="bg-muted/50 rounded-lg p-3 border border-border">
              <p className="text-xs text-muted-foreground">
                <Icon name="Info" size={14} className="inline mr-1" />
                Bàn mới sẽ được đặt ở vị trí mặc định. Bạn có thể kéo thả để điều chỉnh sau.
              </p>
            </div>
          </div>

          <div className="p-4 border-t border-border flex space-x-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={() => setShowAddForm(false)}
            >
              Hủy
            </Button>
            <Button
              variant="default"
              size="sm"
              fullWidth
              onClick={handleAddTable}
              disabled={!newTableForm?.number}
              iconName="Plus"
              iconPosition="left"
            >
              Thêm bàn
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableControlPanel;