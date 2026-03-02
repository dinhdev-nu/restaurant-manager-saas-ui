export function OtpMethodModal({ methods, isSendingOtp, onSelect, onClose }) {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 mx-4 w-full max-w-sm shadow-xl border border-gray-200">
                <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Send verification code</h3>
                    <p className="text-sm text-gray-500">Choose how you'd like to receive your code</p>
                </div>

                <div className="space-y-3">
                    {methods.map((method) => (
                        <button
                            key={method.id}
                            onClick={() => onSelect(method.id)}
                            disabled={isSendingOtp}
                            className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all border ${isSendingOtp
                                    ? "bg-gray-50 border-gray-200 cursor-not-allowed opacity-50"
                                    : "bg-white hover:bg-gray-50 border-gray-300 hover:border-gray-400"
                                }`}
                        >
                            <span className="text-2xl">{method.icon}</span>
                            <div className="flex-1 text-left">
                                <div className="font-medium text-sm text-gray-900">{method.label}</div>
                                <div className="text-xs text-gray-500">{method.description}</div>
                            </div>
                            {isSendingOtp ? (
                                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                            ) : (
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            )}
                        </button>
                    ))}
                </div>

                <button
                    onClick={onClose}
                    disabled={isSendingOtp}
                    className={`w-full mt-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${isSendingOtp ? "text-gray-400 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"
                        }`}
                >
                    Cancel
                </button>
            </div>
        </div>
    )
}
