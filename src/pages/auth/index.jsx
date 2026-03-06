import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AuthCard } from "./components/auth-card"
import { useToast } from "hooks/use-toast"
import { useAuthStore } from "../../stores"


const AuthPage = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { login: loginStore } = useAuthStore()

  useEffect(() => {
    // Helper function để đọc cookie
    const getCookie = (name) => {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop().split(';').shift()
      return null
    }

    // Lấy provider từ query params
    const params = new URLSearchParams(window.location.search)
    const provider = params.get("provider")

    if (provider === "google") {
      const sessionCookie = getCookie('SS')

      if (sessionCookie) {
        try {
          const session = JSON.parse(decodeURIComponent(sessionCookie))

          if (session.accessToken && session.user) {
            // Use Zustand store instead of localStorage
            loginStore(session.user, session.accessToken)
          }

          // Xóa cookie SS sau khi đã lưu
          document.cookie = 'SS=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'

          toast({
            title: "Signed in successfully 🎉!",
            description: `Welcome back, ${session.user?.email || 'User'}!`,
            duration: 3000,
          })

          // Redirect to restaurant selector
          setTimeout(() => {
            navigate("/restaurant-selector", { replace: true })
          }, 1000)
        } catch (error) {
          console.error("❌ Error:", error)
          toast({
            title: "Authentication error",
            description: "Failed to process login. Please try again.",
            variant: "destructive",
            duration: 4000,
          })
        }
      }
    }
  }, [navigate, toast])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
      {/* 1. Gradient nền: Thay vì 'to-white', dùng 'to-transparent' để màu xanh có chỗ 'thở' */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(175,255,0,0.12),transparent_70%)] pointer-events-none" />

      {/* 2. Các đốm sáng: Tăng kích thước (w-64, w-80) và độ đậm (/30, /40) */}
      {/* Đốm trên bên trái */}
      <div className="absolute -top-10 left-[-5%] w-72 h-72 rounded-full bg-[#AFFF00]/40 blur-[100px] pointer-events-none animate-pulse" />

      {/* Đốm dưới bên phải */}
      <div className="absolute -bottom-20 -right-10 w-96 h-96 rounded-full bg-[#AFFF00]/30 blur-[120px] pointer-events-none animate-[pulse_6s_infinite]" />

      {/* Đốm phụ ở giữa để tạo chiều sâu */}
      <div className="absolute top-1/4 right-1/4 w-40 h-40 rounded-full bg-[#AFFF00]/20 blur-[80px] pointer-events-none" />

      <div className="relative z-10 w-full flex flex-col items-center gap-6">
        <AuthCard />
      </div>
    </div>
  )
}

export default AuthPage
