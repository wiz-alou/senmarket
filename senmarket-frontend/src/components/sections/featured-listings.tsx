'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner' // ✅ AJOUT TOAST IMPORT
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useFavoritesStore } from '@/stores/favorites.store'
import { useAuthStore } from '@/stores/auth.store' // ✅ AJOUT AUTH STORE
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
  Package,
  Zap,
  Award,
  ArrowRight,
  Sparkles,
  Calendar,
  Users,
  ChevronRight
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
  
  // ✅ STORES AVEC AUTH
  const { isAuthenticated, user } = useAuthStore()
  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore()

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
      'Véhicules': 'from-blue-500 to-blue-600',
      'Immobilier': 'from-green-500 to-green-600',
      'Électronique': 'from-purple-500 to-purple-600',
      'Mode & Beauté': 'from-pink-500 to-pink-600',
      'Emploi': 'from-orange-500 to-orange-600',
      'Services': 'from-cyan-500 to-cyan-600',
      'Maison & Jardin': 'from-emerald-500 to-emerald-600',
      'Animaux': 'from-amber-500 to-amber-600',
    }
    return colors[category as keyof typeof colors] || 'from-gray-500 to-gray-600'
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

  // ✅ FONCTION FAVORIS CORRIGÉE AVEC NOTIFICATIONS
  const handleFavorite = (listing: Listing) => {
    console.log('🔥 Featured toggle favori pour:', listing.title)

    // ✅ VÉRIFIER L'AUTHENTIFICATION
    if (!isAuthenticated || !user) {
      toast.error('Connectez-vous pour sauvegarder des annonces', {
        icon: '🔒',
        description: 'Créez votre compte ou connectez-vous pour gérer vos favoris',
        action: {
          label: 'Se connecter',
          onClick: () => router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname))
        }
      })
      return
    }
    
    if (isFavorite(listing.id)) {
      // Déjà en favori → Retirer
      console.log('💔 Retrait du favori')
      removeFavorite(listing.id)
      toast.success('Annonce retirée des favoris', { 
        icon: '💔',
        description: `${listing.title} a été supprimée de vos favoris`
      })
    } else {
      // Pas en favori → Ajouter
      console.log('❤️ Ajout au favori')
      addFavorite(listing.id, {
        id: listing.id,
        title: listing.title,
        price: listing.price,
        currency: listing.currency,
        images: listing.images,
        region: listing.region,
        addedAt: new Date().toISOString(),
        category: listing.category,
        user: {
          first_name: listing.user.first_name,
          last_name: listing.user.last_name
        }
      })
      toast.success('Annonce sauvegardée !', { 
        icon: '❤️',
        description: `${listing.title} ajoutée à vos favoris`,
        action: {
          label: 'Voir mes favoris',
          onClick: () => router.push('/favorites')
        }
      })
    }
  }

  // ✅ FONCTION PARTAGE AVEC NOTIFICATIONS
  const handleShare = (listing: Listing) => {
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: `Découvrez cette annonce sur SenMarket`,
        url: `${window.location.origin}/listings/${listing.id}`
      }).then(() => {
        toast.success('Lien partagé avec succès !', { 
          icon: '🔗',
          description: 'L\'annonce a été partagée'
        })
      }).catch(() => {
        // Fallback si le partage échoue
        navigator.clipboard.writeText(`${window.location.origin}/listings/${listing.id}`)
        toast.success('Lien copié dans le presse-papier !', { 
          icon: '📋',
          description: 'Vous pouvez maintenant partager ce lien'
        })
      })
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/listings/${listing.id}`)
      toast.success('Lien copié dans le presse-papier !', { 
        icon: '📋',
        description: 'Vous pouvez maintenant partager ce lien'
      })
    }
  }

  // Fonction utilitaire pour tronquer le texte
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  // Loading state
  if (loading) {
    return (
      <section className="py-20 lg:py-28 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
              <div className="h-6 w-32 bg-slate-200 rounded animate-pulse"></div>
            </div>
            <div className="h-10 w-96 bg-slate-200 rounded mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 w-80 bg-slate-200 rounded mx-auto animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden h-[480px]">
                <div className="h-48 bg-slate-200 animate-pulse"></div>
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
      <section className="py-20 lg:py-28 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Erreur de chargement</h3>
            <p className="text-slate-600 mb-6">{error}</p>
            <Button onClick={fetchFeaturedListings} variant="outline">
              <Loader2 className="h-4 w-4 mr-2" />
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
      <section className="py-20 lg:py-28 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Aucune annonce vedette</h3>
            <p className="text-slate-600 mb-6">Les annonces vedettes apparaîtront ici dès qu'elles seront disponibles.</p>
            <Button onClick={() => router.push('/listings')} className="bg-blue-600 hover:bg-blue-700">
              Voir toutes les annonces
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 relative overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-emerald-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative">
        
        {/* En-tête Moderne */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <Sparkles className="h-2 w-2 text-white" />
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-200 px-4 py-1.5 text-sm font-semibold">
              ⭐ Sélection Premium Vérifiée
            </Badge>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
            Annonces 
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Vedettes</span>
          </h2>
          
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Découvrez notre sélection d'annonces les plus populaires et les mieux notées.
            <br />
            <span className="font-semibold text-blue-600">Qualité garantie • Vendeurs vérifiés • Support 24/7</span>
          </p>

          {/* Stats rapides */}
          <div className="flex items-center justify-center space-x-8 mt-8">
            <div className="flex items-center space-x-2 text-slate-600">
              <Eye className="h-5 w-5 text-blue-500" />
              <span className="font-medium">+50K vues/jour</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-600">
              <Shield className="h-5 w-5 text-green-500" />
              <span className="font-medium">100% Vérifiées</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-600">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="font-medium">4.9/5 Satisfaction</span>
            </div>
          </div>
        </motion.div>

        {/* 🎯 GRILLE UNIFORME - HAUTEUR FIXE */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {listings.map((listing, index) => {
            const imageUrl = listing.images && listing.images.length > 0 
              ? getImageUrl(listing.images[0]) 
              : null

            return (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                {/* 🎯 CARD AVEC HAUTEUR FIXE ET FLEX LAYOUT - TAILLE RÉDUITE */}
                <Card className="overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 h-[480px] flex flex-col">
                  
                  {/* Image container - HAUTEUR FIXE RÉDUITE */}
                  <div className="relative h-48 overflow-hidden flex-shrink-0">
                    
                    {/* Background gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryColor(listing.category.name)} opacity-20`}></div>
                    
                    {/* Image principale */}
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        onError={(e) => {
                          console.error('❌ Erreur image featured:', imageUrl)
                          e.currentTarget.style.display = 'none'
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement
                          if (fallback) fallback.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    
                    {/* Fallback avec icône catégorie élégante */}
                    <div 
                      className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200"
                      style={{ display: imageUrl ? 'none' : 'flex' }}
                    >
                      <div className="text-7xl opacity-30">
                        {listing.category.icon || '📦'}
                      </div>
                    </div>
                    
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Badges premium top */}
                    <div className="absolute top-4 left-4 flex flex-col space-y-2">
                      {listing.is_featured && (
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold px-3 py-1 shadow-lg">
                          <Crown className="h-3 w-3 mr-1" />
                          Vedette
                        </Badge>
                      )}
                      
                      {listing.user.is_verified && (
                        <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold px-3 py-1 shadow-lg">
                          <Shield className="h-3 w-3 mr-1" />
                          Vérifié
                        </Badge>
                      )}

                      <Badge className={`bg-gradient-to-r ${getCategoryColor(listing.category.name)} text-white font-medium px-3 py-1 shadow-lg`}>
                        {listing.category.name}
                      </Badge>
                    </div>
                    
                    {/* ✅ ACTIONS OVERLAY CORRIGÉES AVEC NOTIFICATIONS */}
                    <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button 
                        size="icon" 
                        variant="secondary" 
                        className={`bg-white/95 hover:bg-white shadow-lg transition-colors ${
                          isFavorite(listing.id) ? 'text-red-500' : 'text-slate-600'
                        }`}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleFavorite(listing) // ✅ FONCTION AVEC NOTIFICATIONS
                        }}
                      >
                        <Heart className={`h-4 w-4 ${isFavorite(listing.id) ? 'fill-current' : ''}`} />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="secondary" 
                        className="bg-white/95 hover:bg-white shadow-lg text-slate-600"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleShare(listing) // ✅ FONCTION AVEC NOTIFICATIONS
                        }}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Informations overlay bottom */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-sm">
                      <div className="flex items-center space-x-1 bg-black/50 rounded-full px-3 py-1.5 backdrop-blur-sm">
                        <Eye className="h-3 w-3" />
                        <span className="font-medium">{listing.views_count || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1 bg-black/50 rounded-full px-3 py-1.5 backdrop-blur-sm">
                        <Clock className="h-3 w-3" />
                        <span className="font-medium">{formatTimeAgo(listing.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* 🎯 CONTENU AVEC FLEX ET OVERFLOW GÉRÉ - PADDING RÉDUIT */}
                  <CardContent className="p-4 flex-1 flex flex-col justify-between">
                    
                    {/* Section principale - flex-1 */}
                    <div className="space-y-3 flex-1">
                      
                      {/* Titre et prix - TAILLE CONTRÔLÉE RÉDUITE */}
                      <div className="space-y-2">
                        <Link href={`/listings/${listing.id}`}>
                          <h3 className="font-bold text-slate-900 text-base leading-tight h-[2.5rem] overflow-hidden hover:text-blue-600 transition-colors cursor-pointer">
                            {/* 🎯 TITRE TRONQUÉ À 2 LIGNES MAX */}
                            {truncateText(listing.title, 50)}
                          </h3>
                        </Link>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-xl font-bold text-blue-600">
                            {formatPrice(listing.price)}
                          </div>
                          <Badge variant="outline" className="text-xs font-medium border-green-200 text-green-700 bg-green-50">
                            {listing.status === 'active' ? 'Disponible' : listing.status}
                          </Badge>
                        </div>
                      </div>

                      {/* Description - HAUTEUR CONTRÔLÉE RÉDUITE */}
                      <p className="text-slate-600 text-sm leading-relaxed h-[2.5rem] overflow-hidden">
                        {/* 🎯 DESCRIPTION TRONQUÉE */}
                        {truncateText(listing.description, 60)}
                      </p>

                      {/* Localisation */}
                      <div className="flex items-center space-x-2 text-slate-500">
                        <MapPin className="h-4 w-4 text-blue-500" />
                        <span className="font-medium text-sm">{listing.region}</span>
                      </div>

                      {/* Vendeur premium - HAUTEUR CONTRÔLÉE RÉDUITE */}
                      <div className="pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {listing.user.first_name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <div className="flex items-center space-x-1">
                                <span className="font-semibold text-slate-900 text-sm">
                                  {/* 🎯 NOM TRONQUÉ SI TROP LONG */}
                                  {truncateText(`${listing.user.first_name} ${listing.user.last_name}`, 18)}
                                </span>
                                {listing.user.is_verified && (
                                  <CheckCircle className="h-3 w-3 text-blue-500" />
                                )}
                              </div>
                              <div className="text-xs text-slate-500">
                                Membre vérifié
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-2.5 w-2.5 text-yellow-400 fill-current" />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 🎯 ACTIONS FIXES EN BAS - TAILLE RÉDUITE */}
                    <div className="flex space-x-2 pt-3 flex-shrink-0">
                      <Button 
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg text-xs"
                        onClick={() => router.push(`/listings/${listing.id}`)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Voir
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-blue-200 hover:bg-blue-50 px-2"
                        onClick={() => window.open(`tel:${listing.user.phone}`, '_self')}
                      >
                        <Phone className="h-3 w-3 text-blue-600" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-blue-200 hover:bg-blue-50 px-2"
                        onClick={() => router.push(`/listings/${listing.id}?contact=true`)}
                      >
                        <MessageCircle className="h-3 w-3 text-blue-600" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* CTA Section Premium */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-gradient-to-br from-white via-blue-50/50 to-indigo-50/50 rounded-3xl p-8 lg:p-12 shadow-xl border border-white/50 backdrop-blur-sm max-w-4xl mx-auto">
            
            {/* Header CTA */}
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <Badge className="bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-800 border-emerald-200 px-4 py-2 text-sm font-bold">
                🚀 {listings.length} Annonces Vedettes Disponibles
              </Badge>
            </div>
            
            <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Explorez le meilleur du 
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> marketplace sénégalais</span>
            </h3>
            
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Plus de 50,000 annonces vérifiées vous attendent. Trouvez exactement ce que vous cherchez 
              ou vendez vos produits en toute sécurité.
            </p>

            {/* Stats en ligne */}
            <div className="grid grid-cols-3 gap-8 mb-8 max-w-lg mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">98.5%</div>
                <div className="text-sm text-slate-600">Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">&lt;2h</div>
                <div className="text-sm text-slate-600">Réponse</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">24/7</div>
                <div className="text-sm text-slate-600">Support</div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                onClick={() => router.push('/listings')}
              >
                <Package className="h-5 w-5 mr-2" />
                Explorer toutes les annonces
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-blue-200 hover:bg-blue-50 px-8 py-4 rounded-xl font-semibold hover:border-blue-300 transition-all duration-200"
                onClick={() => router.push('/sell')}
              >
                <Zap className="h-5 w-5 mr-2" />
                Publier mon annonce
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center justify-center space-x-6 mt-8 text-sm text-slate-500">
              <div className="flex items-center space-x-1">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Transactions sécurisées</span>
              </div>
              <div className="flex items-center space-x-1">
                <Award className="h-4 w-4 text-blue-500" />
                <span>Vendeurs certifiés</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4 text-purple-500" />
                <span>50K+ utilisateurs</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}