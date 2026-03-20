/**
 * Shared Token Refresh Service
 * 
 * Quản lý refresh token tập trung để tránh race condition
 * giữa axios interceptor và SSE connection.
 */

import { useAuthStore } from '../stores/auth.store';

class TokenRefreshService {
    constructor() {
        this.isRefreshing = false;
        this.refreshPromise = null;
        this.pendingCallbacks = [];
        this.lastRefreshTime = 0; // Track last successful refresh
        this.MIN_REFRESH_INTERVAL = 1000; // Minimum 1s between refresh attempts
    }

    /**
     * Refresh token - nếu đang refresh thì chờ kết quả, không gọi lại
     * @returns {Promise<string|null>} New access token or null if failed
     */
    async refresh() {
        // Nếu đang refresh, return promise hiện tại - CRITICAL for Promise.all
        if (this.isRefreshing && this.refreshPromise) {
            return this.refreshPromise;
        }

        // Debounce: Tránh spam refresh requests
        const now = Date.now();
        if (now - this.lastRefreshTime < this.MIN_REFRESH_INTERVAL) {
            await new Promise(resolve => setTimeout(resolve, this.MIN_REFRESH_INTERVAL));
        }

        this.isRefreshing = true;
        
        // Tạo promise mới cho refresh process
        this.refreshPromise = this._performRefresh();
        
        try {
            const newToken = await this.refreshPromise;
            this.lastRefreshTime = Date.now();
            this._notifyCallbacks(null, newToken);
            return newToken;
        } catch (error) {
            console.error('[TokenRefresh] Refresh failed:', error.message);
            this._notifyCallbacks(error, null);
            throw error;
        } finally {
            this.isRefreshing = false;
            this.refreshPromise = null;
        }
    }

    /**
     * Perform actual refresh API call
     * @private
     */
    async _performRefresh() {
        try {
            // Import động để tránh circular dependency
            const { CallApi } = await import('../api/axios');

            const response = await CallApi.post('/auths/refresh-token', {}, {
                withCredentials: true
            });

            // API returns { data: { access_token: string } }
            const newToken = response.data?.data?.access_token;

            if (newToken) {
                useAuthStore.getState().setToken(newToken);
                return newToken;
            }

            throw new Error('No access token in refresh response');
        } catch (error) {
            console.error('[TokenRefresh] Failed to refresh token:', error);

            // Clear auth và logout
            useAuthStore.getState().logout();
            throw error;
        }
    }

    /**
     * Subscribe to refresh result (cho axios queue)
     */
    subscribeToRefresh(callback) {
        if (!this.isRefreshing) {
            // Không đang refresh - gọi callback ngay
            return callback(null, useAuthStore.getState().token);
        }
        
        this.pendingCallbacks.push(callback);
    }

    /**
     * Notify all subscribers
     * @private
     */
    _notifyCallbacks(error, token) {
        this.pendingCallbacks.forEach(callback => {
            try {
                callback(error, token);
            } catch (err) {
                console.error('[TokenRefresh] Error in callback:', err);
            }
        });
        this.pendingCallbacks = [];
    }

    /**
     * Check if currently refreshing
     */
    get isCurrentlyRefreshing() {
        return this.isRefreshing;
    }
}

// Export singleton instance
export const tokenRefreshService = new TokenRefreshService();
