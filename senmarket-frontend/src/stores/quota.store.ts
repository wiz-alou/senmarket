// src/stores/quota.store.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import quotaService, {
  QuotaStatus,
  EligibilityCheck,
  CurrentPhase,
  PricingInfo,
} from '@/services/quota.service';

// Types pour le store
interface QuotaState {
  // Données de quota
  quotaStatus: QuotaStatus | null;
  eligibility: EligibilityCheck | null;
  currentPhase: CurrentPhase | null;
  pricingInfo: PricingInfo | null;
  
  // États de chargement
  isLoading: boolean;
  isLoadingEligibility: boolean;
  isLoadingPhase: boolean;
  
  // Cache et timestamps
  lastFetched: number | null;
  eligibilityLastFetched: number | null;
  phaseLastFetched: number | null;
  
  // États UI
  showUrgencyBanner: boolean;
  bannerDismissed: boolean;
  lastBannerCheck: number | null;
  
  // Préférences utilisateur
  preferences: {
    showQuotaInHeader: boolean;
    notifyQuotaLow: boolean;
    notifyPhaseChange: boolean;
    autoRefreshInterval: number; // en millisecondes
  };
  
  // Erreurs
  error: string | null;
  
  // Actions principales
  fetchQuotaStatus: () => Promise<void>;
  fetchEligibility: () => Promise<void>;
  fetchCurrentPhase: () => Promise<void>;
  fetchPricingInfo: () => Promise<void>;
  
  // Actions composées
  initializeQuotaData: () => Promise<void>;
  refreshAllData: () => Promise<void>;
  
  // Actions UI
  dismissBanner: () => void;
  setShowUrgencyBanner: (show: boolean) => void;
  updatePreferences: (prefs: Partial<QuotaState['preferences']>) => void;
  
  // Actions utilitaires
  clearError: () => void;
  resetStore: () => void;
  
  // Getters calculés
  canCreateFree: () => boolean;
  isInLaunchPhase: () => boolean;
  getStatusColor: () => 'green' | 'yellow' | 'red' | 'gray';
  getStatusMessage: () => string;
  getUrgencyMessage: () => string | null;
  shouldShowBanner: () => boolean;
  getQuotaUsagePercent: () => number;
  getDaysUntilLaunchEnd: () => number;
  
  // Cache helpers
  isQuotaStatusStale: () => boolean;
  isEligibilityStale: () => boolean;
  isPhaseStale: () => boolean;
}

// Configuration par défaut
const defaultPreferences: QuotaState['preferences'] = {
  showQuotaInHeader: true,
  notifyQuotaLow: true,
  notifyPhaseChange: true,
  autoRefreshInterval: 60000, // 1 minute
};

// Durées de cache (en millisecondes)
const CACHE_DURATIONS = {
  quotaStatus: 30 * 1000, // 30 secondes
  eligibility: 15 * 1000,  // 15 secondes
  currentPhase: 60 * 1000, // 1 minute
  pricingInfo: 5 * 60 * 1000, // 5 minutes
};

