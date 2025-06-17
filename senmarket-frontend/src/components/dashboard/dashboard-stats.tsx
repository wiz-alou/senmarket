// ================================================
// DASHBOARD STATS - src/components/dashboard/dashboard-stats.tsx
// SenMarket - Statistiques avec animations premium 📊
// ================================================

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Eye, 
  MessageCircle, 
  DollarSign, 
  TrendingUp,
  ArrowUpIcon,
  ArrowDownIcon
} from 'lucide-react'

// === INTERFACE STATS ===
interface DashboardStatsData {
  totalListings: number
  totalViews: number
  totalContacts: number
  totalRevenue: number
  trends: {
    listings: number
    views: number
    contacts: number
    revenue: number
  }
}

// === COMPOSANT PRINCIPAL ===
export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStatsData | null>(null)
  const [loading, setLoading] = useState(true)

  // Simulation de chargement des données
  useEffect(() => {
    const fetchStats = async () => {
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setStats({
        totalListings: 15,
        totalViews: 12847,
        totalContacts: 89,
        totalRevenue: 1250000,
        trends: {
          listings: 12.5,
          views: 23.1,
          contacts: -5.2,
          revenue: 18.7
        }
      })
      setLoading(false)
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-white rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (!stats) return null

  // Configuration des cartes de statistiques
  const statCards = [
    {
      title: "Mes Annonces",
      value: stats.totalListings,
      unit: "",
      trend: stats.trends.listings,
      icon: Eye,
      gradient: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      title: "Total des Vues",
      value: stats.totalViews,
      unit: "",
      trend: stats.trends.views,
      icon: TrendingUp,
      gradient: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      title: "Contacts Reçus",
      value: stats.totalContacts,
      unit: "",
      trend: stats.trends.contacts,
      icon: MessageCircle,
      gradient: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600"
    },
    {
      title: "Revenus Générés",
      value: stats.totalRevenue,
      unit: "FCFA",
      trend: stats.trends.revenue,
      icon: DollarSign,
      gradient: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        const isPositiveTrend = stat.trend > 0
        const TrendIcon = isPositiveTrend ? ArrowUpIcon : ArrowDownIcon
        
        return (
          <Card 
            key={stat.title}
            className="relative overflow-hidden shadow-sm border-slate-200 hover:shadow-lg transition-all duration-300 group"
          >
            {/* Gradient de fond animé */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
            
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.textColor}`} />
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                {/* Valeur principale */}
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-bold">
                    {stat.title === "Revenus Générés" 
                      ? `${(stat.value / 1000).toFixed(0)}K` 
                      : stat.value.toLocaleString()
                    }
                  </div>
                  {stat.unit && (
                    <span className="text-sm text-muted-foreground">{stat.unit}</span>
                  )}
                </div>

                {/* Tendance */}
                <div className="flex items-center justify-between">
                  <Badge 
                    variant="outline" 
                    className={`flex items-center gap-1 ${
                      isPositiveTrend 
                        ? 'text-green-600 border-green-200' 
                        : 'text-red-600 border-red-200'
                    }`}
                  >
                    <TrendIcon className="h-3 w-3" />
                    {Math.abs(stat.trend).toFixed(1)}%
                  </Badge>
                  
                  <span className="text-xs text-muted-foreground">
                    vs mois dernier
                  </span>
                </div>

                {/* Barre de progression (pour visualiser la tendance) */}
                <div className="w-full bg-slate-100 rounded-full h-1">
                  <div 
                    className={`h-1 rounded-full bg-gradient-to-r ${stat.gradient} transition-all duration-1000 ease-out`}
                    style={{ 
                      width: `${Math.min(Math.abs(stat.trend) * 2, 100)}%`,
                      animationDelay: `${index * 200}ms`
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}