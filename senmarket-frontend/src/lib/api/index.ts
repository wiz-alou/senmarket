// src/lib/api/index.ts - VERSION CORRIGÉE AVEC QUOTA SERVICE

export * from './client';
export * from './types';

// ============================================
// SERVICES EXPORTS
// ============================================
export { authService } from './services/auth.service';
export { listingsService } from './services/listings.service';
export { categoriesService } from './services/categories.service';
export { imagesService } from './services/images.service';
export { contactsService } from './services/contacts.service';
export { paymentsService } from './services/payments.service';
export { dashboardService } from './services/dashboard.service';
export { regionsService } from './services/regions.service';

// ✅ AJOUT DU SERVICE QUOTA MANQUANT
export { quotaService } from './services/quota.service';

// ============================================
// TYPES DE BASE EXPORTÉS
// ============================================
export type {
  User,
  Category,
  Listing,
  Contact,
  Payment,
  DashboardStats,
  LoginRequest,
  RegisterRequest,
  CreateListingRequest,
  ContactSellerRequest,
  PaymentRequest,
  PaginatedResponse,
  ApiResponse,
  UploadedImage
} from './types';

// ============================================
// TYPES SPÉCIFIQUES SERVICES
// ============================================

// Types du service listings
export type {
  UpdateListingRequest,
  ListingEligibilityResponse,
  CreateListingResponse,
  MyListingsResponse,
  ListingsResponse,
  SearchResponse,
  ListingFilters
} from './services/listings.service';

// ✅ Types du service quota
export type {
  QuotaStatus,
  EligibilityCheck,
  QuotaSummary,
  QuotaHistory,
  CurrentPhase,
  PlatformStats
} from './services/quota.service';

// Types du service categories  
export type {
  CategoryWithStats
} from './services/categories.service';

// Types du service auth
export type {
  AuthResponse,
  VerifyCodeRequest,
  VerifyCodeResponse,
  RefreshTokenResponse
} from './services/auth.service';

// Types du service payments
export type {
  PaymentInitiationRequest,
  PaymentInitiationResponse,
  PaymentHistoryResponse,
  PaymentStatusResponse
} from './services/payments.service';

// Types du service contacts
export type {
  ContactResponse,
  ContactsListResponse
} from './services/contacts.service';

// Types du service dashboard
export type {
  DashboardResponse,
  StatsResponse
} from './services/dashboard.service';

// Types du service images
export type {
  ImageUploadResponse,
  ImageDeleteResponse
} from './services/images.service';

// Types du service regions
export type {
  Region,
  RegionsResponse
} from './services/regions.service';

// ============================================
// CONSTANTES UTILES
// ============================================

export const API_CONFIG = {
  MAX_IMAGES: 5,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  DEFAULT_PAGINATION: {
    page: 1,
    limit: 20
  },
  // ✅ Constantes quotas spécifiques Sénégal
  QUOTA_CONFIG: {
    DEFAULT_FREE_LIMIT: 3,
    STANDARD_PRICE: 200,
    CURRENCY: 'FCFA'
  }
} as const;

// ============================================
// UTILITAIRES DE VALIDATION
// ============================================

export const VALIDATION = {
  phone: /^\+221[0-9]{9}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  price: /^\d+(\.\d{1,2})?$/
} as const;

// ============================================
// UTILITAIRES DE FORMATAGE
// ============================================

export const FORMAT_UTILS = {
  currency: (amount: number) => `${amount.toLocaleString('fr-FR')} FCFA`,
  phone: (phone: string) => phone.replace(/(\+221)(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5'),
  date: (dateString: string) => new Date(dateString).toLocaleDateString('fr-FR'),
  dateTime: (dateString: string) => new Date(dateString).toLocaleString('fr-FR'),
  fileSize: (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  },
  // ✅ Formatage spécifique quotas
  quotaProgress: (used: number, limit: number) => {
    if (limit === -1) return 'Illimité';
    return `${used}/${limit}`;
  },
  quotaPercentage: (used: number, limit: number) => {
    if (limit === -1) return 0;
    return Math.round((used / limit) * 100);
  }
} as const;

// ============================================
// TYPES HELPER POUR LES FORMULAIRES
// ============================================

export interface FormValidationError {
  field: string;
  message: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: FormValidationError[];
}

// ============================================
// HELPERS API
// ============================================

// Helper pour construire les URLs avec paramètres
export const buildApiUrl = (endpoint: string, params?: Record<string, any>): string => {
  if (!params) return endpoint;
  
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString());
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `${endpoint}?${queryString}` : endpoint;
};

// Helper pour gérer les erreurs API
export const handleApiError = (error: any): { message: string; code?: string } => {
  if (error.response?.data?.error) {
    return {
      message: error.response.data.error,
      code: error.response.data.code
    };
  }
  
  if (error.response?.data?.message) {
    return {
      message: error.response.data.message
    };
  }
  
  if (error.message) {
    return {
      message: error.message
    };
  }
  
  return {
    message: 'Une erreur inattendue s\'est produite'
  };
};

// ✅ Helper spécifique quotas
export const isQuotaError = (error: any): boolean => {
  return error.response?.status === 403 && 
         error.response?.data?.error?.includes('quota');
};