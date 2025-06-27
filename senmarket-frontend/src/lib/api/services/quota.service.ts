// src/lib/api/services/quota.service.ts - VERSION CORRIGÉE ALIGNÉE BACKEND
import { apiClient } from '../client';
import { ApiResponse } from '../types';

// ============================================
// TYPES ALIGNÉS AVEC VOTRE BACKEND GO
// ============================================

export interface QuotaStatus {
  current_phase: string;
  is_launch_active: boolean;
  launch_end_date?: string;
  days_until_launch_end?: number;
  currency: string;
  standard_price: number;
  unlimited_free: boolean;
  remaining_free: number;
  monthly_limit?: number;
  used_this_month?: number;
  paid_this_month?: number;
  total_this_month?: number;
  can_create_free: boolean;
  quota_progress?: number;
  reset_date?: string;
  days_until_reset?: number;
  period?: string;
  phase_name: string;
  phase_description: string;
  message: string;
}

export interface EligibilityCheck {
  can_create_free: boolean;
  requires_payment: boolean;
  current_phase: string;
  standard_price: number;
  currency: string;
  reason?: string;
  quota_reset_date?: string;
  days_until_reset?: number;
  used_this_month?: number;
  limit_this_month?: number;
  premium_options?: {
    boost_price: number;
    featured_price: number;
    pack_5_price: number;
    pack_10_price: number;
    pack_5_discount: number;
    pack_10_discount: number;
  };
}

export interface QuotaSummary {
  can_create_free: boolean;
  remaining_free: number;
  unlimited_free: boolean;
  requires_payment: boolean;
  message: string;
  current_phase: string;
  price_per_listing?: number;
  currency?: string;
}

export interface QuotaHistory {
  months_requested: number;
  periods_found: number;
  history: Array<{
    period: string;
    month: number;
    year: number;
    free_used: number;
    free_limit: number;
    free_remaining: number;
    paid_listings: number;
    total_listings: number;
    can_create_free: boolean;
    progress_percent: number;
    is_current_month: boolean;
  }>;
  summary?: {
    total_free_used: number;
    total_paid: number;
    total_listings: number;
  };
}

export interface CurrentPhase {
  current_phase: string;
  is_launch_active: boolean;
  launch_end_date?: string;
  days_until_launch_end?: number;
  credit_system_active: boolean;
  paid_system_active: boolean;
  monthly_free_limit: number;
  standard_price: number;
  currency: string;
  phase_name: string;
  phase_description: string;
  benefits: string[];
}

export interface PlatformStats {
  current_phase: string;
  is_launch_active: boolean;
  days_until_launch_end?: number;
  current_month: number;
  current_year: number;
  total_users: number;
  total_listings: number;
  active_listings: number;
  free_listings_this_month: number;
  paid_listings_this_month: number;
  total_listings_this_month: number;
  revenue_this_month: number;
  active_users_this_month: number;
}

// ============================================
// SERVICE CLASS ALIGNÉ AVEC VOS ENDPOINTS
// ============================================

export class QuotaService {
  
  // ✅ Endpoint exact : /quota/status (QuotaHandler.GetQuotaStatus)
  async getQuotaStatus(): Promise<QuotaStatus> {
    const response = await apiClient.get<ApiResponse<QuotaStatus>>('/quota/status');
    return response.data.data;
  }

  // ✅ Endpoint exact : /quota/check (QuotaHandler.CheckEligibility)
  async checkEligibility(): Promise<EligibilityCheck> {
    const response = await apiClient.get<ApiResponse<EligibilityCheck>>('/quota/check');
    return response.data.data;
  }

  // ✅ Endpoint exact : /quota/summary (QuotaHandler.GetQuotaSummary)
  async getQuotaSummary(): Promise<QuotaSummary> {
    const response = await apiClient.get<ApiResponse<QuotaSummary>>('/quota/summary');
    return response.data.data;
  }

  // ✅ Endpoint exact : /quota/history (QuotaHandler.GetQuotaHistory)
  async getQuotaHistory(months: number = 6): Promise<QuotaHistory> {
    const response = await apiClient.get<ApiResponse<QuotaHistory>>('/quota/history', {
      params: { months }
    });
    return response.data.data;
  }

  // ✅ Endpoint exact : /quota/current-phase (QuotaHandler.GetCurrentPhase)
  async getCurrentPhase(): Promise<CurrentPhase> {
    const response = await apiClient.get<ApiResponse<CurrentPhase>>('/quota/current-phase');
    return response.data.data;
  }

  // ✅ Endpoint exact : /quota/platform-stats (QuotaHandler.GetPlatformStats)  
  async getPlatformStats(): Promise<PlatformStats> {
    const response = await apiClient.get<ApiResponse<PlatformStats>>('/quota/platform-stats');
    return response.data.data;
  }

  // ✅ Endpoint exact : /quota/update-phase (QuotaHandler.UpdateUserPhase)
  async updateUserPhase(): Promise<QuotaStatus> {
    const response = await apiClient.post<ApiResponse<QuotaStatus>>('/quota/update-phase');
    return response.data.data;
  }

  // ============================================
  // MÉTHODES UTILITAIRES POUR LE FRONTEND
  // ============================================

  // Vérifier si l'utilisateur est en phase de lancement gratuit
  isInLaunchPhase(status: QuotaStatus): boolean {
    return status.current_phase === 'launch' && status.is_launch_active;
  }

  // Vérifier si l'utilisateur peut créer une annonce gratuite
  canCreateFree(status: QuotaStatus): boolean {
    return status.can_create_free;
  }

  // Obtenir le message d'état adapté
  getStatusMessage(status: QuotaStatus): string {
    return status.message;
  }

