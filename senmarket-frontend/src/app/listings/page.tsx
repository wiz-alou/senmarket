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
    limit: 24
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

      if (data.data) {
        setListings(data.data.listings || []);
        setPagination({
          total: data.data.total || 0,
          pages: data.data.pages || 0,
          currentPage: data.data.page || 1
        });
      }
    } catch (error) {
      console.error('Erreur chargement annonces:', error);
      setError('Erreur lors du chargement des annonces');
    } finally {
      setLoading(false);
    }
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
      limit: 24
    });
  };

  return (
    <React.Fragment>
      <Header />
      
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
        
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
            <div className="absolute inset-0 bg-pattern opacity-20"></div>
          </div>

          <div className="relative z-10 container mx-auto px-6 py-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-white mb-12"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                Découvrez les meilleures affaires
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
                {loading ? 'Chargement...' : `${pagination.total.toLocaleString()} annonce${pagination.total !== 1 ? 's' : ''} disponible${pagination.total !== 1 ? 's' : ''} à travers tout le Sénégal`}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                >
                  <div className="text-3xl font-bold mb-2">{pagination.total.toLocaleString()}</div>
                  <div className="text-blue-200 text-sm">Annonces actives</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                >
                  <div className="text-3xl font-bold mb-2">16</div>
                  <div className="text-blue-200 text-sm">Régions</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                >
                  <div className="text-3xl font-bold mb-2">{categories.length}</div>
                  <div className="text-blue-200 text-sm">Catégories</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                >
                  <div className="text-3xl font-bold mb-2">98.5%</div>
                  <div className="text-blue-200 text-sm">Satisfaction</div>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/50 p-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  
                  <div className="lg:col-span-2 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Que recherchez-vous ?"
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="pl-12 h-14 text-lg border-0 bg-slate-50 focus:bg-white transition-colors rounded-2xl"
                    />
                  </div>

                  <div className="relative">
                    <select
                      value={filters.category_id}
                      onChange={(e) => handleFilterChange('category_id', e.target.value)}
                      className="w-full h-14 px-4 bg-slate-50 border-0 rounded-2xl focus:bg-white transition-colors appearance-none text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Toutes catégories</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                  </div>

                  <div className="relative">
                    <select
                      value={filters.region}
                      onChange={(e) => handleFilterChange('region', e.target.value)}
                      className="w-full h-14 px-4 bg-slate-50 border-0 rounded-2xl focus:bg-white transition-colors appearance-none text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Toutes régions</option>
                      {SENEGAL_REGIONS.map((region) => (
                        <option key={region} value={region}>
                          {region}
                        </option>
                      ))}
                    </select>
                    <MapPin className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <AnimatePresence>
                  {showFilters && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-4 pt-4 border-t border-slate-200 overflow-hidden"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Prix minimum</label>
                          <Input
                            type="number"
                            placeholder="0 FCFA"
                            value={filters.min_price}
                            onChange={(e) => handleFilterChange('min_price', e.target.value)}
                            className="h-12 rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Prix maximum</label>
                          <Input
                            type="number"
                            placeholder="∞ FCFA"
                            value={filters.max_price}
                            onChange={(e) => handleFilterChange('max_price', e.target.value)}
                            className="h-12 rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Trier par</label>
                          <select
                            value={filters.sort}
                            onChange={(e) => handleFilterChange('sort', e.target.value)}
                            className="w-full h-12 px-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="date">Plus récent</option>
                            <option value="price_asc">Prix croissant</option>
                            <option value="price_desc">Prix décroissant</option>
                            <option value="views">Plus vues</option>
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center justify-between mt-4">
                  <Button
                    variant="ghost"
                    onClick={() => setShowFilters(!showFilters)}
                    className="text-slate-600 hover:text-slate-900"
                  >
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    {showFilters ? 'Masquer' : 'Plus de filtres'}
                  </Button>

                  <div className="flex gap-2">
                    {(filters.search || filters.category_id !== 'all' || filters.region !== 'all' || filters.min_price || filters.max_price) && (
                      <Button
                        variant="outline"
                        onClick={clearFilters}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Effacer
                      </Button>
                    )}
                    <Button
                      onClick={fetchListings}
                      disabled={loading}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4 mr-2" />
                      )}
                      Rechercher
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="bg-white/90 backdrop-blur-sm border-b border-white/50 shadow-sm sticky top-16 z-40">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              
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

              <div className="flex items-center gap-3">
                <div className="flex bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
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

        <div className="container mx-auto px-6 py-8">
          
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

          {!loading && !error && listings.length > 0 && (
            <AnimatePresence mode="wait">
              
              {viewMode === 'grid' && (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                >
                  {listings.map((listing, index) => (
                    <motion.div
                      key={listing.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="group bg-white/95 backdrop-blur-sm border-white/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden h-full flex flex-col rounded-2xl">
                        
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <Link href={`/listings/${listing.id}`}>
                            <img
                              src={getImageUrl(listing.images?.[0]) || '/placeholder-image.jpg'}
                              alt={listing.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                          </Link>
                          
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          
                          <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                            <Button
                              size="icon"
                              className={`w-10 h-10 rounded-full shadow-lg backdrop-blur-sm border-white/20 transition-all duration-300 ${
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
                              <Heart className={`h-4 w-4 ${isFavorite(listing.id) ? 'fill-current' : ''}`} />
                            </Button>
                            <Button
                              size="icon"
                              className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-lg backdrop-blur-sm border-white/20 transition-all duration-300"
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

                          <div className="absolute bottom-4 left-4 flex gap-2">
                            <Badge className="bg-black/70 text-white border-0 backdrop-blur-sm font-medium">
                              <Eye className="h-3 w-3 mr-1" />
                              {listing.views_count || 0}
                            </Badge>
                            {listing.is_featured && (
                              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 font-bold shadow-lg">
                                <Crown className="h-3 w-3 mr-1 fill-current" />
                                Premium
                              </Badge>
                            )}
                          </div>

                          <div className="absolute top-4 left-4">
                            <div className="w-3 h-3 bg-green-400 rounded-full shadow-lg animate-pulse"></div>
                          </div>
                        </div>

                        <CardContent className="p-6 flex-1 flex flex-col">
                          <div className="space-y-4 flex-1">
                            
                            <div>
                              <Link href={`/listings/${listing.id}`}>
                                <h3 className="font-bold text-slate-900 text-lg leading-tight hover:text-blue-600 transition-colors line-clamp-2 group-hover:text-blue-600">
                                  {listing.title}
                                </h3>
                              </Link>
                              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-2">
                                {formatPrice(listing.price)}
                              </div>
                            </div>

                            <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">
                              {listing.description}
                            </p>

                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-1 text-slate-500">
                                <MapPin className="h-4 w-4" />
                                <span>{listing.region}</span>
                              </div>
                              {listing.category && (
                                <div className="flex items-center gap-1 bg-slate-100 rounded-full px-3 py-1">
                                  {React.createElement(getCategoryIcon(listing.category.icon), { 
                                    className: "h-4 w-4 text-blue-600" 
                                  })}
                                  <span className="text-slate-700 font-medium">{listing.category.name}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm text-slate-500 pt-4 mt-4 border-t border-slate-100">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                {listing.user?.first_name?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <span className="font-medium text-slate-700">
                                  {listing.user?.first_name} {listing.user?.last_name}
                                </span>
                                {listing.user?.is_verified && (
                                  <div className="flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                    <span className="text-xs text-green-600">Vérifié</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <Clock className="h-3 w-3" />
                              <span>{formatTimeAgo(listing.created_at)}</span>
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
                  className="space-y-6"
                >
                  {listings.map((listing, index) => (
                    <motion.div
                      key={listing.id}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                    >
                      <Card className="group bg-white/95 backdrop-blur-sm border-white/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 overflow-hidden rounded-2xl">
                        <CardContent className="p-8">
                          <div className="flex gap-8">
                            
                            <div className="flex-shrink-0 w-48 h-36 rounded-2xl overflow-hidden">
                              <Link href={`/listings/${listing.id}`}>
                                <img
                                  src={getImageUrl(listing.images?.[0]) || '/placeholder-image.jpg'}
                                  alt={listing.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              </Link>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex-1 min-w-0 mr-6">
                                  <div className="flex items-start gap-4 mb-3">
                                    <Link href={`/listings/${listing.id}`}>
                                      <h3 className="font-bold text-2xl text-slate-900 hover:text-blue-600 transition-colors line-clamp-2">
                                        {listing.title}
                                      </h3>
                                    </Link>
                                    {listing.is_featured && (
                                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 font-bold flex-shrink-0">
                                        <Crown className="h-3 w-3 mr-1 fill-current" />
                                        Premium
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-slate-600 text-lg leading-relaxed mb-4 line-clamp-2">
                                    {listing.description}
                                  </p>

                                  <div className="flex flex-wrap items-center gap-6 text-sm">
                                    <div className="flex items-center gap-2 bg-slate-100 rounded-full px-3 py-2">
                                      <MapPin className="h-4 w-4 text-blue-600" />
                                      <span className="font-medium text-slate-700">{listing.region}</span>
                                    </div>
                                    {listing.category && (
                                      <div className="flex items-center gap-2 bg-purple-100 rounded-full px-3 py-2">
                                        {React.createElement(getCategoryIcon(listing.category.icon), { 
                                          className: "h-4 w-4 text-purple-600" 
                                        })}
                                        <span className="font-medium text-purple-700">{listing.category.name}</span>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                        {listing.user?.first_name?.charAt(0) || 'U'}
                                      </div>
                                      <span className="font-medium text-slate-700">
                                        {listing.user?.first_name} {listing.user?.last_name}
                                      </span>
                                      {listing.user?.is_verified && (
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1 text-slate-500">
                                      <Clock className="h-4 w-4" />
                                      <span>{formatTimeAgo(listing.created_at)}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-slate-500">
                                      <Eye className="h-4 w-4" />
                                      <span>{listing.views_count || 0} vues</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="text-right flex-shrink-0">
                                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                                    {formatPrice(listing.price)}
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      size="icon"
                                      className={`h-10 w-10 rounded-xl transition-all duration-300 ${
                                        isFavorite(listing.id) 
                                          ? 'bg-red-500 hover:bg-red-600 text-white' 
                                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                      }`}
                                      onClick={() => handleToggleFavorite(listing)}
                                    >
                                      <Heart className={`h-4 w-4 ${isFavorite(listing.id) ? 'fill-current' : ''}`} />
                                    </Button>
                                    <Button
                                      size="icon"
                                      className="h-10 w-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600"
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
    </React.Fragment>
  );
}