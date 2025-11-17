import React, { useState, useEffect } from 'react';
import Icon from '../../../../components/AppIcon';
import Image from '../../../../components/AppImage';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import {
    formatPhoneNumber,
    parsePhoneNumber,
    formatCurrency,
    parseCurrency,
    digitsOnly
} from '../../../../utils/formatters';

const StaffFormModal = ({ isOpen, onClose, onSave, staff, mode = 'add' }) => {
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
        notes: '',
        avatar: ''
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

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

    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && staff) {
                setFormData({
                    name: staff.name || '',
                    phone: staff.phone ? formatPhoneNumber(parsePhoneNumber(staff.phone)) : '',
                    email: staff.email || '',
                    role: staff.role || '',
                    shift: staff.shift || '',
                    workingHours: staff.workingHours || '',
                    salary: staff.salary ? formatCurrency(parseCurrency(staff.salary.toString())) : '',
                    startDate: staff.joinDate || '',
                    address: staff.address || '',
                    emergencyContact: staff.emergencyContact || '',
                    emergencyPhone: staff.emergencyPhone ? formatPhoneNumber(parsePhoneNumber(staff.emergencyPhone)) : '',
                    notes: staff.notes || '',
                    avatar: staff.avatar || ''
                });
                setImagePreview(staff.avatar || null);
                setImageFile(null);
            } else {
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
                    notes: '',
                    avatar: ''
                });
                setImagePreview(null);
                setImageFile(null);
            }
            setErrors({});
        }
    }, [staff, isOpen, mode]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const handlePhoneChange = (field, value) => {
        const cleaned = digitsOnly(value, 11);
        const formatted = formatPhoneNumber(cleaned);
        handleInputChange(field, formatted);
    };

    const handleSalaryChange = (value) => {
        const cleaned = digitsOnly(value);
        const formatted = formatCurrency(cleaned);
        handleInputChange('salary', formatted);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                setErrors(prev => ({
                    ...prev,
                    avatar: 'Chỉ chấp nhận file ảnh (JPG, PNG, GIF)'
                }));
                return;
            }

            // Validate file size (max 5MB)
            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                setErrors(prev => ({
                    ...prev,
                    avatar: 'Kích thước ảnh không được vượt quá 5MB'
                }));
                return;
            }

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setImageFile(file);
                setErrors(prev => ({
                    ...prev,
                    avatar: ''
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setImagePreview(null);
        setImageFile(null);
        setFormData(prev => ({
            ...prev,
            avatar: ''
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Vui lòng nhập họ tên';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Vui lòng nhập số điện thoại';
        } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
            newErrors.phone = 'Số điện thoại không hợp lệ';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Vui lòng nhập email';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }

        if (!formData.role) {
            newErrors.role = 'Vui lòng chọn vai trò';
        }

        if (!formData.shift) {
            newErrors.shift = 'Vui lòng chọn ca làm việc';
        }

        if (!formData.workingHours) {
            newErrors.workingHours = 'Vui lòng chọn số giờ làm việc';
        }

        if (mode === 'add' && !formData.salary.trim()) {
            newErrors.salary = 'Vui lòng nhập mức lương';
        }

        if (mode === 'add' && !formData.startDate) {
            newErrors.startDate = 'Vui lòng chọn ngày bắt đầu';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            if (mode === 'edit') {
                const updatedStaff = {
                    ...staff,
                    ...formData,
                    avatar: imagePreview || staff.avatar,
                    roleDisplay: roleOptions.find(r => r.value === formData.role)?.label || formData.role,
                };
                onSave(updatedStaff);
            } else {
                const newStaff = {
                    id: Date.now(),
                    ...formData,
                    avatar: imagePreview || `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 50) + 1}.jpg`,
                    employeeId: `NV${String(Date.now()).slice(-4)}`,
                    status: 'active',
                    statusDisplay: 'Đang làm việc',
                    roleDisplay: roleOptions.find(r => r.value === formData.role)?.label || formData.role,
                    joinDate: formData.startDate
                };
                onSave(newStaff);
            }

            onClose();
        } catch (error) {
            console.error('Error saving staff:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const isEditMode = mode === 'edit';
    const title = isEditMode ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới';
    const icon = isEditMode ? 'Edit' : 'UserPlus';
    const submitText = isEditMode ? 'Lưu thay đổi' : 'Thêm nhân viên';
    const submitIcon = isEditMode ? 'Save' : 'UserPlus';

    return (
        <div className="fixed inset-0 z-1200 flex items-center justify-center overflow-hidden">
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
                            <Icon name={icon} size={20} color="white" />
                        </div>
                        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
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
                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {/* Avatar Upload */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-foreground flex items-center space-x-2">
                            <Icon name="Image" size={18} />
                            <span>Ảnh đại diện</span>
                        </h3>

                        <div className="flex items-center space-x-6">
                            {/* Preview */}
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full overflow-hidden bg-muted border-2 border-border">
                                    {imagePreview ? (
                                        <Image
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Icon name="User" size={40} className="text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                                {imagePreview && (
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="absolute -top-1 -right-1 w-6 h-6 bg-error rounded-full flex items-center justify-center hover:bg-error/80 transition-colors"
                                    >
                                        <Icon name="X" size={14} color="white" />
                                    </button>
                                )}
                            </div>

                            {/* Upload Button */}
                            <div className="flex-1">
                                <label
                                    htmlFor="avatar-upload"
                                    className="inline-flex items-center px-4 py-2 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                                >
                                    <Icon name="Upload" size={18} className="mr-2" />
                                    <span className="text-sm font-medium">Chọn ảnh</span>
                                </label>
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/gif"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                                <p className="text-xs text-muted-foreground mt-2">
                                    JPG, PNG, GIF tối đa 5MB
                                </p>
                                {errors.avatar && (
                                    <p className="text-xs text-error mt-1">{errors.avatar}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-foreground flex items-center space-x-2">
                            <Icon name="User" size={18} />
                            <span>Thông tin cơ bản</span>
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Họ và tên"
                                type="text"
                                placeholder="Nhập họ tên đầy đủ"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                error={errors.name}
                                required
                            />

                            <Input
                                label="Số điện thoại"
                                type="tel"
                                placeholder="0123 456 789"
                                value={formData.phone}
                                onChange={(e) => handlePhoneChange('phone', e.target.value)}
                                error={errors.phone}
                                required
                            />

                            <Input
                                label="Email"
                                type="email"
                                placeholder="example@email.com"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                error={errors.email}
                                required
                                className="md:col-span-2"
                            />

                            <Input
                                label="Địa chỉ"
                                type="text"
                                placeholder="Nhập địa chỉ"
                                value={formData.address}
                                onChange={(e) => handleInputChange('address', e.target.value)}
                                className="md:col-span-2"
                            />
                        </div>
                    </div>

                    {/* Work Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-foreground flex items-center space-x-2">
                            <Icon name="Briefcase" size={18} />
                            <span>Thông tin công việc</span>
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Select
                                label="Vai trò"
                                placeholder="Chọn vai trò"
                                options={roleOptions}
                                value={formData.role}
                                onChange={(value) => handleInputChange('role', value)}
                                error={errors.role}
                                required
                            />

                            <Select
                                label="Ca làm việc"
                                placeholder="Chọn ca làm việc"
                                options={shiftOptions}
                                value={formData.shift}
                                onChange={(value) => handleInputChange('shift', value)}
                                error={errors.shift}
                                required
                            />

                            <Select
                                label="Số giờ làm việc"
                                placeholder="Chọn số giờ"
                                options={workingHoursOptions}
                                value={formData.workingHours}
                                onChange={(value) => handleInputChange('workingHours', value)}
                                error={errors.workingHours}
                                required
                            />

                            <Input
                                label="Mức lương"
                                type="text"
                                placeholder="VD: 8.000.000"
                                value={formData.salary}
                                onChange={(e) => handleSalaryChange(e.target.value)}
                                error={errors.salary}
                                required={!isEditMode}
                            />

                            {!isEditMode && (
                                <Input
                                    label="Ngày bắt đầu"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                                    error={errors.startDate}
                                    required
                                    className="md:col-span-2"
                                />
                            )}
                        </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-foreground flex items-center space-x-2">
                            <Icon name="Phone" size={18} />
                            <span>Liên hệ khẩn cấp</span>
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Tên người liên hệ"
                                type="text"
                                placeholder="Họ tên người thân"
                                value={formData.emergencyContact}
                                onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                            />

                            <Input
                                label="Số điện thoại khẩn cấp"
                                type="tel"
                                placeholder="0123 456 789"
                                value={formData.emergencyPhone}
                                onChange={(e) => handlePhoneChange('emergencyPhone', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-foreground flex items-center space-x-2">
                            <Icon name="FileText" size={18} />
                            <span>Ghi chú</span>
                        </h3>

                        <textarea
                            placeholder="Ghi chú thêm về nhân viên..."
                            value={formData.notes}
                            onChange={(e) => handleInputChange('notes', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                        />
                    </div>
                </form>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="default"
                        onClick={handleSubmit}
                        loading={isLoading}
                        iconName={submitIcon}
                        iconPosition="left"
                    >
                        {submitText}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default StaffFormModal;
