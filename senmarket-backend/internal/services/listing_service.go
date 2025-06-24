// internal/services/listing_service.go - VERSION CORRIGÉE
package services

import (
	"context"
	"errors"
	"fmt"
	"log"
	"time"

	"senmarket/internal/models"
	"senmarket/internal/repository/redis"

	"github.com/google/uuid"
	"github.com/lib/pq"
	"gorm.io/gorm"
)

// Erreurs
var (
	ErrListingNotFound   = errors.New("annonce non trouvée")
	ErrInvalidCategory   = errors.New("catégorie invalide")
	ErrInvalidRegion     = errors.New("région invalide")
	ErrUnauthorized      = errors.New("non autorisé")
)

type ListingService struct {
	db           *gorm.DB
	cacheService *CacheService
}

func NewListingService(db *gorm.DB, cacheRepo *redis.CacheRepository) *ListingService {
	return &ListingService{
		db:           db,
		cacheService: NewCacheService(cacheRepo),
	}
}

// CreateListing crée une nouvelle annonce
func (s *ListingService) CreateListing(userID string, req *CreateListingRequest) (*models.Listing, error) {
	// Validation de base
	if req.CategoryID == "" {
		return nil, ErrInvalidCategory
	}
	if req.Region == "" {
		return nil, ErrInvalidRegion
	}

	// Convertir les IDs en UUID
	userUUID, err := uuid.Parse(userID)
	if err != nil {
		return nil, fmt.Errorf("ID utilisateur invalide: %w", err)
	}

	categoryUUID, err := uuid.Parse(req.CategoryID)
	if err != nil {
		return nil, ErrInvalidCategory
	}

	// Définir l'expiration
	expiresAt := time.Now().AddDate(0, 1, 0) // 1 mois

	// Créer l'annonce
	listing := &models.Listing{
		Title:       req.Title,
		Description: req.Description,
		Price:       req.Price,
		CategoryID:  categoryUUID,
		Region:      req.Region,
		UserID:      userUUID,
		Status:      "draft", // Draft par défaut
		IsFeatured:  false,   // Utiliser IsFeatured au lieu de Featured
		Images:      pq.StringArray(req.Images), // Convertir en pq.StringArray
		ExpiresAt:   &expiresAt, // Pointeur vers time.Time
		Currency:    "XOF", // Devise par défaut
	}

	if err := s.db.Create(listing).Error; err != nil {
		return nil, fmt.Errorf("erreur création annonce: %w", err)
	}

	// Invalider les caches liés
	ctx := context.Background()
	go func() {
		if err := s.cacheService.InvalidateListingCache(ctx, listing.ID.String()); err != nil {
			log.Printf("Erreur invalidation cache: %v", err)
		}
	}()

	return listing, nil
}

// GetListings récupère les annonces avec pagination et cache
func (s *ListingService) GetListings(page, limit int, filters map[string]interface{}) ([]models.Listing, int64, error) {
	ctx := context.Background()
	
	// 🔴 1. Essayer le cache d'abord
	cachedListings, err := s.cacheService.GetCachedListingsPage(ctx, page, limit, filters)
	if err == nil && len(cachedListings) > 0 {
		log.Printf("🔴 Cache HIT - Listings page %d", page)
		
		// Récupérer le total count depuis le cache aussi
		var totalCount int64
		if err := s.cacheService.cache.Get(ctx, CACHE_LISTINGS_COUNT, &totalCount); err == nil {
			return cachedListings, totalCount, nil
		}
	}
	
	log.Printf("🔴 Cache MISS - Récupération depuis DB page %d", page)
	
	// 🔴 2. Récupérer depuis la base de données
	var listings []models.Listing
	var totalCount int64
	
	// Construire la requête - Utiliser "active" au lieu de "published"
	query := s.db.Model(&models.Listing{}).
		Where("status = ? AND expires_at > ?", "active", time.Now())
	
	// Appliquer les filtres
	query = s.applyFilters(query, filters)
	
	// Compter le total
	if err := query.Count(&totalCount).Error; err != nil {
		return nil, 0, fmt.Errorf("erreur comptage annonces: %w", err)
	}
	
	// Récupérer les annonces avec pagination
	offset := (page - 1) * limit
	if err := query.
		Preload("User").
		Preload("Category").
		Order(s.buildOrderClause(filters)).
		Offset(offset).
		Limit(limit).
		Find(&listings).Error; err != nil {
		return nil, 0, fmt.Errorf("erreur récupération annonces: %w", err)
	}
	
	// 🔴 3. Mettre en cache les résultats
	go func() {
		if err := s.cacheService.CacheListingsPage(ctx, page, limit, filters, listings); err != nil {
			log.Printf("Erreur cache listings page: %v", err)
		}
		
		// Cache le total count
		if err := s.cacheService.cache.Set(ctx, CACHE_LISTINGS_COUNT, totalCount, TTL_MEDIUM); err != nil {
			log.Printf("Erreur cache total count: %v", err)
		}
	}()
	
	return listings, totalCount, nil
}

