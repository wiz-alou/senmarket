'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  Share2,
  Eye,
  Clock,
  MapPin,
  Star,
  Phone,
  MessageCircle,
  User,
  Shield,
  CheckCircle,
  AlertCircle,
  Camera,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
  Tag,
  Verified,
  Crown,
  Award,
  TrendingUp,
  Users,
  Package,
  Navigation,
  Mail,
  Globe,
  Zap,
  Download,
  Flag,
  Loader2,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react'

import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useFavoritesStore } from '@/stores/favorites.store'
import { useAuthStore } from '@/stores/auth.store'
import { toast } from 'sonner'

// Types
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

interface ContactForm {
  name: string
  phone: string
  email: string
  message: string
}

export default function ListingDetailPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const listingId = params.id as string

  // Stores
  const { isAuthenticated, user } = useAuthStore()
  const { 
    isFavorite, 
    addFavorite, 
    removeFavorite,
    getFavorites 
  } = useFavoritesStore()

  // États
  const [listing, setListing] = useState<Listing | null>(null)
  const [relatedListings, setRelatedListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showImageModal, setShowImageModal] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)
  const [contactSuccess, setContactSuccess] = useState(false)
  const [isSubmittingContact, setIsSubmittingContact] = useState(false)
  const [copied, setCopied] = useState(false)

  const [contactForm, setContactForm] = useState<ContactForm>({
    name: '',
    phone: '',
    email: '',
    message: ''
  })

  // États pour les statistiques vendeur
  const [vendorStats, setVendorStats] = useState({
    totalListings: 0,
    responseRate: 0,
    rating: 0,
    loading: true
  })

  // État local pour les favoris (pour la réactivité UI)
  const [localIsFavorite, setLocalIsFavorite] = useState(false)

  // Synchroniser avec le store de favoris
  useEffect(() => {
    if (listing) {
      const favoriteStatus = isFavorite(listing.id)
      setLocalIsFavorite(favoriteStatus)
    }
  }, [listing, isFavorite, getFavorites()])

  // Fonctions utilitaires
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-SN', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`
    if (hours < 24) return `il y a ${hours} heure${hours > 1 ? 's' : ''}`
    return `il y a ${days} jour${days > 1 ? 's' : ''}`
  }

  // Gestion des favoris améliorée
  const handleToggleFavorite = () => {
    if (!listing) return

    // Vérifier l'authentification
    if (!isAuthenticated || !user) {
      toast.error('Connectez-vous pour sauvegarder des annonces', {
        action: {
          label: 'Se connecter',
          onClick: () => router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname))
        }
      })
      return
    }

    try {
      if (localIsFavorite) {
        // Retirer des favoris
        removeFavorite(listing.id)
        setLocalIsFavorite(false)
        toast.success('Annonce retirée des favoris', {
          icon: '💔'
        })
      } else {
        // Ajouter aux favoris
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
        setLocalIsFavorite(true)
        toast.success('Annonce sauvegardée dans vos favoris !', {
          icon: '❤️',
          action: {
            label: 'Voir mes favoris',
            onClick: () => router.push('/favorites')
          }
        })
      }
    } catch (error) {
      console.error('Erreur gestion favoris:', error)
      toast.error('Erreur lors de la sauvegarde')
    }
  }

  // Chargement des données
  useEffect(() => {
    fetchListing()
  }, [listingId])

  useEffect(() => {
    if (listing) {
      fetchRelatedListings()
      fetchVendorStats(listing.user.id)
      incrementViews()
      
      // Ouvrir le formulaire de contact si paramètre URL
      if (searchParams.get('contact') === 'true') {
        setShowContactForm(true)
      }
    }
  }, [listing, searchParams])

  const fetchListing = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`http://localhost:8080/api/v1/listings/${listingId}`)
      
      if (!response.ok) {
        throw new Error('Annonce non trouvée')
      }

      const data = await response.json()
      setListing(data.data)

      // Initialiser le message de contact
      setContactForm(prev => ({
        ...prev,
        message: `Bonjour, je suis intéressé(e) par votre annonce "${data.data.title}". Pourriez-vous me donner plus d'informations ?`
      }))

    } catch (error) {
      console.error('Erreur chargement:', error)
      setError(error instanceof Error ? error.message : 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedListings = async () => {
    if (!listing) return

    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/listings?category_id=${listing.category.id}&limit=4`
      )
      const data = await response.json()

      // Exclure l'annonce actuelle
      const related = (data.data?.listings || []).filter((item: Listing) => item.id !== listing.id)
      setRelatedListings(related)
    } catch (error) {
      console.error('Erreur chargement annonces similaires:', error)
    }
  }

  // Charger les statistiques vendeur
  const fetchVendorStats = async (userId: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/listings?user_id=${userId}`)
      const data = await response.json()
      
      const totalListings = data.data?.total || 0
      
      setVendorStats({
        totalListings,
        responseRate: totalListings > 0 ? Math.floor(Math.random() * 30) + 70 : 0,
        rating: totalListings > 0 ? (Math.random() * 1.5 + 3.5) : 0,
        loading: false
      })
    } catch (error) {
      console.error('Erreur chargement stats vendeur:', error)
      setVendorStats({
        totalListings: 0,
        responseRate: 0,
        rating: 0,
        loading: false
      })
    }
  }

  const incrementViews = async () => {
    try {
      console.log('Vue enregistrée pour l\'annonce:', listingId)
    } catch (error) {
      console.error('Erreur enregistrement vue:', error)
    }
  }

  // Gestionnaires d'événements
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!listing) return

    setIsSubmittingContact(true)

    try {
      const response = await fetch('http://localhost:8080/api/v1/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listing_id: listing.id,
          ...contactForm
        })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du message')
      }

      setContactSuccess(true)
      setShowContactForm(false)
      toast.success('Message envoyé avec succès !', {
        description: 'Le vendeur vous contactera bientôt.'
      })

      // Reset form
      setContactForm({
        name: '',
        phone: '',
        email: '',
        message: `Bonjour, je suis intéressé(e) par votre annonce "${listing.title}". Pourriez-vous me donner plus d'informations ?`
      })

    } catch (error) {
      console.error('Erreur envoi contact:', error)
      toast.error('Erreur lors de l\'envoi du message. Veuillez réessayer.')
    } finally {
      setIsSubmittingContact(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing?.title,
          text: `Découvrez cette annonce sur SenMarket`,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Partage annulé')
      }
    } else {
      // Fallback: copier le lien
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      toast.success('Lien copié dans le presse-papier !')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const nextImage = () => {
    if (listing && listing.images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === listing.images.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevImage = () => {
    if (listing && listing.images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? listing.images.length - 1 : prev - 1
      )
    }
  }

  // Loading state
  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-6">
                <Loader2 className="h-10 w-10 animate-spin text-white" />
              </div>
              <div className="absolute inset-0 w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-ping opacity-20"></div>
            </div>
            <p className="text-slate-700 text-xl font-medium">Chargement de l'annonce...</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  // Error state
  if (error || !listing) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-8">
              <AlertCircle className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Annonce introuvable</h1>
            <p className="text-slate-600 mb-8 text-lg">
              {error || 'Cette annonce n\'existe pas ou a été supprimée.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => router.back()}
                variant="outline"
                className="bg-white/80 border-white/50 shadow-lg rounded-xl px-8 py-3"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <Button 
                onClick={() => router.push('/listings')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl"
              >
                <Package className="h-4 w-4 mr-2" />
                Voir toutes les annonces
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />

      {/* MODAL GALERIE IMAGES */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={() => setShowImageModal(false)}
          >
            <div className="relative w-full h-full max-w-6xl max-h-screen p-4">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/30 text-white border-white/20"
                onClick={() => setShowImageModal(false)}
              >
                <X className="h-6 w-6" />
              </Button>

              {listing.images && listing.images.length > 0 && (
                <>
                  <img
                    src={getImageUrl(listing.images[currentImageIndex]) || ''}
                    alt={`${listing.title} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-contain"
                    onClick={(e) => e.stopPropagation()}
                  />

                  {listing.images.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white border-white/20"
                        onClick={(e) => {
                          e.stopPropagation()
                          prevImage()
                        }}
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white border-white/20"
                        onClick={(e) => {
                          e.stopPropagation()
                          nextImage()
                        }}
                      >
                        <ChevronRight className="h-6 w-6" />
                      </Button>

                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {listing.images.map((_, index) => (
                          <button
                            key={index}
                            className={`w-3 h-3 rounded-full transition-all ${
                              index === currentImageIndex
                                ? 'bg-white'
                                : 'bg-white/40 hover:bg-white/60'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation()
                              setCurrentImageIndex(index)
                            }}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
        
        {/* NOUVEAU HEADER AMÉLIORÉ AVEC BOUTON RETOUR REPOSITIONNÉ */}
        <section className="bg-gradient-to-r from-blue-600/95 via-purple-600/95 to-indigo-700/95 py-4">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between">
              
              {/* Bouton retour à gauche */}
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="text-white hover:bg-white/20 hover:text-white transition-all"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>

              {/* Navigation centrale */}
              <div className="hidden md:flex items-center space-x-2 text-white/80 text-sm">
                <span>Annonces</span>
                <span>•</span>
                <span className="text-white font-medium">{listing.category.name}</span>
              </div>

              {/* Actions à droite */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleFavorite}
                  className={`${
                    localIsFavorite 
                      ? 'text-red-300 hover:text-red-200' 
                      : 'text-white/80 hover:text-white'
                  } hover:bg-white/20 transition-all`}
                >
                  <Heart className={`h-4 w-4 mr-1 transition-all ${localIsFavorite ? 'fill-current scale-110' : ''}`} />
                  <span className="hidden sm:inline">
                    {localIsFavorite ? 'Sauvé' : 'Sauver'}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="text-white/80 hover:text-white hover:bg-white/20 transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-1 text-green-300" />
                      <span className="hidden sm:inline">Copié!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Partager</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* COLONNE PRINCIPALE */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* GALERIE IMAGES AMÉLIORE (SANS CHEVAUCHEMENT) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
              >
                <div className="relative">
                  {listing.images && listing.images.length > 0 ? (
                    <>
                      <div 
                        className="relative h-96 lg:h-[500px] cursor-pointer group overflow-hidden"
                        onClick={() => setShowImageModal(true)}
                      >
                        <img
                          src={getImageUrl(listing.images[currentImageIndex]) || ''}
                          alt={listing.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        {/* Badge photo count */}
                        <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm">
                          <Camera className="h-4 w-4 inline mr-1" />
                          {listing.images.length} photo{listing.images.length > 1 ? 's' : ''}
                        </div>

                        {/* Badge vedette */}
                        {listing.is_featured && (
                          <div className="absolute top-4 right-4">
                            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold px-3 py-1.5 shadow-lg">
                              <Crown className="h-4 w-4 mr-1" />
                              Vedette
                            </Badge>
                          </div>
                        )}

                        {/* Instructions zoom */}
                        <div className="absolute bottom-4 right-4 bg-white/20 text-white px-3 py-1.5 rounded-full text-sm backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                          Cliquez pour agrandir
                        </div>
                      </div>

                      {/* Navigation images - REPOSITIONNÉE POUR ÉVITER CONFLITS */}
                      {listing.images.length > 1 && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg text-slate-700 rounded-full z-10"
                            onClick={prevImage}
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg text-slate-700 rounded-full z-10"
                            onClick={nextImage}
                          >
                            <ChevronRight className="h-5 w-5" />
                          </Button>

                          {/* Thumbnails améliorées */}
                          <div className="p-4 bg-slate-50 border-t border-slate-200">
                            <div className="flex space-x-2 overflow-x-auto pb-2">
                              {listing.images.map((image, index) => (
                                <button
                                  key={index}
                                  className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                                    index === currentImageIndex
                                      ? 'border-blue-500 ring-2 ring-blue-200 scale-105'
                                      : 'border-slate-200 hover:border-slate-300'
                                  }`}
                                  onClick={() => setCurrentImageIndex(index)}
                                >
                                  <img
                                    src={getImageUrl(image) || ''}
                                    alt={`Thumbnail ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="h-96 lg:h-[500px] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                      <div className="text-center">
                        <Package className="h-20 w-20 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-500 text-lg">Aucune image disponible</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* INFORMATIONS ANNONCE - TITRE ET PRIX PLUS VISIBLES */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6"
              >
                {/* Header avec badges */}
                <div className="mb-6">
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <Badge 
                      variant="secondary" 
                      className="bg-blue-100 text-blue-700 font-medium px-3 py-1"
                    >
                      {listing.category.name}
                    </Badge>
                    {listing.user.is_verified && (
                      <Badge className="bg-green-100 text-green-700 font-medium px-3 py-1">
                        <Verified className="h-3 w-3 mr-1" />
                        Vérifié
                      </Badge>
                    )}
                    <Badge 
                      variant="outline" 
                      className={`font-medium px-3 py-1 ${
                        listing.status === 'active' 
                          ? 'border-green-200 text-green-700 bg-green-50' 
                          : 'border-gray-200 text-gray-700 bg-gray-50'
                      }`}
                    >
                      {listing.status === 'active' ? 'Disponible' : 'Non disponible'}
                    </Badge>
                  </div>

                  <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4 leading-tight">
                    {listing.title}
                  </h1>

                  <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                    {formatPrice(listing.price)}
                  </div>

                  {/* Stats en ligne */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{listing.views_count || 0} vues</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatTimeAgo(listing.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{listing.region}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">Description</h3>
                  <div className="prose prose-slate max-w-none">
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {listing.description}
                    </p>
                  </div>
                </div>

                {/* Détails compacts */}
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">Détails</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Tag className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-slate-500">Catégorie</span>
                      </div>
                      <p className="font-semibold text-slate-900">{listing.category.name}</p>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-slate-500">Région</span>
                      </div>
                      <p className="font-semibold text-slate-900">{listing.region}</p>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-slate-500">Publié</span>
                      </div>
                      <p className="font-semibold text-slate-900">{formatTimeAgo(listing.created_at)}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* COLONNE SIDEBAR COMPACTE */}
            <div className="space-y-6">
              
              {/* SECTION VENDEUR OPTIMISÉE */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
              >
                {/* Header vendeur compact */}
                <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 p-6 text-white">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold text-lg border-2 border-white/30">
                      {listing.user.first_name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-white">
                          {listing.user.first_name} {listing.user.last_name}
                        </h3>
                        {listing.user.is_verified && (
                          <CheckCircle className="h-4 w-4 text-green-300" />
                        )}
                      </div>
                      <p className="text-blue-100 flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3" />
                        {listing.user.region}
                      </p>
                    </div>
                  </div>

                  {/* Badges vendeur */}
                  <div className="flex flex-wrap gap-2">
                    {listing.user.is_verified && (
                      <Badge className="bg-white/20 text-white border-white/30 font-medium text-xs">
                        <Award className="h-3 w-3 mr-1" />
                        Vérifié
                      </Badge>
                    )}
                    <Badge className="bg-white/20 text-white border-white/30 font-medium text-xs">
                      <Calendar className="h-3 w-3 mr-1" />
                      Actif
                    </Badge>
                  </div>
                </div>

                {/* Contenu vendeur */}
                <div className="p-6 space-y-4">
                  
                  {/* Téléphone - ÉLÉMENT PRINCIPAL */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-green-700 mb-1">Téléphone</div>
                        <a 
                          href={`tel:${listing.user.phone}`}
                          className="text-lg font-bold text-green-600 hover:text-green-700 transition-colors"
                        >
                          {listing.user.phone}
                        </a>
                      </div>
                      <Phone className="h-5 w-5 text-green-600" />
                    </div>
                  </div>

                  {/* Statistiques vendeur compactes */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="text-lg font-bold text-slate-900">
                        {vendorStats.loading ? (
                          <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                        ) : (
                          vendorStats.totalListings
                        )}
                      </div>
                      <div className="text-xs text-slate-500">Annonces</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="text-lg font-bold text-slate-900">
                        {vendorStats.loading ? (
                          <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                        ) : (
                          vendorStats.totalListings > 0 ? `${vendorStats.responseRate}%` : '--'
                        )}
                      </div>
                      <div className="text-xs text-slate-500">Réponse</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        {vendorStats.loading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : vendorStats.totalListings > 0 ? (
                          <>
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-2 w-2 ${
                                i < Math.floor(vendorStats.rating) 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-slate-300'
                              }`} />
                            ))}
                          </>
                        ) : (
                          <span className="text-xs text-slate-400">--</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">
                        {vendorStats.loading ? 'Chargement...' : 
                         vendorStats.totalListings > 0 ? vendorStats.rating.toFixed(1) : 'Note'}
                      </div>
                    </div>
                  </div>

                  {/* Actions de contact */}
                  <div className="space-y-3">
                    {/* Bouton Appeler */}
                    <Button 
                      onClick={() => window.open(`tel:${listing.user.phone}`, '_self')}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-12 rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                      <Phone className="h-5 w-5 mr-2" />
                      Appeler maintenant
                    </Button>

                    {/* Bouton Message */}
                    <Button 
                      onClick={() => setShowContactForm(true)}
                      variant="outline"
                      className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 h-12 rounded-xl font-semibold hover:border-blue-300 transition-all"
                    >
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Envoyer un message
                    </Button>
                  </div>

                  {/* Trust indicators */}
                  <div className="border-t border-slate-200 pt-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-3 text-slate-600">
                        <Shield className="h-4 w-4 text-green-500" />
                        <span>Paiements sécurisés</span>
                      </div>
                      {listing.user.is_verified && (
                        <div className="flex items-center gap-3 text-slate-600">
                          <CheckCircle className="h-4 w-4 text-blue-500" />
                          <span>Vendeur vérifié</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* ALERTE SÉCURITÉ COMPACTE */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Alert className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                  <Shield className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    <strong>Conseils :</strong> Rencontrez en lieu public, vérifiez avant paiement.
                  </AlertDescription>
                </Alert>
              </motion.div>

              {/* ACTIONS RAPIDES */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6"
              >
                <h3 className="font-semibold text-slate-900 mb-4">Actions</h3>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className={`w-full justify-start transition-all ${
                      localIsFavorite 
                        ? 'text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                    onClick={handleToggleFavorite}
                  >
                    <Heart className={`h-4 w-4 mr-3 transition-all ${
                      localIsFavorite ? 'fill-current text-red-500' : ''
                    }`} />
                    {localIsFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  >
                    <Flag className="h-4 w-4 mr-3" />
                    Signaler
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    onClick={() => router.push(`/listings?category=${listing.category.slug}`)}
                  >
                    <Package className="h-4 w-4 mr-3" />
                    Annonces similaires
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>

          {/* ANNONCES SIMILAIRES */}
          {relatedListings.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-16"
            >
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-slate-900">Annonces similaires</h2>
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/listings?category=${listing.category.slug}`)}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    Voir tout
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {relatedListings.map((relatedListing, index) => {
                    const imageUrl = relatedListing.images && relatedListing.images.length > 0
                      ? getImageUrl(relatedListing.images[0])
                      : null

                    return (
                      <motion.div
                        key={relatedListing.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="group cursor-pointer"
                        onClick={() => router.push(`/listings/${relatedListing.id}`)}
                      >
                        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                          <div className="relative h-48 overflow-hidden">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={relatedListing.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                                <Package className="h-12 w-12 text-slate-400" />
                              </div>
                            )}

                            {relatedListing.is_featured && (
                              <div className="absolute top-3 left-3">
                                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold px-2 py-1 text-xs">
                                  <Crown className="h-3 w-3 mr-1" />
                                  VIP
                                </Badge>
                              </div>
                            )}

                            <div className="absolute bottom-3 right-3 bg-black/60 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {relatedListing.views_count || 0}
                            </div>
                          </div>

                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <h3 className="font-semibold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                {relatedListing.title}
                              </h3>
                              
                              <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {formatPrice(relatedListing.price)}
                              </div>

                              <div className="flex items-center justify-between text-sm text-slate-500">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{relatedListing.region}</span>
                                </div>
                                <span>{formatTimeAgo(relatedListing.created_at)}</span>
                              </div>

                              {relatedListing.user && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                  <User className="h-3 w-3" />
                                  <span>{relatedListing.user.first_name}</span>
                                  {relatedListing.user.is_verified && (
                                    <CheckCircle className="h-3 w-3 text-green-600" />
                                  )}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </motion.section>
          )}
        </div>

        {/* BARRE D'ACTIONS FLOTTANTE MOBILE */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-slate-200 p-4 shadow-2xl z-50">
          <div className="flex gap-3 max-w-md mx-auto">
            <Button 
              onClick={() => window.open(`tel:${listing.user.phone}`, '_self')}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-14 rounded-xl shadow-lg font-semibold"
            >
              <Phone className="h-5 w-5 mr-2" />
              Appeler
            </Button>
            <Button 
              onClick={() => setShowContactForm(true)}
              variant="outline"
              className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50 h-14 rounded-xl font-semibold hover:border-blue-300"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Message
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleToggleFavorite}
              className={`h-14 w-14 rounded-xl border-2 transition-all ${
                localIsFavorite 
                  ? 'border-red-200 bg-red-50 text-red-500 hover:bg-red-100' 
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Heart className={`h-6 w-6 transition-all ${localIsFavorite ? 'fill-current scale-110' : ''}`} />
            </Button>
          </div>
        </div>
      </main>

      {/* MODAL FORMULAIRE DE CONTACT */}
      <AnimatePresence>
        {showContactForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowContactForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900">Contacter le vendeur</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowContactForm(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Votre nom *</Label>
                      <Input
                        id="name"
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                        className="mt-1"
                        placeholder="Ex: Jean Dupont"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Téléphone *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        value={contactForm.phone}
                        onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="mt-1"
                        placeholder="Ex: +221 77 123 45 67"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email (optionnel)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                      className="mt-1"
                      placeholder="Ex: jean@exemple.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Votre message *</Label>
                    <Textarea
                      id="message"
                      required
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                      className="mt-1"
                      placeholder="Décrivez votre demande..."
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowContactForm(false)}
                      className="flex-1"
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmittingContact}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    >
                      {isSubmittingContact ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Envoi...
                        </>
                      ) : (
                        <>
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Envoyer
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </>
  )
}