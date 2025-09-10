import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const TableMergeModal = ({ 
  isOpen, 
  onClose, 
  sourceTable, 
  availableTables, 
  onConfirmMerge 
}) => {
  const [selectedTables, setSelectedTables] = useState([]);
  const [mergeType, setMergeType] = useState('combine'); // 'combine' or 'transfer'

  if (!isOpen || !sourceTable) return null;

  const tableOptions = availableTables?.filter(table => table?.id !== sourceTable?.id && table?.status === 'available')?.map(table => ({
      value: table?.id,
      label: `Bàn ${table?.number} (${table?.capacity} chỗ)`,
      description: `Trạng thái: ${table?.status === 'available' ? 'Trống' : 'Có khách'}`
    }));

  const mergeTypeOptions = [
    { value: 'combine', label: 'Ghép bàn', description: 'Kết hợp khách từ nhiều bàn' },
    { value: 'transfer', label: 'Chuyển bàn', description: 'Di chuyển khách sang bàn khác' }
  ];

  const handleConfirm = () => {
    if (selectedTables?.length > 0) {
      onConfirmMerge({
        sourceTableId: sourceTable?.id,
        targetTableIds: selectedTables,
        type: mergeType
      });
      onClose();
      setSelectedTables([]);
      setMergeType('combine');
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedTables([]);
    setMergeType('combine');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1200">
      <div className="bg-surface rounded-lg border border-border w-full max-w-md mx-4 shadow-modal">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            {mergeType === 'combine' ? 'Ghép bàn' : 'Chuyển bàn'}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Source Table Info */}
          <div className="bg-muted rounded-lg p-4">
            <h3 className="font-medium text-foreground mb-2">Bàn nguồn</h3>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-warning text-warning-foreground rounded-lg flex items-center justify-center">
                <span className="font-bold">{sourceTable?.number}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Bàn {sourceTable?.number}
                </p>
                <p className="text-xs text-muted-foreground">
                  {sourceTable?.currentOccupancy}/{sourceTable?.capacity} khách
                </p>
                {sourceTable?.orderId && (
                  <p className="text-xs text-primary">
                    Đơn hàng: #{sourceTable?.orderId}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Merge Type Selection */}
          <div>
            <Select
              label="Loại thao tác"
              options={mergeTypeOptions}
              value={mergeType}
              onChange={setMergeType}
              description={mergeType === 'combine' ?'Khách từ các bàn sẽ được gộp lại' :'Khách sẽ được chuyển sang bàn mới'
              }
            />
          </div>

          {/* Target Tables Selection */}
          <div>
            <Select
              label={mergeType === 'combine' ? 'Chọn bàn để ghép' : 'Chọn bàn đích'}
              options={tableOptions}
              value={selectedTables}
              onChange={setSelectedTables}
              multiple={mergeType === 'combine'}
              searchable
              placeholder={tableOptions?.length > 0 ? 'Chọn bàn...' : 'Không có bàn trống'}
              description={`${tableOptions?.length} bàn trống có thể sử dụng`}
            />
          </div>

          {/* Preview */}
          {selectedTables?.length > 0 && (
            <div className="bg-success/10 rounded-lg p-4">
              <h4 className="font-medium text-foreground mb-2">Xem trước</h4>
              <div className="text-sm text-muted-foreground">
                {mergeType === 'combine' ? (
                  <p>
                    Ghép bàn {sourceTable?.number} với {selectedTables?.length} bàn khác.
                    Tổng sức chứa sẽ được tính lại.
                  </p>
                ) : (
                  <p>
                    Chuyển khách từ bàn {sourceTable?.number} sang bàn đã chọn.
                    Bàn {sourceTable?.number} sẽ trở thành trống.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
          <Button
            variant="outline"
            onClick={handleClose}
          >
            Hủy
          </Button>
          <Button
            variant="default"
            onClick={handleConfirm}
            disabled={selectedTables?.length === 0}
            iconName={mergeType === 'combine' ? 'Merge' : 'ArrowRightLeft'}
            iconPosition="left"
          >
            {mergeType === 'combine' ? 'Ghép bàn' : 'Chuyển bàn'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TableMergeModal;