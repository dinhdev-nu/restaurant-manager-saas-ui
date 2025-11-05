import { useState, useEffect } from 'react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight, Users } from 'lucide-react';
import { useAuthStore } from '../../stores';

const RestaurantSelector = () => {
    const navigate = useNavigate();
    const [restaurants, setRestaurants] = useState([]);
    const [hoveredCard, setHoveredCard] = useState(null); useEffect(() => {
        // Mock restaurants data - In production, fetch from API
        // API call would be: fetchUserRestaurants(user.id)
        const mockRestaurants = [
            {
                id: 1,
                name: 'Nhà hàng Sài Gòn',
                role: 'Owner',
                avatar: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
                location: 'Quận 1, TP. Hồ Chí Minh',
                staff: 24,
                lastAccess: '2 giờ trước'
            },
            {
                id: 2,
                name: 'Café Hà Nội',
                role: 'Manager',
                avatar: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop',
                location: 'Hoàn Kiếm, Hà Nội',
                staff: 12,
                lastAccess: '1 ngày trước'
            },
            {
                id: 3,
                name: 'BBQ Garden',
                role: 'Staff',
                avatar: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop',
                location: 'Quận 7, TP. Hồ Chí Minh',
                staff: 18,
                lastAccess: '3 ngày trước'
            },
            {
                id: 4,
                name: 'Lẩu Thái Lan',
                role: 'Manager',
                avatar: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&h=300&fit=crop',
                location: 'Quận 3, TP. Hồ Chí Minh',
                staff: 15,
                lastAccess: '5 ngày trước'
            },
            {
                id: 5,
                name: 'Sushi Master',
                role: 'Owner',
                avatar: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
                location: 'Đống Đa, Hà Nội',
                staff: 20,
                lastAccess: '1 tuần trước'
            },
            {
                id: 6,
                name: 'Pizza Italia',
                role: 'Staff',
                avatar: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
                location: 'Quận 2, TP. Hồ Chí Minh',
                staff: 8,
                lastAccess: '2 tuần trước'
            }
        ];

        setRestaurants(mockRestaurants);
    }, []);

    const handleRestaurantSelect = (restaurant) => {
        // Save selected restaurant to localStorage
        localStorage.setItem('selectedRestaurant', JSON.stringify(restaurant));

        // Navigate based on role
        if (restaurant.role === 'Owner' || restaurant.role === 'Manager') {
            navigate('/dashboard');
        } else {
            navigate('/pos');
        }
    };

    const handleCreateRestaurant = () => {
        navigate('/feed'); // Navigate to feed where create modal exists
    };

    const handleGoPOS = (restaurant) => {
        // Save to localStorage with POS mode
        localStorage.setItem('selectedRestaurant', JSON.stringify({
            ...restaurant,
            mode: 'pos'
        }));
        navigate('/main-pos-dashboard'); // Navigate to POS
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'Owner':
                return 'bg-black text-white';
            case 'Manager':
                return 'bg-gray-900 text-white';
            case 'Staff':
                return 'bg-gray-700 text-white';
            default:
                return 'bg-gray-500 text-white';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            {/* Main Content - Centered */}
            <div className="w-full max-w-4xl">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                        Chọn nhà hàng
                    </h1>
                    <p className="text-sm text-gray-600">
                        Chọn nhà hàng bạn muốn quản lý
                    </p>
                </div>

                {/* Restaurant Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {/* Create New Restaurant Card */}
                    <button
                        onClick={handleCreateRestaurant}
                        onMouseEnter={() => setHoveredCard('new')}
                        onMouseLeave={() => setHoveredCard(null)}
                        className="group relative bg-white border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 min-h-[160px] flex flex-col items-center justify-center"
                    >
                        <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center mb-3 transition-colors">
                            <Plus className="w-6 h-6 text-gray-600" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-0.5">
                            Tạo mới
                        </h3>
                        <p className="text-xs text-gray-500 text-center">
                            Nhà hàng của bạn
                        </p>
                    </button>

                    {/* Restaurant Cards */}
                    {restaurants.map((restaurant) => (
                        <React.Fragment key={restaurant.id}>
                            {/* Main Restaurant Card */}
                            <button
                                onClick={() => handleRestaurantSelect(restaurant)}
                                onMouseEnter={() => setHoveredCard(restaurant.id)}
                                onMouseLeave={() => setHoveredCard(null)}
                                className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-200 text-left"
                            >
                                {/* Avatar/Cover */}
                                <div className="relative h-24 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                                    <img
                                        src={restaurant.avatar}
                                        alt={restaurant.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                                    {/* Role Badge */}
                                    <div className="absolute top-2 right-2">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(restaurant.role)}`}>
                                            {restaurant.role}
                                        </span>
                                    </div>

                                    {/* Arrow Icon on Hover */}
                                    <div className={`absolute bottom-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center transition-all duration-200 ${hoveredCard === restaurant.id ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
                                        }`}>
                                        <ChevronRight className="w-4 h-4 text-gray-900" />
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-3">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-0.5 truncate">
                                        {restaurant.name}
                                    </h3>
                                    <p className="text-xs text-gray-500 mb-2 truncate">
                                        {restaurant.location}
                                    </p>

                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Users className="w-3 h-3" />
                                            <span>{restaurant.staff}</span>
                                        </div>
                                        <span className="text-xs">{restaurant.lastAccess}</span>
                                    </div>
                                </div>
                            </button>

                            {/* POS Card - Only show for Owner */}
                            {restaurant.role === 'Owner' && (
                                <button
                                    onClick={() => handleGoPOS(restaurant)}
                                    onMouseEnter={() => setHoveredCard(`${restaurant.id}-pos`)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                    className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-200 text-left"
                                >
                                    {/* Avatar/Cover - Same as main card */}
                                    <div className="relative h-24 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                                        <img
                                            src={restaurant.avatar}
                                            alt={restaurant.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-60"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                                        {/* POS Badge - Different from role badge */}
                                        <div className="absolute top-2 right-2">
                                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-black text-white">
                                                POS
                                            </span>
                                        </div>

                                        {/* Arrow Icon on Hover */}
                                        <div className={`absolute bottom-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center transition-all duration-200 ${hoveredCard === `${restaurant.id}-pos` ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
                                            }`}>
                                            <ChevronRight className="w-4 h-4 text-gray-900" />
                                        </div>
                                    </div>

                                    {/* Info - Same layout as main card */}
                                    <div className="p-3">
                                        <h3 className="text-sm font-semibold text-gray-900 mb-0.5 truncate">
                                            {restaurant.name}
                                        </h3>
                                        <p className="text-xs text-gray-500 mb-2 truncate">
                                            Chế độ bán hàng
                                        </p>

                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                <span>{restaurant.staff}</span>
                                            </div>
                                            <span className="text-xs font-medium text-gray-900">POS</span>
                                        </div>
                                    </div>
                                </button>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RestaurantSelector;
