import { useEffect, useState } from "react"
import Input from "../../../components/ui/Input"
import { X, Mail, ChevronDown, Eye, EyeOff } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function AuthCard({
    rememberMe,
    setRememberMe,
    onSignIn,
    onSignUp,
    onSocialLogin,
    onForgotPassword,
}) {
    const [isLoading, setIsLoading] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const [activeTab, setActiveTab] = useState("signup")
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    // const [phoneNumber, setPhoneNumber] = useState("(775) 351-6501")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [confirmPassword, setConfirmPassword] = useState("")

    const [otp, setOtp] = useState("")
    const [otpSent, setOtpSent] = useState(false)
    const [showSentOtp, setShowSentOtp] = useState(false)

    const [showMethodModal, setShowMethodModal] = useState(false)


    const navigate = useNavigate()

    const handleSubmit = (e) => {
        e.preventDefault()

        // validation data 
        if (activeTab === "signup") {
            if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
                const msg = "Please fill in " + (!firstName ? "first name, " : "")
                    + (!lastName ? "last name, " : "")
                    + (!email ? "email, " : "")
                    + (!password ? "password, " : "")
                    + (!confirmPassword ? "confirm password, " : "")
                    + (!otp ? "OTP" : "")
                alert(msg.replace(/, $/, ""))
                return
            }

            // check otp 
            if (otp.length !== 6) {
                alert("Please enter a valid 6-digit OTP")
                return
            }

            // check password match
            if (password !== confirmPassword) {
                alert("Passwords do not match")
                return
            }

            setIsLoading(true)

            // Simulate registration
            setTimeout(() => {
                setIsLoading(false)
                setActiveTab("signin")
            }, 1500)

        } else {
            if (!email || !password) {
                const msg = "Please fill in " + (!email ? "email, " : "") + (!password ? "password" : "")
                alert(msg.replace(/, $/, ""))
                return
            }
            setIsLoading(true)
            // Simulate authentication
            setTimeout(() => {
                setIsLoading(false)
                alert("Signed in successfully!")
            }, 1500)

        }

    }

    const handleClose = () => {
        navigate(-1)
    }

    const getAvailableMethods = () => {
        const methods = []
        if (email && email.trim() !== "") {
            methods.push({ id: "email", label: "Gmail", icon: "📧" })
        }
        // if (phoneNumber && phoneNumber.trim() !== "") {
        //     methods.push({ id: "sms", label: "SMS", icon: "💬" }, { id: "telegram", label: "Telegram", icon: "✈️" })
        // }
        return methods
    }

    const handleSendOtp = (e) => {

        // check email valid
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            alert("Please enter a valid email address")
            return
        }

        setShowMethodModal(true)
    }


    return (
        <div className="w-full max-w-md mx-auto">
            <div className="bg-white/95 backdrop-blur-xl border border-gray-200 rounded-[32px] p-8 shadow-2xl transform transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl">
                {/* Header with tabs and close button */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex bg-gray-100 backdrop-blur-sm rounded-full p-1 border border-gray-200 min-w-0 flex-1 mr-4">
                        <button
                            onClick={() => setActiveTab("signup")}
                            className={`flex-1 min-w-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 ${activeTab === "signup"
                                ? "bg-white backdrop-blur-sm border border-gray-300 shadow-lg"
                                : "hover:bg-gray-50"
                                }`}
                            style={{ color: activeTab === "signup" ? "#111827" : "#4B5563" }}
                        >
                            <span className="truncate">Sign up</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("signin")}
                            className={`flex-1 min-w-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 ${activeTab === "signin"
                                ? "bg-white backdrop-blur-sm border border-gray-300 shadow-lg"
                                : "hover:bg-gray-50"
                                }`}
                            style={{ color: activeTab === "signin" ? "#111827" : "#4B5563" }}
                        >
                            <span className="truncate">Sign in</span>
                        </button>
                    </div>
                    <button
                        className="flex-shrink-0 w-10 h-10 bg-gray-100 backdrop-blur-sm rounded-full flex items-center justify-center border border-gray-200 hover:bg-gray-200 transition-all duration-200 hover:scale-110 hover:rotate-90"
                        onClick={handleClose}
                        aria-label="Close"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                <h1 className="text-3xl font-normal text-gray-900 mb-8 transition-all duration-300">
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
                        >
                            {/* Name fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative">
                                    <Input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="bg-gray-50 border border-gray-200 rounded-2xl h-14 text-gray-900 placeholder:text-gray-500 focus:border-gray-400 focus:ring-0 text-base transition-all duration-200 hover:bg-gray-100 focus:bg-white"
                                        placeholder="First name"
                                    />
                                </div>
                                <div className="relative">
                                    <Input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="bg-gray-50 border border-gray-200 rounded-2xl h-14 text-gray-900 placeholder:text-gray-500 focus:border-gray-400 focus:ring-0 text-base transition-all duration-200 hover:bg-gray-100 focus:bg-white"
                                        placeholder="Last name"
                                    />
                                </div>
                            </div>

                            {/* Account name field */}
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors duration-200" />
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-gray-50 border border-gray-200 rounded-2xl h-14 text-gray-900 placeholder:text-gray-500 focus:border-gray-400 focus:ring-0 pl-12 text-base transition-all duration-200 hover:bg-gray-100 focus:bg-white"
                                    placeholder="Enter your email"

                                />
                            </div>

                            {/* Phone field */}
                            {/* <div className="relative">
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                                    <div className="w-6 h-4 bg-red-500 relative overflow-hidden rounded-sm">
                                        <div className="absolute inset-0 bg-red-500"></div>
                                        <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
                                        <div className="absolute top-1 left-1 w-1 h-0.5 bg-white"></div>
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                </div>
                                <Input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="bg-gray-50 border border-gray-200 rounded-2xl h-14 text-gray-900 placeholder:text-gray-500 focus:border-gray-400 focus:ring-0 pl-20 text-base transition-all duration-200 hover:bg-gray-100 focus:bg-white"
                                    placeholder="Phone number"
                                />
                            </div> */}

                            <div className="relative">
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <Input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, "").slice(0, 6)
                                                setOtp(value)
                                                if (value.length === 0) setOtpSent(false)
                                            }}
                                            className="bg-gray-50 border border-gray-200 rounded-2xl h-14 text-gray-900 placeholder:text-gray-500 focus:border-gray-400 focus:ring-0 text-base transition-all duration-200 hover:bg-gray-100 focus:bg-white text-center tracking-widest"
                                            placeholder="Enter 6-digit OTP"
                                            maxLength={6}
                                            autoComplete="one-time-code"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleSendOtp}
                                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-2xl text-sm font-medium text-gray-700 transition-all duration-200 whitespace-nowrap"
                                    >
                                        Gửi OTP
                                    </button>
                                </div>
                            </div>


                            {/* Password field */}
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-gray-50 border border-gray-200 rounded-2xl h-14 text-gray-900 placeholder:text-gray-500 focus:border-gray-400 focus:ring-0 pr-12 text-base transition-all duration-200 hover:bg-gray-100 focus:bg-white"
                                    placeholder="Create password"
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                                            />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </div>

                            <div className="relative">
                                <Input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="bg-gray-50 border border-gray-200 rounded-2xl h-14 text-gray-900 placeholder:text-gray-500 focus:border-gray-400 focus:ring-0 pr-12 text-base transition-all duration-200 hover:bg-gray-100 focus:bg-white"
                                    placeholder="Confirm password"
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                >
                                    {showConfirmPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                                            />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-14 mt-8 rounded-2xl font-medium text-base transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                    backgroundColor: "#111827",
                                    color: "#ffffff",
                                    border: "none",
                                }}
                            >
                                {isLoading ? "Creating account..." : "Create an account"}
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
                        >
                            {/* Email field */}
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors duration-200" />
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-gray-50 border border-gray-200 rounded-2xl h-14 text-gray-900 placeholder:text-gray-500 focus:border-gray-400 focus:ring-0 pl-12 text-base transition-all duration-200 hover:bg-gray-100 focus:bg-white"
                                    placeholder="Enter your email"
                                    autoComplete="email"
                                />
                            </div>

                            {/* Password field */}
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-gray-50 border border-gray-200 rounded-2xl h-14 text-gray-900 placeholder:text-gray-500 focus:border-gray-400 focus:ring-0 pr-12 text-base transition-all duration-200 hover:bg-gray-100 focus:bg-white"
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            {/* Remember me and forgot password */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="w-4 h-4 rounded border border-gray-300 bg-gray-50 text-gray-900 focus:ring-gray-400 focus:ring-2"
                                    />
                                    <span className="text-gray-600 text-sm">Remember me</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={onForgotPassword}
                                    className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-200"
                                >
                                    Forgot password?
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-14 mt-8 rounded-2xl font-medium text-base transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                    backgroundColor: "#111827",
                                    color: "#ffffff",
                                    border: "none",
                                }}
                            >
                                {isLoading ? "Signing in..." : "Sign in"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Divider */}
                <div className="flex items-center my-8">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span className="px-4 text-gray-500 text-sm font-medium">
                        {activeTab === "signup" ? "OR SIGN IN WITH" : "OR CONTINUE WITH"}
                    </span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        // onClick={handleRedirect}
                        className="bg-gray-50 border border-gray-200 rounded-2xl h-14 flex items-center justify-center hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95 min-w-0"
                    >
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/2048px-Google_%22G%22_logo.svg.png" alt="" />
                        </div>
                    </button>
                    <button
                        // onClick={handleRedirect}
                        className="bg-gray-50 border border-gray-200 rounded-2xl h-14 flex items-center justify-center hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95 min-w-0"
                    >
                        <div className="w-6 h-6 text-gray-900 flex-shrink-0">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                            </svg>
                        </div>
                    </button>
                </div>

                <p className="text-center text-gray-500 text-sm mt-8">
                    {activeTab === "signup"
                        ? "By creating an account, you agree to our Terms & Service"
                        : "By signing in, you agree to our Terms & Service"}
                </p>
            </div>
            {showMethodModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-3xl p-6 mx-4 w-full max-w-sm shadow-2xl">
                        <div className="text-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Select OTP Method</h3>
                            <p className="text-gray-600 text-sm">Choose how you'd like to receive your verification code</p>
                        </div>

                        <div className="space-y-3">
                            {getAvailableMethods().map((method) => (
                                <button
                                    key={method.id}
                                    onClick={() => handleMethodSelect(method.id)}
                                    className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all duration-200 border border-gray-200 hover:border-gray-300"
                                >
                                    <span className="text-2xl">{method.icon}</span>
                                    <div className="flex-1 text-left">
                                        <div className="font-medium text-gray-900">{method.label}</div>
                                        <div className="text-sm text-gray-600">
                                            {method.id === "email" && `Send to ${email}`}
                                            {method.id === "sms" && `Send to ${countryCode} ${phoneNumber}`}
                                            {method.id === "telegram" && `Send to ${countryCode} ${phoneNumber}`}
                                        </div>
                                    </div>
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setShowMethodModal(false)}
                            className="w-full mt-4 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
