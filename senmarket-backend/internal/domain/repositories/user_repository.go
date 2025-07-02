// internal/domain/repositories/user_repository.go
package repositories

import (
	"context"
	"github.com/google/uuid"
	"senmarket/internal/domain/entities"
)

// UserRepository - Interface pour la persistance des utilisateurs
type UserRepository interface {
	// CRUD de base
	Create(ctx context.Context, user *entities.User) error
	GetByID(ctx context.Context, id uuid.UUID) (*entities.User, error)
	GetByPhone(ctx context.Context, phone string) (*entities.User, error)
	GetByEmail(ctx context.Context, email string) (*entities.User, error)
	Update(ctx context.Context, user *entities.User) error
	Delete(ctx context.Context, id uuid.UUID) error
	
	// Requêtes métier
	GetActiveUsers(ctx context.Context, limit, offset int) ([]*entities.User, error)
	GetUsersNeedingQuotaReset(ctx context.Context) ([]*entities.User, error)
	CountByOnboardingPhase(ctx context.Context, phase string) (int64, error)
	
	// Authentification
	ValidateCredentials(ctx context.Context, phone, passwordHash string) (*entities.User, error)
}