// Méthode alternative pour compatibilité avec les handlers existants
func (s *ListingService) GetListings2(query *ListingQuery) (*ListingResponse, error) {
	// Convertir ListingQuery en paramètres
	filters := make(map[string]interface{})
	if query.CategoryID != "" {
		filters["category_id"] = query.CategoryID
	}
	if query.Region != "" {
		filters["region"] = query.Region
	}
	if query.MinPrice > 0 {
		filters["min_price"] = query.MinPrice
	}
	if query.MaxPrice > 0 {
		filters["max_price"] = query.MaxPrice
	}
	if query.Search != "" {
		filters["search"] = query.Search
	}
	if query.Sort != "" {
		filters["sort_by"] = query.Sort
	}
	if query.UserID != "" {
		filters["user_id"] = query.UserID
	}
	if query.Status != "" {
		filters["status"] = query.Status
	}

	// Valeurs par défaut
	if query.Page <= 0 {
		query.Page = 1
	}
	if query.Limit <= 0 {
		query.Limit = 20
	}

	// Utiliser la méthode existante
	listings, total, err := s.GetListings(query.Page, query.Limit, filters)
	if err != nil {
		return nil, err
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

// GetListingByID récupère une annonce par ID avec cache
func (s *ListingService) GetListingByID(id string) (*models.Listing, error) {
	ctx := context.Background()
	
	// 🔴 1. Essayer le cache d'abord
	cachedListing, err := s.cacheService.GetCachedListing(ctx, id)
	if err == nil {
		log.Printf("🔴 Cache HIT - Listing %s", id)
		return cachedListing, nil
	}
	
	log.Printf("🔴 Cache MISS - Récupération depuis DB listing %s", id)
	
	// 🔴 2. Récupérer depuis la base de données
	var listing models.Listing
	if err := s.db.
		Preload("User").
		Preload("Category").
		Where("id = ? AND status = ?", id, "active").
		First(&listing).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrListingNotFound
		}
		return nil, fmt.Errorf("erreur récupération annonce: %w", err)
	}
	
	// 🔴 3. Mettre en cache
	go func() {
		if err := s.cacheService.CacheListing(ctx, &listing); err != nil {
			log.Printf("Erreur cache listing: %v", err)
		}
	}()
	
	return &listing, nil
}

// UpdateListing met à jour une annonce
func (s *ListingService) UpdateListing(listingID string, userID string, req *UpdateListingRequest) (*models.Listing, error) {
	// Vérifier que l'annonce existe et appartient à l'utilisateur
	var listing models.Listing
	if err := s.db.Where("id = ? AND user_id = ?", listingID, userID).First(&listing).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrListingNotFound
		}
		return nil, fmt.Errorf("erreur récupération annonce: %w", err)
	}

	// Construire les updates
	updates := make(map[string]interface{})
	if req.Title != nil {
		updates["title"] = *req.Title
	}
	if req.Description != nil {
		updates["description"] = *req.Description
	}
	if req.Price != nil {
		updates["price"] = *req.Price
	}
	if req.Region != nil {
		updates["region"] = *req.Region
	}
	if req.Images != nil {
		updates["images"] = pq.StringArray(req.Images)
	}
	if req.Status != nil {
		updates["status"] = *req.Status
	}

	// Mettre à jour
	if err := s.db.Model(&listing).Updates(updates).Error; err != nil {
		return nil, fmt.Errorf("erreur mise à jour annonce: %w", err)
	}

	// Recharger l'annonce
	if err := s.db.Preload("User").Preload("Category").First(&listing, listing.ID).Error; err != nil {
		return nil, fmt.Errorf("erreur rechargement annonce: %w", err)
	}

	// Invalider les caches
	ctx := context.Background()
	go func() {
		if err := s.cacheService.InvalidateListingCache(ctx, listingID); err != nil {
			log.Printf("Erreur invalidation cache: %v", err)
		}
	}()

	return &listing, nil
}

// DeleteListing supprime une annonce (soft delete)
func (s *ListingService) DeleteListing(listingID string, userID string) error {
	// Vérifier que l'annonce existe et appartient à l'utilisateur
	var listing models.Listing
	if err := s.db.Where("id = ? AND user_id = ?", listingID, userID).First(&listing).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrListingNotFound
		}
		return fmt.Errorf("erreur récupération annonce: %w", err)
	}

	// Soft delete
	if err := s.db.Delete(&listing).Error; err != nil {
		return fmt.Errorf("erreur suppression annonce: %w", err)
	}

	// Invalider les caches
	ctx := context.Background()
	go func() {
		if err := s.cacheService.InvalidateListingCache(ctx, listingID); err != nil {
			log.Printf("Erreur invalidation cache: %v", err)
		}
	}()

	return nil
}

// SearchListings recherche avec cache
func (s *ListingService) SearchListings(query string, filters map[string]interface{}) ([]models.Listing, error) {
	ctx := context.Background()
	
	// 🔴 1. Essayer le cache de recherche
	cachedResults, err := s.cacheService.GetCachedSearchResults(ctx, query)
	if err == nil && len(cachedResults) > 0 {
		log.Printf("🔴 Cache HIT - Search '%s'", query)
		return cachedResults, nil
	}
	
	log.Printf("🔴 Cache MISS - Search depuis DB '%s'", query)
	
	// 🔴 2. Rechercher en base
	var listings []models.Listing
	dbQuery := s.db.Model(&models.Listing{}).
		Where("status = ? AND expires_at > ?", "active", time.Now()).
		Where("(title ILIKE ? OR description ILIKE ?)", "%"+query+"%", "%"+query+"%")
	
	// Appliquer les filtres
	dbQuery = s.applyFilters(dbQuery, filters)
	
	if err := dbQuery.
		Preload("User").
		Preload("Category").
		Order("created_at DESC").
		Limit(50).
		Find(&listings).Error; err != nil {
		return nil, fmt.Errorf("erreur recherche annonces: %w", err)
	}
	
	// 🔴 3. Mettre en cache les résultats
	go func() {
		if err := s.cacheService.CacheSearchResults(ctx, query, listings); err != nil {
			log.Printf("Erreur cache search results: %v", err)
		}
		
		// Incrémenter le compteur de recherche
		if err := s.cacheService.IncrementSearchCount(ctx, query); err != nil {
			log.Printf("Erreur increment search count: %v", err)
		}
	}()
	
	return listings, nil
}

// GetFeaturedListings récupère les annonces à la une avec cache
func (s *ListingService) GetFeaturedListings(limit int) ([]models.Listing, error) {
	ctx := context.Background()
	
	// 🔴 1. Essayer le cache d'abord
	cachedFeatured, err := s.cacheService.GetCachedFeaturedListings(ctx)
	if err == nil && len(cachedFeatured) > 0 {
		log.Printf("🔴 Cache HIT - Featured listings")
		if len(cachedFeatured) > limit {
			return cachedFeatured[:limit], nil
		}
		return cachedFeatured, nil
	}
	
	log.Printf("🔴 Cache MISS - Featured depuis DB")
	
	// 🔴 2. Récupérer depuis la base
	var listings []models.Listing
	if err := s.db.
		Preload("User").
		Preload("Category").
		Where("status = ? AND expires_at > ? AND is_featured = ?", "active", time.Now(), true).
		Order("created_at DESC").
		Limit(limit).
		Find(&listings).Error; err != nil {
		return nil, fmt.Errorf("erreur récupération annonces featured: %w", err)
	}
	
	// 🔴 3. Mettre en cache
	go func() {
		if err := s.cacheService.CacheFeaturedListings(ctx, listings); err != nil {
			log.Printf("Erreur cache featured listings: %v", err)
		}
	}()
	
	return listings, nil
}

// Fonctions utilitaires
func (s *ListingService) applyFilters(query *gorm.DB, filters map[string]interface{}) *gorm.DB {
	if categoryID, ok := filters["category_id"].(string); ok && categoryID != "" {
		query = query.Where("category_id = ?", categoryID)
	}
	
	if region, ok := filters["region"].(string); ok && region != "" {
		query = query.Where("region = ?", region)
	}
	
	if minPrice, ok := filters["min_price"].(float64); ok && minPrice > 0 {
		query = query.Where("price >= ?", minPrice)
	}
	
	if maxPrice, ok := filters["max_price"].(float64); ok && maxPrice > 0 {
		query = query.Where("price <= ?", maxPrice)
	}
	
	if search, ok := filters["search"].(string); ok && search != "" {
		query = query.Where("(title ILIKE ? OR description ILIKE ?)", "%"+search+"%", "%"+search+"%")
	}
	
	// 🔴 NOUVEAUX FILTRES
	if userID, ok := filters["user_id"].(string); ok && userID != "" {
		query = query.Where("user_id = ?", userID)
	}
	
	if status, ok := filters["status"].(string); ok && status != "" && status != "all" {
		query = query.Where("status = ?", status)
	}
	
	return query
}

func (s *ListingService) buildOrderClause(filters map[string]interface{}) string {
	if sortBy, ok := filters["sort_by"].(string); ok {
		switch sortBy {
		case "price_asc":
			return "price ASC"
		case "price_desc":
			return "price DESC"
		case "date_asc":
			return "created_at ASC"
		case "date_desc":
			return "created_at DESC"
		case "title":
			return "title ASC"
		case "views":
			return "views_count DESC"
		}
	}
	return "created_at DESC"
}