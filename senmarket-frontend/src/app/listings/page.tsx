'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Search,
  Filter,
  Grid,
  List,
  MapPin,
  Clock,
  Eye,
  Heart,
  Share2,
  ChevronDown,
  X,
  Loader2,
  Package,
  SlidersHorizontal,
  ArrowUpDown,
  Car,
  Home,
  Smartphone,
  Shirt,
  Briefcase,
  Wrench,
  Sofa,
  Zap,
  User,
  Star,
  MessageCircle,
  Phone,
  TrendingUp,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Crown,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFavoritesStore } from '@/stores/favorites.store';

// Types
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
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    region: string;
    is_verified: boolean;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
    icon: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
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

const SENEGAL_REGIONS = [
  'Dakar', 'Thiès', 'Saint-Louis', 'Diourbel', 'Louga', 'Fatick',
  'Kaolack', 'Kolda', 'Ziguinchor', 'Tambacounda', 'Kaffrine',
  'Kédougou', 'Matam', 'Sédhiou', 'Saraya', 'Koungheul'
];

export default function ListingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // ✅ STORE FAVORIS
  const { toggleFavorite, isFavorite } = useFavoritesStore();

  // États
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Filtres et pagination
  const [filters, setFilters] = useState<ListingFilters>({
    search: searchParams.get('search') || '',
    category_id: 'all',
    region: searchParams.get('region') || 'all',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    sort: searchParams.get('sort') || 'date',
    page: 1,
    limit: 24
  });

  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    currentPage: 1
  });

  // ✅ MAPPING DES ICÔNES LUCIDE POUR REMPLACER fa-
  const getCategoryIcon = (iconString: string) => {
    const iconMap: { [key: string]: any } = {
      'fa-car': Car,
      'fa-home': Home,
      'fa-laptop': Smartphone,
      'fa-tshirt': Shirt,
      'fa-briefcase': Briefcase,
      'fa-tools': Wrench,
      'fa-couch': Sofa,
      'fa-paw': Heart,
      'car': Car,
      'home': Home,
      'laptop': Smartphone,
      'tshirt': Shirt,
      'briefcase': Briefcase,
      'tools': Wrench,
      'couch': Sofa,
      'paw': Heart
    };
    
    return iconMap[iconString] || Package;
  };

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

  // ✅ CONVERSION SLUG → CATEGORY_ID
  const getCategoryIdFromSlug = useCallback((slug: string) => {
    const category = categories.find(cat => cat.slug === slug);
    return category ? category.id : '';
  }, [categories]);

  // Chargement initial
  useEffect(() => {
    fetchCategories();
  }, []);

  // ✅ GESTION URL PARAMS AVEC SLUG → ID
  useEffect(() => {
    if (categories.length > 0) {
      const categoryParam = searchParams.get('category') || searchParams.get('category_id');

      let categoryId = 'all';
      if (categoryParam) {
        if (categoryParam.includes('-') || categoryParam.length < 30) {
          const foundId = getCategoryIdFromSlug(categoryParam);
          categoryId = foundId || 'all';
        } else {
          categoryId = categoryParam;
        }
      }

      setFilters(prev => ({
        ...prev,
        category_id: categoryId,
        search: searchParams.get('search') || '',
        region: searchParams.get('region') || 'all',
        min_price: searchParams.get('min_price') || '',
        max_price: searchParams.get('max_price') || '',
        sort: searchParams.get('sort') || 'date'
      }));
    }
  }, [searchParams, categories, getCategoryIdFromSlug]);

  // Fetch des données
  useEffect(() => {
    if (categories.length > 0) {
      fetchListings();
    }
  }, [filters, categories]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/categories');
      const data = await response.json();
      setCategories(data.data || []);
    } catch (error) {
      console.error('❌ Erreur chargement catégories:', error);
    }
  };

  const fetchListings = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      if (filters.search) params.append('search', filters.search);
      if (filters.category_id && filters.category_id !== 'all') {
        params.append('category_id', filters.category_id);
      }
      if (filters.region && filters.region !== 'all') {
        params.append('region', filters.region);
      }
      if (filters.min_price) params.append('min_price', filters.min_price);
      if (filters.max_price) params.append('max_price', filters.max_price);
      if (filters.sort) params.append('sort', filters.sort);
      params.append('page', filters.page.toString());
      params.append('limit', filters.limit.toString());

      const url = `http://localhost:8080/api/v1/listings?${params.toString()}`;
      const response = await fetch(url);
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
      console.error('❌ Erreur chargement annonces:', error);
      setError('Erreur lors du chargement des annonces');
    } finally {
      setLoading(false);
    }
  };

  // Fonctions utilitaires
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
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'À l\'instant';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Il y a ${diffInDays}j`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `Il y a ${diffInWeeks}sem`;
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // ✅ FONCTION FAVORIS CORRIGÉE
  const handleToggleFavorite = (listing: Listing) => {
    console.log('🔥 Toggle favori pour:', listing.title);
    toggleFavorite(listing.id, listing); // ✅ Passer l'objet listing complet
  };

  // Gestion des filtres
  const handleFilterChange = (key: keyof ListingFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset page quand on change les filtres
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category_id: 'all',
      region: 'all',
      min_price: '',
      max_price: '',
      sort: 'date',
      page: 1,
      limit: 24
    });
  };

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
        
        {/* Header avec breadcrumb */}
        <section className="bg-white/90 backdrop-blur-sm border-b border-white/50 shadow-sm sticky top-16 z-40">
          <div className="container mx-auto px-6 py-6">
            
            {/* Titre et stats */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                  Toutes les annonces
                </h1>
                <p className="text-slate-600">
                  {loading ? 'Chargement...' : `${pagination.total} annonce${pagination.total !== 1 ? 's' : ''} disponible${pagination.total !== 1 ? 's' : ''}`}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Mode d'affichage */}
                <div className="flex bg-white rounded-xl border border-slate-200 p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="px-3"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="px-3"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                {/* Bouton filtres mobile */}
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtres
                </Button>

                {/* Refresh */}
                <Button
                  variant="outline"
                  onClick={fetchListings}
                  disabled={loading}
                  size="sm"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Barre de filtres */}
            <div className={`grid grid-cols-1 lg:grid-cols-5 gap-4 transition-all duration-300 ${showFilters || window.innerWidth >= 1024 ? 'block' : 'hidden lg:grid'}`}>
              
              {/* Recherche */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Rechercher une annonce..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10 bg-white/90 border-slate-200 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Catégorie */}
              <div>
                <select
                  value={filters.category_id}
                  onChange={(e) => handleFilterChange('category_id', e.target.value)}
                  className="w-full px-3 py-2 bg-white/90 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Toutes catégories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Région */}
              <div>
                <select
                  value={filters.region}
                  onChange={(e) => handleFilterChange('region', e.target.value)}
                  className="w-full px-3 py-2 bg-white/90 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Toutes régions</option>
                  {SENEGAL_REGIONS.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tri */}
              <div>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="w-full px-3 py-2 bg-white/90 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="date">Plus récent</option>
                  <option value="price_asc">Prix croissant</option>
                  <option value="price_desc">Prix décroissant</option>
                  <option value="views">Plus vues</option>
                </select>
              </div>
            </div>

            {/* Filtres actifs */}
            {(filters.search || filters.category_id !== 'all' || filters.region !== 'all' || filters.min_price || filters.max_price) && (
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-200">
                <span className="text-sm text-slate-600 font-medium">Filtres actifs :</span>
                
                {filters.search && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Search className="h-3 w-3" />
                    {filters.search}
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-red-500" 
                      onClick={() => handleFilterChange('search', '')}
                    />
                  </Badge>
                )}
                
                {filters.category_id !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    {categories.find(c => c.id === filters.category_id)?.name}
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-red-500" 
                      onClick={() => handleFilterChange('category_id', 'all')}
                    />
                  </Badge>
                )}
                
                {filters.region !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {filters.region}
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-red-500" 
                      onClick={() => handleFilterChange('region', 'all')}
                    />
                  </Badge>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Tout effacer
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Contenu principal */}
        <div className="container mx-auto px-6 py-8">
          
          {/* Loading state */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-slate-600">Chargement des annonces...</p>
              </div>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="text-center py-20">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-800 mb-2">Erreur de chargement</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={fetchListings} className="bg-red-600 hover:bg-red-700 text-white">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Réessayer
                </Button>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && listings.length === 0 && (
            <div className="text-center py-20">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-lg border border-white/50 max-w-2xl mx-auto">
                <Package className="h-16 w-16 text-slate-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  Aucune annonce trouvée
                </h3>
                <p className="text-slate-600 mb-8">
                  Aucune annonce ne correspond à vos critères de recherche.
                  Essayez de modifier vos filtres ou de rechercher autre chose.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={clearFilters} variant="outline">
                    <X className="h-4 w-4 mr-2" />
                    Effacer les filtres
                  </Button>
                  <Link href="/sell">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Publier une annonce
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Listings grid/list */}
          {!loading && !error && listings.length > 0 && (
            <AnimatePresence mode="wait">
              
              {/* Mode grille */}
              {viewMode === 'grid' && (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                  {listings.map((listing, index) => (
                    <motion.div
                      key={listing.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="group bg-white/90 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden h-full flex flex-col">
                        
                        {/* Image */}
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <Link href={`/listings/${listing.id}`}>
                            <img
                              src={getImageUrl(listing.images?.[0]) || '/placeholder-image.jpg'}
                              alt={listing.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </Link>
                          
                          {/* Actions overlay */}
                          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="icon"
                              variant="secondary"
                              className={`bg-white/95 hover:bg-white shadow-lg ${
                                isFavorite(listing.id) ? 'text-red-500' : 'text-slate-600'
                              }`}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleToggleFavorite(listing); // ✅ CORRIGÉ
                              }}
                            >
                              <Heart className={`h-4 w-4 ${isFavorite(listing.id) ? 'fill-current' : ''}`} />
                            </Button>
                            <Button
                              size="icon"
                              variant="secondary"
                              className="bg-white/95 hover:bg-white shadow-lg text-slate-600"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (navigator.share) {
                                  navigator.share({
                                    title: listing.title,
                                    url: `${window.location.origin}/listings/${listing.id}`
                                  });
                                }
                              }}
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Badges */}
                          <div className="absolute bottom-3 left-3 flex gap-2">
                            <Badge className="bg-black/70 text-white border-0">
                              <Eye className="h-3 w-3 mr-1" />
                              {listing.views_count || 0}
                            </Badge>
                            {listing.is_featured && (
                              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                                <Star className="h-3 w-3 mr-1 fill-current" />
                                Premium
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Contenu */}
                        <CardContent className="p-4 flex-1 flex flex-col">
                          <div className="space-y-3 flex-1">
                            
                            {/* Titre et prix */}
                            <div>
                              <Link href={`/listings/${listing.id}`}>
                                <h3 className="font-bold text-slate-900 text-lg leading-tight hover:text-blue-600 transition-colors">
                                  {truncateText(listing.title, 60)}
                                </h3>
                              </Link>
                              <div className="text-2xl font-bold text-blue-600 mt-1">
                                {formatPrice(listing.price)}
                              </div>
                            </div>

                            {/* Description */}
                            <p className="text-slate-600 text-sm leading-relaxed">
                              {truncateText(listing.description, 80)}
                            </p>

                            {/* Localisation et catégorie */}
                            <div className="flex items-center justify-between text-sm text-slate-500">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{listing.region}</span>
                              </div>
                              {listing.category && (
                                <div className="flex items-center gap-1">
                                  {React.createElement(getCategoryIcon(listing.category.icon), { className: "h-4 w-4" })}
                                  <span>{listing.category.name}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between text-sm text-slate-500 pt-3 mt-3 border-t border-slate-100">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              <span>
                                {listing.user?.first_name} {listing.user?.last_name}
                                {listing.user?.is_verified && (
                                  <CheckCircle className="h-3 w-3 text-green-500 inline ml-1" />
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{formatTimeAgo(listing.created_at)}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Mode liste */}
              {viewMode === 'list' && (
                <motion.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {listings.map((listing, index) => (
                    <motion.div
                      key={listing.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                    >
                      <Card className="group bg-white/90 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                        <CardContent className="p-6">
                          <div className="flex gap-6">
                            
                            {/* Image */}
                            <div className="flex-shrink-0 w-32 h-24 rounded-lg overflow-hidden">
                              <Link href={`/listings/${listing.id}`}>
                                <img
                                  src={getImageUrl(listing.images?.[0]) || '/placeholder-image.jpg'}
                                  alt={listing.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </Link>
                            </div>

                            {/* Contenu */}
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1 min-w-0 mr-4">
                                  <Link href={`/listings/${listing.id}`}>
                                    <h3 className="font-bold text-xl text-slate-900 hover:text-blue-600 transition-colors mb-1">
                                      {listing.title}
                                    </h3>
                                  </Link>
                                  <p className="text-slate-600 text-sm leading-relaxed">
                                    {truncateText(listing.description, 120)}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-blue-600 mb-2">
                                    {formatPrice(listing.price)}
                                  </div>
                                  <div className="flex gap-1">
                                    <Button
                                      size="icon"
                                      variant="outline"
                                      className={`h-8 w-8 ${
                                        isFavorite(listing.id) 
                                          ? 'text-red-500 border-red-200 bg-red-50' 
                                          : 'text-slate-600'
                                      }`}
                                      onClick={() => handleToggleFavorite(listing)}
                                    >
                                      <Heart className={`h-4 w-4 ${isFavorite(listing.id) ? 'fill-current' : ''}`} />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="outline"
                                      className="h-8 w-8"
                                      onClick={() => {
                                        if (navigator.share) {
                                          navigator.share({
                                            title: listing.title,
                                            url: `${window.location.origin}/listings/${listing.id}`
                                          });
                                        }
                                      }}
                                    >
                                      <Share2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>

                              {/* Métadonnées */}
                              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>{listing.region}</span>
                                </div>
                                {listing.category && (
                                  <div className="flex items-center gap-1">
                                    {React.createElement(getCategoryIcon(listing.category.icon), { className: "h-4 w-4" })}
                                    <span>{listing.category.name}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <User className="h-4 w-4" />
                                  <span>
                                    {listing.user?.first_name} {listing.user?.last_name}
                                    {listing.user?.is_verified && (
                                      <CheckCircle className="h-3 w-3 text-green-500 inline ml-1" />
                                    )}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{formatTimeAgo(listing.created_at)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Eye className="h-4 w-4" />
                                  <span>{listing.views_count || 0} vues</span>
                                </div>
                                {listing.is_featured && (
                                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                                    <Star className="h-3 w-3 mr-1 fill-current" />
                                    Premium
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* Pagination */}
          {!loading && !error && listings.length > 0 && pagination.pages > 1 && (
            <motion.div 
              className="flex justify-center mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/50">
                
                {/* Page précédente */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-3"
                >
                  <ChevronDown className="h-4 w-4 rotate-90" />
                  Précédent
                </Button>

                {/* Numéros de pages */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                    let pageNum;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else {
                      if (pagination.currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage >= pagination.pages - 2) {
                        pageNum = pagination.pages - 4 + i;
                      } else {
                        pageNum = pagination.currentPage - 2 + i;
                      }
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === pagination.currentPage ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                {/* Page suivante */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.pages}
                  className="px-3"
                >
                  Suivant
                  <ChevronDown className="h-4 w-4 -rotate-90" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Stats en bas */}
          {!loading && !error && listings.length > 0 && (
            <motion.div 
              className="text-center mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50 inline-block">
                <div className="flex items-center gap-6 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-500" />
                    <span>
                      Affichage de <strong>{(pagination.currentPage - 1) * filters.limit + 1}</strong> à{' '}
                      <strong>{Math.min(pagination.currentPage * filters.limit, pagination.total)}</strong> sur{' '}
                      <strong>{pagination.total}</strong> annonces
                    </span>
                  </div>
                  <div className="w-px h-4 bg-slate-300"></div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span>Page <strong>{pagination.currentPage}</strong> sur <strong>{pagination.pages}</strong></span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}