// internal/domain/repositories/category_repository.go
package repositories

import (
	"context"
	"github.com/google/uuid"
	"senmarket/internal/domain/entities"
)

// CategoryRepository - Interface pour la persistance des catégories
type CategoryRepository interface {
	// CRUD de base
	Create(ctx context.Context, category *entities.Category) error
	GetByID(ctx context.Context, id uuid.UUID) (*entities.Category, error)
	GetBySlug(ctx context.Context, slug string) (*entities.Category, error)
	Update(ctx context.Context, category *entities.Category) error
	Delete(ctx context.Context, id uuid.UUID) error
	
	// Requêtes métier
	GetAll(ctx context.Context) ([]*entities.Category, error)
	GetActive(ctx context.Context) ([]*entities.Category, error)
	GetWithStats(ctx context.Context) ([]*CategoryWithStats, error)
	GetAutoCreated(ctx context.Context) ([]*entities.Category, error)
	
	// Gestion ordre
	UpdateSortOrder(ctx context.Context, id uuid.UUID, sortOrder int) error
}

// CategoryWithStats - Catégorie avec statistiques
type CategoryWithStats struct {
	*entities.Category
	ListingsCount int64 `json:"listings_count"`
}