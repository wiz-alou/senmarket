// internal/application/commands/create_user.go
package commands

import (
	"context"
	"senmarket/internal/domain/entities"
	"senmarket/internal/domain/events"
	"senmarket/internal/domain/repositories"
	"time"
)

// CreateUserCommand commande pour créer un utilisateur
type CreateUserCommand struct {
	Phone  string `json:"phone" validate:"required"`
	Region string `json:"region" validate:"required"`
	Email  string `json:"email,omitempty"`
}

// CreateUserHandler handler pour créer un utilisateur
type CreateUserHandler struct {
	userRepo      repositories.UserRepository
	eventPublisher events.EventPublisher
}

// NewCreateUserHandler crée un nouveau handler
func NewCreateUserHandler(userRepo repositories.UserRepository, eventPublisher events.EventPublisher) *CreateUserHandler {
	return &CreateUserHandler{
		userRepo:      userRepo,
		eventPublisher: eventPublisher,
	}
}

// Handle traite la commande de création d'utilisateur
func (h *CreateUserHandler) Handle(ctx context.Context, cmd *CreateUserCommand) (*CreateUserResult, error) {
	// Vérifier si l'utilisateur existe déjà
	exists, err := h.userRepo.ExistsByPhone(ctx, cmd.Phone)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, entities.ErrUserAlreadyExists
	}
	
	// Créer l'utilisateur
	user, err := entities.NewUser(cmd.Phone, cmd.Region)
	if err != nil {
		return nil, err
	}
	
	// Ajouter l'email si fourni
	if cmd.Email != "" {
		if err := user.SetEmail(cmd.Email); err != nil {
			return nil, err
		}
	}
	
	// Sauvegarder en base
	if err := h.userRepo.Create(ctx, user); err != nil {
		return nil, err
	}
	
	// Publier l'événement
	event := events.NewUserCreatedEvent(user.ID, user.GetPhoneNumber(), user.GetRegionName(), user.FreeListingsLeft)
	if err := h.eventPublisher.Publish(ctx, event); err != nil {
		// Log l'erreur mais ne pas faire échouer la commande
		// TODO: Implement proper logging
	}
	
	return &CreateUserResult{
		UserID:    user.ID,
		Phone:     user.GetPhoneNumber(),
		Region:    user.GetRegionName(),
		Email:     user.GetEmailAddress(),
		CreatedAt: user.CreatedAt,
	}, nil
}

// CreateUserResult résultat de création d'utilisateur
type CreateUserResult struct {
	UserID    string    `json:"user_id"`
	Phone     string    `json:"phone"`
	Region    string    `json:"region"`
	Email     string    `json:"email,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}