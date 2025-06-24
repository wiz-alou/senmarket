import { apiClient } from '../client';
import { Listing, CreateListingRequest, PaginatedResponse, ApiResponse } from '../types';

export interface ListingFilters {
  search?: string;
  category_id?: string;
  region?: string;
  min_price?: number;
  max_price?: number;
  sort?: 'date' | 'price_asc' | 'price_desc' | 'views';
  page?: number;
  limit?: number;
}

export class ListingsService {
  async getListings(filters: ListingFilters = {}): Promise<PaginatedResponse<Listing>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await apiClient.get<ApiResponse<PaginatedResponse<Listing>>>(
      `/listings?${params.toString()}`
    );
    return response.data.data;
  }

  async getListing(id: string): Promise<Listing> {
    const response = await apiClient.get<ApiResponse<Listing>>(`/listings/${id}`);
    return response.data.data;
  }

  async getMyListings(page = 1, limit = 20): Promise<PaginatedResponse<Listing>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Listing>>>(
      `/listings/my?page=${page}&limit=${limit}`
    );
    return response.data.data;
  }

  async createListing(data: CreateListingRequest): Promise<Listing> {
    const response = await apiClient.post<ApiResponse<Listing>>('/listings', data);
    return response.data.data;
  }

  async updateListing(id: string, data: Partial<CreateListingRequest>): Promise<Listing> {
    const response = await apiClient.put<ApiResponse<Listing>>(`/listings/${id}`, data);
    return response.data.data;
  }

  async deleteListing(id: string): Promise<void> {
    await apiClient.delete(`/listings/${id}`);
  }

  async publishListing(id: string): Promise<Listing> {
    const response = await apiClient.post<ApiResponse<Listing>>(`/listings/${id}/publish`);
    return response.data.data;
  }

  async searchListings(query: string, filters: Omit<ListingFilters, 'search'> = {}): Promise<PaginatedResponse<Listing>> {
    const params = new URLSearchParams({ search: query });
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await apiClient.get<ApiResponse<PaginatedResponse<Listing>>>(
      `/listings/search?${params.toString()}`
    );
    return response.data.data;
  }
}

export const listingsService = new ListingsService();