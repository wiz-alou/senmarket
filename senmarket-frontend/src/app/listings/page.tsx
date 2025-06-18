'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search,
  Filter,
  Grid3X3,
  List,
  SlidersHorizontal,
  MapPin,
  Clock,
  Heart,
  Share2,
  Star,
  ChevronDown,
  X,
  Tag,
  TrendingUp,
  Eye,
  Users,
  ArrowUpDown,
  Loader2,
  AlertCircle
} from 'lucide-react';

// Types basés sur votre API
interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  region: string;
  images: string[];
  status: string;
  views_count: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    region: string;
    is_verified: boolean;
  };
  category: {
    id: string;
    name: string;
    slug: string;
    icon: string;
    description: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  sort_order: number;
}

interface ListingFilters {
  search: string;
  category_id: string;
  region: string;
  min_price: string;
  max_price: string;
  sort: string;
  page: number;
  limit: number;
}

export default function ListingsPage() {
  // États
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Filtres et pagination
  const [filters, setFilters] = useState<ListingFilters>({
    search: '',
    category_id: '',
    region: '',
    min_price: '',
    max_price: '',
    sort: 'date',
    page: 1,
    limit: 20
  });

  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    currentPage: 1
  });

  // Régions du Sénégal (basées sur votre API)
  const regions = [
    "Dakar - Plateau", "Dakar - Almadies", "Dakar - Parcelles Assainies",
    "Dakar - Ouakam", "Dakar - Point E", "Dakar - Pikine", "Dakar - Guédiawaye",
    "Thiès", "Saint-Louis", "Kaolack", "Ziguinchor", "Diourbel",
    "Louga", "Fatick", "Kolda", "Tambacounda"
  ];

  // Options de tri
  const sortOptions = [
    { value: 'date', label: 'Plus récent' },
    { value: 'price_asc', label: 'Prix croissant' },
    { value: 'price_desc', label: 'Prix décroissant' },
    { value: 'views', label: 'Plus populaire' }
  ];

  // Chargement des données
  useEffect(() => {
    fetchCategories();
    fetchListings();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/categories');
      const data = await response.json();
      setCategories(data.data || []);
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
    }
  };

  const fetchListings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });

      const response = await fetch(`http://localhost:8080/api/v1/listings?${params}`);
      const data = await response.json();

      if (data.data) {
        setListings(data.data.listings || []);
        setPagination({
          total: data.data.total || 0,
          pages: data.data.pages || 0,
          currentPage: data.data.page || 1
        });
      }
    } catch (error) {
      setError('Erreur lors du chargement des annonces');
      console.error('Erreur chargement annonces:', error);
    } finally {
      setLoading(false);
    }
  };

  // Gestionnaires d'événements
  const handleFilterChange = (key: keyof ListingFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value // Reset page sauf si on change la page
    }));
  };

  const toggleFavorite = (listingId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(listingId)) {
        newFavorites.delete(listingId);
      } else {
        newFavorites.add(listingId);
      }
      return newFavorites;
    });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category_id: '',
      region: '',
      min_price: '',
      max_price: '',
      sort: 'date',
      page: 1,
      limit: 20
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-SN', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) return `${minutes}min`;
    if (hours < 24) return `${hours}h`;
    return `${days}j`;
  };

  // Composant Card d'annonce
  const ListingCard = ({ listing }: { listing: Listing }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`group cursor-pointer ${viewMode === 'list' ? 'w-full' : ''}`}
    >
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 shadow-lg">
        <div className={`${viewMode === 'list' ? 'flex' : ''}`}>
          
          {/* Image */}
          <div className={`relative bg-gradient-to-br from-blue-100 to-orange-100 ${
            viewMode === 'list' ? 'w-64 h-48 flex-shrink-0' : 'h-48'
          } flex items-center justify-center`}>
            
            {listing.images && listing.images.length > 0 ? (
              <img
                src={`http://localhost:8080${listing.images[0]}`}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-6xl">{listing.category.icon || '📦'}</div>
            )}
            
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {listing.is_featured && (
                <Badge className="bg-yellow-500 text-white">
                  ⭐ Vedette
                </Badge>
              )}
              <Badge variant="secondary" className="text-xs">
                {listing.category.name}
              </Badge>
            </div>
            
            {/* Actions */}
            <div className="absolute top-3 right-3 flex flex-col gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="bg-white/80 hover:bg-white"
                onClick={(e) => {
                  e.preventDefault();
                  toggleFavorite(listing.id);
                }}
              >
                <Heart className={`h-4 w-4 ${
                  favorites.has(listing.id) ? 'fill-red-500 text-red-500' : ''
                }`} />
              </Button>
              
              <Button
                size="icon"
                variant="ghost"
                className="bg-white/80 hover:bg-white"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Views */}
            <div className="absolute bottom-3 left-3 bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center">
              <Eye className="h-3 w-3 mr-1" />
              {listing.views_count}
            </div>
          </div>

          {/* Contenu */}
          <CardContent className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
            <div className="space-y-3">
              
              {/* Titre et prix */}
              <div className={`${viewMode === 'list' ? 'flex items-start justify-between' : ''}`}>
                <h3 className={`font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors ${
                  viewMode === 'list' ? 'text-lg flex-1 mr-4' : 'text-base'
                }`}>
                  {listing.title}
                </h3>
                
                <div className={`${viewMode === 'list' ? 'text-right' : 'mt-2'}`}>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatPrice(listing.price)}
                  </div>
                </div>
              </div>
              
              {/* Description (seulement en mode liste) */}
              {viewMode === 'list' && (
                <p className="text-slate-600 line-clamp-2 text-sm">
                  {listing.description}
                </p>
              )}
              
              {/* Vendeur */}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-3 w-3 text-blue-600" />
                </div>
                <span className="text-sm text-slate-600">
                  {listing.user.first_name} {listing.user.last_name}
                </span>
                {listing.user.is_verified && (
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
              
              {/* Métadonnées */}
              <div className="flex items-center justify-between text-sm text-slate-500">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{listing.region}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatTimeAgo(listing.created_at)}</span>
                </div>
              </div>
              
              {/* Bouton action */}
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Voir les détails
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-slate-50">
        
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="container mx-auto px-6">
            <div className="text-center space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold">
                Découvrez nos Annonces
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Plus de {pagination.total.toLocaleString()} annonces dans tout le Sénégal
              </p>
              
              {/* Barre de recherche principale */}
              <div className="max-w-2xl mx-auto mt-8">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Rechercher des produits, services..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-12 py-3 text-lg bg-white border-0 focus:ring-2 focus:ring-blue-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filtres et contrôles */}
        <section className="bg-white border-b border-slate-200 sticky top-16 z-40">
          <div className="container mx-auto px-6 py-4">
            
            {/* Barre de contrôles */}
            <div className="flex items-center justify-between mb-4">
              
              {/* Résultats */}
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Chargement...
                    </div>
                  ) : (
                    `${pagination.total.toLocaleString()} annonce${pagination.total > 1 ? 's' : ''}`
                  )}
                </h2>
                
                {Object.values(filters).some(v => v && v !== 'date' && v !== 1 && v !== 20) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="text-slate-600"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Effacer filtres
                  </Button>
                )}
              </div>

              {/* Contrôles d'affichage */}
              <div className="flex items-center gap-3">
                
                {/* Tri */}
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4 text-slate-600" />
                  <select
                    value={filters.sort}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Mode d'affichage */}
                <div className="flex border border-slate-300 rounded-lg overflow-hidden">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-none"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Bouton filtres */}
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filtres
                  <ChevronDown className={`h-4 w-4 transition-transform ${
                    showFilters ? 'rotate-180' : ''
                  }`} />
                </Button>
              </div>
            </div>

            {/* Panneau de filtres */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-slate-200 pt-4 overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    {/* Catégorie */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Catégorie
                      </label>
                      <select
                        value={filters.category_id}
                        onChange={(e) => handleFilterChange('category_id', e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Toutes les catégories</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.icon} {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Région */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Région
                      </label>
                      <select
                        value={filters.region}
                        onChange={(e) => handleFilterChange('region', e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Toutes les régions</option>
                        {regions.map(region => (
                          <option key={region} value={region}>
                            {region}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Prix minimum */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Prix minimum (FCFA)
                      </label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={filters.min_price}
                        onChange={(e) => handleFilterChange('min_price', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    
                    {/* Prix maximum */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Prix maximum (FCFA)
                      </label>
                      <Input
                        type="number"
                        placeholder="Aucune limite"
                        value={filters.max_price}
                        onChange={(e) => handleFilterChange('max_price', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Contenu principal */}
        <section className="container mx-auto px-6 py-8">
          
          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            </div>
          )}
          
          {/* Liste des annonces */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="h-48 bg-slate-200 animate-pulse"></div>
                  <CardContent className="p-4 space-y-3">
                    <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
                    <div className="h-6 bg-slate-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-slate-200 rounded animate-pulse w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-semibold text-slate-700 mb-2">
                Aucune annonce trouvée
              </h3>
              <p className="text-slate-600 mb-6">
                Essayez de modifier vos critères de recherche
              </p>
              <Button onClick={clearFilters} variant="outline">
                Effacer tous les filtres
              </Button>
            </div>
          ) : (
            <motion.div
              layout
              className={`grid gap-6 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'grid-cols-1'
              }`}
            >
              <AnimatePresence>
                {listings.map(listing => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Pagination */}
          {!loading && listings.length > 0 && pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              
              {/* Page précédente */}
              <Button
                variant="outline"
                disabled={pagination.currentPage === 1}
                onClick={() => handleFilterChange('page', pagination.currentPage - 1)}
              >
                Précédent
              </Button>
              
              {/* Numéros de page */}
              {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                const pageNum = Math.max(1, pagination.currentPage - 2) + i;
                if (pageNum > pagination.pages) return null;
                
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === pagination.currentPage ? 'default' : 'outline'}
                    onClick={() => handleFilterChange('page', pageNum)}
                    className="w-10 h-10"
                  >
                    {pageNum}
                  </Button>
                );
              })}
              
              {/* Page suivante */}
              <Button
                variant="outline"
                disabled={pagination.currentPage === pagination.pages}
                onClick={() => handleFilterChange('page', pagination.currentPage + 1)}
              >
                Suivant
              </Button>
            </div>
          )}
        </section>
      </main>
      
      <Footer />
    </>
  );
}