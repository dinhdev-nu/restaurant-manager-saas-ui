import axios from "axios"
import { useAuthStore } from "../stores"

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

// Refresh token queue management
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error)
        } else {
            resolve(token)
        }
    })
    failedQueue = []
}

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
            // Nếu đang refresh, thêm request vào queue
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`
                    return CallApiWithAuth(originalRequest)
                }).catch(err => {
                    return Promise.reject(err)
                })
            }

            originalRequest._retry = true
            isRefreshing = true
            
            try {
                // Gọi refresh token API - server tự lấy refresh token từ cookies
                const response = await CallApi.post('/auths/refresh')
                
                if (response.data?.metadata?.accessToken) {
                    const newToken = response.data.metadata.accessToken
                    
                    // Lưu access token mới vào store
                    useAuthStore.getState().setToken(newToken)
                    
                    // Process tất cả requests đang chờ trong queue
                    processQueue(null, newToken)
                    
                    // Cập nhật header Authorization với token mới
                    originalRequest.headers.Authorization = `Bearer ${newToken}`
                    
                    // Retry request ban đầu
                    return CallApiWithAuth(originalRequest)
                }
            } catch (refreshError) {
                // Process queue với error
                processQueue(refreshError, null)
                
                // Clear auth state và redirect về trang login
                // useAuthStore.getState().logout()
                // window.location.href = '/auth'
                return Promise.reject(refreshError)
            } finally {
                isRefreshing = false
            }
        }
        
        return Promise.reject(error)
    }
)

export {
    CallApi,
    CallApiWithAuth
}