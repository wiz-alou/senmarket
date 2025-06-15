'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeftIcon,
  HeartIcon,
  ShareIcon,
  EyeIcon,
  PhoneIcon,
  ChatBubbleLeftIcon,
  MapPinIcon,
  CalendarIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'

// Types
interface ListingDetail {
  id: string
  user_id: string
  category_id: string
  title: string
  description: string
  price: number
  currency: string
  region: string
  images: string[]
  status: string
  views_count: number
  created_at: string
  expires_at: string
  user?: {
    id: string
    first_name: string
    last_name: string
    phone: string
    region: string
    is_verified: boolean
  }
  category?: {
    id: string
    slug: string
    name: string
    icon: string
    description: string
  }
}

interface SimilarListing {
  id: string
  title: string
  price: number
  images: string[]
  region: string
  created_at: string
}

export default function ListingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const listingId = params.id as string

  const [listing, setListing] = useState<ListingDetail | null>(null)
  const [similarListings, setSimilarListings] = useState<SimilarListing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isLiked, setIsLiked] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showImageModal, setShowImageModal] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [contactMessage, setContactMessage] = useState('')
  const [contactLoading, setContactLoading] = useState(false)
  const [contactSuccess, setContactSuccess] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    if (listingId) {
      loadListing()
    }
  }, [listingId])

  const loadListing = async () => {
    setIsLoading(true)
    setError('')

    try {
      // Charger les détails de l'annonce
      const response = await fetch(`http://localhost:8080/api/v1/listings/${listingId}`)
      const result = await response.json()

      if (response.ok) {
        setListing(result.data)
        
        // Incrémenter le compteur de vues (optionnel)
        incrementViews()
        
        // Charger les annonces similaires
        if (result.data?.category_id) {
          loadSimilarListings(result.data.category_id)
        }
      } else {
        throw new Error(result.error || 'Annonce non trouvée')
      }
    } catch (error: any) {
      console.error('Erreur chargement annonce:', error)
      setError(error.message || 'Erreur de chargement')
    } finally {
      setIsLoading(false)
    }
  }

  const incrementViews = async () => {
    try {
      await fetch(`http://localhost:8080/api/v1/listings/${listingId}/view`, {
        method: 'POST'
      })
    } catch (error) {
      console.log('Erreur incrémentation vues:', error)
    }
  }

  const loadSimilarListings = async (categoryId: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/listings?category_id=${categoryId}&limit=4`)
      const result = await response.json()

      if (response.ok) {
        const filtered = result.data?.listings?.filter((item: any) => item.id !== listingId) || []
        setSimilarListings(filtered.slice(0, 3))
      }
    } catch (error) {
      console.log('Erreur chargement annonces similaires:', error)
    }
  }

  const handleContactSeller = async () => {
    if (!contactMessage.trim()) {
      alert('Veuillez saisir un message')
      return
    }

    setContactLoading(true)

    try {
      const response = await fetch('http://localhost:8080/api/v1/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          listing_id: listingId,
          message: contactMessage,
          contact_method: 'message'
        })
      })

      const result = await response.json()

      if (response.ok) {
        setContactSuccess(true)
        setContactMessage('')
        setTimeout(() => {
          setShowContactModal(false)
          setContactSuccess(false)
        }, 2000)
      } else {
        throw new Error(result.error || 'Erreur envoi message')
      }
    } catch (error: any) {
      alert(error.message || 'Erreur lors de l\'envoi')
    } finally {
      setContactLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-SN', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  const formatRelativeTime = (date: string) => {
    const now = new Date()
    const targetDate = new Date(date)
    const diffInHours = Math.floor((now.getTime() - targetDate.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'À l\'instant'
    if (diffInHours < 24) return `Il y a ${diffInHours}h`
    return `Il y a ${Math.floor(diffInHours / 24)}j`
  }

  const shareUrl = () => {
    if (navigator.share) {
      navigator.share({
        title: listing?.title,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Lien copié dans le presse-papier')
    }
  }

  const nextImage = () => {
    if (listing && listing.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % listing.images.length)
    }
  }

  const prevImage = () => {
    if (listing && listing.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Chargement de l'annonce...</p>
        </div>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Annonce non trouvée</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            href="/listings"
            className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors"
          >
            Retour aux annonces
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Retour</span>
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                {isLiked ? (
                  <HeartSolid className="w-5 h-5 text-red-500" />
                ) : (
                  <HeartIcon className="w-5 h-5 text-gray-600" />
                )}
              </button>
              
              <button
                onClick={shareUrl}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <ShareIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className={`bg-white rounded-2xl shadow-sm overflow-hidden ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
              {listing.images && listing.images.length > 0 ? (
                <div className="relative">
                  <div className="aspect-[16/10] relative">
                    <img
                      src={listing.images[currentImageIndex]}
                      alt={listing.title}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => setShowImageModal(true)}
                    />
                    
                    {listing.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                        >
                          <ChevronLeftIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                        >
                          <ChevronRightIcon className="w-5 h-5" />
                        </button>
                      </>
                    )}

                    {/* Image Counter */}
                    <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {listing.images.length}
                    </div>
                  </div>

                  {/* Thumbnails */}
                  {listing.images.length > 1 && (
                    <div className="p-4 flex space-x-2 overflow-x-auto">
                      {listing.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                            index === currentImageIndex ? 'border-green-500' : 'border-gray-200'
                          }`}
                        >
                          <img
                            src={image}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-[16/10] bg-gray-100 flex items-center justify-center">
                  <PhotoIcon className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Listing Details */}
            <div className={`bg-white rounded-2xl shadow-sm p-8 ${isVisible ? 'animate-fade-in-up animate-delayed-1' : 'opacity-0'}`}>
              {/* Category Badge */}
              <div className="flex items-center space-x-3 mb-6">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  {listing.category?.icon} {listing.category?.name}
                </span>
                <div className="flex items-center space-x-2 text-gray-500 text-sm">
                  <EyeIcon className="w-4 h-4" />
                  <span>{listing.views_count} vues</span>
                </div>
              </div>

              {/* Title and Price */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {listing.title}
              </h1>
              
              <div className="text-4xl font-bold text-green-600 mb-6">
                {formatPrice(listing.price)}
              </div>

              {/* Meta Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <MapPinIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Localisation</div>
                    <div className="font-medium">{listing.region}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <CalendarIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Publié</div>
                    <div className="font-medium">{formatRelativeTime(listing.created_at)}</div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Description</h3>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {listing.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Seller Info */}
            {listing.user && (
              <div className={`bg-white rounded-2xl shadow-sm p-6 ${isVisible ? 'animate-fade-in-up animate-delayed-2' : 'opacity-0'}`}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendeur</h3>
                
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl font-bold">
                      {listing.user.first_name[0]}{listing.user.last_name[0]}
                    </span>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-900">
                        {listing.user.first_name} {listing.user.last_name}
                      </h4>
                      {listing.user.is_verified && (
                        <CheckIcon className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">{listing.user.region}</p>
                    {listing.user.is_verified && (
                      <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full mt-1">
                        Vérifié
                      </span>
                    )}
                  </div>
                </div>

                {/* Contact Actions */}
                <div className="space-y-3">
                  <button
                    onClick={() => setShowContactModal(true)}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-xl hover:bg-green-700 transition-colors font-semibold flex items-center justify-center space-x-2"
                  >
                    <ChatBubbleLeftIcon className="w-5 h-5" />
                    <span>Envoyer un message</span>
                  </button>

                  <a
                    href={`tel:${listing.user.phone}`}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center space-x-2"
                  >
                    <PhoneIcon className="w-5 h-5" />
                    <span>Appeler</span>
                  </a>
                </div>

                {/* Safety Tips */}
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <h5 className="font-medium text-yellow-800 mb-2 flex items-center">
                    <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                    Conseils de sécurité
                  </h5>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Rencontrez le vendeur en personne</li>
                    <li>• Vérifiez l'état avant d'acheter</li>
                    <li>• Privilégiez les paiements sécurisés</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Similar Listings */}
            {similarListings.length > 0 && (
              <div className={`bg-white rounded-2xl shadow-sm p-6 ${isVisible ? 'animate-fade-in-up animate-delayed-3' : 'opacity-0'}`}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Annonces similaires</h3>
                
                <div className="space-y-4">
                  {similarListings.map((similar) => (
                    <Link
                      key={similar.id}
                      href={`/listings/${similar.id}`}
                      className="block group"
                    >
                      <div className="flex space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          {similar.images[0] ? (
                            <img
                              src={similar.images[0]}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <PhotoIcon className="w-8 h-8 text-gray-400 mx-auto mt-4" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 group-hover:text-green-600 transition-colors line-clamp-2 text-sm">
                            {similar.title}
                          </h4>
                          <p className="text-green-600 font-semibold text-sm">
                            {formatPrice(similar.price)}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {similar.region} • {formatRelativeTime(similar.created_at)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                <Link
                  href={`/listings?category=${listing.category_id}`}
                  className="block text-center text-green-600 hover:text-green-700 font-medium text-sm mt-4"
                >
                  Voir plus dans {listing.category?.name}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && listing.images && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative max-w-6xl max-h-full">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <XMarkIcon className="w-8 h-8" />
            </button>
            
            <img
              src={listing.images[currentImageIndex]}
              alt={listing.title}
              className="max-w-full max-h-full object-contain"
            />
            
            {listing.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                {listing.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Contacter le vendeur</h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {contactSuccess ? (
              <div className="text-center py-8">
                <CheckIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Message envoyé !</h4>
                <p className="text-gray-600">Le vendeur recevra votre message.</p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Votre message
                  </label>
                  <textarea
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Bonjour, je suis intéressé par votre annonce..."
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowContactModal(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleContactSeller}
                    disabled={contactLoading || !contactMessage.trim()}
                    className="flex-1 bg-green-600 text-white py-3 px-4 rounded-xl hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {contactLoading ? 'Envoi...' : 'Envoyer'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}