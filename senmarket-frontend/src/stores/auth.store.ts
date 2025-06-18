import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/lib/api/types';
import { authService } from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (phone: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  loadUserFromStorage: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // État initial
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) => {
        set({ 
          user, 
          isAuthenticated: !!user 
        });
        
        // Synchroniser avec localStorage
        if (typeof window !== 'undefined') {
          if (user) {
            localStorage.setItem('senmarket_user', JSON.stringify(user));
          } else {
            localStorage.removeItem('senmarket_user');
          }
        }
      },

      setToken: (token) => {
        set({ token, isAuthenticated: !!token });
        
        // Synchroniser avec localStorage
        if (typeof window !== 'undefined') {
          if (token) {
            localStorage.setItem('senmarket_token', token);
          } else {
            localStorage.removeItem('senmarket_token');
          }
        }
      },

      login: async (phone, password) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authService.login({ phone, password });
          
          get().setUser(response.user);
          get().setToken(response.token);
          
          set({ isLoading: false });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Erreur de connexion' 
          });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authService.register(data);
          
          get().setUser(response.user);
          get().setToken(response.token);
          
          set({ isLoading: false });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Erreur d\'inscription' 
          });
          throw error;
        }
      },

      logout: () => {
        authService.logout();
        get().setUser(null);
        get().setToken(null);
        set({ error: null });
      },

      loadUserFromStorage: () => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('senmarket_token');
          const userStr = localStorage.getItem('senmarket_user');
          
          if (token && userStr) {
            try {
              const user = JSON.parse(userStr);
              set({ 
                user, 
                token, 
                isAuthenticated: true 
              });
            } catch (error) {
              // Nettoyer les données corrompues
              localStorage.removeItem('senmarket_token');
              localStorage.removeItem('senmarket_user');
            }
          }
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'senmarket-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);