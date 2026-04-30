import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      
      login: (data) => set({
        token: data.token,
        user: {
          id: data.userId,
          name: data.name,
          role: data.role,
          profile: data.profile
        },
        isAuthenticated: true
      }),
      
      logout: () => set({
        token: null,
        user: null,
        isAuthenticated: false
      }),
      
      updateProfile: (profile) => set((state) => ({
        user: { ...state.user, profile }
      }))
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;
