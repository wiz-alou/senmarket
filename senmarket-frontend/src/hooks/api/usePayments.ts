import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsService } from '@/lib/api';
import { useNotifications } from '@/stores';
import { PaymentRequest } from '@/lib/api/types';

export const usePayments = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['my-payments', page, limit],
    queryFn: () => paymentsService.getMyPayments(page, limit),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const usePayment = (id: string) => {
  return useQuery({
    queryKey: ['payment', id],
    queryFn: () => paymentsService.getPayment(id),
    enabled: !!id,
    staleTime: 30 * 1000, // 30 secondes
  });
};

export const usePaymentMutations = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotifications();

  // Initier un paiement
  const initiatePaymentMutation = useMutation({
    mutationFn: ({ listingId, data }: { listingId: string; data: PaymentRequest }) =>
      paymentsService.initiatePayment(listingId, data),
    onSuccess: (response) => {
      // Invalider les queries
      queryClient.invalidateQueries({ queryKey: ['my-payments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      showSuccess('Paiement initié', 'Suivez les instructions sur votre téléphone');
      
      // Ouvrir l'URL de paiement
      if (response.payment_url) {
        window.open(response.payment_url, '_blank');
      }
    },
    onError: (error: Error) => {
      showError('Erreur de paiement', error.message);
    },
  });

  return {
    // Mutations
    initiatePayment: initiatePaymentMutation.mutate,

    // États
    isInitiatingPayment: initiatePaymentMutation.isPending,

    // Données
    paymentResponse: initiatePaymentMutation.data,
  };
};
