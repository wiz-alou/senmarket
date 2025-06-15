// internal/services/category_service.go
package services

import (
	"fmt"
     "errors"  
	"senmarket/internal/models"

	"gorm.io/gorm"
)

type CategoryService struct {
	db *gorm.DB
}

type CategoryWithStats struct {
	models.Category
	ListingCount int64 `json:"listing_count"`
}

func NewCategoryService(db *gorm.DB) *CategoryService {
	return &CategoryService{db: db}
}

// GetCategories récupère toutes les catégories actives
func (s *CategoryService) GetCategories() ([]models.Category, error) {
	var categories []models.Category
	if err := s.db.Where("is_active = ?", true).
		Order("sort_order ASC, name ASC").
		Find(&categories).Error; err != nil {
		return nil, fmt.Errorf("erreur récupération catégories: %w", err)
	}

	return categories, nil
}

// GetCategoriesWithStats récupère les catégories avec le nombre d'annonces
func (s *CategoryService) GetCategoriesWithStats() ([]CategoryWithStats, error) {
	var results []CategoryWithStats

	// Requête avec comptage des annonces actives
	err := s.db.Table("categories").
		Select(`categories.*, 
			COALESCE(listing_counts.count, 0) as listing_count`).
		Joins(`LEFT JOIN (
			SELECT category_id, COUNT(*) as count 
			FROM listings 
			WHERE status = 'active' AND deleted_at IS NULL 
			GROUP BY category_id
		) as listing_counts ON categories.id = listing_counts.category_id`).
		Where("categories.is_active = ?", true).
		Order("categories.sort_order ASC, categories.name ASC").
		Scan(&results).Error

	if err != nil {
		return nil, fmt.Errorf("erreur récupération catégories avec stats: %w", err)
	}

	return results, nil
}

// GetCategoryByID récupère une catégorie par ID
func (s *CategoryService) GetCategoryByID(id string) (*models.Category, error) {
	var category models.Category
	if err := s.db.Where("id = ? AND is_active = ?", id, true).
		First(&category).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrCategoryNotFound
		}
		return nil, fmt.Errorf("erreur récupération catégorie: %w", err)
	}

	return &category, nil
}

// GetCategoryBySlug récupère une catégorie par slug
func (s *CategoryService) GetCategoryBySlug(slug string) (*models.Category, error) {
	var category models.Category
	if err := s.db.Where("slug = ? AND is_active = ?", slug, true).
		First(&category).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrCategoryNotFound
		}
		return nil, fmt.Errorf("erreur récupération catégorie: %w", err)
	}

	return &category, nil
}

// GetListingsByCategory récupère les annonces d'une catégorie
func (s *CategoryService) GetListingsByCategory(categoryID string, query *ListingQuery) (*ListingResponse, error) {
	// Vérifier que la catégorie existe
	if _, err := s.GetCategoryByID(categoryID); err != nil {
		return nil, err
	}

	// Forcer le filtre sur la catégorie
	query.CategoryID = categoryID

	// Utiliser le service listings
	listingService := NewListingService(s.db)
	return listingService.GetListings(query)
}

// GetCategoryStats récupère les statistiques d'une catégorie
func (s *CategoryService) GetCategoryStats(categoryID string) (map[string]interface{}, error) {
	// Vérifier que la catégorie existe
	category, err := s.GetCategoryByID(categoryID)
	if err != nil {
		return nil, err
	}

	stats := make(map[string]interface{})
	stats["category"] = category

	// Comptage total des annonces
	var totalListings int64
	s.db.Model(&models.Listing{}).
		Where("category_id = ? AND deleted_at IS NULL", categoryID).
		Count(&totalListings)
	stats["total_listings"] = totalListings

	// Comptage par statut
	var activeListings int64
	s.db.Model(&models.Listing{}).
		Where("category_id = ? AND status = ? AND deleted_at IS NULL", categoryID, "active").
		Count(&activeListings)
	stats["active_listings"] = activeListings

	// Prix moyen
	var avgPrice float64
	s.db.Model(&models.Listing{}).
		Select("AVG(price)").
		Where("category_id = ? AND status = ? AND deleted_at IS NULL", categoryID, "active").
		Scan(&avgPrice)
	stats["average_price"] = avgPrice

	// Prix min/max
	var minPrice, maxPrice float64
	s.db.Model(&models.Listing{}).
		Select("MIN(price), MAX(price)").
		Where("category_id = ? AND status = ? AND deleted_at IS NULL", categoryID, "active").
		Row().Scan(&minPrice, &maxPrice)
	stats["min_price"] = minPrice
	stats["max_price"] = maxPrice

	// Répartition par région
	var regionStats []struct {
		Region string `json:"region"`
		Count  int64  `json:"count"`
	}
	s.db.Model(&models.Listing{}).
		Select("region, COUNT(*) as count").
		Where("category_id = ? AND status = ? AND deleted_at IS NULL", categoryID, "active").
		Group("region").
		Order("count DESC").
		Limit(10).
		Scan(&regionStats)
	stats["by_region"] = regionStats

	return stats, nil
}

var (
	ErrCategoryNotFound = errors.New("catégorie non trouvée")
)