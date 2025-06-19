// internal/services/listing_service.go
package services

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"senmarket/internal/models"
    "github.com/lib/pq"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

var (
	ErrListingNotFound    = errors.New("annonce non trouvée")
	ErrUnauthorized      = errors.New("non autorisé")
	ErrInvalidCategory   = errors.New("catégorie invalide")
	ErrInvalidRegion     = errors.New("région invalide")
)

type ListingService struct {
	db *gorm.DB
}

type CreateListingRequest struct {
	CategoryID  string   `json:"category_id" validate:"required,uuid"`
	Title       string   `json:"title" validate:"required,min=5,max=200"`
	Description string   `json:"description" validate:"required,min=20"`
	Price       float64  `json:"price" validate:"required,min=0"`
	Currency    string   `json:"currency"`
	Region      string   `json:"region" validate:"required"`
	Images      []string `json:"images" validate:"max=5"`
}

type UpdateListingRequest struct {
	Title       *string  `json:"title,omitempty" validate:"omitempty,min=5,max=200"`
	Description *string  `json:"description,omitempty" validate:"omitempty,min=20"`
	Price       *float64 `json:"price,omitempty" validate:"omitempty,min=0"`
	Region      *string  `json:"region,omitempty"`
	Images      []string `json:"images,omitempty" validate:"max=5"`
	Status      *string  `json:"status,omitempty" validate:"omitempty,oneof=draft active sold expired"`
}

type ListingQuery struct {
	CategoryID  string  `form:"category_id"`
	Region      string  `form:"region"`
	MinPrice    float64 `form:"min_price"`
	MaxPrice    float64 `form:"max_price"`
	Search      string  `form:"search"`
	Status      string  `form:"status"`
	UserID      string  `form:"user_id"`
	Sort        string  `form:"sort"`        // "date", "price_asc", "price_desc", "views"
	Page        int     `form:"page"`
	Limit       int     `form:"limit"`
	Featured    *bool   `form:"featured"`
}

type ListingResponse struct {
	Listings []models.Listing `json:"listings"`
	Total    int64            `json:"total"`
	Page     int              `json:"page"`
	Limit    int              `json:"limit"`
	Pages    int              `json:"pages"`
}

func NewListingService(db *gorm.DB) *ListingService {
	return &ListingService{db: db}
}

// CreateListing crée une nouvelle annonce
func (s *ListingService) CreateListing(userID string, req *CreateListingRequest) (*models.Listing, error) {
	// Vérifier que la catégorie existe
	var category models.Category
	if err := s.db.Where("id = ? AND is_active = ?", req.CategoryID, true).First(&category).Error; err != nil {
		return nil, ErrInvalidCategory
	}

	// Vérifier que la région est valide
	if !s.isValidRegion(req.Region) {
		return nil, ErrInvalidRegion
	}

	// Créer l'annonce
	listing := models.Listing{
		UserID:      uuid.MustParse(userID),
		CategoryID:  uuid.MustParse(req.CategoryID),
		Title:       req.Title,
		Description: req.Description,
		Price:       req.Price,
		Currency:    req.Currency,
		Region:      req.Region,
		Images:      pq.StringArray(req.Images),
		Status:      "draft", // Commence en brouillon
	}

	// Définir la devise par défaut
	if listing.Currency == "" {
		listing.Currency = "XOF"
	}

	if err := s.db.Create(&listing).Error; err != nil {
		return nil, fmt.Errorf("erreur création annonce: %w", err)
	}

	// Charger les relations
	if err := s.db.Preload("User").Preload("Category").First(&listing, listing.ID).Error; err != nil {
		return nil, fmt.Errorf("erreur chargement annonce: %w", err)
	}

	return &listing, nil
}

// GetListings récupère les annonces avec filtres et pagination
func (s *ListingService) GetListings(query *ListingQuery) (*ListingResponse, error) {
	// Valeurs par défaut
	if query.Page <= 0 {
		query.Page = 1
	}
	if query.Limit <= 0 || query.Limit > 50 {
		query.Limit = 20
	}
	if query.Sort == "" {
		query.Sort = "date"
	}

	// Construction de la requête
	db := s.db.Model(&models.Listing{}).
		Preload("User", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "first_name", "last_name", "phone", "region", "is_verified")
		}).
		Preload("Category")

	// Filtres
	db = s.applyFilters(db, query)

	// Comptage total
	var total int64
	if err := db.Count(&total).Error; err != nil {
		return nil, fmt.Errorf("erreur comptage: %w", err)
	}

	// Tri
	db = s.applySorting(db, query.Sort)

	// Pagination
	offset := (query.Page - 1) * query.Limit
	db = db.Offset(offset).Limit(query.Limit)

	// Récupération
	var listings []models.Listing
	if err := db.Find(&listings).Error; err != nil {
		return nil, fmt.Errorf("erreur récupération annonces: %w", err)
	}

	// Calcul du nombre de pages
	pages := int((total + int64(query.Limit) - 1) / int64(query.Limit))

	return &ListingResponse{
		Listings: listings,
		Total:    total,
		Page:     query.Page,
		Limit:    query.Limit,
		Pages:    pages,
	}, nil
}

