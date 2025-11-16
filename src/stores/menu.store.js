import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useMenuStore = create(
  persist(
    (set, get) => ({
      // State
      categories: [
        { id: 'beverages', name: 'Đồ uống', icon: 'Coffee' },
        { id: 'appetizers', name: 'Khai vị', icon: 'Soup' },
        { id: 'main_dishes', name: 'Món chính', icon: 'UtensilsCrossed' },
        { id: 'desserts', name: 'Tráng miệng', icon: 'IceCream' },
        { id: 'snacks', name: 'Đồ ăn vặt', icon: 'Cookie' }
      ],
      menuItems: [],

      // Actions - Menu Items
      addMenuItem: (item) => {
        const state = get();

        // Validation
        if (!item.name || item.name.trim().length === 0) {
          throw new Error('Tên món ăn không được để trống');
        }

        if (item.name.length > 100) {
          throw new Error('Tên món ăn phải ngắn hơn 100 ký tự');
        }

        if (!item.price || item.price <= 0) {
          throw new Error('Giá món ăn phải lớn hơn 0');
        }

        if (!item.category) {
          throw new Error('Vui lòng chọn danh mục');
        }

        // Check duplicate name
        const isDuplicate = state.menuItems.some(
          i => i.name.toLowerCase().trim() === item.name.toLowerCase().trim()
        );

        if (isDuplicate) {
          throw new Error(`Món "${item.name}" đã tồn tại trong thực đơn`);
        }

        const newItem = {
          ...item,
          id: item.id || `menu_${Date.now()}`,
          status: item.status || 'available',
          stock_quantity: item.stock_quantity || 0,
          unit: item.unit || 'phần',
          updated_at: new Date().toISOString(),
          created_at: item.created_at || new Date().toISOString()
        };

        set((state) => ({
          menuItems: [...state.menuItems, newItem]
        }));

        return newItem;
      },

      updateMenuItem: (itemId, updates) => {
        const state = get();

        // Validate if updating name
        if (updates.name) {
          if (updates.name.trim().length === 0) {
            throw new Error('Tên món ăn không được để trống');
          }

          if (updates.name.length > 100) {
            throw new Error('Tên món ăn phải ngắn hơn 100 ký tự');
          }

          // Check duplicate name (exclude current item)
          const isDuplicate = state.menuItems.some(
            i => i.id !== itemId && i.name.toLowerCase().trim() === updates.name.toLowerCase().trim()
          );

          if (isDuplicate) {
            throw new Error(`Món "${updates.name}" đã tồn tại trong thực đơn`);
          }
        }

        // Validate price
        if (updates.price !== undefined && updates.price <= 0) {
          throw new Error('Giá món ăn phải lớn hơn 0');
        }

        set((state) => ({
          menuItems: state.menuItems.map((item) =>
            item.id === itemId 
              ? { ...item, ...updates, updated_at: new Date().toISOString() } 
              : item
          ),
        }));
      },

      deleteMenuItem: (itemId) => {
        set((state) => ({
          menuItems: state.menuItems.filter((item) => item.id !== itemId)
        }));
      },

      toggleMenuItemAvailability: (itemId) => {
        set((state) => ({
          menuItems: state.menuItems.map((item) =>
            item.id === itemId 
              ? { 
                  ...item, 
                  status: item.status === 'available' ? 'unavailable' : 'available',
                  updated_at: new Date().toISOString()
                } 
              : item
          ),
        }));
      },

      setMenuItemStatus: (itemId, status) => {
        set((state) => ({
          menuItems: state.menuItems.map((item) =>
            item.id === itemId 
              ? { ...item, status, updated_at: new Date().toISOString() } 
              : item
          ),
        }));
      },

      updateStockQuantity: (itemId, quantity) => {
        set((state) => ({
          menuItems: state.menuItems.map((item) =>
            item.id === itemId 
              ? { 
                  ...item, 
                  stock_quantity: quantity,
                  status: quantity === 0 ? 'unavailable' : quantity < 10 ? 'low_stock' : 'available',
                  updated_at: new Date().toISOString()
                } 
              : item
          ),
        }));
      },

      // Bulk Actions
      bulkDeleteMenuItems: (itemIds) => {
        set((state) => ({
          menuItems: state.menuItems.filter((item) => !itemIds.includes(item.id))
        }));
      },

      bulkToggleAvailability: (itemIds, newStatus) => {
        set((state) => ({
          menuItems: state.menuItems.map((item) =>
            itemIds.includes(item.id)
              ? { ...item, status: newStatus, updated_at: new Date().toISOString() }
              : item
          ),
        }));
      },

      bulkUpdateCategory: (itemIds, categoryId) => {
        set((state) => ({
          menuItems: state.menuItems.map((item) =>
            itemIds.includes(item.id)
              ? { ...item, category: categoryId, updated_at: new Date().toISOString() }
              : item
          ),
        }));
      },

      // Category Actions
      addCategory: (category) => {
        if (!category.name || category.name.trim().length === 0) {
          throw new Error('Tên danh mục không được để trống');
        }

        const state = get();
        const isDuplicate = state.categories.some(
          c => c.name.toLowerCase().trim() === category.name.toLowerCase().trim()
        );

        if (isDuplicate) {
          throw new Error(`Danh mục "${category.name}" đã tồn tại`);
        }

        const newCategory = {
          ...category,
          id: category.id || `cat_${Date.now()}`,
          icon: category.icon || 'Utensils'
        };

        set((state) => ({
          categories: [...state.categories, newCategory]
        }));

        return newCategory;
      },

      updateCategory: (categoryId, updates) => {
        set((state) => ({
          categories: state.categories.map((cat) =>
            cat.id === categoryId ? { ...cat, ...updates } : cat
          ),
        }));
      },

      deleteCategory: (categoryId) => {
        const state = get();
        
        // Check if category has menu items
        const hasItems = state.menuItems.some(item => item.category === categoryId);
        if (hasItems) {
          throw new Error('Không thể xóa danh mục đang có món ăn');
        }

        set((state) => ({
          categories: state.categories.filter((cat) => cat.id !== categoryId)
        }));
      },

      // Getters
      getMenuItems: () => get().menuItems,

      getMenuItemById: (itemId) => {
        return get().menuItems.find((item) => item.id === itemId);
      },

      getMenuItemsByCategory: (categoryId) => {
        return get().menuItems.filter((item) => item.category === categoryId);
      },

      getAvailableMenuItems: () => {
        return get().menuItems.filter((item) => item.status === 'available');
      },

      getUnavailableMenuItems: () => {
        return get().menuItems.filter((item) => item.status === 'unavailable');
      },

      getLowStockItems: () => {
        return get().menuItems.filter((item) => item.status === 'low_stock');
      },

      getCategoryById: (categoryId) => {
        return get().categories.find((cat) => cat.id === categoryId);
      },

      getCategoryItemCount: (categoryId) => {
        return get().menuItems.filter((item) => item.category === categoryId).length;
      },

      getAllCategoryItemCounts: () => {
        const state = get();
        return state.categories.reduce((counts, category) => {
          counts[category.id] = state.menuItems.filter(
            item => item.category === category.id
          ).length;
          return counts;
        }, {});
      },

      // Search and Filter
      searchMenuItems: (query) => {
        const searchLower = query.toLowerCase().trim();
        return get().menuItems.filter(item =>
          item.name.toLowerCase().includes(searchLower) ||
          (item.description && item.description.toLowerCase().includes(searchLower))
        );
      },

      filterMenuItems: (filters) => {
        let items = get().menuItems;

        if (filters.category && filters.category !== 'all') {
          items = items.filter(item => item.category === filters.category);
        }

        if (filters.status) {
          items = items.filter(item => item.status === filters.status);
        }

        if (filters.search) {
          const searchLower = filters.search.toLowerCase().trim();
          items = items.filter(item =>
            item.name.toLowerCase().includes(searchLower) ||
            (item.description && item.description.toLowerCase().includes(searchLower))
          );
        }

        return items;
      }
    }),
    {
      name: "menu-storage", // localStorage key
      partialize: (state) => ({
        categories: state.categories,
        menuItems: state.menuItems
      }),
    }
  )
);
