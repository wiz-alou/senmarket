// 🔧 PAGE FAVORIS - SYNCHRONISATION TEMPS RÉEL
// src/app/favorites/page.tsx

'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFavoritesStore } from '@/stores/favorites.store';
import { useAuthStore } from '@/stores/auth.store';
import { 
  Heart,
  ArrowLeft,
  Grid3X3,
  List,
  Search,
  Trash2,
  Share2,
  CheckCircle,
  Loader2,
  Star,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Eye,
  Clock,
  MapPin,
  User,
  Tag
} from 'lucide-react';

// Types
interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  region: string;
  images: string[];
  status: 'draft' | 'active' | 'sold' | 'expired';
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

export default function FavoritesPage() {
  const router = useRouter();
  
  // ✅ UTILISER isHydrated POUR UNE MEILLEURE GESTION
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  const favoritesStore = useFavoritesStore();
  
  // ✅ UTILISER useMemo POUR ÉVITER LES RECALCULS
  const favorites = useMemo(() => favoritesStore.getFavorites(), [favoritesStore.currentUserId, favoritesStore.favoritesByUser]);
  const cachedFavoriteListings = useMemo(() => favoritesStore.getFavoriteListings(), [favoritesStore.currentUserId, favoritesStore.favoritesData]);
  
  // États
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'price_asc' | 'price_desc' | 'alphabetical'>('date');
  const [favoriteListings, setFavoriteListings] = useState<Listing[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  // ✅ VÉRIFICATION AUTHENTIFICATION AMÉLIORÉE AVEC isHydrated
  useEffect(() => {
    console.log('🔍 Auth state:', { isHydrated, isAuthenticated, user: user?.first_name });
    
    // Attendre que le store soit hydraté
    if (!isHydrated) {
      console.log('⏳ En attente de l\'hydratation du store...');
      return;
    }

    // Une fois hydraté, vérifier l'authentification
    if (!isAuthenticated || !user) {
      console.log('❌ Non authentifié après hydratation, redirection vers login');
      router.push('/auth/login?redirect=/favorites');
      return;
    }
    
    console.log('✅ Authentifié et hydraté, utilisateur:', user.first_name);
    setAuthReady(true);
  }, [isHydrated, isAuthenticated, user, router]);

  // ✅ SYNC FAVORIS AU CHANGEMENT D'UTILISATEUR
  useEffect(() => {
    if (authReady && isAuthenticated && user && favoritesStore.currentUserId !== user.id) {
      console.log('🔄 Correction sync favoris:', favoritesStore.currentUserId, '→', user.id);
      favoritesStore.setCurrentUser(user.id);
    }
  }, [user, isAuthenticated, favoritesStore.currentUserId, authReady]);

  // ✅ SYNCHRONISATION AUTOMATIQUE AVEC LE STORE
  useEffect(() => {
    if (!authReady) return;

    console.log('🔄 Sync favoris store → état local, IDs:', favorites);
    
    // Si aucun favori, vider la liste
    if (favorites.length === 0) {
      setFavoriteListings([]);
      return;
    }

    // Filtrer les listings selon les favoris actuels du store
    setFavoriteListings(prev => {
      const validListings = prev.filter(listing => favorites.includes(listing.id));
      console.log('🔄 Filtrage listings:', prev.length, '→', validListings.length);
      return validListings;
    });

  }, [favorites, authReady]);

  // ✅ CHARGER LES DONNÉES AVEC DÉPENDANCES STABLES
  useEffect(() => {
    if (!authReady) return; // Attendre que l'auth soit prête

    const loadFavoriteDetails = async () => {
      console.log('🔄 Chargement favoris détaillés, IDs:', favorites);
      
      if (favorites.length === 0) {
        setFavoriteListings([]);
        return;
      }

      // Vérifier quels favoris manquent dans la liste actuelle
      const currentIds = favoriteListings.map(l => l.id);
      const missingIds = favorites.filter(id => !currentIds.includes(id));
      
      if (missingIds.length === 0) {
        console.log('✅ Tous les favoris sont déjà chargés');
        return;
      }

      console.log('🌐 Chargement des favoris manquants:', missingIds);
      setIsRefreshing(true);

      try {
        // Essayer d'abord avec les données en cache
        const cachedData = cachedFavoriteListings.filter(listing => 
          missingIds.includes(listing.id)
        );
        
        if (cachedData.length === missingIds.length) {
          console.log('✅ Utilisation cache pour favoris manquants:', cachedData.length);
          setFavoriteListings(prev => {
            const newListings = [...prev];
            cachedData.forEach(cached => {
              if (!newListings.find(l => l.id === cached.id)) {
                newListings.push({
                  id: cached.id,
                  title: cached.title || '',
                  description: '',
                  price: cached.price || 0,
                  currency: cached.currency || 'XOF',
                  region: cached.region || '',
                  images: cached.images || [],
                  status: 'active',
                  views_count: 0,
                  is_featured: false,
                  created_at: cached.addedAt || new Date().toISOString(),
                  updated_at: cached.addedAt || new Date().toISOString(),
                  user: cached.user ? {
                    id: '',
                    first_name: cached.user.first_name || '',
                    last_name: cached.user.last_name || '',
                    phone: '',
                    region: '',
                    is_verified: false
                  } : undefined,
                  category: cached.category
                });
              }
            });
            return newListings;
          });
          setIsRefreshing(false);
          return;
        }

        // Sinon, récupérer depuis l'API
        const updatedListings: Listing[] = [...favoriteListings];
        
        for (const favoriteId of missingIds) {
          try {
            const response = await fetch(`http://localhost:8080/api/v1/listings/${favoriteId}`);
            if (response.ok) {
              const data = await response.json();
              if (data.data && !updatedListings.find(l => l.id === favoriteId)) {
                updatedListings.push(data.data);
              }
            } else {
              console.warn(`Favori ${favoriteId} non trouvé (${response.status})`);
            }
          } catch (error) {
            console.error(`Erreur chargement favori ${favoriteId}:`, error);
          }
        }

        console.log('✅ Favoris chargés depuis API:', updatedListings.length);
        setFavoriteListings(updatedListings);
      } catch (error) {
        console.error('❌ Erreur chargement favoris:', error);
      } finally {
        setIsRefreshing(false);
      }
    };

    loadFavoriteDetails();
  }, [favorites.join(','), authReady]); // ✅ Ne pas inclure favoriteListings pour éviter la boucle

  // Fonctions utilitaires
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/')) return `http://localhost:8080${imagePath}`;
    return `http://localhost:8080/uploads/${imagePath}`;
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

  // ✅ FILTRAGE ET TRI AVEC useMemo POUR PERFORMANCE
  const filteredAndSortedListings = useMemo(() => {
    return favoriteListings
      .filter(listing => 
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        switch (sortBy) {
          case 'price_asc':
            return a.price - b.price;
          case 'price_desc':
            return b.price - a.price;
          case 'alphabetical':
            return a.title.localeCompare(b.title);
          case 'date':
          default:
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
      });
  }, [favoriteListings, searchQuery, sortBy]);

  // ✅ ACTIONS CORRIGÉES AVEC SYNCHRONISATION IMMÉDIATE
  const handleRemoveFavorite = (listingId: string) => {
    console.log('💔 Suppression favori:', listingId);
    
    // 1. Mettre à jour le store
    favoritesStore.removeFavorite(listingId);
    
    // 2. Mettre à jour immédiatement l'état local (synchronisation instantanée)
    setFavoriteListings(prev => {
      const newListings = prev.filter(listing => listing.id !== listingId);
      console.log('✅ Liste mise à jour immédiatement:', prev.length, '→', newListings.length);
      return newListings;
    });
  };

  const handleClearAllFavorites = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer tous vos favoris ?')) {
      console.log('🧹 Nettoyage complet favoris utilisateur');
      
      // 1. Mettre à jour le store
      favoritesStore.clearUserFavorites();
      
      // 2. Vider immédiatement la liste locale
      setFavoriteListings([]);
    }
  };

  const handleShare = (listing: Listing) => {
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: `Découvrez cette annonce sur SenMarket : ${listing.title}`,
        url: `${window.location.origin}/listings/${listing.id}`
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/listings/${listing.id}`);
    }
  };

  // ✅ FONCTION DEBUG
  const handleDebug = () => {
    console.log('🔍 === DEBUG COMPLET ===');
    console.log('- isHydrated:', isHydrated);
    console.log('- isAuthenticated:', isAuthenticated);
    console.log('- authReady:', authReady);
    console.log('- User:', user?.first_name, user?.id);
    console.log('- Favorites IDs store:', favorites);
    console.log('- Cached listings:', cachedFavoriteListings.length);
    console.log('- Loaded listings local:', favoriteListings.length);
    console.log('- Filtered listings:', filteredAndSortedListings.length);
    console.log('- Current User ID:', favoritesStore.currentUserId);
    console.log('- Listings IDs local:', favoriteListings.map(l => l.id));
    favoritesStore.debugFavorites();
  };

  // ✅ LOADING TANT QUE L'AUTH N'EST PAS PRÊTE
  if (!authReady) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-slate-600">
              {!isHydrated ? 'Chargement de votre session...' : 'Vérification de votre authentification...'}
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
        
        {/* Header avec breadcrumb */}
        <section className="bg-white/90 backdrop-blur-sm border-b border-white/50 shadow-sm sticky top-16 z-40">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Retour
                </Button>
                <span className="text-slate-300">•</span>
                <span className="text-sm text-slate-600">Mes Favoris</span>
              </div>

              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50">
                  <Heart className="h-3 w-3 mr-1 fill-current" />
                  {favorites.length} favori{favorites.length !== 1 ? 's' : ''}
                </Badge>
                
                {/* ✅ BOUTON DEBUG TEMPORAIRE */}
                {process.env.NODE_ENV === 'development' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDebug}
                    className="text-xs"
                  >
                    Debug
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Contenu principal */}
        <div className="container mx-auto px-6 py-12">
          
          {/* En-tête de page */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                <Heart className="h-10 w-10 text-white fill-current" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Mes Favoris
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Bonjour <strong>{user?.first_name}</strong> ! Retrouvez toutes les annonces que vous avez sauvegardées.
            </p>
          </motion.div>

          {/* Barre de contrôles si il y a des favoris */}
          {favoriteListings.length > 0 && (
            <motion.div 
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                
                {/* Barre de recherche */}
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Rechercher dans mes favoris..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90"
                    />
                  </div>
                </div>

                {/* Contrôles */}
                <div className="flex items-center gap-3">
                  
                  {/* Tri */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/90"
                  >
                    <option value="date">Plus récent</option>
                    <option value="price_asc">Prix croissant</option>
                    <option value="price_desc">Prix décroissant</option>
                    <option value="alphabetical">Alphabétique</option>
                  </select>

                  {/* Mode d'affichage */}
                  <div className="flex bg-slate-100 rounded-xl p-1">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="px-3"
                    >
                      <Grid3X3 className="h-4 w-4" />
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

                  {/* Supprimer tout */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearAllFavorites}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Tout effacer
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* États de chargement */}
          {isRefreshing && (
            <motion.div 
              className="flex justify-center mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="bg-white/90 rounded-xl px-6 py-3 shadow-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="text-blue-700 font-medium">Actualisation des favoris...</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Contenu principal */}
          <AnimatePresence mode="wait">
            
            {/* État vide */}
            {filteredAndSortedListings.length === 0 && (
              <motion.div
                key="empty"
                className="text-center py-20"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-lg border border-white/50 max-w-2xl mx-auto">
                  <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart className="h-12 w-12 text-slate-400" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">
                    {searchQuery ? 'Aucun résultat' : 'Aucun favori pour le moment'}
                  </h3>
                  
                  <p className="text-slate-600 mb-8 leading-relaxed">
                    {searchQuery 
                      ? `Aucune annonce ne correspond à "${searchQuery}" dans vos favoris.`
                      : 'Commencez à sauvegarder vos annonces préférées en cliquant sur l\'icône cœur.'
                    }
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {searchQuery ? (
                      <Button
                        onClick={() => setSearchQuery('')}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Search className="h-4 w-4 mr-2" />
                        Voir tous mes favoris
                      </Button>
                    ) : (
                      <>
                        <Link href="/listings">
                          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                            <ShoppingBag className="h-4 w-4 mr-2" />
                            Découvrir les annonces
                          </Button>
                        </Link>
                        <Link href="/sell">
                          <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                            <Sparkles className="h-4 w-4 mr-2" />
                            Publier une annonce
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Affichage des favoris si présents */}
            {filteredAndSortedListings.length > 0 && (
              <motion.div
                key="listings"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                
                {/* Mode grille */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredAndSortedListings.map((listing, index) => (
                    <motion.div
                      key={listing.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }} // ✅ Animation de sortie
                      transition={{ delay: index * 0.1 }}
                      layout // ✅ Animation de repositionnement
                    >
                      <Card className="group bg-white/90 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                        
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
                              className="bg-white/95 hover:bg-white shadow-lg text-red-500"
                              onClick={(e) => {
                                e.preventDefault();
                                handleRemoveFavorite(listing.id);
                              }}
                            >
                              <Heart className="h-4 w-4 fill-current" />
                            </Button>
                            <Button
                              size="icon"
                              variant="secondary"
                              className="bg-white/95 hover:bg-white shadow-lg text-slate-600"
                              onClick={(e) => {
                                e.preventDefault();
                                handleShare(listing);
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
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            
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

                            {/* Localisation et catégorie */}
                            <div className="flex items-center justify-between text-sm text-slate-600">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{listing.region}</span>
                              </div>
                              {listing.category && (
                                <div className="flex items-center gap-1">
                                  <Tag className="h-4 w-4" />
                                  <span>{listing.category.name}</span>
                                </div>
                              )}
                            </div>

                            {/* Vendeur et date */}
                            <div className="flex items-center justify-between text-sm text-slate-500 pt-2 border-t border-slate-100">
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
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Stats en bas */}
                <motion.div 
                  className="mt-12 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 inline-block">
                    <div className="flex items-center gap-6 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-red-500 fill-current" />
                        <span><strong>{filteredAndSortedListings.length}</strong> résultat{filteredAndSortedListings.length !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="w-px h-4 bg-slate-300"></div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span>Économie totale estimée : <strong>{formatPrice(filteredAndSortedListings.reduce((sum, listing) => sum + listing.price, 0))}</strong></span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </>
  );
}