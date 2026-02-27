import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';

const DigitalWalletForm = ({
  totalAmount = 0,
  walletType = 'momo',
  qrCodeUrl = '',
  onPaymentComplete,
  onCancel
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [imageKey, setImageKey] = useState(0); // Force re-render image
  const maxRetries = 10;
  const retryTimeoutRef = useRef(null);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    })?.format(amount);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Reset states when qrCodeUrl changes
  useEffect(() => {
    if (qrCodeUrl) {
      setIsImageLoaded(false);
      setIsImageLoading(true);
      setRetryCount(0);
      setImageKey(prev => prev + 1);
    }
  }, [qrCodeUrl]);

  const handleImageLoad = () => {
    console.log('QR code image loaded successfully');
    setIsImageLoaded(true);
    setIsImageLoading(false);
    setRetryCount(0);
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
  };

  const handleImageError = () => {
    console.log(`QR code image failed to load, retry count: ${retryCount}`);
    setIsImageLoaded(false);

    if (retryCount < maxRetries) {
      // Retry loading image after delay (increasing delay each retry)
      const delay = Math.min(1000 * (retryCount + 1), 3000); // 1s, 2s, 3s max
      retryTimeoutRef.current = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setImageKey(prev => prev + 1); // Force re-render with new key
      }, delay);
    } else {
      setIsImageLoading(false);
    }
  };

  const handleManualRetry = () => {
    setRetryCount(0);
    setIsImageLoading(true);
    setImageKey(prev => prev + 1);
  };

  const handleConfirmPayment = async () => {
    setIsConfirming(true);
    try {
      await onPaymentComplete({
        method: walletType,
        totalAmount: totalAmount,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Payment confirmation error:', error);
    } finally {
      setIsConfirming(false);
    }
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

  return (
    <div className="space-y-4 p-4">
      {/* Header with Wallet Info */}
      <div className="text-center space-y-2">
        <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg ${currentWallet?.bgColor} ${currentWallet?.borderColor} border`}>
          <Icon name={currentWallet?.icon} size={18} className={currentWallet?.color} />
          <h3 className="text-base font-semibold text-foreground">
            {currentWallet?.name}
          </h3>
        </div>

        {/* Amount Display */}
        <div className="bg-white border border-gray-200 rounded-lg p-2.5">
          <p className="text-xs text-muted-foreground mb-0.5">Số tiền thanh toán</p>
          <p className="text-xl font-bold text-primary">
            {formatCurrency(totalAmount)}
          </p>
        </div>
      </div>
      {/* QR Code Display */}
      <div className="flex justify-center">
        <div className="relative">
          {/* QR Container */}
          <div className="relative p-4 bg-white border border-gray-200 rounded-lg">
            {qrCodeUrl ? (
              // Display QR code image from API
              <div className="w-48 h-48 relative">
                {/* Loading overlay */}
                {isImageLoading && !isImageLoaded && (
                  <div className="absolute inset-0 bg-gray-50 border border-dashed border-gray-300 rounded-lg flex items-center justify-center z-10">
                    <div className="text-center space-y-1.5">
                      <Icon name="Loader" size={32} className="text-primary mx-auto animate-spin" />
                      <div>
                        <p className="text-xs font-medium text-gray-700">Đang tải mã QR...</p>
                        {retryCount > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            Thử lại {retryCount}/{maxRetries}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Actual QR image */}
                <img
                  key={imageKey}
                  src={`${qrCodeUrl}${qrCodeUrl.includes('?') ? '&' : '?'}t=${imageKey}`}
                  alt="QR Code Payment"
                  className={`w-full h-full object-contain rounded-lg transition-opacity duration-300 ${isImageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />

                {/* Error state - show after max retries */}
                {!isImageLoading && !isImageLoaded && (
                  <div className="absolute inset-0 bg-red-50 border border-dashed border-red-300 rounded-lg flex items-center justify-center">
                    <div className="text-center space-y-1.5">
                      <Icon name="AlertCircle" size={32} className="text-red-500 mx-auto" />
                      <div>
                        <p className="text-xs font-medium text-red-700">Không thể tải mã QR</p>
                        <button
                          onClick={handleManualRetry}
                          className="mt-2 px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded hover:bg-red-600 transition-colors"
                        >
                          Thử lại
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Placeholder when no QR code URL
              <div className="w-48 h-48 bg-gray-50 border border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <div className="text-center space-y-1.5">
                  <Icon name="Loader" size={36} className="text-gray-400 mx-auto animate-spin" />
                  <p className="text-xs font-medium text-gray-600">Đang tạo mã QR...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Instructions */}
      <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <Icon name="Info" size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-900">
            {currentWallet?.instructions}. Sau khi thanh toán, nhấn <strong>"Xác nhận"</strong> bên dưới
          </p>
        </div>
      </div>

      {/* Payment Details */}
      <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <Icon name="Wallet" size={14} className="text-gray-600" />
              <span className="text-xs text-muted-foreground">Phương thức</span>
            </div>
            <span className="text-xs font-semibold text-foreground">{currentWallet?.name}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <Icon name="DollarSign" size={14} className="text-gray-600" />
              <span className="text-xs text-muted-foreground">Số tiền</span>
            </div>
            <span className="text-xs font-semibold text-foreground">{formatCurrency(totalAmount)}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <Icon name="Clock" size={14} className="text-gray-600" />
              <span className="text-xs text-muted-foreground">Thời gian</span>
            </div>
            <span className="text-xs font-medium text-foreground">
              {new Date()?.toLocaleString('vi-VN')}
            </span>
          </div>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex space-x-2 pt-1">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          disabled={isConfirming}
        >
          Hủy
        </Button>
        <Button
          variant="default"
          onClick={handleConfirmPayment}
          className="flex-1"
          iconName={isConfirming ? "Loader" : "CheckCircle"}
          iconPosition="left"
          disabled={!isImageLoaded || isConfirming}
        >
          {isConfirming ? 'Đang xử lý...' : isImageLoaded ? 'Xác nhận thanh toán' : 'Đang tải QR...'}
        </Button>
      </div>
    </div>
  );
};

export default DigitalWalletForm;