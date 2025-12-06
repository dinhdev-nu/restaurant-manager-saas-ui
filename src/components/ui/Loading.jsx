import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Loading component với nhiều variants
 * @param {Object} props
 * @param {string} props.variant - 'fullscreen' | 'inline' | 'spinner-only' (default: 'inline')
 * @param {string} props.message - Message hiển thị khi loading
 * @param {string} props.size - 'sm' | 'md' | 'lg' (default: 'md')
 */
export const Loading = ({
    variant = 'inline',
    message = 'Đang tải...',
    size = 'md'
}) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
    };

    const spinnerSize = sizeClasses[size] || sizeClasses.md;

    // Fullscreen loading - che toàn màn hình
    if (variant === 'fullscreen') {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900 z-50">
                <div className="text-center">
                    <Loader2 className={`${spinnerSize} animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4`} />
                    {message && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                            {message}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    // Spinner only - chỉ spinner không có text
    if (variant === 'spinner-only') {
        return (
            <Loader2 className={`${spinnerSize} animate-spin text-blue-600 dark:text-blue-400`} />
        );
    }

    // Inline loading - loading trong container
    return (
        <div className="flex items-center justify-center p-8">
            <div className="text-center">
                <Loader2 className={`${spinnerSize} animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-3`} />
                {message && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
};

// Export các preset variants để dùng nhanh
export const FullscreenLoading = ({ message = 'Đang tải...' }) => (
    <Loading variant="fullscreen" message={message} size="lg" />
);

export const InlineLoading = ({ message = 'Đang tải...', size = 'md' }) => (
    <Loading variant="inline" message={message} size={size} />
);

export const SpinnerOnly = ({ size = 'md' }) => (
    <Loading variant="spinner-only" size={size} />
);
