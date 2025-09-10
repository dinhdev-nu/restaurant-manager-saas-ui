import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const OrderTable = ({ orders, onViewDetails, onReprintReceipt }) => {
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });

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
      cancelled: { color: 'bg-error text-error-foreground', label: 'Đã hủy' },
      refunded: { color: 'bg-secondary text-secondary-foreground', label: 'Đã hoàn tiền' }
    };

    const config = statusConfig?.[status] || statusConfig?.completed;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config?.color}`}>
        {config?.label}
      </span>
    );
  };

  const getPaymentMethodIcon = (method) => {
    const methodConfig = {
      cash: 'Banknote',
      card: 'CreditCard',
      momo: 'Smartphone',
      zalopay: 'Smartphone',
      banking: 'Building'
    };
    return methodConfig?.[method] || 'CreditCard';
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
              <th className="text-left p-4 font-medium text-muted-foreground">Khách hàng/Bàn</th>
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
              <th className="text-left p-4 font-medium text-muted-foreground">Thanh toán</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Trạng thái</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {sortedOrders?.map((order) => (
              <React.Fragment key={order?.id}>
                <tr className="border-b border-border hover:bg-muted/30 transition-smooth">
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleRowExpansion(order?.id)}
                        className="w-6 h-6"
                      >
                        <Icon 
                          name={expandedRows?.has(order?.id) ? "ChevronDown" : "ChevronRight"} 
                          size={16} 
                        />
                      </Button>
                      <span className="font-mono text-sm font-medium">#{order?.id}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      <div className="font-medium text-foreground">
                        {formatDateTime(order?.timestamp)}
                      </div>
                      <div className="text-muted-foreground">
                        {order?.staff}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      <div className="font-medium text-foreground">
                        {order?.customer || 'Khách lẻ'}
                      </div>
                      <div className="text-muted-foreground">
                        {order?.table}
                      </div>
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
                    <div className="flex items-center space-x-2">
                      <Icon 
                        name={getPaymentMethodIcon(order?.paymentMethod)} 
                        size={16} 
                        className="text-muted-foreground" 
                      />
                      <span className="text-sm text-muted-foreground capitalize">
                        {order?.paymentMethod === 'cash' ? 'Tiền mặt' :
                         order?.paymentMethod === 'card' ? 'Thẻ' :
                         order?.paymentMethod === 'momo' ? 'MoMo' :
                         order?.paymentMethod === 'zalopay' ? 'ZaloPay' :
                         order?.paymentMethod === 'banking' ? 'Chuyển khoản' : order?.paymentMethod}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(order?.status)}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onViewDetails(order)}
                        className="hover-scale"
                      >
                        <Icon name="Eye" size={16} />
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
                {expandedRows?.has(order?.id) && (
                  <tr className="bg-muted/20">
                    <td colSpan="8" className="p-4">
                      <div className="space-y-4">
                        <h4 className="font-medium text-foreground">Chi tiết đơn hàng</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-sm text-muted-foreground mb-2">Món ăn đã order</h5>
                            <div className="space-y-2">
                              {order?.items?.map((item, index) => (
                                <div key={index} className="flex justify-between items-center text-sm">
                                  <span className="text-foreground">
                                    {item?.quantity}x {item?.name}
                                  </span>
                                  <span className="font-medium text-foreground">
                                    {formatCurrency(item?.price * item?.quantity)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h5 className="font-medium text-sm text-muted-foreground mb-2">Ghi chú đặc biệt</h5>
                            <p className="text-sm text-foreground">
                              {order?.specialInstructions || 'Không có ghi chú đặc biệt'}
                            </p>
                            {order?.customer && (
                              <div className="mt-3">
                                <h5 className="font-medium text-sm text-muted-foreground mb-1">Thông tin khách hàng</h5>
                                <p className="text-sm text-foreground">{order?.customerPhone}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
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
          <div key={order?.id} className="border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm font-medium">#{order?.id}</span>
                {getStatusBadge(order?.status)}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewDetails(order)}
                  className="w-8 h-8"
                >
                  <Icon name="Eye" size={16} />
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
                <span className="text-muted-foreground">Khách hàng:</span>
                <p className="font-medium text-foreground">{order?.customer || 'Khách lẻ'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Bàn:</span>
                <p className="font-medium text-foreground">{order?.table}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="flex items-center space-x-2">
                <Icon 
                  name={getPaymentMethodIcon(order?.paymentMethod)} 
                  size={16} 
                  className="text-muted-foreground" 
                />
                <span className="text-sm text-muted-foreground">
                  {order?.paymentMethod === 'cash' ? 'Tiền mặt' :
                   order?.paymentMethod === 'card' ? 'Thẻ' :
                   order?.paymentMethod === 'momo' ? 'MoMo' :
                   order?.paymentMethod === 'zalopay' ? 'ZaloPay' :
                   order?.paymentMethod === 'banking' ? 'Chuyển khoản' : order?.paymentMethod}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {order?.items?.length} món • {order?.staff}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderTable;