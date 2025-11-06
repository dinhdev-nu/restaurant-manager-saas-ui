import React from 'react';
import Icon from '../../../../components/AppIcon';

const MenuStats = ({ items = [] }) => {
  const stats = {
    total: items?.length,
    available: items?.filter(item => item?.status === 'available')?.length,
    lowStock: items?.filter(item => item?.status === 'low_stock')?.length,
    unavailable: items?.filter(item => item?.status === 'unavailable')?.length,
    avgPrice: items?.length > 0 ? items?.reduce((sum, item) => sum + item?.price, 0) / items?.length : 0
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    })?.format(price);
  };

  const statCards = [
    {
      label: 'Tổng món',
      value: stats?.total,
      icon: 'Utensils',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      label: 'Có sẵn',
      value: stats?.available,
      icon: 'CheckCircle',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      label: 'Sắp hết',
      value: stats?.lowStock,
      icon: 'AlertTriangle',
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      label: 'Hết hàng',
      value: stats?.unavailable,
      icon: 'XCircle',
      color: 'text-error',
      bgColor: 'bg-error/10'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards?.map((stat, index) => (
        <div key={index} className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg ${stat?.bgColor} flex items-center justify-center`}>
              <Icon name={stat?.icon} size={20} className={stat?.color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat?.value}</p>
              <p className="text-sm text-muted-foreground">{stat?.label}</p>
            </div>
          </div>
        </div>
      ))}
      {/* Average price card */}
      <div className="bg-card border border-border rounded-lg p-4 col-span-2 lg:col-span-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Icon name="TrendingUp" size={20} className="text-accent" />
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">
              {formatPrice(stats?.avgPrice)}
            </p>
            <p className="text-sm text-muted-foreground">Giá trung bình</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuStats;