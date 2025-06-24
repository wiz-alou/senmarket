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
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  icon: string;
  description: string;
  sort_order: number;
}

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
  user?: User;
  category?: Category;
}

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
  listing?: Pick<Listing, 'id' | 'title'>;
}

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
  listing?: Pick<Listing, 'id' | 'title'>;
}

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
}

// Types pour les requêtes
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

export interface CreateListingRequest {
  title: string;
  description: string;
  price: number;
  category_id: string;
  region: string;
  images: string[];
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
}

// Types pour les réponses paginées
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}