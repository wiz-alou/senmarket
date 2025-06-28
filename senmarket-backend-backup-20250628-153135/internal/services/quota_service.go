// internal/services/quota_service.go
package services

import (
	"errors"
	"fmt"
	"time"

	"senmarket/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

var (
	ErrNoFreeListingsLeft = errors.New("quota d'annonces gratuites épuisé pour ce mois")
	ErrInvalidUser        = errors.New("utilisateur invalide")
	ErrConfigNotFound     = errors.New("configuration de prix non trouvée")
)

type QuotaService struct {
	db *gorm.DB
}

func NewQuotaService(db *gorm.DB) *QuotaService {
	return &QuotaService{db: db}
}

// GetGlobalConfig récupère la configuration globale de tarification
func (s *QuotaService) GetGlobalConfig() (*models.PricingConfig, error) {
	return models.GetOrCreateGlobalConfig(s.db)
}

// IsLaunchPhaseActive vérifie si la phase de lancement gratuit est active
func (s *QuotaService) IsLaunchPhaseActive() (bool, error) {
	config, err := s.GetGlobalConfig()
	if err != nil {
		return false, err
	}
	
	return config.IsFreeLaunchActive(), nil
}

// GetOrCreateMonthlyQuota récupère ou crée le quota mensuel d'un utilisateur
func (s *QuotaService) GetOrCreateMonthlyQuota(userID uuid.UUID) (*models.ListingQuota, error) {
	now := time.Now()
	month := int(now.Month())
	year := now.Year()
	
	return models.GetOrCreateQuotaForPeriod(s.db, userID, month, year)
}

// CanCreateFreeListing vérifie si l'utilisateur peut créer une annonce gratuite
func (s *QuotaService) CanCreateFreeListing(userID uuid.UUID) (bool, *models.ListingQuota, error) {
	// Vérifier la phase globale d'abord
	isLaunchActive, err := s.IsLaunchPhaseActive()
	if err != nil {
		return false, nil, err
	}
	
	// Phase 1: Lancement gratuit - illimité
	if isLaunchActive {
		return true, nil, nil
	}
	
	// Phase 2+: Système de quotas mensuels
	quota, err := s.GetOrCreateMonthlyQuota(userID)
	if err != nil {
		return false, nil, err
	}
	
	return quota.CanCreateFreeListing(), quota, nil
}

// ConsumeFreeListing consomme une annonce gratuite
func (s *QuotaService) ConsumeFreeListing(userID uuid.UUID) error {
	// Vérifier la phase globale
	isLaunchActive, err := s.IsLaunchPhaseActive()
	if err != nil {
		return err
	}
	
	// Phase 1: Pas de consommation nécessaire (illimité)
	if isLaunchActive {
		return nil
	}
	
	// Phase 2+: Consommer le quota mensuel
	quota, err := s.GetOrCreateMonthlyQuota(userID)
	if err != nil {
		return err
	}
	
	if !quota.CanCreateFreeListing() {
		return ErrNoFreeListingsLeft
	}
	
	return quota.ConsumeFreeListing(s.db)
}

// AddPaidListing ajoute une annonce payée au compteur
func (s *QuotaService) AddPaidListing(userID uuid.UUID) error {
	// Toujours compter les annonces payées, même en phase de lancement
	quota, err := s.GetOrCreateMonthlyQuota(userID)
	if err != nil {
		return err
	}
	
	return quota.AddPaidListing(s.db)
}

// GetUserQuotaStatus retourne le statut détaillé du quota utilisateur
func (s *QuotaService) GetUserQuotaStatus(userID uuid.UUID) (map[string]interface{}, error) {
	config, err := s.GetGlobalConfig()
	if err != nil {
		return nil, err
	}
	
	status := map[string]interface{}{
		"current_phase":        config.GetCurrentPhase(),
		"is_launch_active":     config.IsFreeLaunchActive(),
		"launch_end_date":      config.LaunchPhaseEndDate,
		"days_until_launch_end": config.GetDaysUntilLaunchEnd(),
		"currency":             config.Currency,
		"standard_price":       config.StandardListingPrice,
	}
	
	// Phase 1: Lancement gratuit
	if config.IsFreeLaunchActive() {
		status["unlimited_free"] = true
		status["remaining_free"] = -1 // -1 = illimité
		status["phase_name"] = "Lancement gratuit"
		status["phase_description"] = "Publication illimitée et gratuite"
		status["message"] = config.GetPhaseMessage(-1)
		return status, nil
	}
	
	// Phase 2+: Quotas mensuels
	quota, err := s.GetOrCreateMonthlyQuota(userID)
	if err != nil {
		return nil, err
	}
	
	remaining := quota.RemainingFreeListings()
	
	status["unlimited_free"] = false
	status["monthly_limit"] = quota.FreeListingsLimit
	status["used_this_month"] = quota.FreeListingsUsed
	status["remaining_free"] = remaining
	status["paid_this_month"] = quota.PaidListings
	status["total_this_month"] = quota.FreeListingsUsed + quota.PaidListings
	status["can_create_free"] = quota.CanCreateFreeListing()
	status["quota_progress"] = quota.GetProgress()
	status["reset_date"] = quota.NextResetDate()
	status["days_until_reset"] = quota.DaysUntilReset()
	status["period"] = quota.GetPeriodString()
	
	// Messages adaptés à la phase
	if config.GetCurrentPhase() == "credit_system" {
		status["phase_name"] = "Système de crédits"
		status["phase_description"] = fmt.Sprintf("%d annonces gratuites par mois", quota.FreeListingsLimit)
	} else {
		status["phase_name"] = "Système payant"
		status["phase_description"] = fmt.Sprintf("%.0f FCFA par annonce", config.StandardListingPrice)
	}
	
	status["message"] = config.GetPhaseMessage(remaining)
	
	return status, nil
}

// GetUserQuotaHistory récupère l'historique des quotas d'un utilisateur
func (s *QuotaService) GetUserQuotaHistory(userID uuid.UUID, months int) ([]models.ListingQuota, error) {
	if months <= 0 {
		months = 6 // Par défaut, 6 derniers mois
	}
	
	return models.GetUserQuotaHistory(s.db, userID, months)
}

// CheckListingEligibility vérifie l'éligibilité complète pour créer une annonce
func (s *QuotaService) CheckListingEligibility(userID uuid.UUID) (map[string]interface{}, error) {
	canCreateFree, quota, err := s.CanCreateFreeListing(userID)
	if err != nil {
		return nil, err
	}
	
	config, err := s.GetGlobalConfig()
	if err != nil {
		return nil, err
	}
	
	result := map[string]interface{}{
		"can_create_free":   canCreateFree,
		"requires_payment":  !canCreateFree,
		"current_phase":     config.GetCurrentPhase(),
		"standard_price":    config.StandardListingPrice,
		"currency":          config.Currency,
	}
	
	if !canCreateFree && quota != nil {
		result["reason"] = fmt.Sprintf(
			"Vous avez utilisé vos %d annonces gratuites ce mois-ci", 
			quota.FreeListingsLimit,
		)
		result["quota_reset_date"] = quota.NextResetDate()
		result["days_until_reset"] = quota.DaysUntilReset()
		result["used_this_month"] = quota.FreeListingsUsed
		result["limit_this_month"] = quota.FreeListingsLimit
	}
	
	// Informations sur les options premium (pour phase 3)
	if config.PaidSystemActive {
		result["premium_options"] = map[string]interface{}{
			"boost_price":    config.PremiumBoostPrice,
			"featured_price": config.FeaturedColorPrice,
			"pack_5_price":   config.Pack5ListingsPrice,
			"pack_10_price":  config.Pack10ListingsPrice,
			"pack_5_discount": config.Pack5Discount,
			"pack_10_discount": config.Pack10Discount,
		}
	}
	
	return result, nil
}

// GetPlatformStats retourne des statistiques globales de la plateforme
func (s *QuotaService) GetPlatformStats() (map[string]interface{}, error) {
	config, err := s.GetGlobalConfig()
	if err != nil {
		return nil, err
	}
	
	now := time.Now()
	currentMonth := int(now.Month())
	currentYear := now.Year()
	
	stats := map[string]interface{}{
		"current_phase":        config.GetCurrentPhase(),
		"is_launch_active":     config.IsFreeLaunchActive(),
		"days_until_launch_end": config.GetDaysUntilLaunchEnd(),
		"current_month":        currentMonth,
		"current_year":         currentYear,
	}
	
	// Compter les utilisateurs totaux
	var totalUsers int64
	s.db.Model(&models.User{}).Count(&totalUsers)
	stats["total_users"] = totalUsers
	
	// Compter les annonces totales
	var totalListings int64
	s.db.Model(&models.Listing{}).Count(&totalListings)
	stats["total_listings"] = totalListings
	
	// Compter les annonces actives
	var activeListings int64
	s.db.Model(&models.Listing{}).Where("status = ?", "active").Count(&activeListings)
	stats["active_listings"] = activeListings
	
	// Stats du mois en cours
	var monthlyQuotas []models.ListingQuota
	s.db.Where("month = ? AND year = ?", currentMonth, currentYear).Find(&monthlyQuotas)
	
	var freeListingsThisMonth, paidListingsThisMonth int64
	for _, quota := range monthlyQuotas {
		freeListingsThisMonth += int64(quota.FreeListingsUsed)
		paidListingsThisMonth += int64(quota.PaidListings)
	}
	
	stats["free_listings_this_month"] = freeListingsThisMonth
	stats["paid_listings_this_month"] = paidListingsThisMonth
	stats["total_listings_this_month"] = freeListingsThisMonth + paidListingsThisMonth
	
	// Calcul du revenu estimé (phase 2+)
	var revenueThisMonth float64
	if !config.IsFreeLaunchActive() {
		revenueThisMonth = float64(paidListingsThisMonth) * config.StandardListingPrice
	}
	stats["revenue_this_month"] = revenueThisMonth
	
	// Utilisateurs actifs (avec au moins une annonce ce mois)
	var activeUsers int64
	s.db.Model(&models.ListingQuota{}).
		Where("month = ? AND year = ? AND (free_listings_used > 0 OR paid_listings > 0)", 
			currentMonth, currentYear).
		Count(&activeUsers)
	stats["active_users_this_month"] = activeUsers
	
	return stats, nil
}

// TransitionUserToNextPhase fait passer un utilisateur à la phase suivante
func (s *QuotaService) TransitionUserToNextPhase(userID uuid.UUID) error {
	var user models.User
	if err := s.db.First(&user, userID).Error; err != nil {
		return fmt.Errorf("utilisateur non trouvé: %w", err)
	}
	
	return user.TransitionToNextPhase(s.db)
}

// TransitionGlobalToNextPhase fait passer la plateforme à la phase suivante
func (s *QuotaService) TransitionGlobalToNextPhase(adminUserID uuid.UUID) error {
	config, err := s.GetGlobalConfig()
	if err != nil {
		return err
	}
	
	return config.TransitionToNextPhase(s.db, &adminUserID)
}

// ExtendLaunchPhase prolonge la phase de lancement
func (s *QuotaService) ExtendLaunchPhase(newEndDate time.Time, adminUserID uuid.UUID) error {
	config, err := s.GetGlobalConfig()
	if err != nil {
		return err
	}
	
	return config.ExtendLaunchPhase(s.db, newEndDate, &adminUserID)
}

// UpdateGlobalPrices met à jour les tarifs globaux
func (s *QuotaService) UpdateGlobalPrices(newPrices map[string]float64, adminUserID uuid.UUID) error {
	config, err := s.GetGlobalConfig()
	if err != nil {
		return err
	}
	
	return config.UpdatePrices(s.db, newPrices, &adminUserID)
}

// CleanupOldQuotas nettoie les anciens quotas (à appeler périodiquement)
func (s *QuotaService) CleanupOldQuotas() error {
	return models.CleanupOldQuotas(s.db)
}

// GetQuotaSummaryForUser retourne un résumé simple du quota utilisateur
func (s *QuotaService) GetQuotaSummaryForUser(userID uuid.UUID) (map[string]interface{}, error) {
	status, err := s.GetUserQuotaStatus(userID)
	if err != nil {
		return nil, err
	}
	
	// Version simplifiée pour l'API frontend
	summary := map[string]interface{}{
		"can_create_free":    status["can_create_free"],
		"remaining_free":     status["remaining_free"],
		"unlimited_free":     status["unlimited_free"],
		"requires_payment":   !status["can_create_free"].(bool),
		"message":           status["message"],
		"current_phase":     status["current_phase"],
	}
	
	// Ajouter les infos de prix si nécessaire
	if !status["can_create_free"].(bool) {
		summary["price_per_listing"] = status["standard_price"]
		summary["currency"] = status["currency"]
	}
	
	return summary, nil
}