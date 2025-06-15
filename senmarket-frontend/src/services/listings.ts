// src/services/listings.ts
import { apiClient } from '@/lib/api';
import { Listing, ListingsResponse } from '@/types/api';

export interface CreateListingRequest {
  category_id: string;
  title: string;
  description: string;
  price: number;
  region: string;
  images: string[];
}

export interface ListingsQuery {
  page?: number;
  limit?: number;
  category_id?: string;
  region?: string;
  min_price?: number;
  max_price?: number;
  search?: string;
  status?: string;
}

class ListingsService {
  async getListings(query: ListingsQuery = {}): Promise<ListingsResponse> {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    return apiClient.get<ListingsResponse>(`/listings?${params.toString()}`);
  }

  async getListing(id: string): Promise<Listing> {
    return apiClient.get<Listing>(`/listings/${id}`);
  }

  async createListing(data: CreateListingRequest): Promise<Listing> {
    return apiClient.post<Listing>('/listings', data);
  }

  async updateListing(id: string, data: Partial<CreateListingRequest>): Promise<Listing> {
    return apiClient.put<Listing>(`/listings/${id}`, data);
  }

  async deleteListing(id: string): Promise<void> {
    return apiClient.delete(`/listings/${id}`);
  }

  async publishListing(id: string): Promise<Listing> {
    return apiClient.post<Listing>(`/listings/${id}/publish`);
  }

  async getMyListings(query: ListingsQuery = {}): Promise<ListingsResponse> {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    return apiClient.get<ListingsResponse>(`/listings/my?${params.toString()}`);
  }

  async searchListings(searchTerm: string, query: ListingsQuery = {}): Promise<ListingsResponse> {
    const params = new URLSearchParams({ q: searchTerm });
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    return apiClient.get<ListingsResponse>(`/listings/search?${params.toString()}`);
  }
}

export const listingsService = new ListingsService();