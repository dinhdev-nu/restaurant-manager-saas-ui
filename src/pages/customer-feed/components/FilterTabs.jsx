import React from 'react';
import {
    HomeIcon,
    TagIcon,
    SparklesIcon,
    StarIcon,
    CalendarIcon,
    FireIcon
} from '@heroicons/react/24/outline';

const FilterTabs = ({ activeFilter, onFilterChange }) => {
    const filters = [
        { id: 'all', label: 'Tất cả', icon: HomeIcon, color: 'text-gray-700' },
        { id: 'promotion', label: 'Khuyến mãi', icon: TagIcon, color: 'text-red-500' },
        { id: 'new_menu', label: 'Menu mới', icon: SparklesIcon, color: 'text-purple-500' },
        { id: 'feedback', label: 'Review', icon: StarIcon, color: 'text-yellow-500' },
        { id: 'event', label: 'Sự kiện', icon: CalendarIcon, color: 'text-blue-500' },
        { id: 'experience', label: 'Kinh nghiệm', icon: FireIcon, color: 'text-orange-500' }
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide">
                {filters.map((filter) => {
                    const IconComponent = filter.icon;
                    const isActive = activeFilter === filter.id;
                    return (
                        <button
                            key={filter.id}
                            onClick={() => onFilterChange(filter.id)}
                            className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl whitespace-nowrap transition-all duration-200 flex-shrink-0 ${isActive
                                ? 'bg-gray-900 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                }`}
                        >
                            <IconComponent className={`w-4 h-4 ${isActive ? 'text-white' : filter.color}`} />
                            <span className="text-sm font-medium">{filter.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default FilterTabs;
