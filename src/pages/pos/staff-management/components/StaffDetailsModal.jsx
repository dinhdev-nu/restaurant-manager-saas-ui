import React from 'react';
import Icon from '../../../../components/AppIcon';
import Image from '../../../../components/AppImage';
import Button from '../../../../components/ui/Button';

const StaffDetailsModal = ({ isOpen, onClose, staff }) => {
  if (!isOpen || !staff) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-success';
      case 'on-break': return 'text-warning';
      case 'inactive': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'active': return 'bg-success/10';
      case 'on-break': return 'bg-warning/10';
      case 'inactive': return 'bg-error/10';
      default: return 'bg-muted/10';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'owner': return 'bg-primary text-primary-foreground';
      case 'manager': return 'bg-accent text-accent-foreground';
      case 'cashier': return 'bg-secondary text-secondary-foreground';
      case 'kitchen': return 'bg-success text-success-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const performanceData = [
    { label: 'Đơn hàng hôm nay', value: staff?.ordersToday, icon: 'Receipt' },
    { label: 'Giờ làm việc', value: `${staff?.hoursWorked}h`, icon: 'Clock' },
    { label: 'Đánh giá trung bình', value: '4.8/5', icon: 'Star' },
    { label: 'Khách hàng phục vụ', value: '156', icon: 'Users' }
  ];

  const recentActivities = [
    { time: '14:30', action: 'Xử lý đơn hàng #1234', type: 'order' },
    { time: '14:15', action: 'Thanh toán bàn số 5', type: 'payment' },
    { time: '14:00', action: 'Bắt đầu ca làm việc', type: 'checkin' },
    { time: '13:45', action: 'Cập nhật thực đơn', type: 'update' }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'order': return 'Receipt';
      case 'payment': return 'CreditCard';
      case 'checkin': return 'LogIn';
      case 'update': return 'Edit';
      default: return 'Activity';
    }
  };

  return (
    <div className="fixed inset-0 z-1200 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative bg-card border border-border rounded-lg shadow-modal w-full max-w-4xl max-h-[90vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-muted">
                <Image
                  src={staff?.avatar}
                  alt={staff?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className={`
                absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-card
                ${staff?.status === 'active' ? 'bg-success' : staff?.status === 'on-break' ? 'bg-warning' : 'bg-error'}
              `} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-card-foreground">{staff?.name}</h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`
                  px-2 py-1 rounded-full text-xs font-medium
                  ${getRoleColor(staff?.role)}
                `}>
                  {staff?.roleDisplay}
                </span>
                <span className={`
                  px-2 py-1 rounded-full text-xs font-medium
                  ${getStatusBg(staff?.status)} ${getStatusColor(staff?.status)}
                `}>
                  {staff?.statusDisplay}
                </span>
              </div>
            </div>
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
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-card-foreground flex items-center space-x-2">
                  <Icon name="User" size={18} />
                  <span>Thông tin cá nhân</span>
                </h3>

                <div className="bg-muted/20 rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    <Icon name="Badge" size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Mã nhân viên</p>
                      <p className="font-medium text-card-foreground">{staff?.employeeId}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Icon name="Phone" size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Số điện thoại</p>
                      <p className="font-medium text-card-foreground">{staff?.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Icon name="Mail" size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium text-card-foreground">{staff?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Icon name="Calendar" size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Ngày vào làm</p>
                      <p className="font-medium text-card-foreground">15/08/2024</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Work Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-card-foreground flex items-center space-x-2">
                  <Icon name="Briefcase" size={18} />
                  <span>Thông tin công việc</span>
                </h3>

                <div className="bg-muted/20 rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    <Icon name="Clock" size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Ca làm việc</p>
                      <p className="font-medium text-card-foreground">{staff?.shift}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Icon name="Timer" size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Giờ làm việc</p>
                      <p className="font-medium text-card-foreground">{staff?.workingHours}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Icon name="DollarSign" size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Mức lương</p>
                      <p className="font-medium text-card-foreground">8.500.000 VND</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Icon name="LogIn" size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Lần đăng nhập cuối</p>
                      <p className="font-medium text-card-foreground">Hôm nay, 14:30</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-card-foreground flex items-center space-x-2">
                <Icon name="TrendingUp" size={18} />
                <span>Hiệu suất làm việc</span>
              </h3>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {performanceData?.map((item, index) => (
                  <div key={index} className="bg-muted/20 rounded-lg p-4 text-center">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Icon name={item?.icon} size={20} className="text-primary" />
                    </div>
                    <p className="text-lg font-semibold text-card-foreground">{item?.value}</p>
                    <p className="text-sm text-muted-foreground">{item?.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activities */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-card-foreground flex items-center space-x-2">
                <Icon name="Activity" size={18} />
                <span>Hoạt động gần đây</span>
              </h3>

              <div className="bg-muted/20 rounded-lg p-4">
                <div className="space-y-3">
                  {recentActivities?.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 hover:bg-muted/30 rounded-lg transition-smooth">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon name={getActivityIcon(activity?.type)} size={14} className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-card-foreground">{activity?.action}</p>
                        <p className="text-xs text-muted-foreground">{activity?.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-card-foreground flex items-center space-x-2">
                <Icon name="Shield" size={18} />
                <span>Quyền truy cập</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted/20 rounded-lg p-4">
                  <h4 className="font-medium text-card-foreground mb-3">Được phép</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-success">
                      <Icon name="Check" size={14} />
                      <span>Xử lý đơn hàng</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-success">
                      <Icon name="Check" size={14} />
                      <span>Thanh toán</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-success">
                      <Icon name="Check" size={14} />
                      <span>Quản lý bàn</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-success">
                      <Icon name="Check" size={14} />
                      <span>Xem báo cáo</span>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/20 rounded-lg p-4">
                  <h4 className="font-medium text-card-foreground mb-3">Bị hạn chế</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-error">
                      <Icon name="X" size={14} />
                      <span>Quản lý nhân viên</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-error">
                      <Icon name="X" size={14} />
                      <span>Cài đặt hệ thống</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-error">
                      <Icon name="X" size={14} />
                      <span>Xóa dữ liệu</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-error">
                      <Icon name="X" size={14} />
                      <span>Báo cáo tài chính</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border bg-muted/20">
          <Button
            variant="outline"
            iconName="Edit"
            iconPosition="left"
          >
            Chỉnh sửa
          </Button>
          <Button
            variant="default"
            onClick={onClose}
          >
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StaffDetailsModal;