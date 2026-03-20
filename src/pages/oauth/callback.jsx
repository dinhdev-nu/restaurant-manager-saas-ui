import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuthStore } from "../../stores"
import { useToast } from "hooks/use-toast"
import { getMeApi } from "../../api/auth"

const OAuthCallback = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { login: loginStore } = useAuthStore()
    const { toast } = useToast()

    const [status, setStatus] = useState("processing") // "processing" | "success" | "error"
    const [message, setMessage] = useState("Authenticating...")

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const accessToken = searchParams.get("access_token")
                const error = searchParams.get("error")

                if (error) {
                    setStatus("error")
                    setMessage(decodeURIComponent(error) || "Authentication failed")
                    toast({
                        variant: "destructive",
                        title: "Authentication failed",
                        description: decodeURIComponent(error) || "Please try again.",
                        duration: 4000
                    })
                    setTimeout(() => navigate("/auth", { replace: true }), 2000)
                    return
                }

                if (!accessToken) {
                    setStatus("error")
                    setMessage("No access token received")
                    toast({
                        variant: "destructive",
                        title: "Authentication failed",
                        description: "No access token received from server.",
                        duration: 4000
                    })
                    setTimeout(() => navigate("/auth", { replace: true }), 2000)
                    return
                }

                // Store the token first
                loginStore(null, accessToken)
                setMessage("Fetching user info...")

                // Fetch user info
                try {
                    const userRes = await getMeApi()
                    const user = userRes?.data ?? userRes

                    // Update store with full user info
                    loginStore(user, accessToken)

                    setStatus("success")
                    setMessage("Welcome back!")

                    toast({
                        title: "Signed in successfully",
                        description: `Welcome, ${user.full_name || user.email}!`,
                        duration: 3000
                    })

                    // Redirect to profile
                    setTimeout(() => navigate("/profile", { replace: true }), 1000)
                } catch (userError) {
                    // Token might be valid but couldn't fetch user
                    // Still let them proceed
                    console.warn("Could not fetch user info:", userError)
                    setStatus("success")
                    setMessage("Welcome!")

                    toast({
                        title: "Signed in successfully",
                        description: "Welcome to POS Manager!",
                        duration: 3000
                    })

                    setTimeout(() => navigate("/profile", { replace: true }), 1000)
                }
            } catch (err) {
                console.error("OAuth callback error:", err)
                setStatus("error")
                setMessage("Something went wrong")
                toast({
                    variant: "destructive",
                    title: "Authentication error",
                    description: "Failed to complete sign in. Please try again.",
                    duration: 4000
                })
                setTimeout(() => navigate("/auth", { replace: true }), 2000)
            }
        }

        handleCallback()
    }, [searchParams, loginStore, navigate, toast])

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(175,255,0,0.12),transparent_70%)] pointer-events-none" />
            <div className="absolute -top-10 left-[-5%] w-72 h-72 rounded-full bg-[#AFFF00]/40 blur-[100px] pointer-events-none animate-pulse" />
            <div className="absolute -bottom-20 -right-10 w-96 h-96 rounded-full bg-[#AFFF00]/30 blur-[120px] pointer-events-none animate-[pulse_6s_infinite]" />

            <div className="relative z-10 w-full max-w-sm mx-auto">
                <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg text-center">
                    {/* Status indicator */}
                    <div className="mb-6">
                        {status === "processing" && (
                            <div className="w-16 h-16 mx-auto relative">
                                <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
                                <div className="absolute inset-0 rounded-full border-4 border-t-black border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                            </div>
                        )}

                        {status === "success" && (
                            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        )}

                        {status === "error" && (
                            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                        )}
                    </div>

                    {/* Status text */}
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {status === "processing" && "Signing you in..."}
                        {status === "success" && "Success!"}
                        {status === "error" && "Oops!"}
                    </h2>

                    <p className="text-sm text-gray-500">
                        {message}
                    </p>

                    {/* Additional info for processing state */}
                    {status === "processing" && (
                        <div className="mt-6 flex items-center justify-center gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                    )}

                    {/* Redirect notice */}
                    {status !== "processing" && (
                        <p className="mt-4 text-xs text-gray-400">
                            Redirecting automatically...
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default OAuthCallback
