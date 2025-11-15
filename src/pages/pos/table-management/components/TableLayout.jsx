import React, { useState } from 'react';
import { DndContext, useSensor, useSensors, PointerSensor, DragOverlay } from '@dnd-kit/core';
import TableCard from './TableCard';
import DraggableTable from './DraggableTable';
import Icon from '../../../../components/AppIcon';

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
  onDeleteFloor
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
      const table = tables.find(t => t.id === active.id);
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
    if (e.target.classList.contains('table-layout')) {
      onTableSelect(null);
    }
  };

  const activeTable = activeId ? tables.find(t => t.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex-1 bg-muted/30 relative overflow-hidden">
        {/* Layout Header */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
          <div className="bg-surface/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-border">
            <h2 className="text-lg font-semibold text-foreground">Sơ đồ bàn</h2>
            <p className="text-sm text-muted-foreground">Kéo thả để sắp xếp bàn</p>
          </div>

          {/* Floor Selector */}
          <div className="bg-surface/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-border flex items-center space-x-2">
            {floors?.map((floor) => (
              <button
                key={floor.id}
                onClick={() => onFloorChange(floor.id)}
                className={`
                  px-3 py-1.5 rounded-md text-sm font-medium transition-all
                  ${currentFloor === floor.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }
                `}
              >
                {floor.name}
              </button>
            ))}
            <button
              onClick={onAddFloor}
              className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
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
          className="table-layout absolute inset-0 pt-20 pb-4 px-4"
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
              key={table.id}
              table={table}
              isSelected={selectedTable?.id === table.id}
              isActive={activeId === table.id}
              onTableClick={onTableClick}
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