import { useState, useRef } from "react"
import Input from "../../../components/ui/Input"
import { Mail, Eye, EyeOff, ArrowLeft, ChevronRight } from "lucide-react"
import { OtpMethodModal } from "./otp-method-modal"

const STEP_ORDER = ["info", "otp", "password"]

// ── Slide wrapper ─────────────────────────────────────────────────────────────
function StepSlide({ step, currentStep, children }) {
    const stepIdx = STEP_ORDER.indexOf(step)
    const currentIdx = STEP_ORDER.indexOf(currentStep)
    let cls
    if (stepIdx < currentIdx) cls = "-translate-x-full opacity-0 absolute inset-0 pointer-events-none"
    else if (stepIdx > currentIdx) cls = "translate-x-full opacity-0 absolute inset-0 pointer-events-none"
    else cls = "translate-x-0 opacity-100"
    return (
        <div className={`transition-all duration-500 ease-in-out transform ${cls}`}>
            {children}
        </div>
    )
}

// ── Step 1: Name + Identifier ─────────────────────────────────────────────────
function StepInfo({ form, isLoading, handleChange, handleIdentifierChange, onContinue }) {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-xl font-semibold text-gray-900">Create your account</h2>
                <p className="text-sm text-gray-500 mt-1">Enter your details to get started</p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-px">
                <Input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    className="bg-white border border-gray-300 rounded-lg h-11 text-sm placeholder:text-gray-400 focus:border-black focus-visible:ring-1 focus-visible:ring-black/20 focus-visible:ring-offset-0 transition-all"
                    placeholder="First name"
                    autoComplete="given-name"
                />
                <Input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    className="bg-white border border-gray-300 rounded-lg h-11 text-sm placeholder:text-gray-400 focus:border-black focus-visible:ring-1 focus-visible:ring-black/20 focus-visible:ring-offset-0 transition-all"
                    placeholder="Last name"
                    autoComplete="family-name"
                />
            </div>

            <div className="relative p-px">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <Input
                    type="text"
                    value={form.email || form.phoneNumber}
                    onChange={(e) => handleIdentifierChange(e.target.value)}
                    className="bg-white border border-gray-300 rounded-lg h-11 text-sm placeholder:text-gray-400 focus:border-black focus-visible:ring-1 focus-visible:ring-black/20 focus-visible:ring-offset-0 pl-10 pr-16 transition-all"
                    placeholder="Email or phone number"
                    autoComplete="off"
                />
                {(form.email || form.phoneNumber) && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded pointer-events-none">
                        {form.email ? "Email" : "Phone"}
                    </span>
                )}
            </div>

            <button
                type="button"
                onClick={onContinue}
                disabled={isLoading}
                className="w-full h-11 rounded-lg bg-black text-white text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-gray-800 active:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
                {isLoading ? "Checking..." : (
                    <>
                        <span>Continue</span>
                        <ChevronRight className="w-4 h-4" />
                    </>
                )}
            </button>
        </div>
    )
}

// ── Step 2: OTP ───────────────────────────────────────────────────────────────
function StepOtp({ form, isLoading, isSendingOtp, otpCountdown, handleChange, onVerify, onResend, onBack }) {
    const identifier = form.email || form.phoneNumber
    const inputRefs = useRef([])
    const otpDigits = (form.otp || "").padEnd(6, " ").split("").slice(0, 6)

    const handleInput = (index, value) => {
        const digit = value.replace(/\D/g, "").slice(-1)
        const digits = otpDigits.map((d, i) => (i === index ? digit : (d.trim() || "")))
        handleChange("otp", digits.join("").trimEnd())
        if (digit && index < 5) inputRefs.current[index + 1]?.focus()
    }

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace") {
            const current = otpDigits[index].trim()
            if (!current && index > 0) {
                const digits = otpDigits.map((d, i) => i === index - 1 ? "" : (d.trim() || ""))
                handleChange("otp", digits.join("").trimEnd())
                inputRefs.current[index - 1]?.focus()
            } else {
                const digits = otpDigits.map((d, i) => i === index ? "" : (d.trim() || ""))
                handleChange("otp", digits.join("").trimEnd())
            }
        }
        if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus()
        if (e.key === "ArrowRight" && index < 5) inputRefs.current[index + 1]?.focus()
    }

    const handlePaste = (e) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
        handleChange("otp", pasted)
        inputRefs.current[Math.min(pasted.length, 5)]?.focus()
    }

    return (
        <div className="space-y-5">
            <button type="button" onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors -ml-0.5">
                <ArrowLeft className="w-4 h-4" />
                Back
            </button>
            <div>
                <h2 className="text-xl font-semibold text-gray-900">
                    Check your {form.email ? "inbox" : "phone"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                    We sent a 6-digit code to{" "}
                    <span className="text-gray-700 font-medium">{identifier}</span>
                </p>
            </div>

            <div className="flex gap-2 p-px">
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
                        className="flex-1 h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:border-black focus:ring-2 focus:ring-black/5 outline-none transition-all bg-white text-gray-900 min-w-0"
                        autoComplete="off"
                    />
                ))}
            </div>

            <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Didn't receive the code?</span>
                <button
                    type="button"
                    onClick={onResend}
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
                onClick={onVerify}
                disabled={isLoading || (form.otp || "").trim().length < 6}
                className="w-full h-11 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800 active:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? "Verifying..." : "Verify code"}
            </button>
        </div>
    )
}

