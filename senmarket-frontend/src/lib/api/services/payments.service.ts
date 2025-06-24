import { apiClient } from '../client';
import { Payment, PaymentRequest, PaginatedResponse, ApiResponse } from '../types';

export interface PaymentResponse {
  payment: Payment;
  payment_url: string;
  provider_response?: any;
}

export class PaymentsService {
  async initiatePayment(listingId: string, data: PaymentRequest): Promise<PaymentResponse> {
    const response = await apiClient.post<ApiResponse<PaymentResponse>>(
      `/listings/${listingId}/pay`,
      data
    );
    return response.data.data;
  }

  async getPayment(id: string): Promise<Payment> {
    const response = await apiClient.get<ApiResponse<Payment>>(`/payments/${id}`);
    return response.data.data;
  }

  async getMyPayments(page = 1, limit = 20): Promise<PaginatedResponse<Payment>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Payment>>>(
      `/payments/my?page=${page}&limit=${limit}`
    );
    return response.data.data;
  }
}

export const paymentsService = new PaymentsService();