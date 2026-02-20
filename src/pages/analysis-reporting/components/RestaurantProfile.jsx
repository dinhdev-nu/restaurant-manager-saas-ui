import React, { Fragment, useState, useImperativeHandle, forwardRef } from 'react';
import { Transition, Listbox } from '@headlessui/react';
import {
    BuildingStorefrontIcon,
    MapPinIcon,
    EnvelopeIcon,
    PhoneIcon,
    ClockIcon,
    CameraIcon,
    GlobeAltIcon,
    InformationCircleIcon,
    SparklesIcon,
    ChevronDownIcon
} from '@heroicons/react/24/outline';
import { cuisineTypes, weekDays, serviceOptions, paymentOptions } from '../../../constants/restaurant.const'
import { MOCK_PROVINCES, MOCK_DISTRICTS } from '../../../mocks/locations';
import TimePicker from '../../../components/ui/TimePicker';
import Input from '../../../components/ui/Input';
import { Label } from "../../../components/ui/Label";
import { createRestaurantApi, updateRestaurantApi } from 'api/restaurant';
import { useRestaurantStore } from '../../../stores/restaurant.store';
import { useToast } from 'hooks/use-toast';
import { formatPhoneNumber, parsePhoneNumber, digitsOnly } from '../../../utils/formatters';

