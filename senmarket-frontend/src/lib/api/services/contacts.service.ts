import { apiClient } from '../client';
import { Contact, ContactSellerRequest, PaginatedResponse, ApiResponse } from '../types';

export class ContactsService {
  async contactSeller(data: ContactSellerRequest): Promise<Contact> {
    const response = await apiClient.post<ApiResponse<Contact>>('/contacts', data);
    return response.data.data;
  }

  async getMyContacts(page = 1, limit = 20): Promise<PaginatedResponse<Contact>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Contact>>>(
      `/contacts/my?page=${page}&limit=${limit}`
    );
    return response.data.data;
  }

  async markContactAsRead(id: string): Promise<Contact> {
    const response = await apiClient.put<ApiResponse<Contact>>(`/contacts/${id}/read`);
    return response.data.data;
  }

  async getContactStats(): Promise<{ total: number; unread: number }> {
    const response = await apiClient.get<ApiResponse<{ total: number; unread: number }>>('/contacts/stats');
    return response.data.data;
  }
}

export const contactsService = new ContactsService();