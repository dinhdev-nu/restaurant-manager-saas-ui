import React from 'react';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';


const OrderFilters = ({
  filters,
  onFilterChange,
  onExport,
  onClearFilters
}) => {
  const statusOptions = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'pending', label: 'Chờ xử lý' },
    { value: 'processing', label: 'Đang xử lý' },
    { value: 'completed', label: 'Hoàn thành' },
    { value: 'cancelled', label: 'Đã hủy' },
    { value: 'refunded', label: 'Đã hoàn tiền' }
  ];

  const paymentStatusOptions = [
    { value: 'all', label: 'Tất cả TT thanh toán' },
    { value: 'unpaid', label: 'Chưa thanh toán' },
    { value: 'paid', label: 'Đã thanh toán' },
    { value: 'refunded', label: 'Đã hoàn tiền' }
  ];

  const paymentMethodOptions = [
    { value: 'all', label: 'Tất cả phương thức' },
    { value: 'cash', label: 'Tiền mặt' },
    { value: 'card', label: 'Thẻ tín dụng' },
    { value: 'momo', label: 'MoMo' },
    { value: 'zalopay', label: 'ZaloPay' },
    { value: 'banking', label: 'Chuyển khoản' }
  ];

  const tableOptions = [
    { value: 'all', label: 'Tất cả bàn' },
    { value: 'takeaway', label: 'Mang về' },
    { value: 'delivery', label: 'Giao hàng' },
    ...Array.from({ length: 20 }, (_, i) => ({
      value: `table-${i + 1}`,
      label: `Bàn ${i + 1}`
    }))
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Bộ lọc tìm kiếm</h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            iconName="Download"
            iconPosition="left"
            onClick={onExport}
            className="hover-scale"
          >
            Xuất Excel
          </Button>
          <Button
            variant="ghost"
            size="sm"
            iconName="RotateCcw"
            iconPosition="left"
            onClick={onClearFilters}
            className="hover-scale"
          >
            Xóa bộ lọc
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
        <Input
          type="date"
          label="Từ ngày"
          value={filters?.startDate}
          onChange={(e) => onFilterChange('startDate', e?.target?.value)}
          className="w-full"
        />

        <Input
          type="date"
          label="Đến ngày"
          value={filters?.endDate}
          onChange={(e) => onFilterChange('endDate', e?.target?.value)}
          className="w-full"
        />

        <Select
          label="Trạng thái đơn"
          options={statusOptions}
          value={filters?.status}
          onChange={(value) => onFilterChange('status', value)}
          className="w-full"
        />

        <Select
          label="TT Thanh toán"
          options={paymentStatusOptions}
          value={filters?.paymentStatus}
          onChange={(value) => onFilterChange('paymentStatus', value)}
          className="w-full"
        />

        <Select
          label="Phương thức TT"
          options={paymentMethodOptions}
          value={filters?.paymentMethod}
          onChange={(value) => onFilterChange('paymentMethod', value)}
          className="w-full"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          type="search"
          label="Tìm kiếm khách hàng"
          placeholder="Tên, số điện thoại, mã đơn..."
          value={filters?.searchQuery}
          onChange={(e) => onFilterChange('searchQuery', e?.target?.value)}
          className="w-full"
        />

        <Select
          label="Bàn/Khu vực"
          options={tableOptions}
          value={filters?.table}
          onChange={(value) => onFilterChange('table', value)}
          searchable
          className="w-full"
        />

        <div className="flex items-end space-x-2">
          <Input
            type="number"
            label="Giá trị từ (VND)"
            placeholder="0"
            value={filters?.minAmount}
            onChange={(e) => onFilterChange('minAmount', e?.target?.value)}
            className="flex-1"
          />
          <Input
            type="number"
            label="Đến (VND)"
            placeholder="999999999"
            value={filters?.maxAmount}
            onChange={(e) => onFilterChange('maxAmount', e?.target?.value)}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
};

export default OrderFilters;