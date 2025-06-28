// internal/domain/services/quota_service.go
package services

import (
	"context"
	"senmarket/internal/domain/entities"
	"senmarket/internal/domain/valueobjects"
)

// QuotaService service métier pour la gestion des quotas
type QuotaService interface {
	// CheckCanCreateListing vérifie si l'utilisateur peut créer une annonce
	CheckCanCreateListing(ctx context.Context, user *entities.User) (bool, string, error)
	
	// ProcessListingCreation traite la création d'une annonce (gratuite ou payante)
	ProcessListingCreation(ctx context.Context, user *entities.User, isPaid bool) error
	
	// GetQuotaStatus retourne le statut des quotas d'un utilisateur
	GetQuotaStatus(ctx context.Context, user *entities.User) (*QuotaStatus, error)
	
	// RefillUserQuota recharge les quotas d'un utilisateur (admin)
	RefillUserQuota(ctx context.Context, userID string, freeListings int) error
	
	// GetGlobalQuotaConfig retourne la configuration globale des quotas
	GetGlobalQuotaConfig(ctx context.Context) (*GlobalQuotaConfig, error)
	
	// UpdateGlobalQuotaConfig met à jour la configuration globale
	UpdateGlobalQuotaConfig(ctx context.Context, config *GlobalQuotaConfig) error
}

// QuotaStatus statut des quotas d'un utilisateur
type QuotaStatus struct {
	UserID              string `json:"user_id"`
	FreeListingsLeft    int    `json:"free_listings_left"`
	PaidListings        int    `json:"paid_listings"`
	TotalListings       int    `json:"total_listings"`
	CanCreateFree       bool   `json:"can_create_free"`
	NextFreeListingCost *valueobjects.Money `json:"next_free_listing_cost,omitempty"`
	IsInLaunchPhase     bool   `json:"is_in_launch_phase"`
}

// GlobalQuotaConfig configuration globale des quotas
type GlobalQuotaConfig struct {
	DefaultFreeListings   int                     `json:"default_free_listings"`
	StandardListingPrice  *valueobjects.Money     `json:"standard_listing_price"`
	IsLaunchPhaseActive   bool                    `json:"is_launch_phase_active"`
	LaunchPhaseEndDate    string                  `json:"launch_phase_end_date"`
	MaxFreeListingsPerUser int                    `json:"max_free_listings_per_user"`
}