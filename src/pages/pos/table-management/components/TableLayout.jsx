import React, { useState } from 'react';
import { DndContext, useSensor, useSensors, PointerSensor, DragOverlay } from '@dnd-kit/core';
import TableCard from './TableCard';
import DraggableTable from './DraggableTable';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';

const TableLayout = ({
  tables,
  selectedTable,
  onTableSelect,
  onTableMove,
  onTableClick,
  floors = [],
  currentFloor = 1,
  onFloorChange,
  onAddFloor,
  onDeleteFloor,
  isEditingPositions = false,
  changedTableIds = new Set(),
  onStartEditingPositions,
  onSavePositionChanges,
  onCancelEditingPositions
}) => {
  const [activeId, setActiveId] = useState(null);

  // Configure sensors for better drag behavior
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    })
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, delta } = event;

    if (delta.x !== 0 || delta.y !== 0) {
      const table = tables.find(t => t._id === active.id);
      if (table) {
        // Calculate new position immediately from current position + delta
        const layoutElement = document.querySelector('.table-layout');
        const maxX = layoutElement ? layoutElement.offsetWidth - 120 : 800;
        const maxY = layoutElement ? layoutElement.offsetHeight - 100 : 600;

        const newX = Math.max(0, Math.min(maxX, table.x + delta.x));
        const newY = Math.max(0, Math.min(maxY, table.y + delta.y));

        // Update immediately - no delay
        onTableMove(active.id, { x: Math.round(newX), y: Math.round(newY) });
      }
    }

    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const handleLayoutClick = (e) => {
    // Disable deselection during editing mode
    if (!isEditingPositions && e.target.classList.contains('table-layout')) {
      onTableSelect(null);
    }
  };

  const activeTable = activeId ? tables.find(t => t._id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex-1 bg-muted/30 relative overflow-hidden">
        {/* Editing Mode Banner */}
        {isEditingPositions && (
          <div className="absolute top-0 left-0 right-0 z-20 bg-warning/90 backdrop-blur-sm border-b-2 border-warning px-4 py-3">
            <div className="flex items-center justify-between max-w-full">
              <div className="flex items-center space-x-3">
                <div className="bg-warning text-warning-foreground rounded-full p-2">
                  <Icon name="Move" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-warning-foreground">Chế độ chỉnh sửa vị trí bàn</h3>
                  <p className="text-sm text-warning-foreground/80">
                    Kéo thả các bàn để thay đổi vị trí. {changedTableIds.size > 0 && `Đã thay đổi: ${changedTableIds.size} bàn`}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCancelEditingPositions}
                  iconName="X"
                  iconPosition="left"
                  className="bg-surface text-foreground border-border hover:bg-muted"
                >
                  Hủy
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={onSavePositionChanges}
                  iconName="Check"
                  iconPosition="left"
                  className="bg-success text-success-foreground hover:bg-success/90"
                >
                  Lưu thay đổi
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Layout Header */}
        <div className={`absolute ${isEditingPositions ? 'top-20' : 'top-4'} left-4 right-4 z-10 flex items-center justify-between transition-all duration-300`}>
          <div className="bg-surface/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-border">
            <div className="flex items-center space-x-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Sơ đồ bàn</h2>
                <p className="text-sm text-muted-foreground">
                  {isEditingPositions ? 'Đang chỉnh sửa vị trí' : 'Kéo thả để sắp xếp bàn'}
                </p>
              </div>
              {!isEditingPositions && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onStartEditingPositions}
                  iconName="Move"
                  iconPosition="left"
                  className="ml-2"
                >
                  Chỉnh sửa vị trí
                </Button>
              )}
            </div>
          </div>

          {/* Floor Selector */}
          <div className="bg-surface/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-border flex items-center space-x-2">
            {floors?.map((floor) => (
              <button
                key={floor.id}
                onClick={() => !isEditingPositions && onFloorChange(floor.id)}
                disabled={isEditingPositions}
                className={`
                  px-3 py-1.5 rounded-md text-sm font-medium transition-all
                  ${currentFloor === floor.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }
                  ${isEditingPositions ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {floor.name}
              </button>
            ))}
            <button
              onClick={onAddFloor}
              disabled={isEditingPositions}
              className={`
                p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-all
                ${isEditingPositions ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              title="Thêm tầng mới"
            >
              <Icon name="Plus" size={16} />
            </button>
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
          className={`table-layout absolute inset-0 ${isEditingPositions ? 'pt-32' : 'pt-20'} pb-4 px-4 transition-all duration-300`}
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
            <DraggableTable
              key={table._id}
              table={table}
              isSelected={selectedTable?._id === table._id}
              isActive={activeId === table._id}
              onTableClick={onTableClick}
              isEditingMode={isEditingPositions}
              hasChanged={changedTableIds.has(table._id)}
            />
          ))}

          {/* Empty State */}
          {tables?.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <Icon name="Table" size={64} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium text-foreground mb-2">Chưa có bàn nào</h3>
                <p className="text-muted-foreground">Thêm bàn mới từ bảng điều khiển bên phải</p>
              </div>
            </div>
          )}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTable ? (
            <div className="opacity-80">
              <TableCard
                table={activeTable}
                onTableClick={() => { }}
                isDragging={true}
              />
            </div>
          ) : null}
        </DragOverlay>


      </div>
    </DndContext>
  );
};

export default TableLayout;