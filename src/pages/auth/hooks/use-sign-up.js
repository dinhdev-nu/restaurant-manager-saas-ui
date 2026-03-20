import { useEffect, useState } from "react"
import { checkEmailApi, registerApi, verifyOtpApi, resendOtpApi } from "../../../api/auth"
import { useToast } from "hooks/use-toast"
import { isPhoneNumber, validateEmailOrPhone, validatePassword } from "../../../utils/validators"

// Steps: "info" -> "otp" -> "password"
export function useSignUp({ onSuccess }) {
    const { toast } = useToast()

    const [step, setStep] = useState("info")
    const [isLoading, setIsLoading] = useState(false)
    const [isSendingOtp, setIsSendingOtp] = useState(false)
    const [otpCountdown, setOtpCountdown] = useState(0)
    const [showMethodModal, setShowMethodModal] = useState(false)

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        otp: "",
        password: "",
        confirmPassword: "",
    })

    const reset = () => {
        setForm({ firstName: "", lastName: "", email: "", phoneNumber: "", otp: "", password: "", confirmPassword: "" })
        setStep("info")
        setOtpCountdown(0)
        setIsSendingOtp(false)
        setShowMethodModal(false)
    }

    const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

    const handleIdentifierChange = (value) => {
        if (isPhoneNumber(value)) {
            setForm((prev) => ({ ...prev, phoneNumber: value, email: "" }))
        } else {
            setForm((prev) => ({ ...prev, email: value, phoneNumber: "" }))
        }
    }

    // Reset OTP when identifier changes
    useEffect(() => {
        setForm((prev) => ({ ...prev, otp: "" }))
        setOtpCountdown(0)
    }, [form.email, form.phoneNumber])

    // Countdown timer
    useEffect(() => {
        if (otpCountdown <= 0) return
        const timer = setTimeout(() => setOtpCountdown((c) => c - 1), 1000)
        return () => clearTimeout(timer)
    }, [otpCountdown])

    // ── Step 1 → Password Step (check email first) ───────────────────
    const handleContinue = async () => {
        const { firstName, lastName, email, phoneNumber } = form
        const identifier = email || phoneNumber

        if (!firstName.trim() || !lastName.trim()) {
            return toast({ variant: "destructive", title: "Missing fields", description: "Please enter your first and last name.", duration: 3000 })
        }
        if (!identifier) {
            return toast({ variant: "destructive", title: "Missing fields", description: "Please enter your email or phone number.", duration: 3000 })
        }
        const identifierError = validateEmailOrPhone(identifier)
        if (identifierError) {
            return toast({ variant: "destructive", title: "Invalid input", description: identifierError, duration: 3000 })
        }

        // Currently only support email registration
        if (!email) {
            return toast({ variant: "destructive", title: "Email required", description: "Phone registration is coming soon. Please use email.", duration: 3000 })
        }

        setIsLoading(true)
        try {
            // Check if email is available
            const checkResult = await checkEmailApi(email)
            const payload = checkResult?.data ?? checkResult

            if (!payload?.available) {
                if (payload?.acction === "resend_otp") {
                    const targetEmail = payload?.hint || email
                    await resendOtpApi(targetEmail)
                    setForm((prev) => ({ ...prev, email: targetEmail, otp: "" }))
                    setOtpCountdown(60)
                    setStep("otp")

                    return toast({
                        title: "Pending account detected",
                        description: `We resent a verification code to ${targetEmail}. Please verify your account.`,
                        duration: 4000
                    })
                }

                return toast({
                    variant: "destructive",
                    title: "Email already registered",
                    description: "This email is already in use. Please sign in instead.",
                    duration: 4000
                })
            }

            // Email is available, go to password step
            setStep("password")
        } catch (error) {
            const message = error.response?.data?.message || error.message || "Please try again."
            toast({ variant: "destructive", title: "Error", description: message, duration: 4000 })
        } finally {
            setIsLoading(false)
        }
    }

    const getAvailableMethods = () => {
        if (form.phoneNumber) return [
            { id: "sms", label: "SMS", icon: "💬" },
            { id: "telegram", label: "Telegram", icon: "✈️" },
        ]
        return []
    }

    const handleMethodSelect = async (method) => {
        if (isSendingOtp) return
        setIsSendingOtp(true)
        try {
            if (method === "sms" || method === "telegram") {
                toast({ title: "Coming soon", description: `${method === "sms" ? "SMS" : "Telegram"} OTP is coming soon.`, duration: 3000 })
            }
        } finally {
            setIsSendingOtp(false)
            setShowMethodModal(false)
        }
    }

    const handleResendOtp = async () => {
        if (otpCountdown > 0 || isSendingOtp) return
        const { email } = form
        if (!email) return

        setIsSendingOtp(true)
        try {
            await resendOtpApi(email)
            setOtpCountdown(60)
            toast({ title: "Code resent", description: `A new code was sent to ${email}.`, duration: 3000 })
        } catch (error) {
            toast({ variant: "destructive", title: "Failed to resend", description: error.response?.data?.message || error.message || "Please try again.", duration: 4000 })
        } finally {
            setIsSendingOtp(false)
        }
    }

    // ── Verify OTP → Done ─────────────────────────────────────────────
    const handleVerifyOtp = async () => {
        if (form.otp.length !== 6) {
            return toast({ variant: "destructive", title: "Invalid OTP", description: "Please enter the 6-digit code.", duration: 3000 })
        }

        setIsLoading(true)
        try {
            await verifyOtpApi({ email: form.email, otp: form.otp })
            toast({
                title: "Email verified 🎉",
                description: "Your account is now active. You can sign in.",
                duration: 3000
            })
            reset()
            onSuccess?.()
        } catch (error) {
            toast({ variant: "destructive", title: "Invalid code", description: error.response?.data?.message || error.message || "Please try again.", duration: 4000 })
        } finally {
            setIsLoading(false)
        }
    }

    // ── Password Step → Register & go to OTP ─────────────────────────
    const handleCreateAccount = async () => {
        const { password, confirmPassword, email, firstName, lastName, phoneNumber } = form

        if (!password) {
            return toast({ variant: "destructive", title: "Missing password", description: "Please enter a password.", duration: 3000 })
        }

        const passwordError = validatePassword(password)
        if (passwordError) {
            return toast({ variant: "destructive", title: "Weak password", description: passwordError, duration: 3000 })
        }

        if (password !== confirmPassword) {
            return toast({ variant: "destructive", title: "Passwords don't match", description: "Please confirm your password.", duration: 3000 })
        }

        const full_name = `${firstName.trim()} ${lastName.trim()}`

        setIsLoading(true)
        try {
            await registerApi({
                email,
                password,
                full_name,
                phone: phoneNumber || undefined
            })

            // Registration successful - OTP was sent to email
            toast({
                title: "Account created!",
                description: "Please check your email for the verification code.",
                duration: 4000
            })

            setOtpCountdown(60)
            setStep("otp")
        } catch (error) {
            const message = error.response?.data?.message || error.message || "Please try again."
            toast({ variant: "destructive", title: "Registration failed", description: message, duration: 4000 })
        } finally {
            setIsLoading(false)
        }
    }

    return {
        step, setStep,
        form, handleChange, handleIdentifierChange,
        isLoading, isSendingOtp,
        otpCountdown,
        showMethodModal, setShowMethodModal,
        getAvailableMethods,
        handleContinue,
        handleMethodSelect,
        handleResendOtp,
        handleVerifyOtp,
        handleCreateAccount,
        reset,
    }
}
