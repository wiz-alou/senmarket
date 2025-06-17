// ================================================
// PAGE DASHBOARD - src/app/dashboard/page.tsx
// SenMarket - Tableau de bord utilisateur premium 📊
// ================================================

import { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { RecentListings } from '@/components/dashboard/recent-listings'
import { RecentContacts } from '@/components/dashboard/recent-contacts'
import { PaymentHistory } from '@/components/dashboard/payment-history'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { PerformanceChart } from '@/components/dashboard/performance-chart'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  PlusIcon, 
  TrendingUpIcon, 
  EyeIcon, 
  MessageCircleIcon,
  CreditCardIcon,
  SettingsIcon,
  BellIcon,
  StarIcon
} from 'lucide-react'

// === METADATA ===
export const metadata: Metadata = {
  title: 'Mon Dashboard | SenMarket',
  description: 'Gérez vos annonces, consultez vos statistiques et suivez vos performances sur SenMarket.',
  robots: {
    index: false,
    follow: true,
  },
}

// === COMPOSANT PRINCIPAL ===
export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* === HEADER DASHBOARD === */}
      <div className="bg-white border-b border-slate-200">
        <div className="container-fluid py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Titre et salutation */}
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                Tableau de Bord
              </h1>
              <p className="text-muted-foreground">
                Bonjour Amadou ! Voici un aperçu de votre activité sur SenMarket.
              </p>
            </div>

            {/* Actions rapides */}
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <BellIcon className="w-4 h-4 mr-2" />
                Notifications
                <Badge variant="destructive" className="ml-2 text-xs">3</Badge>
              </Button>
              <Button variant="outline" size="sm">
                <SettingsIcon className="w-4 h-4 mr-2" />
                Paramètres
              </Button>
              <Link href="/listings/create">
                <Button className="btn-ocean">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Nouvelle Annonce
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* === CONTENU PRINCIPAL === */}
      <div className="container-fluid py-8">
        
        {/* === STATISTIQUES PRINCIPALES === */}
        <div className="mb-8">
          <Suspense fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 bg-white rounded-2xl animate-pulse" />
              ))}
            </div>
          }>
            <DashboardStats />
          </Suspense>
        </div>

        {/* === ACTIONS RAPIDES === */}
        <div className="mb-8">
          <Suspense fallback={<LoadingSpinner />}>
            <QuickActions />
          </Suspense>
        </div>

        {/* === GRILLE PRINCIPALE === */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* === COLONNE GAUCHE === */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Graphique de performance */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUpIcon className="w-5 h-5 text-primary" />
                    Performance des Annonces
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-green-600">
                      +12% ce mois
                    </Badge>
                    <Button variant="ghost" size="sm">
                      Voir détails
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Vues, contacts et conversions sur les 30 derniers jours
                </p>
              </CardHeader>
              <CardContent>
                <Suspense fallback={
                  <div className="h-80 bg-slate-100 rounded-lg animate-pulse" />
                }>
                  <PerformanceChart />
                </Suspense>
              </CardContent>
            </Card>

            {/* Mes annonces récentes */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <EyeIcon className="w-5 h-5 text-primary" />
                    Mes Annonces Récentes
                  </CardTitle>
                  <Link href="/dashboard/listings">
                    <Button variant="ghost" size="sm">
                      Voir toutes (15)
                    </Button>
                  </Link>
                </div>
                <p className="text-sm text-muted-foreground">
                  Gérez et suivez vos annonces actives
                </p>
              </CardHeader>
              <CardContent>
                <Suspense fallback={
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-20 bg-slate-100 rounded-lg animate-pulse" />
                    ))}
                  </div>
                }>
                  <RecentListings />
                </Suspense>
              </CardContent>
            </Card>

            {/* Historique des paiements */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCardIcon className="w-5 h-5 text-primary" />
                    Historique des Paiements
                  </CardTitle>
                  <Link href="/dashboard/payments">
                    <Button variant="ghost" size="sm">
                      Voir tout
                    </Button>
                  </Link>
                </div>
                <p className="text-sm text-muted-foreground">
                  Vos transactions et revenus récents
                </p>
              </CardHeader>
              <CardContent>
                <Suspense fallback={
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
                    ))}
                  </div>
                }>
                  <PaymentHistory />
                </Suspense>
              </CardContent>
            </Card>
          </div>

          {/* === COLONNE DROITE === */}
          <div className="space-y-6">
            
            {/* Contacts récents */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircleIcon className="w-5 h-5 text-primary" />
                    Messages Récents
                  </CardTitle>
                  <Badge variant="destructive" className="text-xs">2 nouveaux</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Suspense fallback={
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
                    ))}
                  </div>
                }>
                  <RecentContacts />
                </Suspense>
              </CardContent>
            </Card>

            {/* Niveau de compte */}
            <Card className="shadow-sm border-slate-200 bg-gradient-to-br from-blue-50 to-teal-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <StarIcon className="w-5 h-5 text-yellow-500" />
                  Niveau du Compte
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="relative">
                    <div className="w-20 h-20 mx-auto bg-gradient-atlantic rounded-full flex items-center justify-center text-white text-xl font-bold">
                      VIP
                    </div>
                    <Badge className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs">
                      Premium
                    </Badge>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg">Membre VIP</h3>
                    <p className="text-sm text-muted-foreground">
                      Vous bénéficiez d'avantages exclusifs
                    </p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Annonces gratuites</span>
                      <Badge variant="outline" className="text-green-600">5/5</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Boosts disponibles</span>
                      <Badge variant="outline" className="text-blue-600">3</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Support prioritaire</span>
                      <Badge variant="outline" className="text-purple-600">✓</Badge>
                    </div>
                  </div>

                  <Button size="sm" className="w-full btn-atlantic">
                    Gérer mon abonnement
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Conseils et astuces */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">💡 Conseil du jour</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h4 className="font-medium">
                    Boostez vos ventes avec de meilleures photos
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Les annonces avec 3+ photos de qualité reçoivent 40% plus de contacts.
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    Voir le guide complet
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Statistiques rapides */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">📈 Cette Semaine</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Nouvelles vues</span>
                    </div>
                    <span className="font-semibold text-blue-600">+284</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Nouveaux contacts</span>
                    </div>
                    <span className="font-semibold text-green-600">+12</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-sm">Ventes conclues</span>
                    </div>
                    <span className="font-semibold text-orange-600">3</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">Revenus générés</span>
                    </div>
                    <span className="font-semibold text-purple-600">1,250,000 F</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Objectifs */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">🎯 Objectifs du Mois</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Objectif ventes */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Ventes (5/10)</span>
                      <span className="text-muted-foreground">50%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '50%' }}></div>
                    </div>
                  </div>

                  {/* Objectif revenus */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Revenus (1.8M/3M F)</span>
                      <span className="text-muted-foreground">60%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>

                  {/* Objectif annonces */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Nouvelles annonces (12/15)</span>
                      <span className="text-muted-foreground">80%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                    </div>
                  </div>
                </div>

                <Button size="sm" variant="outline" className="w-full mt-4">
                  Définir nouveaux objectifs
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* === SECTION BOTTOM === */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Raccourcis rapides */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">⚡ Actions Rapides</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/listings/create">
                  <Button size="sm" className="w-full btn-ocean">
                    Créer Annonce
                  </Button>
                </Link>
                <Link href="/dashboard/boost">
                  <Button size="sm" variant="outline" className="w-full">
                    Booster
                  </Button>
                </Link>
                <Link href="/dashboard/analytics">
                  <Button size="sm" variant="outline" className="w-full">
                    Analytics
                  </Button>
                </Link>
                <Link href="/support">
                  <Button size="sm" variant="outline" className="w-full">
                    Support
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Notifications importantes */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                🔔 Notifications
                <Badge variant="destructive" className="text-xs">3</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">
                      Nouveau message reçu
                    </p>
                    <p className="text-xs text-blue-700">
                      Fatou K. s'intéresse à votre iPhone
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900">
                      Paiement reçu
                    </p>
                    <p className="text-xs text-green-700">
                      200 FCFA pour l'annonce Toyota Corolla
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-orange-900">
                      Annonce expire bientôt
                    </p>
                    <p className="text-xs text-orange-700">
                      Appartement Almadies expire dans 3 jours
                    </p>
                  </div>
                </div>
              </div>

              <Button size="sm" variant="outline" className="w-full mt-4">
                Voir toutes les notifications
              </Button>
            </CardContent>
          </Card>

          {/* Support et aide */}
          <Card className="shadow-sm border-slate-200 bg-gradient-to-br from-teal-50 to-blue-50">
            <CardHeader>
              <CardTitle className="text-lg">🎓 Centre d'Aide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Besoin d'aide pour optimiser vos ventes ?
                </p>
                
                <div className="space-y-2">
                  <Link href="/help/selling-guide">
                    <Button size="sm" variant="ghost" className="w-full justify-start text-left">
                      📚 Guide du vendeur
                    </Button>
                  </Link>
                  <Link href="/help/photo-tips">
                    <Button size="sm" variant="ghost" className="w-full justify-start text-left">
                      📷 Conseils photos
                    </Button>
                  </Link>
                  <Link href="/help/pricing">
                    <Button size="sm" variant="ghost" className="w-full justify-start text-left">
                      💰 Stratégies de prix
                    </Button>
                  </Link>
                  <Link href="/help/safety">
                    <Button size="sm" variant="ghost" className="w-full justify-start text-left">
                      🛡️ Sécurité
                    </Button>
                  </Link>
                </div>

                <div className="pt-3 border-t border-teal-200">
                  <div className="flex items-center gap-2 text-sm text-teal-700">
                    <span>💬</span>
                    <span>Support disponible 7j/7</span>
                  </div>
                  <Button size="sm" className="w-full mt-2 btn-atlantic">
                    Contacter le support
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* === BANNIÈRE DE PROMOTION === */}
        <div className="mt-12 bg-gradient-sunset text-white rounded-2xl p-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl lg:text-3xl font-bold mb-4">
              🚀 Boostez vos Ventes avec SenMarket Premium
            </h2>
            <p className="text-lg opacity-90 mb-6">
              Annonces premium, statistiques avancées, support prioritaire et bien plus encore !
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-white/90">
                Découvrir Premium
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Voir les tarifs
              </Button>
            </div>
            
            <div className="mt-6 flex items-center justify-center gap-8 text-sm opacity-80">
              <span>✓ Annonces illimitées</span>
              <span>✓ Analytics avancées</span>
              <span>✓ Support prioritaire</span>
              <span>✓ Badge vérifié</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}