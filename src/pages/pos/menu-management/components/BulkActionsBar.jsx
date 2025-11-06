import React from 'react';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';

const BulkActionsBar = ({
  selectedCount,
  onClearSelection,
  onBulkDelete,
  onBulkToggleAvailability,
  onBulkUpdateCategory,
  categories = []
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-1100">
      <div className="bg-surface border border-border rounded-lg shadow-modal px-6 py-4">
        <div className="flex items-center space-x-4">
          {/* Selection info */}
          <div className="flex items-center space-x-2">
            <Icon name="CheckSquare" size={20} className="text-primary" />
            <span className="text-sm font-medium text-foreground">
              Đã chọn {selectedCount} món
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkToggleAvailability}
              iconName="Eye"
              iconPosition="left"
            >
              Thay đổi trạng thái
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onBulkUpdateCategory}
              iconName="Tag"
              iconPosition="left"
            >
              Đổi danh mục
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={onBulkDelete}
              iconName="Trash2"
              iconPosition="left"
            >
              Xóa
            </Button>

            <div className="w-px h-6 bg-border mx-2" />

            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              iconName="X"
              iconPosition="left"
            >
              Bỏ chọn
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkActionsBar;