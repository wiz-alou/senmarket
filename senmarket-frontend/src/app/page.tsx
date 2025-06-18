import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Star, 
  TrendingUp, 
  Shield, 
  Zap, 
  Heart,
  MapPin,
  Clock,
  Users,
  ShoppingBag,
  Award
} from 'lucide-react'

export default function HomePage() {
  // Données de démonstration
  const categories = [
    { name: "Véhicules", icon: "🚗", count: 1250, trending: true },
    { name: "Immobilier", icon: "🏠", count: 890, trending: false },
    { name: "Électronique", icon: "📱", count: 2100, trending: true },
    { name: "Mode", icon: "👕", count: 750, trending: false },
    { name: "Emploi", icon: "💼", count: 420, trending: true },
    { name: "Services", icon: "🔧", count: 680, trending: false },
    { name: "Maison", icon: "🛋️", count: 340, trending: false },
    { name: "Animaux", icon: "🐕", count: 180, trending: false }
  ]

  const featuredItems = [
    {
      id: 1,
      title: "iPhone 15 Pro Max",
      price: 850000,
      location: "Dakar",
      image: "📱",
      category: "Électronique",
      featured: true,
      timeAgo: "2h"
    },
    {
      id: 2,
      title: "Toyota Corolla 2020",
      price: 12500000,
      location: "Thiès",
      image: "🚗",
      category: "Véhicules",
      featured: true,
      timeAgo: "5h"
    },
    {
      id: 3,
      title: "Villa 4 chambres",
      price: 45000000,
      location: "Almadies",
      image: "🏠",
      category: "Immobilier",
      featured: true,
      timeAgo: "1j"
    }
  ]

  const stats = [
    { label: "Utilisateurs actifs", value: "15K+", icon: Users },
    { label: "Annonces publiées", value: "8.5K", icon: ShoppingBag },
    { label: "Satisfaction client", value: "95%", icon: Award },
    { label: "Support 24/7", value: "24/7", icon: Clock },
  ]

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-SN', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <>
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center overflow-hidden">
        {/* Formes décoratives */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 rounded-full opacity-20 animate-float"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-orange-200 rounded-full opacity-20 animate-float" style={{animationDelay: '1s'}}></div>
        
        <div className="container-fluid relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Contenu texte */}
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  🇸🇳 Marketplace #1 du Sénégal
                </Badge>
                
                <h1 className="text-hero text-gradient-ocean">
                  Achetez et vendez 
                  <br />
                  <span className="text-gradient-sand">en toute sécurité</span>
                </h1>
                
                <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                  Découvrez le marketplace premium du Sénégal avec des paiements 
                  Orange Money, Wave et Free Money intégrés. Design moderne, 
                  expérience exceptionnelle.
                </p>
              </div>

              {/* Boutons d'action */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="btn-ocean text-lg px-8 py-4">
                  <Zap className="mr-2 h-5 w-5" />
                  Commencer à vendre
                </Button>
                
                <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-2 border-blue-200 hover:bg-blue-50">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Explorer les produits
                </Button>
              </div>

              {/* Indicateurs de confiance */}
              <div className="flex items-center space-x-6 pt-4">
                <div className="flex items-center space-x-1">
                  <div className="flex">
                    {[1,2,3,4,5].map((star) => (
                      <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 ml-2">4.9/5 (2,340 avis)</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-600">Paiements sécurisés</span>
                </div>
              </div>
            </div>

            {/* Image/Illustration */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-100 to-orange-100 rounded-3xl p-8 shadow-2xl">
                <div className="text-center space-y-6">
                  <div className="text-8xl">🛍️</div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-gray-800">
                      Plus de 15,000 utilisateurs nous font confiance
                    </h3>
                    <p className="text-gray-600">
                      Rejoignez la communauté qui révolutionne le commerce au Sénégal
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Catégories */}
      <section className="section-padding bg-white">
        <div className="container-fluid">
          <div className="text-center mb-16">
            <h2 className="text-heading text-gradient-ocean mb-4">
              Explorez nos catégories
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Trouvez exactement ce que vous cherchez parmi nos 8 catégories principales
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {categories.map((category) => (
              <div key={category.name} className="group cursor-pointer">
                <div className="relative bg-gray-50 group-hover:bg-blue-50 rounded-2xl p-6 text-center transition-all duration-300 transform group-hover:-translate-y-1">
                  {category.trending && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white px-2 py-1 text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Tendance
                    </Badge>
                  )}
                  
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm">{category.name}</h3>
                  <p className="text-xs text-gray-500">{category.count} annonces</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Annonces Vedettes */}
      <section className="section-padding bg-gray-50">
        <div className="container-fluid">
          <div className="text-center mb-16">
            <h2 className="text-heading text-gradient-ocean mb-4">
              Annonces vedettes
            </h2>
            <p className="text-lg text-gray-600">
              Les meilleures offres sélectionnées pour vous
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredItems.map((item) => (
              <Card key={item.id} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-white border-0 shadow-lg">
                <CardHeader className="p-0">
                  <div className="relative bg-gradient-to-br from-blue-100 to-orange-100 rounded-t-lg h-48 flex items-center justify-center">
                    <div className="text-6xl">{item.image}</div>
                    
                    {item.featured && (
                      <Badge className="absolute top-4 left-4 bg-yellow-500 text-white">
                        ⭐ Vedette
                      </Badge>
                    )}
                    
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="absolute top-4 right-4 bg-white/80 hover:bg-white"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {item.category}
                      </Badge>
                    </div>
                    
                    <div className="text-2xl font-bold text-gradient-ocean">
                      {formatPrice(item.price)}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{item.location}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{item.timeAgo}</span>
                      </div>
                    </div>
                    
                    <Button className="w-full btn-ocean">
                      Voir les détails
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button size="lg" variant="outline" className="border-2 border-blue-200 hover:bg-blue-50">
              Voir toutes les annonces
            </Button>
          </div>
        </div>
      </section>

      {/* Section Statistiques */}
      <section className="section-padding bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="container-fluid">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <div key={index} className="space-y-4">
                  <IconComponent className="h-12 w-12 mx-auto text-blue-200" />
                  <div className="text-4xl font-bold">{stat.value}</div>
                  <div className="text-blue-200 font-medium">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Call-to-Action Final */}
      <section className="section-padding bg-gradient-to-r from-orange-500 to-red-600">
        <div className="container-fluid text-center text-white space-y-8">
          <h2 className="text-heading">
            Prêt à rejoindre SenMarket ?
          </h2>
          <p className="text-xl text-orange-100 max-w-2xl mx-auto">
            Rejoignez des milliers d'utilisateurs satisfaits et commencez à acheter 
            ou vendre dès aujourd'hui
          </p>
          <Button size="lg" className="btn-sand text-lg px-12 py-4">
            Créer mon compte gratuitement
          </Button>
        </div>
      </section>

      <Footer />
    </>
  )
}