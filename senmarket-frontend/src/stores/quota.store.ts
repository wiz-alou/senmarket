// src/stores/quota.store.ts - VERSION CORRIGÉE AVEC IMPORTS ALIGNÉS

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// ✅ CORRECTION MAJEURE : Import depuis le bon chemin
import { 
  quotaService,
  type QuotaStatus,
  type EligibilityCheck,
  type CurrentPhase
} from '@/lib/api';

// ============================================
// TYPES POUR LE STORE
// ============================================

interface QuotaState {
  // État du quota
  status: QuotaStatus | null;
  eligibility: EligibilityCheck | null;
  currentPhase: CurrentPhase | null;
  
  // États de chargement
  isLoading: boolean;
  isLoadingStatus: boolean;
  isLoadingEligibility: boolean;
  isLoadingPhase: boolean;
  
  // Erreurs
  error: string | null;
  lastFetch: number | null;
  
  // Cache
  cacheExpiry: number;
}

interface QuotaActions {
  // Actions principales
  setStatus: (status: QuotaStatus | null) => void;
  setEligibility: (eligibility: EligibilityCheck | null) => void;
  setCurrentPhase: (phase: CurrentPhase | null) => void;
  
  // Actions de chargement
  setLoading: (loading: boolean) => void;
  setLoadingStatus: (loading: boolean) => void;
  setLoadingEligibility: (loading: boolean) => void;
  setLoadingPhase: (loading: boolean) => void;
  
  // Actions d'erreur
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Actions de cache
  updateLastFetch: () => void;
  isCacheValid: () => boolean;
  clearCache: () => void;
  
  // Actions métier
  fetchStatus: () => Promise<void>;
  fetchEligibility: () => Promise<void>;
  fetchCurrentPhase: () => Promise<void>;
  refreshAll: () => Promise<void>;
  
  // Utilitaires
  canCreateFree: () => boolean;
  getStatusMessage: () => string;
  getUrgencyMessage: () => string | null;
  formatPrice: (price: number) => string;
}

// ============================================
// CONSTANTES
// ============================================

const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes
const DEFAULT_STATE: QuotaState = {
  status: null,
  eligibility: null,
  currentPhase: null,
  isLoading: false,
  isLoadingStatus: false,
  isLoadingEligibility: false,
  isLoadingPhase: false,
  error: null,
  lastFetch: null,
  cacheExpiry: CACHE_DURATION,
};

// ============================================
// STORE PRINCIPAL
// ============================================

export const useQuotaStore = create<QuotaState & QuotaActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...DEFAULT_STATE,

        // ============================================
        // ACTIONS DE BASE
        // ============================================

        setStatus: (status) => {
          set((state) => ({
            ...state,
            status,
            isLoadingStatus: false,
            error: null,
          }));
        },

        setEligibility: (eligibility) => {
          set((state) => ({
            ...state,
            eligibility,
            isLoadingEligibility: false,
            error: null,
          }));
        },

        setCurrentPhase: (currentPhase) => {
          set((state) => ({
            ...state,
            currentPhase,
            isLoadingPhase: false,
            error: null,
          }));
        },

        setLoading: (isLoading) => {
          set((state) => ({ ...state, isLoading }));
        },

        setLoadingStatus: (isLoadingStatus) => {
          set((state) => ({ ...state, isLoadingStatus }));
        },

        setLoadingEligibility: (isLoadingEligibility) => {
          set((state) => ({ ...state, isLoadingEligibility }));
        },

        setLoadingPhase: (isLoadingPhase) => {
          set((state) => ({ ...state, isLoadingPhase }));
        },

        setError: (error) => {
          set((state) => ({
            ...state,
            error,
            isLoading: false,
            isLoadingStatus: false,
            isLoadingEligibility: false,
            isLoadingPhase: false,
          }));
        },

        clearError: () => {
          set((state) => ({ ...state, error: null }));
        },

        updateLastFetch: () => {
          set((state) => ({ ...state, lastFetch: Date.now() }));
        },

        isCacheValid: () => {
          const { lastFetch, cacheExpiry } = get();
          if (!lastFetch) return false;
          return Date.now() - lastFetch < cacheExpiry;
        },

        clearCache: () => {
          set(() => ({
            ...DEFAULT_STATE,
          }));
        },

        // ============================================
        // ACTIONS ASYNC
        // ============================================

        fetchStatus: async () => {
          const { setLoadingStatus, setStatus, setError, updateLastFetch } = get();
          
          try {
            setLoadingStatus(true);
            const status = await quotaService.getQuotaStatus();
            setStatus(status);
            updateLastFetch();
          } catch (error: any) {
            console.error('Erreur fetch status:', error);
            setError(error?.message || 'Erreur récupération statut');
          } finally {
            setLoadingStatus(false);
          }
        },

        fetchEligibility: async () => {
          const { setLoadingEligibility, setEligibility, setError, updateLastFetch } = get();
          
          try {
            setLoadingEligibility(true);
            const eligibility = await quotaService.checkEligibility();
            setEligibility(eligibility);
            updateLastFetch();
          } catch (error: any) {
            console.error('Erreur fetch eligibility:', error);
            setError(error?.message || 'Erreur vérification éligibilité');
          } finally {
            setLoadingEligibility(false);
          }
        },

        fetchCurrentPhase: async () => {
          const { setLoadingPhase, setCurrentPhase, setError, updateLastFetch } = get();
          
          try {
            setLoadingPhase(true);
            const phase = await quotaService.getCurrentPhase();
            setCurrentPhase(phase);
            updateLastFetch();
          } catch (error: any) {
            console.error('Erreur fetch phase:', error);
            setError(error?.message || 'Erreur récupération phase');
          } finally {
            setLoadingPhase(false);
          }
        },

        refreshAll: async () => {
          const { setLoading, fetchStatus, fetchEligibility, fetchCurrentPhase } = get();
          
          try {
            setLoading(true);
            await Promise.all([
              fetchStatus(),
              fetchEligibility(),
              fetchCurrentPhase(),
            ]);
          } catch (error: any) {
            console.error('Erreur refresh all:', error);
          } finally {
            setLoading(false);
          }
        },

        // ============================================
        // UTILITAIRES MÉTIER
        // ============================================

        canCreateFree: () => {
          const { eligibility, status } = get();
          
          // Priorité à l'éligibilité si disponible
          if (eligibility) {
            return eligibility.can_create_free;
          }
          
          // Fallback sur le statut
          if (status) {
            return status.can_create_free;
          }
          
          return false;
        },

        getStatusMessage: () => {
          const { status } = get();
          
          if (!status) {
            return 'Statut non disponible';
          }
          
          return quotaService.getStatusMessage(status);
        },

        getUrgencyMessage: () => {
          const { status } = get();
          
          if (!status) {
            return null;
          }
          
          return quotaService.getUrgencyMessage(status);
        },

        formatPrice: (price: number) => {
          const { eligibility } = get();
          const currency = eligibility?.currency || 'FCFA';
          return quotaService.formatPrice(price, currency);
        },
      }),
      {
        name: 'senmarket-quota-store',
        partialize: (state) => ({
          status: state.status,
          eligibility: state.eligibility,
          currentPhase: state.currentPhase,
          lastFetch: state.lastFetch,
        }),
        version: 1,
      }
    ),
    {
      name: 'quota-store',
    }
  )
);

