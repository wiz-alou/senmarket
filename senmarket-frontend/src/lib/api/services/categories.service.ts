import { apiClient } from '../client';
import { Category, ApiResponse } from '../types';

export interface CategoryWithStats extends Category {
  listings_count: number;
}

export class CategoriesService {
  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get<ApiResponse<Category[]>>('/categories');
    return response.data.data;
  }

  async getCategoriesWithStats(): Promise<CategoryWithStats[]> {
    const response = await apiClient.get<ApiResponse<CategoryWithStats[]>>('/categories/stats');
    return response.data.data;
  }

  async getCategory(id: string): Promise<Category> {
    const response = await apiClient.get<ApiResponse<Category>>(`/categories/${id}`);
    return response.data.data;
  }

  async getCategoryBySlug(slug: string): Promise<Category> {
    const response = await apiClient.get<ApiResponse<Category>>(`/categories/slug/${slug}`);
    return response.data.data;
  }
}

export const categoriesService = new CategoriesService();