import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

// Import components
import MenuItemCard from './components/MenuItemCard';
import MenuItemModal from './components/MenuItemModal';
import MenuTable from './components/MenuTable';
import BulkActionsBar from './components/BulkActionsBar';
import CategoryFilter from './components/CategoryFilter';
import MenuStats from './components/MenuStats';

const MenuManagement = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isOperational, setIsOperational] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  // Modal states
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Selection states
  const [selectedItems, setSelectedItems] = useState([]);

  // Mock data
  const [categories] = useState([
    { id: 'beverages', name: 'Đồ uống', icon: 'Coffee' },
    { id: 'appetizers', name: 'Khai vị', icon: 'Soup' },
    { id: 'main_dishes', name: 'Món chính', icon: 'UtensilsCrossed' },
    { id: 'desserts', name: 'Tráng miệng', icon: 'IceCream' },
    { id: 'snacks', name: 'Đồ ăn vặt', icon: 'Cookie' }
  ]);

  const [menuItems, setMenuItems] = useState([
    {
      id: 1,
      name: "Phở bò tái",
      description: "Phở bò truyền thống với thịt bò tái, hành lá và rau thơm",
      price: 65000,
      category: "main_dishes",
      image: "https://images.unsplash.com/photo-1559847844-d721426d6edc?w=300",
      status: "available",
      stock_quantity: 50,
      unit: "tô",
      updated_at: "2025-09-02T10:30:00Z"
    },
    {
      id: 2,
      name: "Cà phê sữa đá",
      description: "Cà phê phin truyền thống pha với sữa đặc và đá",
      price: 25000,
      category: "beverages",
      image: "https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?w=300",
      status: "available",
      stock_quantity: 100,
      unit: "ly",
      updated_at: "2025-09-02T09:15:00Z"
    },
    {
      id: 3,
      name: "Bánh mì thịt nướng",
      description: "Bánh mì giòn với thịt nướng, pate, rau cải và gia vị",
      price: 35000,
      category: "snacks",
      image: "https://images.pixabay.com/photo/2020/04/04/15/07/banh-mi-5002067_640.jpg",
      status: "low_stock",
      stock_quantity: 5,
      unit: "ổ",
      updated_at: "2025-09-02T08:45:00Z"
    },
    {
      id: 4,
      name: "Gỏi cuốn tôm thịt",
      description: "Gỏi cuốn tươi với tôm, thịt heo, bún và rau sống",
      price: 45000,
      category: "appetizers",
      image: "https://images.unsplash.com/photo-1559847844-d721426d6edc?w=300",
      status: "available",
      stock_quantity: 30,
      unit: "đĩa",
      updated_at: "2025-09-02T11:20:00Z"
    },
    {
      id: 5,
      name: "Chè ba màu",
      description: "Chè truyền thống với đậu xanh, đậu đỏ và thạch",
      price: 20000,
      category: "desserts",
      image: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?w=300",
      status: "unavailable",
      stock_quantity: 0,
      unit: "ly",
      updated_at: "2025-09-01T16:30:00Z"
    },
    {
      id: 6,
      name: "Trà đá chanh",
      description: "Trà đá tươi mát với chanh tươi và đường",
      price: 15000,
      category: "beverages",
      image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300",
      status: "available",
      stock_quantity: 80,
      unit: "ly",
      updated_at: "2025-09-02T12:00:00Z"
    }
  ]);

  // Filter and sort items
  const filteredItems = menuItems?.filter(item => {
    const matchesSearch = item?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      item?.description?.toLowerCase()?.includes(searchQuery?.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item?.category === selectedCategory;
    return matchesSearch && matchesCategory;
  })?.sort((a, b) => {
    let aValue = a?.[sortBy];
    let bValue = b?.[sortBy];

    if (sortBy === 'price') {
      aValue = parseFloat(aValue);
      bValue = parseFloat(bValue);
    } else if (sortBy === 'updated_at') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    } else {
      aValue = aValue?.toString()?.toLowerCase();
      bValue = bValue?.toString()?.toLowerCase();
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Calculate category counts
  const categoryItemCounts = categories?.reduce((counts, category) => {
    counts[category.id] = menuItems?.filter(item => item?.category === category?.id)?.length;
    return counts;
  }, {});

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
    if (editingItem) {
      // Update existing item
      setMenuItems(prev => prev?.map(item =>
        item?.id === editingItem?.id ? { ...itemData, id: editingItem?.id } : item
      ));
    } else {
      // Add new item
      setMenuItems(prev => [...prev, { ...itemData, id: Date.now() }]);
    }
    setShowItemModal(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (itemId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa món ăn này?')) {
      setMenuItems(prev => prev?.filter(item => item?.id !== itemId));
      setSelectedItems(prev => prev?.filter(id => id !== itemId));
    }
  };

  const handleToggleAvailability = (itemId, currentStatus) => {
    const newStatus = currentStatus === 'available' ? 'unavailable' : 'available';
    setMenuItems(prev => prev?.map(item =>
      item?.id === itemId
        ? { ...item, status: newStatus, updated_at: new Date()?.toISOString() }
        : item
    ));
  };

  const handleSelectItem = (itemId, selected) => {
    if (selected) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => prev?.filter(id => id !== itemId));
    }
  };

  const handleSelectAll = (selected) => {
    if (selected) {
      setSelectedItems(filteredItems?.map(item => item?.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedItems?.length} món ăn đã chọn?`)) {
      setMenuItems(prev => prev?.filter(item => !selectedItems?.includes(item?.id)));
      setSelectedItems([]);
    }
  };

  const handleBulkToggleAvailability = () => {
    const selectedItemsData = menuItems?.filter(item => selectedItems?.includes(item?.id));
    const allAvailable = selectedItemsData?.every(item => item?.status === 'available');
    const newStatus = allAvailable ? 'unavailable' : 'available';

    setMenuItems(prev => prev?.map(item =>
      selectedItems?.includes(item?.id)
        ? { ...item, status: newStatus, updated_at: new Date()?.toISOString() }
        : item
    ));
    setSelectedItems([]);
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
        userRole="manager"
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
              />
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Hiển thị {filteredItems?.length} trong tổng số {menuItems?.length} món ăn
              {selectedItems?.length > 0 && (
                <span className="ml-2 text-primary">
                  • Đã chọn {selectedItems?.length} món
                </span>
              )}
            </p>

            {filteredItems?.length > 0 && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Icon name="Filter" size={16} />
                <span>
                  {selectedCategory !== 'all' && `Danh mục: ${categories?.find(c => c?.id === selectedCategory)?.name}`}
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
              {filteredItems?.map(item => (
                <MenuItemCard
                  key={item?.id}
                  item={item}
                  onEdit={handleEditItem}
                  onDelete={handleDeleteItem}
                  onToggleAvailability={handleToggleAvailability}
                  isSelected={selectedItems?.includes(item?.id)}
                  onSelect={handleSelectItem}
                />
              ))}

              {filteredItems?.length === 0 && (
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
            selectedCount={selectedItems?.length}
            onClearSelection={() => setSelectedItems([])}
            onBulkDelete={handleBulkDelete}
            onBulkToggleAvailability={handleBulkToggleAvailability}
            onBulkUpdateCategory={() => { }}
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
        </div>
      </main>
    </div>
  );
};

export default MenuManagement;