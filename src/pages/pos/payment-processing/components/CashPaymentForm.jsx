import React, { useState, useEffect } from 'react';
import Icon from '../../../../components/AppIcon';
import Input from '../../../../components/ui/Input';
import Button from '../../../../components/ui/Button';

const CashPaymentForm = ({
  totalAmount = 0,
  onPaymentComplete,
  onCancel
}) => {
  const [amountTendered, setAmountTendered] = useState('');
  const [change, setChange] = useState(0);
  const [error, setError] = useState('');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    })?.format(amount);
  };

  const quickAmounts = [
    totalAmount,
    Math.ceil(totalAmount / 50000) * 50000,
    Math.ceil(totalAmount / 100000) * 100000,
    Math.ceil(totalAmount / 200000) * 200000,
    Math.ceil(totalAmount / 500000) * 500000
  ]?.filter((amount, index, arr) => arr?.indexOf(amount) === index && amount >= totalAmount);

  useEffect(() => {
    const tendered = parseFloat(amountTendered?.replace(/[^\d]/g, '')) || 0;
    if (tendered >= totalAmount) {
      setChange(tendered - totalAmount);
      setError('');
    } else if (tendered > 0) {
      setChange(0);
      setError('Số tiền nhận không đủ');
    } else {
      setChange(0);
      setError('');
    }
  }, [amountTendered, totalAmount]);

  const handleAmountChange = (value) => {
    const numericValue = value?.replace(/[^\d]/g, '');
    setAmountTendered(numericValue);
  };

  const handleQuickAmount = (amount) => {
    setAmountTendered(amount?.toString());
  };

  const handlePayment = () => {
    const tendered = parseFloat(amountTendered?.replace(/[^\d]/g, '')) || 0;
    if (tendered < totalAmount) {
      setError('Số tiền nhận không đủ');
      return;
    }

    onPaymentComplete({
      method: 'cash',
      amountTendered: tendered,
      change: change,
      totalAmount: totalAmount
    });
  };

  const displayAmount = amountTendered ? formatCurrency(parseFloat(amountTendered?.replace(/[^\d]/g, ''))) : '';

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Thanh toán tiền mặt
        </h3>
        <p className="text-2xl font-bold text-primary">
          {formatCurrency(totalAmount)}
        </p>
      </div>
      {/* Amount Input */}
      <div className="space-y-4">
        <Input
          label="Số tiền khách đưa"
          type="text"
          value={displayAmount}
          onChange={(e) => handleAmountChange(e?.target?.value)}
          placeholder="Nhập số tiền..."
          error={error}
          className="text-lg text-center"
        />

        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {quickAmounts?.slice(0, 6)?.map((amount, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleQuickAmount(amount)}
              className="hover-scale"
            >
              {formatCurrency(amount)}
            </Button>
          ))}
        </div>
      </div>
      {/* Change Display */}
      {change > 0 && (
        <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon name="ArrowLeftRight" size={20} className="text-success" />
              <span className="font-medium text-success">Tiền thối:</span>
            </div>
            <span className="text-xl font-bold text-success">
              {formatCurrency(change)}
            </span>
          </div>
        </div>
      )}
      {/* Payment Summary */}
      <div className="p-4 bg-muted/30 rounded-lg space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tổng tiền:</span>
          <span className="font-medium text-foreground">{formatCurrency(totalAmount)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tiền nhận:</span>
          <span className="font-medium text-foreground">
            {amountTendered ? formatCurrency(parseFloat(amountTendered?.replace(/[^\d]/g, ''))) : '0 ₫'}
          </span>
        </div>
        <div className="flex justify-between text-sm pt-2 border-t border-border">
          <span className="text-muted-foreground">Tiền thối:</span>
          <span className="font-medium text-success">{formatCurrency(change)}</span>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Hủy
        </Button>
        <Button
          variant="success"
          onClick={handlePayment}
          disabled={!amountTendered || parseFloat(amountTendered?.replace(/[^\d]/g, '')) < totalAmount}
          className="flex-1"
          iconName="Check"
          iconPosition="left"
        >
          Hoàn tất thanh toán
        </Button>
      </div>
    </div>
  );
};

export default CashPaymentForm;