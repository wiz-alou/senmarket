// src/lib/api/types.ts - VERSION CORRIGÉE ALIGNÉE BACKEND GO

// ============================================
// TYPES PRINCIPAUX ALIGNÉS AVEC VOTRE BACKEND
// ============================================

// ✅ Aligné avec models.User (Go)
export interface User {
  id: string;
  phone: string;
  email: string;
  first_name: string;
  last_name: string;
  region: string;
  is_verified: boolean;
  is_premium: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  // ✅ Nouveaux champs pour les quotas (si présents dans votre backend)
  current_phase?: string;
  launch_phase_active?: boolean;
}

// ✅ Aligné avec models.Category (Go)
export interface Category {
  id: string;
  slug: string;
  name: string;
  icon: string;
  description: string;
  sort_order: number;
  // ✅ Champs potentiels de votre backend
  is_active?: boolean;
  listings_count?: number;
}

// ✅ Aligné avec models.Listing (Go)
export interface Listing {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  region: string;
  images: string[];
  status: 'draft' | 'active' | 'sold' | 'expired';
  views_count: number;
  is_featured: boolean;
  expires_at: string;
  created_at: string;
  updated_at: string;
  // ✅ Relations optionnelles
  user?: User;
  category?: Category;
  // ✅ Champs additionnels potentiels
  phone?: string;
  featured_until?: string;
}

// ✅ Aligné avec models.Contact (Go)
export interface Contact {
  id: string;
  listing_id: string;
  sender_id?: string;
  name: string;
  phone: string;
  email?: string;
  message: string;
  is_read: boolean;
  created_at: string;
  // ✅ Relations optionnelles
  listing?: Pick<Listing, 'id' | 'title'>;
  sender?: Pick<User, 'id' | 'first_name' | 'last_name'>;
}

// ✅ Aligné avec models.Payment (Go)
export interface Payment {
  id: string;
  user_id: string;
  listing_id?: string;
  amount: number;
  currency: string;
  payment_method: 'orange_money' | 'wave' | 'free_money' | 'card';
  payment_provider?: string;
  transaction_id?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  failure_reason?: string;
  created_at: string;
  completed_at?: string;
  // ✅ Relations optionnelles
  listing?: Pick<Listing, 'id' | 'title'>;
  user?: Pick<User, 'id' | 'first_name' | 'last_name'>;
}

// ✅ Stats dashboard
export interface DashboardStats {
  total_listings: number;
  active_listings: number;
  sold_listings: number;
  draft_listings: number;
  total_views: number;
  total_payments: number;
  completed_payments: number;
  total_revenue: number;
  total_contacts: number;
  unread_contacts: number;
  // ✅ Stats quotas additionnelles
  quota_status?: {
    current_phase: string;
    can_create_free: boolean;
    remaining_free: number;
    used_this_month: number;
  };
}

// ============================================
// TYPES POUR LES REQUÊTES
// ============================================

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface RegisterRequest {
  phone: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  region: string;
}

// ✅ Aligné avec services.CreateListingRequest (Go)
export interface CreateListingRequest {
  title: string;
  description: string;
  price: number;
  category_id: string;
  region: string;
  images: string[];
  phone: string; // ✅ Ajouté car présent dans votre backend Go
  featured?: boolean; // ✅ Optionnel, présent dans backend
}

export interface ContactSellerRequest {
  listing_id: string;
  name: string;
  phone: string;
  email?: string;
  message: string;
}

export interface PaymentRequest {
  payment_method: 'orange_money' | 'wave' | 'free_money';
  phone: string;
  listing_id?: string; // ✅ Ajouté pour associer au listing
  amount?: number; // ✅ Ajouté si nécessaire
}

// ============================================
// TYPES POUR LES RÉPONSES
// ============================================

// ✅ Aligné avec services.PaginationInfo (Go)
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  total_pages: number; // ✅ Utilisé dans votre backend Go
  has_next?: boolean;
  has_prev?: boolean;
}

