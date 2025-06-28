// internal/application/queries/get_user.go
package queries

import (
	"context"
	"senmarket/internal/application/dto"
	"senmarket/internal/domain/entities"
	"senmarket/internal/domain/repositories"
)

// GetUserQuery requête pour récupérer un utilisateur
type GetUserQuery struct {
	UserID string `json:"user_id" validate:"required"`
}

// GetUserByPhoneQuery requête pour récupérer un utilisateur par téléphone
type GetUserByPhoneQuery struct {
	Phone string `json:"phone" validate:"required"`
}

// GetUserHandler handler pour récupérer un utilisateur
type GetUserHandler struct {
	userRepo repositories.UserRepository
}

// NewGetUserHandler crée un nouveau handler
func NewGetUserHandler(userRepo repositories.UserRepository) *GetUserHandler {
	return &GetUserHandler{
		userRepo: userRepo,
	}
}

// HandleGetUser traite la requête de récupération d'utilisateur par ID
func (h *GetUserHandler) HandleGetUser(ctx context.Context, query *GetUserQuery) (*dto.UserDTO, error) {
	user, err := h.userRepo.GetByID(ctx, query.UserID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, entities.ErrUserNotFound
	}
	
	return dto.NewUserDTO(user), nil
}

// HandleGetUserByPhone traite la requête de récupération d'utilisateur par téléphone
func (h *GetUserHandler) HandleGetUserByPhone(ctx context.Context, query *GetUserByPhoneQuery) (*dto.UserDTO, error) {
	user, err := h.userRepo.GetByPhone(ctx, query.Phone)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, entities.ErrUserNotFound
	}
	
	return dto.NewUserDTO(user), nil
}
