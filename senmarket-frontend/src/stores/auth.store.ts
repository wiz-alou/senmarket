// 🔧 AUTH STORE AVEC HYDRATATION ET SYNCHRONISATION CORRIGÉES
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
  isHydrated: boolean;
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
  setHydrated: (hydrated: boolean) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // État initial
      user: null,
      token: null,
      isAuthenticated: false,
      isHydrated: false,

      // ✅ NOUVELLE ACTION POUR MARQUER L'HYDRATATION
      setHydrated: (hydrated) => {
        console.log('🔄 Hydratation marquée:', hydrated);
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
        console.log('👤 setUser appelé pour:', user.first_name);
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
        console.log('🔑 Token mis à jour');
        set({ token });
      },

      login: async (phone, password) => {
        try {
          console.log('🔐 Tentative de connexion pour:', phone);
          
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
          
          console.log('✅ Réponse login reçue:', {
            userId: data.data.user.id,
            userName: data.data.user.first_name,
            hasToken: !!data.data.token
          });
          
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
              console.log('✅ Favoris initialisés après login pour:', data.data.user.first_name);
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
          console.log('📝 Tentative d\'inscription pour:', userData.phone);
          
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
          
          console.log('✅ Réponse register reçue:', {
            userId: data.data.user.id,
            userName: data.data.user.first_name
          });
          
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
              console.log('✅ Favoris initialisés après register pour:', data.data.user.first_name);
            });
          }

          console.log('✅ Inscription réussie pour:', data.data.user.first_name);
        } catch (error) {
          console.error('❌ Erreur register:', error);
          throw error;
        }
      },

      logout: () => {
        console.log('🚪 Déconnexion utilisateur');
        
        // ✅ NETTOYER LES FAVORIS AVANT LA DÉCONNEXION
        if (typeof window !== 'undefined') {
          import('./favorites.store').then(({ useFavoritesStore }) => {
            const setCurrentUser = useFavoritesStore.getState().setCurrentUser;
            setCurrentUser(null);
            console.log('🧹 Favoris nettoyés lors de la déconnexion');
          });
        }
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        
        console.log('✅ Déconnexion terminée');
      },

      clearAuth: () => {
        console.log('🧹 Nettoyage complet de l\'auth');
        get().logout();
      },
    }),
    {
      name: 'senmarket-auth',
      // ✅ FONCTION D'HYDRATATION PERSONNALISÉE
      onRehydrateStorage: () => (state) => {
        console.log('🌊 Hydratation du store auth...');
        if (state) {
          // Marquer comme hydraté après la restauration
          state.setHydrated(true);
          console.log('✅ Store auth hydraté avec utilisateur:', state.user?.first_name || 'aucun');
          
          // Si on a un utilisateur, initialiser les favoris
          if (state.user && typeof window !== 'undefined') {
            import('./favorites.store').then(({ useFavoritesStore }) => {
              const setCurrentUser = useFavoritesStore.getState().setCurrentUser;
              setCurrentUser(state.user!.id);
              console.log('✅ Favoris initialisés après hydratation pour:', state.user!.first_name);
            });
          }
        }
      },
      // ✅ SÉRIALISATION PERSONNALISÉE
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        // Ne pas persister isHydrated - sera défini au chargement
      }),
    }
  )
);

// ✅ FONCTION D'INITIALISATION POUR LE LAYOUT
export const initializeAuthStore = () => {
  if (typeof window !== 'undefined') {
    const store = useAuthStore.getState();
    if (!store.isHydrated) {
      console.log('🚀 Initialisation manuelle du store auth...');
      store.loadUserFromStorage();
    }
  }
};