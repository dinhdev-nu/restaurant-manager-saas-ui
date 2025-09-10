import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const OrderDetailsModal = ({ order, isOpen, onClose, onReprintReceipt }) => {
  if (!isOpen || !order) return null;

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
      minute: '2-digit',
      second: '2-digit'
    })?.format(new Date(timestamp));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { color: 'bg-success text-success-foreground', label: 'Hoàn thành' },
      processing: { color: 'bg-warning text-warning-foreground', label: 'Đang xử lý' },
      cancelled: { color: 'bg-error text-error-foreground', label: 'Đã hủy' },
      refunded: { color: 'bg-secondary text-secondary-foreground', label: 'Đã hoàn tiền' }
    };

    const config = statusConfig?.[status] || statusConfig?.completed;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config?.color}`}>
        {config?.label}
      </span>
    );
  };

  const subtotal = order?.items?.reduce((sum, item) => sum + (item?.price * item?.quantity), 0);
  const tax = subtotal * 0.1; // 10% VAT
  const discount = order?.discount || 0;

  return (
    <div className="fixed inset-0 z-1200 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative bg-surface border border-border rounded-lg shadow-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-foreground">
              Chi tiết đơn hàng #{order?.id}
            </h2>
            {getStatusBadge(order?.status)}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover-scale"
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Order Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Thông tin đơn hàng</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mã đơn:</span>
                  <span className="font-mono font-medium text-foreground">#{order?.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Thời gian:</span>
                  <span className="font-medium text-foreground">{formatDateTime(order?.timestamp)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nhân viên:</span>
                  <span className="font-medium text-foreground">{order?.staff}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bàn/Khu vực:</span>
                  <span className="font-medium text-foreground">{order?.table}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Thông tin khách hàng</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tên khách hàng:</span>
                  <span className="font-medium text-foreground">{order?.customer || 'Khách lẻ'}</span>
                </div>
                {order?.customerPhone && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Số điện thoại:</span>
                    <span className="font-medium text-foreground">{order?.customerPhone}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phương thức thanh toán:</span>
                  <span className="font-medium text-foreground capitalize">
                    {order?.paymentMethod === 'cash' ? 'Tiền mặt' :
                     order?.paymentMethod === 'card' ? 'Thẻ tín dụng' :
                     order?.paymentMethod === 'momo' ? 'MoMo' :
                     order?.paymentMethod === 'zalopay' ? 'ZaloPay' :
                     order?.paymentMethod === 'banking' ? 'Chuyển khoản' : order?.paymentMethod}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Món ăn đã order</h3>
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium text-muted-foreground">Món ăn</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">SL</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Đơn giá</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {order?.items?.map((item, index) => (
                    <tr key={index} className="border-t border-border">
                      <td className="p-3">
                        <div>
                          <div className="font-medium text-foreground">{item?.name}</div>
                          {item?.notes && (
                            <div className="text-sm text-muted-foreground mt-1">
                              Ghi chú: {item?.notes}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-center font-medium text-foreground">
                        {item?.quantity}
                      </td>
                      <td className="p-3 text-right font-medium text-foreground">
                        {formatCurrency(item?.price)}
                      </td>
                      <td className="p-3 text-right font-semibold text-foreground">
                        {formatCurrency(item?.price * item?.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Special Instructions */}
          {order?.specialInstructions && (
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Ghi chú đặc biệt</h3>
              <div className="bg-muted/30 border border-border rounded-lg p-4">
                <p className="text-foreground">{order?.specialInstructions}</p>
              </div>
            </div>
          )}

          {/* Payment Summary */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Tổng kết thanh toán</h3>
            <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tạm tính:</span>
                <span className="font-medium text-foreground">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">VAT (10%):</span>
                <span className="font-medium text-foreground">{formatCurrency(tax)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Giảm giá:</span>
                  <span className="font-medium text-error">-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="border-t border-border pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-foreground">Tổng cộng:</span>
                  <span className="text-lg font-bold text-primary">{formatCurrency(order?.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
            className="hover-scale"
          >
            Đóng
          </Button>
          <Button
            variant="default"
            iconName="Printer"
            iconPosition="left"
            onClick={() => onReprintReceipt(order)}
            className="hover-scale"
          >
            In lại hóa đơn
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;