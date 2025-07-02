// internal/infrastructure/persistence/postgres/listing_repository.go
package postgres

import (
	"context"
	"errors"
	"fmt"
	"time"
	
	"github.com/google/uuid"
	"gorm.io/gorm"
	
	"senmarket/internal/domain/entities"
	"senmarket/internal/domain/repositories"
	"senmarket/internal/models" // ⭐ Utilise tes modèles GORM existants
)

// PostgreSQLListingRepository - Implémentation PostgreSQL du ListingRepository
type PostgreSQLListingRepository struct {
	db *gorm.DB
}

// NewPostgreSQLListingRepository - Constructeur
func NewPostgreSQLListingRepository(db *gorm.DB) repositories.ListingRepository {
	return &PostgreSQLListingRepository{db: db}
}

// Create - Créer une annonce
func (r *PostgreSQLListingRepository) Create(ctx context.Context, listing *entities.Listing) error {
	// Convertir l'entité Domain vers modèle GORM existant
	gormListing := r.entityToGORM(listing)
	
	// Utiliser GORM pour persister (ton code existant)
	return r.db.WithContext(ctx).Create(gormListing).Error
}

// GetByID - Récupérer une annonce par ID
func (r *PostgreSQLListingRepository) GetByID(ctx context.Context, id uuid.UUID) (*entities.Listing, error) {
	var gormListing models.Listing
	
	err := r.db.WithContext(ctx).First(&gormListing, "id = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("annonce non trouvée avec ID: %s", id.String())
		}
		return nil, err
	}
	
	// Convertir modèle GORM vers entité Domain
	return r.gormToEntity(&gormListing), nil
}

// Update - Mettre à jour une annonce
func (r *PostgreSQLListingRepository) Update(ctx context.Context, listing *entities.Listing) error {
	gormListing := r.entityToGORM(listing)
	gormListing.UpdatedAt = time.Now()
	
	return r.db.WithContext(ctx).Save(gormListing).Error
}

// Delete - Supprimer une annonce (soft delete)
func (r *PostgreSQLListingRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&models.Listing{}, "id = ?", id).Error
}

// GetFiltered - Récupérer des annonces avec filtres
func (r *PostgreSQLListingRepository) GetFiltered(ctx context.Context, filters repositories.ListingFilters, limit, offset int) ([]*entities.Listing, error) {
	query := r.db.WithContext(ctx).Where("deleted_at IS NULL")
	
	// Appliquer les filtres (ton code existant)
	if filters.CategoryID != nil {
		query = query.Where("category_id = ?", *filters.CategoryID)
	}
	if filters.Region != nil {
		query = query.Where("region = ?", *filters.Region)
	}
	if filters.MinPrice != nil {
		query = query.Where("price >= ?", *filters.MinPrice)
	}
	if filters.MaxPrice != nil {
		query = query.Where("price <= ?", *filters.MaxPrice)
	}
	if filters.Status != nil {
		query = query.Where("status = ?", *filters.Status)
	}
	if filters.UserID != nil {
		query = query.Where("user_id = ?", *filters.UserID)
	}
	if filters.Search != nil {
		query = query.Where("title ILIKE ? OR description ILIKE ?", "%"+*filters.Search+"%", "%"+*filters.Search+"%")
	}
	
	var gormListings []models.Listing
	err := query.Order("created_at DESC").Limit(limit).Offset(offset).Find(&gormListings).Error
	if err != nil {
		return nil, err
	}
	
	// Convertir tous les modèles GORM en entités Domain
	listings := make([]*entities.Listing, len(gormListings))
	for i, gormListing := range gormListings {
		listings[i] = r.gormToEntity(&gormListing)
	}
	
	return listings, nil
}

// CountFiltered - Compter les annonces avec filtres
func (r *PostgreSQLListingRepository) CountFiltered(ctx context.Context, filters repositories.ListingFilters) (int64, error) {
	query := r.db.WithContext(ctx).Model(&models.Listing{}).Where("deleted_at IS NULL")
	
	// Appliquer les mêmes filtres que GetFiltered
	if filters.CategoryID != nil {
		query = query.Where("category_id = ?", *filters.CategoryID)
	}
	if filters.Region != nil {
		query = query.Where("region = ?", *filters.Region)
	}
	if filters.MinPrice != nil {
		query = query.Where("price >= ?", *filters.MinPrice)
	}
	if filters.MaxPrice != nil {
		query = query.Where("price <= ?", *filters.MaxPrice)
	}
	if filters.Status != nil {
		query = query.Where("status = ?", *filters.Status)
	}
	if filters.UserID != nil {
		query = query.Where("user_id = ?", *filters.UserID)
	}
	if filters.Search != nil {
		query = query.Where("title ILIKE ? OR description ILIKE ?", "%"+*filters.Search+"%", "%"+*filters.Search+"%")
	}
	
	var count int64
	err := query.Count(&count).Error
	return count, err
}

// GetUserListings - Récupérer les annonces d'un utilisateur
func (r *PostgreSQLListingRepository) GetUserListings(ctx context.Context, userID uuid.UUID, limit, offset int) ([]*entities.Listing, error) {
	var gormListings []models.Listing
	
	err := r.db.WithContext(ctx).
		Where("user_id = ? AND deleted_at IS NULL", userID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&gormListings).Error
		
	if err != nil {
		return nil, err
	}
	
	listings := make([]*entities.Listing, len(gormListings))
	for i, gormListing := range gormListings {
		listings[i] = r.gormToEntity(&gormListing)
	}
	
	return listings, nil
}

