import { apiClient } from '@/lib/api';
import { User, AuthResponse, RegisterRequest, LoginRequest, VerifyRequest } from '@/types/api';

class AuthService {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/register', data);
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/login', data);
  }

  async verify(data: VerifyRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/verify', data);
  }

  async sendCode(phone: string): Promise<{ message: string }> {
    return apiClient.post('/auth/send-code', { phone });
  }

  async getProfile(): Promise<User> {
    return apiClient.get<User>('/auth/profile');
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    return apiClient.put<User>('/auth/profile', data);
  }

  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('senmarket_token', token);
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('senmarket_token');
    }
    return null;
  }

  removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('senmarket_token');
    }
  }

  logout(): void {
    this.removeToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  }
}

export const authService = new AuthService();