import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    HeartIcon,
    MagnifyingGlassIcon,
    CheckBadgeIcon,
    HomeIcon,
    UserCircleIcon,
    MapPinIcon,
    TagIcon,
    StarIcon,
    CalendarIcon,
    FireIcon,
    SparklesIcon,
    BuildingStorefrontIcon,
    PlusIcon
} from '@heroicons/react/24/outline';
import {
    HeartIcon as HeartSolidIcon,
    StarIcon as StarSolidIcon,
    FireIcon as FireSolidIcon
} from '@heroicons/react/24/solid';
import Image from '../../components/AppImage';
import FeedHeader from './components/FeedHeader';
import FilterTabs from './components/FilterTabs';
import CreateRestaurantBanner from './components/CreateRestaurantBanner';
import CreateRestaurantModal from './components/CreateRestaurantModal';
import AttentionModal from './components/AttentionModal';
import PostCard from './components/PostCard';
import { MOCK_NEARBY_RESTAURANTS, MOCK_POSTS } from '../../mocks/feedData';
import { useAuthStore } from '../../stores';
import { logoutApi } from '../../api/auth';
import './feed.css';

const CustomerFeed = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [activeFilter, setActiveFilter] = useState('all');
    const [posts, setPosts] = useState([]);
    const [nearbyRestaurants, setNearbyRestaurants] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [displayCount, setDisplayCount] = useState(3); // Pagination: số posts hiển thị ban đầu
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const loadMoreRef = useRef(null); // Ref cho intersection observer
    const [showFAB, setShowFAB] = useState(false); // Show FAB on scroll
    const [isAttentionModalOpen, setIsAttentionModalOpen] = useState(false); // Attention modal state

    const handleLocationChange = (location) => {
        setSelectedLocation(location);
        // Here you can filter restaurants/posts based on location
    };

    useEffect(() => {
        // Load mock data
        setNearbyRestaurants(MOCK_NEARBY_RESTAURANTS);
        setPosts(MOCK_POSTS);

        // Show attention modal after 3 seconds (simulate user browsing)
        const attentionTimer = setTimeout(() => {
            const hasSeenAttention = localStorage.getItem('hasSeenAttentionModal');
            if (!hasSeenAttention) {
                setIsAttentionModalOpen(true);
                localStorage.setItem('hasSeenAttentionModal', 'true');
            }
        }, 3000);

        return () => clearTimeout(attentionTimer);
    }, []);

    // Reset pagination when filter changes
    useEffect(() => {
        setDisplayCount(3);
    }, [activeFilter]);

    // Show/hide FAB on scroll (mobile only)
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 200) {
                setShowFAB(true);
            } else {
                setShowFAB(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLike = useCallback((postId) => {
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
    }, []);

    const handleBookmark = useCallback((postId) => {
        setPosts(prev => prev.map(post => {
            if (post.id === postId) {
                return {
                    ...post,
                    bookmarked: !post.bookmarked
                };
            }
            return post;
        }));
    }, []);

    const handleLogout = async () => {
        try {
            // Call API logout
            await logoutApi();

            // Clear Zustand store
            logout(false); // Keep saved credentials

            // Navigate to auth page
            navigate('/auth');
        } catch (error) {
            console.error('Logout error:', error);
            // Even if API fails, still logout locally
            logout(false);
            navigate('/auth');
        }
    };

    const filteredPosts = useMemo(() => {
        if (activeFilter === 'all') return posts;
        return posts.filter(post => post.type === activeFilter);
    }, [posts, activeFilter]);

    // Pagination: chỉ hiển thị một phần posts để giảm render overhead
    const displayedPosts = useMemo(() => {
        return filteredPosts.slice(0, displayCount);
    }, [filteredPosts, displayCount]);

    const hasMorePosts = displayedPosts.length < filteredPosts.length;

    const handleLoadMore = useCallback(() => {
        setIsLoadingMore(true);
        // Simulate loading delay (trong thực tế có thể là API call)
        setTimeout(() => {
            setDisplayCount(prev => prev + 3);
            setIsLoadingMore(false);
        }, 300);
    }, []);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        if (!loadMoreRef.current || !hasMorePosts || isLoadingMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMorePosts && !isLoadingMore) {
                    handleLoadMore();
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
        );

        observer.observe(loadMoreRef.current);

        return () => {
            if (loadMoreRef.current) {
                observer.unobserve(loadMoreRef.current);
            }
        };
    }, [hasMorePosts, isLoadingMore, handleLoadMore]);

    return (
        <div className="min-h-screen bg-white">
            {/* Header Component */}
            <FeedHeader user={user} onLocationChange={handleLocationChange} onLogout={handleLogout} />

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

                    {/* Main Feed */}
                    <main className="lg:col-span-6">
                        {/* Filter Tabs Component */}
                        <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />

                        {/* Posts */}
                        <div className="space-y-6">
                            {displayedPosts.map(post => (
                                <PostCard key={post.id} post={post} onLike={handleLike} onBookmark={handleBookmark} />
                            ))}
                        </div>

                        {/* Empty State */}
                        {displayedPosts.length === 0 && (
                            <div className="text-center py-20">
                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MagnifyingGlassIcon className="w-12 h-12 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Không có bài viết</h3>
                                <p className="text-gray-600">Chưa có bài viết nào trong danh mục này</p>
                            </div>
                        )}

                        {/* Load More */}
                        {hasMorePosts && (
                            <div ref={loadMoreRef} className="text-center py-8">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={isLoadingMore}
                                    className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-medium text-sm hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoadingMore ? (
                                        <span className="flex items-center space-x-2">
                                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Đang tải...</span>
                                        </span>
                                    ) : (
                                        `Xem thêm bài viết (${filteredPosts.length - displayedPosts.length} còn lại)`
                                    )}
                                </button>
                            </div>
                        )}

                        {/* All posts loaded message */}
                        {displayedPosts.length > 0 && !hasMorePosts && (
                            <div className="text-center py-8">
                                <p className="text-sm text-gray-500">🎉 Bạn đã xem hết tất cả bài viết</p>
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
                                <div className="space-y-1">
                                    {[
                                        { tag: '#BuffetNướng', posts: '2.4K bài viết' },
                                        { tag: '#KhuyếnMãi30', posts: '1.8K bài viết' },
                                        { tag: '#CàPhêĐàLạt', posts: '1.2K bài viết' },
                                        { tag: '#LẩuThái', posts: '956 bài viết' },
                                        { tag: '#PhởHàNội', posts: '784 bài viết' },
                                    ].map((item, idx) => (
                                        <button key={idx} className="w-full text-left p-2 rounded-xl hover:bg-white transition-colors">
                                            <p className="font-semibold text-gray-900 text-sm">{item.tag}</p>
                                            <p className="text-xs text-gray-500">{item.posts}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Create Restaurant Card */}
                            <CreateRestaurantBanner
                                onOpenModal={() => setIsCreateModalOpen(true)}
                                onOpenAttentionModal={() => setIsAttentionModalOpen(true)}
                            />
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

            {/* Floating Action Button - Mobile (for restaurant owners) */}
            <button
                onClick={() => setIsAttentionModalOpen(true)}
                className={`lg:hidden fixed right-4 bottom-20 z-40 group transition-all duration-300 ${showFAB ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
                    }`}
            >
                <div className="relative">
                    {/* Main button */}
                    <div className="w-14 h-14 bg-gray-900 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                        <BuildingStorefrontIcon className="w-6 h-6 text-white" />
                    </div>

                    {/* Badge indicator */}
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
                        <PlusIcon className="w-3 h-3 text-white" />
                    </div>

                    {/* Tooltip */}
                    <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                        <div className="bg-gray-900 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-lg">
                            Tạo nhà hàng
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                        </div>
                    </div>
                </div>
            </button>

            {/* Attention Modal */}
            <AttentionModal
                isOpen={isAttentionModalOpen}
                onClose={() => setIsAttentionModalOpen(false)}
                onOpenCreateModal={() => setIsCreateModalOpen(true)}
            />

            {/* Create Restaurant Modal */}
            <CreateRestaurantModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    );
};

export default CustomerFeed;
