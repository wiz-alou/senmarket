'use client'

import { useState } from 'react'
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
  Briefcase
} from 'lucide-react'

export function SearchSection() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedRegion, setSelectedRegion] = useState('all')

  const categories = [
    { id: 'all', name: 'Toutes catégories', icon: Building, count: '8.5K' },
    { id: 'vehicles', name: 'Véhicules', icon: Car, count: '1.2K' },
    { id: 'real-estate', name: 'Immobilier', icon: Home, count: '890' },
    { id: 'electronics', name: 'Électronique', icon: Smartphone, count: '2.1K' },
    { id: 'jobs', name: 'Emploi', icon: Briefcase, count: '420' },
  ]

  const regions = [
    'Toutes les régions', 'Dakar', 'Thiès', 'Saint-Louis', 'Diourbel', 
    'Kaolack', 'Tambacounda', 'Kolda', 'Ziguinchor', 'Fatick',
    'Kaffrine', 'Kédougou', 'Louga', 'Matam', 'Sédhiou'
  ]

  const trendingSearches = [
    'iPhone 15', 'Appartement Dakar', 'Voiture Toyota', 'Emploi Banque',
    'Villa Almadies', 'Samsung Galaxy', 'Stage étudiant', 'Terrain à vendre'
  ]

  return (
    <section className="bg-gradient-to-br from-slate-50 to-blue-50 py-16 lg:py-20">
      <div className="container-fluid">
        <div className="max-w-5xl mx-auto">
          
          {/* Titre principal */}
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Trouvez exactement ce que vous cherchez
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Recherchez parmi plus de <span className="font-semibold text-blue-600">8,500 annonces vérifiées</span> dans 
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
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                </div>

                {/* Sélecteur de catégorie */}
                <div className="lg:col-span-3">
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name} ({category.count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sélecteur de région */}
                <div className="lg:col-span-2">
                  <select 
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white"
                  >
                    {regions.map((region) => (
                      <option key={region} value={region.toLowerCase().replace(' ', '-')}>
                        {region}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bouton de recherche */}
                <div className="lg:col-span-2">
                  <Button className="w-full h-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-base">
                    <Search className="h-5 w-5 mr-2" />
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
                    <span>Recherche dans un rayon de 50km</span>
                  </div>
                </div>

                <div className="text-sm text-gray-500">
                  Dernière mise à jour : il y a 5 minutes
                </div>
              </div>
            </div>
          </div>

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
                  className="bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer px-3 py-1 text-sm font-medium transition-colors"
                >
                  {search}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}