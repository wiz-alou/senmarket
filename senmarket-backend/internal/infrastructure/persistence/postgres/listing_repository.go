// internal/infrastructure/persistence/postgres/listing_repository.go
package postgres

import (
	"context"
	"encoding/json"
	"strings"
	"time"
	"senmarket/internal/domain/entities"
	"senmarket/internal/domain/repositories"
	"senmarket/internal/domain/valueobjects"
	"gorm.io/gorm"
	"github.com/google/uuid"
)

// ListingModel modèle de base de données pour les annonces
type ListingModel struct {
	ID            string     `gorm:"primaryKey;type:varchar(36)"`
	UserID        string     `gorm:"not null;type:varchar(36);index"`
	CategoryID    string     `gorm:"not null;type:varchar(36);index"`
	Title         string     `gorm:"not null;type:varchar(100)"`
	Description   string     `gorm:"type:text"`
	PriceAmount   float64    `gorm:"not null;default:0"`
	PriceCurrency string     `gorm:"not null;default:'XOF';type:varchar(3)"`
	Images        string     `gorm:"type:text"` // JSON array
	Region        string     `gorm:"not null;type:varchar(10);index"`
	Location      string     `gorm:"type:varchar(255)"`
	Status        string     `gorm:"not null;default:'draft';type:varchar(20);index"`
	IsPromoted    bool       `gorm:"default:false;index"`
	IsPaid        bool       `gorm:"default:false"`
	ViewsCount    int64      `gorm:"default:0"`
	ContactsCount int64      `gorm:"default:0"`
	CreatedAt     time.Time  `gorm:"autoCreateTime;index"`
	UpdatedAt     time.Time  `gorm:"autoUpdateTime"`
	ExpiresAt     time.Time  `gorm:"index"`
	PromotedAt    *time.Time
	SoldAt        *time.Time
}

// TableName retourne le nom de la table
func (ListingModel) TableName() string {
	return "listings"
}

// ToEntity convertit le modèle en entité domain
func (l *ListingModel) ToEntity() (*entities.Listing, error) {
	// Créer les value objects
	price, err := valueobjects.NewMoney(l.PriceAmount, l.PriceCurrency)
	if err != nil {
		return nil, err
	}
	
	region, err := valueobjects.NewRegion(l.Region)
	if err != nil {
		return nil, err
	}
	
	// Parser les images JSON
	var images []string
	if l.Images != "" {
		if err := json.Unmarshal([]byte(l.Images), &images); err != nil {
			images = []string{} // Fallback vers array vide
		}
	} else {
		images = []string{}
	}
	
	listing := &entities.Listing{
		ID:            l.ID,
		UserID:        l.UserID,
		CategoryID:    l.CategoryID,
		Title:         l.Title,
		Description:   l.Description,
		Price:         price,
		Images:        images,
		Region:        region,
		Location:      l.Location,
		Status:        entities.ListingStatus(l.Status),
		IsPromoted:    l.IsPromoted,
		IsPaid:        l.IsPaid,
		ViewsCount:    l.ViewsCount,
		ContactsCount: l.ContactsCount,
		CreatedAt:     l.CreatedAt,
		UpdatedAt:     l.UpdatedAt,
		ExpiresAt:     l.ExpiresAt,
		PromotedAt:    l.PromotedAt,
		SoldAt:        l.SoldAt,
	}
	
	return listing, nil
}

