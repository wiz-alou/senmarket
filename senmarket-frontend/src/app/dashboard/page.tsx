'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import LogoutButton from '@/components/LogoutButton'

// Interface pour les stats du dashboard - correspond exactement à l'API
interface DashboardStats {
  total_listings: number
  active_listings: number
  sold_listings: number
  draft_listings: number
  total_views: number
  total_payments: number
  completed_payments: number
  total_revenue: number
  total_contacts: number
  unread_contacts: number
}

// Interface complète pour la réponse API
interface DashboardResponse {
  message: string
  user: any
  stats: DashboardStats
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading, logout } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      setStatsLoading(true)
      setError(null)
      
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
        const result: DashboardResponse = await response.json()
        console.log('📊 [DASHBOARD] Stats data complète:', result)
        
        // Utiliser les vraies stats de l'API
        if (result.stats) {
          console.log('✅ [DASHBOARD] Stats reçues:', result.stats)
          setStats(result.stats)
        } else {
          console.log('⚠️ [DASHBOARD] Pas de stats dans la réponse, utilisation des valeurs par défaut')
          setStats({
            total_listings: 0,
            active_listings: 0,
            sold_listings: 0,
            draft_listings: 0,
            total_views: 0,
            total_payments: 0,
            completed_payments: 0,
            total_revenue: 0,
            total_contacts: 0,
            unread_contacts: 0
          })
        }
      } else if (response.status === 401) {
        console.log('🔒 [DASHBOARD] Token expiré, déconnexion')
        logout()
      } else {
        const errorText = await response.text()
        console.error('❌ [DASHBOARD] Erreur API:', response.status, errorText)
        setError(`Erreur ${response.status}: ${errorText}`)
      }
    } catch (error) {
      console.error('❌ [DASHBOARD] Erreur chargement stats:', error)
      setError('Erreur de connexion au serveur')
    } finally {
      setStatsLoading(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Vérification de l'authentification...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
        
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/" className="w-12 h-12 bg-gradient-to-br from-green-600 to-yellow-500 rounded-xl flex items-center justify-center hover:scale-105 transition-transform">
                <span className="text-white text-xl font-bold">🇸🇳</span>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Tableau de Bord
                </h1>
                <p className="text-gray-600">
                  Bienvenue, {user?.first_name} {user?.last_name}
                </p>
              </div>
            </div>
            
            {/* Navigation + User Info */}
            <div className="flex items-center space-x-6">
              {/* Quick Nav */}
              <nav className="hidden md:flex items-center space-x-4">
                <Link
                  href="/listings"
                  className="text-gray-600 hover:text-green-600 transition-colors font-medium"
                >
                  📋 Toutes les annonces
                </Link>
                <Link
                  href="/dashboard/listings"
                  className="text-gray-600 hover:text-green-600 transition-colors font-medium"
                >
                  📝 Mes annonces
                </Link>
              </nav>

              {/* User Info */}
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${user?.is_verified ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span className="text-sm">
                    {user?.is_verified ? 'Compte vérifié' : 'En attente de vérification'}
                  </span>
                </div>
                
                {user?.email && (
                  <span className="text-sm text-gray-600">📧 {user.email}</span>
                )}
                
                <span className="text-sm text-gray-600">📞 {user?.phone}</span>
              </div>
              
              <LogoutButton variant="default" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Message d'erreur */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">⚠️ {error}</p>
            <button 
              onClick={loadDashboardStats}
              className="mt-2 text-red-600 underline hover:text-red-800"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Stats Grid Cliquables */}
        {statsLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">Chargement de vos statistiques...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              {
                title: 'Total Annonces',
                value: stats?.total_listings || 0,
                subtitle: 'Toutes vos annonces',
                color: 'bg-blue-500',
                emoji: '📋',
                details: `${stats?.draft_listings || 0} brouillons`,
                href: '/dashboard/listings'
              },
              {
                title: 'Annonces Actives',
                value: stats?.active_listings || 0,
                subtitle: 'En ligne actuellement',
                color: 'bg-green-500',
                emoji: '✅',
                details: `${stats?.sold_listings || 0} vendues`,
                href: '/dashboard/listings?status=active'
              },
              {
                title: 'Total Vues',
                value: (stats?.total_views || 0).toLocaleString(),
                subtitle: 'Sur toutes vos annonces',
                color: 'bg-purple-500',
                emoji: '👁️',
                details: 'Visibilité',
                href: '/dashboard/listings'
              },
              {
                title: 'Revenus Total',
                value: `${(stats?.total_revenue || 0).toLocaleString()} FCFA`,
                subtitle: `${stats?.completed_payments || 0} paiements`,
                color: 'bg-yellow-500',
                emoji: '💰',
                details: 'Orange Money',
                href: '/dashboard/payments'
              }
            ].map((stat, index) => (
              <Link
                key={index}
                href={stat.href}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform`}>
                    {stat.emoji}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                      {stat.value}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">{stat.title}</h3>
                  <p className="text-sm text-gray-600">{stat.subtitle}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.details}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Actions rapides avec vrais liens */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Actions Rapides</h3>
            <div className="space-y-3">
              <Link
                href="/listings/create"
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium text-center block"
              >
                ➕ Créer une annonce
              </Link>
              <Link
                href="/dashboard/listings"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-center block"
              >
                📝 Mes annonces
              </Link>
              <Link
                href="/dashboard/payments"
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium text-center block"
              >
                💳 Historique paiements
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Contacts & Messages</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total messages</span>
                <span className="font-semibold text-lg">{stats?.total_contacts || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Non lus</span>
                <span className="font-semibold text-lg text-red-600">{stats?.unread_contacts || 0}</span>
              </div>
              
              {stats && stats.unread_contacts > 0 && (
                <Link
                  href="/dashboard/messages"
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-center block text-sm"
                >
                  📬 Voir les messages ({stats.unread_contacts})
                </Link>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Performance</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Taux de vente</span>
                <span className="font-semibold text-lg text-green-600">
                  {stats?.total_listings ? Math.round((stats.sold_listings / stats.total_listings) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Vues par annonce</span>
                <span className="font-semibold text-lg text-purple-600">
                  {stats?.active_listings ? Math.round(stats.total_views / stats.active_listings) : 0}
                </span>
              </div>
              
              {/* Progress bar pour le taux de vente */}
              <div className="mt-3">
                <div className="text-xs text-gray-500 mb-1">Progression des ventes</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${stats?.total_listings ? Math.min((stats.sold_listings / stats.total_listings) * 100, 100) : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation rapide vers autres sections */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">Navigation Rapide</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/listings"
              className="flex flex-col items-center p-4 rounded-lg bg-gray-50 hover:bg-green-50 hover:text-green-600 transition-colors group"
            >
              <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">🏪</span>
              <span className="text-sm font-medium text-center">Marketplace</span>
            </Link>
            
            <Link
              href="/dashboard/listings?status=draft"
              className="flex flex-col items-center p-4 rounded-lg bg-gray-50 hover:bg-yellow-50 hover:text-yellow-600 transition-colors group"
            >
              <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">📝</span>
              <span className="text-sm font-medium text-center">Brouillons</span>
              {stats && stats.draft_listings > 0 && (
                <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded-full mt-1">
                  {stats.draft_listings}
                </span>
              )}
            </Link>
            
            <Link
              href="/dashboard/analytics"
              className="flex flex-col items-center p-4 rounded-lg bg-gray-50 hover:bg-purple-50 hover:text-purple-600 transition-colors group"
            >
              <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">📊</span>
              <span className="text-sm font-medium text-center">Analytics</span>
            </Link>
            
            <Link
              href="/dashboard/settings"
              className="flex flex-col items-center p-4 rounded-lg bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-colors group"
            >
              <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">⚙️</span>
              <span className="text-sm font-medium text-center">Paramètres</span>
            </Link>
          </div>
        </div>

        {/* Debug Info - Seulement en développement */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-gray-100 rounded-lg p-4 text-xs">
            <h4 className="font-bold mb-2">🔧 Debug Info (Dev seulement):</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium mb-2">User:</h5>
                <pre className="text-gray-600 overflow-auto">
                  {JSON.stringify({
                    loading,
                    isAuthenticated,
                    userId: user?.id,
                    userName: `${user?.first_name} ${user?.last_name}`,
                    isVerified: user?.is_verified,
                    phone: user?.phone
                  }, null, 2)}
                </pre>
              </div>
              <div>
                <h5 className="font-medium mb-2">Stats API:</h5>
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
                  onClick={loadDashboardStats}
                  className="px-3 py-1 bg-green-500 text-white rounded text-xs"
                >
                  Recharger Stats
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
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}