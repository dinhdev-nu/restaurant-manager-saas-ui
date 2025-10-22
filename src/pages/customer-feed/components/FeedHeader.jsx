import React, { Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import {
    MagnifyingGlassIcon,
    BellIcon,
    ArrowRightOnRectangleIcon,
    UserCircleIcon,
    BookmarkIcon
} from '@heroicons/react/24/outline';
import LocationSelector from './LocationSelector';

const FeedHeader = ({ user, onLocationChange }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/auth');
    };

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-xl">F</span>
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 hidden sm:block">Food Feed</h1>
                    </div>

                    {/* Search Bar - Desktop */}
                    <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
                        <div className="relative w-full">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm nhà hàng, món ăn..."
                                className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                        {/* Search - Mobile */}
                        <button className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                            <MagnifyingGlassIcon className="w-5 h-5 text-gray-600" />
                        </button>

                        {/* Location Selector */}
                        <LocationSelector onLocationChange={onLocationChange} />

                        {/* Notifications */}
                        <button className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                            <BellIcon className="w-5 h-5 text-gray-600" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                        </button>

                        {/* User Menu */}
                        {user && (
                            <Menu as="div" className="relative">
                                <Menu.Button className="flex items-center space-x-2 px-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors">
                                    <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm font-medium">
                                            {user.email?.[0]?.toUpperCase() || 'U'}
                                        </span>
                                    </div>
                                    <span className="hidden md:block text-sm font-medium text-gray-900 max-w-[100px] truncate">
                                        {user.firstName || user.email?.split('@')[0] || 'User'}
                                    </span>
                                </Menu.Button>

                                <Transition
                                    as={Fragment}
                                    enter="transition ease-out duration-100"
                                    enterFrom="transform opacity-0 scale-95"
                                    enterTo="transform opacity-100 scale-100"
                                    leave="transition ease-in duration-75"
                                    leaveFrom="transform opacity-100 scale-100"
                                    leaveTo="transform opacity-0 scale-95"
                                >
                                    <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-2xl shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden">
                                        <div className="p-4 border-b border-gray-100">
                                            <p className="text-sm font-semibold text-gray-900">{user.firstName || 'User'}</p>
                                            <p className="text-xs text-gray-500 truncate">{user.email || user.phoneNumber}</p>
                                        </div>
                                        <div className="py-2">
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <button className={`${active ? 'bg-gray-50' : ''} w-full px-4 py-2.5 text-left text-sm text-gray-700 flex items-center space-x-3`}>
                                                        <UserCircleIcon className="w-5 h-5" />
                                                        <span>Trang cá nhân</span>
                                                    </button>
                                                )}
                                            </Menu.Item>
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <button className={`${active ? 'bg-gray-50' : ''} w-full px-4 py-2.5 text-left text-sm text-gray-700 flex items-center space-x-3`}>
                                                        <BookmarkIcon className="w-5 h-5" />
                                                        <span>Đã lưu</span>
                                                    </button>
                                                )}
                                            </Menu.Item>
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <button
                                                        onClick={handleLogout}
                                                        className={`${active ? 'bg-red-50 text-red-600' : 'text-gray-700'} w-full px-4 py-2.5 text-left text-sm flex items-center space-x-3`}
                                                    >
                                                        <ArrowRightOnRectangleIcon className="w-5 h-5" />
                                                        <span>Đăng xuất</span>
                                                    </button>
                                                )}
                                            </Menu.Item>
                                        </div>
                                    </Menu.Items>
                                </Transition>
                            </Menu>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default FeedHeader;
