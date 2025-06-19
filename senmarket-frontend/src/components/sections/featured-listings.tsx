'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  Verified,
  Loader2,
  AlertCircle,
  Package
} from 'lucide-react'

// Types basés sur votre API
interface Listing {
  id: string
  title: string
  description: string
  price: number
  currency: string
  region: string
  images: string[]
  status: string
  views_count: number
  is_featured: boolean
  created_at: string
  updated_at: string
  user: {
    id: string
    first_name: string
    last_name: string
    phone: string
    region: string
    is_verified: boolean
  }
  category: {
    id: string
    name: string
    slug: string
    icon: string
    description: string
  }
}

export function FeaturedListings() {
  const router = useRouter()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ✅ FONCTION HELPER POUR LES IMAGES
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return null
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath
    }
    
    if (imagePath.startsWith('/')) {
      return `http://localhost:8080${imagePath}`
    }
    
    return `http://localhost:8080/uploads/${imagePath}`
  }

  // Charger les annonces vedettes depuis l'API
  useEffect(() => {
    fetchFeaturedListings()
  }, [])

  const fetchFeaturedListings = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Récupérer les annonces avec tri par vues et statut actif
      const response = await fetch('http://localhost:8080/api/v1/listings?sort=views&status=active&limit=6')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('✅ Featured listings API response:', data)

      if (data.data && data.data.listings) {
        // Prendre les 6 annonces les plus populaires
        const featuredListings = data.data.listings.slice(0, 6)
        setListings(featuredListings)
        console.log('📋 Featured listings loaded:', featuredListings.length)
      } else {
        console.warn('⚠️ No listings data in response')
        setListings([])
      }
    } catch (error) {
      console.error('❌ Error fetching featured listings:', error)
      setError('Erreur lors du chargement des annonces vedettes')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-SN', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      'Véhicules': 'bg-blue-100 text-blue-700',
      'Immobilier': 'bg-green-100 text-green-700',
      'Électronique': 'bg-purple-100 text-purple-700',
      'Mode & Beauté': 'bg-pink-100 text-pink-700',
      'Emploi': 'bg-orange-100 text-orange-700',
      'Services': 'bg-cyan-100 text-cyan-700',
      'Maison & Jardin': 'bg-emerald-100 text-emerald-700',
      'Animaux': 'bg-amber-100 text-amber-700',
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-700'
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (minutes < 60) return `${minutes}min`
    if (hours < 24) return `${hours}h`
    return `${days}j`
  }

  const handleFavorite = (listingId: string) => {
    // Logique pour ajouter/retirer des favoris
    console.log('Toggle favorite for listing:', listingId)
  }

  const handleShare = (listing: Listing) => {
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: `Découvrez cette annonce sur SenMarket`,
        url: `${window.location.origin}/listings/${listing.id}`
      })
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/listings/${listing.id}`)
      // Vous pouvez ajouter une notification toast ici
    }
  }

  // Loading state
  if (loading) {
    return (
      <section className="py-20 lg:py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Annonces vedettes vérifiées
            </h2>
            <p className="text-lg text-slate-600">Chargement des annonces...</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-56 bg-slate-200 animate-pulse"></div>
                <CardContent className="p-6 space-y-4">
                  <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
                  <div className="h-6 bg-slate-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-slate-200 rounded animate-pulse w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Error state
  if (error) {
    return (
      <section className="py-20 lg:py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Erreur de chargement</h3>
            <p className="text-slate-600 mb-6">{error}</p>
            <Button onClick={fetchFeaturedListings} variant="outline">
              Réessayer
            </Button>
          </div>
        </div>
      </section>
    )
  }

  // Empty state
  if (listings.length === 0) {
    return (
      <section className="py-20 lg:py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Aucune annonce vedette</h3>
            <p className="text-slate-600 mb-6">Les annonces vedettes apparaîtront ici dès qu'elles seront disponibles.</p>
            <Button onClick={() => router.push('/listings')}>
              Voir toutes les annonces
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 lg:py-24 bg-slate-50">
      <div className="container mx-auto px-6">
        
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
            Découvrez notre sélection d'annonces les plus populaires. 
            Qualité garantie et vendeurs vérifiés pour votre sécurité.
          </p>
        </div>

        {/* Grille des annonces réelles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {listings.map((listing) => {
            const imageUrl = listing.images && listing.images.length > 0 
              ? getImageUrl(listing.images[0]) 
              : null

            return (
              <Card key={listing.id} className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white border-0 shadow-lg overflow-hidden">
                
                {/* Image et badges */}
                <CardHeader className="p-0 relative">
                  <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 h-56 flex items-center justify-center overflow-hidden">
                    
                    {/* Image ou fallback */}
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          console.error('❌ Erreur image featured:', imageUrl)
                          e.currentTarget.style.display = 'none'
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement
                          if (fallback) fallback.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    
                    {/* Fallback avec icône catégorie */}
                    <div 
                      className="absolute inset-0 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-500"
                      style={{ display: imageUrl ? 'none' : 'flex' }}
                    >
                      {listing.category.icon || '📦'}
                    </div>
                    
                    {/* Badges overlay */}
                    <div className="absolute top-4 left-4 flex flex-col space-y-2">
                      {listing.is_featured && (
                        <Badge className="bg-yellow-500 text-white font-semibold px-2 py-1">
                          <Crown className="h-3 w-3 mr-1" />
                          Vedette
                        </Badge>
                      )}
                      
                      {listing.user.is_verified && (
                        <Badge className="bg-green-500 text-white font-semibold px-2 py-1">
                          <Shield className="h-3 w-3 mr-1" />
                          Vérifié
                        </Badge>
                      )}
                    </div>
                    
                    {/* Actions overlay */}
                    <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button 
                        size="icon" 
                        variant="secondary" 
                        className="bg-white/90 hover:bg-white shadow-sm"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleFavorite(listing.id)
                        }}
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="secondary" 
                        className="bg-white/90 hover:bg-white shadow-sm"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleShare(listing)
                        }}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Informations rapides */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-sm">
                      <div className="flex items-center space-x-1 bg-black/50 rounded-full px-2 py-1">
                        <Eye className="h-3 w-3" />
                        <span>{listing.views_count || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1 bg-black/50 rounded-full px-2 py-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimeAgo(listing.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6 space-y-4">
                  
                  {/* Titre et catégorie */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <Badge variant="secondary" className={`text-xs font-medium ${getCategoryColor(listing.category.name)}`}>
                        {listing.category.name}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {listing.status === 'active' ? 'Disponible' : listing.status}
                      </Badge>
                    </div>
                    
                    <h3 className="font-bold text-slate-900 text-lg leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {listing.title}
                    </h3>
                  </div>

                  {/* Prix */}
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-slate-900">
                      {formatPrice(listing.price)}
                    </div>
                  </div>

                  {/* Description courte */}
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {listing.description}
                  </p>

                  {/* Localisation */}
                  <div className="flex items-center space-x-1 text-sm text-slate-500">
                    <MapPin className="h-4 w-4" />
                    <span>{listing.region}</span>
                  </div>

                  {/* Vendeur */}
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-slate-600">
                            {listing.user.first_name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-1">
                            <span className="text-sm font-medium text-slate-900">
                              {listing.user.first_name} {listing.user.last_name}
                            </span>
                            {listing.user.is_verified && (
                              <CheckCircle className="h-3 w-3 text-blue-500" />
                            )}
                          </div>
                          <div className="text-xs text-slate-500">
                            {listing.user.region}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 pt-2">
                    <Button 
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => router.push(`/listings/${listing.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Voir détails
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="border-slate-300"
                      onClick={() => window.open(`tel:${listing.user.phone}`, '_self')}
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="border-slate-300"
                      onClick={() => router.push(`/listings/${listing.id}?contact=true`)}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <TrendingUp className="h-6 w-6 text-green-600" />
              <Badge className="bg-green-100 text-green-800">
                {listings.length} annonces vedettes disponibles
              </Badge>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Découvrez encore plus d'annonces
            </h3>
            
            <p className="text-slate-600 mb-6">
              Explorez toute notre sélection d'annonces vérifiées et trouvez exactement ce que vous cherchez.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => router.push('/listings')}
              >
                Voir toutes les annonces
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-slate-300"
                onClick={() => router.push('/sell')}
              >
                Publier une annonce
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}