// ============================================
// HOOKS SÉLECTEURS
// ============================================

// Hook pour obtenir l'état du quota
export const useQuotaStatus = () => {
  const status = useQuotaStore((state) => state.status);
  const isLoading = useQuotaStore((state) => state.isLoadingStatus);
  const error = useQuotaStore((state) => state.error);
  const fetchStatus = useQuotaStore((state) => state.fetchStatus);
  
  return {
    status,
    isLoading,
    error,
    fetchStatus,
  };
};

// Hook pour l'éligibilité
export const useQuotaEligibility = () => {
  const eligibility = useQuotaStore((state) => state.eligibility);
  const isLoading = useQuotaStore((state) => state.isLoadingEligibility);
  const error = useQuotaStore((state) => state.error);
  const fetchEligibility = useQuotaStore((state) => state.fetchEligibility);
  
  return {
    eligibility,
    isLoading,
    error,
    fetchEligibility,
  };
};

// Hook pour la phase actuelle
export const useCurrentPhaseStore = () => {
  const currentPhase = useQuotaStore((state) => state.currentPhase);
  const isLoading = useQuotaStore((state) => state.isLoadingPhase);
  const error = useQuotaStore((state) => state.error);
  const fetchCurrentPhase = useQuotaStore((state) => state.fetchCurrentPhase);
  
  return {
    currentPhase,
    isLoading,
    error,
    fetchCurrentPhase,
  };
};

// Hook pour les utilitaires
export const useQuotaUtils = () => {
  const canCreateFree = useQuotaStore((state) => state.canCreateFree);
  const getStatusMessage = useQuotaStore((state) => state.getStatusMessage);
  const getUrgencyMessage = useQuotaStore((state) => state.getUrgencyMessage);
  const formatPrice = useQuotaStore((state) => state.formatPrice);
  
  return {
    canCreateFree,
    getStatusMessage,
    getUrgencyMessage,
    formatPrice,
  };
};

// Hook pour les actions
export const useQuotaActions = () => {
  const refreshAll = useQuotaStore((state) => state.refreshAll);
  const clearCache = useQuotaStore((state) => state.clearCache);
  const clearError = useQuotaStore((state) => state.clearError);
  const isCacheValid = useQuotaStore((state) => state.isCacheValid);
  
  return {
    refreshAll,
    clearCache,
    clearError,
    isCacheValid,
  };
};

// ============================================
// HOOK PRINCIPAL COMBINÉ
// ============================================

export const useQuota = () => {
  const state = useQuotaStore();
  
  return {
    // État
    status: state.status,
    eligibility: state.eligibility,
    currentPhase: state.currentPhase,
    
    // Loading
    isLoading: state.isLoading,
    isLoadingStatus: state.isLoadingStatus,
    isLoadingEligibility: state.isLoadingEligibility,
    isLoadingPhase: state.isLoadingPhase,
    
    // Erreur
    error: state.error,
    
    // Utilitaires
    canCreateFree: state.canCreateFree(),
    statusMessage: state.getStatusMessage(),
    urgencyMessage: state.getUrgencyMessage(),
    
    // Actions
    fetchStatus: state.fetchStatus,
    fetchEligibility: state.fetchEligibility,
    fetchCurrentPhase: state.fetchCurrentPhase,
    refreshAll: state.refreshAll,
    clearCache: state.clearCache,
    clearError: state.clearError,
    formatPrice: state.formatPrice,
    
    // Cache
    isCacheValid: state.isCacheValid(),
    lastFetch: state.lastFetch,
  };
};

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default useQuotaStore;