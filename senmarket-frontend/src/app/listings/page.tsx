'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  ArrowUpDown
} from 'lucide-react';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
    search: searchParams.get('search') || '',
    category_id: 'all',
    region: searchParams.get('region') || 'all',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    sort: searchParams.get('sort') || 'date',
    page: 1,
    limit: 20
  });

  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    currentPage: 1
  });

  // ✅ FONCTION HELPER POUR LES IMAGES (FIX PRINCIPAL)
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return null;
    
    // Si l'URL est déjà complète
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Si l'URL commence par /
    if (imagePath.startsWith('/')) {
      return `http://localhost:8080${imagePath}`;
    }
    
    // Sinon construire l'URL
    return `http://localhost:8080/uploads/${imagePath}`;
  };

  // ✅ FONCTION DEBUG POUR LES IMAGES
  const debugImageUrls = (listings: Listing[]) => {
    console.log('🔍 DEBUG IMAGES LISTINGS:');
    listings.forEach((listing, index) => {
      console.log(`📝 Annonce ${index + 1}: ${listing.title}`);
      console.log(`  - Images brutes:`, listing.images);
      
      if (listing.images && listing.images.length > 0) {
        listing.images.forEach((img, imgIndex) => {
          const finalUrl = getImageUrl(img);
          console.log(`  - Image ${imgIndex + 1}:`, img, '→', finalUrl);
        });
      } else {
        console.log('  - Aucune image');
      }
    });
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
        // Si c'est un slug, convertir en ID
        if (categoryParam.includes('-') || categoryParam.length < 30) {
          const foundId = getCategoryIdFromSlug(categoryParam);
          categoryId = foundId || 'all';
          console.log(`🔄 Conversion slug "${categoryParam}" → ID "${categoryId}"`);
        } else {
          // C'est déjà un ID
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
      console.log('📡 Chargement catégories...');
      const response = await fetch('http://localhost:8080/api/v1/categories');
      const data = await response.json();
      
      console.log('✅ Catégories reçues:', data.data);
      setCategories(data.data || []);
    } catch (error) {
      console.error('❌ Erreur chargement catégories:', error);
    }
  };

  const fetchListings = async () => {
    setLoading(true);
    setError(null);

    try {
      // ✅ CONSTRUCTION URL AVEC CATEGORY_ID
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.category_id && filters.category_id !== 'all') {
        params.append('category_id', filters.category_id);
        console.log(`🎯 Filtrage par catégorie ID: ${filters.category_id}`);
      }
      if (filters.region && filters.region !== 'all') params.append('region', filters.region);
      if (filters.min_price) params.append('min_price', filters.min_price);
      if (filters.max_price) params.append('max_price', filters.max_price);
      if (filters.sort) params.append('sort', filters.sort);
      params.append('page', filters.page.toString());
      params.append('limit', filters.limit.toString());

      const url = `http://localhost:8080/api/v1/listings?${params.toString()}`;
      console.log('📡 Requête URL:', url);

      const response = await fetch(url);
      const data = await response.json();

      console.log('✅ Données reçues:', data);

      if (data.data) {
        setListings(data.data.listings || []);
        setPagination({
          total: data.data.total || 0,
          pages: data.data.pages || 0,
          currentPage: data.data.page || 1
        });

        // Debug images
        debugImageUrls(data.data.listings || []);
      } else {
        setListings([]);
        setPagination({ total: 0, pages: 0, currentPage: 1 });
      }
    } catch (error) {
      console.error('❌ Erreur chargement annonces:', error);
      setError('Erreur lors du chargement des annonces');
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ MISE À JOUR URL AVEC SLUG
  const updateUrlParams = useCallback((newFilters: Partial<ListingFilters>) => {
    const params = new URLSearchParams();
    
    const updatedFilters = { ...filters, ...newFilters };
    
    if (updatedFilters.search) params.append('search', updatedFilters.search);
    
    // ✅ CONVERTIR CATEGORY_ID → SLUG POUR URL
    if (updatedFilters.category_id && updatedFilters.category_id !== 'all') {
      const category = categories.find(cat => cat.id === updatedFilters.category_id);
      if (category) {
        params.append('category', category.slug);
        console.log(`🔄 URL: ID "${updatedFilters.category_id}" → slug "${category.slug}"`);
      }
    }
    
    if (updatedFilters.region && updatedFilters.region !== 'all') params.append('region', updatedFilters.region);
    if (updatedFilters.min_price) params.append('min_price', updatedFilters.min_price);
    if (updatedFilters.max_price) params.append('max_price', updatedFilters.max_price);
    if (updatedFilters.sort && updatedFilters.sort !== 'date') params.append('sort', updatedFilters.sort);

    const newUrl = params.toString() ? `/listings?${params.toString()}` : '/listings';
    router.push(newUrl, { scroll: false });
  }, [filters, categories, router]);

  // Gestionnaires d'événements
  const handleFilterChange = (key: keyof ListingFilters, value: string | number) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    updateUrlParams(newFilters);
  };

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    const clearedFilters: ListingFilters = {
      search: '',
      category_id: 'all',
      region: 'all',
      min_price: '',
      max_price: '',
      sort: 'date',
      page: 1,
      limit: 20
    };
    setFilters(clearedFilters);
    router.push('/listings');
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
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (days > 0) return `il y a ${days}j`;
    if (hours > 0) return `il y a ${hours}h`;
    return `il y a ${minutes}min`;
  };

  // ✅ NOM CATÉGORIE ACTUELLE
  const currentCategoryName = categories.find(cat => cat.id === filters.category_id)?.name;

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        
        {/* En-tête avec filtres */}
        <section className="bg-white border-b border-slate-200 sticky top-16 z-40">
          <div className="container mx-auto px-6 py-6">
            
            {/* Titre et breadcrumb */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                <button onClick={() => router.push('/')} className="hover:text-blue-600">
                  Accueil
                </button>
                <span>/</span>
                <span className="text-slate-900 font-medium">
                  {currentCategoryName ? `${currentCategoryName}` : 'Toutes les annonces'}
                </span>
              </div>
              
              <h1 className="text-3xl font-bold text-slate-900">
                {currentCategoryName ? `Annonces ${currentCategoryName}` : 'Toutes les annonces'}
              </h1>
              
              {pagination.total > 0 && (
                <p className="text-slate-600 mt-1">
                  {pagination.total.toLocaleString()} annonce{pagination.total > 1 ? 's' : ''} trouvée{pagination.total > 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Barre de recherche et filtres */}
            <div className="flex flex-col lg:flex-row gap-4">
              
              {/* Recherche */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    placeholder="Rechercher des annonces..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10 h-12 text-lg"
                  />
                </div>
              </div>

              {/* Filtres rapides */}
              <div className="flex gap-3">
                
                {/* Catégorie */}
                <Select 
                  value={filters.category_id} 
                  onValueChange={(value) => handleFilterChange('category_id', value)}
                >
                  <SelectTrigger className="w-48 h-12">
                    <SelectValue placeholder="Toutes catégories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes catégories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Région */}
                <Select 
                  value={filters.region} 
                  onValueChange={(value) => handleFilterChange('region', value)}
                >
                  <SelectTrigger className="w-40 h-12">
                    <SelectValue placeholder="Toutes régions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes régions</SelectItem>
                    {SENEGAL_REGIONS.map(region => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Tri */}
                <Select 
                  value={filters.sort} 
                  onValueChange={(value) => handleFilterChange('sort', value)}
                >
                  <SelectTrigger className="w-40 h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Plus récent</SelectItem>
                    <SelectItem value="price_asc">Prix croissant</SelectItem>
                    <SelectItem value="price_desc">Prix décroissant</SelectItem>
                    <SelectItem value="views">Plus vues</SelectItem>
                  </SelectContent>
                </Select>

                {/* Bouton filtres avancés */}
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowFilters(!showFilters)}
                  className="h-12"
                >
                  <SlidersHorizontal className="h-5 w-5 mr-2" />
                  Filtres
                </Button>

                {/* Toggle vue */}
                <div className="flex border border-slate-300 rounded-lg overflow-hidden">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="h-12 px-4 rounded-none"
                  >
                    <Grid className="h-5 w-5" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="h-12 px-4 rounded-none"
                  >
                    <List className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* ✅ DEBUG INFO */}
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <strong>Debug Info:</strong> 
                  Catégorie ID: <code>{filters.category_id === 'all' ? 'toutes' : filters.category_id}</code> | 
                  Catégorie Nom: <code>{currentCategoryName || 'toutes'}</code> | 
                  Total: <code>{pagination.total}</code>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => debugImageUrls(listings)}
                >
                  🔧 Debug Images
                </Button>
              </div>
            </div>

            {/* Filtres avancés */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 p-6 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Prix minimum (FCFA)
                      </label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={filters.min_price}
                        onChange={(e) => handleFilterChange('min_price', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Prix maximum (FCFA)
                      </label>
                      <Input
                        type="number"
                        placeholder="1000000"
                        value={filters.max_price}
                        onChange={(e) => handleFilterChange('max_price', e.target.value)}
                      />
                    </div>

                    <div className="md:col-span-2 flex gap-3">
                      <Button onClick={clearFilters} variant="outline" className="flex-1">
                        <X className="h-4 w-4 mr-2" />
                        Effacer les filtres
                      </Button>
                      <Button onClick={() => setShowFilters(false)} className="flex-1">
                        Appliquer les filtres
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Contenu principal */}
        <section className="container mx-auto px-6 py-8">
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-3" />
              <span className="text-slate-600">Chargement des annonces...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Erreur de chargement</h3>
              <p className="text-slate-600 mb-6">{error}</p>
              <Button onClick={fetchListings}>Réessayer</Button>
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Aucune annonce trouvée</h3>
              <p className="text-slate-600 mb-6">
                Essayez de modifier vos critères de recherche ou explorez d'autres catégories.
              </p>
              <Button onClick={clearFilters} variant="outline">
                Effacer les filtres
              </Button>
            </div>
          ) : (
            <>
              {/* ✅ GRILLE D'ANNONCES AVEC IMAGES CORRIGÉES */}
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
                {listings.map((listing) => {
                  const imageUrl = listing.images && listing.images.length > 0 
                    ? getImageUrl(listing.images[0]) 
                    : null;

                  return (
                    <motion.div
                      key={listing.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group"
                    >
                      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg">
                        
                        {/* Image */}
                        <div 
                          className="relative aspect-video bg-gradient-to-br from-blue-100 to-orange-100 overflow-hidden"
                          onClick={() => router.push(`/listings/${listing.id}`)}
                        >
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={listing.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                console.error('❌ Erreur image listing:', imageUrl);
                                e.currentTarget.style.display = 'none';
                                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          
                          {/* Fallback */}
                          <div 
                            className="absolute inset-0 flex items-center justify-center"
                            style={{ display: imageUrl ? 'none' : 'flex' }}
                          >
                            <div className="text-center">
                              <Package className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                              <p className="text-xs text-slate-500">Pas d'image</p>
                            </div>
                          </div>

                          {/* Badges */}
                          <div className="absolute top-3 left-3">
                            {listing.is_featured && (
                              <Badge className="bg-yellow-500 text-white text-xs">
                                ⭐ Vedette
                              </Badge>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(listing.id);
                              }}
                            >
                              <Heart 
                                className={`h-4 w-4 ${
                                  favorites.has(listing.id) 
                                    ? 'fill-red-500 text-red-500' 
                                    : 'text-slate-600'
                                }`} 
                              />
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.share?.({ 
                                  title: listing.title, 
                                  url: `${window.location.origin}/listings/${listing.id}` 
                                });
                              }}
                            >
                              <Share2 className="h-4 w-4 text-slate-600" />
                            </Button>
                          </div>

                          {/* Statistiques */}
                          <div className="absolute bottom-3 right-3 bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{listing.views_count || 0}</span>
                          </div>
                        </div>

                        {/* Contenu */}
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            
                            {/* Titre et catégorie */}
                            <div>
                              <h3 
                                className="font-semibold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors cursor-pointer"
                                onClick={() => router.push(`/listings/${listing.id}`)}
                              >
                                {listing.title}
                              </h3>
                              
                              {listing.category && (
                                <Badge variant="secondary" className="text-xs mt-1">
                                  <span className="mr-1">{listing.category.icon}</span>
                                  {listing.category.name}
                                </Badge>
                              )}
                            </div>

                            {/* Prix */}
                            <div className="text-2xl font-bold text-blue-600">
                              {formatPrice(listing.price)}
                            </div>

                            {/* Informations */}
                            <div className="flex items-center justify-between text-sm text-slate-600">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{listing.region}</span>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{formatTimeAgo(listing.created_at)}</span>
                              </div>
                            </div>

                            {/* Vendeur */}
                            {listing.user && (
                              <div className="text-xs text-slate-500 flex items-center gap-1">
                                <span>Par {listing.user.first_name}</span>
                                {listing.user.is_verified && (
                                  <Badge variant="outline" className="text-xs">
                                    ✓ Vérifié
                                  </Badge>
                                )}
                              </div>
                            )}

                            {/* Debug info */}
                            <div className="text-xs text-slate-400 font-mono truncate">
                              {imageUrl ? imageUrl.split('/').pop() : 'Pas d\'image'}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <Button
                    variant="outline"
                    disabled={pagination.currentPage <= 1}
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                  >
                    Précédent
                  </Button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                      const page = pagination.currentPage <= 3 
                        ? i + 1 
                        : pagination.currentPage - 2 + i;
                      
                      if (page > pagination.pages) return null;
                      
                      return (
                        <Button
                          key={page}
                          variant={page === pagination.currentPage ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className="w-10"
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    disabled={pagination.currentPage >= pagination.pages}
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                  >
                    Suivant
                  </Button>
                </div>
              )}

              {/* Statistiques en bas */}
              <div className="text-center text-sm text-slate-600 mt-8">
                Affichage de {((pagination.currentPage - 1) * filters.limit) + 1} à{' '}
                {Math.min(pagination.currentPage * filters.limit, pagination.total)} sur{' '}
                {pagination.total} annonce{pagination.total > 1 ? 's' : ''}
              </div>
            </>
          )}
        </section>
      </main>
      
      <Footer />
    </>
  );
}