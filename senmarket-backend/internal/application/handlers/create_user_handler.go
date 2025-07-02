// internal/application/handlers/create_user_handler.go
package handlers

import (
	"context"
	"time"
	
	"senmarket/internal/application/commands"
	"senmarket/internal/application/dto"
	"senmarket/internal/application/services"
	"senmarket/internal/domain/entities"
	"senmarket/internal/domain/valueobjects"
)

// CreateUserHandler - Handler pour créer un utilisateur
type CreateUserHandler struct {
	services.BaseService
}

// NewCreateUserHandler - Constructeur
func NewCreateUserHandler() *CreateUserHandler {
	return &CreateUserHandler{}
}

// Handle - Traite la commande CreateUser
func (h *CreateUserHandler) Handle(ctx context.Context, cmd commands.CreateUserCommand) (*dto.UserDTO, error) {
	// 1. Valider la commande
	if err := h.ValidateCommand(ctx, &cmd); err != nil {
		h.LogError(ctx, "CreateUser.Validate", err)
		return nil, err
	}
	
	// 2. Créer l'entité User avec les champs de base
	now := time.Now()
	user := &entities.User{
		ID:                 entities.NewUUID(),
		Phone:              cmd.Phone,
		FirstName:          cmd.FirstName,
		LastName:           cmd.LastName,
		PasswordHash:       cmd.PasswordHash,
		Region:             cmd.Region,
		IsVerified:         false,
		IsActive:           true,
		IsPremium:          false,
		FreeListingsUsed:   0,
		FreeListingsLimit:  3,
		TotalListingsCount: 0,
		OnboardingPhase:    valueobjects.OnboardingPhaseFree, // Phase gratuite par défaut
		RegistrationPhase:  valueobjects.RegistrationPhaseLaunch,
		LastFreeReset:      now,
		CreatedAt:          now,
		UpdatedAt:          now,
	}
	
	// 3. Définir l'email si fourni
	if cmd.Email != "" {
		user.Email = &cmd.Email
	}
	
	// 4. Log de réussite
	h.LogInfo(ctx, "CreateUser", "Utilisateur créé avec succès")
	
	// 5. Convertir en DTO et retourner
	return dto.UserDTOFromEntity(user), nil
}
