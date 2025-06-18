import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { listingsService } from '@/lib/api';
import { useListingsStore } from '@/stores';
import { useNotifications } from '@/stores';
import { ListingFilters, CreateListingRequest } from '@/lib/api/types';

export const useListings = (filters: ListingFilters = {}) => {
  const { showSuccess, showError } = useNotifications();
  const { setListings, setLoading, setError } = useListingsStore();

  // Query pour les listings avec pagination
  const {
    data,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['listings', filters],
    queryFn: () => listingsService.getListings(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    select: (data) => {
      // Mettre à jour le store global
      setListings(data.data);
      return data;
    },
  });

  // Query infinie pour le scroll infini
  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingInfinite,
  } = useInfiniteQuery({
    queryKey: ['listings-infinite', filters],
    queryFn: ({ pageParam = 1 }) =>
      listingsService.getListings({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage) => {
      const { pagination } = lastPage;
      return pagination.page < pagination.pages ? pagination.page + 1 : undefined;
    },
    initialPageParam: 1,
  });

  // Fonction utilitaire pour obtenir tous les listings du scroll infini
  const getAllListings = () => {
    return infiniteData?.pages.flatMap(page => page.data) || [];
  };

  return {
    // Données
    listings: data?.data || [],
    pagination: data?.pagination,
    allListings: getAllListings(),
    
    // États
    isLoading,
    isLoadingInfinite,
    error,
    isRefetching,
    
    // Pagination infinie
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    
    // Actions
    refetch,
  };
};

// Hook pour un listing spécifique
export const useListing = (id: string) => {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: () => listingsService.getListing(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook pour mes listings
export const useMyListings = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['my-listings', page, limit],
    queryFn: () => listingsService.getMyListings(page, limit),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Hook pour les mutations de listings
export const useListingMutations = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotifications();

  // Créer une annonce
  const createMutation = useMutation({
    mutationFn: (data: CreateListingRequest) => listingsService.createListing(data),
    onSuccess: (newListing) => {
      // Invalider les queries des listings
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      showSuccess('Annonce créée', 'Votre annonce a été créée avec succès');
    },
    onError: (error: Error) => {
      showError('Erreur de création', error.message);
    },
  });

  // Mettre à jour une annonce
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateListingRequest> }) =>
      listingsService.updateListing(id, data),
    onSuccess: (updatedListing, variables) => {
      // Mettre à jour les caches
      queryClient.setQueryData(['listing', variables.id], updatedListing);
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      
      showSuccess('Annonce mise à jour', 'Vos modifications ont été sauvegardées');
    },
    onError: (error: Error) => {
      showError('Erreur de mise à jour', error.message);
    },
  });

  // Supprimer une annonce
  const deleteMutation = useMutation({
    mutationFn: (id: string) => listingsService.deleteListing(id),
    onSuccess: (_, id) => {
      // Supprimer du cache
      queryClient.removeQueries({ queryKey: ['listing', id] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      showSuccess('Annonce supprimée', 'Votre annonce a été supprimée');
    },
    onError: (error: Error) => {
      showError('Erreur de suppression', error.message);
    },
  });

  // Publier une annonce
  const publishMutation = useMutation({
    mutationFn: (id: string) => listingsService.publishListing(id),
    onSuccess: (publishedListing, id) => {
      // Mettre à jour les caches
      queryClient.setQueryData(['listing', id], publishedListing);
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      showSuccess('Annonce publiée', 'Votre annonce est maintenant visible');
    },
    onError: (error: Error) => {
      showError('Erreur de publication', error.message);
    },
  });

  return {
    // Mutations
    createListing: createMutation.mutate,
    updateListing: updateMutation.mutate,
    deleteListing: deleteMutation.mutate,
    publishListing: publishMutation.mutate,

    // États de chargement
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isPublishing: publishMutation.isPending,

    // Données des mutations
    createdListing: createMutation.data,
    updatedListing: updateMutation.data,
    publishedListing: publishMutation.data,
  };
};