// GetListingByID récupère une annonce par ID
func (s *ListingService) GetListingByID(id string) (*models.Listing, error) {
	var listing models.Listing
	if err := s.db.Preload("User").Preload("Category").
		Where("id = ?", id).First(&listing).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrListingNotFound
		}
		return nil, fmt.Errorf("erreur récupération annonce: %w", err)
	}

	// Incrémenter le compteur de vues
	go func() {
		s.db.Model(&listing).Update("views_count", gorm.Expr("views_count + 1"))
	}()

	return &listing, nil
}

// UpdateListing met à jour une annonce
func (s *ListingService) UpdateListing(id, userID string, req *UpdateListingRequest) (*models.Listing, error) {
	var listing models.Listing
	if err := s.db.Where("id = ?", id).First(&listing).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrListingNotFound
		}
		return nil, fmt.Errorf("erreur récupération annonce: %w", err)
	}

	// Vérifier que l'utilisateur est propriétaire
	if listing.UserID.String() != userID {
		return nil, ErrUnauthorized
	}

	// Mise à jour des champs
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
		if !s.isValidRegion(*req.Region) {
			return nil, ErrInvalidRegion
		}
		updates["region"] = *req.Region
	}
	if req.Images != nil {
		updates["images"] = pq.StringArray(req.Images)
	}
	if req.Status != nil {
		updates["status"] = *req.Status
	}

	if len(updates) > 0 {
		updates["updated_at"] = time.Now()
		if err := s.db.Model(&listing).Updates(updates).Error; err != nil {
			return nil, fmt.Errorf("erreur mise à jour: %w", err)
		}
	}

	// Recharger avec relations
	if err := s.db.Preload("User").Preload("Category").First(&listing, listing.ID).Error; err != nil {
		return nil, fmt.Errorf("erreur rechargement: %w", err)
	}

	return &listing, nil
}

// DeleteListing supprime une annonce (soft delete)
func (s *ListingService) DeleteListing(id, userID string) error {
	var listing models.Listing
	if err := s.db.Where("id = ?", id).First(&listing).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrListingNotFound
		}
		return fmt.Errorf("erreur récupération annonce: %w", err)
	}

	// Vérifier que l'utilisateur est propriétaire
	if listing.UserID.String() != userID {
		return ErrUnauthorized
	}

	// Soft delete
	if err := s.db.Delete(&listing).Error; err != nil {
		return fmt.Errorf("erreur suppression: %w", err)
	}

	return nil
}

// PublishListing publie une annonce (change status vers "active")
func (s *ListingService) PublishListing(id, userID string) (*models.Listing, error) {
	return s.UpdateListing(id, userID, &UpdateListingRequest{
		Status: stringPtr("active"),
	})
}

// SearchListings recherche avec full-text
func (s *ListingService) SearchListings(searchTerm string, query *ListingQuery) (*ListingResponse, error) {
	query.Search = searchTerm
	return s.GetListings(query)
}

// applyFilters applique les filtres à la requête
func (s *ListingService) applyFilters(db *gorm.DB, query *ListingQuery) *gorm.DB {
// Statut par défaut : annonces actives
if query.Status == "" || query.Status == "active" {
    db = db.Where("status = ?", "active")
} else if query.Status != "all" {
    db = db.Where("status = ?", query.Status)
}
// Si status == "all", pas de filtre statut
	// Exclure les supprimées
	db = db.Where("deleted_at IS NULL")

	// Filtres spécifiques
	if query.CategoryID != "" {
		db = db.Where("category_id = ?", query.CategoryID)
	}

	if query.Region != "" {
		// db = db.Where("region = ?", query.Region)
		  db = db.Where("region LIKE ?", query.Region+"%")
	}

	if query.UserID != "" {
		db = db.Where("user_id = ?", query.UserID)
	}

	if query.MinPrice > 0 {
		db = db.Where("price >= ?", query.MinPrice)
	}

	if query.MaxPrice > 0 {
		db = db.Where("price <= ?", query.MaxPrice)
	}

	if query.Featured != nil {
		db = db.Where("is_featured = ?", *query.Featured)
	}

	// Recherche full-text
	if query.Search != "" {
		searchTerm := strings.TrimSpace(query.Search)
		if searchTerm != "" {
			// Recherche PostgreSQL full-text
			db = db.Where("to_tsvector('french', title || ' ' || description) @@ plainto_tsquery('french', ?)", searchTerm)
		}
	}

	return db
}

// applySorting applique le tri
func (s *ListingService) applySorting(db *gorm.DB, sort string) *gorm.DB {
	switch sort {
	case "price_asc":
		return db.Order("price ASC, created_at DESC")
	case "price_desc":
		return db.Order("price DESC, created_at DESC")
	case "views":
		return db.Order("views_count DESC, created_at DESC")
	case "featured":
		return db.Order("is_featured DESC, created_at DESC")
	default: // "date"
		return db.Order("created_at DESC")
	}
}

// isValidRegion vérifie si une région est valide
func (s *ListingService) isValidRegion(region string) bool {
	validRegions := []string{
		"Dakar - Plateau", "Dakar - Almadies", "Dakar - Parcelles Assainies",
		"Dakar - Ouakam", "Dakar - Point E", "Dakar - Pikine", "Dakar - Guédiawaye",
		"Thiès", "Saint-Louis", "Kaolack", "Ziguinchor", "Diourbel",
		"Louga", "Fatick", "Kolda", "Tambacounda",
	}

	for _, validRegion := range validRegions {
		if region == validRegion {
			return true
		}
	}
	return false
}

// Helper function
func stringPtr(s string) *string {
	return &s
}