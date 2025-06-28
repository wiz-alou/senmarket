// internal/services/category_service.go - VERSION SIMPLIFIÉE
package services

import (
	"context"
	"errors"
	"fmt"
	"log"

	"senmarket/internal/models"
	"senmarket/internal/repository/redis"

	"gorm.io/gorm"
)

// Erreurs
var (
	ErrCategoryNotFound = errors.New("catégorie non trouvée")
)

type CategoryService struct {
	db           *gorm.DB
	cacheService *CacheService
}

func NewCategoryService(db *gorm.DB, cacheRepo *redis.CacheRepository) *CategoryService {
	return &CategoryService{
		db:           db,
		cacheService: NewCacheService(cacheRepo),
	}
}

// GetCategories récupère toutes les catégories avec cache
func (s *CategoryService) GetCategories() ([]models.Category, error) {
	ctx := context.Background()
	
	// 🔴 1. Essayer le cache d'abord
	cachedCategories, err := s.cacheService.GetCachedCategories(ctx)
	if err == nil && len(cachedCategories) > 0 {
		log.Printf("🔴 Cache HIT - Categories")
		return cachedCategories, nil
	}
	
	log.Printf("🔴 Cache MISS - Categories depuis DB")
	
	// 🔴 2. Récupérer depuis la base
	var categories []models.Category
	if err := s.db.Where("is_active = ?", true).
		Order("sort_order ASC, name ASC").
		Find(&categories).Error; err != nil {
		return nil, fmt.Errorf("erreur récupération catégories: %w", err)
	}
	
	// 🔴 3. Mettre en cache
	go func() {
		if err := s.cacheService.CacheCategories(ctx, categories); err != nil {
			log.Printf("Erreur cache categories: %v", err)
		}
	}()
	
	return categories, nil
}

// GetCategoriesWithStats récupère les catégories avec le nombre d'annonces et cache
func (s *CategoryService) GetCategoriesWithStats() ([]CategoryWithStats, error) {
	ctx := context.Background()
	cacheKey := "categories:with_counts"
	
	// 🔴 1. Essayer le cache d'abord
	var cachedResult []CategoryWithStats
	if err := s.cacheService.cache.Get(ctx, cacheKey, &cachedResult); err == nil {
		log.Printf("🔴 Cache HIT - Categories with stats")
		return cachedResult, nil
	}
	
	log.Printf("🔴 Cache MISS - Categories with stats depuis DB")
	
	// 🔴 2. Récupérer depuis la base
	var results []CategoryWithStats

	// Requête avec comptage des annonces actives
	err := s.db.Table("categories").
		Select(`categories.*, 
			COALESCE(listing_counts.count, 0) as listing_count`).
		Joins(`LEFT JOIN (
			SELECT category_id, COUNT(*) as count 
			FROM listings 
			WHERE status = 'published' AND deleted_at IS NULL 
			GROUP BY category_id
		) as listing_counts ON categories.id = listing_counts.category_id`).
		Where("categories.is_active = ?", true).
		Order("categories.sort_order ASC, categories.name ASC").
		Scan(&results).Error

	if err != nil {
		return nil, fmt.Errorf("erreur récupération catégories avec stats: %w", err)
	}
	
	// 🔴 3. Mettre en cache
	go func() {
		if err := s.cacheService.cache.Set(ctx, cacheKey, results, TTL_MEDIUM); err != nil {
			log.Printf("Erreur cache categories with stats: %v", err)
		}
	}()
	
	return results, nil
}

// GetCategoriesWithCounts alias pour compatibilité
func (s *CategoryService) GetCategoriesWithCounts() ([]map[string]interface{}, error) {
	stats, err := s.GetCategoriesWithStats()
	if err != nil {
		return nil, err
	}
	
	var result []map[string]interface{}
	for _, stat := range stats {
		result = append(result, map[string]interface{}{
			"id":    stat.ID,
			"name":  stat.Name,
			"icon":  stat.Icon,
			"count": stat.ListingCount,
		})
	}
	
	return result, nil
}

// GetCategoryByID récupère une catégorie par ID avec cache
func (s *CategoryService) GetCategoryByID(id string) (*models.Category, error) {
	ctx := context.Background()
	
	// 🔴 1. Essayer le cache d'abord
	cacheKey := "category:" + id
	var cachedCategory models.Category
	if err := s.cacheService.cache.Get(ctx, cacheKey, &cachedCategory); err == nil {
		log.Printf("🔴 Cache HIT - Category %s", id)
		return &cachedCategory, nil
	}
	
	log.Printf("🔴 Cache MISS - Category depuis DB %s", id)
	
	// 🔴 2. Récupérer depuis la base
	var category models.Category
	if err := s.db.Where("id = ? AND is_active = ?", id, true).
		First(&category).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrCategoryNotFound
		}
		return nil, fmt.Errorf("erreur récupération catégorie: %w", err)
	}
	
	// 🔴 3. Mettre en cache
	go func() {
		if err := s.cacheService.cache.Set(ctx, cacheKey, category, TTL_LONG); err != nil {
			log.Printf("Erreur cache category: %v", err)
		}
	}()
	
	return &category, nil
}

// GetCategoryBySlug récupère une catégorie par slug avec cache
func (s *CategoryService) GetCategoryBySlug(slug string) (*models.Category, error) {
	ctx := context.Background()
	
	// 🔴 1. Essayer le cache d'abord
	cacheKey := "category:slug:" + slug
	var cachedCategory models.Category
	if err := s.cacheService.cache.Get(ctx, cacheKey, &cachedCategory); err == nil {
		log.Printf("🔴 Cache HIT - Category slug %s", slug)
		return &cachedCategory, nil
	}
	
	log.Printf("🔴 Cache MISS - Category slug depuis DB %s", slug)
	
	// 🔴 2. Récupérer depuis la base
	var category models.Category
	if err := s.db.Where("slug = ? AND is_active = ?", slug, true).
		First(&category).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrCategoryNotFound
		}
		return nil, fmt.Errorf("erreur récupération catégorie: %w", err)
	}
	
	// 🔴 3. Mettre en cache
	go func() {
		if err := s.cacheService.cache.Set(ctx, cacheKey, category, TTL_LONG); err != nil {
			log.Printf("Erreur cache category slug: %v", err)
		}
	}()
	
	return &category, nil
}

// GetListingsByCategory méthode simplifiée
func (s *CategoryService) GetListingsByCategory(categoryID string, query *ListingQuery) (*ListingResponse, error) {
	// Vérifier que la catégorie existe
	if _, err := s.GetCategoryByID(categoryID); err != nil {
		return nil, err
	}

	// Pour l'instant, retourner une réponse simple
	// TODO: Implémenter la logique complète quand ListingService sera mis à jour
	var listings []models.Listing
	
	dbQuery := s.db.Model(&models.Listing{}).
		Where("category_id = ? AND status = ? AND deleted_at IS NULL", categoryID, "published")
	
	// Compter le total
	var total int64
	dbQuery.Count(&total)
	
	// Pagination simple
	offset := (query.Page - 1) * query.Limit
	if err := dbQuery.Offset(offset).Limit(query.Limit).Find(&listings).Error; err != nil {
		return nil, fmt.Errorf("erreur récupération listings: %w", err)
	}
	
	// Construire la réponse
	response := &ListingResponse{
		Data: listings,
		Pagination: PaginationInfo{
			Page:       query.Page,
			Limit:      query.Limit,
			Total:      total,
			TotalPages: int((total + int64(query.Limit) - 1) / int64(query.Limit)),
		},
	}
	
	return response, nil
}

// GetCategoryStats récupère les statistiques d'une catégorie avec cache
func (s *CategoryService) GetCategoryStats(categoryID string) (map[string]interface{}, error) {
	ctx := context.Background()
	
	// 🔴 1. Essayer le cache d'abord
	cachedStats, err := s.cacheService.GetCachedCategoryStats(ctx, categoryID)
	if err == nil {
		log.Printf("🔴 Cache HIT - Category stats %s", categoryID)
		return cachedStats, nil
	}
	
	log.Printf("🔴 Cache MISS - Category stats depuis DB %s", categoryID)
	
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
		Where("category_id = ? AND status = ? AND deleted_at IS NULL", categoryID, "published").
		Count(&activeListings)
	stats["active_listings"] = activeListings

	// Prix moyen
	var avgPrice float64
	s.db.Model(&models.Listing{}).
		Select("AVG(price)").
		Where("category_id = ? AND status = ? AND deleted_at IS NULL", categoryID, "published").
		Scan(&avgPrice)
	stats["average_price"] = avgPrice

	// 🔴 3. Mettre en cache
	go func() {
		if err := s.cacheService.CacheCategoryStats(ctx, categoryID, stats); err != nil {
			log.Printf("Erreur cache category stats: %v", err)
		}
	}()

	return stats, nil
}