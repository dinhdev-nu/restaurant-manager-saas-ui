import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import TableCard from './TableCard';

const DraggableTable = ({
    table,
    isSelected,
    isActive,
    onTableClick
}) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: table.id,
    });

    const style = {
        position: 'absolute',
        left: `${table.x}px`,
        top: `${table.y}px`,
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging || isActive ? 50 : 10,
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 0 : 1, // Hide original while dragging (show in overlay)
        transition: isDragging ? 'none' : 'none', // Remove transition to avoid jump
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`
        select-none !cursor-grab active:!cursor-grabbing
        ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
      `}
            {...listeners}
            {...attributes}
        >
            <TableCard
                table={table}
                onTableClick={onTableClick}
                isDragging={isDragging || isActive}
            />
        </div>
    );
};

export default DraggableTable;
