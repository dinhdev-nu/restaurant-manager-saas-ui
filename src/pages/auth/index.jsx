// import { useState } from "react"
// import AuthCard from "../auth/components/auth-card"

import { AuthCard } from "./components/auth-card"

// const AuthPage = () => {
//   const [isLoading, setIsLoading] = useState(false)
//   const [password, setPassword] = useState("")
//   const [email, setEmail] = useState("")
//   const [rememberMe, setRememberMe] = useState(false)

//   const validateEmail = (email) => {
//     return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
//   }

//   const handleSignIn = async (e) => {
//     e.preventDefault()

//     if (!validateEmail(email)) {
//       return
//     }

//     setIsLoading(true)

//     // Simulate authentication
//     setTimeout(() => {
//       setIsLoading(false)

//     }, 1500)
//   }

//   const handleSignUp = async (e) => {
//     e.preventDefault()

//     if (password.length < 6) {

//       return
//     }

//     setIsLoading(true)

//     // Simulate registration
//     setTimeout(() => {
//       setIsLoading(false)
//     }, 1500)
//   }

//   const handleSocialLogin = (provider) => {

//   }

//   const handleForgotPassword = () => {
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-white">
//       <AuthCard
//         isLoading={isLoading}
//         email={email}
//         setEmail={setEmail}
//         password={password}
//         setPassword={setPassword}
//         rememberMe={rememberMe}
//         setRememberMe={setRememberMe}
//         onSignIn={handleSignIn}
//         onSignUp={handleSignUp}
//         onSocialLogin={handleSocialLogin}
//         onForgotPassword={handleForgotPassword}
//       />
//     </div>
//   )
// }

const AuthPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-white">
      <AuthCard />
    </div>
  )
}

export default AuthPage
