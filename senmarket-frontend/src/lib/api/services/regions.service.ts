import { apiClient } from '../client';
import { ApiResponse } from '../types';

export class RegionsService {
  async getRegions(): Promise<string[]> {
    const response = await apiClient.get<ApiResponse<string[]>>('/regions');
    return response.data.data;
  }
}

export const regionsService = new RegionsService();