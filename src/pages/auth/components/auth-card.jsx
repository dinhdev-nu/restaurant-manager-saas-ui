import { useState } from "react"
import { X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { googleAuthApi } from "../../../api/auth"
import { useToast } from "hooks/use-toast"
import { SignUpSteps } from "./sign-up-steps"
import { SignInForm } from "./sign-in-form"
import { useSignUp } from "../hooks/use-sign-up"
import { useSignIn } from "../hooks/use-sign-in"

export function AuthCard() {
    const [activeTab, setActiveTab] = useState('signup')
    const navigate = useNavigate()
    const { toast } = useToast()

    const signUpHook = useSignUp({
        onSuccess: () => setActiveTab('signin'),
    })

    const signInHook = useSignIn()

    const handleClose = () => navigate('/')

    const loginWithGoogle = () => {
        try { googleAuthApi() } catch (error) {
            toast({ variant: 'destructive', title: 'Authentication failed', description: error.response?.data?.message || error.message, duration: 4000 })
        }
    }

    return (
        <div className='w-full max-w-md mx-auto'>
            <div className='bg-white border border-gray-200 rounded-2xl p-8 shadow-lg'>
                {/* Tabs + close */}
                <div className='flex items-center justify-between mb-6'>
                    <div className='flex bg-gray-100 rounded-lg p-1 min-w-0 flex-1 mr-3'>
                        <button
                            onClick={() => { setActiveTab('signup'); signUpHook.reset() }}
                            className={'flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ' + (activeTab === 'signup' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900')}
                        >
                            Sign up
                        </button>
                        <button
                            onClick={() => setActiveTab('signin')}
                            className={'flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ' + (activeTab === 'signin' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900')}
                        >
                            Sign in
                        </button>
                    </div>
                    <button
                        onClick={handleClose}
                        className='flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors'
                        aria-label='Close'
                    >
                        <X className='w-5 h-5 text-gray-400' />
                    </button>
                </div>

                {/* Forms */}
                {activeTab === 'signup' ? (
                    <SignUpSteps hook={signUpHook} />
                ) : (
                    <SignInForm hook={signInHook} />
                )}

                {/* Social divider */}
                <div className='flex items-center my-6'>
                    <div className='flex-1 h-px bg-gray-200' />
                    <span className='px-3 text-gray-500 text-xs font-medium'>OR</span>
                    <div className='flex-1 h-px bg-gray-200' />
                </div>

                {/* Social buttons */}
                <div className='grid grid-cols-2 gap-3'>
                    <button
                        onClick={loginWithGoogle}
                        className='border border-gray-300 rounded-lg h-11 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors text-sm text-gray-700 font-medium'
                    >
                        <img src='https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/2048px-Google_%22G%22_logo.svg.png' alt='Google' className='w-4 h-4' />
                        Google
                    </button>
                    <button className='border border-gray-300 rounded-lg h-11 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors text-sm text-gray-700 font-medium'>
                        <svg className='w-4 h-4' viewBox='0 0 24 24' fill='currentColor'>
                            <path d='M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z' />
                        </svg>
                        Apple
                    </button>
                </div>

                <p className='text-center text-gray-400 text-xs mt-5'>
                    By continuing, you agree to our Terms of Service
                </p>
            </div>
        </div>
    )
}
