import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  Zap, 
  Users, 
  TrendingUp,
  CheckCircle,
  Star,
  Building,
  ArrowRight
} from 'lucide-react'

export function HeroSection() {
  const stats = [
    { label: 'Annonces vérifiées', value: '8,500+', icon: CheckCircle },
    { label: 'Utilisateurs actifs', value: '15,000+', icon: Users },
    { label: 'Transactions sécurisées', value: '25,000+', icon: Shield },
    { label: 'Taux de satisfaction', value: '98%', icon: Star },
  ]

  const trustBadges = [
    { name: 'Orange Money', logo: '🟠' },
    { name: 'Wave', logo: '🌊' },
    { name: 'Free Money', logo: '💳' },
    { name: 'Visa/Mastercard', logo: '💎' },
  ]

  return (
    <section className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-white py-20 lg:py-28 overflow-hidden">
      
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-200 rounded-full opacity-10 animate-float"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-orange-200 rounded-full opacity-10 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-100 to-orange-100 rounded-full opacity-5"></div>
      </div>

      <div className="container-fluid relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Contenu principal */}
          <div className="space-y-8">
            
            {/* Badge de confiance */}
            <div className="flex items-center space-x-4">
              <Badge className="bg-green-100 text-green-800 border-green-200 px-4 py-2">
                <CheckCircle className="h-4 w-4 mr-2" />
                Plateforme certifiée et sécurisée
              </Badge>
              <div className="flex items-center space-x-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                ))}
                <span className="text-sm text-slate-600 ml-2">4.9/5 (2,847 avis)</span>
              </div>
            </div>

            {/* Titre principal */}
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 leading-tight">
                Le marketplace
                <span className="block text-gradient-ocean">professionnel</span>
                <span className="block">du Sénégal</span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-slate-600 leading-relaxed max-w-2xl">
                Achetez, vendez et échangez en toute sécurité sur la première plateforme 
                e-commerce certifiée du Sénégal. Plus de <span className="font-semibold text-blue-600">8,500 annonces vérifiées</span>.
              </p>
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl">
                <Building className="mr-2 h-5 w-5" />
                Publier une annonce
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button size="lg" variant="outline" className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-4 text-lg font-semibold rounded-xl">
                <TrendingUp className="mr-2 h-5 w-5" />
                Explorer le marketplace
              </Button>
            </div>

            {/* Méthodes de paiement */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                Paiements sécurisés acceptés
              </p>
              <div className="flex items-center space-x-6">
                {trustBadges.map((badge) => (
                  <div key={badge.name} className="flex items-center space-x-2 bg-white rounded-lg px-3 py-2 border border-gray-200 shadow-sm">
                    <span className="text-lg">{badge.logo}</span>
                    <span className="text-sm font-medium text-slate-600">{badge.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section visuelle */}
          <div className="relative">
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
              
              {/* En-tête de la card */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  Plateforme de confiance
                </h3>
                <p className="text-slate-600">
                  Rejoignez plus de 15,000 utilisateurs qui nous font confiance
                </p>
              </div>

              {/* Statistiques en grille */}
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat, index) => {
                  const IconComponent = stat.icon
                  return (
                    <div key={index} className="text-center p-4 bg-slate-50 rounded-xl">
                      <IconComponent className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                      <div className="text-sm text-slate-600 font-medium">{stat.label}</div>
                    </div>
                  )
                })}
              </div>

              {/* Testimonial */}
              <div className="mt-8 pt-8 border-t border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold">
                    AM
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Amadou Diallo</div>
                    <div className="text-sm text-slate-600">CEO, TechSen Solutions</div>
                  </div>
                </div>
                <blockquote className="mt-4 text-slate-700 italic">
                  "SenMarket a transformé notre façon de faire du business au Sénégal. 
                  Une plateforme sérieuse et sécurisée."
                </blockquote>
              </div>
            </div>

            {/* Badge de certification flottant */}
            <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
              ✓ Certifié sécurisé
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}