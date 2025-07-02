// internal/domain/repositories/listing_repository.go
package repositories

import (
	"context"
	"github.com/google/uuid"
	"senmarket/internal/domain/entities"
)

// ListingFilters - Filtres pour la recherche d'annonces
type ListingFilters struct {
	CategoryID *uuid.UUID
	Region     *string
	MinPrice   *float64
	MaxPrice   *float64
	Status     *string
	UserID     *uuid.UUID
	Search     *string
}

// ListingRepository - Interface pour la persistance des annonces
type ListingRepository interface {
	// CRUD de base
	Create(ctx context.Context, listing *entities.Listing) error
	GetByID(ctx context.Context, id uuid.UUID) (*entities.Listing, error)
	Update(ctx context.Context, listing *entities.Listing) error
	Delete(ctx context.Context, id uuid.UUID) error
	
	// Requêtes avec filtres
	GetFiltered(ctx context.Context, filters ListingFilters, limit, offset int) ([]*entities.Listing, error)
	CountFiltered(ctx context.Context, filters ListingFilters) (int64, error)
	
	// Requêtes métier
	GetUserListings(ctx context.Context, userID uuid.UUID, limit, offset int) ([]*entities.Listing, error)
	GetFeaturedListings(ctx context.Context, limit int) ([]*entities.Listing, error)
	GetExpiredListings(ctx context.Context) ([]*entities.Listing, error)
	IncrementViews(ctx context.Context, id uuid.UUID) error
	
	// Statistiques
	CountByCategory(ctx context.Context, categoryID uuid.UUID) (int64, error)
	CountByUser(ctx context.Context, userID uuid.UUID) (int64, error)
}