// internal/services/listing_service.go - VERSION MISE À JOUR AVEC QUOTAS
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

// Erreurs existantes
var (
	ErrListingNotFound   = errors.New("annonce non trouvée")
	ErrInvalidCategory   = errors.New("catégorie invalide")
	ErrInvalidRegion     = errors.New("région invalide")
	ErrUnauthorized      = errors.New("non autorisé")
)

type ListingService struct {
	db           *gorm.DB
	cacheService *CacheService
	quotaService *QuotaService
}

func NewListingService(db *gorm.DB, cacheRepo *redis.CacheRepository) *ListingService {
	return &ListingService{
		db:           db,
		cacheService: NewCacheService(cacheRepo),
		quotaService: NewQuotaService(db),
	}
}

// 🆕 CheckListingEligibility vérifie si l'utilisateur peut créer une annonce
func (s *ListingService) CheckListingEligibility(userID uuid.UUID) (map[string]interface{}, error) {
	return s.quotaService.CheckListingEligibility(userID)
}

// 🆕 CreateListingWithQuota crée une annonce en respectant les quotas
func (s *ListingService) CreateListingWithQuota(userID uuid.UUID, req *CreateListingRequest) (*models.Listing, error) {
	// Validation de base
	if req.CategoryID == "" {
		return nil, ErrInvalidCategory
	}
	if req.Region == "" {
		return nil, ErrInvalidRegion
	}

	categoryUUID, err := uuid.Parse(req.CategoryID)
	if err != nil {
		return nil, ErrInvalidCategory
	}

	// 🔍 Vérifier l'éligibilité pour une annonce gratuite
	canCreateFree, _, err := s.quotaService.CanCreateFreeListing(userID)
	if err != nil {
		return nil, fmt.Errorf("erreur vérification quota: %w", err)
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
		UserID:      userID,
		IsFeatured:  false,
		Images:      pq.StringArray(req.Images),
		ExpiresAt:   &expiresAt,
		Currency:    "XOF",
	}

	// 🎯 Logique selon les quotas
	if canCreateFree {
		// Publication gratuite directe
		listing.Status = "active"
		
		if err := s.db.Create(listing).Error; err != nil {
			return nil, fmt.Errorf("erreur création annonce: %w", err)
		}
		
		// Consommer le quota (si en phase 2+)
		if err := s.quotaService.ConsumeFreeListing(userID); err != nil {
			// Log l'erreur mais ne pas échouer la création
			log.Printf("⚠️ Erreur consommation quota (non bloquant): %v", err)
		}
		
		log.Printf("✅ Annonce %s publiée GRATUITEMENT pour utilisateur %s", listing.ID, userID)
		
	} else {
		// Création en draft (nécessite paiement)
		listing.Status = "draft"
		
		if err := s.db.Create(listing).Error; err != nil {
			return nil, fmt.Errorf("erreur création annonce: %w", err)
		}
		
		log.Printf("📝 Annonce %s créée en DRAFT pour utilisateur %s (paiement requis)", listing.ID, userID)
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

// 🆕 PublishListingAfterPayment publie une annonce après paiement
func (s *ListingService) PublishListingAfterPayment(listingID uuid.UUID, userID uuid.UUID) error {
	// Vérifier que l'annonce existe et appartient à l'utilisateur
	var listing models.Listing
	if err := s.db.Where("id = ? AND user_id = ? AND status = ?", listingID, userID, "draft").
		First(&listing).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrListingNotFound
		}
		return fmt.Errorf("erreur récupération annonce: %w", err)
	}

	// Publier l'annonce
	if err := s.db.Model(&listing).Update("status", "active").Error; err != nil {
		return fmt.Errorf("erreur publication annonce: %w", err)
	}

	// Compter l'annonce payée
	if err := s.quotaService.AddPaidListing(userID); err != nil {
		log.Printf("⚠️ Erreur comptage annonce payée: %v", err)
	}

	log.Printf("💳 Annonce %s publiée après PAIEMENT pour utilisateur %s", listingID, userID)

	// Invalider les caches
	ctx := context.Background()
	go func() {
		if err := s.cacheService.InvalidateListingCache(ctx, listingID.String()); err != nil {
			log.Printf("Erreur invalidation cache: %v", err)
		}
	}()

	return nil
}

// 🆕 GetUserQuotaStatus retourne le statut du quota d'un utilisateur
func (s *ListingService) GetUserQuotaStatus(userID uuid.UUID) (map[string]interface{}, error) {
	return s.quotaService.GetUserQuotaStatus(userID)
}

// CreateListing méthode originale (maintenant wrapper)
func (s *ListingService) CreateListing(userID string, req *CreateListingRequest) (*models.Listing, error) {
	userUUID, err := uuid.Parse(userID)
	if err != nil {
		return nil, fmt.Errorf("ID utilisateur invalide: %w", err)
	}
	
	return s.CreateListingWithQuota(userUUID, req)
}

