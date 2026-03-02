import { useState } from "react"
import Input from "../../../components/ui/Input"
import { Mail, Eye, EyeOff } from "lucide-react"

export function SignInForm({ hook }) {
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
