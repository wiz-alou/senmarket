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
  Car,
  Home,
  Smartphone,
  Shirt,
  Briefcase,
  Wrench,
  Sofa,
  User,
  Star,
  TrendingUp,
  CheckCircle,
  Crown,
  RefreshCw,
  AlertCircle,
  Plus,
  ChevronLeft,
  ChevronRight,
  Flame
} from 'lucide-react';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFavoritesStore } from '@/stores/favorites.store';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';

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
  
  const { isAuthenticated, user } = useAuthStore();
  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore();

  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<ListingFilters>({
    search: searchParams.get('search') || '',
    category_id: 'all',
    region: searchParams.get('region') || 'all',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    sort: searchParams.get('sort') || 'date',
    page: 1,
    limit: 25
  });

  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    currentPage: 1
  });

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

  const getCategoryIdFromSlug = useCallback((slug: string) => {
    const category = categories.find(cat => cat.slug === slug);
    return category ? category.id : '';
  }, [categories]);

  useEffect(() => {
    fetchCategories();
  }, []);

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
      console.error('Erreur chargement catégories:', error);
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

    console.log('🔍 DEBUG - API Response:', data);

    if (data.data) {
      setListings(data.data.listings || []);
      
      // 🔧 CORRECTION: Mapper correctement la pagination
      const paginationData = data.data.pagination || {};
      
      setPagination({
        total: paginationData.total || data.data.total || 0,
        pages: paginationData.pages || data.data.pages || 0,
        currentPage: paginationData.page || data.data.page || 1
      });

      console.log('🔍 DEBUG - Pagination Set:', {
        total: paginationData.total || data.data.total || 0,
        pages: paginationData.pages || data.data.pages || 0,
        currentPage: paginationData.page || data.data.page || 1
      });
    }
  } catch (error) {
    console.error('Erreur chargement annonces:', error);
    setError('Erreur lors du chargement des annonces');
  } finally {
    setLoading(false);
  }
};

