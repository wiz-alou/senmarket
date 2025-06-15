export interface User {
  id: string;
  phone: string;
  email?: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  region: string;
  is_verified: boolean;
  created_at: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface RegisterRequest {
  phone: string;
  email?: string;
  first_name: string;
  last_name: string;
  password: string;
  region: string;
}

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface VerifyRequest {
  phone: string;
  code: string;
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
  created_at: string;
  expires_at: string;
  user?: User;
  category?: Category;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  icon: string;
  description: string;
}

export interface ListingsResponse {
  data: {
    listings: Listing[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}