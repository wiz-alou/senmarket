// internal/application/queries/get_user_stats.go
package queries

import (
	"context"
	"senmarket/internal/application/dto"
	"senmarket/internal/domain/entities"
	"senmarket/internal/domain/repositories"
	"senmarket/internal/domain/services"
)

// GetUserStatsQuery requête pour récupérer les statistiques d'un utilisateur
type GetUserStatsQuery struct {
	UserID string `json:"user_id" validate:"required"`
}

// GetUserQuotaQuery requête pour récupérer les quotas d'un utilisateur
type GetUserQuotaQuery struct {
	UserID string `json:"user_id" validate:"required"`
}

// GetUserStatsHandler handler pour les statistiques utilisateur
type GetUserStatsHandler struct {
	userRepo     repositories.UserRepository
	listingRepo  repositories.ListingRepository
	quotaService services.QuotaService
}

// NewGetUserStatsHandler crée un nouveau handler
func NewGetUserStatsHandler(
	userRepo repositories.UserRepository,
	listingRepo repositories.ListingRepository,
	quotaService services.QuotaService,
) *GetUserStatsHandler {
	return &GetUserStatsHandler{
		userRepo:     userRepo,
		listingRepo:  listingRepo,
		quotaService: quotaService,
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
	
	// Récupérer les statistiques des annonces
	stats, err := h.listingRepo.GetStatsByUser(ctx, query.UserID)
	if err != nil {
		return nil, err
	}
	
	return dto.NewUserStatsDTO(user, stats), nil
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
	
	// Récupérer le statut des quotas
	quotaStatus, err := h.quotaService.GetQuotaStatus(ctx, user)
	if err != nil {
		return nil, err
	}
	
	return dto.NewQuotaStatusDTO(quotaStatus), nil
}