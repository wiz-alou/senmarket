// internal/presentation/http/validators/listing_validator.go
package validators

import (
	"strings"
)

// CreateListingRequest requête de création d'annonce
type CreateListingRequest struct {
	CategoryID  string   `json:"category_id" validate:"required"`
	Title       string   `json:"title" validate:"required,min=3,max=100"`
	Description string   `json:"description" validate:"required,min=10,max=1000"`
	Price       float64  `json:"price" validate:"min=0"`
	Currency    string   `json:"currency" validate:"omitempty,oneof=XOF EUR USD"`
	Region      string   `json:"region" validate:"required,senegal_region"`
	Location    string   `json:"location" validate:"omitempty,max=255"`
	Images      []string `json:"images" validate:"omitempty,max=10"`
	IsPaid      bool     `json:"is_paid"`
}

// UpdateListingRequest requête de mise à jour d'annonce
type UpdateListingRequest struct {
	Title       string   `json:"title,omitempty" validate:"omitempty,min=3,max=100"`
	Description string   `json:"description,omitempty" validate:"omitempty,min=10,max=1000"`
	Price       *float64 `json:"price,omitempty" validate:"omitempty,min=0"`
	Currency    string   `json:"currency,omitempty" validate:"omitempty,oneof=XOF EUR USD"`
	Location    string   `json:"location,omitempty" validate:"omitempty,max=255"`
	Images      []string `json:"images,omitempty" validate:"omitempty,max=10"`
}

// SearchListingRequest requête de recherche d'annonces
type SearchListingRequest struct {
	Query      string   `json:"query" validate:"required,min=2"`
	CategoryID string   `json:"category_id,omitempty"`
	Region     string   `json:"region,omitempty" validate:"omitempty,senegal_region"`
	PriceMin   *float64 `json:"price_min,omitempty" validate:"omitempty,min=0"`
	PriceMax   *float64 `json:"price_max,omitempty" validate:"omitempty,min=0"`
	Page       int      `json:"page" validate:"min=1"`
	Limit      int      `json:"limit" validate:"min=1,max=100"`
}

// ListingFiltersRequest requête de filtres d'annonces
type ListingFiltersRequest struct {
	CategoryID string   `json:"category_id,omitempty"`
	Region     string   `json:"region,omitempty" validate:"omitempty,senegal_region"`
	PriceMin   *float64 `json:"price_min,omitempty" validate:"omitempty,min=0"`
	PriceMax   *float64 `json:"price_max,omitempty" validate:"omitempty,min=0"`
	Status     string   `json:"status,omitempty" validate:"omitempty,oneof=draft active expired sold suspended"`
	IsPromoted *bool    `json:"is_promoted,omitempty"`
	Page       int      `json:"page" validate:"min=1"`
	Limit      int      `json:"limit" validate:"min=1,max=100"`
}

// ValidateCreateListing valide une requête de création d'annonce
func ValidateCreateListing(req *CreateListingRequest) []ValidationError {
	errors := ValidateStruct(req)
	
	// Validation des images
	for i, imageURL := range req.Images {
		if !isValidImageURL(imageURL) {
			errors = append(errors, ValidationError{
				Field:   "images[" + string(rune(i)) + "]",
				Message: "URL d'image invalide",
				Value:   imageURL,
			})
		}
	}
	
	return errors
}

// ValidateUpdateListing valide une requête de mise à jour d'annonce
func ValidateUpdateListing(req *UpdateListingRequest) []ValidationError {
	return ValidateStruct(req)
}

// ValidateSearchListing valide une requête de recherche d'annonces
func ValidateSearchListing(req *SearchListingRequest) []ValidationError {
	return ValidateStruct(req)
}

// ValidateListingFilters valide une requête de filtres d'annonces
func ValidateListingFilters(req *ListingFiltersRequest) []ValidationError {
	errors := ValidateStruct(req)
	
	// Validation personnalisée: price_max >= price_min
	if req.PriceMin != nil && req.PriceMax != nil && *req.PriceMax < *req.PriceMin {
		errors = append(errors, ValidationError{
			Field:   "price_max",
			Message: "Le prix maximum doit être supérieur au prix minimum",
		})
	}
	
	return errors
}

// isValidImageURL vérifie si l'URL de l'image est valide
func isValidImageURL(url string) bool {
	// Validation basique d'URL d'image
	if url == "" {
		return false
	}
	
	// Vérifier les extensions d'image supportées
	validExtensions := []string{".jpg", ".jpeg", ".png", ".gif", ".webp"}
	for _, ext := range validExtensions {
		if strings.HasSuffix(strings.ToLower(url), ext) {
			return true
		}
	}
	
	return false
}
