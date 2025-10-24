import React from 'react';
import {
    BuildingStorefrontIcon,
    SparklesIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline';

const CreateRestaurantBanner = ({ onOpenModal, onOpenAttentionModal }) => {
    return (
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 hover:border-gray-300 transition-all duration-200">
            {/* Header with Icon and Title */}
            <div className="flex items-center space-x-3 mb-3">
                <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                        <BuildingStorefrontIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
                        <SparklesIcon className="w-2.5 h-2.5 text-white" />
                    </div>
                </div>
                <h3 className="font-semibold text-gray-900">
                    Bạn là chủ nhà hàng?
                </h3>
            </div>

            {/* Content */}
            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                Tham gia POS Manager để quản lý nhà hàng chuyên nghiệp và tiếp cận hàng nghìn khách hàng
            </p>

            {/* CTA Buttons */}
            <div className="space-y-2">
                <button
                    onClick={onOpenModal}
                    className="w-full group py-2.5 bg-gray-900 text-white rounded-2xl font-medium text-sm hover:bg-gray-800 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                    <span>Tạo nhà hàng</span>
                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
}; export default CreateRestaurantBanner;
