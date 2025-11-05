import axios from "axios"
import { useAuthStore } from "../stores"

const BASE_URL = import.meta.env.VITE_SERVER_BASE_URL || "http://localhost:3000"

const CallApi = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: { 
        "Content-Type": "application/json" 
    },
})

const CallApiWithAuth = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: { 
        "Content-Type": "application/json" 
    },
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

export {
    CallApi,
    CallApiWithAuth
}