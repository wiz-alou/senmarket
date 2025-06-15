'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  MagnifyingGlassIcon, 
  MapPinIcon, 
  EyeIcon,
  HeartIcon,
  ClockIcon,
  StarIcon,
  ShoppingCartIcon,
  TruckIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  ArrowRightIcon,
  PlayIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import { 
  HeartIcon as HeartSolid,
  StarIcon as StarSolid 
} from '@heroicons/react/24/solid'

// Types
interface Category {
  id: string
  name: string
  icon: string
  count: number
  slug: string
  color: string
  gradient: string
}

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

// Mock data avec plus de détails
const categories: Category[] = [
  { 
    id: '1', 
    name: 'Véhicules', 
    icon: '🚗', 
    count: 1245, 
    slug: 'vehicles',
    color: 'blue',
    gradient: 'from-blue-500 to-blue-600'
  },
  { 
    id: '2', 
    name: 'Immobilier', 
    icon: '🏠', 
    count: 856, 
    slug: 'real-estate',
    color: 'emerald',
    gradient: 'from-emerald-500 to-emerald-600'
  },
  { 
    id: '3', 
    name: 'Électronique', 
    icon: '📱', 
    count: 2341, 
    slug: 'electronics',
    color: 'purple',
    gradient: 'from-purple-500 to-purple-600'
  },
  { 
    id: '4', 
    name: 'Mode & Beauté', 
    icon: '👕', 
    count: 1876, 
    slug: 'fashion',
    color: 'pink',
    gradient: 'from-pink-500 to-pink-600'
  },
  { 
    id: '5', 
    name: 'Emploi', 
    icon: '💼', 
    count: 432, 
    slug: 'jobs',
    color: 'orange',
    gradient: 'from-orange-500 to-orange-600'
  },
  { 
    id: '6', 
    name: 'Services', 
    icon: '🔧', 
    count: 687, 
    slug: 'services',
    color: 'teal',
    gradient: 'from-teal-500 to-teal-600'
  },
  { 
    id: '7', 
    name: 'Maison & Jardin', 
    icon: '🛋️', 
    count: 923, 
    slug: 'home-garden',
    color: 'green',
    gradient: 'from-green-500 to-green-600'
  },
  { 
    id: '8', 
    name: 'Animaux', 
    icon: '🐕', 
    count: 234, 
    slug: 'animals',
    color: 'amber',
    gradient: 'from-amber-500 to-amber-600'
  },
]

