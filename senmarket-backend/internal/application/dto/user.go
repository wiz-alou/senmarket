// internal/application/dto/user.go
package dto

import (
	"time"
	"github.com/google/uuid"
	"senmarket/internal/domain/entities"
)

// UserDTO - DTO pour les réponses utilisateur
type UserDTO struct {
	ID              uuid.UUID `json:"id"`
	Phone           string    `json:"phone"`
	Email           string    `json:"email,omitempty"`
	FirstName       string    `json:"first_name"`
	LastName        string    `json:"last_name"`
	Region          string    `json:"region"`
	IsVerified      bool      `json:"is_verified"`
	OnboardingPhase string    `json:"onboarding_phase"`
	CreatedAt       time.Time `json:"created_at"`
}

// UserDTOFromEntity - Convertit une entité User en DTO
func UserDTOFromEntity(user *entities.User) *UserDTO {
	dto := &UserDTO{
		ID:              user.ID,
		Phone:           user.Phone,        // string direct
		FirstName:       user.FirstName,
		LastName:        user.LastName,
		Region:          user.Region,       // string direct
		IsVerified:      user.IsVerified,
		OnboardingPhase: user.OnboardingPhase.String(), // value object
		CreatedAt:       user.CreatedAt,
	}
	
	if user.Email != nil {
		dto.Email = *user.Email
	}
	
	return dto
}
