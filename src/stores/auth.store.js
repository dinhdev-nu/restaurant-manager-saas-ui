import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useAuthStore = create(
    persist(
        (set, get) => ({
            // State
            user: null,
            token: null,
            isAuthenticated: false,

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
                    isAuthenticated: false
                })
            },

            setToken: (tokenData) => {
                set({ token: tokenData })
            },

            updateUser: (userData) => {
                set({ user: userData })
            },

            addRoleToUser: (role) => {
                set((state) => {
                    if (!state.user) return state;
                    const currentRoles = state.user.roles || [];
                    if (currentRoles.includes(role)) return state;
                    
                    return {
                        user: {
                            ...state.user,
                            roles: [...currentRoles, role]
                        }
                    };
                });
            },

            // Getters
            getUser: () => get().user,
            getToken: () => get().token,
        }),
        {
            name: 'auth-storage', // localStorage key
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
)