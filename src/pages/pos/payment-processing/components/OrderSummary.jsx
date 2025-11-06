import React from 'react';
import Icon from '../../../../components/AppIcon';

const OrderSummary = ({
  orderItems = [],
  subtotal = 0,
  tax = 0,
  discount = 0,
  total = 0,
  orderNumber = "#001",
  tableNumber = null
}) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    })?.format(amount);
  };

  const mockOrderItems = orderItems?.length > 0 ? orderItems : [
    {
      id: 1,
      name: "Phở bò tái",
      quantity: 2,
      price: 85000,
      total: 170000,
      notes: "Ít hành"
    },
    {
      id: 2,
      name: "Cà phê sữa đá",
      quantity: 1,
      price: 25000,
      total: 25000,
      notes: ""
    },
    {
      id: 3,
      name: "Bánh mì thịt nướng",
      quantity: 3,
      price: 30000,
      total: 90000,
      notes: "Không rau thơm"
    }
  ];

  const calculatedSubtotal = subtotal || mockOrderItems?.reduce((sum, item) => sum + item?.total, 0);
  const calculatedTax = tax || Math.round(calculatedSubtotal * 0.1);
  const calculatedDiscount = discount || 0;
  const calculatedTotal = total || (calculatedSubtotal + calculatedTax - calculatedDiscount);

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Chi tiết đơn hàng</h3>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <span>Đơn hàng: {orderNumber}</span>
          {tableNumber && (
            <>
              <span>•</span>
              <span>Bàn: {tableNumber}</span>
            </>
          )}
        </div>
      </div>
      {/* Order Items */}
      <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
        {mockOrderItems?.map((item) => (
          <div key={item?.id} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-foreground">{item?.name}</span>
                <span className="text-sm text-muted-foreground">x{item?.quantity}</span>
              </div>
              {item?.notes && (
                <p className="text-xs text-muted-foreground mt-1 italic">
                  Ghi chú: {item?.notes}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="font-medium text-foreground">{formatCurrency(item?.total)}</p>
              <p className="text-xs text-muted-foreground">{formatCurrency(item?.price)}/món</p>
            </div>
          </div>
        ))}
      </div>
      {/* Order Summary */}
      <div className="space-y-3 pt-4 border-t border-border">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tạm tính:</span>
          <span className="text-foreground">{formatCurrency(calculatedSubtotal)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Thuế VAT (10%):</span>
          <span className="text-foreground">{formatCurrency(calculatedTax)}</span>
        </div>

        {calculatedDiscount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Giảm giá:</span>
            <span className="text-success">-{formatCurrency(calculatedDiscount)}</span>
          </div>
        )}

        <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border">
          <span className="text-foreground">Tổng cộng:</span>
          <span className="text-primary">{formatCurrency(calculatedTotal)}</span>
        </div>
      </div>
      {/* Order Info */}
      <div className="mt-6 p-3 bg-muted/30 rounded-lg">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Icon name="Clock" size={16} />
          <span>Thời gian: {new Date()?.toLocaleString('vi-VN')}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;