import React from 'react';
import Icon from '../../../../components/AppIcon';

const MenuStats = ({ items = [] }) => {
  const stats = {
    total: items.length,
    available: items.filter(item => item.status === 'available').length,
    lowStock: items.filter(item => item.status === 'low_stock').length,
    unavailable: items.filter(item => item.status === 'unavailable').length,
    avgPrice: items.length > 0 ? items.reduce((sum, item) => sum + item.price, 0) / items.length : 0,
    totalRevenue: items.reduce((sum, item) => sum + (item.price * (item.stock_quantity || 0)), 0)
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const getPercentage = (value, total) => {
    return total > 0 ? ((value / total) * 100).toFixed(1) : 0;
  };

  const statCards = [
    {
      label: 'Tổng món ăn',
      value: stats.total,
      icon: 'Utensils',
      iconColor: 'text-blue-500',
      bgGradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
      borderColor: 'border-blue-500/20',
      trend: null,
      description: 'Trong thực đơn'
    },
    {
      label: 'Sẵn sàng',
      value: stats.available,
      icon: 'CheckCircle2',
      iconColor: 'text-emerald-500',
      bgGradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      borderColor: 'border-emerald-500/20',
      trend: `${getPercentage(stats.available, stats.total)}%`,
      description: 'Có thể bán'
    },
    {
      label: 'Sắp hết',
      value: stats.lowStock,
      icon: 'AlertTriangle',
      iconColor: 'text-amber-500',
      bgGradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
      borderColor: 'border-amber-500/20',
      trend: stats.lowStock > 0 ? 'Cần nhập' : null,
      description: 'Tồn kho thấp'
    },
    {
      label: 'Hết hàng',
      value: stats.unavailable,
      icon: 'XCircle',
      iconColor: 'text-rose-500',
      bgGradient: 'from-rose-500/10 via-rose-500/5 to-transparent',
      borderColor: 'border-rose-500/20',
      trend: stats.unavailable > 0 ? 'Cảnh báo' : null,
      description: 'Không khả dụng'
    }
  ];

  return (
    <div className="space-y-3">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className={`group relative overflow-hidden rounded-lg border ${stat.borderColor} bg-white dark:bg-card backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01]`}
          >
            {/* Content */}
            <div className="relative p-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bgGradient} ring-1 ring-inset ${stat.borderColor}`}>
                  <Icon name={stat.icon} size={18} className={stat.iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-foreground">
                    {formatNumber(stat.value)}
                  </h3>
                  <p className="text-xs font-medium text-gray-600 dark:text-muted-foreground truncate">
                    {stat.label}
                  </p>
                </div>
                {stat.trend && (
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${stat.trend.includes('%')
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                    }`}>
                    {stat.trend}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Financial Overview Card */}
      <div className="relative overflow-hidden rounded-lg border border-gray-200 dark:border-purple-500/20 bg-white dark:bg-gradient-to-br dark:from-purple-500/10 dark:via-purple-500/5 dark:to-transparent backdrop-blur-sm">
        <div className="relative p-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Average Price */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-gradient-to-br dark:from-purple-500/10 dark:via-purple-500/5 dark:to-transparent ring-1 ring-inset ring-purple-200 dark:ring-purple-500/20">
                <Icon name="TrendingUp" size={16} className="text-purple-600 dark:text-purple-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium text-gray-600 dark:text-muted-foreground">
                  Giá TB
                </p>
                <p className="text-sm font-bold text-gray-900 dark:text-foreground truncate">
                  {formatPrice(stats.avgPrice)}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px h-8 bg-gray-200 dark:bg-border"></div>

            {/* Total Inventory Value */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="p-2 rounded-lg bg-indigo-100 dark:bg-gradient-to-br dark:from-indigo-500/10 dark:via-indigo-500/5 dark:to-transparent ring-1 ring-inset ring-indigo-200 dark:ring-indigo-500/20">
                <Icon name="DollarSign" size={16} className="text-indigo-600 dark:text-indigo-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium text-gray-600 dark:text-muted-foreground">
                  Tồn kho
                </p>
                <p className="text-sm font-bold text-gray-900 dark:text-foreground truncate">
                  {formatPrice(stats.totalRevenue)}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px h-8 bg-gray-200 dark:bg-border"></div>

            {/* Stock Status Summary */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="p-2 rounded-lg bg-cyan-100 dark:bg-gradient-to-br dark:from-cyan-500/10 dark:via-cyan-500/5 dark:to-transparent ring-1 ring-inset ring-cyan-200 dark:ring-cyan-500/20">
                <Icon name="Package" size={16} className="text-cyan-600 dark:text-cyan-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium text-gray-600 dark:text-muted-foreground">
                  Trạng thái
                </p>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span className="font-semibold text-gray-900 dark:text-foreground">{stats.available}</span>
                  </span>
                  <span className="text-gray-400">|</span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    <span className="font-semibold text-gray-900 dark:text-foreground">{stats.lowStock}</span>
                  </span>
                  <span className="text-gray-400">|</span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    <span className="font-semibold text-gray-900 dark:text-foreground">{stats.unavailable}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuStats;