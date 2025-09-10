import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import TableLayout from './components/TableLayout';
import TableControlPanel from './components/TableControlPanel';
import TableMergeModal from './components/TableMergeModal';
import QuickActionBar from './components/QuickActionBar';

const TableManagement = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOperational, setIsOperational] = useState(true);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [tables, setTables] = useState([
    {
      id: 'table_1',
      number: '01',
      capacity: 4,
      currentOccupancy: 2,
      status: 'occupied',
      shape: 'rectangular',
      x: 100,
      y: 100,
      assignedServer: 'Nguyễn Văn A',
      orderId: 'ORD001',
      estimatedWaitTime: null
    },
    {
      id: 'table_2',
      number: '02',
      capacity: 6,
      currentOccupancy: 0,
      status: 'available',
      shape: 'circular',
      x: 250,
      y: 100,
      assignedServer: null,
      orderId: null,
      estimatedWaitTime: null
    },
    {
      id: 'table_3',
      number: '03',
      capacity: 2,
      currentOccupancy: 2,
      status: 'reserved',
      shape: 'rectangular',
      x: 400,
      y: 100,
      assignedServer: 'Trần Thị B',
      orderId: null,
      estimatedWaitTime: 15
    },
    {
      id: 'table_4',
      number: '04',
      capacity: 8,
      currentOccupancy: 0,
      status: 'cleaning',
      shape: 'rectangular',
      x: 100,
      y: 200,
      assignedServer: 'Lê Văn C',
      orderId: null,
      estimatedWaitTime: null
    },
    {
      id: 'table_5',
      number: '05',
      capacity: 4,
      currentOccupancy: 4,
      status: 'occupied',
      shape: 'circular',
      x: 250,
      y: 200,
      assignedServer: 'Phạm Thị D',
      orderId: 'ORD002',
      estimatedWaitTime: null
    },
    {
      id: 'table_6',
      number: '06',
      capacity: 6,
      currentOccupancy: 0,
      status: 'available',
      shape: 'rectangular',
      x: 400,
      y: 200,
      assignedServer: null,
      orderId: null,
      estimatedWaitTime: null
    },
    {
      id: 'table_7',
      number: '07',
      capacity: 2,
      currentOccupancy: 1,
      status: 'occupied',
      shape: 'circular',
      x: 100,
      y: 300,
      assignedServer: 'Nguyễn Văn A',
      orderId: 'ORD003',
      estimatedWaitTime: null
    },
    {
      id: 'table_8',
      number: '08',
      capacity: 10,
      currentOccupancy: 0,
      status: 'available',
      shape: 'rectangular',
      x: 250,
      y: 300,
      assignedServer: null,
      orderId: null,
      estimatedWaitTime: null
    }
  ]);

  const handleToggleSidebar = () => {
    if (window.innerWidth >= 1024) {
      setSidebarCollapsed(!sidebarCollapsed);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  const handleTableSelect = (table) => {
    setSelectedTable(table);
  };

  const handleTableClick = (table) => {
    setSelectedTable(table);
  };

  const handleTableMove = (tableId, newPosition) => {
    setTables(prevTables =>
      prevTables?.map(table =>
        table?.id === tableId
          ? { ...table, x: newPosition?.x, y: newPosition?.y }
          : table
      )
    );
  };

  const handleTableUpdate = (tableId, updates) => {
    setTables(prevTables =>
      prevTables?.map(table =>
        table?.id === tableId
          ? { ...table, ...updates }
          : table
      )
    );

    // Update selected table if it's the one being updated
    if (selectedTable?.id === tableId) {
      setSelectedTable(prev => ({ ...prev, ...updates }));
    }
  };

  const handleStatusChange = (tableId) => {
    const table = tables?.find(t => t?.id === tableId);
    if (!table) return;

    // Cycle through statuses based on current status
    let newStatus;
    switch (table?.status) {
      case 'available':
        newStatus = 'occupied';
        break;
      case 'occupied':
        newStatus = 'cleaning';
        break;
      case 'cleaning':
        newStatus = 'available';
        break;
      case 'reserved':
        newStatus = 'occupied';
        break;
      default:
        newStatus = 'available';
    }

    handleTableUpdate(tableId, { status: newStatus });
  };

  const handleQuickStatusChange = (tableId, newStatus) => {
    handleTableUpdate(tableId, { status: newStatus });
  };

  const handleAddTable = (newTable) => {
    setTables(prevTables => [...prevTables, newTable]);
  };

  const handleDeleteTable = (tableId) => {
    setTables(prevTables => prevTables?.filter(table => table?.id !== tableId));
    if (selectedTable?.id === tableId) {
      setSelectedTable(null);
    }
  };

  const handleMergeTable = (tableId) => {
    setShowMergeModal(true);
  };

  const handleTransferTable = (tableId) => {
    setShowMergeModal(true);
  };

  const handleConfirmMerge = (mergeData) => {
    console.log('Merge operation:', mergeData);
    // Implement merge logic here
    setShowMergeModal(false);
  };

  const handleCreateOrder = (tableId) => {
    navigate('/main-pos-dashboard', { state: { selectedTable: tableId } });
  };

  const handleViewOrder = (orderId) => {
    navigate('/order-history', { state: { selectedOrder: orderId } });
  };

  const handlePrintBill = (tableId) => {
    console.log('Printing bill for table:', tableId);
    // Implement print functionality
  };

  const handleCallWaiter = (tableId) => {
    console.log('Calling waiter for table:', tableId);
    // Implement waiter notification
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
        userRole="manager"
      />

      {/* Main Content */}
      <main className={`
        pt-16 transition-all duration-300 ease-smooth
        ${window.innerWidth >= 1024 
          ? (sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60') 
          : ''
        }
      `}>
        <div className="h-[calc(100vh-4rem)] flex">
          {/* Table Layout */}
          <TableLayout
            tables={tables}
            selectedTable={selectedTable}
            onTableSelect={handleTableSelect}
            onTableMove={handleTableMove}
            onTableClick={handleTableClick}
            onStatusChange={handleStatusChange}
            onMergeTable={handleMergeTable}
            onTransferTable={handleTransferTable}
          />

          {/* Control Panel */}
          <TableControlPanel
            selectedTable={selectedTable}
            onTableUpdate={handleTableUpdate}
            onAddTable={handleAddTable}
            onDeleteTable={handleDeleteTable}
            onMergeTable={handleMergeTable}
            onTransferTable={handleTransferTable}
            tables={tables}
          />
        </div>

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

      {/* Merge Modal */}
      <TableMergeModal
        isOpen={showMergeModal}
        onClose={() => setShowMergeModal(false)}
        sourceTable={selectedTable}
        availableTables={tables}
        onConfirmMerge={handleConfirmMerge}
      />
    </div>
  );
};

export default TableManagement;