const featuredListings: Listing[] = [
  {
    id: '1',
    title: 'iPhone 15 Pro Max 1TB - État Neuf',
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
    isFeatured: true,
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
]

const features = [
  {
    icon: ShieldCheckIcon,
    title: 'Transactions Sécurisées',
    description: 'Paiements protégés avec Orange Money et système de vérification',
    color: 'text-emerald-600'
  },
  {
    icon: TruckIcon,
    title: 'Livraison Rapide',
    description: 'Réseau de livreurs partenaires dans tout le Sénégal',
    color: 'text-blue-600'
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'Support 24/7',
    description: 'Assistance dédiée en français et wolof',
    color: 'text-purple-600'
  },
  {
    icon: UserGroupIcon,
    title: 'Communauté Active',
    description: 'Plus de 50,000 utilisateurs vérifié actifs',
    color: 'text-orange-600'
  }
]

const stats = {
  totalUsers: 52847,
  totalListings: 18934,
  totalTransactions: 7623,
  cities: 16,
  satisfaction: 98
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set())
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-gray-200/50 shadow-sm">
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
                { name: 'Accueil', href: '/', active: true },
                { name: 'Annonces', href: '/listings' },
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

            {/* Auth & Actions */}
            <div className="flex items-center space-x-3">
              <Link
                href="/auth/login"
                className="hidden sm:block text-gray-600 hover:text-primary-600 px-4 py-2 text-sm font-medium transition-colors"
              >
                Connexion
              </Link>
              <Link
                href="/auth/register"
                className="btn-secondary btn-sm"
              >
                S'inscrire
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
      <section className="relative overflow-hidden">
        {/* Background avec effets */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-senegal-green/20 via-transparent to-primary-800/20"></div>
          <div className="absolute inset-0 particles"></div>
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-20 left-20 w-64 h-64 bg-senegal-yellow rounded-full blob float-1"></div>
            <div className="absolute bottom-20 right-20 w-48 h-48 bg-senegal-green rounded-full blob float-2"></div>
            <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white rounded-full blob float-3"></div>
          </div>
        </div>

        <div className="relative z-10 container-custom section-padding text-white">
          <div className="text-center max-w-5xl mx-auto">
            {/* Badge */}
            <div className={`inline-flex items-center space-x-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-6 py-3 mb-8 ${isVisible ? 'animate-fade-in-down' : 'opacity-0'}`}>
              <StarSolid className="w-5 h-5 text-senegal-yellow" />
              <span className="text-sm font-medium">Marketplace le plus populaire du Sénégal</span>
              <SparklesIcon className="w-4 h-4 text-senegal-yellow" />
            </div>

            {/* Title */}
            <h1 className={`font-display font-bold text-6xl md:text-7xl lg:text-8xl mb-8 ${isVisible ? 'animate-fade-in-up animate-delayed' : 'opacity-0'}`}>
              Le marketplace
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-senegal-yellow via-white to-senegal-yellow">
                du Sénégal
              </span>
            </h1>

            {/* Subtitle */}
            <p className={`text-xl md:text-2xl lg:text-3xl text-primary-100 mb-12 max-w-4xl mx-auto font-light leading-relaxed ${isVisible ? 'animate-fade-in-up animate-delayed-2' : 'opacity-0'}`}>
              Achetez, vendez et découvrez des milliers de produits près de chez vous.
              <span className="block text-senegal-yellow font-medium">Sécurisé, rapide et 100% sénégalais ! 🇸🇳</span>
            </p>

            {/* Search Bar */}
            <div className={`max-w-5xl mx-auto mb-16 ${isVisible ? 'animate-fade-in-up animate-delayed-3' : 'opacity-0'}`}>
              <div className="card-glass p-3 rounded-3xl shadow-2xl">
                <div className="flex flex-col lg:flex-row gap-3">
                  <div className="flex-1 relative">
                    <MagnifyingGlassIcon className="absolute left-6 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                    <input
                      type="text"
                      placeholder="iPhone, voiture, appartement, job..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-16 pr-6 py-5 text-gray-900 bg-white rounded-2xl border-0 focus:ring-2 focus:ring-primary-500 text-lg placeholder-gray-500 shadow-sm"
                    />
                  </div>
                  <div className="lg:w-72">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full py-5 px-6 text-gray-900 bg-white rounded-2xl border-0 focus:ring-2 focus:ring-primary-500 text-lg shadow-sm"
                    >
                      <option value="">Toutes catégories</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.slug}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button className="btn-senegal btn-lg group px-8">
                    <MagnifyingGlassIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    Rechercher
                  </button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-8">
              {[
                { label: 'Utilisateurs', value: stats.totalUsers, suffix: '+', icon: UserGroupIcon },
                { label: 'Annonces', value: stats.totalListings, suffix: '+', icon: ShoppingCartIcon },
                { label: 'Ventes', value: stats.totalTransactions, suffix: '+', icon: CurrencyDollarIcon },
                { label: 'Villes', value: stats.cities, suffix: '', icon: MapPinIcon },
                { label: 'Satisfaction', value: stats.satisfaction, suffix: '%', icon: HeartSolid },
              ].map((stat, index) => (
                <div key={stat.label} className={`text-center group ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: `${0.6 + index * 0.1}s` }}>
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className="w-8 h-8 text-senegal-yellow" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {stat.value.toLocaleString()}{stat.suffix}
                  </div>
                  <div className="text-primary-200 text-sm font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-white relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-30"></div>
        <div className="container-custom relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-primary-50 text-primary-600 rounded-full px-6 py-3 mb-6">
              <ShieldCheckIcon className="w-5 h-5" />
              <span className="font-medium">Pourquoi choisir SenMarket</span>
            </div>
            <h2 className="font-display font-bold text-4xl md:text-5xl text-gray-900 mb-6">
              Une expérience d'achat
              <span className="block text-primary-600">exceptionnelle</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nous révolutionnons le e-commerce au Sénégal avec des fonctionnalités innovantes
              et une sécurité de niveau bancaire.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group"
              >
                <div className="card card-hover p-8 text-center h-full">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 group-hover:scale-110 transition-all duration-300 ${feature.color} bg-gradient-to-br from-current to-current/80 shadow-lg`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-xl text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section-padding bg-gradient-to-br from-gray-50 to-white relative"></section>