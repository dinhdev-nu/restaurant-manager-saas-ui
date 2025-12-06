import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import TableLayout from './components/TableLayout';
import TableControlPanel from './components/TableControlPanel';
import QuickActionBar from './components/QuickActionBar';
import { InlineLoading } from '../../../components/ui/Loading';
import { useLoadTablesData } from '../../../hooks/use-load-tables-data';
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
      addTable(response.metadata);

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
            />

            {/* Control Panel */}
            <TableControlPanel
              selectedTable={selectedTable}
              onTableUpdate={handleTableUpdate}
              onAddTable={handleAddTable}
              onDeleteTable={handleDeleteTable}
              tables={currentFloorTables}
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
        />
      </main>
    </div>
  );
};

export default TableManagement;