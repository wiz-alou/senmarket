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
  Verified,
  Crown
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
    limit: 24 // Augmenté pour plus d'annonces par page
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

    if (updatedFilters.category_id && updatedFilters.category_id !== 'all') {
      const category = categories.find(cat => cat.id === updatedFilters.category_id);
      if (category) {
        params.append('category', category.slug);
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
      limit: 24
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

    if (days > 0) return `${days}j`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}min`;
  };

  // ✅ NOM CATÉGORIE ACTUELLE
  const currentCategoryName = categories.find(cat => cat.id === filters.category_id)?.name;

  // ✅ RENDU GRILLE COMPACTE AVEC TAILLE UNIFORME
  const renderGridView = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {listings.map((listing, index) => {
        const imageUrl = listing.images && listing.images.length > 0
          ? getImageUrl(listing.images[0])
          : null;

        return (
          <motion.div
            key={listing.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="group"
          >
            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-white/90 backdrop-blur-sm hover:bg-white/95 hover:scale-[1.02] h-full flex flex-col">

              {/* Image compacte - TAILLE FIXE */}
              <div
                className="relative aspect-square bg-gradient-to-br from-blue-100 via-purple-50 to-orange-100 overflow-hidden flex-shrink-0"
                onClick={() => router.push(`/listings/${listing.id}`)}
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}

                {/* Fallback compact */}
                <div
                  className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200"
                  style={{ display: imageUrl ? 'none' : 'flex' }}
                >
                  <Package className="h-8 w-8 text-slate-400" />
                </div>

                {/* Badge vedette compact */}
                {listing.is_featured && (
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs border-0 px-2 py-1">
                      <Crown className="h-2 w-2 mr-1" />
                    </Badge>
                  </div>
                )}

                {/* Actions compactes */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 bg-white/80 hover:bg-white rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(listing.id);
                    }}
                  >
                    <Heart
                      className={`h-3 w-3 ${
                        favorites.has(listing.id)
                          ? 'fill-red-500 text-red-500'
                          : 'text-slate-600'
                      }`}
                    />
                  </Button>
                </div>

                {/* Stats compactes */}
                <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                  <Eye className="h-2 w-2" />
                  <span>{listing.views_count || 0}</span>
                </div>
              </div>

              {/* Contenu compact - HAUTEUR FLEXIBLE AVEC MIN-HEIGHT */}
              <CardContent className="p-3 flex-1 flex flex-col justify-between min-h-[140px]">
                
                <div className="space-y-2 flex-1">
                  {/* Catégorie compacte */}
                  {listing.category && (
                    <Badge variant="secondary" className="text-xs px-2 py-0.5 w-fit">
                      {listing.category.name}
                    </Badge>
                  )}

                  {/* Titre compact - HAUTEUR FIXE */}
                  <h3
                    className="font-semibold text-sm text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors cursor-pointer leading-tight min-h-[2.5rem] flex items-start"
                    onClick={() => router.push(`/listings/${listing.id}`)}
                  >
                    {listing.title}
                  </h3>

                  {/* Prix compact */}
                  <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {formatPrice(listing.price)}
                  </div>
                </div>

                {/* Footer fixe en bas */}
                <div className="space-y-2 mt-auto">
                  {/* Localisation compacte */}
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1 flex-1 min-w-0">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{listing.region}</span>
                    </div>
                    <span className="flex-shrink-0 ml-2">{formatTimeAgo(listing.created_at)}</span>
                  </div>

                  {/* Vendeur compact */}
                  {listing.user && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 truncate flex-1">Par {listing.user.first_name}</span>
                      {listing.user.is_verified && (
                        <Verified className="h-3 w-3 text-green-600 flex-shrink-0 ml-2" />
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );

  // ✅ VUE LISTE COMPACTE
  const renderListView = () => (
    <div className="space-y-3">
      {listings.map((listing, index) => {
        const imageUrl = listing.images && listing.images.length > 0
          ? getImageUrl(listing.images[0])
          : null;

        return (
          <motion.div
            key={listing.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="group"
          >
            <Card 
              className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-white/90 backdrop-blur-sm hover:bg-white/95"
              onClick={() => router.push(`/listings/${listing.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  
                  {/* Image compacte */}
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-orange-100 flex-shrink-0">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}

                    <div
                      className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200"
                      style={{ display: imageUrl ? 'none' : 'flex' }}
                    >
                      <Package className="h-6 w-6 text-slate-400" />
                    </div>

                    {listing.is_featured && (
                      <div className="absolute top-1 left-1">
                        <Crown className="h-3 w-3 text-yellow-500" />
                      </div>
                    )}
                  </div>

                  {/* Contenu principal compact */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      
                      <div className="flex-1 min-w-0 space-y-1">
                        
                        {/* Catégorie et titre */}
                        <div className="space-y-1">
                          {listing.category && (
                            <Badge variant="secondary" className="text-xs px-2 py-0.5">
                              {listing.category.name}
                            </Badge>
                          )}

                          <h3 className="font-semibold text-base text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                            {listing.title}
                          </h3>
                        </div>

                        {/* Méta-infos compactes */}
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{listing.region}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatTimeAgo(listing.created_at)}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{listing.views_count || 0}</span>
                          </div>

                          {listing.user && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{listing.user.first_name}</span>
                              {listing.user.is_verified && (
                                <Verified className="h-3 w-3 text-green-600" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Prix et actions */}
                      <div className="flex flex-col items-end gap-2 ml-4">
                        
                        <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          {formatPrice(listing.price)}
                        </div>

                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 bg-white/80 hover:bg-white rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(listing.id);
                            }}
                          >
                            <Heart
                              className={`h-3 w-3 ${favorites.has(listing.id)
                                  ? 'fill-red-500 text-red-500'
                                  : 'text-slate-600'
                                }`}
                            />
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 bg-white/80 hover:bg-white rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.share?.({
                                title: listing.title,
                                url: `${window.location.origin}/listings/${listing.id}`
                              });
                            }}
                          >
                            <Share2 className="h-3 w-3 text-slate-600" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gradient-to-br from-slate-50/90 via-blue-50/50 to-purple-50/30">

        {/* Hero Section Compact */}
        <section className="bg-white/90 backdrop-blur-sm border-b border-white/50 shadow-sm">
          <div className="container mx-auto px-6 py-4">

            {/* En-tête compact */}
            <motion.div 
              className="mb-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">
                    {currentCategoryName ? `${currentCategoryName}` : 'Toutes les annonces'}
                  </h1>

                  {pagination.total > 0 && (
                    <p className="text-slate-600 text-sm mt-1">
                      <span className="font-semibold text-blue-600">{pagination.total}</span> annonce{pagination.total > 1 ? 's' : ''} disponibles
                    </p>
                  )}
                </div>

                {/* Toggle vue compact */}
                <div className="flex bg-white rounded-lg p-0.5 border shadow-sm">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={`h-7 px-3 text-xs transition-all ${
                      viewMode === 'grid' 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Grid className="h-3 w-3 mr-1" />
                    Grille
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={`h-7 px-3 text-xs transition-all ${
                      viewMode === 'list' 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <List className="h-3 w-3 mr-1" />
                    Liste
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Barre de recherche et filtres COMPACT */}
            <motion.div 
              className="flex flex-col lg:flex-row gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >

              {/* Recherche compact */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Rechercher..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10 h-10 bg-white border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500/50 transition-all"
                  />
                  {filters.search && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-slate-100"
                      onClick={() => handleFilterChange('search', '')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Filtres compact */}
              <div className="flex flex-wrap gap-2">

                {/* Catégorie compact */}
                <Select
                  value={filters.category_id}
                  onValueChange={(value) => handleFilterChange('category_id', value)}
                >
                  <SelectTrigger className="w-44 h-10 bg-white border-slate-200 rounded-lg text-sm">
                    <SelectValue placeholder="Toutes catégories" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 shadow-lg">
                    <SelectItem value="all" className="text-sm">
                      <div className="flex items-center gap-2">
                        <Package className="h-3 w-3" />
                        Toutes catégories
                      </div>
                    </SelectItem>
                    {categories.map(category => {
                      const IconComponent = getCategoryIcon(category.icon);
                      return (
                        <SelectItem key={category.id} value={category.id} className="text-sm">
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-3 w-3 text-slate-600" />
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                {/* Région compact */}
                <Select
                  value={filters.region}
                  onValueChange={(value) => handleFilterChange('region', value)}
                >
                  <SelectTrigger className="w-36 h-10 bg-white border-slate-200 rounded-lg text-sm">
                    <SelectValue placeholder="Régions" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 shadow-lg">
                    <SelectItem value="all" className="text-sm">Tout le Sénégal</SelectItem>
                    {SENEGAL_REGIONS.map(region => (
                      <SelectItem key={region} value={region} className="text-sm">{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Tri compact */}
                <Select
                  value={filters.sort}
                  onValueChange={(value) => handleFilterChange('sort', value)}
                >
                  <SelectTrigger className="w-32 h-10 bg-white border-slate-200 rounded-lg text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 shadow-lg">
                    <SelectItem value="date" className="text-sm">Plus récent</SelectItem>
                    <SelectItem value="price_asc" className="text-sm">Prix ↑</SelectItem>
                    <SelectItem value="price_desc" className="text-sm">Prix ↓</SelectItem>
                    <SelectItem value="views" className="text-sm">Populaire</SelectItem>
                  </SelectContent>
                </Select>

                {/* Bouton filtres avancés compact */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="h-10 px-3 bg-white border-slate-200 rounded-lg hover:bg-slate-50 text-sm"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-1" />
                  Plus
                  <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </Button>
              </div>
            </motion.div>

            {/* Filtres avancés compact */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Prix min (FCFA)
                      </label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={filters.min_price}
                        onChange={(e) => handleFilterChange('min_price', e.target.value)}
                        className="h-9 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Prix max (FCFA)
                      </label>
                      <Input
                        type="number"
                        placeholder="10000000"
                        value={filters.max_price}
                        onChange={(e) => handleFilterChange('max_price', e.target.value)}
                        className="h-9 text-sm"
                      />
                    </div>

                    <div className="md:col-span-2 flex gap-2">
                      <Button 
                        onClick={clearFilters} 
                        variant="outline" 
                        size="sm"
                        className="flex-1 h-9 text-sm"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Effacer
                      </Button>
                      <Button 
                        onClick={() => setShowFilters(false)} 
                        size="sm"
                        className="flex-1 h-9 bg-blue-600 text-white text-sm"
                      >
                        Appliquer
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Contenu principal */}
        <section className="container mx-auto px-6 py-6">

          {loading ? (
            <motion.div 
              className="flex flex-col items-center justify-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-6">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
                <div className="absolute inset-0 w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-ping opacity-20"></div>
              </div>
              <span className="text-slate-700 text-lg font-medium">Chargement des annonces...</span>
            </motion.div>
          ) : error ? (
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Oups ! Une erreur s'est produite</h3>
              <p className="text-slate-600 mb-8 text-lg">{error}</p>
              <Button 
                onClick={fetchListings}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Réessayer le chargement
              </Button>
            </motion.div>
          ) : listings.length === 0 ? (
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-24 h-24 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center mx-auto mb-8">
                <Search className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-4">Aucune annonce trouvée</h3>
              <p className="text-slate-600 mb-8 text-lg max-w-md mx-auto">
                Essayez de modifier vos critères de recherche ou explorez d'autres catégories.
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
                <Button 
                  onClick={() => router.push('/sell')}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Publier une annonce
                </Button>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Rendu conditionnel selon le mode d'affichage */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                {viewMode === 'grid' ? renderGridView() : renderListView()}
              </motion.div>

              {/* Pagination compact */}
              {pagination.pages > 1 && (
                <motion.div 
                  className="flex items-center justify-center gap-2 mt-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.currentPage <= 1}
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    className="bg-white/80 backdrop-blur-sm border-white/50 shadow-lg rounded-lg px-4 py-2 disabled:opacity-50"
                  >
                    <ArrowRight className="h-3 w-3 mr-1 rotate-180" />
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
                          className={`w-8 h-8 rounded-lg text-sm ${
                            page === pagination.currentPage
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                              : 'bg-white/80 border-white/50 text-slate-700 shadow-lg hover:bg-white/90'
                          }`}
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.currentPage >= pagination.pages}
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    className="bg-white/80 backdrop-blur-sm border-white/50 shadow-lg rounded-lg px-4 py-2 disabled:opacity-50"
                  >
                    Suivant
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </motion.div>
              )}

              {/* Statistiques en bas compact */}
              <motion.div 
                className="text-center mt-8 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50 shadow-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="flex items-center justify-center gap-6 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>
                      Affichage de <span className="font-bold">{((pagination.currentPage - 1) * filters.limit) + 1}</span> à{' '}
                      <span className="font-bold">{Math.min(pagination.currentPage * filters.limit, pagination.total)}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>
                      sur <span className="font-bold text-green-600">{pagination.total}</span> annonce{pagination.total > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}