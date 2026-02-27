import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import Icon from '../../../../components/AppIcon';
import ConfirmationDialog from '../../../../components/ui/ConfirmationDialog';
import { getOrderCheckoutDetailsApi } from '../../../../api/restaurant';
import { useToast } from '../../../../hooks/use-toast';

const OrderTable = ({ orders, onViewDetails, onReprintReceipt, highlightedOrderId }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    })?.format(amount);
  };

  const formatDateTime = (timestamp) => {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })?.format(new Date(timestamp));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { color: 'bg-success text-success-foreground', label: 'Hoàn thành' },
      processing: { color: 'bg-warning text-warning-foreground', label: 'Đang xử lý' },
      pending: { color: 'bg-blue-500 text-white', label: 'Chờ xử lý' },
      cancelled: { color: 'bg-error text-error-foreground', label: 'Đã hủy' },
      refunded: { color: 'bg-secondary text-secondary-foreground', label: 'Đã hoàn tiền' }
    };

    const config = statusConfig?.[status] || statusConfig?.completed;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${config?.color}`}>
        {config?.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (paymentStatus) => {
    const statusConfig = {
      paid: { color: 'bg-success text-success-foreground', label: 'Đã thanh toán', icon: 'CheckCircle' },
      unpaid: { color: 'bg-orange-500 text-white', label: 'Chưa thanh toán', icon: 'AlertCircle' },
      refunded: { color: 'bg-secondary text-secondary-foreground', label: 'Đã hoàn tiền', icon: 'RotateCcw' }
    };

    const config = statusConfig?.[paymentStatus] || statusConfig?.unpaid;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${config?.color}`}>
        <Icon name={config?.icon} size={12} />
        {config?.label}
      </span>
    );
  };

  const toggleRowExpansion = (orderId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded?.has(orderId)) {
      newExpanded?.delete(orderId);
    } else {
      newExpanded?.add(orderId);
    }
    setExpandedRows(newExpanded);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig?.key === key && sortConfig?.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleOrderClick = (order) => {
    // If order is unpaid, show confirmation to go to payment
    if (order.paymentStatus === 'unpaid') {
      setSelectedOrderForPayment(order);
      setShowPaymentDialog(true);
    } else {
      // If paid, show details
      onViewDetails(order);
    }
  };

  const handleConfirmPayment = async () => {
    if (selectedOrderForPayment) {
      try {
        setIsLoadingCheckout(true);

        // Fetch latest order details from API
        const response = await getOrderCheckoutDetailsApi(selectedOrderForPayment._id);
        const orderDetails = response.metadata;

        navigate('/payment-processing', {
          state: {
            order: orderDetails,
            fromOrderHistory: true
          }
        });
      } catch (error) {
        console.error('Error fetching order details:', error);
        toast({
          title: 'Lỗi',
          description: 'Không thể tải thông tin đơn hàng. Vui lòng thử lại.',
          variant: 'destructive'
        });
        setIsLoadingCheckout(false);
        return;
      }
    }
    setShowPaymentDialog(false);
    setSelectedOrderForPayment(null);
    setIsLoadingCheckout(false);
  };

  const handleCancelPayment = () => {
    setShowPaymentDialog(false);
    setSelectedOrderForPayment(null);
  };

  const sortedOrders = [...orders]?.sort((a, b) => {
    if (sortConfig?.key === 'timestamp') {
      const aTime = new Date(a.timestamp)?.getTime();
      const bTime = new Date(b.timestamp)?.getTime();
      return sortConfig?.direction === 'asc' ? aTime - bTime : bTime - aTime;
    }
    if (sortConfig?.key === 'total') {
      return sortConfig?.direction === 'asc' ? a?.total - b?.total : b?.total - a?.total;
    }
    return 0;
  });

  const SortIcon = ({ column }) => {
    if (sortConfig?.key !== column) {
      return <Icon name="ArrowUpDown" size={16} className="text-muted-foreground" />;
    }
    return (
      <Icon
        name={sortConfig?.direction === 'asc' ? 'ArrowUp' : 'ArrowDown'}
        size={16}
        className="text-primary"
      />
    );
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left p-4 font-medium text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <span>Mã đơn</span>
                </div>
              </th>
              <th className="text-left p-4 font-medium text-muted-foreground">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('timestamp')}
                  className="flex items-center space-x-2 hover:bg-transparent p-0"
                >
                  <span>Thời gian</span>
                  <SortIcon column="timestamp" />
                </Button>
              </th>
              <th className="text-left p-4 font-medium text-muted-foreground">Bàn</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Nhân viên</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Món ăn</th>
              <th className="text-left p-4 font-medium text-muted-foreground">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('total')}
                  className="flex items-center space-x-2 hover:bg-transparent p-0"
                >
                  <span>Tổng tiền</span>
                  <SortIcon column="total" />
                </Button>
              </th>
              <th className="text-left p-4 font-medium text-muted-foreground">Trạng thái</th>
              <th className="text-left p-4 font-medium text-muted-foreground">TT Thanh toán</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {sortedOrders?.map((order) => (
              <React.Fragment key={order?._id}>
                <tr className={`border-b border-border hover:bg-muted/30 transition-smooth ${highlightedOrderId === order?._id ? 'bg-primary/10 animate-pulse' : ''}`}>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleRowExpansion(order?._id)}
                        className="w-6 h-6"
                      >
                        <Icon
                          name={expandedRows?.has(order?._id) ? "ChevronDown" : "ChevronRight"}
                          size={16}
                        />
                      </Button>
                      <span className="font-mono text-sm font-medium">#{order?.orderId || order?._id}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      <div className="font-medium text-foreground">
                        {formatDateTime(order?.timestamp)}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-medium text-foreground">
                      {order?.table}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-muted-foreground">
                      {order?.staff}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-muted-foreground">
                      {order?.items?.length} món
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-foreground">
                      {formatCurrency(order?.total)}
                    </div>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(order?.status)}
                  </td>
                  <td className="p-4">
                    {getPaymentStatusBadge(order?.paymentStatus || 'unpaid')}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOrderClick(order)}
                        className="hover-scale"
                        title={order?.paymentStatus === 'unpaid' ? 'Thanh toán' : 'Xem chi tiết'}
                      >
                        <Icon name={order?.paymentStatus === 'unpaid' ? 'CreditCard' : 'Eye'} size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onReprintReceipt(order)}
                        className="hover-scale"
                      >
                        <Icon name="Printer" size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>

                {/* Expanded Row Details */}
                {expandedRows?.has(order?._id) && (
                  <tr className="bg-gradient-to-b from-muted/30 to-muted/10">
                    <td colSpan="7" className="p-0">
                      <div className="px-4 py-4 space-y-4">
                        {/* Header */}
                        <div className="flex items-center justify-between pb-2 border-b border-border">
                          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Icon name="FileText" size={16} className="text-primary" />
                            Chi tiết đơn hàng
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(order?.timestamp)}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          {/* Items List */}
                          <div className="lg:col-span-2">
                            <div className="bg-card border border-border rounded-md overflow-hidden">
                              <div className="bg-muted/50 px-3 py-1.5 border-b border-border">
                                <h5 className="text-xs font-semibold text-foreground flex items-center gap-2">
                                  <Icon name="ShoppingBag" size={12} />
                                  Món ăn ({order?.items?.length})
                                </h5>
                              </div>
                              <div className="divide-y divide-border max-h-[200px] overflow-y-auto">
                                {order?.items?.map((item, index) => (
                                  <div key={index} className="px-3 py-2 hover:bg-muted/30 transition-colors">
                                    <div className="flex justify-between items-start gap-2">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-semibold flex-shrink-0">
                                            {item?.quantity}
                                          </span>
                                          <span className="text-sm font-medium text-foreground truncate">{item?.name}</span>
                                        </div>
                                        {item?.note && (
                                          <p className="text-xs text-muted-foreground mt-0.5 ml-7 italic">
                                            {item?.note}
                                          </p>
                                        )}
                                      </div>
                                      <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                                        {formatCurrency(item?.price * item?.quantity)}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Summary & Info */}
                          <div className="space-y-3">
                            {/* Payment Summary */}
                            <div className="bg-card border border-border rounded-md overflow-hidden">
                              <div className="bg-muted/50 px-3 py-1.5 border-b border-border">
                                <h5 className="text-xs font-semibold text-foreground flex items-center gap-2">
                                  <Icon name="Calculator" size={12} />
                                  Tổng kết
                                </h5>
                              </div>
                              <div className="p-3 space-y-1.5 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Tạm tính:</span>
                                  <span className="font-medium text-foreground">{formatCurrency(order?.subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Thuế:</span>
                                  <span className="font-medium text-foreground">{formatCurrency(order?.tax)}</span>
                                </div>
                                {order?.discount > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Giảm giá:</span>
                                    <span className="font-medium text-error">-{formatCurrency(order?.discount)}</span>
                                  </div>
                                )}
                                <div className="border-t border-border pt-1.5 mt-1.5">
                                  <div className="flex justify-between items-center">
                                    <span className="font-semibold text-foreground">Tổng:</span>
                                    <span className="text-base font-bold text-primary">{formatCurrency(order?.total)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Additional Info */}
                            <div className="bg-card border border-border rounded-md overflow-hidden">
                              <div className="bg-muted/50 px-3 py-1.5 border-b border-border">
                                <h5 className="text-xs font-semibold text-foreground flex items-center gap-2">
                                  <Icon name="Info" size={12} />
                                  Thông tin
                                </h5>
                              </div>
                              <div className="p-3 space-y-2 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Bàn:</span>
                                  <span className="font-medium text-foreground">{order?.table}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">NV:</span>
                                  <span className="font-medium text-foreground truncate ml-2">{order?.staff}</span>
                                </div>
                                {order?.specialInstructions && (
                                  <div className="pt-1.5 border-t border-border">
                                    <span className="text-muted-foreground block mb-1">Ghi chú:</span>
                                    <p className="text-foreground bg-muted/30 p-1.5 rounded text-xs italic">
                                      {order?.specialInstructions}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Divider giữa expanded row và order tiếp theo */}
                      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
                      <div className="h-2 bg-muted/20"></div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile Card Layout */}
      <div className="lg:hidden space-y-4 p-4">
        {sortedOrders?.map((order) => (
          <div key={order?._id} className={`border border-border rounded-lg p-4 space-y-3 ${highlightedOrderId === order?._id ? 'bg-primary/10 border-primary animate-pulse' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 flex-wrap gap-2">
                <span className="font-mono text-sm font-medium">#{order?.orderId || order?._id}</span>
                {getStatusBadge(order?.status)}
                {getPaymentStatusBadge(order?.paymentStatus || 'unpaid')}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOrderClick(order)}
                  className="w-8 h-8"
                  title={order?.paymentStatus === 'unpaid' ? 'Thanh toán' : 'Xem chi tiết'}
                >
                  <Icon name={order?.paymentStatus === 'unpaid' ? 'CreditCard' : 'Eye'} size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onReprintReceipt(order)}
                  className="w-8 h-8"
                >
                  <Icon name="Printer" size={16} />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Thời gian:</span>
                <p className="font-medium text-foreground">{formatDateTime(order?.timestamp)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Tổng tiền:</span>
                <p className="font-semibold text-foreground">{formatCurrency(order?.total)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Bàn:</span>
                <p className="font-medium text-foreground">{order?.table}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Nhân viên:</span>
                <p className="font-medium text-foreground">{order?.staff}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-sm text-muted-foreground">
                {order?.items?.length} món
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showPaymentDialog}
        onClose={handleCancelPayment}
        onConfirm={handleConfirmPayment}
        title="Thanh toán đơn hàng"
        message={`Bạn có muốn thanh toán đơn hàng ${selectedOrderForPayment?.orderId || selectedOrderForPayment?._id}? Tổng tiền: ${selectedOrderForPayment ? formatCurrency(selectedOrderForPayment.total) : ''}`}
        confirmText={isLoadingCheckout ? "Đang tải..." : "Thanh toán ngay"}
        cancelText="Hủy"
        variant="success"
        icon={isLoadingCheckout ? "Loader" : "CreditCard"}
        disabled={isLoadingCheckout}
      />
    </div>
  );
};

export default OrderTable;