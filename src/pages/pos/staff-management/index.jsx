import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import StaffCard from './components/StaffCard';
import StaffTable from './components/StaffTable';
import AddStaffModal from './components/AddStaffModal';
import StaffDetailsModal from './components/StaffDetailsModal';
import BulkActionsBar from './components/BulkActionsBar';

const StaffManagement = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isOperational, setIsOperational] = useState(true);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedStaffForDetails, setSelectedStaffForDetails] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [staffData, setStaffData] = useState([]);

  // Mock staff data
  useEffect(() => {
    const mockStaff = [
      {
        id: 1,
        name: "Nguyễn Văn An",
        employeeId: "NV001",
        phone: "0123 456 789",
        email: "an.nguyen@restaurant.com",
        role: "manager",
        roleDisplay: "Quản lý",
        status: "active",
        statusDisplay: "Đang làm việc",
        shift: "Ca sáng",
        workingHours: "8h/ngày",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        ordersToday: 45,
        hoursWorked: 6,
        joinDate: "2024-01-15",
        lastLogin: "2025-09-02T14:30:00"
      },
      {
        id: 2,
        name: "Trần Thị Bình",
        employeeId: "NV002",
        phone: "0987 654 321",
        email: "binh.tran@restaurant.com",
        role: "cashier",
        roleDisplay: "Thu ngân",
        status: "active",
        statusDisplay: "Đang làm việc",
        shift: "Ca chiều",
        workingHours: "8h/ngày",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
        ordersToday: 32,
        hoursWorked: 5,
        joinDate: "2024-02-20",
        lastLogin: "2025-09-02T14:15:00"
      },
      {
        id: 3,
        name: "Lê Minh Cường",
        employeeId: "NV003",
        phone: "0345 678 901",
        email: "cuong.le@restaurant.com",
        role: "kitchen",
        roleDisplay: "Nhân viên bếp",
        status: "on-break",
        statusDisplay: "Đang nghỉ",
        shift: "Ca sáng",
        workingHours: "8h/ngày",
        avatar: "https://randomuser.me/api/portraits/men/25.jpg",
        ordersToday: 28,
        hoursWorked: 4,
        joinDate: "2024-03-10",
        lastLogin: "2025-09-02T13:45:00"
      },
      {
        id: 4,
        name: "Phạm Thị Dung",
        employeeId: "NV004",
        phone: "0567 890 123",
        email: "dung.pham@restaurant.com",
        role: "waiter",
        roleDisplay: "Phục vụ",
        status: "active",
        statusDisplay: "Đang làm việc",
        shift: "Ca chiều",
        workingHours: "6h/ngày",
        avatar: "https://randomuser.me/api/portraits/women/67.jpg",
        ordersToday: 38,
        hoursWorked: 4,
        joinDate: "2024-04-05",
        lastLogin: "2025-09-02T14:20:00"
      },
      {
        id: 5,
        name: "Hoàng Văn Em",
        employeeId: "NV005",
        phone: "0789 012 345",
        email: "em.hoang@restaurant.com",
        role: "cashier",
        roleDisplay: "Thu ngân",
        status: "inactive",
        statusDisplay: "Nghỉ phép",
        shift: "Ca đêm",
        workingHours: "8h/ngày",
        avatar: "https://randomuser.me/api/portraits/men/18.jpg",
        ordersToday: 0,
        hoursWorked: 0,
        joinDate: "2024-05-12",
        lastLogin: "2025-09-01T22:00:00"
      },
      {
        id: 6,
        name: "Vũ Thị Giang",
        employeeId: "NV006",
        phone: "0901 234 567",
        email: "giang.vu@restaurant.com",
        role: "kitchen",
        roleDisplay: "Nhân viên bếp",
        status: "active",
        statusDisplay: "Đang làm việc",
        shift: "Ca sáng",
        workingHours: "8h/ngày",
        avatar: "https://randomuser.me/api/portraits/women/29.jpg",
        ordersToday: 41,
        hoursWorked: 6,
        joinDate: "2024-06-18",
        lastLogin: "2025-09-02T14:25:00"
      }
    ];
    setStaffData(mockStaff);
  }, []);

  const roleOptions = [
    { value: '', label: 'Tất cả vai trò' },
    { value: 'owner', label: 'Chủ cửa hàng' },
    { value: 'manager', label: 'Quản lý' },
    { value: 'cashier', label: 'Thu ngân' },
    { value: 'kitchen', label: 'Nhân viên bếp' },
    { value: 'waiter', label: 'Phục vụ' },
    { value: 'cleaner', label: 'Vệ sinh' }
  ];

  const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'active', label: 'Đang làm việc' },
    { value: 'on-break', label: 'Đang nghỉ' },
    { value: 'inactive', label: 'Nghỉ phép' }
  ];

  const sortOptions = [
    { value: 'name', label: 'Tên A-Z' },
    { value: 'name-desc', label: 'Tên Z-A' },
    { value: 'role', label: 'Vai trò' },
    { value: 'status', label: 'Trạng thái' },
    { value: 'join-date', label: 'Ngày vào làm' },
    { value: 'performance', label: 'Hiệu suất' }
  ];

  // Filter and sort staff data
  const filteredAndSortedStaff = React.useMemo(() => {
    let filtered = staffData?.filter(staff => {
      const matchesSearch = staff?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        staff?.employeeId?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        staff?.phone?.includes(searchTerm) ||
        staff?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase());

      const matchesRole = !filterRole || staff?.role === filterRole;
      const matchesStatus = !filterStatus || staff?.status === filterStatus;

      return matchesSearch && matchesRole && matchesStatus;
    });

    // Sort
    filtered?.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a?.name?.localeCompare(b?.name);
        case 'name-desc':
          return b?.name?.localeCompare(a?.name);
        case 'role':
          return a?.roleDisplay?.localeCompare(b?.roleDisplay);
        case 'status':
          return a?.statusDisplay?.localeCompare(b?.statusDisplay);
        case 'join-date':
          return new Date(b.joinDate) - new Date(a.joinDate);
        case 'performance':
          return b?.ordersToday - a?.ordersToday;
        default:
          return 0;
      }
    });

    return filtered;
  }, [staffData, searchTerm, filterRole, filterStatus, sortBy]);

  const handleAddStaff = (newStaff) => {
    setStaffData(prev => [...prev, newStaff]);
  };

  const handleEditStaff = (staff) => {
    console.log('Edit staff:', staff);
    // Implement edit functionality
  };

  const handleToggleStatus = (staff) => {
    setStaffData(prev => prev?.map(s =>
      s?.id === staff?.id
        ? {
          ...s,
          status: s?.status === 'active' ? 'on-break' : 'active',
          statusDisplay: s?.status === 'active' ? 'Đang nghỉ' : 'Đang làm việc'
        }
        : s
    ));
  };

  const handleViewDetails = (staff) => {
    setSelectedStaffForDetails(staff);
    setShowDetailsModal(true);
  };

  const handleDeleteStaff = (staff) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa nhân viên ${staff?.name}?`)) {
      setStaffData(prev => prev?.filter(s => s?.id !== staff?.id));
      setSelectedStaff(prev => prev?.filter(id => id !== staff?.id));
    }
  };

  const handleSelectStaff = (staffId) => {
    setSelectedStaff(prev =>
      prev?.includes(staffId)
        ? prev?.filter(id => id !== staffId)
        : [...prev, staffId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStaff?.length === filteredAndSortedStaff?.length) {
      setSelectedStaff([]);
    } else {
      setSelectedStaff(filteredAndSortedStaff?.map(staff => staff?.id));
    }
  };

  const handleBulkAction = (action) => {
    console.log('Bulk action:', action, 'for staff:', selectedStaff);
    // Implement bulk actions
  };

  const handleBulkRoleChange = (newRole) => {
    if (newRole && selectedStaff?.length > 0) {
      const roleDisplay = roleOptions?.find(r => r?.value === newRole)?.label || newRole;
      setStaffData(prev => prev?.map(staff =>
        selectedStaff?.includes(staff?.id)
          ? { ...staff, role: newRole, roleDisplay }
          : staff
      ));
      setSelectedStaff([]);
    }
  };

  const handleBulkStatusChange = (newStatus) => {
    if (newStatus && selectedStaff?.length > 0) {
      const statusDisplay = statusOptions?.find(s => s?.value === newStatus)?.label || newStatus;
      setStaffData(prev => prev?.map(staff =>
        selectedStaff?.includes(staff?.id)
          ? { ...staff, status: newStatus, statusDisplay }
          : staff
      ));
      setSelectedStaff([]);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        storeName="POS Manager"
        isOperational={isOperational}
        onToggleOperational={() => setIsOperational(!isOperational)}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        userProfile={{ name: "Admin", role: "owner" }}
      />
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        userRole="owner"
      />
      <main className={`
        pt-16 transition-all duration-300 ease-smooth
        ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'}
      `}>
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-semibold text-foreground flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <Icon name="Users" size={20} color="white" />
                  </div>
                  <span>Quản lý nhân viên</span>
                </h1>
                <p className="text-muted-foreground mt-1">
                  Quản lý thông tin và quyền truy cập của nhân viên trong hệ thống POS
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  iconName="Download"
                  iconPosition="left"
                  className="hover-scale"
                >
                  Xuất Excel
                </Button>
                <Button
                  variant="default"
                  onClick={() => setShowAddModal(true)}
                  iconName="UserPlus"
                  iconPosition="left"
                  className="hover-scale"
                >
                  Thêm nhân viên
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon name="Users" size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-card-foreground">{staffData?.length}</p>
                    <p className="text-sm text-muted-foreground">Tổng nhân viên</p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                    <Icon name="UserCheck" size={20} className="text-success" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-card-foreground">
                      {staffData?.filter(s => s?.status === 'active')?.length}
                    </p>
                    <p className="text-sm text-muted-foreground">Đang làm việc</p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                    <Icon name="UserX" size={20} className="text-warning" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-card-foreground">
                      {staffData?.filter(s => s?.status === 'on-break')?.length}
                    </p>
                    <p className="text-sm text-muted-foreground">Đang nghỉ</p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Icon name="TrendingUp" size={20} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-card-foreground">
                      {Math.round(staffData?.reduce((acc, s) => acc + s?.ordersToday, 0) / staffData?.length)}
                    </p>
                    <p className="text-sm text-muted-foreground">Đơn TB/người</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Controls */}
          <div className="bg-card border border-border rounded-lg p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <Input
                    type="search"
                    placeholder="Tìm kiếm nhân viên..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e?.target?.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                  <Icon
                    name="Search"
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  />
                </div>

                <Select
                  placeholder="Vai trò"
                  options={roleOptions}
                  value={filterRole}
                  onChange={setFilterRole}
                  className="w-full sm:w-40"
                />

                <Select
                  placeholder="Trạng thái"
                  options={statusOptions}
                  value={filterStatus}
                  onChange={setFilterStatus}
                  className="w-full sm:w-40"
                />

                <Select
                  placeholder="Sắp xếp"
                  options={sortOptions}
                  value={sortBy}
                  onChange={setSortBy}
                  className="w-full sm:w-40"
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('cards')}
                  className="hover-scale"
                >
                  <Icon name="Grid3X3" size={18} />
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('table')}
                  className="hover-scale"
                >
                  <Icon name="List" size={18} />
                </Button>
              </div>
            </div>
          </div>

          {/* Bulk Actions Bar */}
          <BulkActionsBar
            selectedCount={selectedStaff?.length}
            onClearSelection={() => setSelectedStaff([])}
            onBulkAction={handleBulkAction}
            onBulkRoleChange={handleBulkRoleChange}
            onBulkStatusChange={handleBulkStatusChange}
          />

          {/* Staff List */}
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredAndSortedStaff?.map((staff) => (
                <StaffCard
                  key={staff?.id}
                  staff={staff}
                  onEdit={handleEditStaff}
                  onToggleStatus={handleToggleStatus}
                  onViewDetails={handleViewDetails}
                  onDelete={handleDeleteStaff}
                />
              ))}
            </div>
          ) : (
            <StaffTable
              staff={filteredAndSortedStaff}
              onEdit={handleEditStaff}
              onToggleStatus={handleToggleStatus}
              onViewDetails={handleViewDetails}
              onDelete={handleDeleteStaff}
              selectedStaff={selectedStaff}
              onSelectStaff={handleSelectStaff}
              onSelectAll={handleSelectAll}
              isAllSelected={selectedStaff?.length === filteredAndSortedStaff?.length && filteredAndSortedStaff?.length > 0}
            />
          )}

          {/* Empty State */}
          {filteredAndSortedStaff?.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Users" size={32} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchTerm || filterRole || filterStatus ? 'Không tìm thấy nhân viên' : 'Chưa có nhân viên nào'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || filterRole || filterStatus
                  ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm' : 'Thêm nhân viên đầu tiên để bắt đầu quản lý'
                }
              </p>
              {!searchTerm && !filterRole && !filterStatus && (
                <Button
                  variant="default"
                  onClick={() => setShowAddModal(true)}
                  iconName="UserPlus"
                  iconPosition="left"
                  className="hover-scale"
                >
                  Thêm nhân viên đầu tiên
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
      {/* Modals */}
      <AddStaffModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddStaff}
      />
      <StaffDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        staff={selectedStaffForDetails}
      />
    </div>
  );
};

export default StaffManagement;