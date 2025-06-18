import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactsService } from '@/lib/api';
import { useNotifications } from '@/stores';
import { ContactSellerRequest } from '@/lib/api/types';

export const useContacts = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['my-contacts', page, limit],
    queryFn: () => contactsService.getMyContacts(page, limit),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useContactStats = () => {
  return useQuery({
    queryKey: ['contact-stats'],
    queryFn: contactsService.getContactStats,
    staleTime: 30 * 1000, // 30 secondes
  });
};

export const useContactMutations = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotifications();

  // Contacter un vendeur
  const contactSellerMutation = useMutation({
    mutationFn: (data: ContactSellerRequest) => contactsService.contactSeller(data),
    onSuccess: () => {
      showSuccess('Message envoyé', 'Votre message a été envoyé au vendeur');
    },
    onError: (error: Error) => {
      showError('Erreur d\'envoi', error.message);
    },
  });

  // Marquer comme lu
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => contactsService.markContactAsRead(id),
    onSuccess: () => {
      // Invalider les queries des contacts
      queryClient.invalidateQueries({ queryKey: ['my-contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contact-stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: Error) => {
      showError('Erreur', error.message);
    },
  });

  return {
    // Mutations
    contactSeller: contactSellerMutation.mutate,
    markAsRead: markAsReadMutation.mutate,

    // États
    isContactingSeller: contactSellerMutation.isPending,
    isMarkingAsRead: markAsReadMutation.isPending,
  };
};