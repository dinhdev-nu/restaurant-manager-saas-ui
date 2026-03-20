import { useState } from "react"
import { X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { oauthLoginApi } from "../../../api/auth"
import { useToast } from "hooks/use-toast"
import { SignUpSteps } from "./sign-up-steps"
import { SignInForm } from "./sign-in-form"
import { useSignUp } from "../hooks/use-sign-up"
import { useSignIn } from "../hooks/use-sign-in"

const TAB_ORDER = ["signup", "signin"]

function TabSlide({ tab, activeTab, children }) {
    const tabIdx = TAB_ORDER.indexOf(tab)
    const currentIdx = TAB_ORDER.indexOf(activeTab)
    let cls

    if (tabIdx < currentIdx) cls = "-translate-x-full opacity-0 absolute inset-0 pointer-events-none"
    else if (tabIdx > currentIdx) cls = "translate-x-full opacity-0 absolute inset-0 pointer-events-none"
    else cls = "translate-x-0 opacity-100"

    return (
        <div className={`transition-all duration-300 ease-in-out transform ${cls}`}>
            {children}
        </div>
    )
}

export function AuthCard() {
    const [activeTab, setActiveTab] = useState('signup')
    const navigate = useNavigate()
    const { toast } = useToast()

    const signUpHook = useSignUp({
        onSuccess: () => setActiveTab('signin'),
    })

    const signInHook = useSignIn()

    const handleClose = () => navigate('/')

    const handleOAuthLogin = (provider) => {
        try {
            oauthLoginApi(provider)
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Authentication failed',
                description: error.message || 'Could not initiate login',
                duration: 4000
            })
        }
    }

    // Check if sign-in is in a sub-view (2FA, forgot password, etc.)
    const isSignInSubView = activeTab === 'signin' && signInHook.view !== 'login'

    // Check if sign-up is in OTP verification step
    const isSignUpOtpStep = activeTab === 'signup' && signUpHook.step === 'otp'

    // Hide social login in sub-views
    const showSocialLogin = !isSignInSubView && !isSignUpOtpStep

    return (
        <div className='w-full max-w-md mx-auto'>
            <div className='bg-white border border-gray-200 rounded-2xl p-8 shadow-lg'>
                {/* Tabs + close */}
                <div className='flex items-center justify-between mb-6'>
                    {!isSignInSubView && !isSignUpOtpStep ? (
                        <div className='flex bg-gray-100 rounded-lg p-1 min-w-0 flex-1 mr-3'>
                            <button
                                onClick={() => { setActiveTab('signup'); signUpHook.reset() }}
                                className={'flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ' + (activeTab === 'signup' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900')}
                            >
                                Sign up
                            </button>
                            <button
                                onClick={() => { setActiveTab('signin'); signInHook.resetForm() }}
                                className={'flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ' + (activeTab === 'signin' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900')}
                            >
                                Sign in
                            </button>
                        </div>
                    ) : (
                        <div className='flex-1' />
                    )}
                    <button
                        onClick={handleClose}
                        className='flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors'
                        aria-label='Close'
                    >
                        <X className='w-5 h-5 text-gray-400' />
                    </button>
                </div>

                {/* Forms */}
                <div className='relative overflow-hidden'>
                    <TabSlide tab='signup' activeTab={activeTab}>
                        <SignUpSteps hook={signUpHook} />
                    </TabSlide>

                    <TabSlide tab='signin' activeTab={activeTab}>
                        <SignInForm hook={signInHook} />
                    </TabSlide>
                </div>

                {/* Social divider - hide in sub-views */}
                {showSocialLogin && (
                    <>
                        <div className='flex items-center my-6'>
                            <div className='flex-1 h-px bg-gray-200' />
                            <span className='px-3 text-gray-500 text-xs font-medium'>OR</span>
                            <div className='flex-1 h-px bg-gray-200' />
                        </div>

                        {/* Social buttons */}
                        <div className='grid grid-cols-2 gap-3'>
                            <button
                                onClick={() => handleOAuthLogin('google')}
                                className='border border-gray-300 rounded-lg h-11 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors text-sm text-gray-700 font-medium'
                            >
                                <img src='https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/2048px-Google_%22G%22_logo.svg.png' alt='Google' className='w-4 h-4' />
                                Google
                            </button>
                            <button
                                onClick={() => handleOAuthLogin('facebook')}
                                className='border border-gray-300 rounded-lg h-11 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors text-sm text-gray-700 font-medium'
                            >
                                <svg className='w-4 h-4 text-[#1877F2]' viewBox='0 0 24 24' fill='currentColor'>
                                    <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
                                </svg>
                                Facebook
                            </button>
                        </div>
                    </>
                )}

                <p className='text-center text-gray-400 text-xs mt-5'>
                    By continuing, you agree to our Terms of Service
                </p>
            </div>
        </div>
    )
}