export const useQuotaStore = create<QuotaState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // État initial
        quotaStatus: null,
        eligibility: null,
        currentPhase: null,
        pricingInfo: null,
        
        isLoading: false,
        isLoadingEligibility: false,
        isLoadingPhase: false,
        
        lastFetched: null,
        eligibilityLastFetched: null,
        phaseLastFetched: null,
        
        showUrgencyBanner: false,
        bannerDismissed: false,
        lastBannerCheck: null,
        
        preferences: defaultPreferences,
        error: null,

        // Actions principales
        fetchQuotaStatus: async () => {
          const state = get();
          
          // Vérifier si les données sont encore fraîches
          if (state.lastFetched && 
              Date.now() - state.lastFetched < CACHE_DURATIONS.quotaStatus) {
            return;
          }

          set((draft) => {
            draft.isLoading = true;
            draft.error = null;
          });

          try {
            const quotaStatus = await quotaService.getQuotaStatus();
            
            set((draft) => {
              draft.quotaStatus = quotaStatus;
              draft.lastFetched = Date.now();
              draft.isLoading = false;
              
              // Mettre à jour l'état de la bannière d'urgence
              if (quotaStatus && quotaService.isLaunchEndingSoon(quotaStatus)) {
                draft.showUrgencyBanner = !draft.bannerDismissed;
              }
            });
          } catch (error) {
            set((draft) => {
              draft.error = error instanceof Error ? error.message : 'Erreur inconnue';
              draft.isLoading = false;
            });
          }
        },

        fetchEligibility: async () => {
          const state = get();
          
          if (state.eligibilityLastFetched && 
              Date.now() - state.eligibilityLastFetched < CACHE_DURATIONS.eligibility) {
            return;
          }

          set((draft) => {
            draft.isLoadingEligibility = true;
            draft.error = null;
          });

          try {
            const eligibility = await quotaService.checkEligibility();
            
            set((draft) => {
              draft.eligibility = eligibility;
              draft.eligibilityLastFetched = Date.now();
              draft.isLoadingEligibility = false;
            });
          } catch (error) {
            set((draft) => {
              draft.error = error instanceof Error ? error.message : 'Erreur vérification éligibilité';
              draft.isLoadingEligibility = false;
            });
          }
        },

        fetchCurrentPhase: async () => {
          const state = get();
          
          if (state.phaseLastFetched && 
              Date.now() - state.phaseLastFetched < CACHE_DURATIONS.currentPhase) {
            return;
          }

          set((draft) => {
            draft.isLoadingPhase = true;
            draft.error = null;
          });

          try {
            const currentPhase = await quotaService.getCurrentPhase();
            
            set((draft) => {
              draft.currentPhase = currentPhase;
              draft.phaseLastFetched = Date.now();
              draft.isLoadingPhase = false;
              
              // Notifier le changement de phase si activé
              if (draft.preferences.notifyPhaseChange && 
                  draft.quotaStatus && 
                  draft.quotaStatus.current_phase !== currentPhase.current_phase) {
                // Ici on pourrait déclencher une notification
                console.log('🎯 Changement de phase détecté:', currentPhase.current_phase);
              }
            });
          } catch (error) {
            set((draft) => {
              draft.error = error instanceof Error ? error.message : 'Erreur récupération phase';
              draft.isLoadingPhase = false;
            });
          }
        },

        fetchPricingInfo: async () => {
          try {
            const pricingInfo = await quotaService.getPricingInfo();
            
            set((draft) => {
              draft.pricingInfo = pricingInfo;
            });
          } catch (error) {
            console.error('Erreur récupération prix:', error);
          }
        },

        // Actions composées
        initializeQuotaData: async () => {
          const actions = get();
          
          // Charger les données essentielles en parallèle
          await Promise.allSettled([
            actions.fetchCurrentPhase(),
            actions.fetchQuotaStatus(),
            actions.fetchEligibility(),
            actions.fetchPricingInfo(),
          ]);
        },

        refreshAllData: async () => {
          set((draft) => {
            // Forcer le refresh en réinitialisant les timestamps
            draft.lastFetched = null;
            draft.eligibilityLastFetched = null;
            draft.phaseLastFetched = null;
          });

          await get().initializeQuotaData();
        },

        // Actions UI
        dismissBanner: () => {
          set((draft) => {
            draft.bannerDismissed = true;
            draft.showUrgencyBanner = false;
            draft.lastBannerCheck = Date.now();
          });
        },

        setShowUrgencyBanner: (show: boolean) => {
          set((draft) => {
            draft.showUrgencyBanner = show;
          });
        },

        updatePreferences: (prefs) => {
          set((draft) => {
            draft.preferences = { ...draft.preferences, ...prefs };
          });
        },

        // Actions utilitaires
        clearError: () => {
          set((draft) => {
            draft.error = null;
          });
        },

        resetStore: () => {
          set((draft) => {
            draft.quotaStatus = null;
            draft.eligibility = null;
            draft.currentPhase = null;
            draft.pricingInfo = null;
            draft.lastFetched = null;
            draft.eligibilityLastFetched = null;
            draft.phaseLastFetched = null;
            draft.showUrgencyBanner = false;
            draft.bannerDismissed = false;
            draft.error = null;
          });
        },

        // Getters calculés
        canCreateFree: () => {
          const { quotaStatus } = get();
          return quotaStatus?.can_create_free ?? false;
        },

        isInLaunchPhase: () => {
          const { quotaStatus } = get();
          return quotaStatus ? quotaService.isInLaunchPhase(quotaStatus) : false;
        },

        getStatusColor: () => {
          const { quotaStatus } = get();
          return quotaStatus ? quotaService.getStatusColor(quotaStatus) : 'gray';
        },

        getStatusMessage: () => {
          const { quotaStatus } = get();
          return quotaStatus ? quotaService.getStatusMessage(quotaStatus) : '';
        },

        getUrgencyMessage: () => {
          const { quotaStatus } = get();
          return quotaStatus ? quotaService.getUrgencyMessage(quotaStatus) : null;
        },

        shouldShowBanner: () => {
          const { showUrgencyBanner, bannerDismissed, quotaStatus } = get();
          
          // Ne pas montrer si explicitement fermée
          if (bannerDismissed) return false;
          
          // Montrer si marquée comme visible et conditions remplies
          if (showUrgencyBanner && quotaStatus) {
            return quotaService.isLaunchEndingSoon(quotaStatus);
          }
          
          return false;
        },

        getQuotaUsagePercent: () => {
          const { quotaStatus } = get();
          return quotaStatus ? quotaService.getQuotaUsagePercent(quotaStatus) : 0;
        },

        getDaysUntilLaunchEnd: () => {
          const { currentPhase } = get();
          return currentPhase?.days_until_launch_end ?? 0;
        },

        // Cache helpers
        isQuotaStatusStale: () => {
          const { lastFetched } = get();
          return !lastFetched || Date.now() - lastFetched > CACHE_DURATIONS.quotaStatus;
        },

        isEligibilityStale: () => {
          const { eligibilityLastFetched } = get();
          return !eligibilityLastFetched || Date.now() - eligibilityLastFetched > CACHE_DURATIONS.eligibility;
        },

        isPhaseStale: () => {
          const { phaseLastFetched } = get();
          return !phaseLastFetched || Date.now() - phaseLastFetched > CACHE_DURATIONS.currentPhase;
        },
      })),
      {
        name: 'senmarket-quota-store',
        partialize: (state) => ({
          // Persister seulement les préférences et l'état de la bannière
          preferences: state.preferences,
          bannerDismissed: state.bannerDismissed,
          lastBannerCheck: state.lastBannerCheck,
        }),
      }
    ),
    {
      name: 'quota-store',
    }
  )
);

