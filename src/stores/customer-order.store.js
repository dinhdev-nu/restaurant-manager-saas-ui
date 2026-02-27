import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Customer Order Store - Riêng cho customer ordering
 * Tách biệt hoàn toàn với POS order store
 */
export const useCustomerOrderStore = create(
  persist(
    (set, get) => ({
      // State
      customerOrders: [], // Draft orders (chưa xác nhận)
      confirmedOrders: [], // Orders đã xác nhận/hoàn thành
      _lastUpdate: Date.now(), // Track last update timestamp
      
      // Actions
      
      /**
       * Thêm order mới của customer
       */
      addCustomerOrder: (order) => {
        // Check if order already exists to prevent duplicates
        const existingOrder = get().customerOrders.find(o => o._id === order._id);
        if (existingOrder) {
          console.log('[CustomerOrderStore] Order already exists, skipping:', order._id);
          return existingOrder;
        }

        const newOrder = {
          ...order,
          _id: order._id || `CUST_ORD_${Date.now()}`,
          createdAt: order.createdAt || new Date().toISOString(),
          type: 'customer', // Đánh dấu đây là customer order
        };

        set((state) => ({
          customerOrders: [newOrder, ...state.customerOrders],
          _lastUpdate: Date.now(),
        }));

        return newOrder;
      },

      /**
       * Xóa order của customer (khi cancel trước khi xác nhận)
       */
      removeCustomerOrder: (orderId) => {
        set((state) => ({
          customerOrders: state.customerOrders.filter((order) => order._id !== orderId),
          _lastUpdate: Date.now(),
        }));
      },

      /**
       * Lấy danh sách orders của customer theo user
       */
      getCustomerOrdersByUser: (userId) => {
        const orders = get().customerOrders;
        if (!userId) return orders; // Guest user - return all local orders
        return orders.filter(order => order.customer?.customerId === userId);
      },

      /**
       * Lấy order theo ID
       */
      getCustomerOrderById: (orderId) => {
        return get().customerOrders.find(order => order._id === orderId);
      },

      /**
       * Clear tất cả orders (khi logout)
       */
      clearCustomerOrders: () => {
        set({ customerOrders: [], _lastUpdate: Date.now() });
      },

      /**
       * Cập nhật status của order (khi nhận response từ server)
       */
      updateCustomerOrderStatus: (orderId, status) => {
        set((state) => ({
          customerOrders: state.customerOrders.map((order) =>
            order._id === orderId ? { ...order, status } : order
          ),
          _lastUpdate: Date.now(),
        }));
      },

      /**
       * Set orders từ API (nếu cần sync từ server)
       */
      setCustomerOrders: (orders) => {
        const mappedOrders = orders?.map(order => ({
          ...order,
          type: 'customer',
        })) || [];
        set({ customerOrders: mappedOrders, _lastUpdate: Date.now() });
      },

      /**
       * Thêm confirmed order mới hoặc update nếu đã tồn tại
       */
      addConfirmedOrder: (order) => {
        // Check if order already exists
        const existingOrder = get().confirmedOrders.find(o => o._id === order._id);
        
        if (existingOrder) {
          // Update existing order instead of skipping
          set((state) => ({
            confirmedOrders: state.confirmedOrders.map(o =>
              o._id === order._id ? { ...order, type: 'customer' } : o
            ),
            _lastUpdate: Date.now(),
          }));
          return { ...order, type: 'customer' };
        }

        // Add new order
        const newOrder = {
          ...order,
          type: 'customer',
        };

        set((state) => ({
          confirmedOrders: [newOrder, ...state.confirmedOrders],
          _lastUpdate: Date.now(),
        }));
        return newOrder;
      },

      /**
       * Set confirmed orders từ API
       */
      setConfirmedOrders: (orders) => {
        const mappedOrders = orders?.map(order => ({
          ...order,
          type: 'customer',
        })) || [];
        set({ confirmedOrders: mappedOrders, _lastUpdate: Date.now() });
      },

      /**
       * Update confirmed order (thành thế toàn bộ dữ liệu trừ _id)
       */
      updateConfirmedOrder: (orderId, orderData) => {
        set((state) => ({
          confirmedOrders: state.confirmedOrders.map((order) =>
            order._id === orderId ? { ...orderData, _id: order._id, type: 'customer' } : order
          ),
          _lastUpdate: Date.now(),
        }));
      },

      /**
       * Lấy confirmed orders theo user
       */
      getConfirmedOrdersByUser: (userId) => {
        const orders = get().confirmedOrders;
        if (!userId) return orders;
        return orders.filter(order => order.customer?.customerId === userId);
      },
    }),
    {
      name: 'customer-order-storage', // Key trong localStorage
      partialize: (state) => ({ 
        customerOrders: state.customerOrders,
        confirmedOrders: state.confirmedOrders,
        _lastUpdate: state._lastUpdate,
      }),
    }
  )
);

// Cross-tab sync: Listen to localStorage changes from other tabs
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'customer-order-storage' && e.newValue) {
      try {
        const newState = JSON.parse(e.newValue);
        const currentState = useCustomerOrderStore.getState();
        
        // Only update if the new state is newer
        if (newState.state._lastUpdate > currentState._lastUpdate) {
          useCustomerOrderStore.setState({
            customerOrders: newState.state.customerOrders || [],
            confirmedOrders: newState.state.confirmedOrders || [],
            _lastUpdate: newState.state._lastUpdate,
          });
        }
      } catch (error) {
        console.error('[CustomerOrderStore] Failed to sync from storage event:', error);
      }
    }
  });
}
