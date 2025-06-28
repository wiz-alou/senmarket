// internal/domain/repositories/listing_repository.go
package repositories

import (
	"context"
	"senmarket/internal/domain/entities"
	"time"
)

// ListingFilters filtres pour la recherche de listings
type ListingFilters struct {
	CategoryID   *string
	Region       *string
	PriceMin     *float64
	PriceMax     *float64
	Status       *string
	UserID       *string
	Search       *string
	IsPromoted   *bool
	CreatedAfter *time.Time
	CreatedBefore *time.Time
}

// ListingRepository interface pour la gestion des annonces
type ListingRepository interface {
	// Create crée une nouvelle annonce
	Create(ctx context.Context, listing *entities.Listing) error
	
	// GetByID récupère une annonce par son ID
	GetByID(ctx context.Context, id string) (*entities.Listing, error)
	
	// Update met à jour une annonce
	Update(ctx context.Context, listing *entities.Listing) error
	
	// Delete supprime une annonce
	Delete(ctx context.Context, id string) error
	
	// List retourne une liste paginée d'annonces avec filtres
	List(ctx context.Context, filters ListingFilters, offset, limit int) ([]*entities.Listing, error)
	
	// Count retourne le nombre d'annonces correspondant aux filtres
	Count(ctx context.Context, filters ListingFilters) (int64, error)
	
	// GetByUserID retourne les annonces d'un utilisateur
	GetByUserID(ctx context.Context, userID string, offset, limit int) ([]*entities.Listing, error)
	
	// GetByCategoryID retourne les annonces d'une catégorie
	GetByCategoryID(ctx context.Context, categoryID string, offset, limit int) ([]*entities.Listing, error)
	
	// Search effectue une recherche textuelle
	Search(ctx context.Context, query string, filters ListingFilters, offset, limit int) ([]*entities.Listing, error)
	
	// GetPromoted retourne les annonces promues
	GetPromoted(ctx context.Context, limit int) ([]*entities.Listing, error)
	
	// GetRecent retourne les annonces récentes
	GetRecent(ctx context.Context, limit int) ([]*entities.Listing, error)
	
	// GetPopular retourne les annonces populaires (+ de vues/contacts)
	GetPopular(ctx context.Context, limit int) ([]*entities.Listing, error)
	
	// UpdateStatus met à jour le statut d'une annonce
	UpdateStatus(ctx context.Context, id string, status string) error
	
	// IncrementViews incrémente le compteur de vues
	IncrementViews(ctx context.Context, id string) error
	
	// IncrementContacts incrémente le compteur de contacts
	IncrementContacts(ctx context.Context, id string) error
	
	// GetExpired retourne les annonces expirées
	GetExpired(ctx context.Context) ([]*entities.Listing, error)
	
	// ExtendExpiration prolonge la date d'expiration
	ExtendExpiration(ctx context.Context, id string, days int) error
	
	// GetStatsByUser retourne les statistiques d'un utilisateur
	GetStatsByUser(ctx context.Context, userID string) (*entities.UserListingStats, error)
	
	// GetTrendingCategories retourne les catégories tendances
	GetTrendingCategories(ctx context.Context, days int) ([]entities.CategoryTrend, error)
}