// GetFeaturedListings - Récupérer les annonces featured
func (r *PostgreSQLListingRepository) GetFeaturedListings(ctx context.Context, limit int) ([]*entities.Listing, error) {
	var gormListings []models.Listing
	
	err := r.db.WithContext(ctx).
		Where("is_featured = ? AND status = ? AND deleted_at IS NULL", true, "active").
		Order("created_at DESC").
		Limit(limit).
		Find(&gormListings).Error
		
	if err != nil {
		return nil, err
	}
	
	listings := make([]*entities.Listing, len(gormListings))
	for i, gormListing := range gormListings {
		listings[i] = r.gormToEntity(&gormListing)
	}
	
	return listings, nil
}

// GetExpiredListings - Récupérer les annonces expirées
func (r *PostgreSQLListingRepository) GetExpiredListings(ctx context.Context) ([]*entities.Listing, error) {
	var gormListings []models.Listing
	
	now := time.Now()
	err := r.db.WithContext(ctx).
		Where("expires_at < ? AND status != ? AND deleted_at IS NULL", now, "expired").
		Find(&gormListings).Error
		
	if err != nil {
		return nil, err
	}
	
	listings := make([]*entities.Listing, len(gormListings))
	for i, gormListing := range gormListings {
		listings[i] = r.gormToEntity(&gormListing)
	}
	
	return listings, nil
}

// IncrementViews - Incrémenter le nombre de vues
func (r *PostgreSQLListingRepository) IncrementViews(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).
		Model(&models.Listing{}).
		Where("id = ?", id).
		UpdateColumn("views_count", gorm.Expr("views_count + 1")).Error
}

// CountByCategory - Compter les annonces par catégorie
func (r *PostgreSQLListingRepository) CountByCategory(ctx context.Context, categoryID uuid.UUID) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&models.Listing{}).
		Where("category_id = ? AND deleted_at IS NULL", categoryID).
		Count(&count).Error
	return count, err
}

// CountByUser - Compter les annonces d'un utilisateur
func (r *PostgreSQLListingRepository) CountByUser(ctx context.Context, userID uuid.UUID) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&models.Listing{}).
		Where("user_id = ? AND deleted_at IS NULL", userID).
		Count(&count).Error
	return count, err
}

// ==============================================
// HELPERS - CONVERSION GORM ↔ DOMAIN ENTITY
// ==============================================

// entityToGORM - Convertit une entité Domain en modèle GORM
func (r *PostgreSQLListingRepository) entityToGORM(listing *entities.Listing) *models.Listing {
	// ✅ GÉRER ExpiresAt - conversion time.Time → *time.Time
	var expiresAt *time.Time
	if !listing.ExpiresAt.IsZero() {
		expiresAt = &listing.ExpiresAt
	}
	
	// ✅ GÉRER DeletedAt - conversion *time.Time → gorm.DeletedAt
	var deletedAt gorm.DeletedAt
	if listing.DeletedAt != nil {
		deletedAt = gorm.DeletedAt{Time: *listing.DeletedAt, Valid: true}
	}
	
	return &models.Listing{
		ID:          listing.ID,
		UserID:      listing.UserID,
		CategoryID:  listing.CategoryID,
		Title:       listing.Title,
		Description: listing.Description,
		Price:       listing.Price,    // float64 direct
		Currency:    listing.Currency, // string direct
		Region:      listing.Region,   // string direct
		Status:      listing.Status,   // string direct
		ViewsCount:  listing.ViewsCount,
		IsFeatured:  listing.IsFeatured,
		Images:      listing.Images,   // []string direct (pq.StringArray compatible)
		ExpiresAt:   expiresAt,        // ✅ CORRIGÉ: time.Time → *time.Time
		CreatedAt:   listing.CreatedAt,
		UpdatedAt:   listing.UpdatedAt,
		DeletedAt:   deletedAt,        // ✅ CORRIGÉ: *time.Time → gorm.DeletedAt
	}
}

// gormToEntity - Convertit un modèle GORM en entité Domain
func (r *PostgreSQLListingRepository) gormToEntity(gormListing *models.Listing) *entities.Listing {
	// ✅ GÉRER ExpiresAt - conversion *time.Time → time.Time
	var expiresAt time.Time
	if gormListing.ExpiresAt != nil {
		expiresAt = *gormListing.ExpiresAt
	}
	
	// ✅ GÉRER DeletedAt - conversion gorm.DeletedAt → *time.Time
	var deletedAt *time.Time
	if gormListing.DeletedAt.Valid {
		deletedAt = &gormListing.DeletedAt.Time
	}
	
	return &entities.Listing{
		ID:          gormListing.ID,
		UserID:      gormListing.UserID,
		CategoryID:  gormListing.CategoryID,
		Title:       gormListing.Title,
		Description: gormListing.Description,
		Price:       gormListing.Price,    // float64 direct
		Currency:    gormListing.Currency, // string direct
		Region:      gormListing.Region,   // string direct
		Status:      gormListing.Status,   // string direct
		ViewsCount:  gormListing.ViewsCount,
		IsFeatured:  gormListing.IsFeatured,
		Images:      gormListing.Images,   // []string direct
		ExpiresAt:   expiresAt,            // ✅ CORRIGÉ: *time.Time → time.Time
		CreatedAt:   gormListing.CreatedAt,
		UpdatedAt:   gormListing.UpdatedAt,
		DeletedAt:   deletedAt,            // ✅ CORRIGÉ: gorm.DeletedAt → *time.Time
	}
}
