import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight, Users, Loader2 } from 'lucide-react';
import { useRestaurantStore } from '../../stores';
import { MOCK_DISTRICTS, MOCK_PROVINCES } from 'mocks/locations';
import { getMyRestaurantsApi, getRestaurantDetailsApi } from '../../api/restaurant';
import { toast } from '../../hooks/use-toast';

const RestaurantSelector = () => {
    const navigate = useNavigate();
    const restaurantsFromStore = useRestaurantStore((state) => state.getAllRestaurants());
    const setRestaurantsFromMetadata = useRestaurantStore((state) => state.setRestaurantsFromMetadata);
    const [hoveredCard, setHoveredCard] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectingId, setSelectingId] = useState(null);

    useEffect(() => {
        const fetchMyRestaurants = async () => {
            try {
                setIsLoading(true);
                const response = await getMyRestaurantsApi();
                console.log('API response for my restaurants:', response);
                if (response.metadata) {
                    const restaurants = setRestaurantsFromMetadata(response.metadata);
                    console.log('Processed restaurants:', restaurants);
                }
            } catch (error) {
                console.error('Error fetching restaurants:', error);
                toast({
                    title: 'Lỗi',
                    description: 'Không thể tải danh sách nhà hàng. Vui lòng thử lại!',
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchMyRestaurants();
    }, []);

    const handleRestaurantSelect = async (restaurant) => {
        if (selectingId) return;
        setSelectingId(restaurant._id);
        try {
            const response = await getRestaurantDetailsApi(restaurant._id);
            const details = response.metadata || response;
            const selectRestaurant = useRestaurantStore.getState().selectRestaurant;
            selectRestaurant({ ...restaurant, ...details });
            navigate('/dashboard');
        } catch (error) {
            console.error('Error fetching restaurant details:', error);
            toast({
                title: 'Lỗi',
                description: 'Không thể tải thông tin nhà hàng. Vui lòng thử lại!',
                variant: 'destructive',
            });
        } finally {
            setSelectingId(null);
        }
    };

    const handleCreateRestaurant = () => {
        navigate('/feed');
    };

    const handleGoPOS = async (restaurant) => {
        const posKey = `${restaurant._id}-pos`;
        if (selectingId) return;
        setSelectingId(posKey);
        try {
            const response = await getRestaurantDetailsApi(restaurant._id);
            const details = response.metadata || response;
            const selectRestaurant = useRestaurantStore.getState().selectRestaurant;
            console.log('Selecting restaurant for POS:', restaurant);
            selectRestaurant({ ...restaurant, ...details, mode: 'pos' });
            navigate('/main-pos-dashboard');
        } catch (error) {
            console.error('Error fetching restaurant details:', error);
            toast({
                title: 'Lỗi',
                description: 'Không thể tải thông tin nhà hàng. Vui lòng thử lại!',
                variant: 'destructive',
            });
        } finally {
            setSelectingId(null);
        }
        ;
    }

    const getRoleBadgeColor = (role) => {
        const roleKey = role?.toLowerCase() || '';
        if (roleKey.includes('chủ') || roleKey.includes('owner')) {
            return 'bg-black text-white';
        }
        if (roleKey.includes('quản lý') || roleKey.includes('manager')) {
            return 'bg-gray-900 text-white';
        }
        if (roleKey.includes('nhân viên') || roleKey.includes('staff')) {
            return 'bg-gray-700 text-white';
        }
        return 'bg-gray-500 text-white';
    };

    const getTimeAgo = (dateString) => {
        if (!dateString) return 'Mới tạo';

        const now = new Date();
        const created = new Date(dateString);
        const diffMs = now - created;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        const diffMonths = Math.floor(diffDays / 30);
        const diffYears = Math.floor(diffDays / 365);

        if (diffMins < 1) return 'Vừa xong';
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        if (diffDays < 30) return `${diffDays} ngày trước`;
        if (diffMonths < 12) return `${diffMonths} tháng trước`;
        return `${diffYears} năm trước`;
    };

    const formatAddress = (restaurant) => {
        const parts = [];

        if (restaurant.address) {
            parts.push(restaurant.address);
        }
        if (restaurant.district) {
            const district = MOCK_DISTRICTS[restaurant.city].find(d => d.code == restaurant.district);
            parts.push(district.name);
        }
        if (restaurant.city) {
            const city = MOCK_PROVINCES.find(p => p.code == restaurant.city);
            parts.push(city.name);
        }

        if (parts.length > 0) {
            return parts.join(', ');
        }

        return restaurant.cuisine || 'Chưa cập nhật';
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

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
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

                    {isLoading && (
                        <>
                            {[...Array(6)].map((_, index) => (
                                <div
                                    key={`skeleton-${index}`}
                                    className="relative bg-white border border-gray-200 rounded-xl overflow-hidden animate-pulse"
                                >
                                    <div className="relative h-24 bg-gradient-to-br from-gray-200 to-gray-300">
                                        <div className="absolute top-2 right-2 w-16 h-5 bg-gray-300 rounded"></div>
                                    </div>

                                    <div className="p-3 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                                        <div className="flex items-center justify-between">
                                            <div className="h-3 bg-gray-200 rounded w-12"></div>
                                            <div className="h-3 bg-gray-200 rounded w-16"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}

                    {!isLoading && restaurantsFromStore.map((restaurant) => (
                        <React.Fragment key={restaurant._id}>
                            <button
                                onClick={() => handleRestaurantSelect(restaurant)}
                                onMouseEnter={() => setHoveredCard(restaurant._id)}
                                onMouseLeave={() => setHoveredCard(null)}
                                disabled={!!selectingId}
                                className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-200 text-left disabled:opacity-70 disabled:cursor-wait"
                            >
                                {selectingId === restaurant._id && (
                                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 rounded-xl">
                                        <Loader2 className="w-6 h-6 text-gray-700 animate-spin" />
                                    </div>
                                )}
                                <div className="relative h-24 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                                    {restaurant.logo ? (
                                        <img
                                            src={restaurant.logo}
                                            alt={restaurant.restaurantName}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="text-4xl">🍽️</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                                    <div className="absolute top-2 right-2">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(restaurant.role)}`}>
                                            {restaurant.role || 'Chủ nhà hàng'}
                                        </span>
                                    </div>

                                    <div className={`absolute bottom-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center transition-all duration-200 ${hoveredCard === restaurant._id ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
                                        }`}>
                                        <ChevronRight className="w-4 h-4 text-gray-900" />
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-3">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-0.5 truncate">
                                        {restaurant.restaurantName}
                                    </h3>
                                    <p className="text-xs text-gray-500 mb-2 truncate">
                                        {formatAddress(restaurant)}
                                    </p>

                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Users className="w-3 h-3" />
                                            <span>{restaurant.capacity || 0}</span>
                                        </div>
                                        <span className="text-xs">{getTimeAgo(restaurant.createdAt)}</span>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => handleGoPOS(restaurant)}
                                onMouseEnter={() => setHoveredCard(`${restaurant._id}-pos`)}
                                onMouseLeave={() => setHoveredCard(null)}
                                disabled={!!selectingId}
                                className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-200 text-left disabled:opacity-70 disabled:cursor-wait"
                            >
                                {selectingId === `${restaurant._id}-pos` && (
                                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 rounded-xl">
                                        <Loader2 className="w-6 h-6 text-gray-700 animate-spin" />
                                    </div>
                                )}
                                <div className="relative h-24 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                                    {restaurant.logo ? (
                                        <img
                                            src={restaurant.logo}
                                            alt={restaurant.restaurantName}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-60"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center opacity-60">
                                            <span className="text-4xl">🍽️</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                                    <div className="absolute top-2 right-2">
                                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-black text-white">
                                            POS
                                        </span>
                                    </div>

                                    <div className={`absolute bottom-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center transition-all duration-200 ${hoveredCard === `${restaurant._id}-pos` ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
                                        }`}>
                                        <ChevronRight className="w-4 h-4 text-gray-900" />
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-3">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-0.5 truncate">
                                        {restaurant.restaurantName}
                                    </h3>
                                    <p className="text-xs text-gray-500 mb-2 truncate">
                                        Chế độ bán hàng
                                    </p>

                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Users className="w-3 h-3" />
                                            <span>{restaurant.capacity || 0}</span>
                                        </div>
                                        <span className="text-xs font-medium text-gray-900">POS</span>
                                    </div>
                                </div>
                            </button>
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
}; export default RestaurantSelector;
