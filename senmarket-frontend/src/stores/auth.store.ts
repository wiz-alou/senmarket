// 🔧 AUTH STORE AVEC DÉBOGAGE POUR IDENTIFIER LE PROBLÈME
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

      // ✅ SYNCHRONISATION AVEC LOCALSTORAGE AMÉLIORÉE
      syncWithLocalStorage: () => {
        if (typeof window === 'undefined') return
        
        try {
          // Récupérer depuis localStorage
          const token = localStorage.getItem('senmarket_token')
          const userStr = localStorage.getItem('senmarket_user')
          
          console.log('🔄 Synchronisation localStorage auth:', {
            hasToken: !!token,
            hasUser: !!userStr,
            tokenPreview: token?.slice(0, 20) + '...'
          })

          if (token && userStr) {
            const user = JSON.parse(userStr)
            console.log('✅ Données auth trouvées, mise à jour store pour:', user.first_name)
            
            set({
              user,
              token,
              isAuthenticated: true,
              isHydrated: true
            })

            // ✅ INITIALISER LES FAVORIS APRÈS L'AUTH
            setTimeout(() => {
              import('./favorites.store').then(({ useFavoritesStore }) => {
                const favStore = useFavoritesStore.getState()
                if (favStore.currentUserId !== user.id) {
                  console.log('📋 Synchronisation favoris après auth pour:', user.first_name)
                  favStore.setCurrentUser(user.id)
                }
              }).catch(err => {
                console.warn('⚠️ Erreur chargement store favoris:', err)
              })
            }, 50)
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
          console.error('❌ Erreur synchronisation localStorage auth:', error)
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isHydrated: true
          })
        }
      },

      // ✅ INITIALISATION AUTH AMÉLIORÉE
      initializeAuth: () => {
        if (get().isHydrated) {
          console.log('✅ Auth déjà initialisé')
          return
        }

        console.log('🚀 Initialisation auth...')
        get().syncWithLocalStorage()
      },

      // ✅ CHARGEMENT DEPUIS STORAGE
      loadUserFromStorage: () => {
        get().syncWithLocalStorage()
      },

      // Setters
      setUser: (user: User) => {
        console.log('👤 Mise à jour utilisateur:', user.first_name)
        set({ user, isAuthenticated: true })
        
        // Sauvegarder dans localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('senmarket_user', JSON.stringify(user))
        }
      },

      setToken: (token: string) => {
        console.log('🔑 Mise à jour token')
        set({ token })
        
        // Sauvegarder dans localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('senmarket_token', token)
        }
      },

      setHydrated: (hydrated: boolean) => {
        set({ isHydrated: hydrated })
      },

      // ✅ LOGIN AVEC DÉBOGAGE COMPLET
      login: async (phone: string, password: string) => {
        try {
          console.log('🔐 Tentative de connexion pour:', phone)
          
          const response = await fetch('http://localhost:8080/api/v1/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phone, password }),
          })

          console.log('📡 Réponse serveur - Status:', response.status, response.statusText)

          const data = await response.json()
          console.log('📦 Données reçues du serveur:', JSON.stringify(data, null, 2))

          if (!response.ok) {
            console.error('❌ Erreur HTTP:', response.status, data)
            throw new Error(data.error || 'Erreur de connexion')
          }

          // ✅ DÉBOGAGE STRUCTURE RÉPONSE
          console.log('🔍 Structure de la réponse:')
          console.log('- data existe:', !!data)
          console.log('- data.data existe:', !!data.data)
          console.log('- data.success:', data.success)
          console.log('- data.message:', data.message)
          
          if (data.data) {
            console.log('- data.data.user existe:', !!data.data.user)
            console.log('- data.data.token existe:', !!data.data.token)
            if (data.data.user) {
              console.log('- User ID:', data.data.user.id)
              console.log('- User name:', data.data.user.first_name)
            }
          }

          // ✅ VÉRIFICATION FLEXIBLE DE LA STRUCTURE
          let user, token

          if (data.data && data.data.user && data.data.token) {
            // Structure: { data: { user, token } }
            user = data.data.user
            token = data.data.token
            console.log('✅ Structure détectée: data.data.{user,token}')
          } else if (data.user && data.token) {
            // Structure: { user, token }
            user = data.user
            token = data.token
            console.log('✅ Structure détectée: data.{user,token}')
          } else {
            console.error('❌ Structure de réponse non reconnue:', data)
            throw new Error('Structure de réponse invalide du serveur')
          }

          if (!user || !token) {
            console.error('❌ Utilisateur ou token manquant:', { user: !!user, token: !!token })
            throw new Error('Données utilisateur incomplètes')
          }

          console.log('✅ Données extraites avec succès:', {
            userId: user.id,
            userName: user.first_name,
            tokenLength: token.length
          })

          // ✅ SAUVEGARDER DONNÉES
          if (typeof window !== 'undefined') {
            localStorage.setItem('senmarket_token', token)
            localStorage.setItem('senmarket_user', JSON.stringify(user))
            console.log('💾 Données sauvées dans localStorage')
          }
          
          // ✅ METTRE À JOUR LE STORE
          set({
            user,
            token,
            isAuthenticated: true,
            isHydrated: true
          })

          console.log('🎉 Store mis à jour avec succès')

          // ✅ INITIALISER LES FAVORIS APRÈS LE LOGIN
          setTimeout(() => {
            import('./favorites.store').then(({ useFavoritesStore }) => {
              const favStore = useFavoritesStore.getState()
              favStore.setCurrentUser(user.id)
              console.log('✅ Favoris initialisés après login pour:', user.first_name)
              
              // Debug en développement
              if (process.env.NODE_ENV === 'development') {
                setTimeout(() => favStore.debugFavorites(), 100)
              }
            }).catch(err => {
              console.warn('⚠️ Erreur initialisation favoris:', err)
            })
          }, 50)

          console.log('🎉 Login terminé avec succès pour:', user.first_name)
          
        } catch (error) {
          console.error('❌ Erreur complète lors de la connexion:', error)
          console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'Pas de stack')
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

      // ✅ LOGOUT AVEC NETTOYAGE FAVORIS
      logout: () => {
        console.log('🚪 Déconnexion...')
        
        // ✅ NETTOYER LOCALSTORAGE ET STORE
        if (typeof window !== 'undefined') {
          localStorage.removeItem('senmarket_token')
          localStorage.removeItem('senmarket_user')
          
          // Nettoyer les favoris de l'utilisateur actuel
          import('./favorites.store').then(({ useFavoritesStore }) => {
            const favStore = useFavoritesStore.getState()
            favStore.setCurrentUser(null)
            console.log('✅ Favoris déconnectés')
          }).catch(err => {
            console.warn('⚠️ Erreur nettoyage favoris:', err)
          })
        }
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isHydrated: true
        })

        console.log('✅ Déconnexion terminée')
      },

      // ✅ CLEAR AUTH
      clearAuth: () => {
        console.log('🧹 Nettoyage complet auth')
        
        if (typeof window !== 'undefined') {
          localStorage.removeItem('senmarket_token')
          localStorage.removeItem('senmarket_user')
        }
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isHydrated: true
        })
      }
    }),
    {
      name: 'senmarket-auth', // ✅ NOM UNIQUE POUR LOCALSTORAGE
      // ✅ GESTION HYDRATATION
      onRehydrateStorage: () => (state) => {
        console.log('🔄 Auth store hydraté depuis localStorage')
        if (state) {
          console.log('- Utilisateur:', state.user?.first_name || 'Aucun')
          console.log('- Authentifié:', state.isAuthenticated)
          
          // Marquer comme hydraté
          state.isHydrated = true
          
          // Synchroniser les favoris si utilisateur connecté
          if (state.isAuthenticated && state.user) {
            setTimeout(() => {
              import('./favorites.store').then(({ useFavoritesStore }) => {
                const favStore = useFavoritesStore.getState()
                if (favStore.currentUserId !== state.user!.id) {
                  console.log('📋 Sync favoris après hydratation pour:', state.user!.first_name)
                  favStore.setCurrentUser(state.user!.id)
                }
              }).catch(err => {
                console.warn('⚠️ Erreur sync favoris après hydratation:', err)
              })
            }, 100)
          }
        }
      },
    }
  )
);