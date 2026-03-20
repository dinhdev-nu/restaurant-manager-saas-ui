import { useState, useRef } from "react"
import Input from "../../../components/ui/Input"
import { Mail, Eye, EyeOff, ArrowLeft, Lock } from "lucide-react"

// View order for determining slide direction
const VIEW_ORDER = ["login", "2fa", "forgot-password", "forgot-otp", "reset-password"]

// ── View Slide Wrapper for smooth transitions ──────────────────────────────────
function ViewSlide({ view, currentView, children }) {
    const viewIdx = VIEW_ORDER.indexOf(view)
    const currentIdx = VIEW_ORDER.indexOf(currentView)
    let cls
    if (viewIdx < currentIdx) cls = "-translate-x-full opacity-0 absolute inset-0 pointer-events-none"
    else if (viewIdx > currentIdx) cls = "translate-x-full opacity-0 absolute inset-0 pointer-events-none"
    else cls = "translate-x-0 opacity-100"

    return (
        <div className={`transition-all duration-300 ease-in-out transform ${cls}`}>
            {children}
        </div>
    )
}

// ── OTP Input Component ───────────────────────────────────────────────────────
function OtpInput({ value, onChange, disabled }) {
    const inputRefs = useRef([])
    const otpDigits = (value || "").padEnd(6, " ").split("").slice(0, 6)

    const handleInput = (index, inputValue) => {
        const digit = inputValue.replace(/\D/g, "").slice(-1)
        const digits = otpDigits.map((d, i) => (i === index ? digit : (d.trim() || "")))
        onChange(digits.join("").trimEnd())
        if (digit && index < 5) inputRefs.current[index + 1]?.focus()
    }

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace") {
            const current = otpDigits[index].trim()
            if (!current && index > 0) {
                const digits = otpDigits.map((d, i) => i === index - 1 ? "" : (d.trim() || ""))
                onChange(digits.join("").trimEnd())
                inputRefs.current[index - 1]?.focus()
            } else {
                const digits = otpDigits.map((d, i) => i === index ? "" : (d.trim() || ""))
                onChange(digits.join("").trimEnd())
            }
        }
        if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus()
        if (e.key === "ArrowRight" && index < 5) inputRefs.current[index + 1]?.focus()
    }

    const handlePaste = (e) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
        onChange(pasted)
        inputRefs.current[Math.min(pasted.length, 5)]?.focus()
    }

    return (
        <div className="flex gap-2">
            {otpDigits.map((digit, i) => (
                <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit.trim()}
                    onChange={(e) => handleInput(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={i === 0 ? handlePaste : undefined}
                    disabled={disabled}
                    className="flex-1 h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:border-black focus:ring-2 focus:ring-black/5 outline-none transition-all bg-white text-gray-900 min-w-0 disabled:opacity-50"
                    autoComplete="off"
                />
            ))}
        </div>
    )
}

// ── Login View ────────────────────────────────────────────────────────────────
function LoginView({ hook }) {
    const {
        form,
        isLoading,
        rememberMe, setRememberMe,
        handleIdentifierChange,
        handlePasswordChange,
        handleForgotPassword,
        handleSubmit,
    } = hook

    const [showPassword, setShowPassword] = useState(false)

    return (
        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            <div>
                <h2 className="text-xl font-semibold text-gray-900">Welcome back</h2>
                <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
            </div>

            {/* Identifier */}
            <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <Input
                    type="text"
                    value={form.email || form.phoneNumber}
                    onChange={(e) => handleIdentifierChange(e.target.value)}
                    className="bg-white border border-gray-300 rounded-lg h-11 text-sm placeholder:text-gray-400 focus:border-black focus-visible:ring-1 focus-visible:ring-black/20 focus-visible:ring-offset-0 pl-10 pr-16 transition-all"
                    placeholder="Email or phone number"
                    autoComplete="username"
                />
                {(form.email || form.phoneNumber) && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded pointer-events-none">
                        {form.email ? "Email" : "Phone"}
                    </span>
                )}
            </div>

            {/* Password */}
            <div className="relative">
                <Input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    className="bg-white border border-gray-300 rounded-lg h-11 text-sm placeholder:text-gray-400 focus:border-black focus-visible:ring-1 focus-visible:ring-black/20 focus-visible:ring-offset-0 pr-10 transition-all"
                    placeholder="Password"
                    autoComplete="current-password"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>

            {/* Remember me + forgot */}
            <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer select-none">
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
                    onClick={handleForgotPassword}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                    Forgot password?
                </button>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800 active:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? "Signing in..." : "Sign in"}
            </button>
        </form>
    )
}

