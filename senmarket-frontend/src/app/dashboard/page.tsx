'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import LogoutButton from '@/components/LogoutButton'

interface DashboardStats {
  total_listings: number
  active_listings: number
  sold_listings: number
  draft_listings: number
  total_views: number
  total_payments: number
  completed_payments: number
  total_revenue: number
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading, logout } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    console.log('🔍 [DASHBOARD] Auth state:', { loading, isAuthenticated, user: user?.first_name })
    
    if (!loading && !isAuthenticated) {
      console.log('🔄 [DASHBOARD] Redirection vers login')
      router.push('/auth/login')
      return
    }

    if (isAuthenticated && user) {
      console.log('✅ [DASHBOARD] Utilisateur connecté:', user.first_name)
      loadDashboardStats()
    }
  }, [loading, isAuthenticated, user, router])

  const loadDashboardStats = async () => {
    try {
      const token = localStorage.getItem('senmarket_token')
      console.log('📊 [DASHBOARD] Chargement stats avec token:', token ? 'OUI' : 'NON')
      
      if (!token) {
        console.log('❌ [DASHBOARD] Pas de token, déconnexion')
        logout()
        return
      }

      const response = await fetch('http://localhost:8080/api/v1/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('📊 [DASHBOARD] Stats response:', response.status)

      if (response.ok) {
        const result = await response.json()
        console.log('📊 [DASHBOARD] Stats data:', result)
        setStats(result.stats || {
          total_listings: 0,
          active_listings: 0,
          sold_listings: 0,
          draft_listings: 0,
          total_views: 0,
          total_payments: 0,
          completed_payments: 0,
          total_revenue: 0
        })
      } else if (response.status === 401) {
        console.log('🔒 [DASHBOARD] Token expiré, déconnexion')
        logout()
      }
    } catch (error) {
      console.error('❌ [DASHBOARD] Erreur chargement stats:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-senegal-green mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Redirection vers la connexion...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec déconnexion */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div 
                className="w-10 h-10 bg-senegal-green rounded-xl flex items-center justify-center cursor-pointer"
                onClick={() => router.push('/')}
              >
                <span className="text-white font-bold">🇸🇳</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Dashboard SenMarket</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Bienvenue, {user?.first_name} {user?.last_name}
              </span>
              
              {/* Bouton déconnexion avec composant réutilisable */}
              <LogoutButton variant="header" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* User Info Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-senegal-green rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  {user?.first_name} {user?.last_name}
                </h2>
                <p className="text-gray-600">{user?.region}</p>
                <p className="text-sm text-gray-500">
                  Membre depuis {new Date(user?.created_at || '').getFullYear()}
                </p>
                
                <div className="flex items-center space-x-4 mt-4">
                  <div className="flex items-center space-x-1">
                    <span className={`w-3 h-3 rounded-full ${user?.is_verified ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-sm">
                      {user?.is_verified ? 'Compte vérifié' : 'En attente de vérification'}
                    </span>
                  </div>
                  
                  {user?.email && (
                    <span className="text-sm text-gray-600">📧 {user.email}</span>
                  )}
                  
                  <span className="text-sm text-gray-600">📞 {user?.phone}</span>
                </div>
              </div>
            </div>
            
            {/* Bouton déconnexion alternatif */}
            <LogoutButton variant="default" className="ml-4" />
          </div>
        </div>

        {/* Stats Grid */}
        {statsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-senegal-green mx-auto"></div>
            <p className="text-gray-600 mt-2">Chargement des statistiques...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              {
                title: 'Total annonces',
                value: stats?.total_listings || 0,
                subtitle: 'Toutes vos annonces',
                color: 'bg-blue-500',
                emoji: '📋'
              },
              {
                title: 'Annonces actives',
                value: stats?.active_listings || 0,
                subtitle: 'En ligne actuellement',
                color: 'bg-green-500',
                emoji: '✅'
              },
              {
                title: 'Total vues',
                value: (stats?.total_views || 0).toLocaleString(),
                subtitle: 'Sur toutes vos annonces',
                color: 'bg-purple-500',
                emoji: '👁️'
              },
              {
                title: 'Revenus total',
                value: `${(stats?.total_revenue || 0).toLocaleString()} FCFA`,
                subtitle: 'Paiements reçus',
                color: 'bg-yellow-500',
                emoji: '💰'
              }
            ].map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm font-medium text-gray-900">{stat.title}</p>
                    <p className="text-xs text-gray-500">{stat.subtitle}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                    <span className="text-white text-xl">{stat.emoji}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/listings/create')}
              className="p-4 border border-gray-200 rounded-lg hover:border-senegal-green hover:bg-senegal-green/5 transition-colors"
            >
              <div className="text-2xl mb-2">➕</div>
              <div className="font-medium">Nouvelle annonce</div>
              <div className="text-sm text-gray-500">Publier un produit</div>
            </button>
            
            <button
              onClick={() => router.push('/listings')}
              className="p-4 border border-gray-200 rounded-lg hover:border-senegal-green hover:bg-senegal-green/5 transition-colors"
            >
              <div className="text-2xl mb-2">📋</div>
              <div className="font-medium">Mes annonces</div>
              <div className="text-sm text-gray-500">Gérer vos produits</div>
            </button>
            
            <button
              onClick={() => router.push('/auth/login')}
              className="p-4 border border-gray-200 rounded-lg hover:border-senegal-green hover:bg-senegal-green/5 transition-colors"
            >
              <div className="text-2xl mb-2">🏠</div>
              <div className="font-medium">Retour accueil</div>
              <div className="text-sm text-gray-500">Page principale</div>
            </button>
          </div>
        </div>

        {/* Quick Logout Section */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-red-900">Déconnexion</h4>
              <p className="text-sm text-red-700">Terminer votre session en toute sécurité</p>
            </div>
            <LogoutButton variant="default" className="bg-red-600 hover:bg-red-700" />
          </div>
        </div>

        {/* Debug Info (développement seulement) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 bg-gray-100 rounded-xl p-6">
            <h4 className="font-medium text-gray-900 mb-2">Debug Info (dev only)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <h5 className="font-medium mb-2">Auth State:</h5>
                <pre className="text-gray-600 overflow-auto">
                  {JSON.stringify({
                    isAuthenticated,
                    loading,
                    userId: user?.id,
                    userName: `${user?.first_name} ${user?.last_name}`,
                    isVerified: user?.is_verified
                  }, null, 2)}
                </pre>
              </div>
              <div>
                <h5 className="font-medium mb-2">Stats:</h5>
                <pre className="text-gray-600 overflow-auto">
                  {JSON.stringify(stats, null, 2)}
                </pre>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-300">
              <h5 className="font-medium mb-2">Actions de debug:</h5>
              <div className="space-x-2">
                <button
                  onClick={() => console.log('Token:', localStorage.getItem('senmarket_token'))}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-xs"
                >
                  Log Token
                </button>
                <button
                  onClick={() => {
                    localStorage.clear()
                    sessionStorage.clear()
                    window.location.reload()
                  }}
                  className="px-3 py-1 bg-red-500 text-white rounded text-xs"
                >
                  Clear Storage
                </button>
                <LogoutButton variant="minimal" className="px-3 py-1 bg-yellow-500 text-white rounded text-xs">
                  Test Logout
                </LogoutButton>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}