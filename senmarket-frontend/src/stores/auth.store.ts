// 🔧 AUTH STORE AVEC SYNCHRONISATION LOCALSTORAGE COMPLÈTE
// src/stores/auth.store.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  phone: string
  email: string
  first_name: string
  last_name: string
  region: string
  is_verified: boolean
  is_premium: boolean
  avatar_url?: string
  created_at: string
  updated_at: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isHydrated: boolean
}

interface AuthActions {
  setUser: (user: User) => void
  setToken: (token: string) => void
  login: (phone: string, password: string) => Promise<void>
  register: (userData: any) => Promise<void>
  logout: () => void
  clearAuth: () => void
  loadUserFromStorage: () => void
  initializeAuth: () => void
  setHydrated: (hydrated: boolean) => void
  syncWithLocalStorage: () => void
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // État initial
      user: null,
      token: null,
      isAuthenticated: false,
      isHydrated: false,

      // ✅ SYNCHRONISATION AVEC LOCALSTORAGE
      syncWithLocalStorage: () => {
        if (typeof window === 'undefined') return
        
        try {
          // Récupérer depuis localStorage
          const token = localStorage.getItem('senmarket_token')
          const userStr = localStorage.getItem('senmarket_user')
          
          console.log('🔄 Synchronisation localStorage:', {
            hasToken: !!token,
            hasUser: !!userStr,
            tokenPreview: token?.slice(0, 20) + '...'
          })

          if (token && userStr) {
            const user = JSON.parse(userStr)
            console.log('✅ Données trouvées, mise à jour store pour:', user.first_name)
            
            set({
              user,
              token,
              isAuthenticated: true,
              isHydrated: true
            })

            // Initialiser les favoris si disponible
            if (typeof window !== 'undefined') {
              import('./favorites.store').then(({ useFavoritesStore }) => {
                const setCurrentUser = useFavoritesStore.getState().setCurrentUser
                setCurrentUser(user.id)
                console.log('✅ Favoris initialisés après sync pour:', user.first_name)
              }).catch(() => {
                console.log('⚠️ Store favoris non disponible')
              })
            }
          } else {
            console.log('❌ Pas de données auth dans localStorage')
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isHydrated: true
            })
          }
        } catch (error) {
          console.error('❌ Erreur synchronisation localStorage:', error)
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isHydrated: true
          })
        }
      },

      setHydrated: (hydrated) => {
        console.log('🔄 Hydratation marquée:', hydrated)
        set({ isHydrated: hydrated })
      },

      loadUserFromStorage: () => {
        console.log('📦 loadUserFromStorage appelé')
        get().syncWithLocalStorage()
      },

      initializeAuth: () => {
        console.log('🚀 Initialisation auth...')
        get().syncWithLocalStorage()
      },

      // ✅ ACTIONS AVEC SYNCHRONISATION
      setUser: (user) => {
        console.log('👤 setUser appelé pour:', user.first_name)
        
        // Synchroniser avec localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('senmarket_user', JSON.stringify(user))
        }
        
        set({ user, isAuthenticated: true })
        
        // Initialiser les favoris
        if (typeof window !== 'undefined') {
          import('./favorites.store').then(({ useFavoritesStore }) => {
            const setCurrentUser = useFavoritesStore.getState().setCurrentUser
            setCurrentUser(user.id)
            console.log('✅ Favoris configurés pour:', user.first_name)
          }).catch(() => {
            console.log('⚠️ Store favoris non disponible')
          })
        }
      },

      setToken: (token) => {
        console.log('🔑 Token mis à jour')
        
        // Synchroniser avec localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('senmarket_token', token)
        }
        
        set({ token })
      },

      login: async (phone, password) => {
        try {
          console.log('🔐 Tentative de connexion pour:', phone)
          
          const response = await fetch('http://localhost:8080/api/v1/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phone, password }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Erreur de connexion')
          }

          const data = await response.json()
          
          console.log('✅ Réponse login reçue:', {
            userId: data.data.user.id,
            userName: data.data.user.first_name,
            hasToken: !!data.data.token
          })

          // ✅ MISE À JOUR SIMULTANÉE STORE ET LOCALSTORAGE
          const { user, token } = data.data
          
          // LocalStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('senmarket_token', token)
            localStorage.setItem('senmarket_user', JSON.stringify(user))
          }
          
          // Store
          set({
            user,
            token,
            isAuthenticated: true,
            isHydrated: true
          })

          // Favoris
          if (typeof window !== 'undefined') {
            import('./favorites.store').then(({ useFavoritesStore }) => {
              const setCurrentUser = useFavoritesStore.getState().setCurrentUser
              setCurrentUser(user.id)
              console.log('✅ Favoris initialisés après login pour:', user.first_name)
            }).catch(() => {
              console.log('⚠️ Store favoris non disponible')
            })
          }

          console.log('🎉 Login terminé avec succès')
          
        } catch (error) {
          console.error('❌ Erreur lors de la connexion:', error)
          throw error
        }
      },

      register: async (userData) => {
        try {
          console.log('📝 Tentative d\'inscription...')
          
          const response = await fetch('http://localhost:8080/api/v1/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Erreur d\'inscription')
          }

          console.log('✅ Inscription réussie')
          
        } catch (error) {
          console.error('❌ Erreur lors de l\'inscription:', error)
          throw error
        }
      },

      logout: () => {
        console.log('🚪 Déconnexion...')
        
        // ✅ NETTOYER LOCALSTORAGE ET STORE
        if (typeof window !== 'undefined') {
          localStorage.removeItem('senmarket_token')
          localStorage.removeItem('senmarket_user')
          
          // Nettoyer aussi les favoris
          import('./favorites.store').then(({ useFavoritesStore }) => {
            const clearFavorites = useFavoritesStore.getState().clearAllFavorites
            clearFavorites()
            console.log('✅ Favoris nettoyés')
          }).catch(() => {
            console.log('⚠️ Store favoris non disponible')
          })
        }
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          // Garder isHydrated à true
        })
        
        console.log('✅ Déconnexion terminée')
      },

      clearAuth: () => {
        console.log('🧹 Nettoyage complet de l\'auth')
        get().logout()
      },
    }),
    {
      name: 'senmarket-auth',
      
      // ✅ FONCTION D'HYDRATATION AMÉLIORÉE
      onRehydrateStorage: () => (state) => {
        console.log('🌊 Hydratation du store auth...')
        
        if (state) {
          // Forcer une synchronisation avec localStorage après hydratation
          setTimeout(() => {
            console.log('🔄 Post-hydratation: synchronisation localStorage...')
            state.syncWithLocalStorage()
          }, 100)
        } else {
          console.log('❌ Pas de state après hydratation')
        }
      },
      
      // ✅ SÉRIALISATION PERSONNALISÉE
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        // Ne pas persister isHydrated
      }),
    }
  )
)

// ✅ FONCTION D'INITIALISATION GLOBALE
export const initializeAuthStore = () => {
  if (typeof window !== 'undefined') {
    const store = useAuthStore.getState()
    console.log('🚀 Initialisation manuelle du store auth...')
    store.syncWithLocalStorage()
  }
}