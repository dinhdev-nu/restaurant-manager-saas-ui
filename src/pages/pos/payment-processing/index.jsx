import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useOrderStore } from '../../../stores/order.store';
import { useTableStore } from '../../../stores/table.store';
import UnpaidOrdersModal from '../../../components/ui/UnpaidOrdersModal';

// Import components
import PaymentMethodSelector from './components/PaymentMethodSelector';
import OrderSummary from './components/OrderSummary';
import CashPaymentForm from './components/CashPaymentForm';
import CardPaymentForm from './components/CardPaymentForm';
import DigitalWalletForm from './components/DigitalWalletForm';
import CustomerInfoForm from './components/CustomerInfoForm';
import PaymentSuccess from './components/PaymentSuccess';

const PaymentProcessing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const updateOrderPayment = useOrderStore((state) => state.updateOrderPayment);
  const updateOrderStatus = useOrderStore((state) => state.updateOrderStatus);
  const clearOrder = useTableStore((state) => state.clearOrder);
  const getTableByOrderId = useTableStore((state) => state.getTableByOrderId);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isOperational, setIsOperational] = useState(true);
  const [showUnpaidModal, setShowUnpaidModal] = useState(false);

  // Payment flow states
  const [currentStep, setCurrentStep] = useState('method'); // method, payment, customer, success
  const [selectedMethod, setSelectedMethod] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({});
  const [paymentResult, setPaymentResult] = useState({});

  // Get order data from navigation state
  useEffect(() => {
    if (location.state?.order) {
      // Order from UnpaidOrdersModal or order-history
      const order = location.state.order;
      setOrderData({
        orderNumber: order.id,
        tableNumber: order.table,
        items: order.items.map((item, idx) => ({
          id: idx + 1,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
          notes: item.notes || ''
        })),
        subtotal: order.subtotal,
        tax: order.tax,
        discount: order.discount || 0,
        total: order.total
      });
      // Close unpaid modal if it was open
      setShowUnpaidModal(false);
    } else if (location.state?.orderNumber) {
      // Order from dashboard (going to payment directly)
      setOrderData({
        orderNumber: location.state.orderNumber,
        tableNumber: location.state.selectedTable,
        items: location.state.cartItems.map((item, idx) => ({
          id: idx + 1,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
          notes: item.note || ''
        })),
        subtotal: location.state.subtotal,
        tax: location.state.tax,
        discount: location.state.discount || 0,
        total: location.state.totalAmount
      });
    } else {
      // No order data - show unpaid orders modal
      setShowUnpaidModal(true);
    }
  }, [location]);

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    setCurrentStep('payment');
  };

  const handlePaymentComplete = (paymentData) => {
    // Update order in store
    if (orderData?.orderNumber) {
      updateOrderPayment(orderData.orderNumber, paymentData);
      updateOrderStatus(orderData.orderNumber, 'completed');

      // Clear table order if table was assigned - find table by order ID
      const table = getTableByOrderId(orderData.orderNumber);
      if (table) {
        clearOrder(table.id);
      }
    }

    setPaymentResult({
      ...paymentData,
      orderNumber: orderData?.orderNumber,
      tableNumber: orderData?.tableNumber,
      customerInfo: customerInfo
    });
    setCurrentStep('success');
  };

  const handleCustomerInfoSave = (info) => {
    setCustomerInfo(info);
    setCurrentStep('payment');
  };

  const handleCustomerInfoSkip = () => {
    setCurrentStep('payment');
  };

  const handleBackToMethod = () => {
    setCurrentStep('method');
    setSelectedMethod('');
  };

  const handleBackFromMethodStep = () => {
    // Khi ở step method và nhấn back, hiện unpaid modal
    setShowUnpaidModal(true);
  };

  const handleShowCustomerForm = () => {
    setCurrentStep('customer');
  };

  const handleNewOrder = () => {
    // Reset all states
    setCurrentStep('method');
    setSelectedMethod('');
    setOrderData({});
    setCustomerInfo({});
    setPaymentResult({});
    navigate('/main-pos-dashboard');
  };

  const handleBackToDashboard = () => {
    navigate('/main-pos-dashboard');
  };

  const handlePrintReceipt = (data) => {
    console.log('Printing receipt:', data);
    // Implement print functionality
  };

  const handleSendDigitalReceipt = (data) => {
    console.log('Sending digital receipt:', data);
    // Implement email sending functionality
  };

  const renderPaymentForm = () => {
    if (!orderData) return null;

    switch (selectedMethod) {
      case 'cash':
        return (
          <CashPaymentForm
            totalAmount={orderData?.total}
            onPaymentComplete={handlePaymentComplete}
            onCancel={handleBackToMethod}
          />
        );
      case 'card':
        return (
          <CardPaymentForm
            totalAmount={orderData?.total}
            onPaymentComplete={handlePaymentComplete}
            onCancel={handleBackToMethod}
          />
        );
      case 'momo': case 'zalopay': case 'banking': case 'qr':
        return (
          <DigitalWalletForm
            totalAmount={orderData?.total}
            walletType={selectedMethod}
            onPaymentComplete={handlePaymentComplete}
            onCancel={handleBackToMethod}
          />
        );
      default:
        return null;
    }
  };

  const renderStepContent = () => {
    if (!orderData) {
      return (
        <div className="text-center py-12">
          <Icon name="Loader" size={48} className="text-muted-foreground mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Đang tải dữ liệu đơn hàng...</p>
        </div>
      );
    }

    switch (currentStep) {
      case 'method':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <OrderSummary
                orderItems={orderData?.items}
                subtotal={orderData?.subtotal}
                tax={orderData?.tax}
                discount={orderData?.discount}
                total={orderData?.total}
                orderNumber={orderData?.orderNumber}
                tableNumber={orderData?.tableNumber}
              />
            </div>
            <div>
              <PaymentMethodSelector
                selectedMethod={selectedMethod}
                onMethodSelect={handleMethodSelect}
                availableMethods={['cash', 'card', 'momo', 'zalopay', 'banking', 'qr']}
              />

              {/* Customer Info Button */}
              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">Thông tin khách hàng</h4>
                    <p className="text-sm text-muted-foreground">
                      {customerInfo?.name ? `${customerInfo?.name} - ${customerInfo?.phone}` : 'Chưa có thông tin'}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShowCustomerForm}
                    iconName="User"
                    iconPosition="left"
                  >
                    {customerInfo?.name ? 'Sửa' : 'Thêm'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="max-w-md mx-auto">
            {renderPaymentForm()}
          </div>
        );

      case 'customer':
        return (
          <div className="max-w-md mx-auto">
            <CustomerInfoForm
              onSave={handleCustomerInfoSave}
              onSkip={handleCustomerInfoSkip}
              initialData={customerInfo}
            />
          </div>
        );

      case 'success':
        return (
          <div className="max-w-md mx-auto">
            <PaymentSuccess
              paymentData={paymentResult}
              onPrintReceipt={handlePrintReceipt}
              onSendDigitalReceipt={handleSendDigitalReceipt}
              onNewOrder={handleNewOrder}
              onBackToDashboard={handleBackToDashboard}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'method':
        return 'Chọn phương thức thanh toán';
      case 'payment':
        return 'Xử lý thanh toán';
      case 'customer':
        return 'Thông tin khách hàng';
      case 'success':
        return 'Thanh toán thành công';
      default:
        return 'Thanh toán';
    }
  };

  const steps = [
    { id: 'method', name: 'Phương thức', icon: 'CreditCard' },
    { id: 'payment', name: 'Thanh toán', icon: 'DollarSign' },
    { id: 'success', name: 'Hoàn tất', icon: 'CheckCircle' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header
        storeName="POS Manager"
        isOperational={isOperational}
        onToggleOperational={() => setIsOperational(!isOperational)}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        userProfile={{ name: "Admin", role: "owner" }}
      />
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        userRole="owner"
      />
      <main className={`
        pt-16 transition-all duration-300 ease-smooth
        ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'}
      `}>
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (currentStep === 'method') {
                      handleBackFromMethodStep();
                    } else if (currentStep === 'payment') {
                      handleBackToMethod();
                    } else if (currentStep === 'customer') {
                      setCurrentStep('method');
                    } else {
                      navigate('/main-pos-dashboard');
                    }
                  }}
                  className="hover-scale"
                >
                  <Icon name="ArrowLeft" size={20} />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    {getStepTitle()}
                  </h1>
                  <p className="text-muted-foreground">
                    Xử lý thanh toán an toàn và nhanh chóng
                  </p>
                </div>
              </div>

              {/* Order Info */}
              <div className="hidden md:flex items-center space-x-4 text-sm text-muted-foreground">
                <span>Đơn hàng: {orderData?.orderNumber}</span>
                <span>•</span>
                <span>Bàn: {orderData?.tableNumber}</span>
                <span>•</span>
                <span>{new Date()?.toLocaleString('vi-VN')}</span>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center space-x-4">
              {steps?.map((step, index) => {
                const isActive = step?.id === currentStep;
                const isCompleted = steps?.findIndex(s => s?.id === currentStep) > index;

                return (
                  <div key={step?.id} className="flex items-center">
                    <div className={`
                      flex items-center space-x-2 px-3 py-2 rounded-lg transition-smooth
                      ${isActive
                        ? 'bg-primary text-primary-foreground'
                        : isCompleted
                          ? 'bg-success text-success-foreground'
                          : 'bg-muted text-muted-foreground'
                      }
                    `}>
                      <Icon
                        name={isCompleted ? 'Check' : step?.icon}
                        size={16}
                      />
                      <span className="text-sm font-medium hidden sm:block">
                        {step?.name}
                      </span>
                    </div>
                    {index < steps?.length - 1 && (
                      <Icon
                        name="ChevronRight"
                        size={16}
                        className="mx-2 text-muted-foreground"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-surface border border-border rounded-lg p-6">
            {renderStepContent()}
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Icon name="Shield" size={20} className="text-blue-600" />
              <div>
                <h4 className="font-medium text-blue-800">Bảo mật thanh toán</h4>
                <p className="text-sm text-blue-700">
                  Tất cả giao dịch được mã hóa và tuân thủ tiêu chuẩn bảo mật PCI DSS.
                  Thông tin thanh toán không được lưu trữ trên hệ thống.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Unpaid Orders Modal */}
      <UnpaidOrdersModal
        isOpen={showUnpaidModal}
        onClose={() => {
          setShowUnpaidModal(false);
          // Only navigate back if no order was selected
          if (!orderData) {
            navigate('/main-pos-dashboard');
          }
        }}
      />
    </div>
  );
};

export default PaymentProcessing;