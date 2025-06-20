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
    limit: 20
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
        if (categoryParam.includes('-') || categoryParam.length < 30) {
          const foundId = getCategoryIdFromSlug(categoryParam);
          categoryId = foundId || 'all';
          console.log(`🔄 Conversion slug "${categoryParam}" → ID "${categoryId}"`);
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
      const params = new URLSearchParams();

      if (filters.search) params.append('search', filters.search);
      if (filters.category_id && filters.category_id !== 'all') {
        params.append('category_id', filters.category_id);
        console.log(`🎯 Filtrage par catégorie ID: ${filters.category_id}`);
      }
      if (filters.region && filters.region !== 'all') {
        params.append('region', filters.region);
        console.log(`🌍 Filtrage par région: "${filters.region}" (recherche LIKE)`);
      }
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

  // ✅ RENDU OPTIMISÉ POUR CHAQUE MODE D'AFFICHAGE
  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {listings.map((listing, index) => {
        const imageUrl = listing.images && listing.images.length > 0
          ? getImageUrl(listing.images[0])
          : null;

        return (
          <motion.div
            key={listing.id}
            layout
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group"
          >
            <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer border-0 bg-white/80 backdrop-blur-sm hover:bg-white/95 hover:scale-[1.02] transform">

              {/* Image avec animations premium */}
              <div
                className="relative aspect-[4/3] bg-gradient-to-br from-blue-100 via-purple-50 to-orange-100 overflow-hidden"
                onClick={() => router.push(`/listings/${listing.id}`)}
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      console.error('❌ Erreur image listing:', imageUrl);
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}

                {/* Fallback premium */}
                <div
                  className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200"
                  style={{ display: imageUrl ? 'none' : 'flex' }}
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Package className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-sm text-slate-600 font-medium">Image bientôt disponible</p>
                  </div>
                </div>

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Badges premium */}
                <div className="absolute top-4 left-4 space-y-2">
                  {listing.is_featured && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg"
                    >
                      <Crown className="h-3 w-3" />
                      Vedette
                    </motion.div>
                  )}
                  
                  {listing.views_count && listing.views_count > 50 && (
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Populaire
                    </Badge>
                  )}
                </div>

                {/* Actions floating premium */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-9 w-9 p-0 bg-white/90 hover:bg-white backdrop-blur-sm border border-white/50 shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(listing.id);
                      }}
                    >
                      <Heart
                        className={`h-4 w-4 transition-colors ${
                          favorites.has(listing.id)
                            ? 'fill-red-500 text-red-500'
                            : 'text-slate-600 hover:text-red-500'
                        }`}
                      />
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-9 w-9 p-0 bg-white/90 hover:bg-white backdrop-blur-sm border border-white/50 shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.share?.({
                          title: listing.title,
                          url: `${window.location.origin}/listings/${listing.id}`
                        });
                      }}
                    >
                      <Share2 className="h-4 w-4 text-slate-600 hover:text-blue-600" />
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-9 w-9 p-0 bg-white/90 hover:bg-white backdrop-blur-sm border border-white/50 shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/listings/${listing.id}#contact`);
                      }}
                    >
                      <MessageCircle className="h-4 w-4 text-slate-600 hover:text-green-600" />
                    </Button>
                  </motion.div>
                </div>

                {/* Statistiques avec design premium */}
                <div className="absolute bottom-4 right-4 flex items-center gap-3">
                  <div className="bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 border border-white/20">
                    <Eye className="h-3 w-3" />
                    <span className="font-medium">{listing.views_count || 0}</span>
                  </div>
                  
                  {listing.images && listing.images.length > 1 && (
                    <div className="bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 border border-white/20">
                      <Sparkles className="h-3 w-3" />
                      <span className="font-medium">{listing.images.length}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contenu avec design premium */}
              <CardContent className="p-6 space-y-4">

                {/* En-tête avec catégorie premium */}
                <div className="space-y-3">
                  {listing.category && (
                    <div className="flex items-center gap-2">
                      {(() => {
                        const IconComponent = getCategoryIcon(listing.category.icon);
                        return (
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <IconComponent className="h-4 w-4 text-white" />
                          </div>
                        );
                      })()}
                      <Badge variant="secondary" className="bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 border-0 font-medium">
                        {listing.category.name}
                      </Badge>
                    </div>
                  )}

                  <h3
                    className="font-bold text-slate-900 text-lg line-clamp-2 group-hover:text-blue-600 transition-colors cursor-pointer leading-tight"
                    onClick={() => router.push(`/listings/${listing.id}`)}
                  >
                    {listing.title}
                  </h3>
                </div>

                {/* Prix premium avec animation */}
                <motion.div 
                  className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                  whileHover={{ scale: 1.05 }}
                >
                  {formatPrice(listing.price)}
                </motion.div>

                {/* Description */}
                <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">
                  {listing.description}
                </p>

                {/* Informations avec design premium */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <div className="w-5 h-5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                        <MapPin className="h-3 w-3 text-white" />
                      </div>
                      <span className="font-medium">{listing.region}</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-500">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs">{formatTimeAgo(listing.created_at)}</span>
                    </div>
                  </div>

                  {/* Vendeur premium */}
                  {listing.user && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                          <User className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-slate-600">Par <span className="font-semibold">{listing.user.first_name}</span></span>
                      </div>
                      
                      {listing.user.is_verified && (
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs border-0">
                          <Verified className="h-3 w-3 mr-1" />
                          Vérifié
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Call to action premium */}
                <motion.div
                  className="pt-2"
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => router.push(`/listings/${listing.id}`)}
                  >
                    Voir les détails
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );

  // ✅ VUE LISTE ULTRA-PREMIUM
  const renderListView = () => (
    <div className="space-y-6">
      {listings.map((listing, index) => {
        const imageUrl = listing.images && listing.images.length > 0
          ? getImageUrl(listing.images[0])
          : null;

        return (
          <motion.div
            key={listing.id}
            layout
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group"
          >
            <Card 
              className="overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer border-0 bg-white/80 backdrop-blur-sm hover:bg-white/95 hover:scale-[1.01] transform"
              onClick={() => router.push(`/listings/${listing.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex gap-6">
                  
                  {/* Image premium */}
                  <div className="relative w-32 h-32 rounded-xl overflow-hidden bg-gradient-to-br from-blue-100 via-purple-50 to-orange-100 flex-shrink-0">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          console.error('❌ Erreur image listing:', imageUrl);
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}

                    {/* Fallback premium */}
                    <div
                      className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200"
                      style={{ display: imageUrl ? 'none' : 'flex' }}
                    >
                      <Package className="h-8 w-8 text-slate-400" />
                    </div>

                    {/* Badges overlay */}
                    <div className="absolute top-2 left-2">
                      {listing.is_featured && (
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs border-0">
                          <Crown className="h-3 w-3" />
                        </Badge>
                      )}
                    </div>

                    {/* Image count */}
                    {listing.images && listing.images.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded text-xs">
                        +{listing.images.length - 1}
                      </div>
                    )}
                  </div>

                  {/* Contenu principal premium */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between h-full">
                      
                      {/* Infos principales */}
                      <div className="flex-1 min-w-0 space-y-3">
                        
                        {/* Catégorie et titre */}
                        <div className="space-y-2">
                          {listing.category && (
                            <div className="flex items-center gap-2">
                              {(() => {
                                const IconComponent = getCategoryIcon(listing.category.icon);
                                return (
                                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                    <IconComponent className="h-3 w-3 text-white" />
                                  </div>
                                );
                              })()}
                              <Badge variant="secondary" className="bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 border-0 text-xs">
                                {listing.category.name}
                              </Badge>
                            </div>
                          )}

                          <h3 className="font-bold text-xl text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                            {listing.title}
                          </h3>
                        </div>

                        {/* Description */}
                        <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">
                          {listing.description}
                        </p>

                        {/* Méta-infos premium */}
                        <div className="flex items-center gap-6 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <div className="w-4 h-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                              <MapPin className="h-2.5 w-2.5 text-white" />
                            </div>
                            <span className="font-medium">{listing.region}</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Clock className="h-3 w-3" />
                            <span>{formatTimeAgo(listing.created_at)}</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Eye className="h-3 w-3" />
                            <span>{listing.views_count || 0} vues</span>
                          </div>

                          {listing.user && (
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <div className="w-4 h-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                                <User className="h-2.5 w-2.5 text-white" />
                              </div>
                              <span>Par {listing.user.first_name}</span>
                              {listing.user.is_verified && (
                                <Verified className="h-3 w-3 text-green-600" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Prix et actions premium */}
                      <div className="flex flex-col items-end gap-4 ml-6">
                        
                        {/* Prix premium */}
                        <motion.div 
                          className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-right"
                          whileHover={{ scale: 1.05 }}
                        >
                          {formatPrice(listing.price)}
                        </motion.div>

                        {/* Actions premium */}
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 bg-white/80 hover:bg-white border border-slate-200 shadow-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(listing.id);
                              }}
                            >
                              <Heart
                                className={`h-3 w-3 ${favorites.has(listing.id)
                                    ? 'fill-red-500 text-red-500'
                                    : 'text-slate-600 hover:text-red-500'
                                  }`}
                              />
                            </Button>
                          </motion.div>

                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 bg-white/80 hover:bg-white border border-slate-200 shadow-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.share?.({
                                  title: listing.title,
                                  url: `${window.location.origin}/listings/${listing.id}`
                                });
                              }}
                            >
                              <Share2 className="h-3 w-3 text-slate-600 hover:text-blue-600" />
                            </Button>
                          </motion.div>

                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 bg-white/80 hover:bg-white border border-slate-200 shadow-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/listings/${listing.id}#contact`);
                              }}
                            >
                              <MessageCircle className="h-3 w-3 text-slate-600 hover:text-green-600" />
                            </Button>
                          </motion.div>
                        </div>

                        {/* Call to action compact */}
                        <motion.div whileHover={{ y: -1 }} transition={{ duration: 0.2 }}>
                          <Button 
                            size="sm"
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-6 py-2 rounded-lg border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/listings/${listing.id}`);
                            }}
                          >
                            Voir détails
                            <ArrowRight className="h-3 w-3 ml-2" />
                          </Button>
                        </motion.div>
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

      {/* Background animé premium */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-600/10 rounded-full blur-3xl"
          animate={{ 
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-gradient-to-r from-emerald-400/10 to-blue-600/10 rounded-full blur-3xl" 
          animate={{ 
            x: [0, -60, 0],
            y: [0, 40, 0],
            scale: [1, 0.8, 1]
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5
          }}
        />
      </div>

      <main className="min-h-screen bg-gradient-to-br from-slate-50/90 via-blue-50/50 to-purple-50/30 relative">

        {/* Hero Section Premium - NON STICKY */}
        <section className="bg-white/90 backdrop-blur-sm border-b border-white/50 shadow-sm">
          <div className="container mx-auto px-6 py-4">

            {/* En-tête compact */}
            <motion.div 
              className="mb-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Breadcrumb compact */}
              <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
                <motion.button 
                  onClick={() => router.push('/')} 
                  className="hover:text-blue-600 transition-colors flex items-center gap-1"
                  whileHover={{ x: -1 }}
                >
                  Accueil
                </motion.button>
                <span>/</span>
                <span className="text-slate-900 font-medium">
                  {currentCategoryName ? `${currentCategoryName}` : 'Toutes les annonces'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-slate-900 leading-tight">
                    {currentCategoryName ? `${currentCategoryName}` : 'Marketplace SenMarket'}
                  </h1>

                  {pagination.total > 0 && (
                    <p className="text-slate-600 text-sm mt-1">
                      <span className="font-semibold text-blue-600">{pagination.total}</span> annonce{pagination.total > 1 ? 's' : ''} • 
                      <span className="text-green-600 font-medium ml-1">Certifiées</span>
                    </p>
                  )}
                </div>

                {/* Toggle vue compact */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 hidden sm:block">Affichage :</span>
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
              <span className="text-slate-700 text-lg font-medium">Chargement des annonces premium...</span>
              <span className="text-slate-500 text-sm mt-2">Préparation de votre sélection personnalisée</span>
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
                Essayez de modifier vos critères de recherche ou explorez d'autres catégories pour découvrir de superbes opportunités.
              </p>
              <div className="space-y-4">
                <Button 
                  onClick={clearFilters} 
                  variant="outline"
                  className="bg-white/80 border-white/50 shadow-lg rounded-xl px-8 py-3"
                >
                  <X className="h-4 w-4 mr-2" />
                  Effacer les filtres
                </Button>
                <div>
                  <Button 
                    onClick={() => router.push('/sell')}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl ml-4"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Publier une annonce
                  </Button>
                </div>
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

              {/* Pagination premium */}
              {pagination.pages > 1 && (
                <motion.div 
                  className="flex items-center justify-center gap-3 mt-16"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <Button
                    variant="outline"
                    disabled={pagination.currentPage <= 1}
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    className="bg-white/80 backdrop-blur-sm border-white/50 shadow-lg rounded-xl px-6 py-3 disabled:opacity-50"
                  >
                    <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                    Précédent
                  </Button>

                  <div className="flex gap-2">
                    {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
                      const page = pagination.currentPage <= 4
                        ? i + 1
                        : pagination.currentPage - 3 + i;

                      if (page > pagination.pages) return null;

                      return (
                        <Button
                          key={page}
                          variant={page === pagination.currentPage ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className={`w-12 h-12 rounded-xl ${
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
                    disabled={pagination.currentPage >= pagination.pages}
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    className="bg-white/80 backdrop-blur-sm border-white/50 shadow-lg rounded-xl px-6 py-3 disabled:opacity-50"
                  >
                    Suivant
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </motion.div>
              )}

              {/* Statistiques en bas premium */}
              <motion.div 
                className="text-center mt-12 p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="flex items-center justify-center gap-8 text-sm text-slate-600">
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
                      sur <span className="font-bold text-green-600">{pagination.total}</span> annonce{pagination.total > 1 ? 's' : ''} certifiée{pagination.total > 1 ? 's' : ''}
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