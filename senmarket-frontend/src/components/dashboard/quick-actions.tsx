// ================================================
// QUICK ACTIONS - src/components/dashboard/quick-actions.tsx
// SenMarket - Actions rapides dashboard 🚀
// ================================================

'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Plus,
  Zap,
  BarChart3,
  Settings,
  CreditCard,
  MessageCircle,
  Upload,
  Share2
} from 'lucide-react'

// === COMPOSANT PRINCIPAL ===
export function QuickActions() {
  
  // Configuration des actions rapides
  const quickActions = [
    {
      title: "Publier une Annonce",
      description: "Créez une nouvelle annonce en 2 minutes",
      href: "/listings/create",
      icon: Plus,
      gradient: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      featured: true
    },
    {
      title: "Booster mes Annonces",
      description: "Augmentez votre visibilité",
      href: "/dashboard/boost",
      icon: Zap,
      gradient: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
      badge: "3 disponibles"
    },
    {
      title: "Mes Analytics",
      description: "Analysez vos performances",
      href: "/dashboard/analytics",
      icon: BarChart3,
      gradient: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      title: "Paiements",
      description: "Gérez vos transactions",
      href: "/dashboard/payments",
      icon: CreditCard,
      gradient: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      badge: "2 en attente"
    },
    {
      title: "Messages",
      description: "Répondez à vos clients",
      href: "/dashboard/messages",
      icon: MessageCircle,
      gradient: "from-teal-500 to-teal-600",
      bgColor: "bg-teal-50",
      textColor: "text-teal-600",
      badge: "5 nouveaux"
    },
    {
      title: "Import en Masse",
      description: "Importez plusieurs annonces",
      href: "/dashboard/import",
      icon: Upload,
      gradient: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-600"
    },
    {
      title: "Partager mon Profil",
      description: "Partagez votre boutique",
      href: "/dashboard/share",
      icon: Share2,
      gradient: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-50",
      textColor: "text-pink-600"
    },
    {
      title: "Paramètres",
      description: "Configurez votre compte",
      href: "/dashboard/settings",
      icon: Settings,
      gradient: "from-gray-500 to-gray-600",
      bgColor: "bg-gray-50",
      textColor: "text-gray-600"
    }
  ]

  return (
    <Card className="shadow-sm border-slate-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold">Actions Rapides</h2>
            <p className="text-sm text-muted-foreground">
              Accédez rapidement aux fonctions principales
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            8 actions disponibles
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            
            return (
              <Link 
                key={action.title}
                href={action.href}
                className="group"
              >
                <div className={`
                  relative p-4 rounded-xl border border-slate-200 
                  hover:border-slate-300 hover:shadow-md 
                  transition-all duration-300 
                  ${action.featured ? 'ring-2 ring-blue-200' : ''}
                  group-hover:-translate-y-1
                `}>
                  
                  {/* Badge si présent */}
                  {action.badge && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 text-xs h-5 px-2"
                    >
                      {action.badge}
                    </Badge>
                  )}
                  
                  {/* Featured indicator */}
                  {action.featured && (
                    <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                  )}

                  {/* Icône */}
                  <div className={`
                    w-12 h-12 mx-auto mb-3 rounded-lg ${action.bgColor}
                    flex items-center justify-center
                    group-hover:scale-110 transition-transform duration-300
                  `}>
                    <Icon className={`h-6 w-6 ${action.textColor}`} />
                  </div>

                  {/* Titre */}
                  <h3 className="font-medium text-center text-sm mb-1 group-hover:text-primary transition-colors">
                    {action.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground text-center leading-tight">
                    {action.description}
                  </p>

                  {/* Effet hover gradient */}
                  <div className={`
                    absolute inset-0 rounded-xl opacity-0 
                    bg-gradient-to-br ${action.gradient}
                    group-hover:opacity-5 transition-opacity duration-300
                  `} />
                </div>
              </Link>
            )
          })}
        </div>

        {/* Section conseils */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-sm">💡</span>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-blue-900 mb-1">
                Conseil Pro
              </h4>
              <p className="text-sm text-blue-700">
                Publiez vos annonces entre 19h et 21h pour une visibilité maximale. 
                Les Sénégalais sont plus actifs sur SenMarket à ces heures.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}