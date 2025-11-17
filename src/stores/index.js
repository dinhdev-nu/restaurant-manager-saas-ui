/**
 * STORES INDEX
 * Export tất cả stores từ một file để dễ import
 */

export { useAuthStore } from './auth.store'
export { useTableStore } from './table.store'
export { useMenuStore } from './menu.store'
export { useStaffStore } from './staff.store'
export { useOrderStore } from './order.store'

/**
 * USAGE:
 * import { useAuthStore, useTableStore, useMenuStore, useStaffStore, useOrderStore } from '@/stores'
 */
