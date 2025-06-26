// src/hooks/useQuota.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import quotaService, {
  QuotaStatus,
  EligibilityCheck,
  QuotaSummary,
  QuotaHistory,
  CurrentPhase,
  PricingInfo,
  PlatformStats
} from '@/services/quota.service';

// Clés de cache pour React Query
export const QUOTA_QUERY_KEYS = {
  all: ['quota'] as const,
  status: () => [...QUOTA_QUERY_KEYS.all, 'status'] as const,
  eligibility: () => [...QUOTA_QUERY_KEYS.all, 'eligibility'] as const,
  summary: () => [...QUOTA_QUERY_KEYS.all, 'summary'] as const,
  history: (months?: number) => [...QUOTA_QUERY_KEYS.all, 'history', months] as const,
  currentPhase: () => [...QUOTA_QUERY_KEYS.all, 'current-phase'] as const,
  pricing: () => [...QUOTA_QUERY_KEYS.all, 'pricing'] as const,
  platformStats: () => [...QUOTA_QUERY_KEYS.all, 'platform-stats'] as const,
};

// Hook pour obtenir le statut complet des quotas
export function useQuotaStatus() {
  return useQuery({
    queryKey: QUOTA_QUERY_KEYS.status(),
    queryFn: quotaService.getQuotaStatus,
    staleTime: 30 * 1000, // 30 secondes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: true,
  });
}

// Hook pour vérifier l'éligibilité
export function useEligibilityCheck() {
  return useQuery({
    queryKey: QUOTA_QUERY_KEYS.eligibility(),
    queryFn: quotaService.checkEligibility,
    staleTime: 15 * 1000, // 15 secondes (plus frais)
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });
}

// Hook pour le résumé des quotas (version légère)
export function useQuotaSummary() {
  return useQuery({
    queryKey: QUOTA_QUERY_KEYS.summary(),
    queryFn: quotaService.getQuotaSummary,
    staleTime: 20 * 1000, // 20 secondes
    gcTime: 3 * 60 * 1000, // 3 minutes
    retry: 2,
  });
}

// Hook pour l'historique des quotas
export function useQuotaHistory(months: number = 6) {
  return useQuery({
    queryKey: QUOTA_QUERY_KEYS.history(months),
    queryFn: () => quotaService.getQuotaHistory(months),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    enabled: months > 0,
  });
}

// Hook pour la phase actuelle (public, pas besoin d'auth)
export function useCurrentPhase() {
  return useQuery({
    queryKey: QUOTA_QUERY_KEYS.currentPhase(),
    queryFn: quotaService.getCurrentPhase,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    refetchOnWindowFocus: false, // Moins critique
  });
}

// Hook pour les informations de tarification (public)
export function usePricingInfo() {
  return useQuery({
    queryKey: QUOTA_QUERY_KEYS.pricing(),
    queryFn: quotaService.getPricingInfo,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 60 * 60 * 1000, // 1 heure
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

// Hook pour les statistiques de la plateforme
export function usePlatformStats() {
  return useQuery({
    queryKey: QUOTA_QUERY_KEYS.platformStats(),
    queryFn: quotaService.getPlatformStats,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    enabled: false, // Activé manuellement (pour admin)
  });
}

// Hook mutation pour mettre à jour la phase utilisateur
export function useUpdateUserPhase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: quotaService.updateUserPhase,
    onSuccess: (data) => {
      // Invalider tous les caches de quota
      queryClient.invalidateQueries({ queryKey: QUOTA_QUERY_KEYS.all });
      
      toast.success('Phase utilisateur mise à jour', {
        description: `Nouvelle phase: ${data.phase_name}`,
      });
    },
    onError: (error: any) => {
      toast.error('Erreur mise à jour phase', {
        description: error?.response?.data?.error || 'Une erreur est survenue',
      });
    },
  });
}

// Hook mutation pour nettoyer les quotas
export function useCleanupQuotas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: quotaService.cleanupQuotas,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUOTA_QUERY_KEYS.history() });
      
      toast.success('Nettoyage effectué', {
        description: data.message,
      });
    },
    onError: (error: any) => {
      toast.error('Erreur nettoyage', {
        description: error?.response?.data?.error || 'Une erreur est survenue',
      });
    },
  });
}

// Hook composé pour vérifier l'éligibilité avant création d'annonce
export function useCreateListingEligibility() {
  const eligibilityQuery = useEligibilityCheck();
  const statusQuery = useQuotaStatus();

  return {
    ...eligibilityQuery,
    // Données enrichies
    canCreateFree: eligibilityQuery.data?.can_create_free ?? false,
    requiresPayment: eligibilityQuery.data?.requires_payment ?? true,
    isInLaunchPhase: statusQuery.data ? quotaService.isInLaunchPhase(statusQuery.data) : false,
    statusColor: statusQuery.data ? quotaService.getStatusColor(statusQuery.data) : 'red',
    statusMessage: statusQuery.data ? quotaService.getStatusMessage(statusQuery.data) : '',
    urgencyMessage: statusQuery.data ? quotaService.getUrgencyMessage(statusQuery.data) : null,
    recommendations: statusQuery.data ? quotaService.getActionRecommendations(statusQuery.data) : [],
    
    // Méthodes utilitaires
    refetchBoth: () => {
      eligibilityQuery.refetch();
      statusQuery.refetch();
    },
  };
}

// Hook pour la bannière de lancement avec données temps réel
export function useLaunchBanner() {
  const phaseQuery = useCurrentPhase();
  const statusQuery = useQuotaStatus();

  const isVisible = phaseQuery.data?.is_launch_active ?? false;
  const daysLeft = phaseQuery.data?.days_until_launch_end ?? 0;
  
  return {
    isVisible,
    daysLeft,
    isEndingSoon: daysLeft <= 7,
    isCritical: daysLeft <= 3,
    phaseData: phaseQuery.data,
    statusData: statusQuery.data,
    isLoading: phaseQuery.isLoading || statusQuery.isLoading,
    error: phaseQuery.error || statusQuery.error,
    
    // Méthodes
    refetch: () => {
      phaseQuery.refetch();
      statusQuery.refetch();
    },
  };
}

// Hook pour le tableau de bord quota (usage complexe)
export function useQuotaDashboard() {
  const statusQuery = useQuotaStatus();
  const historyQuery = useQuotaHistory(6);
  const pricingQuery = usePricingInfo();

  const status = statusQuery.data;
  const history = historyQuery.data;
  const pricing = pricingQuery.data;

  // Calculs dérivés
  const quotaUsagePercent = status ? quotaService.getQuotaUsagePercent(status) : 0;
  const canCreateFree = status?.can_create_free ?? false;
  const isInLaunchPhase = status ? quotaService.isInLaunchPhase(status) : false;

  // Statistiques historiques
  const totalListingsCreated = history?.summary.total_listings ?? 0;
  const totalFreeUsed = history?.summary.total_free_used ?? 0;
  const totalPaidUsed = history?.summary.total_paid ?? 0;

  return {
    // États des requêtes
    isLoading: statusQuery.isLoading || historyQuery.isLoading || pricingQuery.isLoading,
    isError: statusQuery.isError || historyQuery.isError || pricingQuery.isError,
    error: statusQuery.error || historyQuery.error || pricingQuery.error,

    // Données principales
    status,
    history,
    pricing,

    // Données calculées
    quotaUsagePercent,
    canCreateFree,
    isInLaunchPhase,
    totalListingsCreated,
    totalFreeUsed,
    totalPaidUsed,

    // Méthodes utilitaires
    getStatusColor: () => status ? quotaService.getStatusColor(status) : 'gray',
    getStatusMessage: () => status ? quotaService.getStatusMessage(status) : '',
    getUrgencyMessage: () => status ? quotaService.getUrgencyMessage(status) : null,
    getRecommendations: () => status ? quotaService.getActionRecommendations(status) : [],
    formatPrice: (price: number) => quotaService.formatPrice(price, pricing?.currency),

    // Actions
    refetchAll: () => {
      statusQuery.refetch();
      historyQuery.refetch();
      pricingQuery.refetch();
    },
  };
}

// Hook pour invalider les caches de quota (après création d'annonce)
export function useInvalidateQuotaCache() {
  const queryClient = useQueryClient();

  return {
    invalidateStatus: () => {
      queryClient.invalidateQueries({ queryKey: QUOTA_QUERY_KEYS.status() });
    },
    invalidateEligibility: () => {
      queryClient.invalidateQueries({ queryKey: QUOTA_QUERY_KEYS.eligibility() });
    },
    invalidateSummary: () => {
      queryClient.invalidateQueries({ queryKey: QUOTA_QUERY_KEYS.summary() });
    },
    invalidateHistory: () => {
      queryClient.invalidateQueries({ queryKey: QUOTA_QUERY_KEYS.history() });
    },
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: QUOTA_QUERY_KEYS.all });
    },
  };
}

// Hook pour précharger les données de quota
export function usePrefetchQuotaData() {
  const queryClient = useQueryClient();

  return {
    prefetchStatus: () => {
      queryClient.prefetchQuery({
        queryKey: QUOTA_QUERY_KEYS.status(),
        queryFn: quotaService.getQuotaStatus,
        staleTime: 30 * 1000,
      });
    },
    prefetchEligibility: () => {
      queryClient.prefetchQuery({
        queryKey: QUOTA_QUERY_KEYS.eligibility(),
        queryFn: quotaService.checkEligibility,
        staleTime: 15 * 1000,
      });
    },
    prefetchCurrentPhase: () => {
      queryClient.prefetchQuery({
        queryKey: QUOTA_QUERY_KEYS.currentPhase(),
        queryFn: quotaService.getCurrentPhase,
        staleTime: 60 * 1000,
      });
    },
  };
}

// Export par défaut de tous les hooks principaux
export default {
  useQuotaStatus,
  useEligibilityCheck,
  useQuotaSummary,
  useQuotaHistory,
  useCurrentPhase,
  usePricingInfo,
  usePlatformStats,
  useUpdateUserPhase,
  useCleanupQuotas,
  useCreateListingEligibility,
  useLaunchBanner,
  useQuotaDashboard,
  useInvalidateQuotaCache,
  usePrefetchQuotaData,
};