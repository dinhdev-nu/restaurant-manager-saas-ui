import React, { useState, useEffect } from 'react';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';

const DigitalWalletForm = ({
  totalAmount = 0,
  walletType = 'momo',
  onPaymentComplete,
  onCancel
}) => {
  const [qrCode, setQrCode] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, processing, completed, failed
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    })?.format(amount);
  };

  const walletInfo = {
    momo: {
      name: 'MoMo',
      icon: 'Smartphone',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      instructions: 'Mở ứng dụng MoMo và quét mã QR để thanh toán'
    },
    zalopay: {
      name: 'ZaloPay',
      icon: 'Wallet',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      instructions: 'Mở ứng dụng ZaloPay và quét mã QR để thanh toán'
    },
    banking: {
      name: 'Internet Banking',
      icon: 'Building2',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      instructions: 'Sử dụng ứng dụng ngân hàng để quét mã QR'
    },
    qr: {
      name: 'VietQR',
      icon: 'QrCode',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      instructions: 'Quét mã QR bằng ứng dụng ngân hàng bất kỳ'
    }
  };

  const currentWallet = walletInfo?.[walletType] || walletInfo?.momo;

  useEffect(() => {
    // Generate mock QR code
    const mockQrData = `${walletType}://pay?amount=${totalAmount}&merchant=pos-restaurant&order=${Date.now()}`;
    setQrCode(mockQrData);

    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setPaymentStatus('failed');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Simulate payment status check
    const statusCheck = setTimeout(() => {
      setPaymentStatus('processing');

      setTimeout(() => {
        setPaymentStatus('completed');
        onPaymentComplete({
          method: walletType,
          totalAmount: totalAmount,
          transactionId: `${walletType?.toUpperCase()}${Date.now()}`,
          timestamp: new Date()?.toISOString()
        });
      }, 2000);
    }, 8000);

    return () => {
      clearInterval(timer);
      clearTimeout(statusCheck);
    };
  }, [walletType, totalAmount, onPaymentComplete]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs?.toString()?.padStart(2, '0')}`;
  };

  const getStatusDisplay = () => {
    switch (paymentStatus) {
      case 'processing':
        return {
          icon: 'Loader2',
          text: 'Đang xử lý thanh toán...',
          color: 'text-primary',
          bgColor: 'bg-primary/10',
          borderColor: 'border-primary/20'
        };
      case 'completed':
        return {
          icon: 'CheckCircle',
          text: 'Thanh toán thành công!',
          color: 'text-success',
          bgColor: 'bg-success/10',
          borderColor: 'border-success/20'
        };
      case 'failed':
        return {
          icon: 'XCircle',
          text: 'Thanh toán hết hạn',
          color: 'text-error',
          bgColor: 'bg-error/10',
          borderColor: 'border-error/20'
        };
      default:
        return {
          icon: 'Clock',
          text: 'Chờ thanh toán...',
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          borderColor: 'border-warning/20'
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg ${currentWallet?.bgColor} ${currentWallet?.borderColor} border`}>
          <Icon name={currentWallet?.icon} size={24} className={currentWallet?.color} />
          <h3 className="text-xl font-semibold text-foreground">
            {currentWallet?.name}
          </h3>
        </div>
        <p className="text-2xl font-bold text-primary mt-4">
          {formatCurrency(totalAmount)}
        </p>
      </div>
      {/* QR Code Display */}
      <div className="flex justify-center">
        <div className="p-6 bg-white border-2 border-border rounded-lg shadow-base">
          {paymentStatus === 'pending' || paymentStatus === 'processing' ? (
            <div className="w-48 h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Icon name="QrCode" size={64} className="text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Mã QR thanh toán</p>
              </div>
            </div>
          ) : paymentStatus === 'completed' ? (
            <div className="w-48 h-48 bg-success/10 rounded-lg flex items-center justify-center">
              <Icon name="CheckCircle" size={64} className="text-success" />
            </div>
          ) : (
            <div className="w-48 h-48 bg-error/10 rounded-lg flex items-center justify-center">
              <Icon name="XCircle" size={64} className="text-error" />
            </div>
          )}
        </div>
      </div>
      {/* Instructions */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2">
          {currentWallet?.instructions}
        </p>
        {paymentStatus === 'pending' && (
          <div className="flex items-center justify-center space-x-2 text-warning">
            <Icon name="Clock" size={16} />
            <span className="text-sm font-medium">
              Thời gian còn lại: {formatTime(timeLeft)}
            </span>
          </div>
        )}
      </div>
      {/* Payment Status */}
      <div className={`p-4 rounded-lg border ${statusDisplay?.bgColor} ${statusDisplay?.borderColor}`}>
        <div className="flex items-center justify-center space-x-3">
          <Icon
            name={statusDisplay?.icon}
            size={20}
            className={`${statusDisplay?.color} ${paymentStatus === 'processing' ? 'animate-spin' : ''}`}
          />
          <span className={`font-medium ${statusDisplay?.color}`}>
            {statusDisplay?.text}
          </span>
        </div>
      </div>
      {/* Payment Details */}
      <div className="p-4 bg-muted/30 rounded-lg space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Phương thức:</span>
          <span className="font-medium text-foreground">{currentWallet?.name}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Số tiền:</span>
          <span className="font-medium text-foreground">{formatCurrency(totalAmount)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Thời gian tạo:</span>
          <span className="font-medium text-foreground">
            {new Date()?.toLocaleString('vi-VN')}
          </span>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={paymentStatus === 'processing'}
          className="flex-1"
        >
          {paymentStatus === 'completed' ? 'Đóng' : 'Hủy'}
        </Button>

        {paymentStatus === 'failed' && (
          <Button
            variant="default"
            onClick={() => window.location?.reload()}
            className="flex-1"
            iconName="RefreshCw"
            iconPosition="left"
          >
            Tạo mã mới
          </Button>
        )}

        {paymentStatus === 'pending' && (
          <Button
            variant="outline"
            onClick={() => {
              setPaymentStatus('processing');
              setTimeout(() => {
                setPaymentStatus('completed');
                onPaymentComplete({
                  method: walletType,
                  totalAmount: totalAmount,
                  transactionId: `${walletType?.toUpperCase()}${Date.now()}`,
                  timestamp: new Date()?.toISOString()
                });
              }, 2000);
            }}
            className="flex-1"
            iconName="Smartphone"
            iconPosition="left"
          >
            Mô phỏng thanh toán
          </Button>
        )}
      </div>
    </div>
  );
};

export default DigitalWalletForm;