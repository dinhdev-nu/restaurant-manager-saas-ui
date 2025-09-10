import React from 'react';
import Icon from '../../../components/AppIcon';

const OrderSummaryCards = ({ summaryData }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    })?.format(amount);
  };

  const cards = [
    {
      title: "Doanh thu hôm nay",
      value: formatCurrency(summaryData?.todayRevenue),
      change: `+${summaryData?.revenueChange}%`,
      changeType: summaryData?.revenueChange >= 0 ? 'positive' : 'negative',
      icon: "TrendingUp",
      color: "bg-success"
    },
    {
      title: "Tổng đơn hàng",
      value: summaryData?.totalOrders?.toLocaleString('vi-VN'),
      change: `+${summaryData?.ordersChange}`,
      changeType: 'positive',
      icon: "Receipt",
      color: "bg-primary"
    },
    {
      title: "Giá trị trung bình",
      value: formatCurrency(summaryData?.averageOrderValue),
      change: `${summaryData?.avgChange >= 0 ? '+' : ''}${summaryData?.avgChange}%`,
      changeType: summaryData?.avgChange >= 0 ? 'positive' : 'negative',
      icon: "Calculator",
      color: "bg-accent"
    },
    {
      title: "Món phổ biến",
      value: summaryData?.popularItem,
      change: `${summaryData?.popularItemCount} lần`,
      changeType: 'neutral',
      icon: "Star",
      color: "bg-warning"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards?.map((card, index) => (
        <div key={index} className="bg-card border border-border rounded-lg p-6 hover-scale">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 ${card?.color} rounded-lg flex items-center justify-center`}>
              <Icon name={card?.icon} size={24} color="white" />
            </div>
            <div className={`text-sm font-medium ${
              card?.changeType === 'positive' ? 'text-success' : 
              card?.changeType === 'negative' ? 'text-error' : 'text-muted-foreground'
            }`}>
              {card?.change}
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-1">{card?.value}</h3>
            <p className="text-sm text-muted-foreground">{card?.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderSummaryCards;