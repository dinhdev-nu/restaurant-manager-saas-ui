import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const QuickActions = ({ 
  onBarcodeSearch, 
  onCustomerSearch,
  onQuickAdd 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);

  const handleSearch = (e) => {
    e?.preventDefault();
    if (searchQuery?.trim()) {
      // Check if it's a barcode (numbers only)
      if (/^\d+$/?.test(searchQuery?.trim())) {
        onBarcodeSearch(searchQuery?.trim());
      } else {
        onCustomerSearch(searchQuery?.trim());
      }
      setSearchQuery('');
    }
  };

  const quickAddItems = [
    { id: 'water', name: 'Nước suối', price: 10000, icon: 'Droplets' },
    { id: 'tissue', name: 'Khăn giấy', price: 5000, icon: 'Package' },
    { id: 'bag', name: 'Túi nilon', price: 2000, icon: 'ShoppingBag' }
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    })?.format(price);
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex space-x-2">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Tìm món ăn hoặc mã vạch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e?.target?.value)}
            className="w-full"
          />
        </div>
        <Button
          type="submit"
          variant="outline"
          size="icon"
          className="hover-scale"
        >
          <Icon name="Search" size={20} />
        </Button>
      </form>
      {/* Quick Action Buttons */}
      <div className="flex space-x-2 overflow-x-auto">
        <Button
          variant="outline"
          size="sm"
          iconName="QrCode"
          iconPosition="left"
          onClick={() => setShowBarcodeScanner(!showBarcodeScanner)}
          className="whitespace-nowrap hover-scale"
        >
          Quét mã
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          iconName="UserPlus"
          iconPosition="left"
          className="whitespace-nowrap hover-scale"
        >
          Khách hàng
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          iconName="Clock"
          iconPosition="left"
          className="whitespace-nowrap hover-scale"
        >
          Đơn gần đây
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          iconName="Star"
          iconPosition="left"
          className="whitespace-nowrap hover-scale"
        >
          Yêu thích
        </Button>
      </div>
      {/* Barcode Scanner Simulation */}
      {showBarcodeScanner && (
        <div className="bg-muted/30 rounded-lg p-4 border border-border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-foreground">Quét mã vạch</h4>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowBarcodeScanner(false)}
            >
              <Icon name="X" size={16} />
            </Button>
          </div>
          
          <div className="bg-surface rounded-lg p-6 text-center border-2 border-dashed border-border">
            <Icon name="QrCode" size={48} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-2">
              Đưa mã vạch vào khung hình
            </p>
            <p className="text-xs text-muted-foreground">
              Hoặc nhập mã vạch vào ô tìm kiếm
            </p>
          </div>
        </div>
      )}
      {/* Quick Add Items */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-2">Thêm nhanh</h4>
        <div className="grid grid-cols-3 gap-2">
          {quickAddItems?.map((item) => (
            <Button
              key={item?.id}
              variant="outline"
              size="sm"
              onClick={() => onQuickAdd(item)}
              className="flex flex-col items-center p-2 h-auto hover-scale"
            >
              <Icon name={item?.icon} size={16} className="mb-1" />
              <span className="text-xs text-center">{item?.name}</span>
              <span className="text-xs text-primary font-medium">
                {formatPrice(item?.price)}
              </span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickActions;