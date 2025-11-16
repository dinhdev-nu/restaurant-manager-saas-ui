import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { useToast } from '../../../hooks/use-toast';
import { useMenuStore } from '../../../stores/menu.store';
import ConfirmationDialog from '../../../components/ui/ConfirmationDialog';

// Import components
import MenuItemCard from './components/MenuItemCard';
import MenuItemModal from './components/MenuItemModal';
import MenuTable from './components/MenuTable';
import BulkActionsBar from './components/BulkActionsBar';
import CategoryFilter from './components/CategoryFilter';
import MenuStats from './components/MenuStats';

const MenuManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isOperational, setIsOperational] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  // Modal states
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('Utensils');

  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Selection states
  const [selectedItems, setSelectedItems] = useState([]);

  // Menu Store
  const {
    categories,
    menuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleMenuItemAvailability,
    bulkDeleteMenuItems,
    bulkToggleAvailability,
    bulkUpdateCategory,
    getAllCategoryItemCounts,
    addCategory
  } = useMenuStore();

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showItemModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showItemModal]);

  // Filter and sort items
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    if (sortBy === 'price') {
      aValue = parseFloat(aValue);
      bValue = parseFloat(bValue);
    } else if (sortBy === 'updated_at') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    } else {
      aValue = aValue.toString().toLowerCase();
      bValue = bValue.toString().toLowerCase();
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Calculate category counts
  const categoryItemCounts = getAllCategoryItemCounts();

  // Sort options
  const sortOptions = [
    { value: 'name', label: 'Tên món' },
    { value: 'price', label: 'Giá' },
    { value: 'category', label: 'Danh mục' },
    { value: 'updated_at', label: 'Cập nhật' },
    { value: 'status', label: 'Trạng thái' }
  ];

  const sortOrderOptions = [
    { value: 'asc', label: 'Tăng dần' },
    { value: 'desc', label: 'Giảm dần' }
  ];

  // Handlers
  const handleAddItem = () => {
    setEditingItem(null);
    setShowItemModal(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setShowItemModal(true);
  };

  const handleSaveItem = (itemData) => {
    try {
      if (editingItem) {
        // Update existing item
        updateMenuItem(editingItem.id, itemData);
        toast({
          title: "Cập nhật thành công",
          description: `Món "${itemData.name}" đã được cập nhật`,
          variant: "success"
        });
      } else {
        // Add new item
        addMenuItem(itemData);
        toast({
          title: "Thêm món thành công",
          description: `Món "${itemData.name}" đã được thêm vào thực đơn`,
          variant: "success"
        });
      }
      setShowItemModal(false);
      setEditingItem(null);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteItem = (itemId) => {
    setItemToDelete(itemId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteItem = () => {
    try {
      deleteMenuItem(itemToDelete);
      setSelectedItems(prev => prev.filter(id => id !== itemToDelete));
      toast({
        title: "Xóa thành công",
        description: "Món ăn đã được xóa khỏi thực đơn",
        variant: "success"
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setItemToDelete(null);
    }
  };

  const handleToggleAvailability = (itemId, currentStatus) => {
    try {
      toggleMenuItemAvailability(itemId);
      const newStatus = currentStatus === 'available' ? 'unavailable' : 'available';
      toast({
        title: "Cập nhật trạng thái",
        description: `Món ăn đã chuyển sang ${newStatus === 'available' ? 'có sẵn' : 'không có sẵn'}`,
        variant: "success"
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSelectItem = (itemId, selected) => {
    if (selected) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  };

  const handleSelectAll = (selected) => {
    if (selected) {
      setSelectedItems(filteredItems.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleBulkDelete = () => {
    setShowBulkDeleteDialog(true);
  };

  const confirmBulkDelete = () => {
    try {
      bulkDeleteMenuItems(selectedItems);
      toast({
        title: "Xóa thành công",
        description: `Đã xóa ${selectedItems.length} món ăn`,
        variant: "success"
      });
      setSelectedItems([]);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleBulkToggleAvailability = () => {
    try {
      const selectedItemsData = menuItems.filter(item => selectedItems.includes(item.id));
      const allAvailable = selectedItemsData.every(item => item.status === 'available');
      const newStatus = allAvailable ? 'unavailable' : 'available';

      bulkToggleAvailability(selectedItems, newStatus);
      toast({
        title: "Cập nhật thành công",
        description: `Đã cập nhật trạng thái ${selectedItems.length} món ăn`,
        variant: "success"
      });
      setSelectedItems([]);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleAddCategory = () => {
    setShowCategoryModal(true);
  };

  const handleSaveCategory = () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Lỗi",
        description: "Tên danh mục không được để trống",
        variant: "destructive"
      });
      return;
    }

    try {
      addCategory({
        name: newCategoryName.trim(),
        icon: categoryIcon
      });
      toast({
        title: "Thêm danh mục thành công",
        description: `Danh mục "${newCategoryName}" đã được thêm`,
        variant: "success"
      });
      setShowCategoryModal(false);
      setNewCategoryName('');
      setCategoryIcon('Utensils');
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive"
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
        userProfile={{ name: "Quản lý", role: "manager" }}
      />
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        userRole="owner"
      />
      <main className={`
        pt-16 transition-all duration-300 ease-smooth
        ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-60'}
      `}>
        <div className="p-6 max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Quản lý thực đơn</h1>
                <p className="text-muted-foreground">
                  Quản lý món ăn, giá cả và tình trạng kho hàng
                </p>
              </div>

              <div className="flex items-center space-x-3">
                {/* View mode toggle */}
                <div className="flex items-center bg-muted rounded-lg p-1">
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    iconName="Table"
                    className="px-3"
                  >
                    Bảng
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    iconName="Grid3X3"
                    className="px-3"
                  >
                    Lưới
                  </Button>
                </div>

                <Button
                  variant="default"
                  onClick={handleAddItem}
                  iconName="Plus"
                  iconPosition="left"
                  className="hover-scale"
                >
                  Thêm món mới
                </Button>
              </div>
            </div>

            {/* Stats */}
            <MenuStats items={menuItems} />
          </div>

          {/* Filters and Search */}
          <div className="bg-card border border-border rounded-lg p-6 mb-6">
            <div className="space-y-4">
              {/* Search and Sort */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <Input
                    type="search"
                    placeholder="Tìm kiếm món ăn..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e?.target?.value)}
                    className="w-full"
                  />
                </div>

                <Select
                  placeholder="Sắp xếp theo"
                  options={sortOptions}
                  value={sortBy}
                  onChange={setSortBy}
                />

                <Select
                  placeholder="Thứ tự"
                  options={sortOrderOptions}
                  value={sortOrder}
                  onChange={setSortOrder}
                />
              </div>

              {/* Category Filter */}
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                itemCounts={categoryItemCounts}
                onAddCategory={handleAddCategory}
              />
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Hiển thị {filteredItems.length} trong tổng số {menuItems.length} món ăn
              {selectedItems.length > 0 && (
                <span className="ml-2 text-primary">
                  • Đã chọn {selectedItems.length} món
                </span>
              )}
            </p>

            {filteredItems.length > 0 && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Icon name="Filter" size={16} />
                <span>
                  {selectedCategory !== 'all' && `Danh mục: ${categories.find(c => c.id === selectedCategory)?.name}`}
                  {searchQuery && ` • Tìm kiếm: "${searchQuery}"`}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          {viewMode === 'table' ? (
            <MenuTable
              items={filteredItems}
              selectedItems={selectedItems}
              onSelectItem={handleSelectItem}
              onSelectAll={handleSelectAll}
              onEdit={handleEditItem}
              onDelete={handleDeleteItem}
              onToggleAvailability={handleToggleAvailability}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map(item => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  onEdit={handleEditItem}
                  onDelete={handleDeleteItem}
                  onToggleAvailability={handleToggleAvailability}
                  isSelected={selectedItems.includes(item.id)}
                  onSelect={handleSelectItem}
                />
              ))}

              {filteredItems.length === 0 && (
                <div className="col-span-full p-12 text-center">
                  <Icon name="Search" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Không tìm thấy món ăn nào
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                  >
                    Xóa bộ lọc
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Bulk Actions Bar */}
          <BulkActionsBar
            selectedCount={selectedItems.length}
            onClearSelection={() => setSelectedItems([])}
            onBulkDelete={handleBulkDelete}
            onBulkToggleAvailability={handleBulkToggleAvailability}
            onBulkUpdateCategory={(categoryId) => {
              try {
                bulkUpdateCategory(selectedItems, categoryId);
                toast({
                  title: "Cập nhật thành công",
                  description: `Đã cập nhật danh mục cho ${selectedItems.length} món ăn`,
                  variant: "success"
                });
                setSelectedItems([]);
              } catch (error) {
                toast({
                  title: "Lỗi",
                  description: error.message,
                  variant: "destructive"
                });
              }
            }}
            categories={categories}
          />

          {/* Item Modal */}
          <MenuItemModal
            isOpen={showItemModal}
            onClose={() => {
              setShowItemModal(false);
              setEditingItem(null);
            }}
            onSave={handleSaveItem}
            item={editingItem}
            categories={categories}
          />

          {/* Delete Confirmation Dialog */}
          <ConfirmationDialog
            isOpen={showDeleteDialog}
            onClose={() => {
              setShowDeleteDialog(false);
              setItemToDelete(null);
            }}
            onConfirm={confirmDeleteItem}
            title="Xóa món ăn"
            message={
              itemToDelete
                ? `Bạn có chắc chắn muốn xóa món "${menuItems.find(item => item.id === itemToDelete)?.name}"? Hành động này không thể hoàn tác.`
                : "Bạn có chắc chắn muốn xóa món ăn này?"
            }
            confirmText="Xóa"
            cancelText="Hủy"
            variant="danger"
            icon="Trash2"
          />

          {/* Bulk Delete Confirmation Dialog */}
          <ConfirmationDialog
            isOpen={showBulkDeleteDialog}
            onClose={() => setShowBulkDeleteDialog(false)}
            onConfirm={confirmBulkDelete}
            title="Xóa nhiều món ăn"
            message={`Bạn có chắc chắn muốn xóa ${selectedItems.length} món ăn đã chọn? Hành động này không thể hoàn tác.`}
            confirmText="Xóa tất cả"
            cancelText="Hủy"
            variant="danger"
            icon="Trash2"
          />

          {/* Add Category Modal */}
          {showCategoryModal && (
            <div className="fixed inset-0 z-1300 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowCategoryModal(false)} />
              <div className="relative bg-white dark:bg-surface border border-border rounded-lg shadow-modal w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <h2 className="text-lg font-semibold text-foreground">Thêm danh mục mới</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowCategoryModal(false)}
                  >
                    <Icon name="X" size={20} />
                  </Button>
                </div>
                <div className="p-6 space-y-4">
                  <Input
                    label="Tên danh mục"
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nhập tên danh mục"
                    required
                  />
                  <Select
                    label="Biểu tượng"
                    options={[
                      { value: 'Coffee', label: 'Coffee - Đồ uống' },
                      { value: 'Soup', label: 'Soup - Khai vị' },
                      { value: 'UtensilsCrossed', label: 'UtensilsCrossed - Món chính' },
                      { value: 'IceCream', label: 'IceCream - Tráng miệng' },
                      { value: 'Cookie', label: 'Cookie - Đồ ăn vặt' },
                      { value: 'Pizza', label: 'Pizza' },
                      { value: 'Salad', label: 'Salad' },
                      { value: 'Wine', label: 'Wine - Rượu' },
                      { value: 'Utensils', label: 'Utensils - Tổng quát' }
                    ]}
                    value={categoryIcon}
                    onChange={setCategoryIcon}
                    placeholder="Chọn biểu tượng"
                  />
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <Icon name={categoryIcon} size={20} className="text-primary" />
                    <span className="text-sm text-muted-foreground">Xem trước biểu tượng</span>
                  </div>
                </div>
                <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCategoryModal(false);
                      setNewCategoryName('');
                      setCategoryIcon('Utensils');
                    }}
                  >
                    Hủy
                  </Button>
                  <Button
                    variant="default"
                    onClick={handleSaveCategory}
                    iconName="Plus"
                    iconPosition="left"
                  >
                    Thêm danh mục
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MenuManagement;