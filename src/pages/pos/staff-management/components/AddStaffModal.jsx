import React, { useState } from 'react';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';

const AddStaffModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    role: '',
    shift: '',
    workingHours: '',
    salary: '',
    startDate: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const roleOptions = [
    { value: 'owner', label: 'Chủ cửa hàng' },
    { value: 'manager', label: 'Quản lý' },
    { value: 'cashier', label: 'Thu ngân' },
    { value: 'kitchen', label: 'Nhân viên bếp' },
    { value: 'waiter', label: 'Phục vụ' },
    { value: 'cleaner', label: 'Vệ sinh' }
  ];

  const shiftOptions = [
    { value: 'morning', label: 'Ca sáng (6:00 - 14:00)' },
    { value: 'afternoon', label: 'Ca chiều (14:00 - 22:00)' },
    { value: 'night', label: 'Ca đêm (22:00 - 6:00)' },
    { value: 'full-time', label: 'Toàn thời gian' },
    { value: 'part-time', label: 'Bán thời gian' }
  ];

  const workingHoursOptions = [
    { value: '4h', label: '4 giờ/ngày' },
    { value: '6h', label: '6 giờ/ngày' },
    { value: '8h', label: '8 giờ/ngày' },
    { value: '10h', label: '10 giờ/ngày' },
    { value: '12h', label: '12 giờ/ngày' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.name?.trim()) {
      newErrors.name = 'Vui lòng nhập họ tên';
    }

    if (!formData?.phone?.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/?.test(formData?.phone?.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!formData?.email?.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData?.role) {
      newErrors.role = 'Vui lòng chọn vai trò';
    }

    if (!formData?.shift) {
      newErrors.shift = 'Vui lòng chọn ca làm việc';
    }

    if (!formData?.workingHours) {
      newErrors.workingHours = 'Vui lòng chọn số giờ làm việc';
    }

    if (!formData?.salary?.trim()) {
      newErrors.salary = 'Vui lòng nhập mức lương';
    }

    if (!formData?.startDate) {
      newErrors.startDate = 'Vui lòng chọn ngày bắt đầu';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newStaff = {
        id: Date.now(),
        ...formData,
        avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 50) + 1}.jpg`,
        employeeId: `NV${String(Date.now())?.slice(-4)}`,
        status: 'active',
        statusDisplay: 'Đang làm việc',
        roleDisplay: roleOptions?.find(r => r?.value === formData?.role)?.label || formData?.role,
        ordersToday: 0,
        hoursWorked: 0,
        joinDate: formData?.startDate,
        lastLogin: new Date()?.toISOString()
      };

      onSave(newStaff);
      onClose();

      // Reset form
      setFormData({
        name: '',
        phone: '',
        email: '',
        role: '',
        shift: '',
        workingHours: '',
        salary: '',
        startDate: '',
        address: '',
        emergencyContact: '',
        emergencyPhone: '',
        notes: ''
      });

    } catch (error) {
      console.error('Error adding staff:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-1200 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative bg-card border border-border rounded-lg shadow-modal w-full max-w-2xl max-h-[90vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="UserPlus" size={20} color="white" />
            </div>
            <h2 className="text-xl font-semibold text-card-foreground">Thêm nhân viên mới</h2>
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
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-card-foreground flex items-center space-x-2">
                <Icon name="User" size={18} />
                <span>Thông tin cơ bản</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Họ và tên *"
                  type="text"
                  placeholder="Nhập họ tên đầy đủ"
                  value={formData?.name}
                  onChange={(e) => handleInputChange('name', e?.target?.value)}
                  error={errors?.name}
                  required
                />

                <Input
                  label="Số điện thoại *"
                  type="tel"
                  placeholder="0123 456 789"
                  value={formData?.phone}
                  onChange={(e) => handleInputChange('phone', e?.target?.value)}
                  error={errors?.phone}
                  required
                />

                <Input
                  label="Email *"
                  type="email"
                  placeholder="example@email.com"
                  value={formData?.email}
                  onChange={(e) => handleInputChange('email', e?.target?.value)}
                  error={errors?.email}
                  required
                  className="md:col-span-2"
                />

                <Input
                  label="Địa chỉ"
                  type="text"
                  placeholder="Nhập địa chỉ"
                  value={formData?.address}
                  onChange={(e) => handleInputChange('address', e?.target?.value)}
                  className="md:col-span-2"
                />
              </div>
            </div>

            {/* Work Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-card-foreground flex items-center space-x-2">
                <Icon name="Briefcase" size={18} />
                <span>Thông tin công việc</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Vai trò *"
                  placeholder="Chọn vai trò"
                  options={roleOptions}
                  value={formData?.role}
                  onChange={(value) => handleInputChange('role', value)}
                  error={errors?.role}
                  required
                />

                <Select
                  label="Ca làm việc *"
                  placeholder="Chọn ca làm việc"
                  options={shiftOptions}
                  value={formData?.shift}
                  onChange={(value) => handleInputChange('shift', value)}
                  error={errors?.shift}
                  required
                />

                <Select
                  label="Số giờ làm việc *"
                  placeholder="Chọn số giờ"
                  options={workingHoursOptions}
                  value={formData?.workingHours}
                  onChange={(value) => handleInputChange('workingHours', value)}
                  error={errors?.workingHours}
                  required
                />

                <Input
                  label="Mức lương *"
                  type="text"
                  placeholder="VD: 8.000.000 VND"
                  value={formData?.salary}
                  onChange={(e) => handleInputChange('salary', e?.target?.value)}
                  error={errors?.salary}
                  required
                />

                <Input
                  label="Ngày bắt đầu *"
                  type="date"
                  value={formData?.startDate}
                  onChange={(e) => handleInputChange('startDate', e?.target?.value)}
                  error={errors?.startDate}
                  required
                  className="md:col-span-2"
                />
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-card-foreground flex items-center space-x-2">
                <Icon name="Phone" size={18} />
                <span>Liên hệ khẩn cấp</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Tên người liên hệ"
                  type="text"
                  placeholder="Họ tên người thân"
                  value={formData?.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e?.target?.value)}
                />

                <Input
                  label="Số điện thoại khẩn cấp"
                  type="tel"
                  placeholder="0123 456 789"
                  value={formData?.emergencyPhone}
                  onChange={(e) => handleInputChange('emergencyPhone', e?.target?.value)}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-card-foreground flex items-center space-x-2">
                <Icon name="FileText" size={18} />
                <span>Ghi chú</span>
              </h3>

              <textarea
                placeholder="Ghi chú thêm về nhân viên..."
                value={formData?.notes}
                onChange={(e) => handleInputChange('notes', e?.target?.value)}
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border bg-muted/20">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Hủy bỏ
          </Button>
          <Button
            variant="default"
            onClick={handleSubmit}
            loading={isLoading}
            iconName="UserPlus"
            iconPosition="left"
          >
            Thêm nhân viên
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddStaffModal;