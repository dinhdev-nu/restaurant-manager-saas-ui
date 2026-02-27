import { create } from "zustand"
import { persist } from "zustand/middleware"

/* Example of stored data in localStorage after login:
{
  "isAuthenticated": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzaWQiOiJhYTkyNmIyOC0yMzBjLTQ0Y2QtYmQyNS02ZWVkOTAxZGZhODciLCJzdWIiOiI2OTRlMDYzZDgzMmU1NTE4YmM5MzdjMDciLCJyb2xlcyI6WyJ1c2VyIiwiY3VzdG9tZXIiXSwiaWF0IjoxNzY2NzQzMTcwLCJleHAiOjE3NjY3NDQwNzB9.9hpIkA5myMlpryfIhSocDz4Nx52YtOglrcSUzNSVGTI",
  "user": {
    "_id": "694e063d832e5518bc937c07",
    "user_name": "Định Trương Bá",
    "avatar": "https://lh3.googleusercontent.com/a/ACg8ocLYGxyFTlQI_V8I2Y6fPBucxqY9KMJsZ9AnqZbj5x57hHEJSA=s96-c",
    "email": "23t1020100@husc.edu.vn",
    "isActive": true,
    "roles": ["user", "customer"],
    "providers": [
      {
        "name": "google",
        "providerId": "112542452363454168909",
        "_id": "694e063d832e5518bc937c08"
      }
    ],
    "createdAt": "2025-12-26T03:51:25.246Z",
    "updatedAt": "2025-12-26T03:52:07.535Z",
    "__v": 0
  }
} 
*/

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
                // Clear all localStorage
                localStorage.clear();
                
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