// FromEntity convertit une entité en modèle
func (l *ListingModel) FromEntity(listing *entities.Listing) error {
	l.ID = listing.ID
	l.UserID = listing.UserID
	l.CategoryID = listing.CategoryID
	l.Title = listing.Title
	l.Description = listing.Description
	l.PriceAmount = listing.Price.Amount
	l.PriceCurrency = listing.Price.Currency
	l.Region = listing.GetRegionName()
	l.Location = listing.Location
	l.Status = string(listing.Status)
	l.IsPromoted = listing.IsPromoted
	l.IsPaid = listing.IsPaid
	l.ViewsCount = listing.ViewsCount
	l.ContactsCount = listing.ContactsCount
	l.CreatedAt = listing.CreatedAt
	l.UpdatedAt = listing.UpdatedAt
	l.ExpiresAt = listing.ExpiresAt
	l.PromotedAt = listing.PromotedAt
	l.SoldAt = listing.SoldAt
	
	// Convertir les images en JSON
	if len(listing.Images) > 0 {
		imagesJSON, err := json.Marshal(listing.Images)
		if err != nil {
			return err
		}
		l.Images = string(imagesJSON)
	} else {
		l.Images = ""
	}
	
	return nil
}

// ListingRepository implémentation PostgreSQL du repository annonce
type ListingRepository struct {
	*BaseRepository
}

// NewListingRepository crée un nouveau repository annonce
func NewListingRepository(db *gorm.DB) repositories.ListingRepository {
	return &ListingRepository{
		BaseRepository: NewBaseRepository(db),
	}
}

// Create crée une nouvelle annonce
func (r *ListingRepository) Create(ctx context.Context, listing *entities.Listing) error {
	if listing.ID == "" {
		listing.ID = uuid.New().String()
	}
	
	model := &ListingModel{}
	if err := model.FromEntity(listing); err != nil {
		return err
	}
	
	if err := r.db.WithContext(ctx).Create(model).Error; err != nil {
		return err
	}
	
	return nil
}

// GetByID récupère une annonce par son ID
func (r *ListingRepository) GetByID(ctx context.Context, id string) (*entities.Listing, error) {
	var model ListingModel
	if err := r.db.WithContext(ctx).Where("id = ?", id).First(&model).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	
	return model.ToEntity()
}

// Update met à jour une annonce
func (r *ListingRepository) Update(ctx context.Context, listing *entities.Listing) error {
	model := &ListingModel{}
	if err := model.FromEntity(listing); err != nil {
		return err
	}
	
	if err := r.db.WithContext(ctx).Save(model).Error; err != nil {
		return err
	}
	
	return nil
}

// Delete supprime une annonce
func (r *ListingRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&ListingModel{}, "id = ?", id).Error
}

// List retourne une liste paginée d'annonces avec filtres
func (r *ListingRepository) List(ctx context.Context, filters repositories.ListingFilters, offset, limit int) ([]*entities.Listing, error) {
	query := r.db.WithContext(ctx).Model(&ListingModel{})
	
	// Appliquer les filtres
	r.applyFilters(query, filters)
	
	var models []ListingModel
	if err := query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&models).Error; err != nil {
		return nil, err
	}
	
	listings := make([]*entities.Listing, len(models))
	for i, model := range models {
		listing, err := model.ToEntity()
		if err != nil {
			return nil, err
		}
		listings[i] = listing
	}
	
	return listings, nil
}

