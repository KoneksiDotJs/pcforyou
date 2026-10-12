import { create } from 'zustand';
import type { User } from '../types';
import { apiClient } from '../api/client';

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void
  login: (user: User) => void;
  logout: () => void;
  isAdmin: () => boolean;
  checkUserAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),
  login: (user) => set({ user }),
  logout: () => set({ user: null }),
  isAdmin: () => get().user?.role === 'ADMIN',
  checkUserAuth: async () => {
    try {
      const response = await apiClient.get('/auth/me');
      const userData = response.data.data;
      set({ user: userData });
    } catch (error) {
      // Jika token invalid/expired, bersihkan state
      set({ user: null });
    }
  },
}));