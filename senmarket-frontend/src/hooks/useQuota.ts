// src/hooks/useQuota.ts - VERSION CORRIGÉE AVEC IMPORTS ALIGNÉS
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth.store'; // ✅ AJOUT IMPORT

// ✅ CORRECTION MAJEURE : Import depuis le bon chemin
import { 
  quotaService,
  type QuotaStatus,
  type EligibilityCheck,
  type QuotaSummary,
  type QuotaHistory,
  type CurrentPhase,
  type PlatformStats
} from '@/lib/api';

// ============================================
// CLÉS DE CACHE POUR REACT QUERY
// ============================================

export const QUOTA_QUERY_KEYS = {
  all: ['quota'] as const,
  status: () => [...QUOTA_QUERY_KEYS.all, 'status'] as const,
  eligibility: () => [...QUOTA_QUERY_KEYS.all, 'eligibility'] as const,
  summary: () => [...QUOTA_QUERY_KEYS.all, 'summary'] as const,
  history: (months?: number) => [...QUOTA_QUERY_KEYS.all, 'history', months] as const,
  currentPhase: () => [...QUOTA_QUERY_KEYS.all, 'current-phase'] as const,
  platformStats: () => [...QUOTA_QUERY_KEYS.all, 'platform-stats'] as const,
};

// ============================================
// HOOKS PRINCIPAUX - MODIFIÉS AVEC enabled: isAuthenticated
// ============================================

// Hook pour obtenir le statut complet des quotas
export function useQuotaStatus() {
  const { isAuthenticated } = useAuthStore(); // ✅ AJOUT AUTH CHECK
  
  return useQuery({
    queryKey: QUOTA_QUERY_KEYS.status(),
    queryFn: quotaService.getQuotaStatus,
    staleTime: 30 * 1000, // 30 secondes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: true,
    enabled: isAuthenticated, // ✅ CRUCIAL : Seulement si authentifié
  });
}

// Hook pour vérifier l'éligibilité
export function useEligibilityCheck() {
  const { isAuthenticated } = useAuthStore(); // ✅ AJOUT AUTH CHECK
  
  return useQuery({
    queryKey: QUOTA_QUERY_KEYS.eligibility(),
    queryFn: quotaService.checkEligibility,
    staleTime: 15 * 1000, // 15 secondes (plus frais)
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
    enabled: isAuthenticated, // ✅ CRUCIAL : Seulement si authentifié
  });
}

// Hook pour le résumé des quotas (version légère)
export function useQuotaSummary() {
  const { isAuthenticated } = useAuthStore(); // ✅ AJOUT AUTH CHECK
  
  return useQuery({
    queryKey: QUOTA_QUERY_KEYS.summary(),
    queryFn: quotaService.getQuotaSummary,
    staleTime: 20 * 1000, // 20 secondes
    gcTime: 3 * 60 * 1000, // 3 minutes
    retry: 2,
    enabled: isAuthenticated, // ✅ CRUCIAL : Seulement si authentifié
  });
}

// Hook pour l'historique des quotas
export function useQuotaHistory(months: number = 6) {
  const { isAuthenticated } = useAuthStore(); // ✅ AJOUT AUTH CHECK
  
  return useQuery({
    queryKey: QUOTA_QUERY_KEYS.history(months),
    queryFn: () => quotaService.getQuotaHistory(months),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    enabled: isAuthenticated && months > 0, // ✅ CRUCIAL : Auth + validation
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
    // ✅ PAS DE enabled: car c'est public
  });
}

// Hook pour les statistiques de la plateforme
export function usePlatformStats() {
  const { isAuthenticated } = useAuthStore(); // ✅ AJOUT AUTH CHECK
  
  return useQuery({
    queryKey: QUOTA_QUERY_KEYS.platformStats(),
    queryFn: quotaService.getPlatformStats,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    enabled: isAuthenticated, // ✅ CRUCIAL : Auth pour les stats admin
  });
}

// ============================================
// HOOKS MUTATIONS
// ============================================

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

// ============================================
// HOOKS COMPOSÉS - MODIFIÉS AVEC FALLBACKS
// ============================================

// Hook composé pour vérifier l'éligibilité avant création d'annonce
export function useCreateListingEligibility() {
  const { isAuthenticated } = useAuthStore(); // ✅ AJOUT AUTH CHECK
  const eligibilityQuery = useEligibilityCheck();
  const statusQuery = useQuotaStatus();

  // ✅ VALEURS PAR DÉFAUT QUAND NON CONNECTÉ
  if (!isAuthenticated) {
    return {
      isLoading: false,
      isError: false,
      error: null,
      data: null,
      canCreateFree: false,
      requiresPayment: true,
      isInLaunchPhase: true, // Supposer qu'on est en phase de lancement pour le marketing
      statusColor: 'blue',
      statusMessage: 'Connectez-vous pour publier des annonces gratuitement',
      urgencyMessage: 'Profitez de notre phase de lancement !',
      recommendations: [],
      refetchBoth: () => {}, // Fonction vide
    };
  }

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
  const phaseQuery = useCurrentPhase(); // ✅ Public, pas besoin d'auth
  const statusQuery = useQuotaStatus(); // ✅ Déjà protégé par isAuthenticated

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
  const statusQuery = useQuotaStatus(); // ✅ Déjà protégé
  const historyQuery = useQuotaHistory(6); // ✅ Déjà protégé

  const status = statusQuery.data;
  const history = historyQuery.data;

  // Calculs dérivés
  const quotaUsagePercent = status ? quotaService.getQuotaUsagePercent(status) : 0;
  const canCreateFree = status?.can_create_free ?? false;
  const isInLaunchPhase = status ? quotaService.isInLaunchPhase(status) : false;

  // Statistiques historiques
  const totalListingsCreated = history?.summary?.total_listings ?? 0;
  const totalFreeUsed = history?.summary?.total_free_used ?? 0;
  const totalPaidUsed = history?.summary?.total_paid ?? 0;

  return {
    // États des requêtes
    isLoading: statusQuery.isLoading || historyQuery.isLoading,
    isError: statusQuery.isError || historyQuery.isError,
    error: statusQuery.error || historyQuery.error,

    // Données principales
    status,
    history,

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
    formatPrice: (price: number, currency: string = 'FCFA') => quotaService.formatPrice(price, currency),

    // Actions
    refetchAll: () => {
      statusQuery.refetch();
      historyQuery.refetch();
    },
  };
}

// ============================================
// HOOKS UTILITAIRES
// ============================================

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
      
      // ✅ Invalider aussi les caches des listings qui incluent quota_status
      queryClient.invalidateQueries({ queryKey: ['listings', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
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
    prefetchAll: () => {
      queryClient.prefetchQuery({
        queryKey: QUOTA_QUERY_KEYS.status(),
        queryFn: quotaService.getQuotaStatus,
        staleTime: 30 * 1000,
      });
      queryClient.prefetchQuery({
        queryKey: QUOTA_QUERY_KEYS.eligibility(),
        queryFn: quotaService.checkEligibility,
        staleTime: 15 * 1000,
      });
      queryClient.prefetchQuery({
        queryKey: QUOTA_QUERY_KEYS.currentPhase(),
        queryFn: quotaService.getCurrentPhase,
        staleTime: 60 * 1000,
      });
    },
  };
}

// ============================================
// HOOKS SIMPLIFIÉS POUR LES CAS COURANTS
// ============================================

// Hook simple pour vérifier si l'utilisateur peut créer gratuitement
export function useCanCreateFree() {
  const { data, isLoading, error } = useEligibilityCheck();
  
  return {
    canCreateFree: data?.can_create_free ?? false,
    isLoading,
    error,
    data
  };
}

// Hook simple pour obtenir le prix de création
export function useCreationPrice() {
  const { data, isLoading, error } = useEligibilityCheck();
  
  return {
    price: data?.standard_price ?? 200,
    currency: data?.currency ?? 'FCFA',
    isFree: data?.can_create_free ?? false,
    isLoading,
    error,
    formattedPrice: data ? quotaService.formatPrice(data.standard_price, data.currency) : '200 FCFA'
  };
}

// Hook simple pour les notifications de quota
export function useQuotaNotifications() {
  const { data: status } = useQuotaStatus();
  
  const notifications = [];
  
  if (status) {
    const urgencyMessage = quotaService.getUrgencyMessage(status);
    if (urgencyMessage) {
      notifications.push({
        type: 'warning' as const,
        message: urgencyMessage,
        action: 'create_listing'
      });
    }
    
    const recommendations = quotaService.getActionRecommendations(status);
    recommendations.forEach(rec => {
      notifications.push({
        type: rec.priority === 'high' ? 'error' : 'info' as const,
        message: rec.message,
        action: rec.action
      });
    });
  }
  
  return {
    notifications,
    hasNotifications: notifications.length > 0,
    criticalNotifications: notifications.filter(n => n.type === 'error'),
    hasCritical: notifications.some(n => n.type === 'error')
  };
}

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default {
  useQuotaStatus,
  useEligibilityCheck,
  useQuotaSummary,
  useQuotaHistory,
  useCurrentPhase,
  usePlatformStats,
  useUpdateUserPhase,
  useCreateListingEligibility,
  useLaunchBanner,
  useQuotaDashboard,
  useInvalidateQuotaCache,
  usePrefetchQuotaData,
  useCanCreateFree,
  useCreationPrice,
  useQuotaNotifications,
};