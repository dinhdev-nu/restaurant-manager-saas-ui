import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useRestaurantStore = create(
  persist(
    (set, get) => ({
      // State
      restaurants: [],
      selectedRestaurant: null,
      
      // Actions
      addRestaurant: (restaurantData) => {
        const newRestaurant = {
          ...restaurantData,
          _id: restaurantData._id || `restaurant_${Date.now()}`,
          createdAt: restaurantData.createdAt || new Date().toISOString(),
          updatedAt: restaurantData.updatedAt || new Date().toISOString()
        };

        set((state) => ({
          restaurants: [...state.restaurants, newRestaurant]
        }));

        return newRestaurant;
      },

      updateRestaurant: (restaurantId, updates) => {
        set((state) => ({
          restaurants: state.restaurants.map((r) =>
            r._id === restaurantId 
              ? { ...r, ...updates, updatedAt: new Date().toISOString() } 
              : r
          ),
        }));
      },

      deleteRestaurant: (restaurantId) => {
        set((state) => ({
          restaurants: state.restaurants.filter((r) => r._id !== restaurantId)
        }));
      },

      setRestaurants: (restaurants) => {
        set({ restaurants });
      },

      setRestaurantsFromMetadata: (metadata) => {
        // Process metadata to extract restaurants with role info
        const restaurantsMap = new Map();

        // Process each role category (owner, manager, staff)
        Object.entries(metadata).forEach(([role, staffList]) => {
          staffList.forEach((staff) => {
            const restaurant = staff.restaurantId;
            if (restaurant && restaurant._id) {
              const restaurantId = restaurant._id;
              
              // Add or update restaurant with role info
              if (!restaurantsMap.has(restaurantId)) {
                restaurantsMap.set(restaurantId, {
                  ...restaurant,
                  role: staff.roleDisplay || staff.role,
                  staffInfo: {
                    employeeId: staff.employeeId,
                    shift: staff.shift,
                    workingHours: staff.workingHours,
                    joinDate: staff.joinDate,
                    isActive: staff.isActive,
                  }
                });
              }
            }
          });
        });

        const restaurants = Array.from(restaurantsMap.values());
        set({ restaurants });
        return restaurants;
      },

      // Getters
      getAllRestaurants: () => get().restaurants,

      getRestaurantById: (restaurantId) => {
        return get().restaurants.find((r) => r._id === restaurantId);
      },

      getRestaurantCount: () => {
        return get().restaurants.length;
      },

      // Selected Restaurant Actions
      selectRestaurant: (restaurant) => {
        set({ selectedRestaurant: restaurant });
      },

      clearRestaurant: () => {
        set({ selectedRestaurant: null });
      },

      getSelectedRestaurant: () => get().selectedRestaurant,
    }),
    {
      name: "restaurant-storage",
      partialize: (state) => ({
        restaurants: state.restaurants,
        selectedRestaurant: state.selectedRestaurant,
      }),
    }
  )
);
