import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AuthCard } from "./components/auth-card"
import { useAuthStore } from "../../stores"

const AuthPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/profile", { replace: true })
    }
  }, [isAuthenticated, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(175,255,0,0.12),transparent_70%)] pointer-events-none" />

      {/* Decorative blobs */}
      <div className="absolute -top-10 left-[-5%] w-72 h-72 rounded-full bg-[#AFFF00]/40 blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute -bottom-20 -right-10 w-96 h-96 rounded-full bg-[#AFFF00]/30 blur-[120px] pointer-events-none animate-[pulse_6s_infinite]" />
      <div className="absolute top-1/4 right-1/4 w-40 h-40 rounded-full bg-[#AFFF00]/20 blur-[80px] pointer-events-none" />

      <div className="relative z-10 w-full flex flex-col items-center gap-6">
        <AuthCard />
      </div>
    </div>
  )
}

export default AuthPage
