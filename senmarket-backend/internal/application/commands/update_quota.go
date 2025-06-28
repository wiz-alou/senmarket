// internal/application/commands/update_quota.go
package commands

import (
	"context"
	"senmarket/internal/domain/entities"
	"senmarket/internal/domain/events"
	"senmarket/internal/domain/repositories"
	"time"
)

// UpdateQuotaCommand commande pour mettre à jour les quotas
type UpdateQuotaCommand struct {
	UserID           string `json:"user_id" validate:"required"`
	FreeListings     *int   `json:"free_listings,omitempty"`
	PaidListings     *int   `json:"paid_listings,omitempty"`
	Reason           string `json:"reason"`
	AdminUserID      string `json:"admin_user_id" validate:"required"`
}

// UpdateQuotaHandler handler pour mettre à jour les quotas
type UpdateQuotaHandler struct {
	userRepo       repositories.UserRepository
	eventPublisher events.EventPublisher
}

// NewUpdateQuotaHandler crée un nouveau handler
func NewUpdateQuotaHandler(
	userRepo repositories.UserRepository,
	eventPublisher events.EventPublisher,
) *UpdateQuotaHandler {
	return &UpdateQuotaHandler{
		userRepo:       userRepo,
		eventPublisher: eventPublisher,
	}
}

// Handle traite la commande de mise à jour de quota
func (h *UpdateQuotaHandler) Handle(ctx context.Context, cmd *UpdateQuotaCommand) (*UpdateQuotaResult, error) {
	// Récupérer l'utilisateur
	user, err := h.userRepo.GetByID(ctx, cmd.UserID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, entities.ErrUserNotFound
	}
	
	// Sauvegarder les anciennes valeurs pour l'événement
	oldFree := user.FreeListingsLeft
	oldPaid := user.PaidListings
	
	// Mettre à jour les quotas
	if cmd.FreeListings != nil {
		user.FreeListingsLeft = *cmd.FreeListings
	}
	if cmd.PaidListings != nil {
		user.PaidListings = *cmd.PaidListings
	}
	
	user.UpdatedAt = time.Now()
	
	// Sauvegarder
	if err := h.userRepo.Update(ctx, user); err != nil {
		return nil, err
	}
	
	// Publier l'événement
	event := events.NewQuotaUpdatedEvent(
		user.ID,
		oldFree,
		user.FreeListingsLeft,
		oldPaid,
		user.PaidListings,
		cmd.Reason,
	)
	if err := h.eventPublisher.Publish(ctx, event); err != nil {
		// Log l'erreur mais ne pas faire échouer la commande
	}
	
	return &UpdateQuotaResult{
		UserID:           user.ID,
		FreeListingsLeft: user.FreeListingsLeft,
		PaidListings:     user.PaidListings,
		UpdatedAt:        user.UpdatedAt,
	}, nil
}

// UpdateQuotaResult résultat de mise à jour de quota
type UpdateQuotaResult struct {
	UserID           string    `json:"user_id"`
	FreeListingsLeft int       `json:"free_listings_left"`
	PaidListings     int       `json:"paid_listings"`
	UpdatedAt        time.Time `json:"updated_at"`
}
