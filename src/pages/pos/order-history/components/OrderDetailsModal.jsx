import React from 'react';
import Button from '../../../../components/ui/Button';
import Icon from '../../../../components/AppIcon';

const OrderDetailsModal = ({ order, isOpen, onClose, onReprintReceipt }) => {
  if (!isOpen || !order) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    })?.format(amount || 0);
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp)?.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { color: 'bg-success/10 text-success', label: 'Hoàn thành' },
      pending: { color: 'bg-warning/10 text-warning', label: 'Đang chờ' },
      processing: { color: 'bg-blue-100 text-blue-600', label: 'Đang xử lý' },
      cancelled: { color: 'bg-error/10 text-error', label: 'Đã hủy' },
      refunded: { color: 'bg-muted text-muted-foreground', label: 'Đã hoàn tiền' }
    };
    const config = statusConfig?.[status] || statusConfig?.pending;
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config?.color}`}>
        {config?.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      paid: { color: 'bg-success/10 text-success', label: 'Đã thanh toán' },
      unpaid: { color: 'bg-warning/10 text-warning', label: 'Chưa thanh toán' },
      refunded: { color: 'bg-muted text-muted-foreground', label: 'Đã hoàn tiền' }
    };
    const config = statusConfig?.[status] || statusConfig?.unpaid;
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config?.color}`}>
        {config?.label}
      </span>
    );
  };

  const getTableDisplay = (table) => {
    if (!table) return 'N/A';
    if (table === 'takeaway') return 'Mang đi';
    return `Bàn ${table}`;
  };

  const getPaymentMethodDisplay = (method) => {
    const methods = {
      cash: 'Tiền mặt',
      CASH: 'Tiền mặt',
      card: 'Thẻ tín dụng',
      momo: 'MoMo',
      zalopay: 'ZaloPay',
      banking: 'Chuyển khoản',
      qr: 'QR Code',
      QR_CODE: 'QR Code'
    };
    return methods?.[method] || method || 'N/A';
  };

  const items = order?.items || [];
  const subtotal = order?.subtotal || 0;
  const tax = order?.tax || 0;
  const discount = order?.discount || 0;
  const total = order?.total || 0;

  return (
    <div className="fixed inset-0 z-1200 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-surface border border-border rounded-lg shadow-modal w-full max-w-lg max-h-[90vh] overflow-hidden m-4">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <Icon name="Receipt" size={20} className="text-primary" />
            <div>
              <h2 className="font-semibold text-foreground">Chi tiết đơn hàng</h2>
              <p className="text-xs text-muted-foreground font-mono">{order?._id}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={18} />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-130px)]">
          {/* Status Section */}
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center justify-center gap-2">
              {getStatusBadge(order?.status)}
              {getPaymentStatusBadge(order?.paymentStatus)}
            </div>
          </div>

          {/* Order Info */}
          <div className="px-4 py-3 border-b border-border text-sm space-y-2">
            <div className="text-xs text-muted-foreground uppercase font-medium mb-2">Thông tin đơn hàng</div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mã đơn hàng</span>
              <span className="text-foreground font-mono text-xs">{order?._id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ngày tạo</span>
              <span className="text-foreground">{formatDateTime(order?.createdAt || order?.timestamp)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cập nhật</span>
              <span className="text-foreground">{formatDateTime(order?.updatedAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vị trí</span>
              <span className="text-foreground">{getTableDisplay(order?.table)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nhân viên</span>
              <span className="text-foreground">{order?.staff || 'Chưa phân công'}</span>
            </div>
          </div>

          {/* Order Items */}
          <div className="px-4 py-3 border-b border-border">
            <div className="text-xs text-muted-foreground uppercase font-medium mb-2">Chi tiết món ({items.length} món)</div>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={item?.itemId || index} className="bg-muted/30 rounded p-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground font-medium">{item?.name}</span>
                    <span className="text-foreground">{formatCurrency(item?.price * item?.quantity)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Đơn giá: {formatCurrency(item?.price)} × {item?.quantity}</span>
                    {item?.itemId && <span className="font-mono">ID: {item?.itemId?.slice(-6)}</span>}
                  </div>
                  {(item?.notes || item?.note) && (
                    <p className="text-xs text-warning mt-1">📝 {item?.notes || item?.note}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Total items count */}
            <div className="mt-2 pt-2 border-t border-border flex justify-between text-sm">
              <span className="text-muted-foreground">Tổng số lượng</span>
              <span className="text-foreground font-medium">
                {items.reduce((sum, item) => sum + (item?.quantity || 0), 0)} món
              </span>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="px-4 py-3 border-b border-border text-sm space-y-2">
            <div className="text-xs text-muted-foreground uppercase font-medium mb-2">Thanh toán</div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tạm tính</span>
              <span className="text-foreground">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Giảm giá</span>
              <span className="text-foreground">-{formatCurrency(discount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Thuế (10%)</span>
              <span className="text-foreground">{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border font-bold">
              <span className="text-foreground">Tổng cộng</span>
              <span className="text-primary text-lg">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Payment Info - if paid */}
          {order?.paymentStatus === 'paid' && order?.paymentMethod && (
            <div className="px-4 py-3 border-b border-border text-sm space-y-2">
              <div className="text-xs text-muted-foreground uppercase font-medium mb-2">Thông tin thanh toán</div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phương thức</span>
                <span className="text-foreground">{getPaymentMethodDisplay(order?.paymentMethod)}</span>
              </div>
              {order?.paidAmount && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tiền nhận</span>
                  <span className="text-foreground">{formatCurrency(order?.paidAmount)}</span>
                </div>
              )}
              {order?.changeAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tiền thối</span>
                  <span className="text-success">{formatCurrency(order?.changeAmount)}</span>
                </div>
              )}
              {order?.paymentId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mã thanh toán</span>
                  <span className="text-foreground font-mono text-xs">{order?.paymentId}</span>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {order?.notes && (
            <div className="px-4 py-3 border-b border-border">
              <div className="text-xs text-muted-foreground uppercase font-medium mb-2">Ghi chú đơn hàng</div>
              <p className="text-sm text-foreground bg-muted/30 rounded p-2">{order?.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border bg-muted/30">
          <Button variant="outline" size="sm" onClick={onClose}>
            Đóng
          </Button>
          <Button
            variant="default"
            size="sm"
            iconName="Printer"
            iconPosition="left"
            onClick={() => onReprintReceipt(order)}
          >
            In hóa đơn
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;