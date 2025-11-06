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
  onMergeTable,
  onTransferTable,
  tables = []
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTableForm, setNewTableForm] = useState({
    number: '',
    capacity: 4,
    shape: 'rectangular',
    x: 100,
    y: 100
  });

  const statusOptions = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'available', label: 'Trống' },
    { value: 'occupied', label: 'Có khách' },
    { value: 'reserved', label: 'Đã đặt' },
    { value: 'cleaning', label: 'Dọn dẹp' }
  ];

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
      onAddTable({
        ...newTableForm,
        id: `table_${Date.now()}`,
        status: 'available',
        currentOccupancy: 0,
        assignedServer: null,
        orderId: null
      });
      setNewTableForm({
        number: '',
        capacity: 4,
        shape: 'rectangular',
        x: 100,
        y: 100
      });
      setShowAddForm(false);
    }
  };

  const handleStatusChange = (newStatus) => {
    if (selectedTable) {
      onTableUpdate(selectedTable?.id, { status: newStatus });
    }
  };

  const handleServerAssignment = (serverId) => {
    if (selectedTable) {
      const server = availableServers?.find(s => s?.value === serverId);
      onTableUpdate(selectedTable?.id, {
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
    <div className="w-80 bg-surface border-l border-border h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">Quản lý bàn</h2>

        {/* Search and Filter */}
        <div className="space-y-3">
          <Input
            type="search"
            placeholder="Tìm kiếm bàn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
            className="w-full"
          />

          <Select
            options={statusOptions}
            value={filterStatus}
            onChange={setFilterStatus}
            placeholder="Lọc theo trạng thái"
          />
        </div>
      </div>
      {/* Statistics */}
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-medium text-foreground mb-3">Thống kê</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-foreground">{stats?.total}</div>
            <div className="text-xs text-muted-foreground">Tổng bàn</div>
          </div>
          <div className="bg-success/10 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-success">{stats?.available}</div>
            <div className="text-xs text-muted-foreground">Trống</div>
          </div>
          <div className="bg-warning/10 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-warning">{stats?.occupied}</div>
            <div className="text-xs text-muted-foreground">Có khách</div>
          </div>
          <div className="bg-error/10 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-error">{stats?.reserved}</div>
            <div className="text-xs text-muted-foreground">Đã đặt</div>
          </div>
        </div>
      </div>
      {/* Selected Table Info */}
      {selectedTable ? (
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-medium text-foreground mb-3">
            Bàn {selectedTable?.number}
          </h3>

          <div className="space-y-3">
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
                variant="outline"
                size="sm"
                fullWidth
                iconName="Users"
                iconPosition="left"
                onClick={() => onMergeTable(selectedTable?.id)}
                disabled={selectedTable?.status !== 'occupied'}
              >
                Ghép bàn
              </Button>

              <Button
                variant="outline"
                size="sm"
                fullWidth
                iconName="ArrowRightLeft"
                iconPosition="left"
                onClick={() => onTransferTable(selectedTable?.id)}
                disabled={selectedTable?.status !== 'occupied'}
              >
                Chuyển bàn
              </Button>

              <Button
                variant="destructive"
                size="sm"
                fullWidth
                iconName="Trash2"
                iconPosition="left"
                onClick={() => onDeleteTable(selectedTable?.id)}
                disabled={selectedTable?.status === 'occupied'}
              >
                Xóa bàn
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 border-b border-border">
          <div className="text-center text-muted-foreground">
            <Icon name="MousePointer" size={32} className="mx-auto mb-2" />
            <p className="text-sm">Chọn một bàn để xem chi tiết</p>
          </div>
        </div>
      )}
      {/* Add New Table */}
      <div className="p-4 flex-1">
        <Button
          variant="default"
          size="sm"
          fullWidth
          iconName="Plus"
          iconPosition="left"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          Thêm bàn mới
        </Button>

        {showAddForm && (
          <div className="mt-4 space-y-3">
            <Input
              label="Số bàn"
              type="text"
              placeholder="Nhập số bàn"
              value={newTableForm?.number}
              onChange={(e) => setNewTableForm(prev => ({ ...prev, number: e?.target?.value }))}
              required
            />

            <Input
              label="Sức chứa"
              type="number"
              min="1"
              max="20"
              value={newTableForm?.capacity}
              onChange={(e) => setNewTableForm(prev => ({ ...prev, capacity: parseInt(e?.target?.value) }))}
            />

            <Select
              label="Hình dạng"
              options={shapeOptions}
              value={newTableForm?.shape}
              onChange={(value) => setNewTableForm(prev => ({ ...prev, shape: value }))}
            />

            <div className="flex space-x-2">
              <Button
                variant="default"
                size="sm"
                onClick={handleAddTable}
                disabled={!newTableForm?.number}
              >
                Thêm
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddForm(false)}
              >
                Hủy
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableControlPanel;