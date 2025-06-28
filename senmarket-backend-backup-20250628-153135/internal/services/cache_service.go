// internal/services/cache_service.go
package services

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"senmarket/internal/models"
	"senmarket/internal/repository/redis"
)

type CacheService struct {
	cache *redis.CacheRepository
}

func NewCacheService(cache *redis.CacheRepository) *CacheService {
	return &CacheService{
		cache: cache,
	}
}

// ============================================
// CACHE KEYS CONSTANTS
// ============================================
const (
	// Listings
	CACHE_LISTING_PREFIX    = "listing:"
	CACHE_LISTINGS_PAGE     = "listings:page:"
	CACHE_LISTINGS_SEARCH   = "listings:search:"
	CACHE_LISTINGS_CATEGORY = "listings:category:"
	CACHE_LISTINGS_REGION   = "listings:region:"
	CACHE_LISTINGS_FEATURED = "listings:featured"
	CACHE_LISTINGS_COUNT    = "listings:count"

	// Categories
	CACHE_CATEGORIES_ALL   = "categories:all"
	CACHE_CATEGORY_PREFIX  = "category:"
	CACHE_CATEGORY_STATS   = "category:stats:"

	// Users
	CACHE_USER_PREFIX     = "user:"
	CACHE_USER_STATS      = "user:stats:"
	CACHE_USER_LISTINGS   = "user:listings:"

	// Search
	CACHE_SEARCH_PREFIX   = "search:"
	CACHE_SEARCH_POPULAR  = "search:popular"

	// Stats
	CACHE_STATS_GLOBAL    = "stats:global"
	CACHE_STATS_REGION    = "stats:region:"

	// Sessions
	CACHE_SESSION_PREFIX  = "session:"
	CACHE_RATE_LIMIT      = "rate:"

	// TTL Values
	TTL_SHORT    = 5 * time.Minute   // Données fréquemment modifiées
	TTL_MEDIUM   = 30 * time.Minute  // Données modérément stables
	TTL_LONG     = 2 * time.Hour     // Données stables
	TTL_VERY_LONG = 24 * time.Hour   // Données très stables
)

// ============================================
// LISTINGS CACHE
// ============================================

// CacheListing stocke une annonce
func (s *CacheService) CacheListing(ctx context.Context, listing *models.Listing) error {
	key := CACHE_LISTING_PREFIX + listing.ID.String()
	return s.cache.Set(ctx, key, listing, TTL_MEDIUM)
}

// GetCachedListing récupère une annonce
func (s *CacheService) GetCachedListing(ctx context.Context, listingID string) (*models.Listing, error) {
	var listing models.Listing
	key := CACHE_LISTING_PREFIX + listingID
	
	err := s.cache.Get(ctx, key, &listing)
	if err != nil {
		return nil, err
	}
	
	return &listing, nil
}

// CacheListingsPage stocke une page d'annonces
func (s *CacheService) CacheListingsPage(ctx context.Context, page, limit int, filters map[string]interface{}, listings []models.Listing) error {
	key := s.buildListingsPageKey(page, limit, filters)
	return s.cache.Set(ctx, key, listings, TTL_SHORT)
}

// GetCachedListingsPage récupère une page d'annonces
func (s *CacheService) GetCachedListingsPage(ctx context.Context, page, limit int, filters map[string]interface{}) ([]models.Listing, error) {
	var listings []models.Listing
	key := s.buildListingsPageKey(page, limit, filters)
	
	err := s.cache.Get(ctx, key, &listings)
	if err != nil {
		return nil, err
	}
	
	return listings, nil
}

// CacheSearchResults stocke les résultats de recherche
func (s *CacheService) CacheSearchResults(ctx context.Context, query string, results []models.Listing) error {
	key := CACHE_SEARCH_PREFIX + query
	return s.cache.Set(ctx, key, results, TTL_SHORT)
}

// GetCachedSearchResults récupère les résultats de recherche
func (s *CacheService) GetCachedSearchResults(ctx context.Context, query string) ([]models.Listing, error) {
	var results []models.Listing
	key := CACHE_SEARCH_PREFIX + query
	
	err := s.cache.Get(ctx, key, &results)
	if err != nil {
		return nil, err
	}
	
	return results, nil
}

// CacheFeaturedListings stocke les annonces à la une
func (s *CacheService) CacheFeaturedListings(ctx context.Context, listings []models.Listing) error {
	return s.cache.Set(ctx, CACHE_LISTINGS_FEATURED, listings, TTL_MEDIUM)
}

// GetCachedFeaturedListings récupère les annonces à la une
func (s *CacheService) GetCachedFeaturedListings(ctx context.Context) ([]models.Listing, error) {
	var listings []models.Listing
	err := s.cache.Get(ctx, CACHE_LISTINGS_FEATURED, &listings)
	if err != nil {
		return nil, err
	}
	
	return listings, nil
}

// InvalidateListingCache invalide le cache d'une annonce
func (s *CacheService) InvalidateListingCache(ctx context.Context, listingID string) error {
	// Supprimer l'annonce spécifique
	listingKey := CACHE_LISTING_PREFIX + listingID
	
	// Invalider les caches liés
	patterns := []string{
		CACHE_LISTINGS_PAGE + "*",
		CACHE_LISTINGS_SEARCH + "*",
		CACHE_LISTINGS_CATEGORY + "*",
		CACHE_LISTINGS_REGION + "*",
		CACHE_LISTINGS_FEATURED,
		CACHE_STATS_GLOBAL,
	}
	
	// Supprimer l'annonce spécifique
	if err := s.cache.Del(ctx, listingKey); err != nil {
		return err
	}
	
	// Invalider les patterns
	for _, pattern := range patterns {
		if err := s.cache.DelPattern(ctx, pattern); err != nil {
			// Log l'erreur mais continuer
			fmt.Printf("Erreur invalidation pattern %s: %v\n", pattern, err)
		}
	}
	
	return nil
}

// ============================================
// CATEGORIES CACHE
// ============================================

// CacheCategories stocke toutes les catégories
func (s *CacheService) CacheCategories(ctx context.Context, categories []models.Category) error {
	return s.cache.Set(ctx, CACHE_CATEGORIES_ALL, categories, TTL_VERY_LONG)
}

// GetCachedCategories récupère toutes les catégories
func (s *CacheService) GetCachedCategories(ctx context.Context) ([]models.Category, error) {
	var categories []models.Category
	err := s.cache.Get(ctx, CACHE_CATEGORIES_ALL, &categories)
	if err != nil {
		return nil, err
	}
	
	return categories, nil
}

// CacheCategoryStats stocke les statistiques d'une catégorie
func (s *CacheService) CacheCategoryStats(ctx context.Context, categoryID string, stats map[string]interface{}) error {
	key := CACHE_CATEGORY_STATS + categoryID
	return s.cache.Set(ctx, key, stats, TTL_MEDIUM)
}

// GetCachedCategoryStats récupère les statistiques d'une catégorie
func (s *CacheService) GetCachedCategoryStats(ctx context.Context, categoryID string) (map[string]interface{}, error) {
	var stats map[string]interface{}
	key := CACHE_CATEGORY_STATS + categoryID
	
	err := s.cache.Get(ctx, key, &stats)
	if err != nil {
		return nil, err
	}
	
	return stats, nil
}

// ============================================
// USER CACHE
// ============================================

// CacheUser stocke un utilisateur
func (s *CacheService) CacheUser(ctx context.Context, user *models.User) error {
	key := CACHE_USER_PREFIX + user.ID.String()
	return s.cache.Set(ctx, key, user, TTL_LONG)
}

// GetCachedUser récupère un utilisateur
func (s *CacheService) GetCachedUser(ctx context.Context, userID string) (*models.User, error) {
	var user models.User
	key := CACHE_USER_PREFIX + userID
	
	err := s.cache.Get(ctx, key, &user)
	if err != nil {
		return nil, err
	}
	
	return &user, nil
}

// CacheUserStats stocke les statistiques utilisateur
func (s *CacheService) CacheUserStats(ctx context.Context, userID string, stats map[string]interface{}) error {
	key := CACHE_USER_STATS + userID
	return s.cache.Set(ctx, key, stats, TTL_MEDIUM)
}

// GetCachedUserStats récupère les statistiques utilisateur
func (s *CacheService) GetCachedUserStats(ctx context.Context, userID string) (map[string]interface{}, error) {
	var stats map[string]interface{}
	key := CACHE_USER_STATS + userID
	
	err := s.cache.Get(ctx, key, &stats)
	if err != nil {
		return nil, err
	}
	
	return stats, nil
}

// ============================================
// STATS CACHE
// ============================================

// CacheGlobalStats stocke les statistiques globales
func (s *CacheService) CacheGlobalStats(ctx context.Context, stats map[string]interface{}) error {
	return s.cache.Set(ctx, CACHE_STATS_GLOBAL, stats, TTL_MEDIUM)
}

// GetCachedGlobalStats récupère les statistiques globales
func (s *CacheService) GetCachedGlobalStats(ctx context.Context) (map[string]interface{}, error) {
	var stats map[string]interface{}
	err := s.cache.Get(ctx, CACHE_STATS_GLOBAL, &stats)
	if err != nil {
		return nil, err
	}
	
	return stats, nil
}

// ============================================
// RATE LIMITING
// ============================================

// CheckRateLimit vérifie et applique la limitation de débit
func (s *CacheService) CheckRateLimit(ctx context.Context, identifier string, limit int64, window time.Duration) (bool, error) {
	key := CACHE_RATE_LIMIT + identifier
	
	current, err := s.cache.IncrEx(ctx, key, window)
	if err != nil {
		return false, err
	}
	
	return current <= limit, nil
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// buildListingsPageKey construit une clé pour la pagination
func (s *CacheService) buildListingsPageKey(page, limit int, filters map[string]interface{}) string {
	key := CACHE_LISTINGS_PAGE + strconv.Itoa(page) + ":" + strconv.Itoa(limit)
	
	if categoryID, ok := filters["category_id"].(string); ok && categoryID != "" {
		key += ":cat:" + categoryID
	}
	
	if region, ok := filters["region"].(string); ok && region != "" {
		key += ":reg:" + region
	}
	
	if sortBy, ok := filters["sort_by"].(string); ok && sortBy != "" {
		key += ":sort:" + sortBy
	}
	
	return key
}

// ClearAllCache efface tout le cache (à utiliser avec précaution)
func (s *CacheService) ClearAllCache(ctx context.Context) error {
	return s.cache.DelPattern(ctx, "*")
}

// GetCacheInfo retourne des informations sur le cache
func (s *CacheService) GetCacheInfo(ctx context.Context) (map[string]interface{}, error) {
	return map[string]interface{}{
		"status": "connected",
		"implementation": "redis",
	}, nil
}

// IncrementSearchCount incrémente le compteur de recherche
func (s *CacheService) IncrementSearchCount(ctx context.Context, query string) error {
	key := "search:count:" + query
	_, err := s.cache.IncrEx(ctx, key, TTL_VERY_LONG)
	return err
}

// CachePopularSearches stocke les recherches populaires
func (s *CacheService) CachePopularSearches(ctx context.Context, searches []string) error {
	return s.cache.Set(ctx, CACHE_SEARCH_POPULAR, searches, TTL_LONG)
}

// GetCachedPopularSearches récupère les recherches populaires
func (s *CacheService) GetCachedPopularSearches(ctx context.Context) ([]string, error) {
	var searches []string
	err := s.cache.Get(ctx, CACHE_SEARCH_POPULAR, &searches)
	if err != nil {
		return nil, err
	}
	
	return searches, nil
}