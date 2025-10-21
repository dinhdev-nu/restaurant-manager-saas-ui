import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AuthCard } from "./components/auth-card"
import { useToast } from "hooks/use-toast"


const AuthPage = () => {
  const navigate = useNavigate()
  const { toast } = useToast()

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

          if (session.accessToken) {
            localStorage.setItem("token", session.accessToken)
          }

          if (session.user) {
            localStorage.setItem("user", JSON.stringify(session.user))
          }

          // Xóa cookie SS sau khi đã lưu
          document.cookie = 'SS=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'

          toast({
            title: "Signed in successfully 🎉!",
            description: `Welcome back, ${session.user?.email || 'User'}!`,
            duration: 3000,
          })

          // Redirect về trang chủ
          setTimeout(() => {
            navigate("/", { replace: true })
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-white">
      <AuthCard />
    </div>
  )
}

export default AuthPage
