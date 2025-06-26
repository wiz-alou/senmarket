// src/services/quota.service.ts
import { api } from './api';

// Types pour les quotas
export interface QuotaStatus {
  current_phase: string;
  is_launch_active: boolean;
  launch_end_date: string;
  days_until_launch_end: number;
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
    paid_listings: number;
    total_listings: number;
    quota_progress: number;
    is_current_month: boolean;
  }>;
  summary: {
    total_free_used: number;
    total_paid: number;
    total_listings: number;
  };
}

export interface CurrentPhase {
  current_phase: string;
  is_launch_active: boolean;
  launch_end_date: string;
  days_until_launch_end: number;
  credit_system_active: boolean;
  paid_system_active: boolean;
  monthly_free_limit: number;
  standard_price: number;
  currency: string;
  phase_name: string;
  phase_description: string;
  benefits: string[];
}

export interface PricingInfo {
  current_phase: string;
  is_launch_active: boolean;
  days_until_launch_end: number;
  launch_end_date: string;
  standard_price: number;
  premium_boost_price: number;
  featured_color_price: number;
  currency: string;
  pack_5_price: number;
  pack_10_price: number;
  pack_5_discount: number;
  pack_10_discount: number;
  monthly_free_limit: number;
  credit_system_active: boolean;
  phase_message: string;
}

export interface PlatformStats {
  current_phase: string;
  is_launch_active: boolean;
  days_until_launch_end: number;
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

class QuotaService {
  private baseUrl = '/api/v1/quota';

  // Obtenir le statut complet des quotas de l'utilisateur
  async getQuotaStatus(): Promise<QuotaStatus> {
    try {
      const response = await api.get(`${this.baseUrl}/status`);
      return response.data.data;
    } catch (error) {
      console.error('Erreur récupération statut quota:', error);
      throw error;
    }
  }

  // Vérifier l'éligibilité pour créer une annonce
  async checkEligibility(): Promise<EligibilityCheck> {
    try {
      const response = await api.get(`${this.baseUrl}/check`);
      return response.data.data;
    } catch (error) {
      console.error('Erreur vérification éligibilité:', error);
      throw error;
    }
  }

  // Obtenir un résumé simplifié des quotas
  async getQuotaSummary(): Promise<QuotaSummary> {
    try {
      const response = await api.get(`${this.baseUrl}/summary`);
      return response.data.data;
    } catch (error) {
      console.error('Erreur récupération résumé quota:', error);
      throw error;
    }
  }

  // Obtenir l'historique des quotas
  async getQuotaHistory(months: number = 6): Promise<QuotaHistory> {
    try {
      const response = await api.get(`${this.baseUrl}/history`, {
        params: { months }
      });
      return response.data.data;
    } catch (error) {
      console.error('Erreur récupération historique quota:', error);
      throw error;
    }
  }

  // Obtenir la phase actuelle (public, pas besoin d'auth)
  async getCurrentPhase(): Promise<CurrentPhase> {
    try {
      const response = await api.get(`${this.baseUrl}/current-phase`);
      return response.data.data;
    } catch (error) {
      console.error('Erreur récupération phase actuelle:', error);
      throw error;
    }
  }

  // Obtenir les informations de tarification (public)
  async getPricingInfo(): Promise<PricingInfo> {
    try {
      const response = await api.get(`${this.baseUrl}/pricing`);
      return response.data.data;
    } catch (error) {
      console.error('Erreur récupération info tarification:', error);
      throw error;
    }
  }

  // Obtenir les statistiques de la plateforme
  async getPlatformStats(): Promise<PlatformStats> {
    try {
      const response = await api.get(`${this.baseUrl}/platform-stats`);
      return response.data.data;
    } catch (error) {
      console.error('Erreur récupération stats plateforme:', error);
      throw error;
    }
  }

  // Mettre à jour la phase utilisateur (usage interne)
  async updateUserPhase(): Promise<QuotaStatus> {
    try {
      const response = await api.post(`${this.baseUrl}/update-phase`);
      return response.data.data;
    } catch (error) {
      console.error('Erreur mise à jour phase utilisateur:', error);
      throw error;
    }
  }

  // Nettoyer les anciens quotas (admin)
  async cleanupQuotas(): Promise<{ message: string }> {
    try {
      const response = await api.post(`${this.baseUrl}/cleanup`);
      return response.data;
    } catch (error) {
      console.error('Erreur nettoyage quotas:', error);
      throw error;
    }
  }

  // Méthodes utilitaires pour le frontend

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

  // Formater le prix pour l'affichage
  formatPrice(price: number, currency: string = 'XOF'): string {
    return `${Math.round(price).toLocaleString()} ${currency}`;
  }

  // Calculer les jours restants jusqu'à la fin de la phase de lancement
  getDaysUntilLaunchEnd(launchEndDate: string): number {
    const endDate = new Date(launchEndDate);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  // Vérifier si la phase de lancement se termine bientôt (moins de 7 jours)
  isLaunchEndingSoon(status: QuotaStatus): boolean {
    return this.isInLaunchPhase(status) && status.days_until_launch_end <= 7;
  }

  // Obtenir le texte d'urgence pour la fin de phase
  getUrgencyMessage(status: QuotaStatus): string | null {
    if (!this.isInLaunchPhase(status)) {
      return null;
    }
    
    const days = status.days_until_launch_end;
    
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
}

// Instance singleton
export const quotaService = new QuotaService();
export default quotaService;