// ── 2FA View ──────────────────────────────────────────────────────────────────
function TwoFaView({ hook }) {
    const {
        form,
        isLoading,
        isSendingOtp,
        otpCountdown,
        twoFaMethod,
        handleOtpChange,
        handleVerify2fa,
        handleResend2faOtp,
        handleBackToLogin,
    } = hook

    return (
        <div className="space-y-5">
            <button
                type="button"
                onClick={handleBackToLogin}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors -ml-0.5"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to login
            </button>

            <div>
                <h2 className="text-xl font-semibold text-gray-900">Two-factor authentication</h2>
                <p className="text-sm text-gray-500 mt-1">
                    Enter the 6-digit code sent to your {twoFaMethod || "email"}
                </p>
            </div>

            <OtpInput
                value={form.otp}
                onChange={handleOtpChange}
                disabled={isLoading}
            />

            <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Didn't receive the code?</span>
                <button
                    type="button"
                    onClick={handleResend2faOtp}
                    disabled={otpCountdown > 0 || isSendingOtp}
                    className={[
                        "font-medium transition-colors",
                        otpCountdown > 0 || isSendingOtp ? "text-gray-400 cursor-not-allowed" : "text-black hover:text-gray-600",
                    ].join(" ")}
                >
                    {isSendingOtp ? "Sending..." : otpCountdown > 0 ? `Resend in ${otpCountdown}s` : "Resend"}
                </button>
            </div>

            <button
                type="button"
                onClick={handleVerify2fa}
                disabled={isLoading || (form.otp || "").length < 6}
                className="w-full h-11 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800 active:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? "Verifying..." : "Verify"}
            </button>
        </div>
    )
}

// ── Forgot Password View ──────────────────────────────────────────────────────
function ForgotPasswordView({ hook }) {
    const {
        form,
        isLoading,
        handleBackToLogin,
    } = hook

    const [localEmail, setLocalEmail] = useState(form.email || "")

    const handleChange = (e) => {
        setLocalEmail(e.target.value)
    }

    const handleSubmit = () => {
        hook.handleSendResetOtp(localEmail)
    }

    return (
        <div className="space-y-5">
            <button
                type="button"
                onClick={handleBackToLogin}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors -ml-0.5"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to login
            </button>

            <div>
                <h2 className="text-xl font-semibold text-gray-900">Forgot password?</h2>
                <p className="text-sm text-gray-500 mt-1">
                    Enter your email and we'll send you a code to reset your password
                </p>
            </div>

            <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <Input
                    type="email"
                    value={localEmail}
                    onChange={handleChange}
                    className="bg-white border border-gray-300 rounded-lg h-11 text-sm placeholder:text-gray-400 focus:border-black focus-visible:ring-1 focus-visible:ring-black/20 focus-visible:ring-offset-0 pl-10 transition-all"
                    placeholder="Email address"
                    autoComplete="email"
                />
            </div>

            <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading || !localEmail.trim()}
                className="w-full h-11 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800 active:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? "Sending..." : "Send reset code"}
            </button>
        </div>
    )
}

