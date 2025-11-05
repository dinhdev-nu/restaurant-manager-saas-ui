import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useAuthStore = create(
    persist(
        (set, get) => ({
            // State
            user: null,
            token: null,
            isAuthenticated: false,
            selectedRestaurant: null,

            // Actions
            login: (userData, tokenData) => {
                set({
                    user: userData,
                    token: tokenData,
                    isAuthenticated: true
                })
            },

            logout: () => {
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    selectedRestaurant: null
                })
            },

            updateUser: (userData) => {
                set({ user: userData })
            },

            selectRestaurant: (restaurant) => {
                set({ selectedRestaurant: restaurant })
            },

            clearRestaurant: () => {
                set({ selectedRestaurant: null })
            },

            // Getters
            getUser: () => get().user,
            getToken: () => get().token,
            getSelectedRestaurant: () => get().selectedRestaurant,
        }),
        {
            name: 'auth-storage', // localStorage key
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
                selectedRestaurant: state.selectedRestaurant,
            }),
        }
    )
)