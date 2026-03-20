import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { loginApi, send2faOtpApi, verify2faOtpApi, forgotPasswordApi, verifyResetPasswordOtpApi, resetPasswordApi, getMeApi } from "../../../api/auth"
import { useToast } from "hooks/use-toast"
import { isPhoneNumber, validateEmailOrPhone, validatePassword } from "../../../utils/validators"
import { useAuthStore } from "../../../stores"

// View states: "login" | "2fa" | "forgot-password" | "forgot-otp" | "reset-password"
export function useSignIn() {
    const { toast } = useToast()
    const navigate = useNavigate()
    const { login: loginStore } = useAuthStore()

    const [view, setView] = useState("login")
    const [isLoading, setIsLoading] = useState(false)
    const [isSendingOtp, setIsSendingOtp] = useState(false)
    const [otpCountdown, setOtpCountdown] = useState(0)
    const [rememberMe, setRememberMe] = useState(false)

    const [form, setForm] = useState({
        email: "",
        phoneNumber: "",
        password: "",
        otp: "",
        newPassword: "",
        confirmNewPassword: "",
    })

    // Tokens for 2FA and reset password flows
    const [tempToken, setTempToken] = useState(null)
    const [sessionToken, setSessionToken] = useState(null)
    const [grantToken, setGrantToken] = useState(null)
    const [twoFaMethod, setTwoFaMethod] = useState(null)
    const otpIntervalRef = useRef(null)

    const handleIdentifierChange = (value) => {
        if (isPhoneNumber(value)) {
            setForm((prev) => ({ ...prev, phoneNumber: value, email: "" }))
        } else {
            setForm((prev) => ({ ...prev, email: value, phoneNumber: "" }))
        }
    }

    const handlePasswordChange = (value) => setForm((prev) => ({ ...prev, password: value }))
    const handleOtpChange = (value) => setForm((prev) => ({ ...prev, otp: value }))
    const handleNewPasswordChange = (value) => setForm((prev) => ({ ...prev, newPassword: value }))
    const handleConfirmNewPasswordChange = (value) => setForm((prev) => ({ ...prev, confirmNewPassword: value }))

    const hydrateUserAfterSignIn = async (accessToken) => {
        loginStore(null, accessToken)

        try {
            const meRes = await getMeApi()
            const user = meRes?.data ?? meRes
            if (user) {
                loginStore(user, accessToken)
            }
        } catch (error) {
            // Keep token to avoid blocking sign-in when /me temporarily fails.
            console.warn("[Auth] Could not fetch user profile after sign-in", error)
        }
    }

    const resetForm = () => {
        if (otpIntervalRef.current) {
            clearInterval(otpIntervalRef.current)
            otpIntervalRef.current = null
        }

        setForm({
            email: "",
            phoneNumber: "",
            password: "",
            otp: "",
            newPassword: "",
            confirmNewPassword: "",
        })
        setTempToken(null)
        setSessionToken(null)
        setGrantToken(null)
        setTwoFaMethod(null)
        setOtpCountdown(0)
        setView("login")
    }

    // ══════════════════════════════════════════════════════════════════════
    // LOGIN FLOW
    // ══════════════════════════════════════════════════════════════════════

    const handleSubmit = async (e) => {
        e.preventDefault()
        const { email, phoneNumber, password } = form
        const identifier = email || phoneNumber

        const identifierError = validateEmailOrPhone(identifier)
        if (identifierError) {
            return toast({ variant: "destructive", title: "Invalid input", description: identifierError, duration: 3000 })
        }
        if (!password) {
            return toast({ variant: "destructive", title: "Missing password", description: "Please enter your password.", duration: 3000 })
        }

        setIsLoading(true)
        try {
            const res = await loginApi({
                identifier,
                password,
                remember_me: rememberMe
            })
            const payload = res?.data ?? res

            // Check if 2FA is required
            if (payload?.state === "2fa_required") {
                setTempToken(payload.temp_token)
                setTwoFaMethod(payload.method)

                // Auto-send 2FA OTP
                try {
                    await send2faOtpApi(payload.temp_token)
                    startOtpCountdown()
                    toast({
                        title: "2FA Required",
                        description: `A verification code has been sent to your ${payload.method}.`,
                        duration: 4000
                    })
                } catch (sendError) {
                    toast({
                        variant: "destructive",
                        title: "Failed to send code",
                        description: sendError.response?.data?.message || "Please try again.",
                        duration: 4000
                    })
                }

                setView("2fa")
                return
            }

            // Normal login success (no 2FA)
            const accessToken = payload?.access_token
            if (accessToken) {
                await hydrateUserAfterSignIn(accessToken)

                toast({
                    title: "Signed in 🎉",
                    description: "Welcome back!",
                    duration: 3000
                })

                navigate("/profile")
            }
        } catch (error) {
            const message = error.response?.data?.message || error.message || "Please try again."
            toast({ variant: "destructive", title: "Sign in failed", description: message, duration: 4000 })
        } finally {
            setIsLoading(false)
        }
    }

    // ══════════════════════════════════════════════════════════════════════
    // 2FA FLOW
    // ══════════════════════════════════════════════════════════════════════

    const startOtpCountdown = () => {
        if (otpIntervalRef.current) {
            clearInterval(otpIntervalRef.current)
        }

        setOtpCountdown(60)
        otpIntervalRef.current = setInterval(() => {
            setOtpCountdown((prev) => {
                if (prev <= 1) {
                    if (otpIntervalRef.current) {
                        clearInterval(otpIntervalRef.current)
                        otpIntervalRef.current = null
                    }
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }

    const handleResend2faOtp = async () => {
        if (otpCountdown > 0 || isSendingOtp || !tempToken) return

        setIsSendingOtp(true)
        try {
            await send2faOtpApi(tempToken)
            startOtpCountdown()
            toast({
                title: "Code resent",
                description: "A new verification code has been sent.",
                duration: 3000
            })
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Failed to resend",
                description: error.response?.data?.message || "Please try again.",
                duration: 4000
            })
        } finally {
            setIsSendingOtp(false)
        }
    }

    const handleVerify2fa = async () => {
        const { otp } = form
        if (!otp || otp.length !== 6) {
            return toast({ variant: "destructive", title: "Invalid OTP", description: "Please enter the 6-digit code.", duration: 3000 })
        }

        setIsLoading(true)
        try {
            const res = await verify2faOtpApi({ temp_token: tempToken, otp })
            const payload = res?.data ?? res

            const accessToken = payload?.access_token
            if (accessToken) {
                await hydrateUserAfterSignIn(accessToken)

                toast({
                    title: "Signed in 🎉",
                    description: "2FA verification successful!",
                    duration: 3000
                })

                resetForm()
                navigate("/profile")
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Verification failed",
                description: error.response?.data?.message || "Invalid code. Please try again.",
                duration: 4000
            })
        } finally {
            setIsLoading(false)
        }
    }

    // ══════════════════════════════════════════════════════════════════════
    // FORGOT PASSWORD FLOW
    // ══════════════════════════════════════════════════════════════════════

    const handleForgotPassword = () => {
        setView("forgot-password")
        setForm((prev) => ({ ...prev, otp: "", newPassword: "", confirmNewPassword: "" }))
    }

    const handleSendResetOtp = async (email) => {
        const emailToUse = email || form.email
        if (!emailToUse) {
            return toast({ variant: "destructive", title: "Email required", description: "Please enter your email address.", duration: 3000 })
        }

        // Store email in form for later use
        setForm((prev) => ({ ...prev, email: emailToUse }))

        setIsLoading(true)
        try {
            const res = await forgotPasswordApi(emailToUse)
            const payload = res?.data ?? res
            setSessionToken(payload?.session_token)
            startOtpCountdown()

            toast({
                title: "Code sent",
                description: `A verification code has been sent to ${emailToUse}.`,
                duration: 4000
            })

            setView("forgot-otp")
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Failed to send code",
                description: error.response?.data?.message || "Please try again.",
                duration: 4000
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleResendResetOtp = async () => {
        if (otpCountdown > 0 || isSendingOtp) return
        const { email } = form
        if (!email) return

        setIsSendingOtp(true)
        try {
            const res = await forgotPasswordApi(email)
            const payload = res?.data ?? res
            setSessionToken(payload?.session_token)
            startOtpCountdown()

            toast({
                title: "Code resent",
                description: "A new verification code has been sent.",
                duration: 3000
            })
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Failed to resend",
                description: error.response?.data?.message || "Please try again.",
                duration: 4000
            })
        } finally {
            setIsSendingOtp(false)
        }
    }

    const handleVerifyResetOtp = async () => {
        const { otp } = form
        if (!otp || otp.length !== 6) {
            return toast({ variant: "destructive", title: "Invalid OTP", description: "Please enter the 6-digit code.", duration: 3000 })
        }

        setIsLoading(true)
        try {
            const res = await verifyResetPasswordOtpApi({ session_token: sessionToken, otp })
            const payload = res?.data ?? res
            setGrantToken(payload?.reset_grant_token || payload?.grant_token)
            setView("reset-password")
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Verification failed",
                description: error.response?.data?.message || "Invalid code. Please try again.",
                duration: 4000
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleResetPassword = async () => {
        const { newPassword, confirmNewPassword } = form

        const passwordError = validatePassword(newPassword)
        if (passwordError) {
            return toast({ variant: "destructive", title: "Invalid password", description: passwordError, duration: 3000 })
        }

        if (newPassword !== confirmNewPassword) {
            return toast({ variant: "destructive", title: "Passwords don't match", description: "Please confirm your new password.", duration: 3000 })
        }

        setIsLoading(true)
        try {
            await resetPasswordApi({ grant_token: grantToken, new_password: newPassword })

            toast({
                title: "Password reset 🎉",
                description: "Your password has been updated. Please sign in.",
                duration: 4000
            })

            resetForm()
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Reset failed",
                description: error.response?.data?.message || "Please try again.",
                duration: 4000
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleBackToLogin = () => {
        resetForm()
    }

    useEffect(() => {
        return () => {
            if (otpIntervalRef.current) {
                clearInterval(otpIntervalRef.current)
                otpIntervalRef.current = null
            }
        }
    }, [])

    return {
        // State
        view,
        form,
        isLoading,
        isSendingOtp,
        otpCountdown,
        rememberMe,
        setRememberMe,
        twoFaMethod,

        // Handlers - Login
        handleIdentifierChange,
        handlePasswordChange,
        handleSubmit,

        // Handlers - 2FA
        handleOtpChange,
        handleVerify2fa,
        handleResend2faOtp,

        // Handlers - Forgot Password
        handleForgotPassword,
        handleSendResetOtp,
        handleResendResetOtp,
        handleVerifyResetOtp,

        // Handlers - Reset Password
        handleNewPasswordChange,
        handleConfirmNewPasswordChange,
        handleResetPassword,

        // Navigation
        handleBackToLogin,
        resetForm,
    }
}
