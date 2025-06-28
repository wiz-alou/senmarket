// internal/domain/repositories/user_repository.go
package repositories

import (
	"context"
	"senmarket/internal/domain/entities"
)

// UserRepository interface pour la gestion des utilisateurs
type UserRepository interface {
	// Create crée un nouvel utilisateur
	Create(ctx context.Context, user *entities.User) error
	
	// GetByID récupère un utilisateur par son ID
	GetByID(ctx context.Context, id string) (*entities.User, error)
	
	// GetByPhone récupère un utilisateur par son téléphone
	GetByPhone(ctx context.Context, phone string) (*entities.User, error)
	
	// GetByEmail récupère un utilisateur par son email
	GetByEmail(ctx context.Context, email string) (*entities.User, error)
	
	// Update met à jour un utilisateur
	Update(ctx context.Context, user *entities.User) error
	
	// Delete supprime un utilisateur
	Delete(ctx context.Context, id string) error
	
	// List retourne une liste paginée d'utilisateurs
	List(ctx context.Context, offset, limit int) ([]*entities.User, error)
	
	// Count retourne le nombre total d'utilisateurs
	Count(ctx context.Context) (int64, error)
	
	// ExistsByPhone vérifie si un utilisateur existe avec ce téléphone
	ExistsByPhone(ctx context.Context, phone string) (bool, error)
	
	// ExistsByEmail vérifie si un utilisateur existe avec cet email
	ExistsByEmail(ctx context.Context, email string) (bool, error)
	
	// UpdateQuota met à jour les quotas d'un utilisateur
	UpdateQuota(ctx context.Context, userID string, freeListings int, paidListings int) error
	
	// GetActiveUsers retourne les utilisateurs actifs
	GetActiveUsers(ctx context.Context) ([]*entities.User, error)
}
