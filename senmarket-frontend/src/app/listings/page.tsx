'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  MapPinIcon,
  EyeIcon,
  HeartIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  CheckIcon,
  StarIcon,
  ArrowRightIcon,
  SparklesIcon,
  TagIcon,
  CurrencyDollarIcon,
  Bars3Icon
} from '@heroicons/react/24/outline'
import { 
  HeartIcon as HeartSolid,
  StarIcon as StarSolid 
} from '@heroicons/react/24/solid'

// Types
interface Listing {
  id: string
  title: string
  price: number
  image: string
  location: string
  views: number
  createdAt: string
  category: string
  isLiked?: boolean
  isFeatured?: boolean
  rating?: number
  seller: {
    name: string
    avatar: string
    verified: boolean
  }
}

interface FilterState {
  search: string
  category: string
  region: string
  minPrice: string
  maxPrice: string
  sortBy: string
}

// Mock data
const categories = [
  { id: 'all', name: 'Toutes catégories', count: 18934 },
  { id: 'vehicles', name: 'Véhicules', count: 1245 },
  { id: 'real-estate', name: 'Immobilier', count: 856 },
  { id: 'electronics', name: 'Électronique', count: 2341 },
  { id: 'fashion', name: 'Mode & Beauté', count: 1876 },
  { id: 'jobs', name: 'Emploi', count: 432 },
  { id: 'services', name: 'Services', count: 687 },
  { id: 'home-garden', name: 'Maison & Jardin', count: 923 },
  { id: 'animals', name: 'Animaux', count: 234 },
]

const regions = [
  'Toutes régions',
  'Dakar - Plateau',
  'Dakar - Almadies', 
  'Dakar - Parcelles Assainies',
  'Dakar - Ouakam',
  'Dakar - Point E',
  'Dakar - Pikine',
  'Dakar - Guédiawaye',
  'Thiès',
  'Saint-Louis',
  'Kaolack', 
  'Ziguinchor',
  'Diourbel',
  'Louga',
  'Fatick',
  'Kolda',
  'Tambacounda'
]

const sortOptions = [
  { value: 'recent', label: 'Plus récentes' },
  { value: 'price_low', label: 'Prix croissant' },
  { value: 'price_high', label: 'Prix décroissant' },
  { value: 'popular', label: 'Plus populaires' },
  { value: 'rating', label: 'Mieux notées' },
]

