import React, { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Icon from '../../../../components/AppIcon';

/* ─────────────────────────── config maps ─────────────────────────── */
const STATUS_CONFIG = {
    pending: { label: 'Chờ xử lý', icon: 'Clock', bar: 'bg-warning', badge: 'bg-warning/10 text-warning border-warning/20' },
    processing: { label: 'Đang làm', icon: 'ChefHat', bar: 'bg-info', badge: 'bg-info/10 text-info border-info/20' },
    completed: { label: 'Hoàn thành', icon: 'CheckCircle2', bar: 'bg-success', badge: 'bg-success/10 text-success border-success/20' },
    cancelled: { label: 'Đã huỷ', icon: 'XCircle', bar: 'bg-error', badge: 'bg-error/10 text-error border-error/20' },
};

const PAYMENT_CONFIG = {
    paid: { label: 'Đã TT', badge: 'bg-success/10 text-success border-success/20' },
    unpaid: { label: 'Chưa TT', badge: 'bg-warning/10 text-warning border-warning/20' },
};

const statusFilters = [
    { key: 'all', label: 'Tất cả' },
    { key: 'pending', label: 'Chờ xử lý' },
    { key: 'processing', label: 'Đang làm' },
    { key: 'completed', label: 'Hoàn thành' },
    { key: 'cancelled', label: 'Đã huỷ' },
];

/* ─────────────────────────── helpers ────────────────────────────── */
const formatVND = (n) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const formatRelativeTime = (iso) => {
    if (!iso) return '';
    const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return `${s}s trước`;
    if (s < 3600) return `${Math.floor(s / 60)} phút trước`;
    if (s < 86400) return `${Math.floor(s / 3600)} giờ trước`;
    return `${Math.floor(s / 86400)} ngày trước`;
};

const formatTimeUntilExpired = (iso) => {
    if (!iso) return null;
    const s = Math.floor((new Date(iso).getTime() - Date.now()) / 1000);
    if (s < 0) return { text: 'Hết hạn', expired: true };
    if (s < 60) return { text: `Còn ${s}s`, expired: false, urgent: true };
    if (s < 300) return { text: `Còn ${Math.floor(s / 60)} phút`, expired: false, urgent: true };
    if (s < 3600) return { text: `Còn ${Math.floor(s / 60)} phút`, expired: false, urgent: false };
    if (s < 86400) return { text: `Còn ${Math.floor(s / 3600)} giờ`, expired: false, urgent: false };
    return { text: `Còn ${Math.floor(s / 86400)} ngày`, expired: false, urgent: false };
};

const isOrderExpired = (order) => {
    if (!order.expiredAt) return false;
    return new Date(order.expiredAt).getTime() < Date.now();
};

/* ─────────────────────────── SummaryStrip ───────────────────────── */
const SummaryStrip = ({ orders }) => {
    // For draft orders, calculate based on all orders (not just completed)
    const revenue = orders.reduce((s, o) => s + (o.total || 0), 0);
    const avgTotal = orders.length ? Math.round(revenue / orders.length) : 0;

    return (
        <div className="grid grid-cols-3 gap-2">
            {[
                { icon: 'ClipboardList', label: 'Tổng đơn', value: `${orders.length} đơn`, color: 'text-primary' },
                { icon: 'Banknote', label: 'Tổng giá trị', value: formatVND(revenue), color: 'text-success' },
                { icon: 'TrendingUp', label: 'TB / đơn', value: formatVND(avgTotal), color: 'text-info' },
            ].map(({ icon, label, value, color }) => (
                <div key={label} className="bg-background border border-border rounded-lg px-2.5 py-2 text-center">
                    <Icon name={icon} size={14} className={`${color} mx-auto mb-1`} />
                    <p className={`text-xs font-bold ${color} truncate leading-tight`}>{value}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{label}</p>
                </div>
            ))}
        </div>
    );
};

/* ─────────────────────────── OrderCard ──────────────────────────── */
const OrderCard = ({ order, onConfirmOrder, onReorderDraft }) => {
    const [expanded, setExpanded] = useState(false);
    const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
    const payment = PAYMENT_CONFIG[order.paymentStatus] ?? PAYMENT_CONFIG.unpaid;
    const itemSummary = (order.items || []).map(i => `${i.name} ×${i.quantity}`).join(' · ');


    // Countdown nếu có expiredAt (draft order), ngược lại hiện "X phút trước"
    const expiredInfo = order.expiredAt ? formatTimeUntilExpired(order.expiredAt) : null;

    return (
        <div className={`
            relative bg-background rounded-xl border border-border overflow-hidden
            transition-all duration-200 hover:shadow-sm hover:border-border/60
            ${order.status === 'cancelled' ? 'opacity-60' : ''}
        `}>
            {/* Status accent bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full ${status.bar}`} />

            {/* Main row */}
            <div
                className="pl-4 pr-3 pt-3 pb-3 cursor-pointer select-none"
                onClick={() => setExpanded(v => !v)}
            >
                {/* Row 1: order number + time + badges */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="min-w-0">
                        <span className="text-sm font-semibold text-foreground">{order.orderNumber || order._id}</span>
                        {expiredInfo ? (
                            <span className={`ml-2 text-[11px] font-medium ${expiredInfo.expired ? 'text-error' :
                                expiredInfo.urgent ? 'text-warning animate-pulse' :
                                    'text-info'
                                }`}>
                                {expiredInfo.text}
                            </span>
                        ) : order.createdAt ? (
                            <span className="text-[11px] text-muted-foreground ml-2">
                                {formatRelativeTime(order.createdAt)}
                            </span>
                        ) : null}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${status.badge}`}>
                            <Icon name={status.icon} size={10} />
                            {status.label}
                        </span>
                        <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full border ${payment.badge}`}>
                            {payment.label}
                        </span>
                    </div>
                </div>

                {/* Row 2: table / staff + total + chevron */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground min-w-0">
                        <span className="flex items-center gap-1 flex-shrink-0">
                            <Icon name="MapPin" size={12} />
                            <span className="font-semibold text-foreground">Bàn: {order.table || 'Chưa có bàn'}</span>
                        </span>
                        <span className="flex items-center gap-1 flex-shrink-0">
                            <Icon name="Package" size={12} />
                            <span className="font-semibold text-foreground">{order.items?.length || 0} món</span>
                        </span>
                        <span className="flex items-center gap-1 truncate">
                            <Icon name="IdCard" size={12} />
                            {order.staff}
                        </span>
                        <span className="flex items-center gap-1 truncate">
                            <Icon name="User" size={12} />
                            {order.customer?.name || 'Khách vãng lai'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="text-sm font-bold text-foreground">{formatVND(order.total || 0)}</span>
                        <Icon
                            name="ChevronDown"
                            size={14}
                            className={`text-muted-foreground transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                        />
                    </div>
                </div>

                {/* Row 3: item preview */}
                <p className="text-[11px] text-muted-foreground mt-1.5 truncate">
                    {itemSummary || 'Không có món'}
                </p>
            </div>

            {/* Expanded detail */}
            {expanded && (
                <div className="border-t border-border bg-muted/20 px-4 py-3 space-y-3">
                    {/* Customer info - only for draft orders */}
                    {order.customer && (
                        <div className="bg-background rounded-lg px-3 py-2 border border-border">
                            <div className="flex items-center gap-2 mb-1">
                                <Icon name="UserCircle" size={14} className="text-primary" />
                                <span className="text-xs font-semibold text-foreground">Thông tin khách hàng</span>
                            </div>
                            <div className="text-xs space-y-0.5">
                                <p className="text-foreground font-medium">{order.customer.name}</p>
                                <p className="text-muted-foreground">{order.customer.contact}</p>
                            </div>
                        </div>
                    )}

                    {/* Items list */}
                    <div className="space-y-1.5">
                        {(order.items || []).map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded bg-muted text-muted-foreground text-xs flex items-center justify-center font-semibold flex-shrink-0">
                                        {item.quantity}
                                    </span>
                                    <span className="text-foreground">{item.name}</span>
                                </div>
                                <span className="text-muted-foreground text-xs">{formatVND(item.price * item.quantity)}</span>
                            </div>
                        ))}
                    </div>

                    {/* Price breakdown */}
                    <div className="border-t border-border pt-2.5 space-y-1 text-xs">
                        <div className="flex justify-between text-muted-foreground">
                            <span>Tạm tính</span>
                            <span>{formatVND(order.subtotal || 0)}</span>
                        </div>
                        {(order.discount || 0) > 0 && (
                            <div className="flex justify-between text-success font-medium">
                                <span>Giảm giá</span>
                                <span>− {formatVND(order.discount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-muted-foreground">
                            <span>Thuế (10%)</span>
                            <span>{formatVND(order.tax || 0)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-sm text-foreground pt-1.5 border-t border-border">
                            <span>Tổng cộng</span>
                            <span>{formatVND(order.total || 0)}</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {(onConfirmOrder || onReorderDraft) && order.status !== 'cancelled' && order.status !== 'completed' && (
                        <div className="flex gap-2">
                            {/* Confirm Order Button - Sends 100% data to server */}
                            {onConfirmOrder && (
                                <Button
                                    variant="default"
                                    size="sm"
                                    fullWidth
                                    iconName="CheckCircle2"
                                    iconPosition="left"
                                    onClick={(e) => { e.stopPropagation(); onConfirmOrder(order); }}
                                    className="hover-scale touch-target"
                                >
                                    Xác nhận
                                </Button>
                            )}
                            {/* Reorder Button - Add to cart for editing */}
                            {onReorderDraft && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    fullWidth
                                    iconName="RefreshCw"
                                    iconPosition="left"
                                    onClick={(e) => { e.stopPropagation(); onReorderDraft(order); }}
                                    className="hover-scale touch-target"
                                >
                                    Đặt lại
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

/* ─────────────────────────── RecentOrders ───────────────────────── */
const RecentOrders = ({ onClose, onConfirmOrder, onReorderDraft, orders = [] }) => {
    const [activeFilter, setActiveFilter] = useState('all');
    const [, forceUpdate] = useState(0);

    // Force re-render every second for real-time countdown
    useEffect(() => {
        const interval = setInterval(() => {
            forceUpdate(prev => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Filter out expired orders from display (main dashboard handles cleanup)
    const validOrders = orders.filter(o => !isOrderExpired(o));

    // Sort by expiredAt ascending (sắp hết hạn nhất lên đầu để xử lý ưu tiên)
    // Đơn không có expiredAt (đã confirmed/POS) xếp xuống cuối theo createdAt
    const sortedOrders = [...validOrders].sort((a, b) => {
        const aExp = a.expiredAt ? new Date(a.expiredAt).getTime() : Infinity;
        const bExp = b.expiredAt ? new Date(b.expiredAt).getTime() : Infinity;
        if (aExp !== bExp) return aExp - bExp; // sắp hết hạn trước lên đầu
        return new Date(a.createdAt) - new Date(b.createdAt); // cùng nhóm → cũ hơn lên trước
    });

    const filtered = activeFilter === 'all'
        ? sortedOrders
        : sortedOrders.filter(o => o.status === activeFilter);

    return (
        <div className="flex flex-col h-full">

            {/* Header — mirrors "Thực đơn" header */}
            <div className="p-4 border-b border-border flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="h-8 w-8 -ml-1 flex-shrink-0"
                            title="Quay lại thực đơn"
                        >
                            <Icon name="ArrowLeft" size={18} />
                        </Button>
                        <h1 className="text-xl font-semibold text-foreground">
                            Xác nhận đơn hàng
                        </h1>
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                            {orders.length}
                        </span>
                    </div>
                </div>

                {/* Summary stats */}
                <SummaryStrip orders={sortedOrders} />

                {/* Filter pills */}
                <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide mt-3">
                    {statusFilters.map((f) => {
                        const count = f.key === 'all'
                            ? sortedOrders.length
                            : sortedOrders.filter(o => o.status === f.key).length;
                        const active = activeFilter === f.key;
                        return (
                            <button
                                key={f.key}
                                onClick={() => setActiveFilter(f.key)}
                                className={`
                                    inline-flex items-center gap-1.5 whitespace-nowrap text-xs px-3 py-1.5
                                    rounded-full font-medium transition-all duration-150 flex-shrink-0
                                    ${active
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'}
                                `}
                            >
                                {f.label}
                                <span className={`
                                    inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold
                                    ${active
                                        ? 'bg-white/20 text-primary-foreground'
                                        : 'bg-background text-muted-foreground'}
                                `}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Order list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                        <div className="w-16 h-16 bg-muted/40 rounded-full flex items-center justify-center mb-3">
                            <Icon name="ClipboardX" size={28} className="opacity-50" />
                        </div>
                        <p className="text-sm font-medium">Không có đơn hàng nào</p>
                        <p className="text-xs mt-1 opacity-60">Thử chọn bộ lọc khác</p>
                    </div>
                ) : (
                    filtered.map((order) => (
                        <OrderCard
                            key={order._id}
                            order={order}
                            onConfirmOrder={onConfirmOrder}
                            onReorderDraft={onReorderDraft}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default RecentOrders;
