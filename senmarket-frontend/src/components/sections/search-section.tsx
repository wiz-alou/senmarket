'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  MapPin, 
  Filter, 
  TrendingUp,
  Building,
  Car,
  Home,
  Smartphone,
  Briefcase,
  Wrench,
  Sofa,
  Heart,
  Loader2,
  Clock,
  Eye,
  Star,
  X,
  ArrowRight,
  Zap
} from 'lucide-react'

// Types basés sur votre API
interface Category {
  id: string
  slug: string
  name: string
  icon: string
  listings_count: number
}

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
  created_at: string
  category?: {
    name: string
  }
  user?: {
    first_name: string
    last_name: string
    is_verified: boolean
  }
}

interface SearchResponse {
  listings: Listing[]
  total: number
  page: number
  limit: number
}

export function SearchSection() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [categories, setCategories] = useState<Category[]>([])
  const [regions, setRegions] = useState<string[]>([])
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [totalListings, setTotalListings] = useState(0)

  // Configuration API
  const API_BASE = 'http://localhost:8080/api/v1'

  // ✅ RÉGIONS SIMPLIFIÉES POUR RECHERCHE INTELLIGENTE
  const SENEGAL_REGIONS = [
    'Dakar', 'Thiès', 'Saint-Louis', 'Diourbel', 'Louga', 'Fatick',
    'Kaolack', 'Kolda', 'Ziguinchor', 'Tambacounda', 'Kaffrine',
    'Kédougou', 'Matam', 'Sédhiou', 'Saraya', 'Koungheul'
  ]

  // Recherches tendances dynamiques
  const [trendingSearches, setTrendingSearches] = useState([
    'iPhone', 'Appartement Dakar', 'Voiture Toyota', 'Emploi',
    'Villa', 'Samsung Galaxy', 'Ordinateur', 'Terrain'
  ])

  // Fonctions utilitaires
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-SN', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-SN', {
      day: 'numeric',
      month: 'short'
    })
  }

  // Charger les données initiales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [categoriesRes, listingsRes] = await Promise.all([
          fetch(`${API_BASE}/categories/stats`),
          fetch(`${API_BASE}/listings?limit=1`)
        ])

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json()
          // ✅ FIX: Utiliser listing_count au lieu de listings_count
          const enrichedCategories = (categoriesData.data || []).map((cat: any) => ({
            ...cat,
            listings_count: cat.listing_count || 0
          }))
          setCategories(enrichedCategories)
          
          // Calculer le total des annonces
          const total = enrichedCategories.reduce((sum: number, cat: any) => sum + cat.listings_count, 0)
          setTotalListings(total)
        }

        // ✅ UTILISER LES RÉGIONS FIXES AU LIEU DE L'API
        setRegions(SENEGAL_REGIONS)

        if (listingsRes.ok) {
          const listingsData = await listingsRes.json()
          if (listingsData.data?.total) {
            setTotalListings(listingsData.data.total)
          }
        }

      } catch (error) {
        console.error('❌ Error loading search data:', error)
        // Données de fallback
        setTotalListings(3)
        setRegions(SENEGAL_REGIONS)
      }
    }

    loadInitialData()
  }, [])

  // Recherche avec debounce
  const performSearch = useCallback(async () => {
    if (!searchQuery.trim() && selectedCategory === 'all' && selectedRegion === 'all') {
      setSearchResults(null)
      setShowResults(false)
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams()
      
      // ✅ Recherche texte
      if (searchQuery.trim()) params.append('search', searchQuery.trim())
      
      // ✅ Catégorie
      if (selectedCategory !== 'all') params.append('category_id', selectedCategory)
      
      // ✅ RÉGION INTELLIGENTE : Envoie le mot-clé, le backend fait LIKE
      if (selectedRegion !== 'all') {
        params.append('region', selectedRegion)
        console.log(`🌍 Recherche région: "${selectedRegion}" (recherche LIKE sur backend)`)
      }
      
      params.append('limit', '6') // Limite pour l'aperçu

      const response = await fetch(`${API_BASE}/listings?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('🔍 Search response:', data)
        
        // ✅ FIX: Adapter la structure de réponse
        const searchData = {
          listings: data.data?.listings || [],
          total: data.data?.total || 0,
          page: data.data?.page || 1,
          limit: 6
        }
        
        setSearchResults(searchData)
        setShowResults(true)
        console.log('🔍 Search results:', searchData)
      } else {
        console.error('❌ Search failed:', response.status, response.statusText)
        setSearchResults({ listings: [], total: 0, page: 1, limit: 6 })
        setShowResults(true)
      }
    } catch (error) {
      console.error('❌ Search error:', error)
      setSearchResults({ listings: [], total: 0, page: 1, limit: 6 })
      setShowResults(true)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, selectedCategory, selectedRegion])

  // Debounce pour la recherche automatique
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch()
      }
    }, 800)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, performSearch])

  // Lancer une recherche manuelle
  const handleSearch = () => {
    performSearch()
  }

  // Appliquer une recherche tendance
  const applyTrendingSearch = (search: string) => {
    setSearchQuery(search)
    setSelectedCategory('all')
    setSelectedRegion('all')
  }

  // Effacer les résultats
  const clearResults = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setSelectedRegion('all')
    setSearchResults(null)
    setShowResults(false)
  }

  // ✅ REDIRECTION INTELLIGENTE VERS LISTINGS
  const viewAllResults = () => {
    const params = new URLSearchParams()
    if (searchQuery.trim()) params.append('search', searchQuery.trim())
    if (selectedCategory !== 'all') {
      // ✅ FIX: Convertir category_id en slug pour l'URL
      const category = categories.find(cat => cat.id === selectedCategory)
      if (category) {
        params.append('category', category.slug)
      }
    }
    // ✅ RÉGION : Envoyer le mot-clé directement
    if (selectedRegion !== 'all') params.append('region', selectedRegion)
    
    window.location.href = `/listings?${params}`
  }

  return (
    <section className="bg-gradient-to-br from-slate-50 to-blue-50 py-16 lg:py-20">
      <div className="container-fluid">
        <div className="max-w-5xl mx-auto">
          
          {/* Titre principal avec stats temps réel */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Search className="h-4 w-4 mr-2" />
              Moteur de recherche intelligent
            </div>
            
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Trouvez exactement ce que vous cherchez
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Recherchez parmi plus de <span className="font-semibold text-blue-600">{formatNumber(totalListings)} annonces vérifiées</span> dans 
              tout le Sénégal avec notre moteur de recherche avancé
            </p>
          </div>

          {/* Moteur de recherche professionnel */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 lg:p-8 mb-8">
            
            {/* Recherche principale */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                
                {/* Input de recherche */}
                <div className="lg:col-span-5 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Que recherchez-vous ? (ex: iPhone, Appartement, Emploi...)"
                    className="w-full pl-12 pr-10 py-4 border-2 border-gray-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </button>
                  )}
                </div>

                {/* Sélecteur de catégorie */}
                <div className="lg:col-span-3">
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white"
                  >
                    <option value="all">Toutes catégories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name} ({formatNumber(category.listings_count)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* ✅ Sélecteur de région INTELLIGENT */}
                <div className="lg:col-span-2">
                  <select 
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white"
                  >
                    <option value="all">Toutes les régions</option>
                    {regions.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bouton de recherche */}
                <div className="lg:col-span-2">
                  <Button 
                    onClick={handleSearch}
                    disabled={loading}
                    className="w-full h-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-base disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    ) : (
                      <Search className="h-5 w-5 mr-2" />
                    )}
                    Rechercher
                  </Button>
                </div>
              </div>

              {/* Filtres avancés */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-4">
                  <Button variant="outline" size="sm" className="border-gray-300 text-gray-600">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtres avancés
                  </Button>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <MapPin className="h-4 w-4" />
                    <span>🔍 Recherche intelligente : "Dakar" → trouve "Dakar - Plateau", etc.</span>
                  </div>

                  {showResults && (
                    <button
                      onClick={clearResults}
                      className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                      <span>Effacer</span>
                    </button>
                  )}
                </div>

                <div className="text-sm text-gray-500">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Mise à jour temps réel
                </div>
              </div>
            </div>
          </div>

          {/* Résultats de recherche */}
          {showResults && searchResults && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {searchResults.total > 0 
                    ? `${searchResults.total} résultat${searchResults.total > 1 ? 's' : ''} trouvé${searchResults.total > 1 ? 's' : ''}`
                    : 'Aucun résultat trouvé'
                  }
                </h3>
                {searchResults.total > 6 && (
                  <button 
                    onClick={viewAllResults}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Voir tous les résultats
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>

              {searchResults.listings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.listings.map((listing) => {
                    // ✅ FONCTION HELPER POUR LES IMAGES
                    const getImageUrl = (imagePath: string) => {
                      if (!imagePath) return null;
                      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
                        return imagePath;
                      }
                      if (imagePath.startsWith('/')) {
                        return `http://localhost:8080${imagePath}`;
                      }
                      return `http://localhost:8080/uploads/${imagePath}`;
                    };

                    const imageUrl = listing.images && listing.images.length > 0
                      ? getImageUrl(listing.images[0])
                      : null;

                    return (
                      <div
                        key={listing.id}
                        className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer group"
                        onClick={() => window.location.href = `/listings/${listing.id}`}
                      >
                        {/* Image */}
                        <div className="relative h-32 bg-gray-200 rounded-lg mb-3 overflow-hidden">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={listing.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                console.error('❌ Erreur image search:', imageUrl)
                                e.currentTarget.style.display = 'none'
                                const fallback = e.currentTarget.nextElementSibling as HTMLElement
                                if (fallback) fallback.style.display = 'flex'
                              }}
                            />
                          ) : null}
                          
                          {/* Fallback */}
                          <div 
                            className="w-full h-full flex items-center justify-center"
                            style={{ display: imageUrl ? 'none' : 'flex' }}
                          >
                            <Building className="h-8 w-8 text-gray-400" />
                          </div>
                          
                          {/* Prix */}
                          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md">
                            <span className="text-sm font-bold text-gray-900">
                              {formatPrice(listing.price)}
                            </span>
                          </div>

                          {/* Vues */}
                          <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1">
                            <Eye className="h-3 w-3 text-white" />
                            <span className="text-xs text-white">{listing.views_count}</span>
                          </div>
                        </div>

                        {/* Contenu */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {listing.title}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {listing.description}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{listing.region}</span>
                            </div>
                            <span>{formatDate(listing.created_at)}</span>
                          </div>

                          {/* Badge catégorie */}
                          {listing.category && (
                            <div className="mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {listing.category.name}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Aucune annonce trouvée
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Essayez d'ajuster vos critères de recherche ou explorez d'autres catégories.
                  </p>
                  <button
                    onClick={clearResults}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Réinitialiser la recherche
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Recherches tendances */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <span className="font-semibold text-slate-700">Recherches populaires</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-2">
              {trendingSearches.map((search) => (
                <Badge 
                  key={search}
                  variant="secondary" 
                  onClick={() => applyTrendingSearch(search)}
                  className="bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer px-3 py-1 text-sm font-medium transition-colors"
                >
                  {search}
                </Badge>
              ))}
            </div>

            {/* Tips de recherche */}
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Zap className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-900">Tips de Recherche Intelligente</span>
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-800">
                <div className="text-center">
                  <div className="font-medium mb-1">🎯 Recherche par Mot-Clé</div>
                  <div>Tapez "Dakar" pour trouver "Dakar - Plateau", "Dakar - Almadies", etc.</div>
                </div>
                <div className="text-center">
                  <div className="font-medium mb-1">🏷️ Filtres Intelligents</div>
                  <div>Combinez recherche + catégorie + région pour de meilleurs résultats</div>
                </div>
                <div className="text-center">
                  <div className="font-medium mb-1">⚡ Recherche Temps Réel</div>
                  <div>Les résultats s'affichent automatiquement pendant que vous tapez</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}