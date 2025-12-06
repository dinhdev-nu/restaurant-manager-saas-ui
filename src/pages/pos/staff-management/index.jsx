import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import { InlineLoading } from '../../../components/ui/Loading';
import StaffCard from './components/StaffCard';
import StaffTable from './components/StaffTable';
import StaffFormModal from './components/StaffFormModal';
import StaffDetailsModal from './components/StaffDetailsModal';
import BulkActionsBar from './components/BulkActionsBar';
import ConfirmationDialog from '../../../components/ui/ConfirmationDialog';
import { useStaffStore } from '../../../stores';
import { useRestaurantStore } from '../../../stores/restaurant.store';
import { useLoadStaffData } from '../../../hooks/use-load-staff-data';
import { createStaffApi } from '../../../api/restaurant';
import { toast } from '../../../hooks/use-toast';

const StaffManagement = () => {
  const selectedRestaurant = useRestaurantStore((state) => state.selectedRestaurant);

  // Load staff using custom hook
  const { isLoading: isLoadingData } = useLoadStaffData(
    selectedRestaurant?._id
  );

  // Zustand Store
  const {
    staff: staffData,
    addStaff,
    updateStaff,
    deleteStaff,
    toggleStaffStatus,
    bulkDeleteStaff,
    bulkUpdateRole,
    bulkUpdateStatus,
    getStaffStats
  } = useStaffStore();

  // Local State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isOperational, setIsOperational] = useState(true);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffModalMode, setStaffModalMode] = useState('add');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedStaffForDetails, setSelectedStaffForDetails] = useState(null);
  const [selectedStaffForForm, setSelectedStaffForForm] = useState(null);
  const [selectedStaffForDelete, setSelectedStaffForDelete] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState([]);

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
  const filteredAndSortedStaff = useMemo(() => {
    let filtered = staffData.filter(staff => {
      const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.phone.includes(searchTerm) ||
        staff.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = !filterRole || staff.role === filterRole;
      const matchesStatus = !filterStatus || staff.status === filterStatus;

      return matchesSearch && matchesRole && matchesStatus;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'role':
          return a.roleDisplay.localeCompare(b.roleDisplay);
        case 'status':
          return a.statusDisplay.localeCompare(b.statusDisplay);
        case 'join-date':
          return new Date(b.joinDate) - new Date(a.joinDate);
        case 'performance':
          return b.ordersToday - a.ordersToday;
        default:
          return 0;
      }
    });

    return filtered;
  }, [staffData, searchTerm, filterRole, filterStatus, sortBy]);

  const handleAddStaff = () => {
    setStaffModalMode('add');
    setSelectedStaffForForm(null);
    setShowStaffModal(true);
  };

  const handleEditStaff = (staff) => {
    setStaffModalMode('edit');
    setSelectedStaffForForm(staff);
    setShowStaffModal(true);
  };

  const handleSaveStaff = async (staffFormData) => {
    try {
      if (staffModalMode === 'add') {
        const payload = {
          name: staffFormData.name,
          phone: staffFormData.phone.replace(/\s/g, ''), // Xóa khoảng trống
          email: staffFormData.email,
          role: staffFormData.role,
          shift: staffFormData.shift,
          workingHours: staffFormData.workingHours,
          salary: parseInt(staffFormData.salary.replace(/[^\d]/g, '')) || 0,
          joinDate: new Date(staffFormData.startDate).toISOString(), // Convert to ISO string
          address: staffFormData.address,
          notes: staffFormData.notes,
          avatar: staffFormData.avatar || "",
        }
        // Call API to create staff
        const response = await createStaffApi(selectedRestaurant._id, payload);

        // Add to local store (no need to refetch)
        if (response.metadata) {
          addStaff(response.metadata);
        }

        toast({
          title: "Thành công!",
          description: `Đã thêm nhân viên ${staffFormData.name}`,
          variant: "success"
        });
      } else {
        updateStaff(staffFormData._id, staffFormData);
        toast({
          title: "Cập nhật thành công!",
          description: `Đã cập nhật thông tin ${staffFormData.name}`,
          variant: "success"
        });
      }
      setShowStaffModal(false);
    } catch (error) {
      console.error('Error saving staff:', error);
      toast({
        title: "Lỗi!",
        description: error.response?.data?.message || error.message || "Không thể lưu nhân viên",
        variant: "destructive"
      });
    }
  };

  const handleToggleStatus = (staff) => {
    toggleStaffStatus(staff._id);
  };

  const handleViewDetails = (staff) => {
    setSelectedStaffForDetails(staff);
    setShowDetailsModal(true);
  };

  const handleDeleteStaff = (staff) => {
    setSelectedStaffForDelete(staff);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteStaff = () => {
    if (selectedStaffForDelete) {
      const staffName = selectedStaffForDelete.name;
      deleteStaff(selectedStaffForDelete._id);
      setSelectedStaff(prev => prev.filter(id => id !== selectedStaffForDelete._id));
      setSelectedStaffForDelete(null);
      setShowDeleteConfirm(false);
      toast({
        title: "Đã xóa!",
        description: `Đã xóa nhân viên ${staffName}`,
        variant: "success"
      });
    }
  };

  const handleSelectStaff = (staffId) => {
    setSelectedStaff(prev =>
      prev.includes(staffId)
        ? prev.filter(id => id !== staffId)
        : [...prev, staffId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStaff.length === filteredAndSortedStaff.length) {
      setSelectedStaff([]);
    } else {
      setSelectedStaff(filteredAndSortedStaff.map(staff => staff._id));
    }
  };

  const handleBulkAction = (action) => {
    if (action === 'delete' && selectedStaff.length > 0) {
      if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedStaff.length} nhân viên?`)) {
        const count = selectedStaff.length;
        bulkDeleteStaff(selectedStaff);
        setSelectedStaff([]);
        toast({
          title: "Xóa hàng loạt thành công!",
          description: `Đã xóa ${count} nhân viên`,
          variant: "success"
        });
      }
    }
  };

  const handleBulkRoleChange = (newRole) => {
    if (newRole && selectedStaff.length > 0) {
      const roleDisplay = roleOptions.find(r => r.value === newRole)?.label || newRole;
      const count = selectedStaff.length;
      bulkUpdateRole(selectedStaff, newRole, roleDisplay);
      setSelectedStaff([]);
      toast({
        title: "Cập nhật vai trò thành công!",
        description: `Đã cập nhật vai trò cho ${count} nhân viên thành ${roleDisplay}`,
        variant: "success"
      });
    }
  };

  const handleBulkStatusChange = (newStatus) => {
    if (newStatus && selectedStaff.length > 0) {
      const statusDisplay = statusOptions.find(s => s.value === newStatus)?.label || newStatus;
      const count = selectedStaff.length;
      bulkUpdateStatus(selectedStaff, newStatus, statusDisplay);
      setSelectedStaff([]);
      toast({
        title: "Cập nhật trạng thái thành công!",
        description: `Đã cập nhật trạng thái cho ${count} nhân viên thành ${statusDisplay}`,
        variant: "success"
      });
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
        pt-16 transition-all duration-300 ease-in-out
        ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'}
      `}>
        {isLoadingData ? (
          <InlineLoading message="Đang tải danh sách nhân viên..." size="lg" />
        ) : (
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
                    onClick={handleAddStaff}
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
                      <p className="text-lg font-semibold text-card-foreground">{getStaffStats().total}</p>
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
                        {getStaffStats().active}
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
                        {getStaffStats().onBreak}
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
                        {getStaffStats().averageOrders}
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
                      onChange={(e) => setSearchTerm(e.target.value)}
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
              selectedCount={selectedStaff.length}
              onClearSelection={() => setSelectedStaff([])}
              onBulkAction={handleBulkAction}
              onBulkRoleChange={handleBulkRoleChange}
              onBulkStatusChange={handleBulkStatusChange}
            />

            {/* Staff List */}
            {viewMode === 'cards' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAndSortedStaff.map((staff) => (
                  <StaffCard
                    key={staff._id}
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
                isAllSelected={selectedStaff.length === filteredAndSortedStaff.length && filteredAndSortedStaff.length > 0}
              />
            )}

            {/* Empty State */}
            {filteredAndSortedStaff.length === 0 && (
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
                    onClick={handleAddStaff}
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
        )}

        {/* Modals */}
        <StaffFormModal
          isOpen={showStaffModal}
          onClose={() => setShowStaffModal(false)}
          onSave={handleSaveStaff}
          staff={selectedStaffForForm}
          mode={staffModalMode}
        />
        <StaffDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          staff={selectedStaffForDetails}
          onEdit={handleEditStaff}
        />
        <ConfirmationDialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={confirmDeleteStaff}
          title="Xóa nhân viên"
          message={`Bạn có chắc chắn muốn xóa nhân viên "${selectedStaffForDelete?.name}"? Hành động này không thể hoàn tác.`}
          confirmText="Xóa"
          cancelText="Hủy"
          variant="danger"
          icon="Trash2"
        />
      </main>
    </div>
  );
};

export default StaffManagement;