// 🆕 AJOUT: Debug hook pour tracer la pagination
useEffect(() => {
  console.log('🔍 DEBUG PAGINATION STATE:', {
    loading,
    error,
    listingsLength: listings.length,
    pagination,
    shouldShowPagination: !loading && !error && listings.length > 0 && pagination.pages > 1
  });
}, [loading, error, listings, pagination]);


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

  const handleToggleFavorite = (listing: Listing) => {
    if (!isAuthenticated || !user) {
      toast.error('Connectez-vous pour sauvegarder des annonces', {
        action: {
          label: 'Se connecter',
          onClick: () => router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname))
        }
      });
      return;
    }

    if (isFavorite(listing.id)) {
      removeFavorite(listing.id);
      toast.success('Annonce retirée des favoris', { icon: '💔' });
    } else {
      addFavorite(listing.id, {
        id: listing.id,
        title: listing.title,
        price: listing.price,
        currency: listing.currency,
        images: listing.images,
        region: listing.region,
        addedAt: new Date().toISOString(),
        category: listing.category,
        user: listing.user ? {
          first_name: listing.user.first_name,
          last_name: listing.user.last_name
        } : undefined
      });
      toast.success('Annonce sauvegardée !', { 
        icon: '❤️',
        action: {
          label: 'Voir mes favoris',
          onClick: () => router.push('/favorites')
        }
      });
    }
  };

  const handleFilterChange = (key: keyof ListingFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
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
      limit: 25
    });
  };

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
        
        {/* HEADER ULTRA-COMPACT */}
        <section className="relative">
          <div className="bg-gradient-to-r from-blue-600/95 via-purple-600/95 to-indigo-700/95">
            <div className="container mx-auto px-6 py-8">
              
              {/* Titre et sous-titre compacts */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-white mb-8"
              >
                <h1 className="text-2xl md:text-3xl font-bold mb-2 text-white">
                  Découvrez les meilleures affaires
                </h1>
                <p className="text-sm md:text-base text-blue-100">
                  {loading ? 'Chargement...' : `${pagination.total.toLocaleString()} annonce${pagination.total !== 1 ? 's' : ''} disponible${pagination.total !== 1 ? 's' : ''}`}
                </p>
              </motion.div>

              {/* BARRE DE RECHERCHE ULTRA-COMPACTE */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="max-w-4xl mx-auto"
              >
                <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    
                    {/* Recherche principale */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        type="text"
                        placeholder="Rechercher..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="pl-10 h-10 text-sm border-0 bg-slate-50 focus:bg-white transition-colors rounded-lg"
                      />
                    </div>

                    {/* Sélecteur de catégorie */}
                    <div className="relative">
                      <select
                        value={filters.category_id}
                        onChange={(e) => handleFilterChange('category_id', e.target.value)}
                        className="w-full h-10 px-3 bg-slate-50 border-0 rounded-lg focus:bg-white transition-colors appearance-none text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">Toutes catégories</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Sélecteur de région */}
                    <div className="relative">
                      <select
                        value={filters.region}
                        onChange={(e) => handleFilterChange('region', e.target.value)}
                        className="w-full h-10 px-3 bg-slate-50 border-0 rounded-lg focus:bg-white transition-colors appearance-none text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">Toutes régions</option>
                        {SENEGAL_REGIONS.map((region) => (
                          <option key={region} value={region}>
                            {region}
                          </option>
                        ))}
                      </select>
                      <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Bouton rechercher */}
                    <Button
                      onClick={fetchListings}
                      disabled={loading}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-10 rounded-lg"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Filtres avancés compacts */}
                  <AnimatePresence>
                    {showFilters && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-3 pt-3 border-t border-slate-200 overflow-hidden"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div>
                            <Input
                              type="number"
                              placeholder="Prix min"
                              value={filters.min_price}
                              onChange={(e) => handleFilterChange('min_price', e.target.value)}
                              className="h-8 text-sm rounded-lg"
                            />
                          </div>
                          <div>
                            <Input
                              type="number"
                              placeholder="Prix max"
                              value={filters.max_price}
                              onChange={(e) => handleFilterChange('max_price', e.target.value)}
                              className="h-8 text-sm rounded-lg"
                            />
                          </div>
                          <div>
                            <select
                              value={filters.sort}
                              onChange={(e) => handleFilterChange('sort', e.target.value)}
                              className="w-full h-8 px-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="date">Plus récent</option>
                              <option value="price_asc">Prix ↗</option>
                              <option value="price_desc">Prix ↘</option>
                              <option value="views">Plus vues</option>
                            </select>
                          </div>
                          <div className="flex gap-2">
                            {(filters.search || filters.category_id !== 'all' || filters.region !== 'all' || filters.min_price || filters.max_price) && (
                              <Button
                                variant="outline"
                                onClick={clearFilters}
                                size="sm"
                                className="text-red-600 border-red-200 hover:bg-red-50 h-8 px-3 text-xs"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              onClick={() => setShowFilters(false)}
                              size="sm"
                              className="text-slate-600 h-8 px-3 text-xs"
                            >
                              Fermer
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Toggle filtres */}
                  {!showFilters && (
                    <div className="mt-3 text-center">
                      <Button
                        variant="ghost"
                        onClick={() => setShowFilters(true)}
                        size="sm"
                        className="text-slate-600 hover:text-slate-900 text-xs"
                      >
                        <SlidersHorizontal className="h-3 w-3 mr-1" />
                        Filtres avancés
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* BARRE DE CONTRÔLES ET FILTRES ACTIFS */}
        <section className="bg-white/90 backdrop-blur-sm border-b border-white/50 shadow-sm sticky top-16 z-40">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              
              {/* Filtres actifs */}
              <div className="flex items-center gap-2 flex-1">
                {filters.search && (
                  <Badge variant="secondary" className="flex items-center gap-1 bg-blue-100 text-blue-700">
                    <Search className="h-3 w-3" />
                    {truncateText(filters.search, 20)}
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-red-500" 
                      onClick={() => handleFilterChange('search', '')}
                    />
                  </Badge>
                )}
                
                {filters.category_id !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1 bg-purple-100 text-purple-700">
                    <Package className="h-3 w-3" />
                    {categories.find(c => c.id === filters.category_id)?.name}
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-red-500" 
                      onClick={() => handleFilterChange('category_id', 'all')}
                    />
                  </Badge>
                )}
                
                {filters.region !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-700">
                    <MapPin className="h-3 w-3" />
                    {filters.region}
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-red-500" 
                      onClick={() => handleFilterChange('region', 'all')}
                    />
                  </Badge>
                )}
              </div>

              {/* Contrôles d'affichage */}
              <div className="flex items-center gap-3">
                <div className="flex bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
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

                <Button
                  variant="outline"
                  onClick={fetchListings}
                  disabled={loading}
                  size="sm"
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* CONTENU PRINCIPAL */}
        <div className="container mx-auto px-6 py-8">
          
          {/* État de chargement */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-6">
                    <Loader2 className="h-10 w-10 animate-spin text-white" />
                  </div>
                  <div className="absolute inset-0 w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-ping opacity-20"></div>
                </div>
                <p className="text-slate-700 text-xl font-medium">Recherche des meilleures offres...</p>
                <p className="text-slate-500 mt-2">Cela ne prendra qu'un instant</p>
              </motion.div>
            </div>
          )}

          {/* État d'erreur */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-3xl p-12 max-w-md mx-auto shadow-lg">
                <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-red-800 mb-4">Oops, une erreur !</h3>
                <p className="text-red-600 mb-6">{error}</p>
                <Button 
                  onClick={fetchListings} 
                  className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-8"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Réessayer
                </Button>
              </div>
            </motion.div>
          )}

          {/* Aucun résultat */}
          {!loading && !error && listings.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-3xl p-12 shadow-xl border border-white/50 max-w-2xl mx-auto">
                <div className="w-24 h-24 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Package className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-4">
                  Aucune annonce trouvée
                </h3>
                <p className="text-slate-600 mb-8 text-lg leading-relaxed">
                  Aucune annonce ne correspond à vos critères de recherche.
                  Essayez de modifier vos filtres ou explorez d'autres catégories.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={clearFilters} 
                    variant="outline"
                    className="bg-white/80 border-white/50 shadow-lg rounded-xl px-8 py-3"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Effacer les filtres
                  </Button>
                  <Link href="/sell">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl">
                      <Plus className="h-4 w-4 mr-2" />
                      Publier une annonce
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* Grille des annonces */}
          {!loading && !error && listings.length > 0 && (
            <AnimatePresence mode="wait">
              
              {viewMode === 'grid' && (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6"
                >
                  {listings.map((listing, index) => (
                    <motion.div
                      key={listing.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <Card className="group bg-white/95 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden h-full flex flex-col rounded-xl">
                        
                        {/* IMAGE PLUS COMPACTE */}
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <Link href={`/listings/${listing.id}`}>
                            <img
                              src={getImageUrl(listing.images?.[0]) || '/placeholder-image.jpg'}
                              alt={listing.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </Link>
                          
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          
                          {/* Actions hover compactes */}
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <Button
                              size="icon"
                              className={`w-8 h-8 rounded-full shadow-md ${
                                isFavorite(listing.id) 
                                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                                  : 'bg-white/90 hover:bg-white text-slate-700'
                              }`}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleToggleFavorite(listing);
                              }}
                            >
                              <Heart className={`h-3 w-3 ${isFavorite(listing.id) ? 'fill-current' : ''}`} />
                            </Button>
                            <Button
                              size="icon"
                              className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-md"
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
                              <Share2 className="h-3 w-3" />
                            </Button>
                          </div>

                          {/* Badges compacts */}
                          <div className="absolute bottom-2 left-2 flex gap-1">
                            <Badge className="bg-black/60 text-white border-0 text-xs px-2 py-0.5">
                              <Eye className="h-2 w-2 mr-1" />
                              {listing.views_count || 0}
                            </Badge>
                            {listing.is_featured && (
                              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 text-xs px-2 py-0.5">
                                <Crown className="h-2 w-2 mr-1" />
                                VIP
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* CONTENU ULTRA-COMPACT */}
                        <CardContent className="p-3 flex-1 flex flex-col">
                          <div className="space-y-2 flex-1">
                            
                            <div>
                              <Link href={`/listings/${listing.id}`}>
                                <h3 className="font-bold text-slate-900 text-xs leading-tight hover:text-blue-600 transition-colors line-clamp-2 group-hover:text-blue-600">
                                  {listing.title}
                                </h3>
                              </Link>
                              <div className="text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-1">
                                {formatPrice(listing.price)}
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1 text-slate-500">
                                <MapPin className="h-2 w-2" />
                                <span className="text-xs">{listing.region}</span>
                              </div>
                              {listing.category && (
                                <div className="flex items-center gap-1 bg-slate-100 rounded-full px-1.5 py-0.5">
                                  {React.createElement(getCategoryIcon(listing.category.icon), { 
                                    className: "h-2 w-2 text-blue-600" 
                                  })}
                                  <span className="text-slate-700 font-medium text-xs">{listing.category.name}</span>
                                </div>
                              )}
                            </div>

                            {/* BOUTON TRÈS COMPACT */}
                            <div className="pt-1">
                              <Link href={`/listings/${listing.id}`}>
                                <Button size="sm" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-md shadow-sm hover:shadow-md transition-all text-xs h-5 px-1">
                                  Voir
                                </Button>
                              </Link>
                            </div>
                          </div>

                          {/* FOOTER MINIMAL - JUSTE DATE */}
                          <div className="flex justify-center text-xs text-slate-500 pt-2 mt-2 border-t border-slate-100">
                            <div className="flex items-center gap-1">
                              <Clock className="h-2 w-2" />
                              <span className="text-xs">{formatTimeAgo(listing.created_at)}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              )}

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
                      <Card className="group bg-white/95 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 overflow-hidden rounded-xl">
                        <CardContent className="p-3">
                          <div className="flex gap-3">
                            
                            {/* IMAGE PLUS PETITE */}
                            <div className="flex-shrink-0 w-24 h-18 rounded-lg overflow-hidden">
                              <Link href={`/listings/${listing.id}`}>
                                <img
                                  src={getImageUrl(listing.images?.[0]) || '/placeholder-image.jpg'}
                                  alt={listing.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </Link>
                            </div>

                            {/* CONTENU COMPACT */}
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <div className="flex-1 min-w-0 mr-4">
                                  <div className="flex items-start gap-2 mb-1">
                                    <Link href={`/listings/${listing.id}`}>
                                      <h3 className="font-bold text-base text-slate-900 hover:text-blue-600 transition-colors line-clamp-1">
                                        {listing.title}
                                      </h3>
                                    </Link>
                                    {listing.is_featured && (
                                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 text-xs px-1.5 py-0.5">
                                        <Crown className="h-2 w-2 mr-1" />
                                        VIP
                                      </Badge>
                                    )}
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2 text-xs mb-2">
                                    <div className="flex items-center gap-1 bg-slate-100 rounded-full px-2 py-0.5">
                                      <MapPin className="h-2 w-2 text-blue-600" />
                                      <span className="font-medium text-slate-700 text-xs">{listing.region}</span>
                                    </div>
                                    {listing.category && (
                                      <div className="flex items-center gap-1 bg-purple-100 rounded-full px-2 py-0.5">
                                        {React.createElement(getCategoryIcon(listing.category.icon), { 
                                          className: "h-2 w-2 text-purple-600" 
                                        })}
                                        <span className="font-medium text-purple-700 text-xs">{listing.category.name}</span>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-1 text-slate-500">
                                      <Clock className="h-2 w-2" />
                                      <span className="text-xs">{formatTimeAgo(listing.created_at)}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-slate-500">
                                      <Eye className="h-2 w-2" />
                                      <span className="text-xs">{listing.views_count || 0}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* SECTION PRIX ET ACTIONS COMPACTE */}
                                <div className="text-right flex-shrink-0">
                                  <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                                    {formatPrice(listing.price)}
                                  </div>
                                  
                                  {/* BOUTON TRÈS COMPACT POUR VUE LISTE */}
                                  <div className="mb-2">
                                    <Link href={`/listings/${listing.id}`}>
                                      <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-2 py-1 rounded-md shadow-sm hover:shadow-md transition-all text-xs h-5">
                                        Voir
                                      </Button>
                                    </Link>
                                  </div>

                                  <div className="flex gap-1">
                                    <Button
                                      size="icon"
                                      className={`h-6 w-6 rounded-md transition-all ${
                                        isFavorite(listing.id) 
                                          ? 'bg-red-500 hover:bg-red-600 text-white' 
                                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                      }`}
                                      onClick={() => handleToggleFavorite(listing)}
                                    >
                                      <Heart className={`h-2 w-2 ${isFavorite(listing.id) ? 'fill-current' : ''}`} />
                                    </Button>
                                    <Button
                                      size="icon"
                                      className="h-6 w-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600"
                                      onClick={() => {
                                        if (navigator.share) {
                                          navigator.share({
                                            title: listing.title,
                                            url: `${window.location.origin}/listings/${listing.id}`
                                          });
                                        }
                                      }}
                                    >
                                      <Share2 className="h-2 w-2" />
                                    </Button>
                                  </div>
                                </div>
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
              className="flex justify-center mt-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-xl border border-white/50">
                
                <Button
                  variant="ghost"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Précédent
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
                    let pageNum;
                    if (pagination.pages <= 7) {
                      pageNum = i + 1;
                    } else {
                      if (pagination.currentPage <= 4) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage >= pagination.pages - 3) {
                        pageNum = pagination.pages - 6 + i;
                      } else {
                        pageNum = pagination.currentPage - 3 + i;
                      }
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === pagination.currentPage ? 'default' : 'ghost'}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-xl transition-all ${
                          pageNum === pagination.currentPage
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                            : 'hover:bg-blue-50'
                        }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="ghost"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.pages}
                  className="px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors"
                >
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Résumé et CTA */}
          {!loading && !error && listings.length > 0 && (
            <motion.div 
              className="text-center mt-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 rounded-3xl p-8 shadow-xl border border-white/50 max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900 mb-2">
                      {(pagination.currentPage - 1) * filters.limit + 1} - {Math.min(pagination.currentPage * filters.limit, pagination.total)}
                    </div>
                    <div className="text-slate-600">sur {pagination.total.toLocaleString()} annonces</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900 mb-2">
                      Page {pagination.currentPage}
                    </div>
                    <div className="text-slate-600">sur {pagination.pages} pages</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Flame className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900 mb-2">
                      {listings.filter(l => l.is_featured).length}
                    </div>
                    <div className="text-slate-600">annonces premium</div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/50">
                  <p className="text-slate-600 mb-4">Vous ne trouvez pas ce que vous cherchez ?</p>
                  <Link href="/sell">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl">
                      <Plus className="h-4 w-4 mr-2" />
                      Publier votre annonce
                    </Button>
                  </Link>
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