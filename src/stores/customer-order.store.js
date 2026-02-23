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
      customerOrders: [],
      
      // Actions
      
      /**
       * Thêm order mới của customer
       */
      addCustomerOrder: (order) => {
        const newOrder = {
          ...order,
          _id: order._id || `CUST_ORD_${Date.now()}`,
          createdAt: order.createdAt || new Date().toISOString(),
          type: 'customer', // Đánh dấu đây là customer order
        };

        set((state) => ({
          customerOrders: [newOrder, ...state.customerOrders],
        }));

        return newOrder;
      },

      /**
       * Xóa order của customer (khi cancel trước khi xác nhận)
       */
      removeCustomerOrder: (orderId) => {
        set((state) => ({
          customerOrders: state.customerOrders.filter((order) => order._id !== orderId),
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
        set({ customerOrders: [] });
      },

      /**
       * Cập nhật status của order (khi nhận response từ server)
       */
      updateCustomerOrderStatus: (orderId, status) => {
        set((state) => ({
          customerOrders: state.customerOrders.map((order) =>
            order._id === orderId ? { ...order, status } : order
          ),
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
        set({ customerOrders: mappedOrders });
      },
    }),
    {
      name: 'customer-order-storage', // Key trong localStorage
      partialize: (state) => ({ 
        customerOrders: state.customerOrders 
      }),
    }
  )
);
