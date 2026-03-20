import { CallApi, CallApiWithAuth } from "./axios"

// ============================================================================
// AUTH APIs - Public
// ============================================================================

/**
 * 1. Check if email is available for registration
 * POST /auths/check-email
 */
export const checkEmailApi = async (email) => {
    const res = await CallApi.post("/auths/check-email", { email })
    return res.data
}

/**
 * 2. Register new account
 * POST /auths/register
 */
export const registerApi = async ({ email, password, full_name, phone }) => {
    const res = await CallApi.post("/auths/register", {
        email,
        password,
        full_name,
        ...(phone && { phone })
    })
    return res.data
}

/**
 * 3. Verify OTP after registration
 * POST /auths/verify-otp
 */
export const verifyOtpApi = async ({ email, otp }) => {
    const res = await CallApi.post("/auths/verify-otp", { email, otp })
    return res.data
}

/**
 * 4. Resend OTP for email verification
 * POST /auths/resend-otp
 */
export const resendOtpApi = async (email) => {
    const res = await CallApi.post("/auths/resend-otp", { email })
    return res.data
}

/**
 * 5. Login with email/phone and password
 * POST /auths/login
 */
export const loginApi = async ({ identifier, password, remember_me = false }) => {
    const res = await CallApi.post("/auths/login", {
        identifier,
        password,
        remember_me
    }, {
        withCredentials: true
    })
    return res.data
}

/**
 * 6. Send 2FA OTP (after login returns temp_token)
 * POST /auths/2fa/send-otp
 */
export const send2faOtpApi = async (temp_token) => {
    const res = await CallApi.post("/auths/2fa/send-otp", { temp_token })
    return res.data
}

/**
 * 7. Verify 2FA OTP and complete login
 * POST /auths/2fa/verify-otp
 */
export const verify2faOtpApi = async ({ temp_token, otp }) => {
    const res = await CallApi.post("/auths/2fa/verify-otp", { temp_token, otp }, {
        withCredentials: true
    })
    return res.data
}

/**
 * 8. Refresh access token
 * POST /auths/refresh-token
 */
export const refreshTokenApi = async () => {
    const res = await CallApi.post("/auths/refresh-token", {}, {
        withCredentials: true
    })
    return res.data
}

/**
 * 11. Request password reset (forgot password)
 * POST /auths/forgot-password
 */
export const forgotPasswordApi = async (email) => {
    const res = await CallApi.post("/auths/forgot-password", { email })
    return res.data
}

/**
 * 12. Verify OTP for password reset
 * POST /auths/reset-password/verify-otp
 */
export const verifyResetPasswordOtpApi = async ({ session_token, otp }) => {
    const res = await CallApi.post("/auths/reset-password/verify-otp", {
        session_token,
        otp
    })
    return res.data
}

/**
 * 13. Reset password with grant token
 * POST /auths/reset-password
 */
export const resetPasswordApi = async ({ grant_token, new_password }) => {
    const res = await CallApi.post("/auths/reset-password", {
        grant_token,
        new_password
    })
    return res.data
}

/**
 * 21. Initiate OAuth login
 * GET /auths/oauth/:provider
 */
export const oauthLoginApi = (provider) => {
    const baseUrl = import.meta.env.VITE_SERVER_BASE_URL || "http://localhost:3000"
    window.location.href = `${baseUrl}/auths/oauth/${provider}`
}

// Alias for Google OAuth
export const googleAuthApi = () => oauthLoginApi("google")

// ============================================================================
// AUTH APIs - Protected (requires authentication)
// ============================================================================

/**
 * 9. Logout current session
 * POST /auths/logout
 */
export const logoutApi = async () => {
    const res = await CallApiWithAuth.post("/auths/logout", {}, {
        withCredentials: true
    })
    return res.data
}

/**
 * 10. Logout all sessions
 * POST /auths/logout-all
 */
export const logoutAllApi = async () => {
    const res = await CallApiWithAuth.post("/auths/logout-all")
    return res.data
}

/**
 * 14. Change password (when logged in)
 * POST /auths/change-password
 */
export const changePasswordApi = async ({ current_password, new_password }) => {
    const res = await CallApiWithAuth.post("/auths/change-password", {
        current_password,
        new_password
    })
    return res.data
}

/**
 * 15. Enable 2FA
 * POST /auths/2fa/enable
 */
export const enable2faApi = async (password) => {
    const res = await CallApiWithAuth.post("/auths/2fa/enable", { password })
    return res.data
}

/**
 * 16. Disable 2FA
 * POST /auths/2fa/disable
 */
export const disable2faApi = async (password) => {
    const res = await CallApiWithAuth.post("/auths/2fa/disable", { password })
    return res.data
}

/**
 * 17. Get active sessions
 * GET /auths/sessions
 */
export const getSessionsApi = async () => {
    const res = await CallApiWithAuth.get("/auths/sessions")
    return res.data
}

/**
 * 18. Revoke a specific session
 * DELETE /auths/sessions
 */
export const revokeSessionApi = async (session_id) => {
    const res = await CallApiWithAuth.delete("/auths/sessions", {
        data: { session_id }
    })
    return res.data
}

/**
 * 19. Send phone verification OTP
 * POST /auths/phone/send-otp
 */
export const sendPhoneOtpApi = async (phone) => {
    const res = await CallApiWithAuth.post("/auths/phone/send-otp", { phone })
    return res.data
}

/**
 * 20. Verify phone OTP
 * POST /auths/phone/verify-otp
 */
export const verifyPhoneOtpApi = async ({ temp_token, otp }) => {
    const res = await CallApiWithAuth.post("/auths/phone/verify-otp", {
        temp_token,
        otp
    })
    return res.data
}

// ============================================================================
// USER APIs - Protected
// ============================================================================

/**
 * 23. Get current user profile
 * GET /users/me
 */
export const getMeApi = async () => {
    const res = await CallApiWithAuth.get("/users/me")
    return res.data
}

/**
 * 24. Update user profile
 * PATCH /users/me
 */
export const updateProfileApi = async (data) => {
    const res = await CallApiWithAuth.patch("/users/me", data)
    return res.data
}

/**
 * 25. Update user preferences
 * PATCH /users/me/preferences
 */
export const updatePreferencesApi = async (preferences) => {
    const res = await CallApiWithAuth.patch("/users/me/preferences", preferences)
    return res.data
}
