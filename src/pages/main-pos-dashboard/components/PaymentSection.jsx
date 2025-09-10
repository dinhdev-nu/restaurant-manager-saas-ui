import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';

const PaymentSection = ({ 
  totalAmount, 
  onProcessPayment,
  disabled = false 
}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');
  const [customerPaid, setCustomerPaid] = useState('');
  const [showCustomerInfo, setShowCustomerInfo] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: ''
  });

  const paymentMethods = [
    {
      id: 'cash',
      name: 'Tiền mặt',
      icon: 'Banknote',
      color: 'text-success'
    },
    {
      id: 'card',
      name: 'Thẻ tín dụng',
      icon: 'CreditCard',
      color: 'text-primary'
    },
    {
      id: 'digital',
      name: 'Ví điện tử',
      icon: 'Smartphone',
      color: 'text-accent'
    },
    {
      id: 'transfer',
      name: 'Chuyển khoản',
      icon: 'Building2',
      color: 'text-secondary'
    }
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    })?.format(price);
  };

  const calculateChange = () => {
    const paid = parseFloat(customerPaid) || 0;
    return Math.max(0, paid - totalAmount);
  };

  const handlePayment = () => {
    const paymentData = {
      method: selectedPaymentMethod,
      amount: totalAmount,
      customerPaid: parseFloat(customerPaid) || totalAmount,
      change: calculateChange(),
      customerInfo: showCustomerInfo ? customerInfo : null,
      timestamp: new Date()?.toISOString()
    };
    
    onProcessPayment(paymentData);
  };

  const isPaymentValid = () => {
    if (selectedPaymentMethod === 'cash') {
      const paid = parseFloat(customerPaid) || 0;
      return paid >= totalAmount;
    }
    return true;
  };

  return (
    <div className="space-y-4">
      {/* Payment Methods */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">
          Phương thức thanh toán
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {paymentMethods?.map((method) => (
            <Button
              key={method?.id}
              variant={selectedPaymentMethod === method?.id ? "default" : "outline"}
              onClick={() => setSelectedPaymentMethod(method?.id)}
              className="flex flex-col items-center p-3 h-auto hover-scale"
            >
              <Icon 
                name={method?.icon} 
                size={20} 
                className={selectedPaymentMethod === method?.id ? 'text-primary-foreground' : method?.color}
              />
              <span className="text-xs mt-1">{method?.name}</span>
            </Button>
          ))}
        </div>
      </div>
      {/* Cash Payment Details */}
      {selectedPaymentMethod === 'cash' && (
        <div className="space-y-3">
          <Input
            type="number"
            label="Khách trả"
            placeholder="Nhập số tiền khách trả"
            value={customerPaid}
            onChange={(e) => setCustomerPaid(e?.target?.value)}
            className="text-right"
          />
          
          {customerPaid && (
            <div className="bg-muted/30 rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tổng tiền:</span>
                <span className="font-medium">{formatPrice(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Khách trả:</span>
                <span className="font-medium">{formatPrice(parseFloat(customerPaid) || 0)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold border-t border-border pt-2">
                <span className="text-foreground">Tiền thừa:</span>
                <span className={calculateChange() >= 0 ? 'text-success' : 'text-error'}>
                  {formatPrice(calculateChange())}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Customer Information Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Thông tin khách hàng</span>
        <Button
          variant="ghost"
          size="sm"
          iconName={showCustomerInfo ? "ChevronUp" : "ChevronDown"}
          iconPosition="right"
          onClick={() => setShowCustomerInfo(!showCustomerInfo)}
        >
          {showCustomerInfo ? 'Ẩn' : 'Hiện'}
        </Button>
      </div>
      {/* Customer Information Form */}
      {showCustomerInfo && (
        <div className="space-y-3 bg-muted/20 rounded-lg p-3">
          <Input
            type="text"
            label="Tên khách hàng"
            placeholder="Nhập tên khách hàng"
            value={customerInfo?.name}
            onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e?.target?.value }))}
          />
          <Input
            type="tel"
            label="Số điện thoại"
            placeholder="Nhập số điện thoại"
            value={customerInfo?.phone}
            onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e?.target?.value }))}
          />
          <Input
            type="email"
            label="Email (tùy chọn)"
            placeholder="Nhập email"
            value={customerInfo?.email}
            onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e?.target?.value }))}
          />
        </div>
      )}
      {/* Quick Amount Buttons for Cash */}
      {selectedPaymentMethod === 'cash' && (
        <div>
          <p className="text-sm text-muted-foreground mb-2">Số tiền nhanh:</p>
          <div className="grid grid-cols-3 gap-2">
            {[50000, 100000, 200000, 500000]?.map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                onClick={() => setCustomerPaid(amount?.toString())}
                className="text-xs hover-scale"
              >
                {formatPrice(amount)}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCustomerPaid(totalAmount?.toString())}
              className="text-xs hover-scale col-span-2"
            >
              Vừa đủ
            </Button>
          </div>
        </div>
      )}
      {/* Payment Button */}
      <Button
        variant="success"
        size="lg"
        fullWidth
        iconName="CreditCard"
        iconPosition="left"
        onClick={handlePayment}
        disabled={disabled || !isPaymentValid()}
        className="hover-scale touch-target"
      >
        Thanh toán {formatPrice(totalAmount)}
      </Button>
      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          iconName="Printer"
          iconPosition="left"
          className="hover-scale"
        >
          In hóa đơn
        </Button>
        <Button
          variant="outline"
          size="sm"
          iconName="Save"
          iconPosition="left"
          className="hover-scale"
        >
          Lưu đơn
        </Button>
      </div>
    </div>
  );
};

export default PaymentSection;