// Count retourne le nombre d'annonces correspondant aux filtres
func (r *ListingRepository) Count(ctx context.Context, filters repositories.ListingFilters) (int64, error) {
	query := r.db.WithContext(ctx).Model(&ListingModel{})
	r.applyFilters(query, filters)
	
	var count int64
	if err := query.Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

// applyFilters applique les filtres à la requête
func (r *ListingRepository) applyFilters(query *gorm.DB, filters repositories.ListingFilters) {
	if filters.CategoryID != nil {
		query.Where("category_id = ?", *filters.CategoryID)
	}
	if filters.Region != nil {
		query.Where("region = ?", *filters.Region)
	}
	if filters.PriceMin != nil {
		query.Where("price_amount >= ?", *filters.PriceMin)
	}
	if filters.PriceMax != nil {
		query.Where("price_amount <= ?", *filters.PriceMax)
	}
	if filters.Status != nil {
		query.Where("status = ?", *filters.Status)
	}
	if filters.UserID != nil {
		query.Where("user_id = ?", *filters.UserID)
	}
	if filters.IsPromoted != nil {
		query.Where("is_promoted = ?", *filters.IsPromoted)
	}
	if filters.CreatedAfter != nil {
		query.Where("created_at >= ?", *filters.CreatedAfter)
	}
	if filters.CreatedBefore != nil {
		query.Where("created_at <= ?", *filters.CreatedBefore)
	}
}

// GetByUserID retourne les annonces d'un utilisateur
func (r *ListingRepository) GetByUserID(ctx context.Context, userID string, offset, limit int) ([]*entities.Listing, error) {
	filters := repositories.ListingFilters{
		UserID: &userID,
	}
	return r.List(ctx, filters, offset, limit)
}

// GetByCategoryID retourne les annonces d'une catégorie
func (r *ListingRepository) GetByCategoryID(ctx context.Context, categoryID string, offset, limit int) ([]*entities.Listing, error) {
	filters := repositories.ListingFilters{
		CategoryID: &categoryID,
	}
	return r.List(ctx, filters, offset, limit)
}

// Search effectue une recherche textuelle
func (r *ListingRepository) Search(ctx context.Context, query string, filters repositories.ListingFilters, offset, limit int) ([]*entities.Listing, error) {
	dbQuery := r.db.WithContext(ctx).Model(&ListingModel{})
	
	// Recherche textuelle sur titre et description
	searchTerm := "%" + strings.ToLower(query) + "%"
	dbQuery.Where("LOWER(title) LIKE ? OR LOWER(description) LIKE ?", searchTerm, searchTerm)
	
	// Appliquer les autres filtres
	r.applyFilters(dbQuery, filters)
	
	var models []ListingModel
	if err := dbQuery.Offset(offset).Limit(limit).Order("created_at DESC").Find(&models).Error; err != nil {
		return nil, err
	}
	
	listings := make([]*entities.Listing, len(models))
	for i, model := range models {
		listing, err := model.ToEntity()
		if err != nil {
			return nil, err
		}
		listings[i] = listing
	}
	
	return listings, nil
}

// GetPromoted retourne les annonces promues
func (r *ListingRepository) GetPromoted(ctx context.Context, limit int) ([]*entities.Listing, error) {
	var models []ListingModel
	if err := r.db.WithContext(ctx).Where("is_promoted = ? AND status = ?", true, "active").Limit(limit).Order("promoted_at DESC").Find(&models).Error; err != nil {
		return nil, err
	}
	
	listings := make([]*entities.Listing, len(models))
	for i, model := range models {
		listing, err := model.ToEntity()
		if err != nil {
			return nil, err
		}
		listings[i] = listing
	}
	
	return listings, nil
}

// GetRecent retourne les annonces récentes
func (r *ListingRepository) GetRecent(ctx context.Context, limit int) ([]*entities.Listing, error) {
	var models []ListingModel
	if err := r.db.WithContext(ctx).Where("status = ?", "active").Limit(limit).Order("created_at DESC").Find(&models).Error; err != nil {
		return nil, err
	}
	
	listings := make([]*entities.Listing, len(models))
	for i, model := range models {
		listing, err := model.ToEntity()
		if err != nil {
			return nil, err
		}
		listings[i] = listing
	}
	
	return listings, nil
}

// GetPopular retourne les annonces populaires
func (r *ListingRepository) GetPopular(ctx context.Context, limit int) ([]*entities.Listing, error) {
	var models []ListingModel
	if err := r.db.WithContext(ctx).Where("status = ?", "active").Limit(limit).Order("views_count DESC, contacts_count DESC").Find(&models).Error; err != nil {
		return nil, err
	}
	
	listings := make([]*entities.Listing, len(models))
	for i, model := range models {
		listing, err := model.ToEntity()
		if err != nil {
			return nil, err
		}
		listings[i] = listing
	}
	
	return listings, nil
}

// UpdateStatus met à jour le statut d'une annonce
func (r *ListingRepository) UpdateStatus(ctx context.Context, id string, status string) error {
	return r.db.WithContext(ctx).Model(&ListingModel{}).Where("id = ?", id).Update("status", status).Error
}

// IncrementViews incrémente le compteur de vues
func (r *ListingRepository) IncrementViews(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Model(&ListingModel{}).Where("id = ?", id).Update("views_count", gorm.Expr("views_count + ?", 1)).Error
}

// IncrementContacts incrémente le compteur de contacts
func (r *ListingRepository) IncrementContacts(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Model(&ListingModel{}).Where("id = ?", id).Update("contacts_count", gorm.Expr("contacts_count + ?", 1)).Error
}

// GetExpired retourne les annonces expirées
func (r *ListingRepository) GetExpired(ctx context.Context) ([]*entities.Listing, error) {
	var models []ListingModel
	if err := r.db.WithContext(ctx).Where("expires_at < ? AND status = ?", time.Now(), "active").Find(&models).Error; err != nil {
		return nil, err
	}
	
	listings := make([]*entities.Listing, len(models))
	for i, model := range models {
		listing, err := model.ToEntity()
		if err != nil {
			return nil, err
		}
		listings[i] = listing
	}
	
	return listings, nil
}

// ExtendExpiration prolonge la date d'expiration
func (r *ListingRepository) ExtendExpiration(ctx context.Context, id string, days int) error {
	return r.db.WithContext(ctx).Model(&ListingModel{}).Where("id = ?", id).Update("expires_at", gorm.Expr("expires_at + INTERVAL '? days'", days)).Error
}

// GetStatsByUser retourne les statistiques d'un utilisateur
func (r *ListingRepository) GetStatsByUser(ctx context.Context, userID string) (*entities.UserListingStats, error) {
	var stats struct {
		TotalListings   int   `gorm:"column:total_listings"`
		ActiveListings  int   `gorm:"column:active_listings"`
		ExpiredListings int   `gorm:"column:expired_listings"`
		TotalViews      int64 `gorm:"column:total_views"`
		TotalContacts   int64 `gorm:"column:total_contacts"`
	}
	
	query := `
		SELECT 
			COUNT(*) as total_listings,
			COUNT(CASE WHEN status = 'active' THEN 1 END) as active_listings,
			COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_listings,
			COALESCE(SUM(views_count), 0) as total_views,
			COALESCE(SUM(contacts_count), 0) as total_contacts
		FROM listings 
		WHERE user_id = ?
	`
	
	if err := r.db.WithContext(ctx).Raw(query, userID).Scan(&stats).Error; err != nil {
		return nil, err
	}
	
	successRate := float64(0)
	if stats.TotalListings > 0 {
		successRate = float64(stats.TotalListings-stats.ExpiredListings) / float64(stats.TotalListings) * 100
	}
	
	return &entities.UserListingStats{
		TotalListings:   stats.TotalListings,
		ActiveListings:  stats.ActiveListings,
		ExpiredListings: stats.ExpiredListings,
		TotalViews:      stats.TotalViews,
		TotalContacts:   stats.TotalContacts,
		SuccessRate:     successRate,
	}, nil
}

// GetTrendingCategories retourne les catégories tendances
func (r *ListingRepository) GetTrendingCategories(ctx context.Context, days int) ([]entities.CategoryTrend, error) {
	var trends []entities.CategoryTrend
	
	query := `
		SELECT 
			category_id,
			'' as category_name,
			COUNT(*) as count,
			(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM listings WHERE created_at >= NOW() - INTERVAL '? days')) as percentage
		FROM listings 
		WHERE created_at >= NOW() - INTERVAL '? days'
		GROUP BY category_id 
		ORDER BY count DESC
		LIMIT 10
	`
	
	if err := r.db.WithContext(ctx).Raw(query, days, days).Scan(&trends).Error; err != nil {
		return nil, err
	}
	
	return trends, nil
}