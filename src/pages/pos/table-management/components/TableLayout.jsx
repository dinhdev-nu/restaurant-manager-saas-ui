import React, { useState, useRef } from 'react';
import TableCard from './TableCard';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';

const TableLayout = ({
  tables,
  selectedTable,
  onTableSelect,
  onTableMove,
  onTableClick,
  onStatusChange,
  onMergeTable,
  onTransferTable
}) => {
  const [draggedTable, setDraggedTable] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const layoutRef = useRef(null);

  const handleMouseDown = (e, table) => {
    if (e?.button !== 0) return; // Only handle left click

    const rect = e?.currentTarget?.getBoundingClientRect();
    const layoutRect = layoutRef?.current?.getBoundingClientRect();

    setDraggedTable(table);
    setDragOffset({
      x: e?.clientX - rect?.left,
      y: e?.clientY - rect?.top
    });

    const handleMouseMove = (moveEvent) => {
      if (!draggedTable) return;

      const newX = moveEvent?.clientX - layoutRect?.left - dragOffset?.x;
      const newY = moveEvent?.clientY - layoutRect?.top - dragOffset?.y;

      // Constrain to layout bounds
      const constrainedX = Math.max(0, Math.min(newX, layoutRect?.width - 112));
      const constrainedY = Math.max(0, Math.min(newY, layoutRect?.height - 80));

      onTableMove(table?.id, { x: constrainedX, y: constrainedY });
    };

    const handleMouseUp = () => {
      setDraggedTable(null);
      setDragOffset({ x: 0, y: 0 });
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleLayoutClick = (e) => {
    if (e?.target === layoutRef?.current) {
      onTableSelect(null);
    }
  };

  return (
    <div className="flex-1 bg-muted/30 relative overflow-hidden">
      {/* Layout Header */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
        <div className="bg-surface/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-border">
          <h2 className="text-lg font-semibold text-foreground">Sơ đồ bàn</h2>
          <p className="text-sm text-muted-foreground">Kéo thả để sắp xếp bàn</p>
        </div>

        <div className="bg-surface/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-border">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-success rounded-full"></div>
              <span className="text-muted-foreground">Trống</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-warning rounded-full"></div>
              <span className="text-muted-foreground">Có khách</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-error rounded-full"></div>
              <span className="text-muted-foreground">Đã đặt</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="text-muted-foreground">Dọn dẹp</span>
            </div>
          </div>
        </div>
      </div>
      {/* Layout Grid */}
      <div
        ref={layoutRef}
        className="absolute inset-0 pt-20 pb-4 px-4"
        onClick={handleLayoutClick}
        style={{
          backgroundImage: `
            linear-gradient(rgba(148, 163, 184, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148, 163, 184, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      >
        {/* Tables */}
        {tables?.map((table) => (
          <div
            key={table?.id}
            className={`
              absolute transition-all duration-200 select-none
              ${selectedTable?.id === table?.id ? 'ring-2 ring-primary ring-offset-2' : ''}
              ${draggedTable?.id === table?.id ? 'z-50' : 'z-10'}
            `}
            style={{
              left: `${table?.x}px`,
              top: `${table?.y}px`,
              cursor: draggedTable?.id === table?.id ? 'grabbing' : 'grab'
            }}
            onMouseDown={(e) => handleMouseDown(e, table)}
          >
            <TableCard
              table={table}
              onTableClick={onTableClick}
              onStatusChange={onStatusChange}
              onMergeTable={onMergeTable}
              onTransferTable={onTransferTable}
              isDragging={draggedTable?.id === table?.id}
            />
          </div>
        ))}

        {/* Empty State */}
        {tables?.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Icon name="Table" size={64} className="mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium text-foreground mb-2">Chưa có bàn nào</h3>
              <p className="text-muted-foreground mb-4">Thêm bàn mới để bắt đầu quản lý</p>
              <Button variant="default" iconName="Plus" iconPosition="left">
                Thêm bàn đầu tiên
              </Button>
            </div>
          </div>
        )}
      </div>
      {/* Layout Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
        <Button
          variant="outline"
          size="icon"
          className="bg-surface/90 backdrop-blur-sm"
          title="Căn chỉnh lưới"
        >
          <Icon name="Grid3X3" size={20} />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="bg-surface/90 backdrop-blur-sm"
          title="Phóng to"
        >
          <Icon name="ZoomIn" size={20} />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="bg-surface/90 backdrop-blur-sm"
          title="Thu nhỏ"
        >
          <Icon name="ZoomOut" size={20} />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="bg-surface/90 backdrop-blur-sm"
          title="Làm mới bố cục"
        >
          <Icon name="RotateCcw" size={20} />
        </Button>
      </div>
    </div>
  );
};

export default TableLayout;