/**
 * Kiểm tra xem input có phải là số điện thoại không
 * @param {string} value - Giá trị cần kiểm tra
 * @returns {boolean} - True nếu là số điện thoại, false nếu không
 */
export const isPhoneNumber = (value) => {
    if (!value) return false
    // Loại bỏ khoảng trắng và ký tự đặc biệt
    const cleanValue = value.replace(/[\s\-\(\)]/g, '')
    // Kiểm tra nếu chỉ chứa số (có thể có + ở đầu) và có độ dài từ 9-15 ký tự
    return /^[\d+]{9,15}$/.test(cleanValue)
}

/**
 * Kiểm tra email hợp lệ
 * @param {string} email - Email cần kiểm tra
 * @returns {boolean} - True nếu email hợp lệ
 */
export const isValidEmail = (email) => {
    if (!email) return false
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

/**
 * Validate email hoặc số điện thoại
 * @param {string} value - Giá trị cần validate
 * @returns {string|null} - Thông báo lỗi hoặc null nếu hợp lệ
 */
export const validateEmailOrPhone = (value) => {
    if (!value || value.trim() === "") {
        return "Email or phone number is required"
    }
    
    // Kiểm tra xem có phải số điện thoại không
    if (isPhoneNumber(value)) {
        const cleanPhone = value.replace(/[\s\-\(\)]/g, '')
        if (cleanPhone.length < 9 || cleanPhone.length > 15) {
            return "Please enter a valid phone number (9-15 digits)"
        }
        return null // Phone number is valid
    }
    
    // Validate email
    if (!isValidEmail(value)) {
        return "Please enter a valid email address"
    }
    
    return null
}

/**
 * Format số điện thoại để hiển thị
 * @param {string} phone - Số điện thoại
 * @returns {string} - Số điện thoại đã format
 */
export const formatPhoneNumber = (phone) => {
    if (!phone) return ''
    const cleaned = phone.replace(/\D/g, '')
    
    // Format: +84 xxx xxx xxx hoặc 0xxx xxx xxx
    if (cleaned.startsWith('84') && cleaned.length === 11) {
        return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`
    } else if (cleaned.startsWith('0') && cleaned.length === 10) {
        return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`
    }
    
    return phone
}

/**
 * Validate độ mạnh của mật khẩu
 * @param {string} password - Mật khẩu cần kiểm tra
 * @returns {object} - { isValid: boolean, strength: string, message: string }
 */
export const validatePasswordStrength = (password) => {
    if (!password) {
        return { isValid: false, strength: 'none', message: 'Password is required' }
    }
    
    if (password.length < 6) {
        return { isValid: false, strength: 'weak', message: 'Password must be at least 6 characters' }
    }
    
    let strength = 'weak'
    let score = 0
    
    if (password.length >= 8) score++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++
    
    if (score >= 3) strength = 'strong'
    else if (score >= 2) strength = 'medium'
    
    return {
        isValid: password.length >= 6,
        strength,
        message: strength === 'strong' ? 'Strong password' : 
                 strength === 'medium' ? 'Medium password' : 
                 'Weak password - consider adding uppercase, numbers, and symbols'
    }
}
