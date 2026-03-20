import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import TableLayout from './components/TableLayout';
import TableControlPanel from './components/TableControlPanel';
import QuickActionBar from './components/QuickActionBar';
import { InlineLoading } from '../../../components/ui/Loading';
import { useLoadTablesData } from '../../../hooks/use-load-tables-data';
import { useSSESubscription } from '../../../contexts/SSEContext';
import { useTableStore } from '../../../stores/table.store';
import { useRestaurantStore } from '../../../stores/restaurant.store';
import { useToast } from '../../../hooks/use-toast';
import { createTableApi } from '../../../api/restaurant';

const TableManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const selectedRestaurant = useRestaurantStore((state) => state.selectedRestaurant);

  // Load tables using custom hook
  const { isLoading: isLoadingData } = useLoadTablesData(
    selectedRestaurant?._id
  );

  // Use table store
  const tables = useTableStore((state) => state.tables);
  const floors = useTableStore((state) => state.floors);
  const currentFloor = useTableStore((state) => state.currentFloor);
  const selectedTable = useTableStore((state) => state.selectedTable);
  const setSelectedTable = useTableStore((state) => state.setSelectedTable);
  const addTable = useTableStore((state) => state.addTable);
  const updateTable = useTableStore((state) => state.updateTable);
  const deleteTable = useTableStore((state) => state.deleteTable);
  const updateTablePosition = useTableStore((state) => state.updateTablePosition);
  const setCurrentFloor = useTableStore((state) => state.setCurrentFloor);
  const addFloor = useTableStore((state) => state.addFloor);
  const deleteFloor = useTableStore((state) => state.deleteFloor);
  const getCurrentFloorTables = useTableStore((state) => state.getCurrentFloorTables);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOperational, setIsOperational] = useState(true);

  // Position editing mode state
  const [isEditingPositions, setIsEditingPositions] = useState(false);
  const [originalPositions, setOriginalPositions] = useState({});
  const [changedTableIds, setChangedTableIds] = useState(new Set());

  // Get tables for current floor
  const currentFloorTables = getCurrentFloorTables();

  const handleToggleSidebar = () => {
    if (window.innerWidth >= 1024) {
      setSidebarCollapsed(!sidebarCollapsed);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  const handleFloorChange = (floorId) => {
    setCurrentFloor(floorId);
  };

  const handleAddFloor = () => {
    addFloor();
  };

  const handleDeleteFloor = (floorId) => {
    deleteFloor(floorId);
  };

  const handleTableSelect = (table) => {
    setSelectedTable(table);
  };

  const handleTableClick = (table) => {
    setSelectedTable(table);
  };

  const handleTableMove = (tableId, newPosition) => {
    updateTablePosition(tableId, newPosition);

    // Track changed tables during edit mode
    if (isEditingPositions) {
      const original = originalPositions[tableId];
      if (original) {
        // Check if position actually changed from original
        if (original.x !== newPosition.x || original.y !== newPosition.y) {
          setChangedTableIds(prev => new Set([...prev, tableId]));
        } else {
          // If moved back to original position, remove from changed list
          setChangedTableIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(tableId);
            return newSet;
          });
        }
      }
    }
  };

  // Handle start editing positions
  const handleStartEditingPositions = () => {
    // Save original positions of all current floor tables
    const positions = {};
    currentFloorTables.forEach(table => {
      positions[table._id] = { x: table.x, y: table.y };
    });
    setOriginalPositions(positions);
    setChangedTableIds(new Set());
    setIsEditingPositions(true);
    setSelectedTable(null); // Deselect any selected table

    toast({
      title: "Chế độ chỉnh sửa vị trí",
      description: "Kéo thả các bàn để thay đổi vị trí. Nhấn Lưu khi hoàn tất.",
      variant: "default"
    });
  };

  // Handle save position changes
  const handleSavePositionChanges = () => {
    if (changedTableIds.size === 0) {
      toast({
        title: "Không có thay đổi",
        description: "Không có bàn nào được di chuyển.",
        variant: "default"
      });
      setIsEditingPositions(false);
      setOriginalPositions({});
      return;
    }

    // Get all changed tables with their new positions
    const changedTables = currentFloorTables
      .filter(table => changedTableIds.has(table._id))
      .map(table => ({
        _id: table._id,
        number: table.number,
        oldPosition: originalPositions[table._id],
        newPosition: { x: table.x, y: table.y }
      }));

    // Console log the changed tables
    console.log('Chi tiết đầy đủ:', changedTables);

    // Reset editing mode
    setIsEditingPositions(false);
    setOriginalPositions({});
    setChangedTableIds(new Set());

    toast({
      title: "Đã lưu vị trí",
      description: `${changedTables.length} bàn đã được cập nhật vị trí.`,
      variant: "success"
    });
  };

  // Handle cancel editing
  const handleCancelEditingPositions = () => {
    // Restore original positions
    Object.entries(originalPositions).forEach(([tableId, position]) => {
      updateTablePosition(tableId, position);
    });

    setIsEditingPositions(false);
    setOriginalPositions({});
    setChangedTableIds(new Set());

    toast({
      title: "Đã hủy",
      description: "Các thay đổi vị trí đã được hoàn tác.",
      variant: "default"
    });
  };

  const handleTableUpdate = (tableId, updates) => {
    updateTable(tableId, updates);
  };

  const handleQuickStatusChange = (tableId, newStatus) => {
    updateTable(tableId, { status: newStatus });
  };

  const handleAddTable = async (newTable) => {
    try {
      // Add floor property to new table
      const tableWithFloor = { ...newTable, floor: currentFloor };

      // Call API to create table
      const response = await createTableApi(selectedRestaurant._id, tableWithFloor);

      // Add to store with _id from server (no need to refetch)
      addTable(response.data);

      toast({
        title: "Thêm bàn thành công",
        description: `Bàn ${newTable.number} đã được thêm vào ${floors.find(f => f.id === currentFloor)?.name}`,
        variant: "success"
      });
    } catch (error) {
      toast({
        title: "Lỗi thêm bàn",
        description: error.message,
        variant: "destructive"
      });
      throw error; // Re-throw để TableControlPanel biết có lỗi
    }
  };

  const handleDeleteTable = (tableId) => {
    deleteTable(tableId);
  };

  const handleCreateOrder = (tableId) => {
    navigate('/main-pos-dashboard', { state: { selectedTable: tableId } });
  };

  const handleViewOrder = (orderId) => {
    navigate('/order-history', { state: { selectedOrder: orderId } });
  };

  const handlePrintBill = (tableId) => {
    // TODO: Implement print functionality
  };

  const handleCallWaiter = (tableId) => {
    // TODO: Implement waiter notification
  };

  // SSE Event Handler for real-time table updates
  const handleSSEEvent = useCallback((data) => {
    console.log('[TableManagement] Received SSE event:', data);

    switch (data.type) {
      case 'TABLE_UPDATE':
      case 'TABLE_STATUS_UPDATE':
        if (data.tableId && data.updates) {
          updateTable(data.tableId, data.updates);
          toast({
            title: 'Cập nhật bàn',
            description: `Bàn ${data.tableNumber || data.tableId} đã thay đổi trạng thái`,
          });
        } else if (data.tableId && data.status) {
          updateTable(data.tableId, { status: data.status });
        }
        break;

      case 'NEW_ORDER':
        if (data.order?.table) {
          // Update table status when new order is created
          const table = tables.find(t => t._id === data.order.table || t.number === data.order.table);
          if (table) {
            updateTable(table._id, {
              status: 'occupied',
              orderId: data.order._id
            });
          }
        }
        break;

      case 'ORDER_COMPLETED':
      case 'PAYMENT_UPDATE':
        if (data.tableId && data.paymentStatus === 'paid') {
          // Mark table as available when payment is completed
          updateTable(data.tableId, {
            status: 'cleaning',
            orderId: null
          });
        }
        break;

      default:
        console.log('[TableManagement] Unknown event type:', data.type);
    }
  }, [updateTable, tables, toast]);

  // Subscribe to SSE events (1 connection duy nhất từ SSEProvider)
  const { isConnected } = useSSESubscription(handleSSEEvent, 'TableManagement');

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header
        storeName="POS Manager"
        isOperational={isOperational}
        onToggleOperational={() => setIsOperational(!isOperational)}
        onToggleSidebar={handleToggleSidebar}
        userProfile={{ name: "Quản lý", role: "manager" }}
      />

      {/* Sidebar */}
      <Sidebar
        isCollapsed={window.innerWidth >= 1024 ? sidebarCollapsed : !sidebarOpen}
        onToggleCollapse={handleToggleSidebar}
        userRole="owner"
      />

      {/* Main Content */}
      <main className={`
        pt-16 transition-all duration-300 ease-smooth
        ${window.innerWidth >= 1024
          ? (sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60')
          : ''
        }
      `}>
        {isLoadingData ? (
          <InlineLoading message="Đang tải danh sách bàn..." size="lg" />
        ) : (
          <div className="h-[calc(100vh-4rem)] flex pb-16">
            {/* Table Layout */}
            <TableLayout
              tables={currentFloorTables}
              selectedTable={selectedTable}
              onTableSelect={handleTableSelect}
              onTableMove={handleTableMove}
              onTableClick={handleTableClick}
              floors={floors}
              currentFloor={currentFloor}
              onFloorChange={handleFloorChange}
              onAddFloor={handleAddFloor}
              onDeleteFloor={handleDeleteFloor}
              isEditingPositions={isEditingPositions}
              changedTableIds={changedTableIds}
              onStartEditingPositions={handleStartEditingPositions}
              onSavePositionChanges={handleSavePositionChanges}
              onCancelEditingPositions={handleCancelEditingPositions}
            />

            {/* Control Panel */}
            <TableControlPanel
              selectedTable={selectedTable}
              onTableUpdate={handleTableUpdate}
              onAddTable={handleAddTable}
              onDeleteTable={handleDeleteTable}
              tables={currentFloorTables}
              disabled={isEditingPositions}
            />
          </div>
        )}

        {/* Quick Action Bar */}
        <QuickActionBar
          selectedTable={selectedTable}
          onQuickStatusChange={handleQuickStatusChange}
          onCreateOrder={handleCreateOrder}
          onViewOrder={handleViewOrder}
          onPrintBill={handlePrintBill}
          onCallWaiter={handleCallWaiter}
          disabled={isEditingPositions}
        />
      </main>
    </div>
  );
};

export default TableManagement;