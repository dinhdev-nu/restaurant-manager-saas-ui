import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useOrderStore = create(
  persist(
    (set, get) => ({
      // State
      orders: [],
      currentOrder: null,

      // Actions
      addOrder: (order) => {
        const newOrder = {
          ...order,
          _id: order._id || `ORD${Date.now()}`,
          timestamp: order.timestamp || order.createdAt || new Date(),
          status: order.status || 'pending', // pending, processing, completed, cancelled
          paymentMethod: order.paymentMethod || null,
          paymentStatus: order.paymentStatus || 'unpaid', // unpaid, paid, refunded
        };

        set((state) => ({
          orders: [newOrder, ...state.orders],
          currentOrder: newOrder,
        }));

        return newOrder;
      },

      updateOrder: (orderId, updates) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order._id === orderId ? { ...order, ...updates } : order
          ),
        }));
      },

      updateOrderStatus: (orderId, status) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order._id === orderId ? { ...order, status } : order
          ),
        }));
      },

      updateOrderPayment: (orderId, paymentData) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order._id === orderId
              ? {
                  ...order,
                  paymentMethod: paymentData.method,
                  paymentStatus: 'paid',
                  paidAt: new Date(),
                  paymentData: paymentData,
                }
              : order
          ),
        }));
      },

      deleteOrder: (orderId) => {
        set((state) => ({
          orders: state.orders.filter((order) => order._id !== orderId),
        }));
      },

      clearOrders: () => {
        set({ orders: [], currentOrder: null });
      },

      setCurrentOrder: (order) => {
        set({ currentOrder: order });
      },

      clearCurrentOrder: () => {
        set({ currentOrder: null });
      },

      // Getters
      getOrders: () => get().orders,
      
      getOrderById: (orderId) => {
        return get().orders.find((order) => order._id === orderId);
      },

      getPendingOrders: () => {
        return get().orders.filter((order) => order.status === 'pending');
      },

      getProcessingOrders: () => {
        return get().orders.filter((order) => order.status === 'processing');
      },

      getUnpaidOrders: () => {
        return get().orders.filter((order) => order.paymentStatus === 'unpaid');
      },

      getOrdersByTable: (table) => {
        return get().orders.filter((order) => order.table === table);
      },

      getOrdersByDateRange: (startDate, endDate) => {
        return get().orders.filter((order) => {
          const orderDate = new Date(order.timestamp);
          return orderDate >= new Date(startDate) && orderDate <= new Date(endDate);
        });
      },

      getTodayOrders: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return get().orders.filter((order) => {
          const orderDate = new Date(order.timestamp);
          return orderDate >= today;
        });
      },

      getTodayRevenue: () => {
        const todayOrders = get().getTodayOrders();
        return todayOrders
          .filter((order) => order.paymentStatus === 'paid')
          .reduce((total, order) => total + (order.total || 0), 0);
      },

      getTotalOrders: () => {
        return get().orders.length;
      },

      getAverageOrderValue: () => {
        const orders = get().orders.filter((order) => order.paymentStatus === 'paid');
        if (orders.length === 0) return 0;
        const total = orders.reduce((sum, order) => sum + (order.total || 0), 0);
        return total / orders.length;
      },
    }),
    {
      name: "order-storage", // localStorage key
      partialize: (state) => ({
        orders: state.orders,
      }),
    }
  )
);
