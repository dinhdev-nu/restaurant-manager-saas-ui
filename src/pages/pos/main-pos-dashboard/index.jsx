import React, { useState, useEffect } from 'react';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import MenuCategory from './components/MenuCategory';
import MenuGrid from './components/MenuGrid';
import OrderCart from './components/OrderCart';
import PaymentSection from './components/PaymentSection';
import QuickActions from './components/QuickActions';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const MainPOSDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isOperational, setIsOperational] = useState(true);
  const [activeCategory, setActiveCategory] = useState('beverages');
  const [cartItems, setCartItems] = useState([]);
  const [showMobileCart, setShowMobileCart] = useState(false);

  // Mock data for categories
  const categories = [
    { id: 'beverages', name: 'Đồ uống' },
    { id: 'snacks', name: 'Đồ ăn nhẹ' },
    { id: 'main-dishes', name: 'Món chính' },
    { id: 'desserts', name: 'Tráng miệng' },
    { id: 'combo', name: 'Combo' }
  ];

  // Mock data for menu items
  const menuItems = {
    beverages: [
      {
        id: 'bev-1',
        name: 'Cà phê đen',
        description: 'Cà phê đen truyền thống',
        price: 25000,
        image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&h=200&fit=crop',
        stock: 50,
        category: 'beverages'
      },
      {
        id: 'bev-2',
        name: 'Cà phê sữa',
        description: 'Cà phê sữa đá thơm ngon',
        price: 30000,
        image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300&h=200&fit=crop',
        stock: 45,
        category: 'beverages'
      },
      {
        id: 'bev-3',
        name: 'Trà đá',
        description: 'Trà đá mát lạnh',
        price: 15000,
        image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&h=200&fit=crop',
        stock: 3,
        category: 'beverages'
      },
      {
        id: 'bev-4',
        name: 'Nước cam',
        description: 'Nước cam tươi nguyên chất',
        price: 35000,
        image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300&h=200&fit=crop',
        stock: 0,
        category: 'beverages'
      },
      {
        id: 'bev-5',
        name: 'Sinh tố bơ',
        description: 'Sinh tố bơ béo ngậy',
        price: 45000,
        image: 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=300&h=200&fit=crop',
        stock: 20,
        category: 'beverages'
      },
      {
        id: 'bev-6',
        name: 'Nước dừa',
        description: 'Nước dừa tươi mát',
        price: 25000,
        image: 'https://images.unsplash.com/photo-1520342868574-5fa3804e551c?w=300&h=200&fit=crop',
        stock: 15,
        category: 'beverages'
      }
    ],
    snacks: [
      {
        id: 'snack-1',
        name: 'Bánh mì thịt nướng',
        description: 'Bánh mì thịt nướng thơm ngon',
        price: 35000,
        image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=300&h=200&fit=crop',
        stock: 25,
        category: 'snacks'
      },
      {
        id: 'snack-2',
        name: 'Nem nướng',
        description: 'Nem nướng Nha Trang',
        price: 40000,
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop',
        stock: 18,
        category: 'snacks'
      },
      {
        id: 'snack-3',
        name: 'Chả cá',
        description: 'Chả cá Hà Nội',
        price: 50000,
        image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=300&h=200&fit=crop',
        stock: 2,
        category: 'snacks'
      },
      {
        id: 'snack-4',
        name: 'Bánh xèo',
        description: 'Bánh xèo miền Tây',
        price: 45000,
        image: 'https://images.unsplash.com/photo-1559847844-d721426d6edc?w=300&h=200&fit=crop',
        stock: 12,
        category: 'snacks'
      }
    ],
    'main-dishes': [
      {
        id: 'main-1',
        name: 'Cơm tấm sườn nướng',
        description: 'Cơm tấm sườn nướng đặc biệt',
        price: 65000,
        image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=300&h=200&fit=crop',
        stock: 30,
        category: 'main-dishes'
      },
      {
        id: 'main-2',
        name: 'Phở bò',
        description: 'Phở bò Hà Nội truyền thống',
        price: 55000,
        image: 'https://images.unsplash.com/photo-1559847844-d721426d6edc?w=300&h=200&fit=crop',
        stock: 25,
        category: 'main-dishes'
      },
      {
        id: 'main-3',
        name: 'Bún bò Huế',
        description: 'Bún bò Huế cay nồng',
        price: 60000,
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop',
        stock: 4,
        category: 'main-dishes'
      },
      {
        id: 'main-4',
        name: 'Cơm gà',
        description: 'Cơm gà Hải Nam',
        price: 50000,
        image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=300&h=200&fit=crop',
        stock: 0,
        category: 'main-dishes'
      }
    ],
    desserts: [
      {
        id: 'dessert-1',
        name: 'Chè ba màu',
        description: 'Chè ba màu truyền thống',
        price: 25000,
        image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=300&h=200&fit=crop',
        stock: 20,
        category: 'desserts'
      },
      {
        id: 'dessert-2',
        name: 'Bánh flan',
        description: 'Bánh flan caramel',
        price: 30000,
        image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=300&h=200&fit=crop',
        stock: 15,
        category: 'desserts'
      }
    ],
    combo: [
      {
        id: 'combo-1',
        name: 'Combo cơm tấm + nước',
        description: 'Cơm tấm sườn nướng + nước ngọt',
        price: 75000,
        image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=300&h=200&fit=crop',
        stock: 10,
        category: 'combo'
      },
      {
        id: 'combo-2',
        name: 'Combo phở + trà đá',
        description: 'Phở bò + trà đá',
        price: 65000,
        image: 'https://images.unsplash.com/photo-1559847844-d721426d6edc?w=300&h=200&fit=crop',
        stock: 8,
        category: 'combo'
      }
    ]
  };

  const getCurrentMenuItems = () => {
    return menuItems?.[activeCategory] || [];
  };

  const handleAddToCart = (item) => {
    if (item?.stock === 0) return;

    setCartItems(prevItems => {
      const existingItem = prevItems?.find(cartItem => cartItem?.id === item?.id);

      if (existingItem) {
        return prevItems?.map(cartItem =>
          cartItem?.id === item?.id
            ? { ...cartItem, quantity: cartItem?.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevItems, { ...item, quantity: 1, note: '' }];
      }
    });
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }

    setCartItems(prevItems =>
      prevItems?.map(item =>
        item?.id === itemId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const handleRemoveItem = (itemId) => {
    setCartItems(prevItems => prevItems?.filter(item => item?.id !== itemId));
  };

  const handleUpdateNote = (itemId, note) => {
    setCartItems(prevItems =>
      prevItems?.map(item =>
        item?.id === itemId
          ? { ...item, note }
          : item
      )
    );
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleProcessPayment = (paymentData) => {
    console.log('Processing payment:', paymentData);
    // Simulate payment processing
    setTimeout(() => {
      alert(`Thanh toán thành công!\nPhương thức: ${paymentData?.method}\nTổng tiền: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })?.format(paymentData?.amount)}`);
      setCartItems([]);
      setShowMobileCart(false);
    }, 1000);
  };

  const handleBarcodeSearch = (barcode) => {
    console.log('Searching for barcode:', barcode);
    // Mock barcode search - find item by ID
    const allItems = Object.values(menuItems)?.flat();
    const foundItem = allItems?.find(item => item?.id?.includes(barcode));
    if (foundItem) {
      handleAddToCart(foundItem);
    } else {
      alert('Không tìm thấy sản phẩm với mã vạch này');
    }
  };

  const handleCustomerSearch = (query) => {
    console.log('Searching for customer:', query);
    // Mock customer search
    alert(`Tìm kiếm khách hàng: ${query}`);
  };

  const handleQuickAdd = (item) => {
    handleAddToCart(item);
  };

  const calculateTotal = () => {
    const subtotal = cartItems?.reduce((total, item) => total + (item?.price * item?.quantity), 0);
    const tax = subtotal * 0.1;
    return subtotal + tax;
  };

  const getTotalItems = () => {
    return cartItems?.reduce((total, item) => total + item?.quantity, 0);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        storeName="POS Manager"
        isOperational={isOperational}
        onToggleOperational={() => setIsOperational(!isOperational)}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        userProfile={{ name: "Nguyễn Văn A", role: "owner" }}
      />
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        userRole="owner"
        className="hidden lg:block"
      />
      {/* Mobile Sidebar */}
      <Sidebar
        isCollapsed={!sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        userRole="owner"
        className="lg:hidden"
      />
      <main className={`
        pt-16 lg:pt-20 transition-all duration-300 ease-smooth
        ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'}
      `}>
        <div className="h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)] flex flex-col lg:flex-row">
          {/* Left Panel - Menu */}
          <div className={`
            flex-1 bg-surface border-r border-border overflow-hidden
            ${showMobileCart ? 'hidden lg:flex' : 'flex'}
            flex-col
          `}>
            <div className="p-4 border-b border-border">
              <h1 className="text-xl font-semibold text-foreground mb-4">
                Thực đơn
              </h1>

              <QuickActions
                onBarcodeSearch={handleBarcodeSearch}
                onCustomerSearch={handleCustomerSearch}
                onQuickAdd={handleQuickAdd}
              />

              <MenuCategory
                categories={categories}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <MenuGrid
                menuItems={getCurrentMenuItems()}
                onAddToCart={handleAddToCart}
              />
            </div>
          </div>

          {/* Right Panel - Order Cart */}
          <div className={`
            w-full lg:w-96 bg-surface border-l border-border
            ${showMobileCart ? 'flex' : 'hidden lg:flex'}
            flex-col
          `}>
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Đơn hàng
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMobileCart(false)}
                className="lg:hidden"
              >
                <Icon name="X" size={20} />
              </Button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto p-4">
                <OrderCart
                  cartItems={cartItems}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemoveItem={handleRemoveItem}
                  onUpdateNote={handleUpdateNote}
                  onClearCart={handleClearCart}
                />
              </div>

              {cartItems?.length > 0 && (
                <div className="border-t border-border p-4">
                  <PaymentSection
                    totalAmount={calculateTotal()}
                    onProcessPayment={handleProcessPayment}
                    disabled={cartItems?.length === 0}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Cart Toggle Button */}
        <div className="lg:hidden fixed bottom-4 right-4 z-1000">
          <Button
            variant="default"
            size="lg"
            onClick={() => setShowMobileCart(true)}
            className="rounded-full shadow-modal hover-scale relative"
          >
            <Icon name="ShoppingCart" size={24} className="mr-2" />
            <span>Giỏ hàng ({getTotalItems()})</span>
            {cartItems?.length > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-error text-error-foreground text-xs rounded-full flex items-center justify-center">
                {getTotalItems()}
              </span>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default MainPOSDashboard;