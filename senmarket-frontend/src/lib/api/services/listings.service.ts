// src/lib/api/services/listings.service.ts - VERSION CORRIGÉE ALIGNÉE BACKEND
import { apiClient } from '../client';
import { ApiResponse, Listing } from '../types';

// ============================================
// INTERFACES ALIGNÉES AVEC VOTRE BACKEND GO
// ============================================

// ✅ Aligné avec services.CreateListingRequest (backend Go)
export interface CreateListingRequest {
  title: string;
  description: string;
  price: number;
  category_id: string;
  region: string;
  images: string[];
  phone: string;
  featured?: boolean; // Optionnel, backend l'a
}

// ✅ Aligné avec services.UpdateListingRequest
export interface UpdateListingRequest {
  title?: string;
  description?: string;
  price?: number;
  region?: string;
  images?: string[];
  status?: string;
}

// ✅ Type pour l'éligibilité (utilisera le service quota maintenant)
export interface ListingEligibilityResponse {
  can_create_free: boolean;
  requires_payment: boolean;
  current_phase: string;
  standard_price: number;
  currency: string;
  reason?: string;
  quota_reset_date?: string;
  days_until_reset?: number;
  used_this_month?: number;
  limit_this_month?: number;
  premium_options?: {
    boost_price: number;
    featured_price: number;
    pack_5_price: number;
    pack_10_price: number;
    pack_5_discount: number;
    pack_10_discount: number;
  };
}

// ✅ Réponse création basée sur votre listing_handler.go
export interface CreateListingResponse {
  success: boolean;
  data: Listing;
  eligibility: ListingEligibilityResponse;
  status: 'published_free' | 'draft_payment_required';
  message: string;
  info: string;
  quota_status?: any;
  payment_required?: {
    amount: number;
    currency: string;
    payment_url: string;
  };
}

// ✅ Réponse mes annonces avec quota (handler.GetMyListings)
export interface MyListingsResponse {
  success: boolean;
  data: {
    listings: Listing[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
    stats: {
      total_listings: number;
      active_listings: number;
      draft_listings: number;
      expired_listings: number;
    };
    quota_status: any;
  };
}

// ✅ Réponse listings standard
export interface ListingsResponse {
  success: boolean;
  data: {
    listings: Listing[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
  };
}

export interface SearchResponse extends ListingsResponse {
  data: ListingsResponse['data'] & {
    search_query: string;
  };
}

// ✅ Filtres alignés avec services.ListingQuery
export interface ListingFilters {
  category_id?: string;
  region?: string;
  min_price?: number;
  max_price?: number;
  search?: string;
  sort?: 'date' | 'price_asc' | 'price_desc' | 'views';
  page?: number;
  limit?: number;
  user_id?: string;
  status?: string;
}

// ============================================
// SERVICE CLASS ALIGNÉ AVEC VOS ENDPOINTS
// ============================================

export class ListingsService {
  
  // ✅ CORRECTION MAJEURE : Utiliser le service quota pour l'éligibilité
  // Au lieu de /listings/check-eligibility, on utilise /quota/check
  async checkEligibility(): Promise<ListingEligibilityResponse> {
    // Import dynamic pour éviter les dépendances circulaires
    const { quotaService } = await import('./quota.service');
    return quotaService.checkEligibility();
  }

  // ✅ Endpoint exact : POST /listings (ListingHandler.CreateListing)
  async createListing(data: CreateListingRequest): Promise<CreateListingResponse> {
    console.log('📝 Création annonce avec quotas:', data);
    
    const response = await apiClient.post<CreateListingResponse>('/listings', data);
    const result = response.data;
    
    console.log('✅ Réponse création:', result);
    
    // Log selon le type de publication
    if (result.status === 'published_free') {
      console.log('🎉 Annonce publiée GRATUITEMENT !');
    } else if (result.status === 'draft_payment_required') {
      console.log('💳 Annonce en brouillon - Paiement requis');
    }
    
    return result;
  }

  // ✅ Endpoint exact : POST /listings/{id}/publish
  async publishListing(listingId: string): Promise<{ 
    success: boolean; 
    message: string; 
    data: { listing_id: string; status: string; published_at: string } 
  }> {
    const response = await apiClient.post(`/listings/${listingId}/publish`);
    return response.data;
  }

  // ✅ Endpoint exact : GET /listings/my (ListingHandler.GetMyListings)
  async getMyListings(page: number = 1, limit: number = 20): Promise<MyListingsResponse> {
    const response = await apiClient.get<MyListingsResponse>('/listings/my', {
      params: { page, limit }
    });
    
    return response.data;
  }

