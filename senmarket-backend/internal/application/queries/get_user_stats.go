// internal/application/queries/get_user_stats.go
package queries

import (
	"context"
	"senmarket/internal/application/dto"
	"senmarket/internal/domain/entities"
	"senmarket/internal/domain/repositories"
)

// 🔧 SUPPRIMÉ GetUserStatsQuery (déjà défini dans get_user.go)
// 🔧 AJOUTÉ: Query spécifique pour quotas
type GetUserQuotaQuery struct {
	UserID string `json:"user_id" validate:"required"`
}

// GetUserStatsHandler handler pour les statistiques utilisateur
type GetUserStatsHandler struct {
	userRepo    repositories.UserRepository
	listingRepo repositories.ListingRepository
	// TODO: quotaService sera ajouté plus tard
}

// NewGetUserStatsHandler crée un nouveau handler
func NewGetUserStatsHandler(
	userRepo repositories.UserRepository,
	listingRepo repositories.ListingRepository,
) *GetUserStatsHandler {
	return &GetUserStatsHandler{
		userRepo:    userRepo,
		listingRepo: listingRepo,
	}
}

// HandleGetUserStats traite la requête de statistiques utilisateur
func (h *GetUserStatsHandler) HandleGetUserStats(ctx context.Context, query *GetUserStatsQuery) (*dto.UserStatsDTO, error) {
	// Vérifier que l'utilisateur existe
	user, err := h.userRepo.GetByID(ctx, query.UserID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, entities.ErrUserNotFound
	}
	
	// 🔧 TEMPORAIRE: Stats basiques en attendant l'implémentation complète
	stats := &dto.UserStatsDTO{
		UserID:         query.UserID,
		TotalListings:  0,
		ActiveListings: 0,
		TotalViews:     0,
		TotalContacts:  0,
		SuccessRate:    0.0,
	}
	
	return stats, nil
}

// HandleGetUserQuota traite la requête de quota utilisateur
func (h *GetUserStatsHandler) HandleGetUserQuota(ctx context.Context, query *GetUserQuotaQuery) (*dto.QuotaStatusDTO, error) {
	// Vérifier que l'utilisateur existe
	user, err := h.userRepo.GetByID(ctx, query.UserID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, entities.ErrUserNotFound
	}
	
	// 🔧 TEMPORAIRE: Quota basique en attendant l'implémentation complète
	quota := &dto.QuotaStatusDTO{
		UserID:           query.UserID,
		FreeListingsLeft: 5, // Valeur par défaut
		PaidListings:     0,
		TotalListings:    0,
		CanCreateFree:    true,
		IsInLaunchPhase:  true,
	}
	
	return quota, nil
}