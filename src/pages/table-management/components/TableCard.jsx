import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TableCard = ({ 
  table, 
  onTableClick, 
  onStatusChange, 
  onMergeTable, 
  onTransferTable,
  isDragging = false,
  dragHandleProps = {}
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-success text-success-foreground';
      case 'occupied': return 'bg-warning text-warning-foreground';
      case 'reserved': return 'bg-error text-error-foreground';
      case 'cleaning': return 'bg-primary text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available': return 'CheckCircle';
      case 'occupied': return 'Users';
      case 'reserved': return 'Clock';
      case 'cleaning': return 'Sparkles';
      default: return 'Circle';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available': return 'Trống';
      case 'occupied': return 'Có khách';
      case 'reserved': return 'Đã đặt';
      case 'cleaning': return 'Dọn dẹp';
      default: return 'Không xác định';
    }
  };

  const getTableShape = (shape) => {
    return shape === 'circular' ? 'rounded-full' : 'rounded-lg';
  };

  return (
    <div
      {...dragHandleProps}
      className={`
        relative bg-surface border-2 border-border p-4 cursor-pointer
        transition-all duration-200 hover:shadow-interactive
        ${getTableShape(table?.shape)}
        ${isDragging ? 'opacity-50 scale-95' : 'hover:scale-105'}
        ${table?.shape === 'circular' ? 'w-24 h-24' : 'w-28 h-20'}
        flex flex-col items-center justify-center
      `}
      onClick={() => onTableClick(table)}
    >
      {/* Table Number */}
      <div className="text-lg font-bold text-foreground mb-1">
        {table?.number}
      </div>
      {/* Status Indicator */}
      <div className={`
        absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center
        ${getStatusColor(table?.status)}
      `}>
        <Icon 
          name={getStatusIcon(table?.status)} 
          size={12} 
        />
      </div>
      {/* Capacity */}
      <div className="text-xs text-muted-foreground flex items-center">
        <Icon name="Users" size={10} className="mr-1" />
        {table?.currentOccupancy}/{table?.capacity}
      </div>
      {/* Server Info */}
      {table?.assignedServer && (
        <div className="text-xs text-muted-foreground mt-1 truncate w-full text-center">
          {table?.assignedServer}
        </div>
      )}
      {/* Order Info */}
      {table?.orderId && (
        <div className="text-xs text-primary mt-1">
          #{table?.orderId}
        </div>
      )}
      {/* Quick Actions */}
      <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center space-x-1">
        <Button
          variant="ghost"
          size="icon"
          className="w-6 h-6 bg-surface/90 hover:bg-surface"
          onClick={(e) => {
            e?.stopPropagation();
            onStatusChange(table?.id);
          }}
        >
          <Icon name="Edit" size={12} />
        </Button>
        
        {table?.status === 'occupied' && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6 bg-surface/90 hover:bg-surface"
              onClick={(e) => {
                e?.stopPropagation();
                onMergeTable(table?.id);
              }}
            >
              <Icon name="Merge" size={12} />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6 bg-surface/90 hover:bg-surface"
              onClick={(e) => {
                e?.stopPropagation();
                onTransferTable(table?.id);
              }}
            >
              <Icon name="ArrowRightLeft" size={12} />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default TableCard;