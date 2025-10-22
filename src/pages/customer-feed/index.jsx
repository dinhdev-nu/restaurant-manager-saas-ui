import React, { useState, useEffect } from 'react';
import { Menu } from '@headlessui/react';
import {
    HeartIcon,
    ChatBubbleLeftIcon,
    ShareIcon,
    EllipsisHorizontalIcon,
    MagnifyingGlassIcon,
    CheckBadgeIcon,
    BookmarkIcon,
    HomeIcon,
    UserCircleIcon,
    MapPinIcon,
    TagIcon,
    StarIcon,
    CalendarIcon,
    FireIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import {
    HeartIcon as HeartSolidIcon,
    StarIcon as StarSolidIcon,
    FireIcon as FireSolidIcon
} from '@heroicons/react/24/solid';
import Image from '../../components/AppImage';
import FeedHeader from './components/FeedHeader';
import FilterTabs from './components/FilterTabs';
import { MOCK_NEARBY_RESTAURANTS, MOCK_POSTS } from '../../mocks/feedData';
import './feed.css';

const CustomerFeed = () => {
    const [user, setUser] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [posts, setPosts] = useState([]);
    const [nearbyRestaurants, setNearbyRestaurants] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);

    const handleLocationChange = (location) => {
        setSelectedLocation(location);
        console.log('Selected location:', location);
        // Here you can filter restaurants/posts based on location
    };

    useEffect(() => {
        // Get user from localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }

        // Load mock data
        setNearbyRestaurants(MOCK_NEARBY_RESTAURANTS);
        setPosts(MOCK_POSTS);
    }, []);

    const filters = [
        { id: 'all', label: 'Tất cả', icon: HomeIcon, color: 'text-gray-700' },
        { id: 'promotion', label: 'Khuyến mãi', icon: TagIcon, color: 'text-red-500' },
        { id: 'new_menu', label: 'Menu mới', icon: SparklesIcon, color: 'text-purple-500' },
        { id: 'feedback', label: 'Review', icon: StarIcon, color: 'text-yellow-500' },
        { id: 'event', label: 'Sự kiện', icon: CalendarIcon, color: 'text-blue-500' },
        { id: 'experience', label: 'Kinh nghiệm', icon: FireIcon, color: 'text-orange-500' }
    ];

    const handleLike = (postId) => {
        setPosts(prev => prev.map(post => {
            if (post.id === postId) {
                return {
                    ...post,
                    liked: !post.liked,
                    likes: post.liked ? post.likes - 1 : post.likes + 1
                };
            }
            return post;
        }));
    };

    const handleBookmark = (postId) => {
        setPosts(prev => prev.map(post => {
            if (post.id === postId) {
                return {
                    ...post,
                    bookmarked: !post.bookmarked
                };
            }
            return post;
        }));
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/auth');
    };

    const filteredPosts = activeFilter === 'all'
        ? posts
        : posts.filter(post => post.type === activeFilter);

    return (
        <div className="min-h-screen bg-white">
            {/* Header Component */}
            <FeedHeader user={user} onLocationChange={handleLocationChange} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Sidebar - Nearby Restaurants */}
                    <aside className="hidden lg:block lg:col-span-3">
                        <div className="sticky top-24 space-y-6">
                            {/* Nearby Restaurants */}
                            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                                        <MapPinIcon className="w-5 h-5 text-red-500" />
                                        <span>Gần bạn</span>
                                    </h3>
                                    <button className="text-xs text-gray-600 hover:text-gray-900 font-medium transition-colors">
                                        Xem tất cả
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {nearbyRestaurants.map(restaurant => (
                                        <div key={restaurant.id} className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white cursor-pointer transition-colors">
                                            <div className="relative flex-shrink-0">
                                                <Image
                                                    src={restaurant.image}
                                                    alt={restaurant.name}
                                                    className="w-12 h-12 rounded-xl object-cover"
                                                />
                                                {restaurant.verified && (
                                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                                                        <CheckBadgeIcon className="w-2.5 h-2.5 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{restaurant.name}</p>
                                                <div className="flex items-center space-x-2 text-xs text-gray-500">
                                                    <span className="flex items-center">
                                                        <StarSolidIcon className="w-3 h-3 text-yellow-500 mr-0.5" />
                                                        {restaurant.rating}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{restaurant.distance}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                                <h3 className="font-semibold text-gray-900 mb-3">Thống kê</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Nhà hàng đang theo dõi</span>
                                        <span className="font-semibold text-gray-900">24</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Bài viết đã lưu</span>
                                        <span className="font-semibold text-gray-900">156</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Đánh giá của bạn</span>
                                        <span className="font-semibold text-gray-900">89</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Feed */}
                    <main className="lg:col-span-6">
                        {/* Filter Tabs Component */}
                        <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />

                        {/* Posts */}
                        <div className="space-y-6">
                            {filteredPosts.map(post => (
                                <article
                                    key={post.id}
                                    className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-all duration-200"
                                >
                                    {/* Post Header */}
                                    <div className="p-5">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-start space-x-3">
                                                <div className="relative flex-shrink-0">
                                                    <Image
                                                        src={post.restaurant.avatar}
                                                        alt={post.restaurant.name}
                                                        className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
                                                    />
                                                    {post.restaurant.verified && (
                                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center ring-2 ring-gray-50">
                                                            <CheckBadgeIcon className="w-3 h-3 text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{post.restaurant.name}</h3>
                                                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                                                        <span>{post.timestamp}</span>
                                                        <span>•</span>
                                                        <span className="flex items-center">
                                                            <MapPinIcon className="w-3 h-3 mr-1 text-red-500" />
                                                            {post.restaurant.location}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Menu as="div" className="relative">
                                                <Menu.Button className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                                                    <EllipsisHorizontalIcon className="w-5 h-5 text-gray-400" />
                                                </Menu.Button>
                                                <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                                    <div className="py-1">
                                                        <Menu.Item>
                                                            {({ active }) => (
                                                                <button
                                                                    onClick={() => handleBookmark(post.id)}
                                                                    className={`${active ? 'bg-gray-50' : ''} w-full px-4 py-2 text-sm text-gray-700 text-left flex items-center space-x-2`}
                                                                >
                                                                    <BookmarkIcon className="w-4 h-4" />
                                                                    <span>{post.bookmarked ? 'Bỏ lưu' : 'Lưu bài viết'}</span>
                                                                </button>
                                                            )}
                                                        </Menu.Item>
                                                        <Menu.Item>
                                                            {({ active }) => (
                                                                <button className={`${active ? 'bg-gray-50' : ''} w-full px-4 py-2 text-sm text-gray-700 text-left`}>
                                                                    Báo cáo
                                                                </button>
                                                            )}
                                                        </Menu.Item>
                                                    </div>
                                                </Menu.Items>
                                            </Menu>
                                        </div>

                                        {/* Content */}
                                        <p className="text-gray-700 leading-relaxed mb-3">{post.content}</p>

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {post.tags?.map((tag, idx) => (
                                                <span
                                                    key={idx}
                                                    className="inline-flex items-center px-3 py-1 bg-white text-gray-700 text-xs font-medium rounded-full border border-gray-200"
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Special Info Cards */}
                                        {post.promotion && (
                                            <div className="mb-4 p-4 bg-white rounded-2xl border-2 border-gray-900">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-xs text-gray-600 font-medium mb-1">KHUYẾN MÃI</p>
                                                        <p className="text-2xl font-bold text-gray-900">{post.promotion.discount} OFF</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-gray-600">Có hiệu lực đến</p>
                                                        <p className="text-sm font-semibold text-gray-900">{post.promotion.validUntil}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {post.event && (
                                            <div className="mb-4 p-4 bg-white rounded-2xl border-2 border-gray-900">
                                                <div className="grid grid-cols-3 gap-4 text-center">
                                                    <div>
                                                        <p className="text-xs text-gray-600 mb-1">Giá</p>
                                                        <p className="text-lg font-bold text-gray-900">{post.event.price}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-600 mb-1">Thời gian</p>
                                                        <p className="text-sm font-semibold text-gray-900">{post.event.time}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-600 mb-1">Đặc biệt</p>
                                                        <p className="text-sm font-semibold text-gray-900">{post.event.special}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Customer Feedback */}
                                        {post.customerFeedback && (
                                            <div className="mb-4 p-4 bg-white rounded-2xl border border-gray-200">
                                                <div className="flex items-start space-x-3">
                                                    <Image
                                                        src={post.customerFeedback.avatar}
                                                        alt={post.customerFeedback.name}
                                                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2 mb-2">
                                                            <p className="font-semibold text-gray-900 text-sm">{post.customerFeedback.name}</p>
                                                            <div className="flex items-center space-x-0.5">
                                                                {[...Array(post.customerFeedback.rating)].map((_, i) => (
                                                                    <StarSolidIcon key={i} className="w-4 h-4 text-yellow-500" />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-gray-700 leading-relaxed italic">"{post.customerFeedback.comment}"</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Images */}
                                    {post.images && post.images.length > 0 && (
                                        <div className={`grid ${post.images.length === 1 ? 'grid-cols-1' :
                                            post.images.length === 2 ? 'grid-cols-2' :
                                                'grid-cols-2'
                                            } gap-1`}>
                                            {post.images.slice(0, 4).map((img, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`relative overflow-hidden ${post.images.length === 3 && idx === 0 ? 'col-span-2' : ''
                                                        } ${post.images.length === 1 ? 'h-[400px]' : 'h-64'}`}
                                                >
                                                    <Image
                                                        src={img}
                                                        alt={`Post image ${idx + 1}`}
                                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer"
                                                    />
                                                    {idx === 3 && post.images.length > 4 && (
                                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                                                            <span className="text-white text-3xl font-bold">+{post.images.length - 4}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="px-5 py-4 border-t border-gray-100">
                                        {/* Stats */}
                                        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                                            <div className="flex items-center space-x-4">
                                                <span className="flex items-center space-x-1.5 font-medium">
                                                    <HeartSolidIcon className="w-5 h-5 text-red-500" />
                                                    <span>{post.likes.toLocaleString()}</span>
                                                </span>
                                                <span>{post.comments} bình luận</span>
                                            </div>
                                            <span>{post.shares} chia sẻ</span>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleLike(post.id)}
                                                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-2xl transition-all duration-200 font-medium border ${post.liked
                                                    ? 'bg-gray-900 text-white border-gray-900'
                                                    : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-200'
                                                    }`}
                                            >
                                                {post.liked ? (
                                                    <HeartSolidIcon className="w-5 h-5" />
                                                ) : (
                                                    <HeartIcon className="w-5 h-5" />
                                                )}
                                                <span className="text-sm">Thích</span>
                                            </button>
                                            <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-2xl bg-white text-gray-700 hover:bg-gray-100 transition-all duration-200 font-medium border border-gray-200">
                                                <ChatBubbleLeftIcon className="w-5 h-5" />
                                                <span className="text-sm">Bình luận</span>
                                            </button>
                                            <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-2xl bg-white text-gray-700 hover:bg-gray-100 transition-all duration-200 font-medium border border-gray-200">
                                                <ShareIcon className="w-5 h-5" />
                                                <span className="text-sm">Chia sẻ</span>
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {/* Empty State */}
                        {filteredPosts.length === 0 && (
                            <div className="text-center py-20">
                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MagnifyingGlassIcon className="w-12 h-12 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Không có bài viết</h3>
                                <p className="text-gray-600">Chưa có bài viết nào trong danh mục này</p>
                            </div>
                        )}

                        {/* Load More */}
                        {filteredPosts.length > 0 && (
                            <div className="text-center py-8">
                                <button className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-medium text-sm hover:bg-gray-800 transition-all duration-200">
                                    Xem thêm bài viết
                                </button>
                            </div>
                        )}
                    </main>

                    {/* Right Sidebar - Trending */}
                    <aside className="hidden lg:block lg:col-span-3">
                        <div className="sticky top-24 space-y-6">
                            {/* Trending Topics */}
                            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5">
                                <h3 className="font-semibold text-gray-900 flex items-center space-x-2 mb-4">
                                    <FireSolidIcon className="w-5 h-5 text-orange-500" />
                                    <span>Đang hot</span>
                                </h3>
                                <div className="space-y-1.5">
                                    {[
                                        { tag: '#BuffetNướng', posts: '2.4K bài viết' },
                                        { tag: '#KhuyếnMãi30', posts: '1.8K bài viết' },
                                        { tag: '#CàPhêĐàLạt', posts: '1.2K bài viết' },
                                        { tag: '#LẩuThái', posts: '956 bài viết' },
                                        { tag: '#PhởHàNội', posts: '784 bài viết' },
                                    ].map((item, idx) => (
                                        <button key={idx} className="w-full text-left p-2.5 rounded-xl hover:bg-white transition-colors">
                                            <p className="font-semibold text-gray-900 text-sm mb-0.5">{item.tag}</p>
                                            <p className="text-xs text-gray-500">{item.posts}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Suggestions */}
                            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                                <h3 className="font-semibold text-gray-900 mb-3">Gợi ý cho bạn</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Theo dõi các nhà hàng yêu thích để không bỏ lỡ khuyến mãi mới nhất!
                                </p>
                                <button className="w-full py-2.5 bg-gray-900 text-white rounded-2xl font-medium text-sm hover:bg-gray-800 transition-all duration-200">
                                    Khám phá ngay
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {/* Bottom Navigation - Mobile */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-200 z-50">
                <div className="flex items-center justify-around py-3 px-4">
                    <button className="flex flex-col items-center space-y-1">
                        <div className="w-11 h-11 bg-gray-900 rounded-full flex items-center justify-center">
                            <HomeIcon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs font-medium text-gray-900">Trang chủ</span>
                    </button>
                    <button className="flex flex-col items-center space-y-1">
                        <div className="w-11 h-11 bg-gray-100 rounded-full flex items-center justify-center">
                            <MagnifyingGlassIcon className="w-5 h-5 text-gray-600" />
                        </div>
                        <span className="text-xs text-gray-600">Tìm kiếm</span>
                    </button>
                    <button className="flex flex-col items-center space-y-1">
                        <div className="w-11 h-11 bg-gray-100 rounded-full flex items-center justify-center">
                            <HeartIcon className="w-5 h-5 text-gray-600" />
                        </div>
                        <span className="text-xs text-gray-600">Yêu thích</span>
                    </button>
                    <button className="flex flex-col items-center space-y-1">
                        <div className="w-11 h-11 bg-gray-100 rounded-full flex items-center justify-center">
                            <UserCircleIcon className="w-5 h-5 text-gray-600" />
                        </div>
                        <span className="text-xs text-gray-600">Cá nhân</span>
                    </button>
                </div>
            </nav>
        </div>
    );
};

export default CustomerFeed;