  // ✅ Endpoint exact : GET /listings (ListingHandler.GetListings)
  async getListings(filters: ListingFilters = {}): Promise<ListingsResponse> {
    const response = await apiClient.get<ListingsResponse>('/listings', { 
      params: filters 
    });
    return response.data;
  }

  // ✅ Endpoint exact : GET /listings/{id} (ListingHandler.GetListing)
  async getListing(id: string): Promise<Listing> {
    const response = await apiClient.get<ApiResponse<Listing>>(`/listings/${id}`);
    return response.data.data;
  }

  // ✅ Endpoint exact : PUT /listings/{id} (ListingHandler.UpdateListing)
  async updateListing(id: string, data: UpdateListingRequest): Promise<Listing> {
    const response = await apiClient.put<ApiResponse<Listing>>(`/listings/${id}`, data);
    return response.data.data;
  }

  // ✅ Endpoint exact : DELETE /listings/{id} (ListingHandler.DeleteListing)
  async deleteListing(id: string): Promise<void> {
    await apiClient.delete(`/listings/${id}`);
  }

  // ✅ Endpoint exact : GET /listings/search (ListingHandler.SearchListings)
  async searchListings(query: string, filters: Omit<ListingFilters, 'search'> = {}): Promise<SearchResponse> {
    const response = await apiClient.get<SearchResponse>('/listings/search', {
      params: { 
        q: query, 
        ...filters 
      }
    });
    return response.data;
  }

  // ✅ Endpoint exact : GET /listings/featured (ListingHandler.GetFeaturedListings)
  async getFeaturedListings(limit: number = 6): Promise<Listing[]> {
    const response = await apiClient.get<ApiResponse<Listing[]>>('/listings/featured', {
      params: { limit }
    });
    return response.data.data;
  }

  // ✅ Endpoint exact : GET /listings/{id}/similar (ListingHandler.GetSimilarListings)
  async getSimilarListings(listingId: string, limit: number = 4): Promise<Listing[]> {
    const response = await apiClient.get<ApiResponse<Listing[]>>(`/listings/${listingId}/similar`, {
      params: { limit }
    });
    return response.data.data;
  }

  // ✅ Endpoint exact : POST /listings/{id}/view (ListingHandler.MarkAsViewed)
  async markAsViewed(id: string): Promise<void> {
    await apiClient.post(`/listings/${id}/view`);
  }

  // ✅ NOUVELLES MÉTHODES ALIGNÉES AVEC VOTRE BACKEND

  // Dupliquer une annonce
  async duplicateListing(listingId: string): Promise<Listing> {
    const response = await apiClient.post<ApiResponse<Listing>>(`/listings/${listingId}/duplicate`);
    return response.data.data;
  }

  // Archiver une annonce
  async archiveListing(listingId: string): Promise<void> {
    await apiClient.post(`/listings/${listingId}/archive`);
  }

  // Restaurer une annonce archivée
  async restoreListing(listingId: string): Promise<Listing> {
    const response = await apiClient.post<ApiResponse<Listing>>(`/listings/${listingId}/restore`);
    return response.data.data;
  }

  // Signaler une annonce
  async reportListing(listingId: string, reason: string, description?: string): Promise<void> {
    await apiClient.post(`/listings/${listingId}/report`, {
      reason,
      description
    });
  }

  // Renouveler une annonce expirée
  async renewListing(listingId: string): Promise<{
    success: boolean;
    payment_required: boolean;
    payment_url?: string;
    listing?: Listing;
  }> {
    const response = await apiClient.post(`/listings/${listingId}/renew`);
    return response.data;
  }

  // Promouvoir une annonce (featured, boost)
  async promoteListing(listingId: string, promotionType: 'featured' | 'boost'): Promise<{
    success: boolean;
    payment_required: boolean;
    payment_url?: string;
    listing?: Listing;
  }> {
    const response = await apiClient.post(`/listings/${listingId}/promote`, {
      promotion_type: promotionType
    });
    return response.data;
  }

  // Récupérer les statistiques des annonces
  async getListingsStats(): Promise<{
    total_listings: number;
    active_listings: number;
    featured_listings: number;
    categories_count: number;
    regions_count: number;
    total_views: number;
  }> {
    const response = await apiClient.get<ApiResponse<any>>('/listings/stats');
    return response.data.data;
  }

  // ============================================
  // MÉTHODES UTILITAIRES POUR LE FRONTEND
  // ============================================