// Mock listings data
const allListings: Listing[] = [
  {
    id: '1',
    title: 'iPhone 15 Pro Max 1TB - État Neuf avec garantie',
    price: 850000,
    image: '/api/placeholder/400/300',
    location: 'Dakar - Plateau',
    views: 324,
    createdAt: '2025-06-14T10:00:00Z',
    category: 'Électronique',
    isLiked: false,
    isFeatured: true,
    rating: 4.9,
    seller: {
      name: 'Amadou Diallo',
      avatar: '/api/placeholder/40/40',
      verified: true
    }
  },
  {
    id: '2',
    title: 'Villa 5 pièces avec piscine - Vue mer exceptionnelle',
    price: 125000000,
    image: '/api/placeholder/400/300',
    location: 'Dakar - Almadies',
    views: 156,
    createdAt: '2025-06-14T08:30:00Z',
    category: 'Immobilier',
    isLiked: true,
    isFeatured: true,
    rating: 4.8,
    seller: {
      name: 'Fatou Ndiaye',
      avatar: '/api/placeholder/40/40',
      verified: true
    }
  },
  {
    id: '3',
    title: 'Toyota Land Cruiser 2023 - Garantie constructeur',
    price: 28500000,
    image: '/api/placeholder/400/300',
    location: 'Thiès',
    views: 412,
    createdAt: '2025-06-13T15:20:00Z',
    category: 'Véhicules',
    isLiked: false,
    isFeatured: false,
    rating: 5.0,
    seller: {
      name: 'Moussa Ba',
      avatar: '/api/placeholder/40/40',
      verified: true
    }
  },
  {
    id: '4',
    title: 'MacBook Pro M3 Max 16" - Configuration maximale',
    price: 2200000,
    image: '/api/placeholder/400/300',
    location: 'Dakar - Point E',
    views: 289,
    createdAt: '2025-06-13T12:45:00Z',
    category: 'Électronique',
    isLiked: true,
    isFeatured: false,
    rating: 4.7,
    seller: {
      name: 'Aissatou Sow',
      avatar: '/api/placeholder/40/40',
      verified: false
    }
  },
  {
    id: '5',
    title: 'Appartement 3 chambres - Centre ville Dakar',
    price: 45000000,
    image: '/api/placeholder/400/300',
    location: 'Dakar - Plateau',
    views: 267,
    createdAt: '2025-06-13T09:15:00Z',
    category: 'Immobilier',
    isLiked: false,
    isFeatured: false,
    rating: 4.6,
    seller: {
      name: 'Ousmane Fall',
      avatar: '/api/placeholder/40/40',
      verified: true
    }
  },
  {
    id: '6',
    title: 'Moto Honda CBR 600RR - 2022',
    price: 4500000,
    image: '/api/placeholder/400/300',
    location: 'Dakar - Pikine',
    views: 198,
    createdAt: '2025-06-12T16:30:00Z',
    category: 'Véhicules',
    isLiked: true,
    isFeatured: false,
    rating: 4.4,
    seller: {
      name: 'Ibrahima Sarr',
      avatar: '/api/placeholder/40/40',
      verified: false
    }
  },
  {
    id: '7',
    title: 'Samsung Galaxy S24 Ultra - Neuf sous blister',
    price: 620000,
    image: '/api/placeholder/400/300',
    location: 'Dakar - Plateau',
    views: 445,
    createdAt: '2025-06-12T14:20:00Z',
    category: 'Électronique',
    isLiked: false,
    isFeatured: true,
    rating: 4.8,
    seller: {
      name: 'Khadija Diop',
      avatar: '/api/placeholder/40/40',
      verified: true
    }
  },
  {
    id: '8',
    title: 'Terrain 500m² - Titré et viabilisé',
    price: 15000000,
    image: '/api/placeholder/400/300',
    location: 'Thiès',
    views: 89,
    createdAt: '2025-06-12T11:45:00Z',
    category: 'Immobilier',
    isLiked: false,
    isFeatured: false,
    rating: 4.3,
    seller: {
      name: 'Mamadou Seck',
      avatar: '/api/placeholder/40/40',
      verified: true
    }
  }
]

