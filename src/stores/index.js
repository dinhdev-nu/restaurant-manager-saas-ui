/**
 * STORES INDEX
 * Export tất cả stores từ một file để dễ import
 */

export { useAuthStore } from './auth.store'
export { useTableStore } from './table.store'
export { useMenuStore } from './menu.store'
export { useStaffStore } from './staff.store'
export { useOrderStore } from './order.store'
export { useRestaurantStore } from './restaurant.store'
export { useCustomerOrderStore } from './customer-order.store'

/**
 * USAGE:
 * import { useAuthStore, useTableStore, useMenuStore, useStaffStore, useOrderStore, useRestaurantStore, useCustomerOrderStore } from '@/stores'
 */