// ✅ Structure de réponse paginée
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

// ✅ Structure de réponse API standard
export interface ApiResponse<T> {
  success?: boolean; // ✅ Utilisé dans votre backend
  data: T;
  message?: string;
  error?: string; // ✅ Pour les erreurs
}

// ============================================
// TYPES UTILITAIRES
// ============================================

export interface UploadedImage {
  id: string;
  url: string;
  file_name: string;
  file_size: number;
  file_type?: string;
  width?: number;
  height?: number;
}

// ✅ Type pour les régions du Sénégal
export interface Region {
  name: string;
  code: string;
  departments?: string[];
}

// ✅ Type pour les erreurs API
export interface ApiError {
  error: string;
  code?: string;
  details?: string;
  field?: string; // Pour les erreurs de validation
}

// ============================================
// TYPES ÉNUMÉRATIONS
// ============================================

export type ListingStatus = 'draft' | 'active' | 'sold' | 'expired';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export type PaymentMethod = 'orange_money' | 'wave' | 'free_money' | 'card';

export type UserRole = 'user' | 'premium' | 'admin';

export type SortOption = 'date' | 'price_asc' | 'price_desc' | 'views';

// ✅ Types spécifiques quotas
export type QuotaPhase = 'launch' | 'credit_system' | 'paid_system';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

// ============================================
// TYPES DE CONFIGURATION
// ============================================

export interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
  };
  upload: {
    maxSize: number;
    allowedTypes: string[];
    maxFiles: number;
  };
  quota: {
    defaultFreeLimit: number;
    standardPrice: number;
    currency: string;
  };
  payments: {
    supportedMethods: PaymentMethod[];
    minAmount: number;
    maxAmount: number;
  };
}

// ============================================
// TYPES POUR LES HOOKS
// ============================================

export interface UseQueryOptions {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
  retry?: number;
}

export interface UseMutationOptions<TData, TError, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: TError, variables: TVariables) => void;
  onSettled?: (data: TData | undefined, error: TError | null, variables: TVariables) => void;
}

// ============================================
// TYPES POUR LES FILTRES
// ============================================

export interface BaseFilters {
  page?: number;
  limit?: number;
  sort?: SortOption;
  search?: string;
}

export interface ListingFilters extends BaseFilters {
  category_id?: string;
  region?: string;
  min_price?: number;
  max_price?: number;
  status?: ListingStatus;
  user_id?: string;
  is_featured?: boolean;
}

export interface PaymentFilters extends BaseFilters {
  status?: PaymentStatus;
  payment_method?: PaymentMethod;
  date_from?: string;
  date_to?: string;
}

// ============================================
// TYPES POUR LES RÉPONSES SPÉCIALISÉES
// ============================================

// Type pour les statistiques des catégories
export interface CategoryWithStats extends Category {
  listings_count: number;
  active_listings_count: number;
  total_value: number;
}

// Type pour les réponses de recherche
export interface SearchResponse<T> {
  data: T[];
  pagination: PaginationInfo;
  search_query: string;
  total_results: number;
  search_time: number;
}

// Type pour les notifications
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  action_url?: string;
}

// ============================================
// EXPORT DE TOUS LES TYPES
// ============================================

// Types principaux
export type {
  User,
  Category,
  Listing,
  Contact,
  Payment,
  DashboardStats
};

// Types de requête
export type {
  LoginRequest,
  RegisterRequest,
  CreateListingRequest,
  ContactSellerRequest,
  PaymentRequest
};

// Types de réponse
export type {
  PaginatedResponse,
  ApiResponse,
  UploadedImage,
  Region,
  ApiError
};

// Types utilitaires
export type {
  ListingStatus,
  PaymentStatus,
  PaymentMethod,
  UserRole,
  SortOption,
  QuotaPhase,
  NotificationType
};