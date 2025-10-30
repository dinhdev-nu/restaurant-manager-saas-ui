import { useEffect, useState } from "react"
import Input from "../../../components/ui/Input"
import { X, Mail, Eye, EyeOff } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { googleAuthApi, registerApi, sendOtpApi, signin, signup, verifyOtpApi } from "api/auth"
import { useToast } from "hooks/use-toast"
import { isPhoneNumber, validateEmailOrPhone } from "../../../utils/validators"

export function AuthCard({
    rememberMe,
    setRememberMe,
    onForgotPassword,
}) {
    const [isLoading, setIsLoading] = useState(false)
    const [activeTab, setActiveTab] = useState("signup")

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        password: "",
        confirmPassword: "",
        otp: "",
    })


    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const [otpSent, setOtpSent] = useState(false)
    const [otpCountdown, setOtpCountdown] = useState(0) // Đếm ngược OTP
    const [isSendingOtp, setIsSendingOtp] = useState(false) // Loading state cho gửi OTP

    const [showMethodModal, setShowMethodModal] = useState(false)

    const { toast } = useToast()

    const navigate = useNavigate()

    // Reset form khi chuyển tab
    useEffect(() => {
        resetForm()
    }, [activeTab])

    // Hàm xử lý thay đổi cho trường email/phone
    const handleEmailOrPhoneChange = (value) => {
        if (isPhoneNumber(value)) {
            // Nếu là số điện thoại, lưu vào phoneNumber và xóa email
            setForm((prev) => ({ ...prev, phoneNumber: value, email: "" }))
        } else {
            // Nếu không phải số điện thoại, lưu vào email và xóa phoneNumber
            setForm((prev) => ({ ...prev, email: value, phoneNumber: "" }))
        }
    }

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }))
    }

    const resetForm = () => {
        setForm({
            firstName: "",
            lastName: "",
            email: "",
            phoneNumber: "",
            password: "",
            confirmPassword: "",
            otp: "",
        })
        setOtpCountdown(0) // Reset countdown
        setOtpSent(false)
    }

    const validateSignUp = () => {
        const { firstName, lastName, email, phoneNumber, password, confirmPassword, otp } = form
        const identifier = email || phoneNumber

        if (!firstName || !lastName || !identifier || !password || !confirmPassword || !otp) {
            const msg = "Please fill in " + (!firstName ? "first name, " : "")
                + (!lastName ? "last name, " : "")
                + (!identifier ? "email or phone number, " : "")
                + (!password ? "password, " : "")
                + (!confirmPassword ? "confirm password, " : "")
                + (!otp ? "OTP" : "")
            return msg.replace(/, $/, "")
        }
        if (otp.length !== 6) return "Please enter a valid 6-digit OTP"
        if (password !== confirmPassword) return "Passwords do not match"
        return null
    }
    const validateSignIn = () => {
        const { email, phoneNumber, password } = form
        const identifier = email || phoneNumber

        if (!identifier || !password)
            return ("Please fill in " + (!identifier ? "email or phone number, " : "") + (!password ? "password" : "")).replace(/, $/, "")
        return null
    }
    const validateEmail = (emailOrPhone) => {
        return validateEmailOrPhone(emailOrPhone)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            if (activeTab === "signup") {
                const error = validateSignUp()

                if (error) throw new Error(error)
                if (!otpSent) throw new Error("Please request and enter the OTP sent to your email or phone.")

                // Sử dụng email hoặc phoneNumber tùy theo input
                const identifier = form.email || form.phoneNumber
                const identifierType = form.email ? 'email' : 'phoneNumber'

                console.log("Identifier:", identifier, "Type:", identifierType, form)
                // api 
                await registerApi({ [identifierType]: identifier }) // check not registered
                await verifyOtpApi({ [identifierType]: identifier, otp: form.otp }) // verify otp
                await signup({ [identifierType]: identifier, password: form.password })

                toast({
                    title: "Account created successfully 🎉!",
                    description: "You can now sign in with your credentials.",
                    duration: 5000,
                })
                setActiveTab("signin")
                resetForm()

            } else {
                const error = validateSignIn()
                if (error) throw new Error(error)

                const identifier = form.email || form.phoneNumber
                const identifierType = form.email ? 'email' : 'phoneNumber'

                const res = await signin({ [identifierType]: identifier, password: form.password })
                // set data to local storage
                localStorage.setItem("token", res.metadata.token)
                localStorage.setItem("user", JSON.stringify(res.metadata.user))

                toast({
                    title: "Signed in successfully 🎉!",
                    description: `Welcome back, ${res.metadata.user.email || res.metadata.user.phoneNumber}!`,
                    duration: 5000,
                })

                // redirect to home page
                navigate("/")
            }


        } catch (error) {
            console.error("Auth error:", error)
            toast({
                title: "Something went wrong.",
                description: error.message || "Please try again.",
                variant: "destructive",
                duration: 4000,
            })

        } finally {
            setIsLoading(false)
        }

    }

    const handleClose = () => {
        navigate("/")
    }

    const getAvailableMethods = () => {
        const methods = []
        const identifier = form.email || form.phoneNumber
        const error = validateEmail(identifier)

        if (error === null) {
            if (form.email) {
                methods.push({ id: "email", label: "Gmail", icon: "📧" })
            }
            if (form.phoneNumber) {
                methods.push(
                    { id: "sms", label: "SMS", icon: "💬" },
                    { id: "telegram", label: "Telegram", icon: "✈️" }
                )
            }
        }
        return methods
    }

    const handleSendOtp = (e) => {
        const identifier = form.email || form.phoneNumber

        // check email or phone valid
        const error = validateEmail(identifier)
        if (error) {
            toast({
                title: "Invalid input",
                description: error,
                variant: "info",
                duration: 4000,
            })
            return
        }

        setShowMethodModal(true)
    }

    useEffect(() => {
        handleChange("otp", "")
        setOtpSent(false)
        setOtpCountdown(0) // Reset countdown khi thay đổi email/phone
    }, [form.email, form.phoneNumber])

    // Effect để đếm ngược OTP
    useEffect(() => {
        if (otpCountdown > 0) {
            const timer = setTimeout(() => {
                setOtpCountdown(otpCountdown - 1)
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [otpCountdown])

    const handleMethodSelect = async (method) => {
        // Prevent double submission
        if (isSendingOtp) {
            return
        }

        const identifier = form.email || form.phoneNumber

        setIsSendingOtp(true) // Bắt đầu loading

        if (method === "email") {
            try {
                await registerApi({ email: form.email }) // api check email not registered
                await sendOtpApi({ email: form.email })
                setOtpSent(true)
                setOtpCountdown(60) // Bắt đầu đếm ngược 60 giây
                toast({
                    title: "OTP Sent",
                    description: `An OTP has been sent to ${form.email}. Please check your inbox.`,
                    duration: 5000
                })
            } catch (error) {
                console.error("Send OTP error:", error)
                toast({
                    title: "Failed to send OTP",
                    description: error.message || "Please try again.",
                    variant: "destructive",
                    duration: 4000,
                })
            } finally {
                setIsSendingOtp(false) // Kết thúc loading
            }
        } else if (method === "sms" || method === "telegram") {
            // TODO: Implement SMS/Telegram OTP sending
            setIsSendingOtp(false) // Reset loading
            toast({
                title: "Coming Soon",
                description: `${method === "sms" ? "SMS" : "Telegram"} OTP will be available soon.`,
                variant: "info",
                duration: 4000,
            })
        } else {
            setIsSendingOtp(false) // Reset loading
            toast({
                title: "Method not supported",
                description: "Please select a valid method.",
                variant: "info",
                duration: 4000,
            })
        }
        setShowMethodModal(false)
    }


    const loginWithGoogle = async () => {
        try {
            window.location.href = import.meta.env.VITE_SERVER_BASE_URL + '/auths/google'
            // Handle successful login
        } catch (error) {
            console.error("Google Auth error:", error);
            toast({
                title: "Something went wrong.",
                description: error.message || "Please try again.",
                variant: "destructive",
                duration: 4000,
            });
        }
    }

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg transition-all duration-300">
                {/* Header with tabs and close button */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex bg-gray-100 rounded-lg p-1 min-w-0 flex-1 mr-3">
                        <button
                            onClick={() => setActiveTab("signup")}
                            className={`flex-1 min-w-0 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "signup"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-600 hover:text-gray-900"
                                }`}
                        >
                            <span className="truncate">Sign up</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("signin")}
                            className={`flex-1 min-w-0 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "signin"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-600 hover:text-gray-900"
                                }`}
                        >
                            <span className="truncate">Sign in</span>
                        </button>
                    </div>
                    <button
                        className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                        onClick={handleClose}
                        aria-label="Close"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <h1 className="text-2xl font-semibold text-gray-900 mb-6">
                    {activeTab === "signup" ? "Create an account" : "Welcome back"}
                </h1>

                <div className="relative overflow-hidden">
                    <div
                        className={`transition-all m-1  duration-500 ease-in-out transform ${activeTab === "signup" ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 absolute inset-0"
                            }`}
                    >
                        {/* Sign Up Form */}
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-4"
                            autoComplete="off"
                        >
                            {/* Name fields */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="relative">
                                    <Input
                                        type="text"
                                        value={form.firstName}
                                        onChange={(e) => handleChange("firstName", e.target.value)}
                                        className="bg-white border border-gray-300 rounded-lg h-11 text-sm text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-black/5 transition-all"
                                        placeholder="First name"
                                        autoComplete="off"
                                    />
                                </div>
                                <div className="relative">
                                    <Input
                                        type="text"
                                        value={form.lastName}
                                        onChange={(e) => handleChange("lastName", e.target.value)}
                                        className="bg-white border border-gray-300 rounded-lg h-11 text-sm text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-black/5 transition-all"
                                        placeholder="Last name"
                                        autoComplete="off"
                                    />
                                </div>
                            </div>

                            {/* Email or Phone field */}
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    type="text"
                                    value={form.email || form.phoneNumber}
                                    onChange={(e) => handleEmailOrPhoneChange(e.target.value)}
                                    className="bg-white border border-gray-300 rounded-lg h-11 text-sm text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-black/5 pl-10 pr-16 transition-all"
                                    placeholder="Email or phone number"
                                    autoComplete="off"
                                />
                                {form.email && (
                                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Email</span>
                                )}
                                {form.phoneNumber && (
                                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Phone</span>
                                )}
                            </div>

                            <div className="relative">
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <Input
                                            type="text"
                                            value={form.otp}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, "").slice(0, 6)
                                                handleChange("otp", value)
                                                if (value.length === 0 || value.length < 6) setOtpSent(false)
                                            }}
                                            className="bg-white border border-gray-300 rounded-lg h-11 text-sm text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-black/5 text-center tracking-widest transition-all"
                                            placeholder="OTP code"
                                            maxLength={6}
                                            autoComplete="off"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleSendOtp}
                                        disabled={otpCountdown > 0 || isSendingOtp}
                                        className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all whitespace-nowrap ${otpCountdown > 0 || isSendingOtp
                                            ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                                            : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                                            }`}
                                    >
                                        {otpCountdown > 0 ? `${otpCountdown}s` : isSendingOtp ? 'Sending...' : 'Send OTP'}
                                    </button>
                                </div>
                            </div>


                            {/* Password field */}
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={form.password}
                                    onChange={(e) => handleChange("password", e.target.value)}
                                    className="bg-white border border-gray-300 rounded-lg h-11 text-sm text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-black/5 pr-10 transition-all"
                                    placeholder="Password"
                                    autoComplete="off"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>

                            <div className="relative">
                                <Input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={form.confirmPassword}
                                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                                    className="bg-white border border-gray-300 rounded-lg h-11 text-sm text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-black/5 pr-10 transition-all"
                                    placeholder="Confirm password"
                                    autoComplete="off"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showConfirmPassword ? (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-11 mt-6 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800 active:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Creating account..." : "Create account"}
                            </button>
                        </form>
                    </div>

                    <div
                        className={`transition-all m-1 duration-500 ease-in-out transform ${activeTab === "signin" ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 absolute inset-0"
                            }`}
                    >
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-4"
                            autoComplete="off"
                        >
                            {/* Email or Phone field */}
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    type="text"
                                    value={form.email || form.phoneNumber}
                                    onChange={(e) => handleEmailOrPhoneChange(e.target.value)}
                                    className="bg-white border border-gray-300 rounded-lg h-11 text-sm text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-black/5 pl-10 pr-16 transition-all"
                                    placeholder="Email or phone number"
                                    autoComplete="off"
                                />
                                {form.email && (
                                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Email</span>
                                )}
                                {form.phoneNumber && (
                                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Phone</span>
                                )}
                            </div>

                            {/* Password field */}
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={form.password}
                                    onChange={(e) => handleChange("password", e.target.value)}
                                    className="bg-white border border-gray-300 rounded-lg h-11 text-sm text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-black/5 pr-10 transition-all"
                                    placeholder="Password"
                                    autoComplete="off"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            {/* Remember me and forgot password */}
                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black focus:ring-offset-0"
                                    />
                                    <span className="text-gray-600">Remember me</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={onForgotPassword}
                                    className="text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    Forgot password?
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-11 mt-6 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800 active:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Signing in..." : "Sign in"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Divider */}
                <div className="flex items-center my-6">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span className="px-3 text-gray-500 text-xs font-medium">
                        {activeTab === "signup" ? "OR CONTINUE WITH" : "OR"}
                    </span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => loginWithGoogle()}
                        className="border border-gray-300 rounded-lg h-11 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                        <div className="w-5 h-5 flex-shrink-0">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/2048px-Google_%22G%22_logo.svg.png" alt="Google" />
                        </div>
                    </button>
                    <button
                        className="border border-gray-300 rounded-lg h-11 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                        <div className="w-5 h-5 text-gray-900 flex-shrink-0">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                            </svg>
                        </div>
                    </button>
                </div>

                <p className="text-center text-gray-500 text-xs mt-6">
                    {activeTab === "signup"
                        ? "By creating an account, you agree to our Terms of Service"
                        : "By signing in, you agree to our Terms of Service"}
                </p>
            </div>
            {showMethodModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 mx-4 w-full max-w-sm shadow-xl border border-gray-200">
                        <div className="text-center mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select OTP Method</h3>
                            <p className="text-sm text-gray-600">Choose how you'd like to receive your code</p>
                        </div>

                        <div className="space-y-3">
                            {getAvailableMethods().map((method) => (
                                <button
                                    key={method.id}
                                    onClick={() => handleMethodSelect(method.id)}
                                    disabled={isSendingOtp}
                                    className={`w-full flex items-center gap-3 p-4 rounded-lg transition-all border ${isSendingOtp
                                        ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-50'
                                        : 'bg-white hover:bg-gray-50 border-gray-300 hover:border-gray-400'
                                        }`}
                                >
                                    <span className="text-2xl">{method.icon}</span>
                                    <div className="flex-1 text-left">
                                        <div className="font-medium text-sm text-gray-900">{method.label}</div>
                                        <div className="text-xs text-gray-500">
                                            {method.id === "email" && `Send to ${form.email}`}
                                            {method.id === "sms" && `Send to ${form.phoneNumber}`}
                                            {method.id === "telegram" && `Send to ${form.phoneNumber}`}
                                        </div>
                                    </div>
                                    {isSendingOtp ? (
                                        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                                    ) : (
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setShowMethodModal(false)}
                            disabled={isSendingOtp}
                            className={`w-full mt-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${isSendingOtp
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