// ── Step 3: Password ──────────────────────────────────────────────────────────
function StepPassword({ form, isLoading, handleChange, onSubmit, onBack }) {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const mismatch = form.confirmPassword && form.password !== form.confirmPassword

    return (
        <div className="space-y-4">
            <button type="button" onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors -ml-0.5">
                <ArrowLeft className="w-4 h-4" />
                Back
            </button>
            <div>
                <h2 className="text-xl font-semibold text-gray-900">Create a password</h2>
                <p className="text-sm text-gray-500 mt-1">Choose a strong password for your account</p>
            </div>

            <div className="relative p-px">
                <Input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    placeholder="Password"
                    className="bg-white border border-gray-300 rounded-lg h-11 text-sm placeholder:text-gray-400 focus:border-black focus-visible:ring-1 focus-visible:ring-black/20 focus-visible:ring-offset-0 pr-10 transition-all"
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
                <div className="relative p-px">
                    <Input
                        type={showConfirm ? "text" : "password"}
                        value={form.confirmPassword}
                        onChange={(e) => handleChange("confirmPassword", e.target.value)}
                        placeholder="Confirm password"
                        className={[
                            "bg-white border rounded-lg h-11 text-sm placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-offset-0 pr-10 transition-all",
                            mismatch ? "border-red-400 focus:border-red-400 focus-visible:ring-red-300" : "border-gray-300 focus:border-black focus-visible:ring-black/20",
                        ].join(" ")}
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
                onClick={onSubmit}
                disabled={isLoading || !form.password || !!mismatch}
                className="w-full h-11 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800 active:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
                {isLoading ? "Creating account..." : "Create account"}
            </button>
        </div>
    )
}

// ── Public component ──────────────────────────────────────────────────────────
export function SignUpSteps({ hook }) {
    const {
        step, setStep,
        form, handleChange, handleIdentifierChange,
        isLoading, isSendingOtp, otpCountdown,
        showMethodModal, setShowMethodModal,
        getAvailableMethods,
        handleContinue, handleMethodSelect, handleResendOtp, handleVerifyOtp, handleCreateAccount,
    } = hook

    return (
        <div className="relative overflow-hidden">
            <StepSlide step="info" currentStep={step}>
                <StepInfo
                    form={form}
                    isLoading={isLoading}
                    handleChange={handleChange}
                    handleIdentifierChange={handleIdentifierChange}
                    onContinue={handleContinue}
                />
            </StepSlide>

            <StepSlide step="otp" currentStep={step}>
                <StepOtp
                    form={form}
                    isLoading={isLoading}
                    isSendingOtp={isSendingOtp}
                    otpCountdown={otpCountdown}
                    handleChange={handleChange}
                    onVerify={handleVerifyOtp}
                    onResend={handleResendOtp}
                    onBack={() => setStep("info")}
                />
            </StepSlide>

            <StepSlide step="password" currentStep={step}>
                <StepPassword
                    form={form}
                    isLoading={isLoading}
                    handleChange={handleChange}
                    onSubmit={handleCreateAccount}
                    onBack={() => setStep("otp")}
                />
            </StepSlide>

            {showMethodModal && (
                <OtpMethodModal
                    methods={getAvailableMethods()}
                    isSendingOtp={isSendingOtp}
                    onSelect={handleMethodSelect}
                    onClose={() => setShowMethodModal(false)}
                />
            )}
        </div>
    )
}

