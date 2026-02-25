import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { EventSource } from 'eventsource';
import { useAuthStore } from '../stores/auth.store';
import { tokenRefreshService } from '../services/tokenRefresh';

const SSEContext = createContext(null);

const MAX_REFRESH_ATTEMPTS = 1; // Chỉ refresh token 1 lần trước khi fallback reconnect bình thường
const RECONNECT_DELAY_MS = 3000;

export const useSSE = () => {
    const context = useContext(SSEContext);
    if (!context) {
        throw new Error('useSSE must be used within SSEProvider');
    }
    return context;
};

/**
 * SSE Provider - Quản lý 1 kết nối SSE duy nhất cho toàn app
 */
export const SSEProvider = ({ children }) => {
    const eventSourceRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const listenersRef = useRef(new Map());
    const connectRef = useRef(null);
    const isConnectingRef = useRef(false);
    // Chỉ cho phép refresh token 1 lần — tránh loop vô tận khi refresh cũng fail
    const refreshAttemptsRef = useRef(0);

    const [isConnected, setIsConnected] = useState(false);
    const { token, user, logout } = useAuthStore();

    // Đăng ký listener để nhận events
    const subscribe = useCallback((id, callback) => {
        listenersRef.current.set(id, callback);
        return () => {
            listenersRef.current.delete(id);
        };
    }, []);

    // Phát event tới tất cả listeners
    const notifyListeners = useCallback((event) => {
        listenersRef.current.forEach((callback, id) => {
            try {
                callback(event);
            } catch (error) {
                console.error(`[SSE] Error in listener ${id}:`, error);
            }
        });
    }, []);

    // Disconnect SSE
    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
            setIsConnected(false);
        }
        isConnectingRef.current = false;
    }, []);

    // Refresh token và reconnect SSE - sử dụng shared service
    // Service tự động handle reuse promise nếu đang refresh, an toàn cho Promise.all
    const refreshTokenAndReconnect = useCallback(async () => {
        try {
            // tokenRefreshService.refresh() tự động reuse promise nếu đang refresh
            // → An toàn cho Promise.all và multiple concurrent 401s
            const newToken = await tokenRefreshService.refresh();

            if (newToken) {
                // Disconnect trước để clear connection cũ
                eventSourceRef.current?.close();
                eventSourceRef.current = null;
                setIsConnected(false);

                // Delay nhỏ để store cập nhật xong token trước khi connect lại
                setTimeout(() => connectRef.current?.(), 500);
                return true;
            }
            return false;
        } catch (error) {
            console.error('[SSE] Token refresh failed:', error);
            logout();
            disconnect();
            return false;
        }
    }, [logout, disconnect]);

    // Connect SSE
    const connect = useCallback(() => {
        if (isConnectingRef.current || eventSourceRef.current) return;
        if (!token || !user?._id) return;

        isConnectingRef.current = true;

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const url = `${apiUrl}/events/stream`;

            // eventsource v4 không còn hỗ trợ option `headers` trực tiếp.
            // Phải truyền custom `fetch` để gắn header Authorization.
            const eventSource = new EventSource(url, {
                fetch: (input, init) =>
                    fetch(input, {
                        ...init,
                        headers: { ...init?.headers, Authorization: `Bearer ${token}` },
                    }),
            });
            eventSourceRef.current = eventSource;

            eventSource.onopen = () => {
                setIsConnected(true);
                isConnectingRef.current = false;
                // Kết nối thành công → reset bộ đếm refresh
                refreshAttemptsRef.current = 0;
            };

            // onmessage chỉ nhận events KHÔNG có `event:` field.
            // Server luôn set type nên handler này sẽ không bao giờ được gọi.
            eventSource.onmessage = (event) => {
                console.warn('[SSE] Received untyped message (unexpected):', event.data);
                // Thử parse JSON xem bên trong có trường 'type' nào mà Server gửi gộp vào data không
                try {
                    const parsed = JSON.parse(event.data);

                    // Cực kỳ quan trọng: Nếu server gửi type bên TRONG payload data thay vì dùng SSE event name chuẩn
                    const eventType = parsed.type || 'message';

                    notifyListeners({ type: eventType, ...parsed });
                } catch {
                    // Nếu không phải JSON (vd: string thuần)
                    notifyListeners({ type: 'message', data: event.data });
                }
            };

            // Server dùng { data, type } → NestJS gửi SSE với `event: <type>`
            // Phải dùng addEventListener theo đúng tên type
            const handleNamedEvent = (eventName) => (event) => {
                console.log(`[SSE] Received event "${eventName}":`, event.data);
                try {
                    const parsed = JSON.parse(event.data);
                    notifyListeners({ type: eventName, data: parsed });
                } catch (err) {
                    // data không phải JSON (vd: keep-alive string)
                    notifyListeners({ type: eventName, data: event.data });
                }
            };

            eventSource.addEventListener('new_draft_order', handleNamedEvent('new_draft_order'));
            eventSource.addEventListener('new-order', handleNamedEvent('new-order'));
            eventSource.addEventListener('order-update', handleNamedEvent('order-update'));
            eventSource.addEventListener('table-update', handleNamedEvent('table-update'));
            eventSource.addEventListener('payment-update', handleNamedEvent('payment-update'));

            // eventsource v4 expose err.code — có thể check 401 chính xác,
            // không cần heuristic connectionOpenedRef nữa.
            eventSource.addEventListener('error', async (err) => {
                console.error('[SSE] ⚠️ Connection error:', {
                    code: err.code,
                    readyState: eventSource.readyState,
                    refreshAttempts: refreshAttemptsRef.current
                });

                setIsConnected(false);
                isConnectingRef.current = false;

                if (eventSource.readyState !== EventSource.CLOSED) return;

                eventSourceRef.current = null;

                // Token hết hạn → thử refresh 1 lần
                if (err.code === 401 && refreshAttemptsRef.current < MAX_REFRESH_ATTEMPTS) {
                    refreshAttemptsRef.current += 1;
                    const refreshed = await refreshTokenAndReconnect();
                    if (refreshed) return;
                }

                // Mọi lỗi khác (mạng, 403, 500...) → reconnect bình thường sau delay
                reconnectTimeoutRef.current = setTimeout(() => {
                    connectRef.current?.();
                }, RECONNECT_DELAY_MS);
            });

        } catch (error) {
            console.error('[SSE] Error creating EventSource:', error);
            setIsConnected(false);
            isConnectingRef.current = false;
            eventSourceRef.current = null;
        }
    }, [token, user?._id, notifyListeners, refreshTokenAndReconnect]);

    // Store connect function in ref để dùng bên trong callbacks mà không tạo closure stale
    connectRef.current = connect;

    const reconnect = useCallback(() => {
        disconnect();
        connect();
    }, [disconnect, connect]);

    useEffect(() => {
        if (token && user?._id) {
            connect();
        } else {
            disconnect();
        }
        return () => disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, user?._id]);

    const value = { isConnected, subscribe, reconnect, disconnect };

    return <SSEContext.Provider value={value}>{children}</SSEContext.Provider>;
};

/**
 * Hook để subscribe vào SSE events từ components
 * @param {function} callback - Callback function xử lý event
 * @param {string} componentId - ID của component (để tracking)
 */
export const useSSESubscription = (callback, componentId = 'unknown') => {
    const { subscribe, isConnected } = useSSE();

    useEffect(() => {
        if (!callback) return;
        const unsubscribe = subscribe(componentId, callback);
        return () => unsubscribe();
    }, [subscribe, callback, componentId]);

    return { isConnected };
};
