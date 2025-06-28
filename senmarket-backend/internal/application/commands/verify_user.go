// internal/application/commands/verify_user.go
package commands

import (
	"context"
	"senmarket/internal/domain/entities"
	"senmarket/internal/domain/events"
	"senmarket/internal/domain/repositories"
	"time"
)

// VerifyUserCommand commande pour vérifier un utilisateur
type VerifyUserCommand struct {
	UserID           string `json:"user_id" validate:"required"`
	VerificationCode string `json:"verification_code" validate:"required"`
	Method           string `json:"method" validate:"required"` // sms, email
}

// VerifyUserHandler handler pour vérifier un utilisateur
type VerifyUserHandler struct {
	userRepo       repositories.UserRepository
	eventPublisher events.EventPublisher
}

// NewVerifyUserHandler crée un nouveau handler
func NewVerifyUserHandler(
	userRepo repositories.UserRepository,
	eventPublisher events.EventPublisher,
) *VerifyUserHandler {
	return &VerifyUserHandler{
		userRepo:       userRepo,
		eventPublisher: eventPublisher,
	}
}

// Handle traite la commande de vérification d'utilisateur
func (h *VerifyUserHandler) Handle(ctx context.Context, cmd *VerifyUserCommand) (*VerifyUserResult, error) {
	// Récupérer l'utilisateur
	user, err := h.userRepo.GetByID(ctx, cmd.UserID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, entities.ErrUserNotFound
	}
	
	// TODO: Vérifier le code de vérification avec le service SMS/Email
	// Pour l'instant, on simule une vérification réussie
	
	// Marquer comme vérifié
	user.Verify()
	
	// Sauvegarder
	if err := h.userRepo.Update(ctx, user); err != nil {
		return nil, err
	}
	
	// Publier l'événement
	event := events.NewUserVerifiedEvent(
		user.ID,
		user.GetPhoneNumber(),
		user.GetRegionName(),
		cmd.Method,
	)
	if err := h.eventPublisher.Publish(ctx, event); err != nil {
		// Log l'erreur mais ne pas faire échouer la commande
	}
	
	return &VerifyUserResult{
		UserID:     user.ID,
		IsVerified: user.IsVerified,
		VerifiedAt: user.VerifiedAt,
	}, nil
}

// VerifyUserResult résultat de vérification d'utilisateur
type VerifyUserResult struct {
	UserID     string     `json:"user_id"`
	IsVerified bool       `json:"is_verified"`
	VerifiedAt *time.Time `json:"verified_at,omitempty"`
}