import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  first_name: string
  last_name: string
  email?: string
  phone: string
  region: string
  avatar_url?: string
  is_verified: boolean
  created_at: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (phone: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User, token: string) => void
  initializeAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // ✅ Méthode de connexion unifiée
      login: async (phone: string, password: string) => {
        set({ isLoading: true })
        
        try {
          const response = await fetch('http://localhost:8080/api/v1/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phone, password })
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error || 'Erreur de connexion')
          }

          // ✅ Sauvegarder utilisateur et token
          const { user, token } = data.data
          
          // Dans le store
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false
          })

          // Dans localStorage pour persistance
          if (typeof window !== 'undefined') {
            localStorage.setItem('senmarket_token', token)
            localStorage.setItem('senmarket_user', JSON.stringify(user))
          }

        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      // ✅ Déconnexion propre
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
        })

        if (typeof window !== 'undefined') {
          localStorage.removeItem('senmarket_token')
          localStorage.removeItem('senmarket_user')
          // Rediriger vers l'accueil
          window.location.href = '/'
        }
      },

      // ✅ Méthode pour set user/token (depuis inscription ou autre)
      setUser: (user: User, token: string) => {
        set({
          user,
          token,
          isAuthenticated: true
        })

        if (typeof window !== 'undefined') {
          localStorage.setItem('senmarket_token', token)
          localStorage.setItem('senmarket_user', JSON.stringify(user))
        }
      },

      // ✅ Initialisation depuis localStorage
      initializeAuth: () => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('senmarket_token')
          const userStr = localStorage.getItem('senmarket_user')
          
          if (token && userStr) {
            try {
              const user = JSON.parse(userStr)
              set({
                user,
                token,
                isAuthenticated: true
              })
            } catch (error) {
              console.error('Erreur parsing user data:', error)
              // Nettoyer les données corrompues
              localStorage.removeItem('senmarket_token')
              localStorage.removeItem('senmarket_user')
            }
          }
        }
      },
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
)

// Hook d'initialisation pour le layout
export const useAuthInitializer = () => {
  const { initializeAuth } = useAuthStore()
  
  // Initialiser au chargement
  if (typeof window !== 'undefined') {
    initializeAuth()
  }
}