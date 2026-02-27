import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import TableCard from './TableCard';

const DraggableTable = ({
    table,
    isSelected,
    isActive,
    onTableClick,
    isEditingMode = false,
    hasChanged = false
}) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: table._id,
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

    const handleClick = (e) => {
        // Disable table selection during editing mode
        if (!isEditingMode) {
            onTableClick(table);
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`
        select-none !cursor-grab active:!cursor-grabbing
        ${isSelected && !isEditingMode ? 'ring-2 ring-primary ring-offset-2' : ''}
        ${hasChanged && isEditingMode ? 'ring-2 ring-warning ring-offset-2' : ''}
      `}
            {...listeners}
            {...attributes}
        >
            <TableCard
                table={table}
                onTableClick={handleClick}
                isDragging={isDragging || isActive}
                isEditingMode={isEditingMode}
                hasChanged={hasChanged}
            />
        </div>
    );
};

export default DraggableTable;