  // Obtenir la couleur du statut pour l'UI
  getStatusColor(status: QuotaStatus): 'green' | 'yellow' | 'red' {
    if (this.isInLaunchPhase(status)) {
      return 'green'; // Phase gratuite
    }
    
    if (status.can_create_free) {
      return 'green'; // Peut encore créer gratuitement
    }
    
    if (status.remaining_free === 0) {
      return 'red'; // Quota épuisé
    }
    
    return 'yellow'; // Quota partiel
  }

  // Calculer le pourcentage d'utilisation du quota
  getQuotaUsagePercent(status: QuotaStatus): number {
    if (status.unlimited_free || !status.monthly_limit) {
      return 0;
    }
    
    return Math.round((status.used_this_month || 0) / status.monthly_limit * 100);
  }

  // Formater le prix pour l'affichage (FCFA au Sénégal)
  formatPrice(price: number, currency: string = 'FCFA'): string {
    return `${Math.round(price).toLocaleString('fr-FR')} ${currency}`;
  }

  // Calculer les jours restants jusqu'à la fin de la phase de lancement
  getDaysUntilLaunchEnd(launchEndDate?: string): number {
    if (!launchEndDate) return 0;
    
    const endDate = new Date(launchEndDate);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  // Vérifier si la phase de lancement se termine bientôt (moins de 7 jours)
  isLaunchEndingSoon(status: QuotaStatus): boolean {
    return this.isInLaunchPhase(status) && (status.days_until_launch_end || 0) <= 7;
  }

  // Obtenir le texte d'urgence pour la fin de phase
  getUrgencyMessage(status: QuotaStatus): string | null {
    if (!this.isInLaunchPhase(status)) {
      return null;
    }
    
    const days = status.days_until_launch_end || 0;
    
    if (days <= 1) {
      return '⚡ Plus que quelques heures pour profiter des annonces gratuites !';
    }
    
    if (days <= 3) {
      return `⚡ Plus que ${days} jours pour profiter des annonces gratuites !`;
    }
    
    if (days <= 7) {
      return `⏰ Plus que ${days} jours pour profiter des annonces gratuites.`;
    }
    
    return null;
  }

  // Obtenir les recommandations d'action pour l'utilisateur
  getActionRecommendations(status: QuotaStatus): Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
    message: string;
  }> {
    const recommendations = [];
    
    // Phase de lancement qui se termine
    if (this.isLaunchEndingSoon(status)) {
      recommendations.push({
        action: 'create_listings_now',
        priority: 'high' as const,
        message: 'Créez vos annonces maintenant pendant que c\'est gratuit !'
      });
    }
    
    // Quota épuisé en phase de crédits
    if (status.current_phase === 'credit_system' && !status.can_create_free) {
      recommendations.push({
        action: 'wait_or_pay',
        priority: 'medium' as const,
        message: `Attendez ${status.days_until_reset} jours ou payez ${this.formatPrice(status.standard_price, status.currency)} pour publier.`
      });
    }
    
    // Quota bientôt épuisé
    if (status.remaining_free <= 1 && status.remaining_free > 0) {
      recommendations.push({
        action: 'use_remaining',
        priority: 'medium' as const,
        message: `Plus qu'${status.remaining_free} annonce gratuite ce mois !`
      });
    }
    
    return recommendations;
  }

  // ✅ NOUVELLES MÉTHODES ALIGNÉES AVEC VOTRE BACKEND

  // Obtenir un résumé rapide pour l'UI (cache-friendly)
  async getQuickStatus(): Promise<{
    canCreateFree: boolean;
    message: string;
    phase: string;
    priceRequired?: number;
  }> {
    try {
      const summary = await this.getQuotaSummary();
      return {
        canCreateFree: summary.can_create_free,
        message: summary.message,
        phase: summary.current_phase,
        priceRequired: summary.requires_payment ? summary.price_per_listing : undefined
      };
    } catch (error) {
      // Fallback en cas d'erreur
      return {
        canCreateFree: false,
        message: 'Impossible de vérifier le statut',
        phase: 'unknown'
      };
    }
  }

  // Vérifier si l'utilisateur est dans une phase payante
  isInPaidPhase(status: QuotaStatus): boolean {
    return status.current_phase === 'paid_system' || 
           (status.current_phase === 'credit_system' && !status.can_create_free);
  }

  // Obtenir le nombre d'annonces restantes avant paiement
  getRemainingFreeListings(status: QuotaStatus): number {
    if (status.unlimited_free) return -1; // Illimité
    return Math.max(0, status.remaining_free);
  }

  // Formatter les informations de quota pour l'affichage
  formatQuotaInfo(status: QuotaStatus): {
    title: string;
    description: string;
    color: 'green' | 'yellow' | 'red';
    icon: string;
  } {
    if (this.isInLaunchPhase(status)) {
      return {
        title: '🎉 Période de lancement',
        description: 'Annonces gratuites illimitées !',
        color: 'green',
        icon: '🚀'
      };
    }

    if (status.can_create_free) {
      const remaining = this.getRemainingFreeListings(status);
      return {
        title: `${remaining} annonce${remaining > 1 ? 's' : ''} gratuite${remaining > 1 ? 's' : ''}`,
        description: `Il vous reste ${remaining} annonce${remaining > 1 ? 's' : ''} gratuite${remaining > 1 ? 's' : ''} ce mois`,
        color: remaining > 1 ? 'green' : 'yellow',
        icon: '✅'
      };
    }

    return {
      title: 'Quota épuisé',
      description: `${this.formatPrice(status.standard_price, status.currency)} par annonce`,
      color: 'red',
      icon: '💳'
    };
  }
}

// ============================================
// INSTANCE SINGLETON
// ============================================
export const quotaService = new QuotaService();
export default quotaService;