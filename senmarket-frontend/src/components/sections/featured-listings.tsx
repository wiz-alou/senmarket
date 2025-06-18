import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { 
  Star, 
  MapPin, 
  Clock, 
  Heart,
  Share2,
  Shield,
  CheckCircle,
  Eye,
  Phone,
  MessageCircle,
  TrendingUp,
  Crown,
  Verified
} from 'lucide-react'

export function FeaturedListings() {
  const featuredItems = [
    {
      id: 1,
      title: "iPhone 15 Pro Max 256GB - État Neuf",
      price: 850000,
      originalPrice: 950000,
      location: "Dakar, Plateau",
      category: "Électronique",
      image: "📱",
      featured: true,
      verified: true,
      timeAgo: "2h",
      views: 1247,
      seller: {
        name: "TechStore Dakar",
        rating: 4.9,
        reviews: 156,
        verified: true,
        pro: true
      },
      discount: 11,
      condition: "Neuf",
      warranty: "12 mois",
      shipping: true
    },
    {
      id: 2,
      title: "Toyota Corolla 2020 - Automatique",
      price: 12500000,
      location: "Thiès, Centre",
      category: "Véhicules",
      image: "🚗",
      featured: true,
      verified: true,
      timeAgo: "5h",
      views: 892,
      seller: {
        name: "AutoSen Motors",
        rating: 4.8,
        reviews: 89,
        verified: true,
        pro: true
      },
      condition: "Excellent",
      mileage: "45,000 km",
      shipping: false
    },
    {
      id: 3,
      title: "Villa moderne 4 chambres - Almadies",
      price: 45000000,
      location: "Dakar, Almadies",
      category: "Immobilier",
      image: "🏠",
      featured: true,
      verified: true,
      timeAgo: "1j",
      views: 2156,
      seller: {
        name: "ImmoPlus Sénégal",
        rating: 4.9,
        reviews: 234,
        verified: true,
        pro: true
      },
      condition: "Neuf",
      surface: "250 m²",
      rooms: "4 chambres",
      shipping: false
    },
    {
      id: 4,
      title: "Poste de Développeur Full-Stack",
      price: 650000,
      location: "Dakar, Sacré-Cœur",
      category: "Emploi",
      image: "💼",
      featured: true,
      verified: true,
      timeAgo: "3h",
      views: 456,
      seller: {
        name: "TechCorp Africa",
        rating: 4.7,
        reviews: 67,
        verified: true,
        pro: true
      },
      condition: "CDI",
      experience: "3-5 ans",
      remote: true
    },
    {
      id: 5,
      title: "MacBook Pro M3 14\" - Professionnel",
      price: 1250000,
      originalPrice: 1400000,
      location: "Dakar, Point E",
      category: "Électronique",
      image: "💻",
      featured: true,
      verified: true,
      timeAgo: "4h",
      views: 678,
      seller: {
        name: "MacStore Sénégal",
        rating: 4.9,
        reviews: 123,
        verified: true,
        pro: true
      },
      discount: 11,
      condition: "Comme neuf",
      warranty: "24 mois",
      shipping: true
    },
    {
      id: 6,
      title: "Appartement 3P meublé - Mermoz",
      price: 18000000,
      location: "Dakar, Mermoz",
      category: "Immobilier",
      image: "🏢",
      featured: true,
      verified: true,
      timeAgo: "6h",
      views: 789,
      seller: {
        name: "Habitat Premium",
        rating: 4.8,
        reviews: 178,
        verified: true,
        pro: true
      },
      condition: "Meublé",
      surface: "85 m²",
      rooms: "3 pièces",
      shipping: false
    }
  ]

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-SN', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      'Électronique': 'bg-purple-100 text-purple-700',
      'Véhicules': 'bg-blue-100 text-blue-700',
      'Immobilier': 'bg-green-100 text-green-700',
      'Emploi': 'bg-orange-100 text-orange-700',
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-700'
  }

  return (
    <section className="py-20 lg:py-24 bg-slate-50">
      <div className="container-fluid">
        
        {/* En-tête */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Crown className="h-6 w-6 text-yellow-600" />
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
              Sélection premium
            </Badge>
          </div>
          
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            Annonces vedettes vérifiées
          </h2>
          
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Découvrez notre sélection d'annonces premium vérifiées par nos experts. 
            Qualité garantie et vendeurs certifiés pour votre sécurité.
          </p>
        </div>

        {/* Grille des annonces */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredItems.map((item) => (
            <Card key={item.id} className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white border-0 shadow-lg overflow-hidden">
              
              {/* Image et badges */}
              <CardHeader className="p-0 relative">
                <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 h-56 flex items-center justify-center overflow-hidden">
                  <div className="text-6xl group-hover:scale-110 transition-transform duration-500">
                    {item.image}
                  </div>
                  
                  {/* Badges overlay */}
                  <div className="absolute top-4 left-4 flex flex-col space-y-2">
                    {item.featured && (
                      <Badge className="bg-yellow-500 text-white font-semibold px-2 py-1">
                        <Crown className="h-3 w-3 mr-1" />
                        Vedette
                      </Badge>
                    )}
                    
                    {item.verified && (
                      <Badge className="bg-green-500 text-white font-semibold px-2 py-1">
                        <Shield className="h-3 w-3 mr-1" />
                        Vérifié
                      </Badge>
                    )}

                    {item.discount && (
                      <Badge className="bg-red-500 text-white font-semibold px-2 py-1">
                        -{item.discount}%
                      </Badge>
                    )}
                  </div>
                  
                  {/* Actions overlay */}
                  <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button size="icon" variant="secondary" className="bg-white/90 hover:bg-white shadow-sm">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="secondary" className="bg-white/90 hover:bg-white shadow-sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Informations rapides */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-sm">
                    <div className="flex items-center space-x-1 bg-black/50 rounded-full px-2 py-1">
                      <Eye className="h-3 w-3" />
                      <span>{item.views}</span>
                    </div>
                    <div className="flex items-center space-x-1 bg-black/50 rounded-full px-2 py-1">
                      <Clock className="h-3 w-3" />
                      <span>{item.timeAgo}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6 space-y-4">
                
                {/* Titre et catégorie */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <Badge variant="secondary" className={`text-xs font-medium ${getCategoryColor(item.category)}`}>
                      {item.category}
                    </Badge>
                    {item.condition && (
                      <Badge variant="outline" className="text-xs">
                        {item.condition}
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="font-bold text-slate-900 text-lg leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                </div>

                {/* Prix */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className="text-2xl font-bold text-slate-900">
                      {formatPrice(item.price)}
                    </div>
                    {item.originalPrice && (
                      <div className="text-sm text-gray-500 line-through">
                        {formatPrice(item.originalPrice)}
                      </div>
                    )}
                  </div>
                  
                  {item.category === 'Emploi' && (
                    <div className="text-sm text-slate-600">par mois</div>
                  )}
                </div>

                {/* Informations supplémentaires */}
                <div className="space-y-2 text-sm text-slate-600">
                  {item.mileage && (
                    <div>Kilométrage: {item.mileage}</div>
                  )}
                  {item.surface && (
                    <div>Surface: {item.surface}</div>
                  )}
                  {item.rooms && (
                    <div>{item.rooms}</div>
                  )}
                  {item.experience && (
                    <div>Expérience: {item.experience}</div>
                  )}
                  {item.warranty && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <Shield className="h-3 w-3" />
                      <span>Garantie {item.warranty}</span>
                    </div>
                  )}
                </div>

                {/* Localisation */}
                <div className="flex items-center space-x-1 text-sm text-slate-500">
                  <MapPin className="h-4 w-4" />
                  <span>{item.location}</span>
                  {item.shipping && (
                    <Badge className="bg-blue-100 text-blue-700 text-xs ml-2">
                      Livraison
                    </Badge>
                  )}
                  {item.remote && (
                    <Badge className="bg-green-100 text-green-700 text-xs ml-2">
                      Remote OK
                    </Badge>
                  )}
                </div>

                {/* Vendeur */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-slate-600">
                          {item.seller.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-1">
                          <span className="text-sm font-medium text-slate-900">
                            {item.seller.name}
                          </span>
                          {item.seller.verified && (
                            <CheckCircle className="h-3 w-3 text-blue-500" />
                          )}
                          {item.seller.pro && (
                            <Badge className="bg-blue-100 text-blue-700 text-xs px-1 py-0">
                              PRO
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-slate-500">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{item.seller.rating}</span>
                          <span>({item.seller.reviews} avis)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                    <Eye className="h-4 w-4 mr-2" />
                    Voir détails
                  </Button>
                  <Button variant="outline" size="icon" className="border-slate-300">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="border-slate-300">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <TrendingUp className="h-6 w-6 text-green-600" />
              <Badge className="bg-green-100 text-green-800">
                +250 nouvelles annonces cette semaine
              </Badge>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Plus de 8,500 annonces vous attendent
            </h3>
            
            <p className="text-slate-600 mb-6">
              Explorez toute notre sélection d'annonces vérifiées et trouvez exactement ce que vous cherchez.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Voir toutes les annonces
              </Button>
              <Button size="lg" variant="outline" className="border-slate-300">
                Publier une annonce
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}