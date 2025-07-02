// internal/domain/repositories/quota_repository.go
package repositories

import (
	"context"
	"github.com/google/uuid"
	"senmarket/internal/domain/entities"
	"senmarket/internal/domain/valueobjects"
)

// QuotaRepository - Interface pour la persistance des quotas
type QuotaRepository interface {
	// CRUD de base
	Create(ctx context.Context, quota *entities.ListingQuota) error
	GetByID(ctx context.Context, id uuid.UUID) (*entities.ListingQuota, error)
	Update(ctx context.Context, quota *entities.ListingQuota) error
	
	// Requêtes métier
	GetOrCreateForPeriod(ctx context.Context, userID uuid.UUID, period valueobjects.Period) (*entities.ListingQuota, error)
	GetUserQuotas(ctx context.Context, userID uuid.UUID, limit int) ([]*entities.ListingQuota, error)
	GetQuotasForPeriod(ctx context.Context, period valueobjects.Period) ([]*entities.ListingQuota, error)
	
	// Nettoyage
	DeleteOldQuotas(ctx context.Context, beforePeriod valueobjects.Period) (int64, error)
	
	// Statistiques
	GetPeriodStats(ctx context.Context, period valueobjects.Period) (*QuotaStats, error)
}

// QuotaStats - Statistiques des quotas pour une période
type QuotaStats struct {
	Period               valueobjects.Period `json:"period"`
	TotalUsers           int64               `json:"total_users"`
	TotalFreeUsed        int64               `json:"total_free_used"`
	TotalPaidListings    int64               `json:"total_paid_listings"`
	UsersAtLimit         int64               `json:"users_at_limit"`
	UtilizationRate      float64             `json:"utilization_rate"`
}

