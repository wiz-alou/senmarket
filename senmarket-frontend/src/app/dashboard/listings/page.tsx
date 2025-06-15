'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon,
  PhotoIcon,
  CalendarIcon,
  MapPinIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'

// Types
interface MyListing {
  id: string
  user_id: string
  category_id: string
  title: string
  description: string
  price: number
  currency: string
  region: string
  images: string[]
  status: 'draft' | 'active' | 'sold' | 'expired'
  views_count: number
  created_at: string
  expires_at: string
  category?: {
    id: string
    slug: string
    name: string
    icon: string
    description: string
  }
}

interface ListingsResponse {
  listings: MyListing[]
  total: number
  page: number
  limit: number
  pages: number
}

const statusOptions = [
  { value: 'all', label: 'Toutes', color: 'gray' },
  { value: 'draft', label: 'Brouillons', color: 'yellow' },
  { value: 'active', label: 'Actives', color: 'green' },
  { value: 'sold', label: 'Vendues', color: 'blue' },
  { value: 'expired', label: 'Expirées', color: 'red' }
]

export default function MyListingsPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading } = useAuth()
  
  const [listings, setListings] = useState<MyListing[]>([])
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedListings, setSelectedListings] = useState<Set<string>>(new Set())
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [listingToDelete, setListingToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login')
      return
    }

    if (isAuthenticated && user) {
      loadMyListings()
    }
  }, [loading, isAuthenticated, user, router, selectedStatus, searchQuery, currentPage])

  const loadMyListings = async () => {
    setIsLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('senmarket_token')
      
      if (!token) {
        router.push('/auth/login')
        return
      }

      const params = new URLSearchParams()
      if (selectedStatus !== 'all') params.append('status', selectedStatus)
      if (searchQuery) params.append('search', searchQuery)
      params.append('page', currentPage.toString())
      params.append('limit', '12')

      const response = await fetch(`http://localhost:8080/api/v1/listings/my?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()

      if (response.ok) {
        setListings(result.data?.listings || [])
        setTotalCount(result.data?.total || 0)
        setTotalPages(result.data?.pages || 1)
      } else {
        throw new Error(result.error || 'Erreur chargement annonces')
      }
    } catch (error: any) {
      console.error('Erreur chargement mes annonces:', error)
      setError(error.message || 'Erreur de chargement')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteListing = async (listingId: string) => {
    setIsDeleting(true)

    try {
      const token = localStorage.getItem('senmarket_token')
      
      const response = await fetch(`http://localhost:8080/api/v1/listings/${listingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()

      if (response.ok) {
        // Supprimer de la liste locale
        setListings(prev => prev.filter(listing => listing.id !== listingId))
        setTotalCount(prev => prev - 1)
        setShowDeleteModal(false)
        setListingToDelete(null)
      } else {
        throw new Error(result.error || 'Erreur suppression')
      }
    } catch (error: any) {
      alert(error.message || 'Erreur lors de la suppression')
    } finally {
      setIsDeleting(false)
    }
  }

  const handlePublishListing = async (listingId: string) => {
    try {
      const token = localStorage.getItem('senmarket_token')
      
      const response = await fetch(`http://localhost:8080/api/v1/listings/${listingId}/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()

      if (response.ok) {
        // Mettre à jour le statut local
        setListings(prev => prev.map(listing => 
          listing.id === listingId 
            ? { ...listing, status: 'active' as const }
            : listing
        ))
      } else {
        throw new Error(result.error || 'Erreur publication')
      }
    } catch (error: any) {
      alert(error.message || 'Erreur lors de la publication')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = statusOptions.find(s => s.value === status) || statusOptions[0]
    const colors = {
      gray: 'bg-gray-100 text-gray-700',
      yellow: 'bg-yellow-100 text-yellow-700',
      green: 'bg-green-100 text-green-700', 
      blue: 'bg-blue-100 text-blue-700',
      red: 'bg-red-100 text-red-700'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[statusConfig.color as keyof typeof colors]}`}>
        {statusConfig.label}
      </span>
    )
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  const getImageUrl = (listing: MyListing) => {
    if (listing.images && listing.images.length > 0) {
      return listing.images[0]
    }
    return '/api/placeholder/400/300'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mes Annonces</h1>
              <p className="text-gray-600 mt-1">
                Gérez toutes vos annonces en un seul endroit
              </p>
            </div>
            
            <Link
              href="/listings/create"
              className="mt-4 sm:mt-0 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors font-semibold flex items-center space-x-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Nouvelle annonce</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher dans mes annonces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Status Filter */}
            <div className="lg:w-48">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full py-3 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
            {statusOptions.slice(1).map((status) => {
              const count = status.value === 'all' 
                ? totalCount 
                : listings.filter(l => l.status === status.value).length
              
              return (
                <div key={status.value} className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className="text-sm text-gray-600">{status.label}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700">⚠️ {error}</p>
            <button 
              onClick={loadMyListings}
              className="mt-2 text-red-600 underline hover:text-red-800"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Listings Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-3"></div>
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : listings.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <div key={listing.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={getImageUrl(listing)}
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      {getStatusBadge(listing.status)}
                    </div>

                    {/* Views */}
                    <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                      <EyeIcon className="w-3 h-3" />
                      <span>{listing.views_count}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Category */}
                    {listing.category && (
                      <div className="text-sm text-green-600 font-medium mb-2">
                        {listing.category.icon} {listing.category.name}
                      </div>
                    )}

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                      {listing.title}
                    </h3>

                    {/* Price */}
                    <div className="text-2xl font-bold text-green-600 mb-3">
                      {formatPrice(listing.price)}
                    </div>

                    {/* Meta Info */}
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-2">
                        <MapPinIcon className="w-4 h-4" />
                        <span>{listing.region}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="w-4 h-4" />
                        <span>Créé le {formatDate(listing.created_at)}</span>
                      </div>
                      {listing.expires_at && (
                        <div className="flex items-center space-x-2">
                          <ClockIcon className="w-4 h-4" />
                          <span>Expire le {formatDate(listing.expires_at)}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/listings/${listing.id}`}
                        className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium text-center flex items-center justify-center space-x-1"
                      >
                        <EyeIcon className="w-4 h-4" />
                        <span>Voir</span>
                      </Link>

                      <Link
                        href={`/listings/${listing.id}/edit`}
                        className="bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Link>

                      {listing.status === 'draft' && (
                        <button
                          onClick={() => handlePublishListing(listing.id)}
                          className="bg-yellow-600 text-white py-2 px-3 rounded-lg hover:bg-yellow-700 transition-colors text-sm flex items-center justify-center"
                          title="Publier"
                        >
                          <CheckCircleIcon className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setListingToDelete(listing.id)
                          setShowDeleteModal(true)
                        }}
                        className="bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center justify-center"
                        title="Supprimer"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Précédent
                </button>

                {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                  const page = index + 1
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-green-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === totalPages
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Suivant
                </button>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <PhotoIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Aucune annonce pour le moment
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Créez votre première annonce pour commencer à vendre sur SenMarket.
            </p>
            <Link
              href="/listings/create"
              className="inline-flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors font-semibold"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Créer ma première annonce</span>
            </Link>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="text-center">
              <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Confirmer la suppression
              </h3>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setListingToDelete(null)
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={() => listingToDelete && handleDeleteListing(listingToDelete)}
                  disabled={isDeleting}
                  className="flex-1 bg-red-600 text-white py-3 px-4 rounded-xl hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}