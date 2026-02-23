import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';

const OrdersDropdown = ({ orders = [], user = null }) => {
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            pending: { label: 'Chờ xử lý', variant: 'warning' },
            processing: { label: 'Đang làm', variant: 'info' },
            completed: { label: 'Hoàn thành', variant: 'success' },
            cancelled: { label: 'Đã hủy', variant: 'destructive' }
        };
        return statusMap[status] || { label: status, variant: 'default' };
    };

    const getPaymentStatusBadge = (paymentStatus) => {
        const statusMap = {
            unpaid: { label: 'Chưa thanh toán', variant: 'destructive' },
            paid: { label: 'Đã thanh toán', variant: 'success' },
            refunded: { label: 'Đã hoàn tiền', variant: 'secondary' }
        };
        return statusMap[paymentStatus] || { label: paymentStatus, variant: 'default' };
    };

    if (!orders || orders.length === 0) {
        return (
            <div className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 top-20 sm:top-full sm:mt-2 w-auto sm:w-96 bg-popover border border-border rounded-lg shadow-modal z-1150">
                <div className="p-8 text-center">
                    <Icon name="ShoppingCart" size={48} className="text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-sm font-medium text-popover-foreground mb-1">
                        Chưa có đơn hàng
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Bạn chưa đặt đơn hàng nào
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 top-20 sm:top-full sm:mt-2 w-auto sm:w-[480px] bg-popover border border-border rounded-lg shadow-modal z-1150">
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-popover-foreground">Đơn hàng của tôi</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {orders.length} đơn hàng
                    </p>
                </div>
                <Icon name="Receipt" size={20} className="text-muted-foreground" />
            </div>

            {/* Orders List */}
            <div className="max-h-[60vh] sm:max-h-[400px] overflow-y-auto">
                {orders.map((order) => {
                    const statusBadge = getStatusBadge(order.status);
                    const paymentBadge = getPaymentStatusBadge(order.paymentStatus);

                    return (
                        <div
                            key={order._id}
                            className="p-4 border-b border-border last:border-b-0 hover:bg-muted/30 transition-smooth"
                        >
                            {/* Order Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    {/* Order ID */}
                                    <div className="flex items-center space-x-2 mb-1.5">
                                        <Icon name="Hash" size={12} className="text-muted-foreground" />
                                        <span className="text-xs font-mono font-medium text-primary">
                                            {order._id?.slice(-8)?.toUpperCase() || 'N/A'}
                                        </span>
                                    </div>
                                    {/* Table */}
                                    <div className="flex items-center space-x-2 mb-1">
                                        <Icon name="UtensilsCrossed" size={14} className="text-muted-foreground" />
                                        <span className="text-xs font-medium text-foreground">
                                            {order.table}
                                        </span>
                                    </div>
                                    {/* Timestamp */}
                                    <p className="text-xs text-muted-foreground">
                                        {formatTime(order.timestamp || order.createdAt)}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end space-y-1">
                                    <Badge variant={statusBadge.variant} className="text-xs">
                                        {statusBadge.label}
                                    </Badge>
                                    <Badge variant={paymentBadge.variant} className="text-xs">
                                        {paymentBadge.label}
                                    </Badge>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="space-y-1.5 mb-3">
                                {order.items?.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between text-xs"
                                    >
                                        <div className="flex items-center space-x-2 flex-1">
                                            <span className="text-muted-foreground">
                                                {item.quantity}x
                                            </span>
                                            <span className="text-foreground truncate">
                                                {item.name}
                                            </span>
                                        </div>
                                        <span className="text-foreground font-medium ml-2">
                                            {formatPrice(item.price * item.quantity)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Order Summary */}
                            <div className="space-y-1 pt-2 border-t border-border/50">
                                <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">Tạm tính:</span>
                                    <span className="text-foreground">{formatPrice(order.subtotal)}</span>
                                </div>
                                {order.discount > 0 && (
                                    <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">Giảm giá:</span>
                                        <span className="text-success">-{formatPrice(order.discount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">VAT:</span>
                                    <span className="text-foreground">{formatPrice(order.tax)}</span>
                                </div>
                                <div className="flex justify-between text-sm font-semibold pt-1 border-t border-border/50">
                                    <span className="text-foreground">Tổng cộng:</span>
                                    <span className="text-primary">{formatPrice(order.total)}</span>
                                </div>
                            </div>

                            {/* Staff Info */}
                            {order.staff && (
                                <div className="flex items-center space-x-1 mt-2 pt-2 border-t border-border/50">
                                    <Icon name="User" size={12} className="text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">
                                        Nhân viên: {order.staff}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-border">
                <Button variant="ghost" size="sm" fullWidth iconName="History" iconPosition="left">
                    Xem tất cả đơn hàng
                </Button>
            </div>
        </div>
    );
};

export default OrdersDropdown;
