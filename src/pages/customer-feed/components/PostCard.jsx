import React, { memo } from 'react';
import { Menu } from '@headlessui/react';
import {
    EllipsisHorizontalIcon,
    BookmarkIcon,
    MapPinIcon,
    HeartIcon as HeartOutlineIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import Image from '../../../components/AppImage';

function PostCard({ post, onLike, onBookmark }) {
    return (
        <article
            key={post.id}
            className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-all duration-200"
        >
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
                                    <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
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
                                            onClick={() => onBookmark(post.id)}
                                            className={`${active ? 'bg-gray-50' : ''} w-full px-4 py-2 text-sm text-gray-700 text-left flex items-center space-x-2`}
                                        >
                                            <BookmarkIcon className="w-4 h-4" />
                                            <span>{post.bookmarked ? 'Bỏ lưu' : 'Lưu bài viết'}</span>
                                        </button>
                                    )}
                                </Menu.Item>
                            </div>
                        </Menu.Items>
                    </Menu>
                </div>

                <p className="text-gray-700 leading-relaxed mb-3">{post.content}</p>

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

            {post.images && post.images.length > 0 && (
                <div className={`grid ${post.images.length === 1 ? 'grid-cols-1' : post.images.length === 2 ? 'grid-cols-2' : 'grid-cols-2'} gap-1`}>
                    {post.images.slice(0, 4).map((img, idx) => (
                        <div
                            key={idx}
                            className={`relative overflow-hidden ${post.images.length === 3 && idx === 0 ? 'col-span-2' : ''} ${post.images.length === 1 ? 'h-[400px]' : 'h-64'}`}
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

            <div className="px-5 py-4 border-t border-gray-100">
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

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onLike(post.id)}
                        className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-2xl transition-all duration-200 font-medium border ${post.liked ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-200'}`}
                    >
                        {post.liked ? <HeartSolidIcon className="w-5 h-5" /> : <HeartOutlineIcon className="w-5 h-5" />}
                        <span className="text-sm">Thích</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-2xl bg-white text-gray-700 hover:bg-gray-100 transition-all duration-200 font-medium border border-gray-200">
                        <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7 8h10M7 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="text-sm">Bình luận</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-2xl bg-white text-gray-700 hover:bg-gray-100 transition-all duration-200 font-medium border border-gray-200">
                        <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 8v6l4-3-4-3zM4 6v12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="text-sm">Chia sẻ</span>
                    </button>
                </div>
            </div>
        </article>
    );
}

// Use React.memo to avoid unnecessary re-renders when parent state changes
export default memo(PostCard, (prevProps, nextProps) => {
    // shallow compare relevant props
    return prevProps.post === nextProps.post && prevProps.onLike === nextProps.onLike && prevProps.onBookmark === nextProps.onBookmark;
});
