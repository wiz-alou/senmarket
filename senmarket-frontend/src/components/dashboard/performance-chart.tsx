// ================================================
// PERFORMANCE CHART - src/components/dashboard/performance-chart.tsx
// SenMarket - Graphique de performance premium 📈
// ================================================

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// === INTERFACE DONNÉES ===
interface ChartData {
  date: string
  vues: number
  contacts: number
  conversions: number
}

// === COMPOSANT PRINCIPAL ===
export function PerformanceChart() {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d')
  const [data, setData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)

  // Simulation de données pour les 30 derniers jours
  useEffect(() => {
    const generateData = () => {
      const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90
      const data: ChartData[] = []
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        
        // Génération de données réalistes avec variations
        const baseViews = 120 + Math.random() * 100
        const weekendFactor = [0, 6].includes(date.getDay()) ? 0.7 : 1
        const vues = Math.floor(baseViews * weekendFactor)
        const contacts = Math.floor(vues * (0.05 + Math.random() * 0.05))
        const conversions = Math.floor(contacts * (0.1 + Math.random() * 0.15))
        
        data.push({
          date: date.toISOString().split('T')[0],
          vues,
          contacts,
          conversions
        })
      }
      
      return data
    }

    setLoading(true)
    setTimeout(() => {
      setData(generateData())
      setLoading(false)
    }, 500)
  }, [timeframe])

  // Calcul des totaux
  const totals = data.reduce((acc, day) => ({
    vues: acc.vues + day.vues,
    contacts: acc.contacts + day.contacts,
    conversions: acc.conversions + day.conversions
  }), { vues: 0, contacts: 0, conversions: 0 })

  // Calcul du taux de conversion
  const conversionRate = totals.contacts > 0 ? (totals.conversions / totals.contacts * 100) : 0

  if (loading) {
    return (
      <div className="h-80 bg-slate-100 rounded-lg animate-pulse flex items-center justify-center">
        <div className="text-slate-400">Chargement des données...</div>
      </div>
    )
  }

  // Trouver les valeurs max pour la normalisation
  const maxVues = Math.max(...data.map(d => d.vues))
  const maxContacts = Math.max(...data.map(d => d.contacts))

  return (
    <div className="space-y-6">
      
      {/* === CONTRÔLES === */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {(['7d', '30d', '90d'] as const).map((period) => (
            <Button
              key={period}
              variant={timeframe === period ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeframe(period)}
            >
              {period === '7d' ? '7 jours' : period === '30d' ? '30 jours' : '3 mois'}
            </Button>
          ))}
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Vues</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Contacts</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span>Conversions</span>
          </div>
        </div>
      </div>

      {/* === MÉTRIQUES RÉSUMÉES === */}
      <div className="grid grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{totals.vues.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Total Vues</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{totals.contacts}</div>
          <div className="text-sm text-muted-foreground">Total Contacts</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{totals.conversions}</div>
          <div className="text-sm text-muted-foreground">Conversions</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{conversionRate.toFixed(1)}%</div>
          <div className="text-sm text-muted-foreground">Taux Conversion</div>
        </div>
      </div>

      {/* === GRAPHIQUE SIMPLE === */}
      <div className="relative h-64 bg-white rounded-lg border border-slate-200 p-4">
        <div className="h-full flex items-end justify-between gap-1">
          {data.map((day, index) => {
            const vuesHeight = (day.vues / maxVues) * 100
            const contactsHeight = (day.contacts / maxContacts) * 100 * 0.8 // Scale down pour visibilité
            
            return (
              <div key={day.date} className="flex flex-col items-center group relative flex-1">
                
                {/* Tooltip au hover */}
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  <div className="font-medium">{new Date(day.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</div>
                  <div>Vues: {day.vues}</div>
                  <div>Contacts: {day.contacts}</div>
                  <div>Conversions: {day.conversions}</div>
                </div>
                
                {/* Barres du graphique */}
                <div className="flex items-end gap-0.5 h-full">
                  
                  {/* Barre des vues */}
                  <div 
                    className="w-2 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors duration-200"
                    style={{ height: `${vuesHeight}%` }}
                  />
                  
                  {/* Barre des contacts */}
                  <div 
                    className="w-2 bg-green-500 rounded-t hover:bg-green-600 transition-colors duration-200"
                    style={{ height: `${contactsHeight}%` }}
                  />
                  
                  {/* Point pour les conversions */}
                  {day.conversions > 0 && (
                    <div 
                      className="w-1 bg-orange-500 rounded-full"
                      style={{ height: `${(day.conversions / 5) * 100}%`, minHeight: '4px' }}
                    />
                  )}
                </div>
                
                {/* Label de date (affiché partiellement) */}
                {(index % Math.ceil(data.length / 8) === 0) && (
                  <div className="text-xs text-muted-foreground mt-2 transform -rotate-45 origin-left">
                    {new Date(day.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* === INSIGHTS === */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Meilleur jour */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium text-blue-900">Meilleur Jour (Vues)</span>
          </div>
          {(() => {
            const bestDay = data.reduce((max, day) => day.vues > max.vues ? day : max, data[0])
            return (
              <div>
                <div className="text-lg font-bold text-blue-600">{bestDay?.vues} vues</div>
                <div className="text-sm text-blue-700">
                  {bestDay && new Date(bestDay.date).toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'short' 
                  })}
                </div>
              </div>
            )
          })()}
        </div>

        {/* Tendance */}
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-green-900">Tendance</span>
          </div>
          {(() => {
            const firstWeekAvg = data.slice(0, 7).reduce((sum, day) => sum + day.vues, 0) / 7
            const lastWeekAvg = data.slice(-7).reduce((sum, day) => sum + day.vues, 0) / 7
            const trend = ((lastWeekAvg - firstWeekAvg) / firstWeekAvg) * 100
            const isPositive = trend > 0
            
            return (
              <div>
                <div className={`text-lg font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? '+' : ''}{trend.toFixed(1)}%
                </div>
                <div className="text-sm text-green-700">
                  {isPositive ? 'En hausse' : 'En baisse'} cette semaine
                </div>
              </div>
            )
          })()}
        </div>

        {/* Performance */}
        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span className="text-sm font-medium text-orange-900">Performance</span>
          </div>
          <div>
            <div className="text-lg font-bold text-orange-600">
              {conversionRate > 5 ? 'Excellent' : conversionRate > 2 ? 'Bon' : 'À améliorer'}
            </div>
            <div className="text-sm text-orange-700">
              Taux de conversion: {conversionRate.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* === CONSEILS === */}
      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm">📊</span>
          </div>
          <div>
            <h4 className="font-medium text-purple-900 mb-1">
              Analyse de Performance
            </h4>
            <p className="text-sm text-purple-700 mb-3">
              {conversionRate > 5 
                ? "Excellent taux de conversion ! Continuez sur cette lancée."
                : conversionRate > 2 
                ? "Bon taux de conversion. Essayez d'améliorer la qualité de vos photos."
                : "Taux de conversion à améliorer. Révisez vos prix et descriptions."
              }
            </p>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">
                {data.filter(d => [0, 6].includes(new Date(d.date).getDay())).length > 0 && "Weekends moins actifs"}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {(() => {
                  const avgDailyViews = totals.vues / data.length
                  return avgDailyViews > 150 ? "Forte visibilité" : avgDailyViews > 100 ? "Bonne visibilité" : "Visibilité à améliorer"
                })()}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}