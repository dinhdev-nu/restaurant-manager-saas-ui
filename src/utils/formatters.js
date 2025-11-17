/**
 * Format utilities for numbers, currency, phone, etc.
 */

/**
 * Format phone number with spaces
 * @param {string} value - Phone number string
 * @returns {string} Formatted phone number (e.g., "0123 456 789")
 */
export const formatPhoneNumber = (value) => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 4) return cleaned;
  if (cleaned.length <= 7) return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
  return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 11)}`;
};

/**
 * Parse formatted phone number back to raw digits
 * @param {string} formatted - Formatted phone number
 * @returns {string} Raw digits only
 */
export const parsePhoneNumber = (formatted) => {
  return formatted.replace(/\D/g, '');
};

/**
 * Format number with thousand separators (dot)
 * @param {string|number} value - Number to format
 * @returns {string} Formatted number (e.g., "8.000.000")
 */
export const formatCurrency = (value) => {
  const cleaned = value.toString().replace(/\D/g, '');
  if (!cleaned) return '';
  return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

/**
 * Parse formatted currency back to raw number
 * @param {string} formatted - Formatted currency string
 * @returns {number} Parsed number
 */
export const parseCurrency = (formatted) => {
  const cleaned = formatted.replace(/\D/g, '');
  return cleaned ? parseInt(cleaned, 10) : 0;
};

/**
 * Format currency with VND suffix
 * @param {string|number} value - Amount to format
 * @returns {string} Formatted currency with VND (e.g., "8.000.000 VND")
 */
export const formatCurrencyVND = (value) => {
  const formatted = formatCurrency(value);
  return formatted ? `${formatted} VND` : '';
};

/**
 * Format number with custom separator
 * @param {string|number} value - Number to format
 * @param {string} separator - Separator character (default: '.')
 * @returns {string} Formatted number
 */
export const formatNumber = (value, separator = '.') => {
  const cleaned = value.toString().replace(/\D/g, '');
  if (!cleaned) return '';
  return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
};

/**
 * Limit input to digits only
 * @param {string} value - Input value
 * @param {number} maxLength - Maximum length (optional)
 * @returns {string} Cleaned digits
 */
export const digitsOnly = (value, maxLength) => {
  const cleaned = value.replace(/\D/g, '');
  return maxLength ? cleaned.slice(0, maxLength) : cleaned;
};

/**
 * Format percentage
 * @param {number} value - Percentage value (0-100)
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage (e.g., "15.5%")
 */
export const formatPercentage = (value, decimals = 0) => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size (e.g., "1.5 MB")
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Format date to Vietnamese format
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date (e.g., "15/08/2024")
 */
export const formatDateVN = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Format datetime to Vietnamese format
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted datetime (e.g., "15/08/2024 14:30")
 */
export const formatDateTimeVN = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

/**
 * Format time only
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted time (e.g., "14:30")
 */
export const formatTime = (date) => {
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Capitalize first letter
 * @param {string} text - Text to capitalize
 * @returns {string} Capitalized text
 */
export const capitalizeFirst = (text) => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Format bank account number with spaces
 * @param {string} value - Account number
 * @returns {string} Formatted account number (e.g., "1234 5678 9012")
 */
export const formatBankAccount = (value) => {
  const cleaned = value.replace(/\D/g, '');
  return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
};
