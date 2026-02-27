import { create } from 'zustand';

export const useNotificationStore = create((set, get) => ({
  notifications: [],

  addNotification: (notification) => {
    const newNotification = {
      id: Date.now(),
      type: notification.type || 'info', // 'info' | 'warning' | 'success' | 'error'
      message: notification.message,
      time: notification.time || 'Vừa xong',
      timestamp: Date.now(),
      ...notification,
    };

    console.log('[NotificationStore] Adding notification:', newNotification);

    set((state) => {
      // Keep max 10 notifications
      const updatedNotifications = [newNotification, ...state.notifications].slice(0, 10);
      console.log('[NotificationStore] Total notifications:', updatedNotifications.length);
      return { notifications: updatedNotifications };
    });
  },

  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter((n) => n.id !== id),
  })),

  clearNotifications: () => set({ notifications: [] }),

  // Helper to get relative time string
  getRelativeTime: (timestamp) => {
    const now = Date.now();
    const diff = Math.floor((now - timestamp) / 1000); // seconds

    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return `${Math.floor(diff / 86400)} ngày trước`;
  },
}));
