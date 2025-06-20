// 🔧 AUTH STORE AVEC HYDRATATION AMÉLIORÉE
// src/stores/auth.store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  phone: string;
  email: string;
  first_name: string;
  last_name: string;
  region: string;
  is_verified: boolean;
  is_premium: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean; // ✅ NOUVEL ÉTAT
}

interface AuthActions {
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  login: (phone: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  clearAuth: () => void;
  loadUserFromStorage: () => void;
  initializeAuth: () => void;
  setHydrated: (hydrated: boolean) => void; // ✅ NOUVELLE ACTION
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // État initial
      user: null,
      token: null,
      isAuthenticated: false,
      isHydrated: false, // ✅ NOUVEL ÉTAT

      // ✅ NOUVELLE ACTION
      setHydrated: (hydrated) => {
        set({ isHydrated: hydrated });
      },

      // ✅ FONCTION POUR CHARGER L'UTILISATEUR DU LOCALSTORAGE
      loadUserFromStorage: () => {
        const state = get();
        console.log('🔄 Chargement utilisateur depuis localStorage...', {
          user: state.user?.first_name,
          token: !!state.token,
          isAuthenticated: state.isAuthenticated
        });

        // Marquer comme hydraté
        set({ isHydrated: true });

        // Si on a un utilisateur et un token, initialiser les favoris
        if (state.user && state.token && typeof window !== 'undefined') {
          import('./favorites.store').then(({ useFavoritesStore }) => {
            const setCurrentUser = useFavoritesStore.getState().setCurrentUser;
            setCurrentUser(state.user!.id);
            console.log('✅ Favoris initialisés pour:', state.user!.first_name);
          });
        }
      },

      // ✅ ALIAS POUR COMPATIBILITÉ
      initializeAuth: () => {
        get().loadUserFromStorage();
      },

      // Actions
      setUser: (user) => {
        set({ user, isAuthenticated: true });
        
        // ✅ INITIALISER LES FAVORIS POUR CE USER
        if (typeof window !== 'undefined') {
          import('./favorites.store').then(({ useFavoritesStore }) => {
            const setCurrentUser = useFavoritesStore.getState().setCurrentUser;
            setCurrentUser(user.id);
            console.log('✅ Favoris configurés pour:', user.first_name);
          });
        }
      },

      setToken: (token) => {
        set({ token });
      },

      login: async (phone, password) => {
        try {
          const response = await fetch('http://localhost:8080/api/v1/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phone, password }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erreur de connexion');
          }

          const data = await response.json();
          
          set({
            user: data.data.user,
            token: data.data.token,
            isAuthenticated: true,
          });

          // ✅ INITIALISER LES FAVORIS
          if (typeof window !== 'undefined') {
            import('./favorites.store').then(({ useFavoritesStore }) => {
              const setCurrentUser = useFavoritesStore.getState().setCurrentUser;
              setCurrentUser(data.data.user.id);
            });
          }

          console.log('✅ Connexion réussie pour:', data.data.user.first_name);
        } catch (error) {
          console.error('❌ Erreur login:', error);
          throw error;
        }
      },

      register: async (userData) => {
        try {
          const response = await fetch('http://localhost:8080/api/v1/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erreur d\'inscription');
          }

          const data = await response.json();
          
          set({
            user: data.data.user,
            token: data.data.token,
            isAuthenticated: true,
          });

          // ✅ INITIALISER LES FAVORIS
          if (typeof window !== 'undefined') {
            import('./favorites.store').then(({ useFavoritesStore }) => {
              const setCurrentUser = useFavoritesStore.getState().setCurrentUser;
              setCurrentUser(data.data.user.id);
            });
          }

          console.log('✅ Inscription réussie pour:', data.data.user.first_name);
        } catch (error) {
          console.error('❌ Erreur register:', error);
          throw error;
        }
      },

      logout: () => {
        console.log('👋 Déconnexion utilisateur');
        
        // ✅ NETTOYER LES FAVORIS
        if (typeof window !== 'undefined') {
          import('./favorites.store').then(({ useFavoritesStore }) => {
            const setCurrentUser = useFavoritesStore.getState().setCurrentUser;
            setCurrentUser(null); // Vider les favoris pour cet utilisateur
          });
        }

        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      clearAuth: () => {
        // ✅ NETTOYER LES FAVORIS
        if (typeof window !== 'undefined') {
          import('./favorites.store').then(({ useFavoritesStore }) => {
            const setCurrentUser = useFavoritesStore.getState().setCurrentUser;
            setCurrentUser(null);
          });
        }

        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'senmarket-auth',
      // ✅ FONCTION APPELÉE APRÈS HYDRATATION DU STORE
      onRehydrateStorage: () => (state) => {
        console.log('🔄 Store auth hydraté');
        
        if (state) {
          // Marquer comme hydraté
          state.setHydrated(true);
          
          if (state.user) {
            console.log('🔄 Store hydraté, initialisation favoris pour:', state.user.first_name);
            // Petite delay pour s'assurer que le DOM est prêt
            setTimeout(() => {
              if (typeof window !== 'undefined') {
                import('./favorites.store').then(({ useFavoritesStore }) => {
                  const setCurrentUser = useFavoritesStore.getState().setCurrentUser;
                  setCurrentUser(state.user!.id);
                });
              }
            }, 50);
          }
        }
      }
    }
  )
);