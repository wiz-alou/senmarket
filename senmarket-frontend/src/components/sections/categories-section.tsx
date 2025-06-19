'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Car, 
  Home, 
  Smartphone, 
  Shirt, 
  Briefcase, 
  Wrench,
  Sofa,
  Heart,
  TrendingUp,
  ArrowRight,
  Building,
  Users,
  Loader2,
  Package,
  AlertCircle
} from 'lucide-react'

// Types basés sur votre API
interface Category {
  id: string
  slug: string
  name: string
  icon: string
  description: string
  sort_order: number
  listings_count?: number
  is_trending?: boolean
  growth_rate?: string
}

interface CategoryStats {
  total_listings: number
  active_listings: number
  categories: Array<Category & { listings_count: number }>
}

export function CategoriesSection() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Mapping des icônes
  const iconMapping: { [key: string]: any } = {
    'fa-car': Car,
    'fa-home': Home,
    'fa-laptop': Smartphone,
    'fa-tshirt': Shirt,
    'fa-briefcase': Briefcase,
    'fa-tools': Wrench,
    'fa-couch': Sofa,
    'fa-paw': Heart,
  }

  // Mapping des couleurs par catégorie
  const getColorClasses = (slug: string) => {
    const colorMap: { [key: string]: string } = {
      'vehicles': 'blue',
      'real-estate': 'green',
      'electronics': 'purple',
      'fashion': 'pink',
      'jobs': 'orange',
      'services': 'cyan',
      'home-garden': 'amber',
      'animals': 'red'
    }
    
    const color = colorMap[slug] || 'gray'
    
    return {
      bg: `bg-${color}-50 hover:bg-${color}-100`,
      border: `border-${color}-200 hover:border-${color}-300`,
      text: `text-${color}-700`,
      icon: `text-${color}-600`,
      badge: `bg-${color}-100 text-${color}-700`
    }
  }

  useEffect(() => {
    fetchCategoriesWithStats()
  }, [])

  const fetchCategoriesWithStats = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Récupérer les catégories avec statistiques
      const response = await fetch('http://localhost:8080/api/v1/categories/stats')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('✅ Categories with stats:', data)

      if (data.data && Array.isArray(data.data)) {
        // Enrichir les catégories avec des métadonnées
        const enrichedCategories = data.data.map((category: any) => ({
          ...category,
          is_trending: category.listings_count > 50, // Trending si > 50 annonces
          growth_rate: category.listings_count > 100 ? '+15%' : 
                      category.listings_count > 50 ? '+8%' : '+3%'
        }))

        setCategories(enrichedCategories)
        console.log('📊 Categories loaded:', enrichedCategories.length)
      } else {
        throw new Error('Invalid data format')
      }
    } catch (error) {
      console.error('❌ Error fetching categories:', error)
      setError('Erreur lors du chargement des catégories')
      
      // Données de fallback
      setCategories([
        {
          id: '1',
          slug: 'electronics',
          name: 'Électronique',
          icon: 'fa-laptop',
          description: 'Smartphones, ordinateurs, TV',
          sort_order: 1,
          listings_count: 85,
          is_trending: true,
          growth_rate: '+15%'
        },
        {
          id: '2',
          slug: 'vehicles',
          name: 'Véhicules',
          icon: 'fa-car',
          description: 'Voitures, motos, camions',
          sort_order: 2,
          listings_count: 42,
          is_trending: false,
          growth_rate: '+8%'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryClick = (categorySlug: string) => {
    router.push(`/listings?category=${categorySlug}`)
  }

  const totalListings = categories.reduce((sum, cat) => sum + (cat.listings_count || 0), 0)

  // Loading state
  if (loading) {
    return (
      <section className="py-20 lg:py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Explorez nos catégories
            </h2>
            <p className="text-lg text-slate-600">Chargement des catégories...</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-slate-100 rounded-xl p-6 animate-pulse">
                <div className="w-12 h-12 bg-slate-200 rounded-xl mb-4"></div>
                <div className="h-6 bg-slate-200 rounded mb-2"></div>
                <div className="h-4 bg-slate-200 rounded mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Error state
  if (error) {
    return (
      <section className="py-20 lg:py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Erreur de chargement</h3>
            <p className="text-slate-600 mb-6">{error}</p>
            <Button onClick={fetchCategoriesWithStats} variant="outline">
              Réessayer
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 lg:py-24 bg-white">
      <div className="container mx-auto px-6">
        
        {/* En-tête */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Building className="h-6 w-6 text-blue-600" />
            <Badge className="bg-blue-100 text-blue-800">
              {categories.length} catégories disponibles
            </Badge>
          </div>
          
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            Explorez nos catégories
          </h2>
          
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Découvrez plus de <span className="font-semibold text-blue-600">{totalListings.toLocaleString()} annonces</span> réparties 
            dans {categories.length} catégories soigneusement organisées pour faciliter vos recherches.
          </p>
        </div>

        {/* Grille des catégories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {categories.map((category) => {
            const IconComponent = iconMapping[category.icon] || Package
            const colors = getColorClasses(category.slug)
            
            return (
              <div
                key={category.id}
                onClick={() => handleCategoryClick(category.slug)}
                className={`group cursor-pointer rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-blue-100 hover:-translate-y-1 border-2 ${colors.bg} ${colors.border}`}
              >
                
                {/* En-tête avec icône et badges */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className={`h-6 w-6 ${colors.icon}`} />
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    {category.is_trending && (
                      <Badge className="bg-red-100 text-red-700 text-xs px-2 py-1">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Trending
                      </Badge>
                    )}
                    
                    <Badge className={`text-xs px-2 py-1 ${colors.badge}`}>
                      {category.growth_rate}
                    </Badge>
                  </div>
                </div>

                {/* Contenu */}
                <div className="space-y-3">
                  <h3 className={`text-xl font-bold ${colors.text} group-hover:text-blue-600 transition-colors`}>
                    {category.name}
                  </h3>
                  
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {category.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-sm text-slate-500">
                      <Package className="h-4 w-4" />
                      <span>{category.listings_count || 0} annonces</span>
                    </div>
                    
                    <ArrowRight className={`h-4 w-4 ${colors.icon} group-hover:translate-x-1 transition-transform`} />
                  </div>
                </div>

                {/* Barre de progression */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span>Popularité</span>
                    <span>{Math.min(100, Math.round((category.listings_count || 0) / Math.max(totalListings / categories.length, 1) * 100))}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500`}
                      style={{ 
                        width: `${Math.min(100, Math.round((category.listings_count || 0) / Math.max(totalListings / categories.length, 1) * 100))}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 lg:p-12 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            
            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{categories.length}</div>
                <div className="text-sm text-slate-600 font-medium">Catégories</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{totalListings.toLocaleString()}</div>
                <div className="text-sm text-slate-600 font-medium">Annonces actives</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {categories.filter(c => c.is_trending).length}
                </div>
                <div className="text-sm text-slate-600 font-medium">Catégories trending</div>
              </div>
            </div>

            <h3 className="text-2xl lg:text-3xl font-bold text-slate-900">
              Vous ne trouvez pas ce que vous cherchez ?
            </h3>
            
            <p className="text-lg text-slate-600">
              Explorez toutes nos annonces ou publiez la vôtre gratuitement en quelques minutes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => router.push('/listings')}
              >
                <Package className="h-5 w-5 mr-2" />
                Voir toutes les annonces
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
                onClick={() => router.push('/sell')}
              >
                <Building className="h-5 w-5 mr-2" />
                Publier une annonce
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}   