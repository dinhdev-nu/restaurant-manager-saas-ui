import { useEffect, useState } from "react"
import { registerApi, sendOtpApi, signup, verifyOtpApi } from "../../../api/auth"
import { useToast } from "hooks/use-toast"
import { isPhoneNumber, validateEmailOrPhone } from "../../../utils/validators"

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

    // ── Step 1 → Step 2 ─────────────────────────────────────────────
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

        setIsLoading(true)
        try {
            const identifierType = email ? "email" : "phoneNumber"
            await registerApi({ [identifierType]: identifier }) // check not already registered

            if (email) {
                // Auto-send OTP for email
                await sendOtpApi({ email })
                setOtpCountdown(60)
                toast({ title: "Code sent", description: `A 6-digit code was sent to ${email}.`, duration: 3000 })
                setStep("otp")
            } else {
                // Show method picker for phone
                setShowMethodModal(true)
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || error.message || "Please try again.", duration: 4000 })
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
                // TODO: implement SMS / Telegram OTP
                toast({ title: "Coming soon", description: `${method === "sms" ? "SMS" : "Telegram"} OTP is coming soon.`, duration: 3000 })
            }
        } finally {
            setIsSendingOtp(false)
            setShowMethodModal(false)
            setStep("otp")
        }
    }

    const handleResendOtp = async () => {
        if (otpCountdown > 0 || isSendingOtp) return
        const { email, phoneNumber } = form
        if (!email && !phoneNumber) return

        setIsSendingOtp(true)
        try {
            if (email) {
                await sendOtpApi({ email })
                setOtpCountdown(60)
                toast({ title: "Code resent", description: `A new code was sent to ${email}.`, duration: 3000 })
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Failed to resend", description: error.response?.data?.message || error.message || "Please try again.", duration: 4000 })
        } finally {
            setIsSendingOtp(false)
        }
    }

    // ── Step 2 → Step 3 ─────────────────────────────────────────────
    const handleVerifyOtp = async () => {
        if (form.otp.length !== 6) {
            return toast({ variant: "destructive", title: "Invalid OTP", description: "Please enter the 6-digit code.", duration: 3000 })
        }
        const identifier = form.email || form.phoneNumber
        const identifierType = form.email ? "email" : "phoneNumber"

        setIsLoading(true)
        try {
            await verifyOtpApi({ [identifierType]: identifier, otp: form.otp })
            setStep("password")
        } catch (error) {
            toast({ variant: "destructive", title: "Invalid code", description: error.response?.data?.message || error.message || "Please try again.", duration: 4000 })
        } finally {
            setIsLoading(false)
        }
    }

    // ── Step 3 → Done ────────────────────────────────────────────────
    const handleCreateAccount = async () => {
        const { password, confirmPassword, email, phoneNumber } = form
        if (!password) return toast({ variant: "destructive", title: "Missing password", description: "Please enter a password.", duration: 3000 })
        if (password !== confirmPassword) return toast({ variant: "destructive", title: "Passwords don't match", description: "Please confirm your password.", duration: 3000 })

        const identifier = email || phoneNumber
        const identifierType = email ? "email" : "phoneNumber"

        setIsLoading(true)
        try {
            await signup({ [identifierType]: identifier, password, firstName: form.firstName, lastName: form.lastName })
            toast({ title: "Account created 🎉", description: "You can now sign in with your credentials.", duration: 3000 })
            reset()
            onSuccess?.()
        } catch (error) {
            toast({ variant: "destructive", title: "Sign up failed", description: error.response?.data?.message || error.message || "Please try again.", duration: 4000 })
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
