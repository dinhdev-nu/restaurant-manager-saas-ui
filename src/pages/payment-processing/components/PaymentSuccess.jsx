import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PaymentSuccess = ({ 
  paymentData = {},
  onPrintReceipt,
  onSendDigitalReceipt,
  onNewOrder,
  onBackToDashboard
}) => {
  const [printing, setPrinting] = useState(false);
  const [sending, setSending] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    })?.format(amount);
  };

  const mockPaymentData = {
    transactionId: paymentData?.transactionId || 'TXN202509021442001',
    method: paymentData?.method || 'cash',
    totalAmount: paymentData?.totalAmount || 285000,
    amountTendered: paymentData?.amountTendered || 300000,
    change: paymentData?.change || 15000,
    timestamp: paymentData?.timestamp || new Date()?.toISOString(),
    orderNumber: paymentData?.orderNumber || '#001',
    tableNumber: paymentData?.tableNumber || '5',
    customerInfo: paymentData?.customerInfo || {
      name: 'Nguyễn Văn An',
      phone: '0901 234 567',
      email: 'an@email.com'
    }
  };

  const getPaymentMethodDisplay = (method) => {
    const methods = {
      cash: { name: 'Tiền mặt', icon: 'Banknote', color: 'text-green-600' },
      card: { name: 'Thẻ tín dụng', icon: 'CreditCard', color: 'text-blue-600' },
      momo: { name: 'MoMo', icon: 'Smartphone', color: 'text-pink-600' },
      zalopay: { name: 'ZaloPay', icon: 'Wallet', color: 'text-purple-600' },
      banking: { name: 'Chuyển khoản', icon: 'Building2', color: 'text-indigo-600' },
      qr: { name: 'QR Code', icon: 'QrCode', color: 'text-orange-600' }
    };
    return methods?.[method] || methods?.cash;
  };

  const handlePrintReceipt = async () => {
    setPrinting(true);
    // Simulate printing delay
    setTimeout(() => {
      setPrinting(false);
      onPrintReceipt && onPrintReceipt(mockPaymentData);
    }, 2000);
  };

  const handleSendDigitalReceipt = async () => {
    setSending(true);
    // Simulate sending delay
    setTimeout(() => {
      setSending(false);
      onSendDigitalReceipt && onSendDigitalReceipt(mockPaymentData);
    }, 1500);
  };

  const paymentMethod = getPaymentMethodDisplay(mockPaymentData?.method);

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="CheckCircle" size={48} className="text-success" />
        </div>
        <h2 className="text-2xl font-bold text-success mb-2">
          Thanh toán thành công!
        </h2>
        <p className="text-muted-foreground">
          Giao dịch đã được xử lý thành công
        </p>
      </div>
      {/* Transaction Summary */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="font-semibold text-foreground mb-4">Chi tiết giao dịch</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Mã giao dịch:</span>
            <span className="font-mono text-foreground">{mockPaymentData?.transactionId}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Đơn hàng:</span>
            <span className="font-medium text-foreground">{mockPaymentData?.orderNumber}</span>
          </div>
          
          {mockPaymentData?.tableNumber && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bàn số:</span>
              <span className="font-medium text-foreground">{mockPaymentData?.tableNumber}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Phương thức:</span>
            <div className="flex items-center space-x-2">
              <Icon name={paymentMethod?.icon} size={16} className={paymentMethod?.color} />
              <span className="font-medium text-foreground">{paymentMethod?.name}</span>
            </div>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tổng tiền:</span>
            <span className="font-bold text-primary text-lg">
              {formatCurrency(mockPaymentData?.totalAmount)}
            </span>
          </div>
          
          {mockPaymentData?.method === 'cash' && (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tiền nhận:</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(mockPaymentData?.amountTendered)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tiền thối:</span>
                <span className="font-medium text-success">
                  {formatCurrency(mockPaymentData?.change)}
                </span>
              </div>
            </>
          )}
          
          <div className="flex justify-between pt-2 border-t border-border">
            <span className="text-muted-foreground">Thời gian:</span>
            <span className="font-medium text-foreground">
              {new Date(mockPaymentData.timestamp)?.toLocaleString('vi-VN')}
            </span>
          </div>
        </div>
      </div>
      {/* Customer Information */}
      {mockPaymentData?.customerInfo && (
        <div className="bg-muted/30 rounded-lg p-4">
          <h4 className="font-medium text-foreground mb-3">Thông tin khách hàng</h4>
          <div className="space-y-2">
            {mockPaymentData?.customerInfo?.name && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tên:</span>
                <span className="text-foreground">{mockPaymentData?.customerInfo?.name}</span>
              </div>
            )}
            {mockPaymentData?.customerInfo?.phone && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Điện thoại:</span>
                <span className="text-foreground">{mockPaymentData?.customerInfo?.phone}</span>
              </div>
            )}
            {mockPaymentData?.customerInfo?.email && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="text-foreground">{mockPaymentData?.customerInfo?.email}</span>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Receipt Actions */}
      <div className="space-y-3">
        <h4 className="font-medium text-foreground">Tùy chọn hóa đơn</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={handlePrintReceipt}
            loading={printing}
            disabled={printing}
            iconName="Printer"
            iconPosition="left"
            className="hover-scale"
          >
            {printing ? 'Đang in...' : 'In hóa đơn'}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleSendDigitalReceipt}
            loading={sending}
            disabled={sending || !mockPaymentData?.customerInfo?.email}
            iconName="Mail"
            iconPosition="left"
            className="hover-scale"
          >
            {sending ? 'Đang gửi...' : 'Gửi email'}
          </Button>
        </div>
        
        {!mockPaymentData?.customerInfo?.email && (
          <p className="text-xs text-muted-foreground text-center">
            Cần có email khách hàng để gửi hóa đơn điện tử
          </p>
        )}
      </div>
      {/* Next Actions */}
      <div className="space-y-3 pt-4 border-t border-border">
        <h4 className="font-medium text-foreground">Tiếp theo</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            variant="default"
            onClick={onNewOrder}
            iconName="Plus"
            iconPosition="left"
            className="hover-scale"
          >
            Đơn hàng mới
          </Button>
          
          <Button
            variant="outline"
            onClick={onBackToDashboard}
            iconName="ArrowLeft"
            iconPosition="left"
            className="hover-scale"
          >
            Về trang chính
          </Button>
        </div>
      </div>
      {/* Success Tips */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <Icon name="Lightbulb" size={20} className="text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800 mb-1">Mẹo sử dụng</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Hóa đơn được lưu tự động trong lịch sử giao dịch</li>
              <li>• Có thể in lại hóa đơn từ menu Lịch sử đơn hàng</li>
              <li>• Thông tin khách hàng được lưu cho lần mua tiếp theo</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;