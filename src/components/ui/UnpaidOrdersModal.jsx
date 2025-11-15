import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import { useOrderStore } from '../../stores/order.store';

const UnpaidOrdersModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const getUnpaidOrders = useOrderStore((state) => state.getUnpaidOrders);
    const [unpaidOrders, setUnpaidOrders] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        if (isOpen) {
            const orders = getUnpaidOrders();
            setUnpaidOrders(orders);
        }
    }, [isOpen, getUnpaidOrders]);

    if (!isOpen) return null;

    const handlePayNow = (order) => {
        // Don't call onClose here, navigate directly
        navigate('/payment-processing', { state: { order } });
    };

    // Filter orders
    const filteredOrders = unpaidOrders.filter(order => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            order.id.toLowerCase().includes(query) ||
            order.table.toLowerCase().includes(query) ||
            order.items.some(item => item.name.toLowerCase().includes(query))
        );
    });

    const getTotalUnpaidAmount = () => {
        return unpaidOrders.reduce((sum, order) => sum + order.total, 0);
    };

    const getTimeAgo = (timestamp) => {
        const now = new Date();
        const orderTime = new Date(timestamp);
        const diffMs = now - orderTime;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Vừa xong';
        if (diffMins < 60) return `${diffMins}p`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal - Light/Clean Style */}
            <div className="relative bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[500px] flex flex-col overflow-hidden">

                {/* Header - Fixed - Minimal & Clean */}
                <div className="px-6 py-5 border-b border-gray-100 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-1">
                                Chưa thanh toán
                            </h2>
                            <p className="text-sm text-gray-500">
                                {unpaidOrders.length} đơn · {getTotalUnpaidAmount().toLocaleString('vi-VN')}₫
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <Icon name="X" size={18} />
                        </button>
                    </div>

                    {/* Search - Only show if there are orders */}
                    {unpaidOrders.length > 0 && (
                        <div className="mt-4">
                            <div className="relative">
                                <Icon
                                    name="Search"
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Orders List - Scrollable */}
                <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
                    {filteredOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                <Icon name="Receipt" size={28} className="text-gray-400" />
                            </div>
                            <h3 className="text-base font-medium text-gray-900 mb-1">
                                {searchQuery ? 'Không tìm thấy' : 'Không có đơn chưa thanh toán'}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {searchQuery
                                    ? 'Thử tìm kiếm với từ khóa khác'
                                    : 'Tất cả đơn hàng đã được thanh toán'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredOrders.map((order) => (
                                <button
                                    key={order.id}
                                    onClick={() => setSelectedOrder(order)}
                                    onDoubleClick={() => handlePayNow(order)}
                                    className={`
                    w-full text-left p-4 rounded-xl border transition-all
                    ${selectedOrder?.id === order.id
                                            ? 'bg-blue-50 border-blue-200 shadow-sm'
                                            : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm'
                                        }
                  `}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        {/* Left - Order Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="font-semibold text-gray-900 text-sm">
                                                    {order.id}
                                                </span>
                                                <span className="text-xs text-gray-400">·</span>
                                                <span className="text-xs text-gray-600">
                                                    {order.table}
                                                </span>
                                                <span className="text-xs text-gray-400">·</span>
                                                <span className="text-xs text-gray-500">
                                                    {getTimeAgo(order.timestamp)}
                                                </span>
                                            </div>

                                            {/* Items Preview */}
                                            <div className="space-y-1">
                                                {order.items.slice(0, 2).map((item, idx) => (
                                                    <div key={idx} className="text-xs text-gray-600 truncate">
                                                        {item.quantity}× {item.name}
                                                    </div>
                                                ))}
                                                {order.items.length > 2 && (
                                                    <div className="text-xs text-gray-400">
                                                        +{order.items.length - 2} món khác
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right - Amount */}
                                        <div className="flex flex-col items-end gap-2 shrink-0">
                                            <div className="text-sm font-semibold text-gray-900">
                                                {order.total.toLocaleString('vi-VN')}₫
                                            </div>
                                            <div className="text-xs text-orange-600 px-2 py-0.5 rounded-md bg-orange-50 border border-orange-200">
                                                Chưa thanh toán
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer - Fixed - Only show when order is selected */}
                {selectedOrder && (
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex-shrink-0">
                        <div className="flex items-center justify-between gap-4">
                            <div className="text-sm text-gray-600">
                                Đã chọn: <span className="text-gray-900 font-semibold">{selectedOrder.id}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-white transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={() => handlePayNow(selectedOrder)}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                                >
                                    <Icon name="CreditCard" size={16} />
                                    Thanh toán
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UnpaidOrdersModal;