// Hooks utilitaires pour accéder aux parties spécifiques du store
export const useQuotaData = () => {
  const quotaStatus = useQuotaStore((state) => state.quotaStatus);
  const eligibility = useQuotaStore((state) => state.eligibility);
  const currentPhase = useQuotaStore((state) => state.currentPhase);
  const pricingInfo = useQuotaStore((state) => state.pricingInfo);
  
  return {
    quotaStatus,
    eligibility,
    currentPhase,
    pricingInfo,
  };
};

export const useQuotaActions = () => {
  const fetchQuotaStatus = useQuotaStore((state) => state.fetchQuotaStatus);
  const fetchEligibility = useQuotaStore((state) => state.fetchEligibility);
  const fetchCurrentPhase = useQuotaStore((state) => state.fetchCurrentPhase);
  const initializeQuotaData = useQuotaStore((state) => state.initializeQuotaData);
  const refreshAllData = useQuotaStore((state) => state.refreshAllData);
  
  return {
    fetchQuotaStatus,
    fetchEligibility,
    fetchCurrentPhase,
    initializeQuotaData,
    refreshAllData,
  };
};

export const useQuotaUI = () => {
  const showUrgencyBanner = useQuotaStore((state) => state.showUrgencyBanner);
  const bannerDismissed = useQuotaStore((state) => state.bannerDismissed);
  const shouldShowBanner = useQuotaStore((state) => state.shouldShowBanner);
  const dismissBanner = useQuotaStore((state) => state.dismissBanner);
  const getStatusColor = useQuotaStore((state) => state.getStatusColor);
  const getStatusMessage = useQuotaStore((state) => state.getStatusMessage);
  const getUrgencyMessage = useQuotaStore((state) => state.getUrgencyMessage);
  
  return {
    showUrgencyBanner,
    bannerDismissed,
    shouldShowBanner: shouldShowBanner(),
    dismissBanner,
    statusColor: getStatusColor(),
    statusMessage: getStatusMessage(),
    urgencyMessage: getUrgencyMessage(),
  };
};

export const useQuotaPreferences = () => {
  const preferences = useQuotaStore((state) => state.preferences);
  const updatePreferences = useQuotaStore((state) => state.updatePreferences);
  
  return {
    preferences,
    updatePreferences,
  };
};

// Hook pour l'état de chargement global
export const useQuotaLoading = () => {
  const isLoading = useQuotaStore((state) => state.isLoading);
  const isLoadingEligibility = useQuotaStore((state) => state.isLoadingEligibility);
  const isLoadingPhase = useQuotaStore((state) => state.isLoadingPhase);
  
  return {
    isLoading,
    isLoadingEligibility,
    isLoadingPhase,
    isAnyLoading: isLoading || isLoadingEligibility || isLoadingPhase,
  };
};

export default useQuotaStore;