  // Vérifier si une annonce peut être créée gratuitement
  async canCreateFree(): Promise<boolean> {
    try {
      const eligibility = await this.checkEligibility();
      return eligibility.can_create_free;
    } catch (error) {
      console.error('Erreur vérification quota gratuit:', error);
      return false;
    }
  }

  // Obtenir le coût de création d'une annonce
  async getCreationCost(): Promise<{ 
    isFree: boolean; 
    cost: number; 
    currency: string; 
    reason?: string 
  }> {
    try {
      const eligibility = await this.checkEligibility();
      
      return {
        isFree: eligibility.can_create_free,
        cost: eligibility.can_create_free ? 0 : eligibility.standard_price,
        currency: eligibility.currency,
        reason: eligibility.reason,
      };
    } catch (error) {
      console.error('Erreur récupération coût création:', error);
      return {
        isFree: false,
        cost: 200,
        currency: 'FCFA',
        reason: 'Erreur de vérification',
      };
    }
  }

  // Formater le message de statut après création
  formatCreationStatusMessage(response: CreateListingResponse): {
    title: string;
    message: string;
    type: 'success' | 'info' | 'warning';
    action?: string;
  } {
    if (response.status === 'published_free') {
      return {
        title: '🎉 Annonce publiée gratuitement !',
        message: response.info || 'Votre annonce est maintenant visible par tous les utilisateurs.',
        type: 'success',
      };
    }
    
    if (response.status === 'draft_payment_required') {
      const amount = response.payment_required?.amount || 200;
      const currency = response.payment_required?.currency || 'FCFA';
      
      return {
        title: '📝 Annonce sauvegardée',
        message: `Votre annonce est en brouillon. Payez ${amount} ${currency} pour la publier.`,
        type: 'info',
        action: 'Payer maintenant',
      };
    }
    
    return {
      title: 'Annonce créée',
      message: response.message || 'Votre annonce a été créée.',
      type: 'success',
    };
  }

  // Analyser les stats de mes annonces
  analyzeMyListingsStats(response: MyListingsResponse): {
    totalListings: number;
    activeListings: number;
    draftListings: number;
    expiredListings: number;
    activeRate: number;
    draftRate: number;
    hasQuotaInfo: boolean;
    quotaMessage?: string;
  } {
    const stats = response.data.stats;
    const total = stats.total_listings;
    
    return {
      totalListings: total,
      activeListings: stats.active_listings,
      draftListings: stats.draft_listings,
      expiredListings: stats.expired_listings,
      activeRate: total > 0 ? Math.round((stats.active_listings / total) * 100) : 0,
      draftRate: total > 0 ? Math.round((stats.draft_listings / total) * 100) : 0,
      hasQuotaInfo: !!response.data.quota_status,
      quotaMessage: response.data.quota_status?.message,
    };
  }

  // Filtrer les annonces par statut
  filterListingsByStatus(listings: Listing[], status: Listing['status']): Listing[] {
    return listings.filter(listing => listing.status === status);
  }

  // Calculer la valeur totale des annonces
  calculateTotalValue(listings: Listing[]): number {
    return listings.reduce((total, listing) => total + listing.price, 0);
  }

  // Obtenir les annonces récentes (dernières 7 jours)
  getRecentListings(listings: Listing[]): Listing[] {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return listings.filter(listing => 
      new Date(listing.created_at) > sevenDaysAgo
    );
  }

  // Formater le prix pour l'affichage (FCFA Sénégal)
  formatPrice(price: number, currency: string = 'FCFA'): string {
    return `${Math.round(price).toLocaleString('fr-FR')} ${currency}`;
  }

  // Vérifier si une annonce expire bientôt
  isExpiringSoon(listing: Listing, daysThreshold: number = 7): boolean {
    const expiryDate = new Date(listing.expires_at);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= daysThreshold && diffDays > 0;
  }

  // Obtenir le temps restant avant expiration
  getTimeUntilExpiry(listing: Listing): {
    days: number;
    hours: number;
    isExpired: boolean;
    isExpiringSoon: boolean;
  } {
    const expiryDate = new Date(listing.expires_at);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    
    if (diffTime <= 0) {
      return {
        days: 0,
        hours: 0,
        isExpired: true,
        isExpiringSoon: false,
      };
    }
    
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return {
      days,
      hours,
      isExpired: false,
      isExpiringSoon: days <= 7,
    };
  }
}

// ============================================
// INSTANCE SINGLETON
// ============================================
export const listingsService = new ListingsService();
export default listingsService;