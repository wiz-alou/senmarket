// internal/application/dto/user_dto.go
package dto

import (
	"senmarket/internal/domain/entities"
	"senmarket/internal/domain/services"
	"time"
)

// UserDTO DTO pour les utilisateurs
type UserDTO struct {
	ID               string     `json:"id"`
	Phone            string     `json:"phone"`
	Email            string     `json:"email,omitempty"`
	Region           string     `json:"region"`
	IsVerified       bool       `json:"is_verified"`
	IsActive         bool       `json:"is_active"`
	FreeListingsLeft int        `json:"free_listings_left"`
	PaidListings     int        `json:"paid_listings"`
	TotalListings    int        `json:"total_listings"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
	LastLoginAt      *time.Time `json:"last_login_at,omitempty"`
	VerifiedAt       *time.Time `json:"verified_at,omitempty"`
}

// NewUserDTO crée un nouveau UserDTO depuis une entité User
func NewUserDTO(user *entities.User) *UserDTO {
	return &UserDTO{
		ID:               user.ID,
		Phone:            user.GetPhoneNumber(),
		Email:            user.GetEmailAddress(),
		Region:           user.GetRegionName(),
		IsVerified:       user.IsVerified,
		IsActive:         user.IsActive,
		FreeListingsLeft: user.FreeListingsLeft,
		PaidListings:     user.PaidListings,
		TotalListings:    user.TotalListings,
		CreatedAt:        user.CreatedAt,
		UpdatedAt:        user.UpdatedAt,
		LastLoginAt:      user.LastLoginAt,
		VerifiedAt:       user.VerifiedAt,
	}
}

// UserStatsDTO DTO pour les statistiques utilisateur
type UserStatsDTO struct {
	UserID              string  `json:"user_id"`
	TotalListings       int     `json:"total_listings"`
	ActiveListings      int     `json:"active_listings"`
	ExpiredListings     int     `json:"expired_listings"`
	TotalViews          int64   `json:"total_views"`
	TotalContacts       int64   `json:"total_contacts"`
	AverageViewsPerListing int64 `json:"average_views_per_listing"`
	SuccessfulListings  int     `json:"successful_listings"`
	SuccessRate         float64 `json:"success_rate"`
}

// NewUserStatsDTO crée un nouveau UserStatsDTO
func NewUserStatsDTO(user *entities.User, stats *entities.UserListingStats) *UserStatsDTO {
	return &UserStatsDTO{
		UserID:              user.ID,
		TotalListings:       stats.TotalListings,
		ActiveListings:      stats.ActiveListings,
		ExpiredListings:     stats.ExpiredListings,
		TotalViews:          stats.TotalViews,
		TotalContacts:       stats.TotalContacts,
		SuccessfulListings:  stats.TotalListings - stats.ExpiredListings,
		SuccessRate:         stats.SuccessRate,
	}
}

// QuotaStatusDTO DTO pour le statut des quotas
type QuotaStatusDTO struct {
	UserID              string  `json:"user_id"`
	FreeListingsLeft    int     `json:"free_listings_left"`
	PaidListings        int     `json:"paid_listings"`
	TotalListings       int     `json:"total_listings"`
	CanCreateFree       bool    `json:"can_create_free"`
	NextFreeListingCost string  `json:"next_free_listing_cost,omitempty"`
	IsInLaunchPhase     bool    `json:"is_in_launch_phase"`
}

// NewQuotaStatusDTO crée un nouveau QuotaStatusDTO
func NewQuotaStatusDTO(quotaStatus *services.QuotaStatus) *QuotaStatusDTO {
	dto := &QuotaStatusDTO{
		UserID:           quotaStatus.UserID,
		FreeListingsLeft: quotaStatus.FreeListingsLeft,
		PaidListings:     quotaStatus.PaidListings,
		TotalListings:    quotaStatus.TotalListings,
		CanCreateFree:    quotaStatus.CanCreateFree,
		IsInLaunchPhase:  quotaStatus.IsInLaunchPhase,
	}
	
	if quotaStatus.NextFreeListingCost != nil {
		dto.NextFreeListingCost = quotaStatus.NextFreeListingCost.String()
	}
	
	return dto
}