export default function ListingsPage() {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'all',
    region: 'Toutes régions',
    minPrice: '',
    maxPrice: '',
    sortBy: 'recent'
  })
  
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set(['2', '4', '6']))
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  
  const itemsPerPage = 12

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Filter and sort listings
  const filteredListings = allListings.filter(listing => {
    if (filters.search && !listing.title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }
    if (filters.category !== 'all' && listing.category !== filters.category) {
      return false
    }
    if (filters.region !== 'Toutes régions' && listing.location !== filters.region) {
      return false
    }
    if (filters.minPrice && listing.price < parseInt(filters.minPrice)) {
      return false
    }
    if (filters.maxPrice && listing.price > parseInt(filters.maxPrice)) {
      return false
    }
    return true
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'price_low':
        return a.price - b.price
      case 'price_high':
        return b.price - a.price
      case 'popular':
        return b.views - a.views
      case 'rating':
        return (b.rating || 0) - (a.rating || 0)
      default: // recent
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  // Pagination
  const totalPages = Math.ceil(filteredListings.length / itemsPerPage)
  const paginatedListings = filteredListings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-SN', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatRelativeTime = (date: string) => {
    const now = new Date()
    const targetDate = new Date(date)
    const diffInHours = Math.floor((now.getTime() - targetDate.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'À l\'instant'
    if (diffInHours < 24) return `Il y a ${diffInHours}h`
    return `Il y a ${Math.floor(diffInHours / 24)}j`
  }

  const toggleLike = (id: string) => {
    const newLiked = new Set(likedItems)
    if (newLiked.has(id)) {
      newLiked.delete(id)
    } else {
      newLiked.add(id)
    }
    setLikedItems(newLiked)
  }

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1) // Reset to first page when filtering
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      region: 'Toutes régions',
      minPrice: '',
      maxPrice: '',
      sortBy: 'recent'
    })
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-gray-200/50 shadow-sm">
        <div className="container-custom">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <span className="text-white text-xl font-bold">🇸🇳</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-senegal-green rounded-full border-2 border-white"></div>
              </div>
              <div>
                <div className="text-2xl font-display font-bold text-gray-900">
                  SenMarket
                </div>
                <div className="text-xs text-gray-500 -mt-1">Marketplace #1</div>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {[
                { name: 'Accueil', href: '/' },
                { name: 'Annonces', href: '/listings', active: true },
                { name: 'Catégories', href: '/categories' },
                { name: 'À propos', href: '/about' },
              ].map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    item.active
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                  {item.active && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-600 rounded-full"></div>
                  )}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <Link
                href="/auth/login"
                className="hidden sm:block text-gray-600 hover:text-primary-600 px-4 py-2 text-sm font-medium transition-colors"
              >
                Connexion
              </Link>
              <Link
                href="/listings/create"
                className="btn-senegal btn-sm"
              >
                <SparklesIcon className="w-4 h-4" />
                Publier
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 particles opacity-30"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-senegal-yellow rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-senegal-green rounded-full blur-2xl"></div>
        </div>

        <div className="container-custom relative z-10">
          <div className={`text-center max-w-4xl mx-auto ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <h1 className="text-5xl md:text-6xl font-display font-bold mb-6">
              Découvrez les meilleures
              <span className="block text-senegal-yellow">offres du Sénégal</span>
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              {filteredListings.length.toLocaleString()} annonces disponibles dans toutes les catégories
            </p>

            {/* Main Search Bar */}
            <div className="max-w-4xl mx-auto">
              <div className="card-glass p-4 rounded-3xl shadow-2xl">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher iPhone, voiture, appartement..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="w-full pl-12 pr-4 py-4 text-gray-900 bg-white rounded-2xl border-0 focus:ring-2 focus:ring-primary-500 text-lg placeholder-gray-500"
                    />
                  </div>
                  <div className="lg:w-64">
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full py-4 px-4 text-gray-900 bg-white rounded-2xl border-0 focus:ring-2 focus:ring-primary-500"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name} ({cat.count})
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => setShowMobileFilters(true)}
                    className="btn-outline-white btn-lg lg:hidden"
                  >
                    <FunnelIcon className="w-5 h-5" />
                    Filtres
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters - Desktop */}
            <aside className={`lg:w-80 ${isVisible ? 'animate-fade-in-up animate-delayed' : 'opacity-0'} hidden lg:block`}>
              <div className="sticky top-32">
                <div className="card p-6 mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Filtres</h3>
                    <button
                      onClick={clearFilters}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      Réinitialiser
                    </button>
                  </div>

                  {/* Region Filter */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Région
                    </label>
                    <select
                      value={filters.region}
                      onChange={(e) => handleFilterChange('region', e.target.value)}
                      className="w-full py-3 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      {regions.map((region) => (
                        <option key={region} value={region}>
                          {region}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price Range */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Fourchette de prix (FCFA)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        placeholder="Prix min"
                        value={filters.minPrice}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                        className="py-3 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <input
                        type="number"
                        placeholder="Prix max"
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                        className="py-3 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Categories List */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Catégories
                    </label>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => handleFilterChange('category', category.id)}
                          className={`w-full text-left py-2 px-3 rounded-lg transition-colors ${
                            filters.category === category.id
                              ? 'bg-primary-50 text-primary-600 font-medium'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span>{category.name}</span>
                            <span className="text-sm text-gray-400">
                              {category.count.toLocaleString()}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="card p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Statistiques</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total annonces</span>
                      <span className="font-semibold text-gray-900">{allListings.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Résultats</span>
                      <span className="font-semibold text-primary-600">{filteredListings.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Cette semaine</span>
                      <span className="font-semibold text-senegal-green">+234</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Listings */}
            <main className="flex-1">
              {/* Results Header */}
              <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 ${isVisible ? 'animate-fade-in-up animate-delayed-2' : 'opacity-0'}`}>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {filteredListings.length.toLocaleString()} annonces trouvées
                  </h2>
                  <p className="text-gray-600">
                    {filters.search && `Résultats pour "${filters.search}"`}
                    {filters.category !== 'all' && ` dans ${categories.find(c => c.id === filters.category)?.name}`}
                  </p>
                </div>

                {/* Sort Options */}
                <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                  <button
                    onClick={() => setShowMobileFilters(true)}
                    className="btn-secondary btn-sm lg:hidden"
                  >
                    <FunnelIcon className="w-4 h-4" />
                    Filtres
                  </button>
                  
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="py-2 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Listings Grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="card overflow-hidden animate-pulse">
                      <div className="aspect-[4/3] bg-gray-200"></div>
                      <div className="p-6">
                        <div className="h-4 bg-gray-200 rounded mb-3"></div>
                        <div className="h-6 bg-gray-200 rounded mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 ${isVisible ? 'animate-fade-in-up animate-delayed-3' : 'opacity-0'}`}>
                  {paginatedListings.map((listing) => (
                    <div key={listing.id} className="group">
                      <div className="card card-hover overflow-hidden">
                        {/* Image */}
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <Image
                            src={listing.image}
                            alt={listing.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {listing.isFeatured && (
                            <div className="absolute top-4 left-4 bg-senegal-green text-white px-3 py-1 rounded-full text-sm font-medium">
                              ⭐ Featured
                            </div>
                          )}
                          <button
                            onClick={() => toggleLike(listing.id)}
                            className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition-colors"
                          >
                            {likedItems.has(listing.id) ? (
                              <HeartSolid className="w-5 h-5 text-red-500" />
                            ) : (
                              <HeartIcon className="w-5 h-5 text-gray-600" />
                            )}
                          </button>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <span className="bg-primary-50 text-primary-600 px-3 py-1 rounded-full text-sm font-medium">
                              {listing.category}
                            </span>
                            <div className="flex items-center space-x-1">
                              <StarSolid className="w-4 h-4 text-yellow-400" />
                              <span className="text-sm font-medium text-gray-600">
                                {listing.rating}
                              </span>
                            </div>
                          </div>

                          <h3 className="font-semibold text-xl text-gray-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
                            {listing.title}
                          </h3>

                          <div className="flex items-center space-x-2 text-gray-600 mb-4">
                            <MapPinIcon className="w-4 h-4" />
                            <span className="text-sm">{listing.location}</span>
                            <span className="text-gray-300">•</span>
                            <EyeIcon className="w-4 h-4" />
                            <span className="text-sm">{listing.views} vues</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-2xl font-bold text-gray-900">
                                {formatPrice(listing.price)}
                              </span>
                              <span className="text-sm text-gray-500">
                                {formatRelativeTime(listing.createdAt)}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Image
                                src={listing.seller.avatar}
                                alt={listing.seller.name}
                                width={32}
                                height={32}
                                className="rounded-full"
                              />
                              <div className="flex items-center space-x-1">
                                <span className="text-sm font-medium text-gray-700">
                                  {listing.seller.name.split(' ')[0]}
                                </span>
                                {listing.seller.verified && (
                                  <CheckIcon className="w-4 h-4 text-blue-500" />
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action Button */}
                          <Link
                            href={`/listings/${listing.id}`}
                            className="mt-4 w-full btn-primary btn-sm group"
                          >
                            Voir les détails
                            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {filteredListings.length === 0 && !isLoading && (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MagnifyingGlassIcon className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    Aucune annonce trouvée
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Essayez de modifier vos critères de recherche ou explorez d'autres catégories.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="btn-primary"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className={`flex justify-center items-center space-x-2 mt-12 ${isVisible ? 'animate-fade-in-up animate-delayed-4' : 'opacity-0'}`}>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="w-10 h-10 rounded-xl border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeftIcon className="w-5 h-5" />
                  </button>

                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1
                    const isVisible = 
                      page === 1 || 
                      page === totalPages || 
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    
                    if (!isVisible) {
                      if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page} className="px-2 text-gray-400">...</span>
                      }
                      return null
                    }

                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-primary-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 rounded-xl border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                </div>
              )}
            </main>
          </div>
        </div>
      </section>

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)}></div>
          <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filtres</h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Filter Content */}
              <div className="space-y-6">
                {/* Region Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Région
                  </label>
                  <select
                    value={filters.region}
                    onChange={(e) => handleFilterChange('region', e.target.value)}
                    className="w-full py-3 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {regions.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Fourchette de prix (FCFA)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Prix min"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="py-3 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      placeholder="Prix max"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="py-3 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Catégories
                  </label>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleFilterChange('category', category.id)}
                        className={`w-full text-left py-2 px-3 rounded-lg transition-colors ${
                          filters.category === category.id
                            ? 'bg-primary-50 text-primary-600 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span>{category.name}</span>
                          <span className="text-sm text-gray-400">
                            {category.count.toLocaleString()}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mobile Filter Actions */}
              <div className="flex space-x-3 mt-8">
                <button
                  onClick={clearFilters}
                  className="flex-1 btn-secondary"
                >
                  Réinitialiser
                </button>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="flex-1 btn-primary"
                >
                  Appliquer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 particles opacity-30"></div>
        
        <div className="container-custom relative z-10 text-center">
          <h3 className="text-4xl font-display font-bold mb-6">
            Vous ne trouvez pas ce que vous cherchez ?
          </h3>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Publiez votre annonce et touchez plus de 50,000 acheteurs potentiels au Sénégal.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/listings/create"
              className="btn-senegal btn-xl group"
            >
              <SparklesIcon className="w-6 h-6" />
              Publier une annonce
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              href="/auth/register"
              className="btn-outline-white btn-xl"
            >
              Créer un compte gratuit
            </Link>
          </div>
          
          <p className="text-primary-200 mt-6">
            Première annonce = 200 FCFA seulement ! 🚀
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo & Description */}
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center">
                  <span className="text-white text-xl font-bold">🇸🇳</span>
                </div>
                <div>
                  <div className="text-2xl font-display font-bold">SenMarket</div>
                  <div className="text-xs text-gray-400">Marketplace #1</div>
                </div>
              </div>
              <p className="text-gray-400 mb-6">
                Le marketplace de référence au Sénégal. Plus de 18,000 annonces disponibles.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-lg mb-6">Liens rapides</h4>
              <ul className="space-y-3">
                <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Accueil</Link></li>
                <li><Link href="/listings" className="text-gray-400 hover:text-white transition-colors">Toutes les annonces</Link></li>
                <li><Link href="/listings/create" className="text-gray-400 hover:text-white transition-colors">Publier</Link></li>
                <li><Link href="/categories" className="text-gray-400 hover:text-white transition-colors">Catégories</Link></li>
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="font-semibold text-lg mb-6">Catégories populaires</h4>
              <ul className="space-y-3">
                <li><Link href="/categories/electronics" className="text-gray-400 hover:text-white transition-colors">Électronique</Link></li>
                <li><Link href="/categories/vehicles" className="text-gray-400 hover:text-white transition-colors">Véhicules</Link></li>
                <li><Link href="/categories/real-estate" className="text-gray-400 hover:text-white transition-colors">Immobilier</Link></li>
                <li><Link href="/categories/fashion" className="text-gray-400 hover:text-white transition-colors">Mode</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-lg mb-6">Contact</h4>
              <div className="space-y-3 text-gray-400">
                <p>+221 77 123 45 67</p>
                <p>support@senmarket.sn</p>
                <p>Dakar, Sénégal</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            © 2025 SenMarket. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  )
}