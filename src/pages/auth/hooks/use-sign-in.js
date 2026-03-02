import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { signin } from "../../../api/auth"
import { useToast } from "hooks/use-toast"
import { isPhoneNumber, validateEmailOrPhone } from "../../../utils/validators"
import { useAuthStore } from "../../../stores"

export function useSignIn() {
    const { toast } = useToast()
    const navigate = useNavigate()
    const { login: loginStore } = useAuthStore()

    const [isLoading, setIsLoading] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)
    const [form, setForm] = useState({ email: "", phoneNumber: "", password: "" })

    const handleIdentifierChange = (value) => {
        if (isPhoneNumber(value)) {
            setForm((prev) => ({ ...prev, phoneNumber: value, email: "" }))
        } else {
            setForm((prev) => ({ ...prev, email: value, phoneNumber: "" }))
        }
    }

    const handlePasswordChange = (value) => setForm((prev) => ({ ...prev, password: value }))

    const handleForgotPassword = () => {
        toast({
            title: "Forgot password",
            description: "Please contact support or use the password reset link sent to your email.",
            duration: 4000,
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const { email, phoneNumber, password } = form
        const identifier = email || phoneNumber

        const identifierError = validateEmailOrPhone(identifier)
        if (identifierError) return toast({ variant: "destructive", title: "Invalid input", description: identifierError, duration: 3000 })
        if (!password) return toast({ variant: "destructive", title: "Missing password", description: "Please enter your password.", duration: 3000 })

        setIsLoading(true)
        try {
            const identifierType = email ? "email" : "phoneNumber"
            const res = await signin({ [identifierType]: identifier, password })
            const { user, accessToken } = res.metadata

            loginStore(user, accessToken)

            toast({ title: "Signed in 🎉", description: `Welcome back, ${user.email || user.phoneNumber}!`, duration: 3000 })

            if (user.roles?.includes("admin")) navigate("/admin")
            else navigate("/restaurant-selector")
        } catch (error) {
            toast({ variant: "destructive", title: "Sign in failed", description: error.response?.data?.message || error.message || "Please try again.", duration: 4000 })
        } finally {
            setIsLoading(false)
        }
    }

    return {
        form,
        isLoading,
        rememberMe, setRememberMe,
        handleIdentifierChange,
        handlePasswordChange,
        handleForgotPassword,
        handleSubmit,
    }
}
