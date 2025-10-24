import React, { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
    XMarkIcon,
    BuildingStorefrontIcon,
    SparklesIcon,
    ArrowRightIcon,
    CheckCircleIcon,
    StarIcon,
    ChartBarIcon,
    UsersIcon
} from '@heroicons/react/24/outline';

const AttentionModal = ({ isOpen, onClose, onOpenCreateModal }) => {
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        // Delay để animation chạy
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 400);
    };

    const handleCreateRestaurant = () => {
        handleClose();
        // Delay một chút để modal close animation hoàn tất
        setTimeout(() => {
            onOpenCreateModal();
        }, 500);
    };

    const features = [
        {
            icon: ChartBarIcon,
            title: 'Quản lý thông minh',
            description: 'Theo dõi doanh thu, đơn hàng và khách hàng một cách dễ dàng'
        },
        {
            icon: UsersIcon,
            title: 'Tiếp cận khách hàng',
            description: 'Kết nối với hàng nghìn khách hàng tiềm năng trong khu vực'
        },
        {
            icon: StarIcon,
            title: 'Nâng cao uy tín',
            description: 'Xây dựng thương hiệu và nhận đánh giá từ khách hàng'
        }
    ];

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={handleClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95 translate-y-4"
                            enterTo="opacity-100 scale-100 translate-y-0"
                            leave={`ease-in duration-400 ${isClosing ? 'transition-all' : ''}`}
                            leaveFrom="opacity-100 scale-100 translate-y-0"
                            leaveTo={`opacity-0 ${isClosing ? 'scale-75 translate-x-96 translate-y-96' : 'scale-95 translate-y-4'}`}
                        >
                            <Dialog.Panel className={`w-full max-w-md transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all border border-gray-200 ${isClosing ? 'modal-slide-out' : ''}`}>
                                {/* Header */}
                                <div className="relative bg-white px-6 py-6 border-b border-gray-100">
                                    <button
                                        onClick={handleClose}
                                        className="absolute right-4 top-4 rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all"
                                    >
                                        <XMarkIcon className="h-4 w-4" />
                                    </button>

                                    <div className="text-center">
                                        <div className="mx-auto w-12 h-12 rounded-full bg-black flex items-center justify-center mb-4">
                                            <BuildingStorefrontIcon className="h-6 w-6 text-white" />
                                        </div>

                                        <Dialog.Title className="text-lg font-semibold text-gray-900 mb-2">
                                            Bạn có nhà hàng riêng?
                                        </Dialog.Title>

                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            Tham gia hệ thống quản lý hiện đại và kết nối với hàng nghìn khách hàng
                                        </p>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="px-6 py-6">
                                    <div className="space-y-4">
                                        {features.map((feature, index) => (
                                            <div key={index} className="flex items-start gap-3">
                                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                                    <feature.icon className="h-4 w-4 text-gray-600" />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-900 mb-1">
                                                        {feature.title}
                                                    </h3>
                                                    <p className="text-xs text-gray-600 leading-relaxed">
                                                        {feature.description}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* CTA Section */}
                                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <SparklesIcon className="h-4 w-4 text-gray-600" />
                                            <span className="text-xs font-medium text-gray-700">Ưu đãi đặc biệt</span>
                                        </div>
                                        <p className="text-sm text-gray-900 font-medium mb-1">
                                            Miễn phí 30 ngày đầu tiên
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            Không phí setup, không ràng buộc hợp đồng
                                        </p>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleClose}
                                            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                                        >
                                            Để sau
                                        </button>
                                        <button
                                            onClick={handleCreateRestaurant}
                                            className="flex-1 px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                                        >
                                            <span>Đăng ký ngay</span>
                                            <ArrowRightIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default AttentionModal;