import { apiClient } from '../client';
import { DashboardStats, User, ApiResponse } from '../types';

export interface DashboardData {
  user: User;
  stats: DashboardStats;
}

export class DashboardService {
  async getDashboardData(): Promise<DashboardData> {
    const response = await apiClient.get<ApiResponse<DashboardData>>('/dashboard');
    return response.data.data;
  }
}

export const dashboardService = new DashboardService();