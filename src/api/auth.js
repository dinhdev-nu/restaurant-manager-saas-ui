import { CallApi, CallApiWithAuth } from "./axios"


export const registerApi = async ({ email }) => {
    const res = await CallApi.post("/auths/register", { email })
    return res.data
}

export const sendOtpApi = async ({ email }) => {
    const res = await CallApi.post("/auths/send-otp", { email })
    return res.data
}

export const verifyOtpApi = async ({ email, otp }) => {
    const res = await CallApi.post("/auths/verify-otp", { accountName: email, otp })
    return res.data
}

export const signup = async ({ email, password }) => {
    const res = await CallApi.post("/auths/signup", { email, password })
    return res.data
}

export const signin = async ({ email, password }) => {
    const res = await CallApi.post("/auths/login", { email, password }, {
        withCredentials: true
    })
    return res.data
}

export const logout = async () => {
    const res = await CallApiWithAuth.post("/auths/logout", {}, {
        withCredentials: true
    })
    return res.data
}

export const googleAuthApi = () => {
    window.location.href = import.meta.env.VITE_SERVER_BASE_URL + '/auths/google'
}

export const logoutApi = async () => {
    const res = await CallApi.post("/auths/logout", {}, {
        withCredentials: true
    })
    return res.data
}