// src/services/listings.service.ts - VERSION MISE À JOUR AVEC QUOTAS
import { api } from './api';

// Types existants (gardés pour compatibilité)
export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category_id: string;
  region: string;
  images: string[];
  status: 'draft' | 'active' | 'sold' | 'expired';
  views_count: number;
  is_featured: boolean;
  expires_at: string;
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
  };
}

export interface CreateListingRequest {
  title: string;
  description: string;
  price: number;
  category_id: string;
  region: string;
  images: string[];
  phone: string;
}

export interface UpdateListingRequest {
  title?: string;
  description?: string;
  price?: number;
  region?: string;
  images?: string[];
  status?: string;
}

// 🆕 NOUVEAUX TYPES POUR LES QUOTAS
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
    quota_status: any; // 🆕 Statut des quotas inclus
  };
}

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

// Filtres pour les annonces
export interface ListingFilters {
  category_id?: string;
  region?: string;
  min_price?: number;
  max_price?: number;
  search?: string;
  sort?: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'views';
  page?: number;
  limit?: number;
}

class ListingsService {
  private baseUrl = '/api/v1/listings';

  // 🆕 NOUVELLE MÉTHODE : Vérifier l'éligibilité avant création
  async checkEligibility(): Promise<ListingEligibilityResponse> {
    try {
      const response = await api.get(`${this.baseUrl}/check-eligibility`);
      return response.data.data;
    } catch (error) {
      console.error('Erreur vérification éligibilité:', error);
      throw error;
    }
  }

  // 🆕 MÉTHODE MODIFIÉE : Créer une annonce avec gestion des quotas
  async createListing(data: CreateListingRequest): Promise<CreateListingResponse> {
    try {
      console.log('📝 Création annonce avec quotas:', data);
      
      const response = await api.post(this.baseUrl, data);
      const result = response.data as CreateListingResponse;
      
      console.log('✅ Réponse création:', result);
      
      // Log selon le type de publication
      if (result.status === 'published_free') {
        console.log('🎉 Annonce publiée GRATUITEMENT !');
      } else if (result.status === 'draft_payment_required') {
        console.log('💳 Annonce en brouillon - Paiement requis');
      }
      
      return result;
    } catch (error: any) {
      console.error('❌ Erreur création annonce:', error);
      
      // Gestion spécifique des erreurs de quota
      if (error.response?.status === 403) {
        const errorData = error.response.data;
        if (errorData.error === 'Quota d\'annonces gratuites épuisé') {
          throw new Error(`Quota épuisé: ${errorData.details}`);
        }
      }
      
      throw error;
    }
  }

  // 🆕 NOUVELLE MÉTHODE : Publier une annonce en brouillon après paiement
  async publishListing(listingId: string): Promise<{ 
    success: boolean; 
    message: string; 
    data: { listing_id: string; status: string; published_at: string } 
  }> {
    try {
      const response = await api.post(`${this.baseUrl}/${listingId}/publish`);
      return response.data;
    } catch (error) {
      console.error('Erreur publication annonce:', error);
      throw error;
    }
  }

  // 🆕 MÉTHODE MODIFIÉE : Récupérer mes annonces avec statut des quotas
  async getMyListings(page: number = 1, limit: number = 20): Promise<MyListingsResponse> {
    try {
      const response = await api.get(`${this.baseUrl}/my`, {
        params: { page, limit }
      });
      
      return response.data;
    } catch (error) {
      console.error('Erreur récupération mes annonces:', error);
      throw error;
    }
  }

  // Méthodes existantes (inchangées)
  async getListings(filters: ListingFilters = {}): Promise<ListingsResponse> {
    try {
      const response = await api.get(this.baseUrl, { params: filters });
      return response.data;
    } catch (error) {
      console.error('Erreur récupération annonces:', error);
      throw error;
    }
  }

  async getListing(id: string): Promise<Listing> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Erreur récupération annonce:', error);
      throw error;
    }
  }

  async updateListing(id: string, data: UpdateListingRequest): Promise<Listing> {
    try {
      const response = await api.put(`${this.baseUrl}/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error('Erreur mise à jour annonce:', error);
      throw error;
    }
  }

  async deleteListing(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('Erreur suppression annonce:', error);
      throw error;
    }
  }

  async searchListings(query: string, page: number = 1, limit: number = 20): Promise<SearchResponse> {
    try {
      const response = await api.get(`${this.baseUrl}/search`, {
        params: { q: query, page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur recherche annonces:', error);
      throw error;
    }
  }

  async getFeaturedListings(): Promise<Listing[]> {
    try {
      const response = await api.get(`${this.baseUrl}/featured`);
      return response.data.data;
    } catch (error) {
      console.error('Erreur récupération annonces featured:', error);
      throw error;
    }
  }

  // 🆕 MÉTHODES UTILITAIRES POUR LES QUOTAS

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
        currency: 'XOF',
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
      const currency = response.payment_required?.currency || 'XOF';
      
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

  // Formater le prix pour l'affichage
  formatPrice(price: number, currency: string = 'XOF'): string {
    return `${Math.round(price).toLocaleString()} ${currency}`;
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

// Instance singleton
export const listingsService = new ListingsService();
export default listingsService;