// GetListings récupère les annonces avec pagination et cache
func (s *ListingService) GetListings(page, limit int, filters map[string]interface{}) ([]models.Listing, int64, error) {
	ctx := context.Background()
	
	// Essayer le cache d'abord
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
	
	// Construire la requête
	query := s.db.Model(&models.Listing{}).
		Preload("User", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "first_name", "last_name", "phone", "region", "is_verified")
		}).
		Preload("Category").
		Where("status = ?", "active")

	// Appliquer les filtres
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
		query = query.Where("title ILIKE ? OR description ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	// Compter le total
	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("erreur comptage annonces: %w", err)
	}

	// Tri par défaut
	sort := "created_at DESC"
	if sortParam, ok := filters["sort"].(string); ok && sortParam != "" {
		switch sortParam {
		case "price_asc":
			sort = "price ASC"
		case "price_desc":
			sort = "price DESC"
		case "newest":
			sort = "created_at DESC"
		case "oldest":
			sort = "created_at ASC"
		case "views":
			sort = "views_count DESC"
		}
	}

	// Pagination
	offset := (page - 1) * limit
	var listings []models.Listing
	
	if err := query.Order(sort).Offset(offset).Limit(limit).Find(&listings).Error; err != nil {
		return nil, 0, fmt.Errorf("erreur récupération annonces: %w", err)
	}

	// Mettre en cache
	go func() {
		if err := s.cacheService.CacheListingsPage(ctx, page, limit, filters, listings); err != nil {
			log.Printf("Erreur cache listings: %v", err)
		}
		if err := s.cacheService.cache.Set(ctx, CACHE_LISTINGS_COUNT, total, time.Hour); err != nil {
			log.Printf("Erreur cache count: %v", err)
		}
	}()

	return listings, total, nil
}

// GetListing récupère une annonce par ID avec cache
func (s *ListingService) GetListing(id string) (*models.Listing, error) {
	ctx := context.Background()
	
	// Essayer le cache d'abord
	cachedListing, err := s.cacheService.GetCachedListing(ctx, id)
	if err == nil {
		log.Printf("🔴 Cache HIT - Listing %s", id)
		return cachedListing, nil
	}
	
	log.Printf("🔴 Cache MISS - Récupération depuis DB listing %s", id)
	
	// Récupérer depuis la base de données
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
	
	// Mettre en cache
	go func() {
		if err := s.cacheService.CacheListing(ctx, &listing); err != nil {
			log.Printf("Erreur cache listing: %v", err)
		}
	}()
	
	return &listing, nil
}

// GetMyListings récupère les annonces d'un utilisateur (toutes, y compris drafts)
func (s *ListingService) GetMyListings(userID string, page, limit int) ([]models.Listing, int64, error) {
	if page <= 0 {
		page = 1
	}
	if limit <= 0 || limit > 50 {
		limit = 20
	}

	var listings []models.Listing
	var total int64

	// Compter le total
	s.db.Model(&models.Listing{}).Where("user_id = ?", userID).Count(&total)

	// Récupérer avec pagination (TOUTES les annonces, y compris drafts)
	offset := (page - 1) * limit
	err := s.db.Preload("Category").
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Offset(offset).Limit(limit).
		Find(&listings).Error

	return listings, total, err
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

// GetFeaturedListings récupère les annonces mises en avant
func (s *ListingService) GetFeaturedListings(limit int) ([]models.Listing, error) {
	if limit <= 0 {
		limit = 6
	}

	var listings []models.Listing
	err := s.db.Preload("User", func(db *gorm.DB) *gorm.DB {
		return db.Select("id", "first_name", "last_name", "phone", "region", "is_verified")
	}).
		Preload("Category").
		Where("status = ? AND is_featured = ?", "active", true).
		Order("created_at DESC").
		Limit(limit).
		Find(&listings).Error

	if err != nil {
		return nil, fmt.Errorf("erreur récupération annonces featured: %w", err)
	}

	return listings, nil
}

// IncrementViews augmente le compteur de vues d'une annonce
func (s *ListingService) IncrementViews(listingID string) error {
	if err := s.db.Model(&models.Listing{}).
		Where("id = ?", listingID).
		Update("views_count", gorm.Expr("views_count + 1")).Error; err != nil {
		return fmt.Errorf("erreur incrémentation vues: %w", err)
	}

	// Invalider le cache pour cette annonce
	ctx := context.Background()
	go func() {
		if err := s.cacheService.InvalidateListingCache(ctx, listingID); err != nil {
			log.Printf("Erreur invalidation cache après vue: %v", err)
		}
	}()

	return nil
}

// SearchListings recherche dans les annonces
func (s *ListingService) SearchListings(query string, page, limit int) ([]models.Listing, int64, error) {
	if page <= 0 {
		page = 1
	}
	if limit <= 0 || limit > 50 {
		limit = 20
	}

	var listings []models.Listing
	var total int64

	// Construire la requête de recherche
	searchQuery := s.db.Model(&models.Listing{}).
		Preload("User", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "first_name", "last_name", "phone", "region", "is_verified")
		}).
		Preload("Category").
		Where("status = ? AND (title ILIKE ? OR description ILIKE ?)", "active", "%"+query+"%", "%"+query+"%")

	// Compter le total
	searchQuery.Count(&total)

	// Récupérer avec pagination
	offset := (page - 1) * limit
	err := searchQuery.Order("created_at DESC").Offset(offset).Limit(limit).Find(&listings).Error

	return listings, total, err
}