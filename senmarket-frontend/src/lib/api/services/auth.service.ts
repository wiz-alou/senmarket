import { apiClient } from '../client';
import { User, LoginRequest, RegisterRequest, ApiResponse } from '../types';

export interface AuthResponse {
  user: User;
  token: string;
}

export class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return response.data.data;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data.data;
  }

  async verifyPhone(phone: string, code: string): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/verify', {
      phone,
      code
    });
    return response.data.data;
  }

  async sendVerificationCode(phone: string): Promise<void> {
    await apiClient.post('/auth/send-code', { phone });
  }

  async getProfile(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/profile');
    return response.data.data;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>('/auth/profile', data);
    return response.data.data;
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('senmarket_token');
      localStorage.removeItem('senmarket_user');
    }
  }
}

export const authService = new AuthService();