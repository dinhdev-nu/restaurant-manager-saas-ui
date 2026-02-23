/**
 * Generate orderId from timestamp
 * Format: HD{YYYYMMDDHHMMSS}
 * Example: HD20251225143025
 * 
 * @param {Date|string|number} timestamp - Timestamp to generate orderId from
 * @returns {string} Generated orderId
 */
export const generateOrderId = (timestamp) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `HD${year}${month}${day}${hours}${minutes}${seconds}`;
};
