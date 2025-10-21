import axios from "axios"



const CallApi = axios.create({
    baseURL: import.meta.env.VITE_SERVER_BASE_URL || "http://localhost:3000",
    timeout: 10000,
    headers: { "Content-Type": "application/json" },
})



export { CallApi }