// ── Forgot OTP View ───────────────────────────────────────────────────────────
function ForgotOtpView({ hook }) {
    const {
        form,
        isLoading,
        isSendingOtp,
        otpCountdown,
        handleOtpChange,
        handleVerifyResetOtp,
        handleResendResetOtp,
        handleBackToLogin,
    } = hook

    return (
        <div className="space-y-5">
            <button
                type="button"
                onClick={handleBackToLogin}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors -ml-0.5"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to login
            </button>

            <div>
                <h2 className="text-xl font-semibold text-gray-900">Check your email</h2>
                <p className="text-sm text-gray-500 mt-1">
                    We sent a 6-digit code to{" "}
                    <span className="text-gray-700 font-medium">{form.email}</span>
                </p>
            </div>

            <OtpInput
                value={form.otp}
                onChange={handleOtpChange}
                disabled={isLoading}
            />

            <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Didn't receive the code?</span>
                <button
                    type="button"
                    onClick={handleResendResetOtp}
                    disabled={otpCountdown > 0 || isSendingOtp}
                    className={[
                        "font-medium transition-colors",
                        otpCountdown > 0 || isSendingOtp ? "text-gray-400 cursor-not-allowed" : "text-black hover:text-gray-600",
                    ].join(" ")}
                >
                    {isSendingOtp ? "Sending..." : otpCountdown > 0 ? `Resend in ${otpCountdown}s` : "Resend"}
                </button>
            </div>

            <button
                type="button"
                onClick={handleVerifyResetOtp}
                disabled={isLoading || (form.otp || "").length < 6}
                className="w-full h-11 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800 active:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? "Verifying..." : "Verify code"}
            </button>
        </div>
    )
}

// ── Reset Password View ───────────────────────────────────────────────────────
function ResetPasswordView({ hook }) {
    const {
        form,
        isLoading,
        handleNewPasswordChange,
        handleConfirmNewPasswordChange,
        handleResetPassword,
        handleBackToLogin,
    } = hook

    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const mismatch = form.confirmNewPassword && form.newPassword !== form.confirmNewPassword

    return (
        <div className="space-y-5">
            <button
                type="button"
                onClick={handleBackToLogin}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors -ml-0.5"
            >
                <ArrowLeft className="w-4 h-4" />
                Cancel
            </button>

            <div>
                <h2 className="text-xl font-semibold text-gray-900">Reset your password</h2>
                <p className="text-sm text-gray-500 mt-1">
                    Enter a new password (6-32 characters)
                </p>
            </div>

            <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <Input
                    type={showPassword ? "text" : "password"}
                    value={form.newPassword}
                    onChange={(e) => handleNewPasswordChange(e.target.value)}
                    className="bg-white border border-gray-300 rounded-lg h-11 text-sm placeholder:text-gray-400 focus:border-black focus-visible:ring-1 focus-visible:ring-black/20 focus-visible:ring-offset-0 pl-10 pr-10 transition-all"
                    placeholder="New password"
                    autoComplete="new-password"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>

            <div>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <Input
                        type={showConfirm ? "text" : "password"}
                        value={form.confirmNewPassword}
                        onChange={(e) => handleConfirmNewPasswordChange(e.target.value)}
                        className={[
                            "bg-white border rounded-lg h-11 text-sm placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-offset-0 pl-10 pr-10 transition-all",
                            mismatch ? "border-red-400 focus:border-red-400 focus-visible:ring-red-300" : "border-gray-300 focus:border-black focus-visible:ring-black/20",
                        ].join(" ")}
                        placeholder="Confirm new password"
                        autoComplete="new-password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
                {mismatch && <p className="text-xs text-red-500 mt-1">Passwords do not match</p>}
            </div>

            <button
                type="button"
                onClick={handleResetPassword}
                disabled={isLoading || !form.newPassword || !!mismatch}
                className="w-full h-11 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800 active:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? "Resetting..." : "Reset password"}
            </button>
        </div>
    )
}

// ── Main Export ───────────────────────────────────────────────────────────────
export function SignInForm({ hook }) {
    const { view } = hook

    return (
        <div className="relative overflow-hidden">
            <ViewSlide view="login" currentView={view}>
                <LoginView hook={hook} />
            </ViewSlide>

            <ViewSlide view="2fa" currentView={view}>
                <TwoFaView hook={hook} />
            </ViewSlide>

            <ViewSlide view="forgot-password" currentView={view}>
                <ForgotPasswordView hook={hook} />
            </ViewSlide>

            <ViewSlide view="forgot-otp" currentView={view}>
                <ForgotOtpView hook={hook} />
            </ViewSlide>

            <ViewSlide view="reset-password" currentView={view}>
                <ResetPasswordView hook={hook} />
            </ViewSlide>
        </div>
    )
}
