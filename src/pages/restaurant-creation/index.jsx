import React, { Fragment, useState } from 'react';
import { Transition, Listbox } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import {
    XMarkIcon,
    BuildingStorefrontIcon,
    MapPinIcon,
    EnvelopeIcon,
    PhoneIcon,
    ClockIcon,
    CameraIcon,
    CheckCircleIcon,
    GlobeAltIcon,
    InformationCircleIcon,
    SparklesIcon,
    ChevronDownIcon
} from '@heroicons/react/24/outline';
import { cuisineTypes, weekDays, serviceOptions, paymentOptions } from '../../constants/restaurant.const';
import { MOCK_PROVINCES, MOCK_DISTRICTS } from '../../mocks/locations';
import TimePicker from '../../components/ui/TimePicker';
import { createRestaurantApi } from 'api/restaurant';
import { useToast } from 'hooks/use-toast';
import { formatPhoneNumber, parsePhoneNumber, digitsOnly } from '../../utils/formatters';

const CreateRestaurantModal = () => {

    const navigate = useNavigate();

    const { toast } = useToast()

    const handleBack = () => {
        navigate(-1);
    };

    const [formData, setFormData] = useState({
        // Thông tin cơ bản
        restaurantName: '',
        email: '',
        phone: '',
        website: '',

        // Địa chỉ
        address: '',
        city: '',
        district: '',

        // Chi tiết nhà hàng
        cuisine: '',
        capacity: '',

        // Giờ mở cửa
        openingTime: '',
        closingTime: '',
        workingDays: [], // Từ thứ nào đến thứ nào

        // Dịch vụ và tiện ích
        services: [],
        paymentMethods: [],

        // Mô tả
        description: '',
        specialties: '',

        // Hình ảnh
        logo: null,
        coverImage: null
    }); const [errors, setErrors] = useState({});
    const [logoPreview, setLogoPreview] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);

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
        e.preventDefault();
        if (validateForm()) {
            try {
                console.log("✅ Form data is valid. Submitting:", formData);
                // Call API tạo nhà hàng
                await createRestaurantApi(formData);
                // Toast thành công
                toast({
                    variant: "success",
                    title: "Tạo nhà hàng thành công",
                    description: "Nhà hàng của bạn đã được tạo.",
                    duration: 4000,
                });

                // Chỉ quay lại khi tạo thành công
                handleBack();

            } catch (error) {
                console.error("❌ Error:", error);
                // Toast thất bại
                toast({
                    variant: "destructive",
                    title: "Tạo nhà hàng thất bại",
                    description: error.response?.data?.message || error.message || "Vui lòng thử lại.",
                    duration: 4000,
                })
            }
        }
    };

    const provinceCode = formData.city ? Number(formData.city) : null;
    const districtCode = formData.district ? Number(formData.district) : null;
    const districts = provinceCode ? MOCK_DISTRICTS[provinceCode] || [] : [];
    const selectedProvince = provinceCode ? MOCK_PROVINCES.find(province => province.code === provinceCode) : null;
    const selectedDistrict = districtCode ? districts.find(district => district.code === districtCode) : null;

    return (
        <div className="min-h-screenbwhitebg-white py-4 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="w-full transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all border border-gray-200">
                    {/* Header - Vercel Style */}
                    <div className="relative border-b border-gray-200 bg-white px-6 py-5">
                        <button
                            onClick={handleBack}
                            className="absolute right-4 top-4 rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-black p-2">
                                <BuildingStorefrontIcon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-gray-900">
                                    Đăng ký nhà hàng
                                </h1>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    Hoàn thiện thông tin để tạo hồ sơ nhà hàng chuyên nghiệp
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="flex">
                        <div className="w-1/2 border-r border-gray-200 p-6 overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-hide">
                            <div className="space-y-6">
                                {/* Section 1: Thông tin cơ bản */}
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-md bg-black text-white flex items-center justify-center text-xs font-bold">1</div>
                                        Thông tin cơ bản
                                    </h3>

                                    <div className="space-y-4 pl-8">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                                Tên nhà hàng <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="restaurantName"
                                                value={formData.restaurantName}
                                                onChange={handleChange}
                                                placeholder="VD: Nhà Hàng Phố Cổ"
                                                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all"
                                            />
                                            {errors.restaurantName && (
                                                <p className="mt-1 text-xs text-red-500">{errors.restaurantName}</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                                    Email <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    placeholder="email@example.com"
                                                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all"
                                                />
                                                {errors.email && (
                                                    <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                                    Số điện thoại <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    placeholder="0901234567"
                                                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all"
                                                />
                                                {errors.phone && (
                                                    <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                                Website (tùy chọn)
                                            </label>
                                            <input
                                                type="url"
                                                name="website"
                                                value={formData.website}
                                                onChange={handleChange}
                                                placeholder="https://..."
                                                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all"
                                            />
                                            {errors.website && (
                                                <p className="mt-1 text-xs text-red-500">{errors.website}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Địa chỉ */}
                                <div className="pt-4 border-t border-gray-100">
                                    <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-md bg-black text-white flex items-center justify-center text-xs font-bold">2</div>
                                        Địa chỉ
                                    </h3>

                                    <div className="space-y-4 pl-8">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                                    Tỉnh/Thành phố <span className="text-red-500">*</span>
                                                </label>
                                                <Listbox
                                                    value={formData.city}
                                                    onChange={(value) => handleChange({ target: { name: 'city', value } })}
                                                >
                                                    <div className="relative">
                                                        <Listbox.Button className="relative w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white hover:border-gray-300 focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all cursor-pointer text-left">
                                                            <span className={`block truncate ${formData.city ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                                                                {formData.city ? MOCK_PROVINCES.find(p => String(p.code) === formData.city)?.name : 'Chọn tỉnh/thành phố'}
                                                            </span>
                                                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
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
                                                            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-sm shadow-lg ring-1 ring-black/5 focus:outline-none">
                                                                {MOCK_PROVINCES.map((province) => (
                                                                    <Listbox.Option
                                                                        key={province.code}
                                                                        value={String(province.code)}
                                                                        className={({ active, selected }) =>
                                                                            `relative cursor-pointer select-none py-2.5 px-3 ${active ? 'bg-gray-900/5 text-gray-900' : 'text-gray-700'
                                                                            } ${selected ? 'font-medium text-gray-900' : 'font-normal'}`
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
                                                    <p className="mt-1 text-xs text-red-500">{errors.city}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                                    Quận/Huyện
                                                </label>
                                                <Listbox
                                                    value={formData.district}
                                                    onChange={(value) => handleChange({ target: { name: 'district', value } })}
                                                    disabled={!formData.city}
                                                >
                                                    <div className="relative">
                                                        <Listbox.Button
                                                            className="relative w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white hover:border-gray-300 focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all cursor-pointer text-left disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed disabled:border-gray-200"
                                                            disabled={!formData.city}
                                                        >
                                                            <span className={`block truncate ${formData.district ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                                                                {formData.district ? districts.find(d => String(d.code) === formData.district)?.name : 'Chọn quận/huyện'}
                                                            </span>
                                                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
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
                                                            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-sm shadow-lg ring-1 ring-black/5 focus:outline-none">
                                                                {districts.map((district) => (
                                                                    <Listbox.Option
                                                                        key={district.code}
                                                                        value={String(district.code)}
                                                                        className={({ active, selected }) =>
                                                                            `relative cursor-pointer select-none py-2.5 px-3 ${active ? 'bg-gray-900/5 text-gray-900' : 'text-gray-700'
                                                                            } ${selected ? 'font-medium text-gray-900' : 'font-normal'}`
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

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                                Địa chỉ chi tiết
                                            </label>
                                            <input
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                placeholder="Số nhà, tên đường..."
                                                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all"
                                            />
                                            {errors.address && (
                                                <p className="mt-1 text-xs text-red-500">{errors.address}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Section 3: Chi tiết nhà hàng */}
                                <div className="pt-4 border-t border-gray-100">
                                    <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-md bg-black text-white flex items-center justify-center text-xs font-bold">3</div>
                                        Chi tiết nhà hàng
                                    </h3>

                                    <div className="space-y-4 pl-8">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                                Loại ẩm thực <span className="text-red-500">*</span>
                                            </label>
                                            <Listbox
                                                value={formData.cuisine}
                                                onChange={(value) => handleChange({ target: { name: 'cuisine', value } })}
                                            >
                                                <div className="relative">
                                                    <Listbox.Button className="relative w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white hover:border-gray-300 focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all cursor-pointer text-left">
                                                        <span className={`block truncate ${formData.cuisine ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                                                            {formData.cuisine || 'Chọn loại ẩm thực'}
                                                        </span>
                                                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                            <ChevronDownIcon className="h-4 w-4 text-gray-400" />
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
                                                        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-sm shadow-lg ring-1 ring-black/5 focus:outline-none">
                                                            {cuisineTypes.map((type) => (
                                                                <Listbox.Option
                                                                    key={type}
                                                                    value={type}
                                                                    className={({ active, selected }) =>
                                                                        `relative cursor-pointer select-none py-2.5 px-3 ${active ? 'bg-gray-900/5 text-gray-900' : 'text-gray-700'
                                                                        } ${selected ? 'font-medium text-gray-900' : 'font-normal'}`
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
                                                <p className="mt-1 text-xs text-red-500">{errors.cuisine}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                                Sức chứa (người)
                                            </label>
                                            <input
                                                type="number"
                                                name="capacity"
                                                value={formData.capacity}
                                                onChange={handleChange}
                                                placeholder="VD: 50"
                                                min="1"
                                                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all"
                                            />
                                            {errors.capacity && (
                                                <p className="mt-1 text-xs text-red-500">{errors.capacity}</p>
                                            )}
                                        </div>

                                        {/* Ngày làm việc */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                                Ngày làm việc <span className="text-red-500">*</span>
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {weekDays.map(day => (
                                                    <button
                                                        key={day.id}
                                                        type="button"
                                                        onClick={() => handleCheckboxChange('workingDays', day.id)}
                                                        className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${formData.workingDays.includes(day.id)
                                                            ? 'border-black bg-black text-white'
                                                            : 'border-gray-300 hover:border-gray-400 text-gray-700'
                                                            }`}
                                                    >
                                                        {day.label}
                                                    </button>
                                                ))}
                                            </div>
                                            {errors.workingDays && (
                                                <p className="mt-1 text-xs text-red-500">{errors.workingDays}</p>
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
                                <div className="pt-4 border-t border-gray-100">
                                    <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-md bg-black text-white flex items-center justify-center text-xs font-bold">4</div>
                                        Dịch vụ & Tiện ích
                                    </h3>

                                    <div className="space-y-4 pl-8">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                                Dịch vụ cung cấp
                                            </label>
                                            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                                                {serviceOptions.map(service => (
                                                    <button
                                                        key={service.id}
                                                        type="button"
                                                        onClick={() => handleCheckboxChange('services', service.id)}
                                                        className={`w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg border cursor-pointer transition-all ${formData.services.includes(service.id)
                                                            ? 'border-gray-900 bg-gray-900/5 text-gray-900 font-medium shadow-sm'
                                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600'
                                                            }`}
                                                    >
                                                        <span>{service.icon}</span>
                                                        <span>{service.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                                Phương thức thanh toán
                                            </label>
                                            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                                                {paymentOptions.map(payment => (
                                                    <button
                                                        key={payment.id}
                                                        type="button"
                                                        onClick={() => handleCheckboxChange('paymentMethods', payment.id)}
                                                        className={`w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg border cursor-pointer transition-all ${formData.paymentMethods.includes(payment.id)
                                                            ? 'border-gray-900 bg-gray-900/5 text-gray-900 font-medium shadow-sm'
                                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600'
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
                                <div className="pt-4 border-t border-gray-100">
                                    <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-md bg-black text-white flex items-center justify-center text-xs font-bold">5</div>
                                        Giới thiệu
                                    </h3>

                                    <div className="space-y-4 pl-8">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                                Mô tả về nhà hàng
                                            </label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                rows={3}
                                                placeholder="Giới thiệu về không gian, phong cách phục vụ..."
                                                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all resize-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                                Món ăn đặc sản
                                            </label>
                                            <textarea
                                                name="specialties"
                                                value={formData.specialties}
                                                onChange={handleChange}
                                                rows={2}
                                                placeholder="VD: Phở bò, Bún chả, Chả cá..."
                                                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-1/2 bg-gray-50 overflow-y-auto max-h-[calc(100vh-200px)]">
                            <div className="sticky top-0 bg-gray-50 px-6 pt-6 pb-3 border-b border-gray-200">
                                <div className="flex items-center gap-2">
                                    <SparklesIcon className="h-4 w-4 text-gray-600" />
                                    <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Xem trước hồ sơ
                                    </h3>
                                </div>
                            </div>

                            <div className="p-6 pt-4">
                                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                    <div className="relative h-36 bg-gradient-to-br from-gray-100 to-gray-200">
                                        {coverPreview ? (
                                            <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <div className="text-center text-gray-400">
                                                    <CameraIcon className="h-10 w-10 mx-auto mb-1.5" />
                                                    <p className="text-xs font-medium">Ảnh bìa</p>
                                                </div>
                                            </div>
                                        )}

                                        <label className="absolute bottom-2 right-2 cursor-pointer">
                                            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/95 backdrop-blur-sm rounded-md border border-gray-200 shadow-sm hover:bg-white transition-all">
                                                <CameraIcon className="h-3.5 w-3.5 text-gray-600" />
                                                <span className="text-xs font-medium text-gray-700">Ảnh bìa</span>
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
                                            <div className="w-24 h-24 rounded-full border-4 border-white bg-white overflow-hidden shadow-md">
                                                {logoPreview ? (
                                                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                        <BuildingStorefrontIcon className="h-10 w-10 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>

                                            <label className="absolute bottom-0 right-0 cursor-pointer">
                                                <div className="w-8 h-8 rounded-full bg-black hover:bg-gray-800 flex items-center justify-center shadow-md transition-all border-2 border-white">
                                                    <CameraIcon className="h-4 w-4 text-white" />
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(e, 'logo')}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>

                                        <h2 className="text-xl font-bold text-gray-900 mb-1">
                                            {formData.restaurantName || 'Tên nhà hàng'}
                                        </h2>

                                        <div className="flex items-center gap-2 flex-wrap mb-3">
                                            {formData.cuisine && (
                                                <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                                                    {formData.cuisine}
                                                </span>
                                            )}
                                            {formData.capacity && (
                                                <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                                                    👥 {formData.capacity} chỗ
                                                </span>
                                            )}
                                        </div>

                                        {formData.description && (
                                            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                                                {formData.description}
                                            </p>
                                        )}

                                        {formData.specialties && (
                                            <div className="mb-4 p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                                                <p className="text-xs font-medium text-gray-700 mb-1">Món đặc sản:</p>
                                                <p className="text-xs text-gray-600">{formData.specialties}</p>
                                            </div>
                                        )}

                                        <div className="space-y-2.5 border-t border-gray-100 pt-4">
                                            {(formData.city || formData.address) && (
                                                <div className="flex items-start gap-2.5">
                                                    <MapPinIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                                    <div className="text-xs text-gray-700">
                                                        {formData.address && <div>{formData.address}</div>}
                                                        {(selectedDistrict || selectedProvince) && (
                                                            <div className="text-gray-500 mt-0.5">
                                                                {[selectedDistrict?.name, selectedProvince?.name].filter(Boolean).join(', ')}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {formData.phone && (
                                                <div className="flex items-center gap-2.5">
                                                    <PhoneIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                                    <span className="text-xs text-gray-700">{formData.phone}</span>
                                                </div>
                                            )}

                                            {formData.email && (
                                                <div className="flex items-center gap-2.5">
                                                    <EnvelopeIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                                    <span className="text-xs text-gray-700">{formData.email}</span>
                                                </div>
                                            )}

                                            {formData.website && (
                                                <div className="flex items-center gap-2.5">
                                                    <GlobeAltIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                                    <span className="text-xs text-gray-700 truncate">{formData.website}</span>
                                                </div>
                                            )}

                                            {(formData.openingTime || formData.closingTime) && (
                                                <div className="flex items-center gap-2.5">
                                                    <ClockIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                                    <span className="text-xs text-gray-700">
                                                        {formData.openingTime || '--:--'} - {formData.closingTime || '--:--'}
                                                    </span>
                                                </div>
                                            )}

                                            {formData.workingDays.length > 0 && (
                                                <div className="flex items-start gap-2.5">
                                                    <span className="text-xs text-gray-400 mt-0.5">📅</span>
                                                    <span className="text-xs text-gray-700">
                                                        {formData.workingDays.map(dayId =>
                                                            weekDays.find(d => d.id === dayId)?.label
                                                        ).join(', ')}
                                                    </span>
                                                </div>
                                            )}

                                            {formData.services.length > 0 && (
                                                <div className="pt-2 border-t border-gray-100">
                                                    <p className="text-xs font-medium text-gray-700 mb-2">Dịch vụ:</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {formData.services.map(serviceId => {
                                                            const service = serviceOptions.find(s => s.id === serviceId);
                                                            return (
                                                                <span key={serviceId} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs">
                                                                    <span>{service?.icon}</span>
                                                                    <span className="text-gray-700">{service?.label}</span>
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {formData.paymentMethods.length > 0 && (
                                                <div className="pt-2 border-t border-gray-100">
                                                    <p className="text-xs font-medium text-gray-700 mb-2">Thanh toán:</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {formData.paymentMethods.map(paymentId => {
                                                            const payment = paymentOptions.find(p => p.id === paymentId);
                                                            return (
                                                                <span key={paymentId} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs">
                                                                    <span>{payment?.icon}</span>
                                                                    <span className="text-gray-700">{payment?.label}</span>
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <InformationCircleIcon className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-xs text-blue-700 leading-relaxed">
                                            Hồ sơ của bạn sẽ hiển thị như bên trái sau khi hoàn tất. Điền đầy đủ thông tin để tạo ấn tượng tốt với khách hàng.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>

                    <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={handleBack}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            className="px-5 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800 transition-all flex items-center gap-2"
                        >
                            <CheckCircleIcon className="h-4 w-4" />
                            Tạo nhà hàng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateRestaurantModal;
