import axios from "axios"
import { useAuthStore } from "../stores"
import { tokenRefreshService } from "../services/tokenRefresh"

const BASE_URL = import.meta.env.VITE_SERVER_BASE_URL || "http://localhost:3000"

const CallApi = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: { 
        "Content-Type": "application/json" 
    },
    withCredentials: true, // Cho phép gửi cookies
})

const CallApiWithAuth = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: { 
        "Content-Type": "application/json" 
    },
    withCredentials: true, // Cho phép gửi cookies
})

CallApiWithAuth.interceptors.request.use(
    (config) => {
        // Lấy token từ Zustand store
        const token = useAuthStore.getState().token
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor để xử lý 401 và refresh token
CallApiWithAuth.interceptors.response.use(
    (response) => {
        return response
    },
    async (error) => {
        const originalRequest = error.config
        
        // Nếu lỗi 401 và chưa retry
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true
            
            try {
                // Sử dụng shared token refresh service
                const newToken = await tokenRefreshService.refresh()
                
                if (newToken) {
                    // Cập nhật header Authorization với token mới
                    originalRequest.headers.Authorization = `Bearer ${newToken}`
                    
                    // Retry request ban đầu
                    return CallApiWithAuth(originalRequest)
                }
            } catch (refreshError) {
                console.error('[Axios] Token refresh failed, redirecting to /auth');
                // Token refresh failed - redirect về login
                window.location.href = '/auth'
                return Promise.reject(refreshError)
            }
        }
        
        return Promise.reject(error)
    }
)

export {
    CallApi,
    CallApiWithAuth
}