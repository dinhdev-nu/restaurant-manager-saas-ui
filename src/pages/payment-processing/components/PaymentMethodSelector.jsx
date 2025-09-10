import React from 'react';
import Icon from '../../../components/AppIcon';


const PaymentMethodSelector = ({ 
  selectedMethod, 
  onMethodSelect, 
  availableMethods = [] 
}) => {
  const paymentMethods = [
    {
      id: 'cash',
      name: 'Tiền mặt',
      icon: 'Banknote',
      color: 'bg-green-50 border-green-200 text-green-700',
      iconColor: 'text-green-600',
      description: 'Thanh toán bằng tiền mặt'
    },
    {
      id: 'card',
      name: 'Thẻ tín dụng/ghi nợ',
      icon: 'CreditCard',
      color: 'bg-blue-50 border-blue-200 text-blue-700',
      iconColor: 'text-blue-600',
      description: 'Visa, Mastercard, JCB'
    },
    {
      id: 'momo',
      name: 'MoMo',
      icon: 'Smartphone',
      color: 'bg-pink-50 border-pink-200 text-pink-700',
      iconColor: 'text-pink-600',
      description: 'Ví điện tử MoMo'
    },
    {
      id: 'zalopay',
      name: 'ZaloPay',
      icon: 'Wallet',
      color: 'bg-purple-50 border-purple-200 text-purple-700',
      iconColor: 'text-purple-600',
      description: 'Ví điện tử ZaloPay'
    },
    {
      id: 'banking',
      name: 'Chuyển khoản',
      icon: 'Building2',
      color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
      iconColor: 'text-indigo-600',
      description: 'Internet Banking'
    },
    {
      id: 'qr',
      name: 'QR Code',
      icon: 'QrCode',
      color: 'bg-orange-50 border-orange-200 text-orange-700',
      iconColor: 'text-orange-600',
      description: 'Quét mã QR thanh toán'
    }
  ];

  const filteredMethods = availableMethods?.length > 0 
    ? paymentMethods?.filter(method => availableMethods?.includes(method?.id))
    : paymentMethods;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Chọn phương thức thanh toán
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredMethods?.map((method) => (
          <button
            key={method?.id}
            onClick={() => onMethodSelect(method?.id)}
            className={`
              relative p-4 rounded-lg border-2 transition-all duration-200 hover-scale
              ${selectedMethod === method?.id 
                ? `${method?.color} border-current shadow-md` 
                : 'bg-surface border-border hover:border-muted-foreground/30'
              }
            `}
          >
            <div className="flex items-center space-x-3">
              <div className={`
                w-12 h-12 rounded-lg flex items-center justify-center
                ${selectedMethod === method?.id 
                  ? 'bg-white/20' :'bg-muted'
                }
              `}>
                <Icon 
                  name={method?.icon} 
                  size={24} 
                  className={selectedMethod === method?.id ? method?.iconColor : 'text-muted-foreground'}
                />
              </div>
              
              <div className="flex-1 text-left">
                <h4 className={`
                  font-medium text-sm
                  ${selectedMethod === method?.id ? 'text-current' : 'text-foreground'}
                `}>
                  {method?.name}
                </h4>
                <p className={`
                  text-xs mt-1
                  ${selectedMethod === method?.id ? 'text-current/80' : 'text-muted-foreground'}
                `}>
                  {method?.description}
                </p>
              </div>
              
              {selectedMethod === method?.id && (
                <div className="w-6 h-6 rounded-full bg-current flex items-center justify-center">
                  <Icon name="Check" size={14} color="white" />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PaymentMethodSelector;