export const RestaurantProfile = forwardRef((props, ref) => {

    const toast = useToast()
    const selectedRestaurant = useRestaurantStore((state) => state.selectedRestaurant);
    const updateRestaurant = useRestaurantStore((state) => state.updateRestaurant);
    const selectRestaurant = useRestaurantStore((state) => state.selectRestaurant);

    const [formData, setFormData] = useState(() => {
        const r = selectedRestaurant;
        return {
            // Thông tin cơ bản
            restaurantName: r?.restaurantName || '',
            email: r?.email || '',
            phone: r?.phone ? formatPhoneNumber(r.phone) : '',
            website: r?.website || '',

            // Địa chỉ
            address: r?.address || '',
            city: r?.city || '',
            district: r?.district || '',

            // Chi tiết nhà hàng
            cuisine: r?.cuisine || '',
            capacity: r?.capacity ? String(r.capacity) : '',

            // Giờ mở cửa
            openingTime: r?.openingTime || '',
            closingTime: r?.closingTime || '',
            workingDays: r?.workingDays || [],

            // Dịch vụ và tiện ích
            services: r?.services || [],
            paymentMethods: r?.paymentMethods || [],

            // Mô tả
            description: r?.description || '',
            specialties: r?.specialties || '',

            // Hình ảnh
            logo: null,
            coverImage: null
        };
    });
    const [errors, setErrors] = useState({});
    const [logoPreview, setLogoPreview] = useState(selectedRestaurant?.logo || null);
    const [coverPreview, setCoverPreview] = useState(selectedRestaurant?.coverImage || null);



    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => {
            if (name === 'city') {
                return { ...prev, city: value, district: '' };
            }

            if (name === 'phone') {
                const cleaned = digitsOnly(value, 11);
                const formatted = formatPhoneNumber(cleaned);
                return { ...prev, phone: formatted };
            }

            return { ...prev, [name]: value };
        });

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }

        if (name === 'city' && errors.district) {
            setErrors(prev => ({ ...prev, district: '' }));
        }
    };

    const handleCheckboxChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].includes(value)
                ? prev[field].filter(item => item !== value)
                : [...prev[field], value]
        }));
    };

    const handleImageUpload = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, [type]: 'File không được vượt quá 5MB' }));
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                if (type === 'logo') {
                    setLogoPreview(reader.result);
                    setFormData(prev => ({ ...prev, logo: file }));
                } else {
                    setCoverPreview(reader.result);
                    setFormData(prev => ({ ...prev, coverImage: file }));
                }
            };
            reader.readAsDataURL(file);

            if (errors[type]) {
                setErrors(prev => ({ ...prev, [type]: '' }));
            }
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Tên nhà hàng
        if (!formData.restaurantName.trim()) {
            newErrors.restaurantName = 'Vui lòng nhập tên nhà hàng';
        } else if (formData.restaurantName.trim().length < 3) {
            newErrors.restaurantName = 'Tên nhà hàng phải có ít nhất 3 ký tự';
        } else if (formData.restaurantName.trim().length > 100) {
            newErrors.restaurantName = 'Tên nhà hàng không được vượt quá 100 ký tự';
        }

        // Email
        if (!formData.email.trim()) {
            newErrors.email = 'Vui lòng nhập email';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            newErrors.email = 'Email không hợp lệ';
        }

        // Số điện thoại
        if (!formData.phone.trim()) {
            newErrors.phone = 'Vui lòng nhập số điện thoại';
        } else {
            const cleanedPhone = parsePhoneNumber(formData.phone);
            if (!/^(0|\+?84)[0-9]{9,10}$/.test(cleanedPhone)) {
                newErrors.phone = 'Số điện thoại phải là 10-11 số và bắt đầu bằng 0 hoặc +84';
            }
        }

        // Website (nếu có)
        if (formData.website.trim() && !/^https?:\/\/.+\..+/.test(formData.website.trim())) {
            newErrors.website = 'Website phải bắt đầu bằng http:// hoặc https://';
        }

        // Địa chỉ
        if (!formData.city) {
            newErrors.city = 'Vui lòng chọn tỉnh/thành phố';
        }

        if (formData.address.trim() && formData.address.trim().length < 5) {
            newErrors.address = 'Địa chỉ phải có ít nhất 5 ký tự';
        }

        // Loại ẩm thực
        if (!formData.cuisine) {
            newErrors.cuisine = 'Vui lòng chọn loại ẩm thực';
        }

        // Sức chứa
        if (formData.capacity) {
            const capacityNum = parseInt(formData.capacity);
            if (isNaN(capacityNum) || capacityNum < 1) {
                newErrors.capacity = 'Sức chứa phải là số nguyên dương';
            } else if (capacityNum > 10000) {
                newErrors.capacity = 'Sức chứa không hợp lý (tối đa 10000)';
            }
        }

        // Giờ mở cửa - Validation format HH:MM
        if (formData.openingTime) {
            if (!/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(formData.openingTime)) {
                newErrors.openingTime = 'Giờ mở cửa phải theo định dạng HH:MM (VD: 08:00)';
            }
        }

        // Giờ đóng cửa
        if (formData.closingTime) {
            if (!/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(formData.closingTime)) {
                newErrors.closingTime = 'Giờ đóng cửa phải theo định dạng HH:MM (VD: 22:00)';
            } else if (formData.openingTime && formData.closingTime <= formData.openingTime) {
                newErrors.closingTime = 'Giờ đóng cửa phải sau giờ mở cửa';
            }
        }

        // Ngày làm việc
        if (formData.workingDays.length === 0) {
            newErrors.workingDays = 'Vui lòng chọn ít nhất một ngày làm việc';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();
        if (validateForm()) {
            if (!selectedRestaurant?._id) {
                toast({
                    variant: "destructive",
                    title: "Lỗi",
                    description: "Không tìm thấy thông tin nhà hàng.",
                    duration: 4000,
                });
                return false;
            }

            try {
                // Prepare data for API
                const updateData = {
                    restaurantName: formData.restaurantName.trim(),
                    email: formData.email.trim(),
                    phone: parsePhoneNumber(formData.phone),
                    website: formData.website.trim(),
                    address: formData.address.trim(),
                    city: formData.city,
                    district: formData.district,
                    cuisine: formData.cuisine,
                    capacity: formData.capacity ? parseInt(formData.capacity) : 0,
                    openingTime: formData.openingTime,
                    closingTime: formData.closingTime,
                    workingDays: formData.workingDays,
                    services: formData.services,
                    paymentMethods: formData.paymentMethods,
                    description: formData.description.trim(),
                    specialties: formData.specialties.trim(),
                };

                // Call API to update restaurant
                const response = await updateRestaurantApi(selectedRestaurant._id, updateData);

                // Update store with new data
                const updatedRestaurant = response.metadata || response;
                updateRestaurant(selectedRestaurant._id, updatedRestaurant);
                selectRestaurant(updatedRestaurant);

                // Toast thành công
                toast({
                    variant: "success",
                    title: "Cập nhật thành công",
                    description: "Thông tin nhà hàng đã được cập nhật.",
                    duration: 4000,
                });
                return true; // Indicate success
            } catch (error) {
                console.error("❌ Error updating restaurant:", error);
                // Toast thất bại
                toast({
                    variant: "destructive",
                    title: "Cập nhật thất bại",
                    description: error.response?.data?.message || error.message || "Vui lòng thử lại.",
                    duration: 4000,
                })
                return false; // Indicate failure
            }
        }
        return false; // Validation failed
    };

    // Expose submit method to parent via ref
    useImperativeHandle(ref, () => ({
        submit: handleSubmit
    }));

    const provinceCode = formData.city ? Number(formData.city) : null;
    const districtCode = formData.district ? Number(formData.district) : null;
    const districts = provinceCode ? MOCK_DISTRICTS[provinceCode] || [] : [];
    const selectedProvince = provinceCode ? MOCK_PROVINCES.find(province => province.code === provinceCode) : null;
    const selectedDistrict = districtCode ? districts.find(district => district.code === districtCode) : null;

    return (
        <form onSubmit={handleSubmit} className="flex bg-card rounded-lg border border-border">
            <div className="w-1/2 border-r border-border p-6">
                <div className="space-y-6">
                    {/* Section 1: Thông tin cơ bản */}
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: '100ms' }}>
                        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-accent text-background flex items-center justify-center text-xs font-bold">1</div>
                            Thông tin cơ bản
                        </h3>

                        <div className="space-y-4 pl-8">
                            <Input
                                label="Tên nhà hàng"
                                required
                                type="text"
                                name="restaurantName"
                                value={formData.restaurantName}
                                onChange={handleChange}
                                placeholder="VD: Nhà Hàng Phố Cổ"
                                error={errors.restaurantName}
                                className="bg-secondary border-border focus:border-accent focus:ring-accent/20"
                            />

                            <div className="grid grid-cols-2 gap-3">
                                <Input
                                    label="Email"
                                    required
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="email@example.com"
                                    error={errors.email}
                                    className="bg-secondary border-border focus:border-accent focus:ring-accent/20"
                                />
                                <Input
                                    label="Số điện thoại"
                                    required
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="0901234567"
                                    error={errors.phone}
                                    className="bg-secondary border-border focus:border-accent focus:ring-accent/20"
                                />
                            </div>

                            <Input
                                label="Website (tùy chọn)"
                                type="url"
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                placeholder="https://..."
                                error={errors.website}
                                className="bg-secondary border-border focus:border-accent focus:ring-accent/20"
                            />
                        </div>
                    </div>

                    {/* Section 2: Địa chỉ */}
                    <div className="relative z-20 pt-4 border-t border-border z animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: '150ms' }}>
                        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-accent text-background flex items-center justify-center text-xs font-bold">2</div>
                            Địa chỉ
                        </h3>

                        <div className="space-y-4 pl-8">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                                        Tỉnh/Thành phố <span className="text-destructive">*</span>
                                    </label>
                                    <Listbox
                                        value={formData.city}
                                        onChange={(value) => handleChange({ target: { name: 'city', value } })}
                                    >
                                        <div className="relative">
                                            <Listbox.Button className="relative w-full px-3 py-2 text-sm rounded-lg border border-border bg-secondary hover:border-accent/50 focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all cursor-pointer text-left">
                                                <span className={`block truncate ${formData.city ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                                                    {formData.city ? MOCK_PROVINCES.find(p => String(p.code) === formData.city)?.name : 'Chọn tỉnh/thành phố'}
                                                </span>
                                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                    <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
                                                </span>
                                            </Listbox.Button>
                                            <Transition
                                                as={Fragment}
                                                enter="transition ease-out duration-100"
                                                enterFrom="opacity-0 scale-95"
                                                enterTo="opacity-100 scale-100"
                                                leave="transition ease-in duration-75"
                                                leaveFrom="opacity-100 scale-100"
                                                leaveTo="opacity-0 scale-95"
                                            >
                                                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-card border border-border py-1 text-sm shadow-lg focus:outline-none">
                                                    {MOCK_PROVINCES.map((province) => (
                                                        <Listbox.Option
                                                            key={province.code}
                                                            value={String(province.code)}
                                                            className={({ active, selected }) =>
                                                                `relative cursor-pointer select-none py-2.5 z-50 px-3 ${active ? 'bg-accent/10 text-foreground' : 'text-muted-foreground'
                                                                } ${selected ? 'font-medium text-foreground' : 'font-normal'}`
                                                            }
                                                        >
                                                            {({ selected }) => (
                                                                <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                                                                    {province.name}
                                                                </span>
                                                            )}
                                                        </Listbox.Option>
                                                    ))}
                                                </Listbox.Options>
                                            </Transition>
                                        </div>
                                    </Listbox>
                                    {errors.city && (
                                        <p className="mt-1 text-xs text-destructive">{errors.city}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                                        Quận/Huyện
                                    </label>
                                    <Listbox
                                        value={formData.district}
                                        onChange={(value) => handleChange({ target: { name: 'district', value } })}
                                        disabled={!formData.city}
                                    >
                                        <div className="relative">
                                            <Listbox.Button
                                                className="relative w-full px-3 py-2 text-sm rounded-lg border border-border bg-secondary hover:border-accent/50 focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all cursor-pointer text-left disabled:bg-muted disabled:text-muted-foreground/50 disabled:cursor-not-allowed disabled:border-border"
                                                disabled={!formData.city}
                                            >
                                                <span className={`block truncate ${formData.district ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                                                    {formData.district ? districts.find(d => String(d.code) === formData.district)?.name : 'Chọn quận/huyện'}
                                                </span>
                                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                    <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
                                                </span>
                                            </Listbox.Button>
                                            <Transition
                                                as={Fragment}
                                                enter="transition ease-out duration-100"
                                                enterFrom="opacity-0 scale-95"
                                                enterTo="opacity-100 scale-100"
                                                leave="transition ease-in duration-75"
                                                leaveFrom="opacity-100 scale-100"
                                                leaveTo="opacity-0 scale-95"
                                            >
                                                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-card border border-border py-1 text-sm shadow-lg focus:outline-none">
                                                    {districts.map((district) => (
                                                        <Listbox.Option
                                                            key={district.code}
                                                            value={String(district.code)}
                                                            className={({ active, selected }) =>
                                                                `relative cursor-pointer select-none py-2.5 px-3 ${active ? 'bg-accent/10 text-foreground' : 'text-muted-foreground'
                                                                } ${selected ? 'font-medium text-foreground' : 'font-normal'}`
                                                            }
                                                        >
                                                            {({ selected }) => (
                                                                <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                                                                    {district.name}
                                                                </span>
                                                            )}
                                                        </Listbox.Option>
                                                    ))}
                                                </Listbox.Options>
                                            </Transition>
                                        </div>
                                    </Listbox>
                                </div>
                            </div>

                            <Input
                                label="Địa chỉ chi tiết"
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Số nhà, tên đường..."
                                error={errors.address}
                                className="bg-secondary border-border focus:border-accent focus:ring-accent/20"
                            />
                        </div>
                    </div>

                    {/* Section 3: Chi tiết nhà hàng */}
                    <div className="relative z-20 pt-4 border-t border-border animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: '200ms' }}>
                        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-accent text-background flex items-center justify-center text-xs font-bold">3</div>
                            Chi tiết nhà hàng
                        </h3>

                        <div className="space-y-4 pl-8">
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                                    Loại ẩm thực <span className="text-destructive">*</span>
                                </label>
                                <Listbox
                                    value={formData.cuisine}
                                    onChange={(value) => handleChange({ target: { name: 'cuisine', value } })}
                                >
                                    <div className="relative">
                                        <Listbox.Button className="relative w-full px-3 py-2 text-sm rounded-lg border border-border bg-secondary hover:border-accent/50 focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all cursor-pointer text-left">
                                            <span className={`block truncate ${formData.cuisine ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                                                {formData.cuisine || 'Chọn loại ẩm thực'}
                                            </span>
                                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
                                            </span>
                                        </Listbox.Button>
                                        <Transition
                                            as={Fragment}
                                            enter="transition ease-out duration-100"
                                            enterFrom="opacity-0 scale-95"
                                            enterTo="opacity-100 scale-100"
                                            leave="transition ease-in duration-75"
                                            leaveFrom="opacity-100 scale-100"
                                            leaveTo="opacity-0 scale-95"
                                        >
                                            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-card border border-border py-1 text-sm shadow-lg focus:outline-none">
                                                {cuisineTypes.map((type) => (
                                                    <Listbox.Option
                                                        key={type}
                                                        value={type}
                                                        className={({ active, selected }) =>
                                                            `relative cursor-pointer select-none py-2.5 px-3 ${active ? 'bg-accent/10 text-foreground' : 'text-muted-foreground'
                                                            } ${selected ? 'font-medium text-foreground' : 'font-normal'}`
                                                        }
                                                    >
                                                        {({ selected }) => (
                                                            <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                                                                {type}
                                                            </span>
                                                        )}
                                                    </Listbox.Option>
                                                ))}
                                            </Listbox.Options>
                                        </Transition>
                                    </div>
                                </Listbox>
                                {errors.cuisine && (
                                    <p className="mt-1 text-xs text-destructive">{errors.cuisine}</p>
                                )}
                            </div>

                            <Input
                                label="Sức chứa (người)"
                                type="number"
                                name="capacity"
                                value={formData.capacity}
                                onChange={handleChange}
                                placeholder="VD: 50"
                                min="1"
                                error={errors.capacity}
                                className="bg-secondary border-border focus:border-accent focus:ring-accent/20"
                            />

                            {/* Ngày làm việc */}
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-2">
                                    Ngày làm việc <span className="text-destructive">*</span>
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {weekDays.map(day => (
                                        <button
                                            key={day.id}
                                            type="button"
                                            onClick={() => handleCheckboxChange('workingDays', day.id)}
                                            className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${formData.workingDays.includes(day.id)
                                                ? 'border-accent bg-accent text-background shadow-sm'
                                                : 'border-border hover:border-accent/50 text-muted-foreground hover:text-foreground'
                                                }`}
                                        >
                                            {day.label}
                                        </button>
                                    ))}
                                </div>
                                {errors.workingDays && (
                                    <p className="mt-1 text-xs text-destructive">{errors.workingDays}</p>
                                )}
                            </div>

                            {/* Giờ mở cửa - đóng cửa */}
                            <div className="grid grid-cols-2 gap-3">
                                <TimePicker
                                    label="Giờ mở cửa"
                                    value={formData.openingTime}
                                    onChange={(value) => handleChange({ target: { name: 'openingTime', value } })}
                                    error={errors.openingTime}
                                    type="opening"
                                />

                                <TimePicker
                                    label="Giờ đóng cửa"
                                    value={formData.closingTime}
                                    onChange={(value) => handleChange({ target: { name: 'closingTime', value } })}
                                    error={errors.closingTime}
                                    type="closing"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Dịch vụ & Tiện ích */}
                    <div className="pt-4 border-t border-border animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: '300ms' }}>
                        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-accent text-background flex items-center justify-center text-xs font-bold">4</div>
                            Dịch vụ & Tiện ích
                        </h3>

                        <div className="space-y-4 pl-8">
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-2">
                                    Dịch vụ cung cấp
                                </label>
                                <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                                    {serviceOptions.map(service => (
                                        <button
                                            key={service.id}
                                            type="button"
                                            onClick={() => handleCheckboxChange('services', service.id)}
                                            className={`w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg border cursor-pointer transition-all ${formData.services.includes(service.id)
                                                ? 'border-accent bg-accent/10 text-foreground font-medium shadow-sm'
                                                : 'border-border hover:border-accent/50 hover:bg-secondary/50 text-muted-foreground'
                                                }`}
                                        >
                                            <span>{service.icon}</span>
                                            <span>{service.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-2">
                                    Phương thức thanh toán
                                </label>
                                <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                                    {paymentOptions.map(payment => (
                                        <button
                                            key={payment.id}
                                            type="button"
                                            onClick={() => handleCheckboxChange('paymentMethods', payment.id)}
                                            className={`w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg border cursor-pointer transition-all ${formData.paymentMethods.includes(payment.id)
                                                ? 'border-accent bg-accent/10 text-foreground font-medium shadow-sm'
                                                : 'border-border hover:border-accent/50 hover:bg-secondary/50 text-muted-foreground'
                                                }`}
                                        >
                                            <span>{payment.icon}</span>
                                            <span>{payment.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 5: Giới thiệu */}
                    <div className="pt-4 border-t border-border animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: '400ms' }}>
                        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-accent text-background flex items-center justify-center text-xs font-bold">5</div>
                            Giới thiệu
                        </h3>

                        <div className="space-y-4 pl-8">
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                                    Mô tả về nhà hàng
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Giới thiệu về không gian, phong cách phục vụ..."
                                    className="w-full px-3 py-2 text-sm rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                                    Món ăn đặc sản
                                </label>
                                <textarea
                                    name="specialties"
                                    value={formData.specialties}
                                    onChange={handleChange}
                                    rows={2}
                                    placeholder="VD: Phở bò, Bún chả, Chả cá..."
                                    className="w-full px-3 py-2 text-sm rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all resize-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-1/2 bg-secondary">
                <div className="top-0 bg-secondary px-6 pt-6 pb-3 border-b border-border">
                    <div className="flex items-center gap-2">
                        <SparklesIcon className="h-4 w-4 text-accent" />
                        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                            Xem trước hồ sơ
                        </h3>
                    </div>
                </div>

                <div className="p-6 pt-4">
                    <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
                        <div className="relative h-36 bg-gradient-to-br from-secondary to-muted">
                            {coverPreview ? (
                                <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <div className="text-center text-muted-foreground">
                                        <CameraIcon className="h-10 w-10 mx-auto mb-1.5" />
                                        <p className="text-xs font-medium">Ảnh bìa</p>
                                    </div>
                                </div>
                            )}

                            <label className="absolute bottom-2 right-2 cursor-pointer">
                                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-card/95 backdrop-blur-sm rounded-md border border-border shadow-sm hover:bg-card transition-all">
                                    <CameraIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-xs font-medium text-foreground">Ảnh bìa</span>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, 'coverImage')}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        <div className="relative px-5 pb-5">
                            <div className="relative -mt-12 mb-3">
                                <div className="w-24 h-24 rounded-full border-4 border-card bg-card overflow-hidden shadow-md">
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-secondary">
                                            <BuildingStorefrontIcon className="h-10 w-10 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>

                                <label className="absolute bottom-0 right-0 cursor-pointer">
                                    <div className="w-8 h-8 rounded-full bg-accent hover:bg-accent/90 flex items-center justify-center shadow-md transition-all border-2 border-card">
                                        <CameraIcon className="h-4 w-4 text-background" />
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, 'logo')}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            <h2 className="text-xl font-bold text-foreground mb-1">
                                {formData.restaurantName || 'Tên nhà hàng'}
                            </h2>

                            <div className="flex items-center gap-2 flex-wrap mb-3">
                                {formData.cuisine && (
                                    <span className="inline-flex items-center px-2 py-1 bg-secondary text-foreground rounded-md text-xs font-medium border border-border">
                                        {formData.cuisine}
                                    </span>
                                )}
                                {formData.capacity && (
                                    <span className="inline-flex items-center px-2 py-1 bg-secondary text-foreground rounded-md text-xs font-medium border border-border">
                                        👥 {formData.capacity} chỗ
                                    </span>
                                )}
                            </div>

                            {formData.description && (
                                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                                    {formData.description}
                                </p>
                            )}

                            {formData.specialties && (
                                <div className="mb-4 p-2.5 bg-secondary rounded-lg border border-border">
                                    <p className="text-xs font-medium text-foreground mb-1">Món đặc sản:</p>
                                    <p className="text-xs text-muted-foreground">{formData.specialties}</p>
                                </div>
                            )}

                            <div className="space-y-2.5 border-t border-border pt-4">
                                {(formData.city || formData.address) && (
                                    <div className="flex items-start gap-2.5">
                                        <MapPinIcon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                        <div className="text-xs text-foreground">
                                            {formData.address && <div>{formData.address}</div>}
                                            {(selectedDistrict || selectedProvince) && (
                                                <div className="text-muted-foreground mt-0.5">
                                                    {[selectedDistrict?.name, selectedProvince?.name].filter(Boolean).join(', ')}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {formData.phone && (
                                    <div className="flex items-center gap-2.5">
                                        <PhoneIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                        <span className="text-xs text-foreground">{formData.phone}</span>
                                    </div>
                                )}

                                {formData.email && (
                                    <div className="flex items-center gap-2.5">
                                        <EnvelopeIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                        <span className="text-xs text-foreground">{formData.email}</span>
                                    </div>
                                )}

                                {formData.website && (
                                    <div className="flex items-center gap-2.5">
                                        <GlobeAltIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                        <span className="text-xs text-foreground truncate">{formData.website}</span>
                                    </div>
                                )}

                                {(formData.openingTime || formData.closingTime) && (
                                    <div className="flex items-center gap-2.5">
                                        <ClockIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                        <span className="text-xs text-foreground">
                                            {formData.openingTime || '--:--'} - {formData.closingTime || '--:--'}
                                        </span>
                                    </div>
                                )}

                                {formData.workingDays.length > 0 && (
                                    <div className="flex items-start gap-2.5">
                                        <span className="text-xs text-muted-foreground mt-0.5">📅</span>
                                        <span className="text-xs text-foreground">
                                            {formData.workingDays.map(dayId =>
                                                weekDays.find(d => d.id === dayId)?.label
                                            ).join(', ')}
                                        </span>
                                    </div>
                                )}

                                {formData.services.length > 0 && (
                                    <div className="pt-2 border-t border-border">
                                        <p className="text-xs font-medium text-foreground mb-2">Dịch vụ:</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {formData.services.map(serviceId => {
                                                const service = serviceOptions.find(s => s.id === serviceId);
                                                return (
                                                    <span key={serviceId} className="inline-flex items-center gap-1 px-2 py-1 bg-secondary border border-border rounded text-xs">
                                                        <span>{service?.icon}</span>
                                                        <span className="text-foreground">{service?.label}</span>
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {formData.paymentMethods.length > 0 && (
                                    <div className="pt-2 border-t border-border">
                                        <p className="text-xs font-medium text-foreground mb-2">Thanh toán:</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {formData.paymentMethods.map(paymentId => {
                                                const payment = paymentOptions.find(p => p.id === paymentId);
                                                return (
                                                    <span key={paymentId} className="inline-flex items-center gap-1 px-2 py-1 bg-secondary border border-border rounded text-xs">
                                                        <span>{payment?.icon}</span>
                                                        <span className="text-foreground">{payment?.label}</span>
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 p-3 bg-accent/10 border border-accent/30 rounded-lg">
                        <div className="flex items-start gap-2">
                            <InformationCircleIcon className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-foreground leading-relaxed">
                                Hồ sơ của bạn sẽ hiển thị như bên trái sau khi hoàn tất. Điền đầy đủ thông tin để tạo ấn tượng tốt với khách hàng.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
});

RestaurantProfile.displayName = 'RestaurantProfile';