import React from 'react';
import Button from '../../../../components/ui/Button';
import Icon from '../../../../components/AppIcon';
import Input from '../../../../components/ui/Input';

const OrderCart = ({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onUpdateNote,
  onClearCart
}) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    })?.format(price);
  };

  const calculateTotal = () => {
    return cartItems?.reduce((total, item) => total + (item?.price * item?.quantity), 0);
  };

  const calculateTax = () => {
    return calculateTotal() * 0.1; // 10% VAT
  };

  const calculateFinalTotal = () => {
    return calculateTotal() + calculateTax();
  };

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
    <div className="flex flex-col h-full">
      {/* Cart Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">
          Đơn hàng ({cartItems?.length} món)
        </h2>
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
      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {cartItems?.map((item) => (
          <div
            key={item?.id}
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
                  onClick={() => onUpdateQuantity(item?.id, item?.quantity - 1)}
                  disabled={item?.quantity <= 1}
                  className="w-8 h-8"
                >
                  <Icon name="Minus" size={14} />
                </Button>
                <span className="w-8 text-center text-sm font-medium">
                  {item?.quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onUpdateQuantity(item?.id, item?.quantity + 1)}
                  className="w-8 h-8"
                >
                  <Icon name="Plus" size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveItem(item?.id)}
                  className="w-8 h-8 text-error hover:text-error ml-2"
                >
                  <Icon name="X" size={14} />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Input
                type="text"
                placeholder="Ghi chú đặc biệt..."
                value={item?.note || ''}
                onChange={(e) => onUpdateNote(item?.id, e?.target?.value)}
                className="text-xs"
              />
              <span className="font-semibold text-primary ml-2">
                {formatPrice(item?.price * item?.quantity)}
              </span>
            </div>
          </div>
        ))}
      </div>
      {/* Order Summary */}
      <div className="border-t border-border pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tạm tính:</span>
          <span className="text-foreground">{formatPrice(calculateTotal())}</span>
        </div>
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
  );
};

export default OrderCart;