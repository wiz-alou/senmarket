// internal/application/queries/get_dashboard.go
package queries

import (
	"context"
	"senmarket/internal/application/dto"
	"senmarket/internal/domain/entities"
	"senmarket/internal/domain/repositories"
	"senmarket/internal/domain/services"
)

// GetDashboardQuery requête pour récupérer le tableau de bord
type GetDashboardQuery struct {
	UserID string `json:"user_id" validate:"required"`
}

// GetAdminDashboardQuery requête pour récupérer le tableau de bord admin
type GetAdminDashboardQuery struct {
	Period string `json:"period"` // today, week, month, year
}

// GetDashboardHandler handler pour le tableau de bord
type GetDashboardHandler struct {
	userRepo        repositories.UserRepository
	listingRepo     repositories.ListingRepository
	paymentRepo     repositories.PaymentRepository
	quotaService    services.QuotaService
	analyticsService services.AnalyticsService
}

// NewGetDashboardHandler crée un nouveau handler
func NewGetDashboardHandler(
	userRepo repositories.UserRepository,
	listingRepo repositories.ListingRepository,
	paymentRepo repositories.PaymentRepository,
	quotaService services.QuotaService,
	analyticsService services.AnalyticsService,
) *GetDashboardHandler {
	return &GetDashboardHandler{
		userRepo:         userRepo,
		listingRepo:      listingRepo,
		paymentRepo:      paymentRepo,
		quotaService:     quotaService,
		analyticsService: analyticsService,
	}
}

// HandleGetDashboard traite la requête de tableau de bord utilisateur
func (h *GetDashboardHandler) HandleGetDashboard(ctx context.Context, query *GetDashboardQuery) (*dto.DashboardDTO, error) {
	// Vérifier que l'utilisateur existe
	user, err := h.userRepo.GetByID(ctx, query.UserID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, entities.ErrUserNotFound
	}
	
	// Récupérer les statistiques utilisateur
	userStats, err := h.analyticsService.GetUserStats(ctx, query.UserID)
	if err != nil {
		return nil, err
	}
	
	// Récupérer le statut des quotas
	quotaStatus, err := h.quotaService.GetQuotaStatus(ctx, user)
	if err != nil {
		return nil, err
	}
	
	// Récupérer les annonces récentes de l'utilisateur
	recentListings, err := h.listingRepo.GetByUserID(ctx, query.UserID, 0, 5)
	if err != nil {
		return nil, err
	}
	
	// Récupérer les paiements récents de l'utilisateur
	recentPayments, err := h.paymentRepo.GetByUserID(ctx, query.UserID, 0, 5)
	if err != nil {
		return nil, err
	}
	
	return dto.NewDashboardDTO(user, userStats, quotaStatus, recentListings, recentPayments), nil
}

// HandleGetAdminDashboard traite la requête de tableau de bord admin
func (h *GetDashboardHandler) HandleGetAdminDashboard(ctx context.Context, query *GetAdminDashboardQuery) (*dto.AdminDashboardDTO, error) {
	// TODO: Implémenter le tableau de bord admin
	// Récupérer les statistiques globales de la plateforme
	
	return &dto.AdminDashboardDTO{
		// Placeholder pour l'instant
	}, nil
}