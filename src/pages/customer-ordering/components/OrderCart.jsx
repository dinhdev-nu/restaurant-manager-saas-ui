import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { useTableStore } from '../../../stores/table.store';

const OrderCart = ({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onUpdateNote,
  onClearCart,
  orderNumber = null,
  selectedTable = null,
  onTableChange,
  onSummaryChange,
  user = null,
  customerName = '',
  onCustomerNameChange,
  customerContact = '',
  onCustomerContactChange,
}) => {
  const [discountType, setDiscountType] = useState('percent'); // 'percent' or 'amount'
  const [discountValue, setDiscountValue] = useState(0);

  // Get table options from store (fallback when tables prop not provided)
  const getTableOptions = useTableStore((state) => state.getTableOptions);
  const tableOptions = getTableOptions();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    })?.format(price);
  };

  const calculateTotal = () => {
    return cartItems?.reduce((total, item) => total + (item?.price * item?.quantity), 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateTotal();
    if (discountType === 'percent') {
      return subtotal * (discountValue / 100);
    }
    return Math.min(discountValue, subtotal); // Discount cannot exceed subtotal
  };

  const calculateTax = () => {
    const afterDiscount = calculateTotal() - calculateDiscount();
    return afterDiscount * 0.1; // 10% VAT
  };

  const calculateFinalTotal = () => {
    return calculateTotal() - calculateDiscount() + calculateTax();
  };

  // Update parent component with summary whenever values change
  useEffect(() => {
    if (onSummaryChange) {
      onSummaryChange({
        subtotal: calculateTotal(),
        discount: calculateDiscount(),
        tax: calculateTax(),
        total: calculateFinalTotal()
      });
    }
  }, [cartItems, discountType, discountValue]);

  if (cartItems?.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Icon name="ShoppingCart" size={48} className="text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          Giỏ hàng trống
        </h3>
        <p className="text-sm text-muted-foreground">
          Thêm món ăn từ thực đơn để bắt đầu đơn hàng
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Cart Header with Order Info */}
      <div className="space-y-3">
        {/* Order Number & Item Count */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Đơn hàng ({cartItems?.length} món)
            </h2>
            {orderNumber && (
              <p className="text-xs text-muted-foreground">
                Mã: <span className="font-mono font-medium text-foreground">{orderNumber}</span>
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            iconName="Trash2"
            onClick={onClearCart}
            className="text-error hover:text-error"
          >
            Xóa tất cả
          </Button>
        </div>

        {/* Table Selection */}
        {onTableChange && (
          <Select
            label="Chọn bàn"
            value={selectedTable || ''}
            onChange={(value) => onTableChange(value)}
            options={[
              { value: 'takeaway', label: '🥡 Mang đi' },
              { value: 'delivery', label: '🚚 Giao hàng' },
              ...tableOptions
            ]}
            placeholder="Chọn bàn..."
          />
        )}

      </div>

      {/* Cart Items */}
      <div className="space-y-3">
        {cartItems?.map((item) => (
          <div
            key={item?._id}
            className="bg-muted/30 rounded-lg p-3 border border-border"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-medium text-foreground text-sm">
                  {item?.name}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {formatPrice(item?.price)} x {item?.quantity}
                </p>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onUpdateQuantity(item?._id, item?.quantity - 1)}
                  disabled={item?.quantity <= 1}
                  className="w-9 h-9 sm:w-8 sm:h-8 touch-target"
                >
                  <Icon name="Minus" size={16} className="sm:w-3.5 sm:h-3.5" />
                </Button>
                <span className="w-10 sm:w-8 text-center text-sm font-medium">
                  {item?.quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onUpdateQuantity(item?._id, item?.quantity + 1)}
                  className="w-9 h-9 sm:w-8 sm:h-8 touch-target"
                >
                  <Icon name="Plus" size={16} className="sm:w-3.5 sm:h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveItem(item?._id)}
                  className="w-9 h-9 sm:w-8 sm:h-8 text-error hover:text-error ml-1 touch-target"
                >
                  <Icon name="X" size={16} className="sm:w-3.5 sm:h-3.5" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Input
                type="text"
                placeholder="Ghi chú cho món này..."
                value={item?.note || ''}
                onChange={(e) => onUpdateNote(item?._id, e?.target?.value)}
                className="text-xs"
              />
              <span className="font-semibold text-primary ml-2">
                {formatPrice(item?.price * item?.quantity)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Customer Info */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Thông tin khách hàng</label>
        {user ? (
          // Logged in user - Display info
          <div className="bg-muted/30 rounded-lg p-3 border border-border">
            <div className="flex items-center space-x-3">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.user_name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-border"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/assets/images/user_avatar.jpg';
                  }}
                />
              ) : (
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <Icon name="User" size={20} color="white" />
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{user.user_name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <Icon name="CheckCircle" size={16} className="text-success" />
            </div>
          </div>
        ) : (
          // Guest user - Input name and contact
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Nhập tên khách hàng..."
              value={customerName}
              onChange={(e) => onCustomerNameChange?.(e.target.value)}
            />
            <Input
              type="text"
              placeholder="Nhập email hoặc số điện thoại..."
              value={customerContact}
              onChange={(e) => onCustomerContactChange?.(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Order Summary */}
      <div className="border-t border-border pt-4 space-y-3">
        {/* Discount Section */}
        <div className="bg-muted/20 rounded-lg p-3 space-y-2">
          <label className="text-sm font-medium text-foreground">Giảm giá</label>
          <div className="flex space-x-2">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Nhập giảm giá"
                value={discountValue || ''}
                onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                min="0"
                max={discountType === 'percent' ? 100 : calculateTotal()}
              />
            </div>
            <Select
              value={discountType}
              onChange={(value) => {
                setDiscountType(value);
                setDiscountValue(0);
              }}
              options={[
                { value: 'percent', label: '%' },
                { value: 'amount', label: 'VNĐ' }
              ]}
              className="w-24"
            />
          </div>
          {discountValue > 0 && (
            <p className="text-xs text-success flex items-center">
              <Icon name="Tag" size={12} className="mr-1" />
              Tiết kiệm: {formatPrice(calculateDiscount())}
            </p>
          )}
        </div>

        {/* Summary Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tạm tính:</span>
            <span className="text-foreground">{formatPrice(calculateTotal())}</span>
          </div>

          {discountValue > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Giảm giá:</span>
              <span className="text-success">-{formatPrice(calculateDiscount())}</span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">VAT (10%):</span>
            <span className="text-foreground">{formatPrice(calculateTax())}</span>
          </div>

          <div className="flex justify-between text-lg font-semibold border-t border-border pt-2">
            <span className="text-foreground">Tổng cộng:</span>
            <span className="text-primary">{formatPrice(calculateFinalTotal())}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCart;